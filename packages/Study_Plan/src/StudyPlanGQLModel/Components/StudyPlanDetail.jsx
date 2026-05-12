import { formatDateTime } from "../../../../_template/src"
import { Link } from "./Link"
import { ProxyLink } from "../../../../_template/src/Base/Components/ProxyLink"
import { CreateURI } from "./Link"
import { SelectionContext } from "./SelectionContext";
import { useContext, useState } from 'react';
// Zde si pak vrátíme správný import klienta, jakmile se k tomu vrátíme
import { AddInstructorAsyncAction } from "../Queries/AddInstructor";
import { AddLessonAsyncAction } from "../Queries/AddLesson";
import { useDispatch } from "react-redux";
import { InstantActionButton } from "../Mutations/Create";

const InfoRow = ({ label, children }) => (
    <div className="row mb-2 align-items-start">
        <div className="col-4 fw-semibold text-dark">{label}</div>
        <div className="col-8">{children}</div>
    </div>
)

const TopicRow = ({ topic, lessons, planId }) => {
    const { selectedTeacher, selectedRoom, selectedGroup } = useContext(SelectionContext);
    const [lessonName, setLessonName] = useState("");
    const [isExercise, setIsExercise] = useState(false);

    // Spočítáme počty typů výuky pro pravou stranu hlavičky
    const lessonsByType = (lessons || []).reduce((acc, l) => {
        const typeName = l.lessontype?.name || l.lessontype?.nameEn || null;
        if (!typeName) return acc;
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
    }, {});
    const typeEntries = Object.entries(lessonsByType);

    let urlParams = `?topicId=${topic.id}&planId=${planId || ""}`;
    if (selectedTeacher) urlParams += `&teacherId=${selectedTeacher.id}`;
    if (selectedRoom) urlParams += `&roomId=${selectedRoom.id}`;
    if (selectedGroup) urlParams += `&groupId=${selectedGroup.id}`;

    const payload = {
        planitemId: planId,
        userId: selectedTeacher?.id
    };

    const insertPayload = {
            planId: planId,
            topicId: topic.id,
            name: lessonName || "Nová výuka",
            // POZOR: Zde musíte předat reálná UUID pro typ lekce (Cvičení / Přednáška)
            lessontypeId: isExercise ? "e2b7c66a-95e1-11ed-a1eb-0242ac120002" : "e2b7cbf6-95e1-11ed-a1eb-0242ac120002", 
        };

    return (
        <div className="border-bottom border-danger border-opacity-25">
            
            {/* ── 1. HLAVNÍ ŘÁDEK TÉMATU ── */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3 gap-3">
                
                {/* Levá část: Odkaz na téma a souhrn */}
                <div className="d-flex align-items-center flex-wrap gap-2 flex-grow-1">
                    <ProxyLink
                        to={`/granting/TopicGQLModel/view/${topic.id}`}
                        className="fw-bold text-decoration-none text-dark text-nowrap"
                    >
                        {topic.name || topic.nameEn || `Téma ${topic.order ?? ""}`}
                    </ProxyLink>
                    
                    {/* Bubliny se souhrnem typu výuky (např. 2 x přednáška) */}
                    <div className="d-flex gap-2 ms-2">
                        {typeEntries.map(([type, count]) => (
                            <span key={type} className="badge bg-white text-secondary border border-secondary border-opacity-25 fw-normal">
                                {count}x {type}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Střední část: Inputy pro rychlé přidání */}
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Zadejte název výuky..."
                        value={lessonName}
                        onChange={(e) => setLessonName(e.target.value)}
                        style={{ minWidth: "180px" }}
                    />
                    
                    <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                        <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            role="switch"
                            id={`switch-exercise-${topic.id}`}
                            checked={isExercise}
                            onChange={(e) => setIsExercise(e.target.checked)}
                        />
                        <label className="form-check-label small text-nowrap" htmlFor={`switch-exercise-${topic.id}`}>
                            Cvičení
                        </label>
                    </div>
                </div>

                {/* Pravá část: Tlačítko */}
                <div className="text-end" style={{ minWidth: "140px" }}>
                    <InstantActionButton
                        mutationAsyncAction={AddLessonAsyncAction}
                        item={insertPayload} // Zde vložíte vaše připravená data
                        className="btn btn-outline-secondary btn-sm w-100"
                        // Parametr readItemURI můžete nastavit na null, pokud nechcete po uložení přesměrovat
                        readItemURI={null} 
                    >
                        Ulozit
                    </InstantActionButton>
                </div>
            </div>

            {/* ── 2. SEZNAM LEKCÍ (PODTITULY) ── */}
            {lessons && lessons.length > 0 && (
                <div className="px-5 pb-3">
                    <div className="d-flex flex-column gap-1">
                        {lessons.map((lesson) => (
                            <div key={lesson.id} className="d-flex align-items-center gap-2 py-1 px-3 rounded" style={{ backgroundColor: "rgba(255,255,255,0.4)" }}>
                                <span className="fw-medium text-dark">{lesson.name || "Bez názvu"}</span>
                                
                                {/* Typ výuky jako štítek */}
                                {lesson.lessontype?.name && (
                                    <span className="badge bg-light text-secondary border ms-2">
                                        {lesson.lessontype.name}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export const StudyPlanDetail = ({ item, children }) => {
    const semester = item?.semester
    const subjectName = semester?.subject?.name || semester?.subject?.nameEn || null
    const semesterOrder = semester?.order ?? null
    const examName = item?.exam?.name || null

    const topics = semester?.topics || []
    const lessons = item?.lessons || []
    
    // Rozřazení lekcí k tématům
    const lessonsByTopic = lessons.reduce((acc, l) => {
        const tid = l.topicId;
        if (!acc[tid]) acc[tid] = [];
        acc[tid].push(l);
        return acc;
    }, {});
    
    // ZMĚNA: Odstranil jsem `.filter(...)`, aby se zobrazila i témata, 
    // která zatím žádnou výuku nemají. Jinak byste k nim nemohl nic přidat.
    const sortedTopics = [...topics]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return (
        <div className="min-vh-100">

            {/* ── top section: info panel (left) + entity lookups (right) ── */}
            <div className="bg-white py-2">
                <div className="row g-0 align-items-start">
                    <div className="col-12 col-md-4 col-lg-3 p-3 mx-3 my-2 bg-white rounded border border-success border-opacity-50">
                        {/* ... Info panel kódu (beze změny) ... */}
                        <div className="d-flex align-items-start gap-1 mb-3">
                            <span className="fs-6 lh-sm">👤</span>
                            <Link item={item}>
                                <span className="text-break small">
                                    {item?.id?.toUpperCase()}
                                </span>
                            </Link>
                        </div>

                        <InfoRow label="Semestr">
                            <Link item={semester}>
                                {subjectName && semesterOrder
                                    ? <>{subjectName} / {semesterOrder}</>
                                    : <span className="text-muted fst-italic">Missing</span>
                                }
                            </Link>
                        </InfoRow>

                        <InfoRow label="Období">
                            <Link item={semester}>
                                <span className="text-muted fst-italic">Missing</span>
                            </Link>
                        </InfoRow>

                        <div className="row mb-2">
                            <div className="col-4"></div>
                            <div className="col-8 text-muted">- -</div>
                        </div>

                        <InfoRow label="Zkouška">
                            {examName
                                ? <Link item={item?.exam}>{examName}</Link>
                                : <Link item={item?.exam}>
                                    <span className="text-muted fst-italic">Missing</span>
                                </Link>
                            }
                        </InfoRow>

                        <div className="mt-3 p-2 rounded border border-success border-opacity-25 bg-success bg-opacity-10">
                            <InfoRow label="Vytvořeno">
                                <span className="small">
                                    <Link item={item?.createdby}>
                                        {item?.createdby?.fullname || "—"}
                                    </Link>
                                    {item?.created && <> @ {formatDateTime(item.created)}</>}
                                </span>
                            </InfoRow>

                            <InfoRow label="Změněno">
                                <span className="small">
                                    <Link item={item?.changedby}>
                                        {item?.changedby?.fullname || "—"}
                                    </Link>
                                    {item?.lastchange && <> @ {formatDateTime(item.lastchange)}</>}
                                </span>
                            </InfoRow>
                        </div>
                    </div>

                    <div className="col-12 col-md px-4 py-2 bg-white border-start border-success border-opacity-50">
                        {children}
                    </div>
                </div>
            </div>

            {/* ── bottom section: topics full width ── */}
            <div className="pt-1 bg-danger bg-opacity-25">
                {sortedTopics.length === 0 ? (
                    <div className="p-4 text-secondary fst-italic">
                        Žádná témata nebyla nalezena.
                    </div>
                ) : (
                    sortedTopics.map((topic) => (
                        <TopicRow
                            key={topic.id}
                            topic={topic}
                            lessons={lessonsByTopic[topic.id] || []}
                            planId={item?.id}
                        />
                    ))
                )}
            </div>
        </div>
    )
}