import React from 'react';
// Zde si zkontroluj a uprav cesty k tvým hookům, akcím a komponentám
import { useAsync } from "../../../../dynamic/src/Hooks"; 
import { InsertAsyncAction } from '../Queries/InsertAsyncAction';
import { CreateTopicAsyncAction } from '../Queries/CreateTopic';
import { AddLessonAsyncAction } from '../Queries/AddLesson';
import {CreateDialog} from '../Mutations/Create';
import {MediumEditableContent} from '../Components/MediumEditableContent';
import { InsertLessonTemplateAsyncAction } from '../Queries/LessonsTemplate';
import { useNavigate } from 'react-router-dom';
// Zkontroluj si správnou relativní cestu k tvému Link.jsx!
import { ReadURI } from '../Components/Link';


export const CustomCreateDialog = (props) => {
    const { run: insertPlan, loading: loadingPlan } = useAsync(InsertAsyncAction, null, { deferred: true });
    const { run: createTopic, loading: loadingTopic } = useAsync(CreateTopicAsyncAction, null, { deferred: true });
    const { run: addStudyPlanLesson, loading: loadingLesson } = useAsync(AddLessonAsyncAction, null, { deferred: true });
    // PŘIDÁNO:
    const { run: insertLessonTemplate } = useAsync(InsertLessonTemplateAsyncAction, null, { deferred: true });

    const isLoading = loadingPlan || loadingTopic || loadingLesson;

    const navigate = useNavigate();

    const handleOk = async (item) => {
        try {
            const studyPlanVariables = {
                semesterId: item.semesterId,
                eventId: item.eventId,
                examId: null
            };

            // KROK 1: Vytvoříme Plán a získáme planId
            const planResult = await insertPlan(studyPlanVariables);
            const newPlanId = planResult?.data?.studyPlanInsert?.id || planResult?.id;

            const plannedTopics = item.plannedTopics || [];
            
            for (let i = 0; i < plannedTopics.length; i++) {
                const topic = plannedTopics[i];

                // KROK 2: Vytvoříme ČISTÉ Téma (BEZ vnořených lekcí!)
                const topicResult = await createTopic({
                    semesterId: studyPlanVariables.semesterId,
                    name: topic.name,
                    order: i + 1
                    // Zde UŽ NEPOSÍLÁME parametr lessons!
                });
                
                const newTopicId = topicResult?.data?.topicInsert?.id || topicResult?.id;

                if (newTopicId && topic.lessons && topic.lessons.length > 0) {
                    for (const lesson of topic.lessons) {
                        if (!lesson.lessontypeId) continue;

                        // KROK 2b: Vložíme šablonu osnovy (LessonGQLModel) k tomuto tématu
                        await insertLessonTemplate({
                            topicId: newTopicId,
                            typeId: lesson.lessontypeId, // Bacha: V LessonGQLModel se ten cizí klíč jmenuje typeId (ne lessontypeId)
                            count: parseInt(lesson.count, 10) || 1
                        });

                        // KROK 3: Vytvoříme živé lekce v plánu (StudyPlanLesson)
                        await addStudyPlanLesson({
                            planId: newPlanId,           
                            topicId: newTopicId,
                            eventId: studyPlanVariables.eventId,
                            lessontypeId: lesson.lessontypeId, 
                            name: `Výuka k tématu: ${topic.name}`, 
                            length: parseInt(lesson.count, 10) || 1 
                        });
                    }
                }
            }
            
            if (props.onHide) props.onHide();
            if (props.onOk) props.onOk(planResult);

            navigate(`${ReadURI}${newPlanId}`);

        } catch (error) {
            console.error("Chyba při ukládání:", error);
            alert("Při ukládání došlo k chybě. Otevřete konzoli (F12) pro detaily.");
        }
    };

    return (
        <CreateDialog 
            {...props}
            title="Nový studijní plán" 
            DefaultContent={MediumEditableContent} 
            onOk={handleOk}
            // PŘIDÁNO: Explicitní mapování zavíracích akcí
            onCancel={props.onHide} 
            onHide={props.onHide}
            // ------------------------------------------
            okButtonProps={{ disabled: isLoading }}
        />
    );
};

export default CustomCreateDialog;