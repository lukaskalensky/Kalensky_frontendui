import { formatDateTime } from "../../../../_template/src"
import { Link } from "./Link"
import { ProxyLink } from "../../../../_template/src/Base/Components/ProxyLink"
import { CreateURI } from "./Link"
import { SelectionContext } from "./SelectionContext";
import { useContext, useState, useEffect } from 'react';
// Zde si pak vrátíme správný import klienta, jakmile se k tomu vrátíme
import { AddInstructorAsyncAction } from "../Queries/AddInstructor";
import { AddRoomAsyncAction } from "../Queries/AddRoom";
import { AddGroupAsyncAction } from "../Queries/AddGroup";
import { AddLessonAsyncAction } from "../Queries/AddLesson";
import { ReadLessonAsyncAction } from "../Queries/LessonType";
import { useDispatch } from "react-redux";
import { InstantActionButton } from "../Mutations/Create";
import { useAsync, useAsyncThunkAction } from "../../../../dynamic/src/Hooks";
import { AsyncStateIndicator } from "../../../../_template/src/Base";
import { FetchMojeDataAction } from "../Pages/muj_pokus_page";


const InfoRow = ({ label, children }) => (
    <div className="row mb-2 align-items-start">
        <div className="col-4 fw-semibold text-dark">{label}</div>
        <div className="col-8">{children}</div>
    </div>
)

