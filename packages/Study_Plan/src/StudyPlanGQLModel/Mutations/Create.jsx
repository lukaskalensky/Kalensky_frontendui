import { CreateURI, MediumEditableContent, ReadItemURI } from "../Components"
import { InsertAsyncAction } from "../Queries/InsertAsyncAction"
import { CreateTopicAsyncAction } from "../Queries/CreateTopic"; 
import { AddLessonAsyncAction } from "../Queries/AddLesson"; 

import { 
    CreateBody as BaseCreateBody, 
    CreateButton as BaseCreateButton, 
    CreateDialog as BaseCreateDialog, 
    CreateLink  as BaseCreateLink
} from "../../../../_template/src/Base/Mutations/Create"
import { useAsync } from "../../../../dynamic/src/Hooks";

const permissions = {
    oneOfRoles: ["studijní administrátor"],
    mode: "absolute",
}

const CustomCreateDialog = (props) => {
    const { run: insertPlan, loading: loadingPlan } = useAsync(InsertAsyncAction, null, { deferred: true });
    const { run: createTopic, loading: loadingTopic } = useAsync(CreateTopicAsyncAction, null, { deferred: true });
    const { run: addStudyPlanLesson, loading: loadingLesson } = useAsync(AddLessonAsyncAction, null, { deferred: true });

    const isLoading = loadingPlan || loadingTopic || loadingLesson;

    const handleOk = async (item) => {
        try {
            const studyPlanVariables = {
                semesterId: item.semesterId,
                eventId: item.eventId,
                examId: null
            };

            if (!studyPlanVariables.semesterId || !studyPlanVariables.eventId) {
                alert("Chybí povinná data (Semestr nebo Událost).");
                return;
            }

            // KROK 1: Vytvoříme Plán a získáme planId (Tohle celou dobu fungovalo!)
            const planResult = await insertPlan(studyPlanVariables);
            const newPlanId = planResult?.data?.studyPlanInsert?.id || planResult?.id;
            
            if (!newPlanId) {
                throw new Error("Nepodařilo se založit plán.");
            }

            const plannedTopics = item.plannedTopics || [];
            
            for (let i = 0; i < plannedTopics.length; i++) {
                const topic = plannedTopics[i];

                // KROK 2: Vytvoříme Téma
                const topicResult = await createTopic({
                    semesterId: studyPlanVariables.semesterId,
                    name: topic.name,
                    order: i + 1
                });
                
                const newTopicId = topicResult?.data?.topicInsert?.id || topicResult?.id;

                // KROK 3: Vytvoříme propojovací StudyPlanLesson
                if (newTopicId && topic.lessons && topic.lessons.length > 0) {
                    for (const lesson of topic.lessons) {
                        if (!lesson.lessontypeId) continue;

                        await addStudyPlanLesson({
                            planId: newPlanId,           
                            topicId: newTopicId,
                            eventId: studyPlanVariables.eventId, // <-- Přidáno pro jistotu!
                            lessontypeId: lesson.lessontypeId, 
                            name: `Výuka k tématu: ${topic.name}`, 
                            length: parseInt(lesson.count, 10) || 1 
                        });
                    }
                }
            }
            
            if (props.onHide) props.onHide();
            if (props.onOk) props.onOk(planResult);

        } catch (error) {
            console.error("Chyba při ukládání:", error);
            alert("Při ukládání došlo k chybě. Otevřete konzoli (F12) pro detaily.");
        }
    };

    return (
        <BaseCreateDialog 
            {...props}
            title="Nový studijní plán" 
            DefaultContent={MediumEditableContent} 
            onOk={handleOk}
            okButtonProps={{ disabled: isLoading }}
        />
    );
};

// ── EXPORT TLAČÍTKA ──
export const CreateButton = (props) => (
    <BaseCreateButton 
        {...props}
        DefaultContent={MediumEditableContent} 
        CreateDialog={CustomCreateDialog} 
        
        
        {...permissions}
    />
);

export const CreateDialog = (props) => <BaseCreateDialog {...props} />;
export const CreateBody = (props) => <BaseCreateBody {...props} DefaultContent={MediumEditableContent} />;
export const CreateLink = ({ uriPattern=CreateURI, ...props }) => (
    <BaseCreateLink {...props} uriPattern={uriPattern} {...permissions} />
);