const TopicRow = ({ topic, lessons, planId }) => {
    const { selectedTeacher, selectedRoom, selectedGroup } = useContext(SelectionContext);
    const [lessonName, setLessonName] = useState("");

    const [lessonTypes, setLessonTypes] = useState([]);
    const [selectedLessonTypeId, setSelectedLessonTypeId] = useState("");
    
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
        
    const { run, loading, error } = useAsync(AddLessonAsyncAction, null, { deferred: true });
    const { run: reloadPlan } = useAsyncThunkAction(FetchMojeDataAction, null, { deferred: true });

    const { run: fetchLessonTypes } = useAsync(ReadLessonAsyncAction, null, { deferred: true });

    const { run: assignInstructor, loading: loadingInstructor } = useAsync(AddInstructorAsyncAction, null, { deferred: true });
    const { run: assignFacility, loading: loadingFacility } = useAsync(AddRoomAsyncAction, null, { deferred: true });
    const { run: assignGroup, loading: loadingGroup } = useAsync(AddGroupAsyncAction, null, { deferred: true });
    
    useEffect(() => {
        // Pomocí limit: 1000 obejdeme případné stránkování a stáhneme všechny typy
        fetchLessonTypes({ limit: 1000 })
            .then((response) => {
                // Získáme pole typů (cesta se může mírně lišit podle vaší GQL odpovědi)
                const fetchedTypes = response?.data?.lessonTypePage || response?.lessonTypePage || [];
                setLessonTypes(fetchedTypes);
                
                // Pokud server nějaké typy vrátil, automaticky předvybereme ten první
                if (fetchedTypes.length > 0) {
                    setSelectedLessonTypeId(fetchedTypes[0].id);
                }
            })
            .catch((e) => console.error("Chyba při načítání typů výuky:", e));
    }, []);

    const fvyucujici = async (lesson) => {
        const insertPayload = {
           planitemId: lesson.id, 
           userId: selectedTeacher.id,
        };

        try {
            // Spuštění mutace přes funkci run
            const response = await assignInstructor(insertPayload);
            console.log("Ucitel úspěšně přidána:", response);
            
            //setLessonName(""); // Vyčištění pole po úspěchu
            alert("Lekce byla přidána.");
            await reloadPlan({ id: planId, limit: 1000 });
        } catch (err) {
            console.error("Chyba při ukládání vyucujiciho:", err);
        }
    };
    const fmistnost = async (lesson) => {
        const insertPayload = {
            planitemId: lesson.id, 
            facilityId: selectedRoom.id,
        };

        try {
            // Spuštění mutace přes funkci run
            const response = await assignFacility(insertPayload);
            console.log("Mistnost úspěšně přidána:", response);
            
            //setLessonName(""); // Vyčištění pole po úspěchu
            alert("Mistnost byla přidána.");
            await reloadPlan({ id: planId, limit: 1000 });
        } catch (err) {
            console.error("Chyba při ukládání Mistnosti:", err);
        }
    };
    const fskupina = async (lesson) => {
        const insertPayload = {
            planitemId: lesson.id,
            groupId: selectedGroup.id,
        };

        try {
            // Spuštění mutace přes funkci run
            const response = await assignGroup(insertPayload);
            console.log("Skupina úspěšně přidána:", response);
            
            //setLessonName(""); // Vyčištění pole po úspěchu
            alert("Skupina byla přidána.");
            await reloadPlan({ id: planId, limit: 1000 });
        } catch (err) {
            console.error("Chyba při ukládání Skupina:", err);
        }
    };

    const handleSave = async () => {
        // Příprava dat pro mutaci podle parametrů v AddLesson.jsx
       if (!selectedLessonTypeId) {
            alert("Počkejte na načtení typů výuky nebo nějaký vyberte.");
            return;
        }
       
        const insertPayload = {
            planId: planId,
            topicId: topic.id,
            name: lessonName || "Nová výuka",
            lessontypeId: selectedLessonTypeId, // ID pro přednášku
        };

        try {
            // Spuštění mutace přes funkci run
            const response = await run(insertPayload);
            console.log("Lekce úspěšně přidána:", response);
            
            setLessonName(""); // Vyčištění pole po úspěchu
            alert("Lekce byla přidána.");
            await reloadPlan({ id: planId, limit: 1000 });
        } catch (err) {
            console.error("Chyba při ukládání lekce:", err);
        }
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
                        <select 
                    className="form-select form-select-sm" 
                    value={selectedLessonTypeId}
                    onChange={(e) => setSelectedLessonTypeId(e.target.value)}
                    style={{ maxWidth: "150px" }}
                >
                    {/* Zobrazení fallbacku, dokud data nedorazí */}
                    {lessonTypes.length === 0 && <option value="">Načítám...</option>}
                    
                    {/* Vykreslení stažených položek */}
                    {lessonTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name || type.nameEn || type.id}
                        </option>
                    ))}
                </select>
                    </div>
                </div>

                {/* Pravá část: Tlačítko */}
                <div className="text-end" style={{ minWidth: "140px" }}>
                    <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? "Ukládám..." : "Uložit lekci"}
                </button>
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
                                <div className="d-flex align-items-center gap-3 ms-3 small text-secondary">
                
                {/* Učitelé */}
                {lesson.instructors && lesson.instructors.length > 0 && (
        <span title="Vyučující">
            👤 {lesson.instructors.map(inst => inst.surname || inst.fullname || inst.name || "Neznámý").join(', ')}
        </span>
    )}

    {/* Místnosti */}
    {lesson.facilities && lesson.facilities.length > 0 && (
        <span title="Místnosti">
            🏫 {lesson.facilities.map(fac => fac.label || fac.name || "Neznámá").join(', ')}
        </span>
    )}

    {/* Skupiny (Opraveno na studyGroups) */}
    {lesson.studyGroups && lesson.studyGroups.length > 0 && (
        <span title="Skupiny">
            👥 {lesson.studyGroups.map(grp => grp.abbreviation || grp.name || "Neznámá").join(', ')}
        </span>
    )}

            </div>
                                <div className="ms-auto d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        disabled={!selectedTeacher || loadingInstructor}
                                        onClick={() => fvyucujici(lesson)}>
                                        {loadingInstructor ? "..." : `👤 ${selectedTeacher?.surname || "Učitel"}`}
                                    </button>

                                    <button
                                        className="btn btn-sm btn-outline-success"
                                        disabled={!selectedRoom || loadingFacility}
                                        onClick={() => fmistnost(lesson)}>
                                        {loadingFacility ? "..." : `🏫 ${selectedRoom?.label || "Místnost"}`}
                                    </button>

                                    <button
                                        className="btn btn-sm btn-outline-warning text-dark"
                                        disabled={!selectedGroup || loadingGroup}
                                        onClick={() => fskupina(lesson)}>
                                        {loadingGroup ? "..." : `👥 ${selectedGroup?.abbreviation || "Skupina"}`}
                                    </button>
                                </div>
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