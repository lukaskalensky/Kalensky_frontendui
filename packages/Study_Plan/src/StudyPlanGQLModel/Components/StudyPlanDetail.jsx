import { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "../../../../_template/src"
import { Link, CreateURI } from "./Link"
import { ProxyLink } from "../../../../_template/src/Base/Components/ProxyLink"
import { SelectionContext } from "./SelectionContext";
import { useAsync, useAsyncThunkAction } from "../../../../dynamic/src/Hooks";
import { AsyncStateIndicator } from "../../../../_template/src/Base";
// Importy akcí
import { CreateButton } from '../Mutations/Create';
import { DeleteButton } from '../Mutations/Delete';
import { AddInstructorAsyncAction } from "../Queries/AddInstructor";
import { AddRoomAsyncAction } from "../Queries/AddRoom";
import { AddGroupAsyncAction } from "../Queries/AddGroup";
import { AddLessonAsyncAction } from "../Queries/AddLesson";
import { ReadLessonAsyncAction } from "../Queries/LessonType";
import { DeleteLessonAsyncAction } from "../Queries/DeleteLesson";
import { DeleteGroupAsyncAction } from "../Queries/DeleteGroup";
import { DeleteTeacherAsyncAction } from "../Queries/DeleteTeacher";
import { DeleteRoomAsyncAction } from "../Queries/DeleteRoom";
import { FetchMojeDataAction } from "../Pages/muj_pokus_page";

import { 
    addInstructorLocal, removeInstructorLocal,
    addFacilityLocal, removeFacilityLocal,
    addGroupLocal, removeGroupLocal,
    deleteLessonLocal, setStudyPlan, addLessonLocal
} from "../Queries/StudyPlanSlice"; 
import CustomCreateDialog from './CreateStudyPlan';


// ── 1. POMOCNÁ KOMPONENTA PRO ŘÁDEK V INFO PANELU ──
const InfoRow = ({ label, children }) => (
    <div className="row mb-2 align-items-start">
        <div className="col-4 fw-semibold text-dark">{label}</div>
        <div className="col-8">{children}</div>
    </div>
)

// ── 2a. SEZNAM PŘEDVÍDANÝCH VYUČUJÍCÍCH ──
const ExpectedTeachers = ({ lessons }) => {
    const teacherMap = {};
    (lessons || []).forEach(lesson => {
        (lesson.instructors || []).forEach(inst => {
            if (!teacherMap[inst.id]) {
                teacherMap[inst.id] = { ...inst, lessonCount: 0 };
            }
            teacherMap[inst.id].lessonCount += 1;
        });
    });

    const teachers = Object.values(teacherMap);

    return (
        <div className="mt-3 p-2 rounded border border-primary border-opacity-25 bg-primary bg-opacity-10">
            <div className="fw-semibold small mb-2">👥 Přiřazení vyučující ({teachers.length})</div>
            {teachers.length === 0 ? (
                <div className="text-muted fst-italic small">Zatím nepřiřazeni</div>
            ) : (
                <div className="d-flex flex-column gap-1">
                    {teachers.map(teacher => (
                        <div key={teacher.id} className="d-flex justify-content-between align-items-center small">
                            <Link item={teacher}>
                                {teacher.fullname || teacher.surname || "Neznámý"}
                            </Link>
                            <span className="badge bg-primary rounded-pill ms-1">{teacher.lessonCount}x</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── 2. INFO PANEL (LEVÁ ČÁST DETAILU PLÁNU) ──
const InfoPanel = ({ item }) => {
    const semester = item?.semester
    const subjectName = semester?.subject?.name || semester?.subject?.nameEn || null
    const semesterOrder = semester?.order ?? null
    const examName = item?.exam?.name || null

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="col-12 col-md-4 col-lg-3 p-3 mx-3 my-2 bg-white rounded border border-success border-opacity-50">
            <div className="d-flex align-items-start gap-1 mb-3">
                <span className="fs-6 lh-sm">👤</span>
                <Link item={item}>
                    <span className="text-break small">{item?.id?.toUpperCase()}</span>
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
                <Link item={item?.eventId}>
                    {item?.eventId
                        ? <>{item?.eventId}</>
                        : <span className="text-muted fst-italic">Missing</span>
                    }
                </Link>
            </InfoRow>

            <div className="row mb-2">
                <div className="col-4"></div>
                <div className="col-8 text-muted">- -</div>
            </div>

            <InfoRow label="Zkouška">
                {examName
                    ? <Link item={item?.exam}>{examName}</Link>
                    : <Link item={item?.exam}><span className="text-muted fst-italic">Missing</span></Link>
                }
            </InfoRow>

            <div className="mt-3 p-2 rounded border border-success border-opacity-25 bg-success bg-opacity-10">
                <InfoRow label="Vytvořeno">
                    <span className="small">
                        <Link item={item?.createdby}>{item?.createdby?.fullname || "—"}</Link>
                        {item?.created && <> @ {formatDateTime(item.created)}</>}
                    </span>
                </InfoRow>

                <InfoRow label="Změněno">
                    <span className="small">
                        <Link item={item?.changedby}>{item?.changedby?.fullname || "—"}</Link>
                        {item?.lastchange && <> @ {formatDateTime(item.lastchange)}</>}
                    </span>
                </InfoRow>
            </div>

            <ExpectedTeachers lessons={item?.lessons} />

            <div className="mt-3 d-flex flex-column gap-2">
                
                {/* 1. Tlačítko, které otevírá dialog */}
                <button
                    className="btn btn-sm btn-outline-success w-100"
                    onClick={() => setIsDialogOpen(true)}
                >
                    Vytvořit nový plán
                </button>

                <DeleteButton
                    className="btn btn-sm btn-outline-danger w-100"
                    item={item}
                >
                    Smazat plán
                </DeleteButton>

                {/* 2. Samotný dialog (vykreslí se, jen když je isDialogOpen === true) */}
                {isDialogOpen && (
                    <CustomCreateDialog
                        show={isDialogOpen}
                        onHide={() => setIsDialogOpen(false)} // Zavření křížkem
                        onOk={(result) => {
                            console.log("Plán byl úspěšně vygenerován!", result);
                            setIsDialogOpen(false); // Zavření po úspěšném uložení
                            // Zde můžeš případně zavolat i reload dat, pokud potřebuješ:
                            // reloadPlan({ id: item?.id }) apod.
                        }}
                        // Předáváme item stejně, jako ho dostával tvůj starý CreateButton,
                        // aby měl formulář přístup k semesterId a eventId
                        item={{ 
                            semesterId: item?.semesterId, 
                            eventId: item?.eventId 
                        }}
                    />
                )}
            </div>
        </div>
    )
}

// ── 3. HLAVIČKA TÉMATU (NÁZEV + BADGES S POČTY) ──
const TopicHeader = ({ topic, lessons }) => {
    
    // 1. PLÁNOVANÝ STAV (Jmenovatel) 
    // Projdeme šablonu (topic.lessons) a sečteme 'count' pro jednotlivé typy.
    const plannedStats = (topic?.lessons || []).reduce((acc, l) => {
        const typeName = l.type?.name || l.type?.nameEn;
        if (typeName) {
            acc[typeName] = (acc[typeName] || 0) + (l.count || 0);
        }
        return acc;
    }, {});

    // 2. SKUTEČNÝ STAV (Čitatel) 
    // Projdeme reálně vytvořené lekce v tabulce (lessons) a za každou přičteme 1.
    const actualStats = (lessons || []).reduce((acc, l) => {
        const typeName = l.lessontype?.name || l.lessontype?.nameEn;
        if (typeName) {
            acc[typeName] = (acc[typeName] || 0) + 1; 
        }
        return acc;
    }, {});

    // 3. SLOUČENÍ A VYKRESLENÍ
    // Získáme unikátní názvy typů z obou objektů (aby se vypsaly i ty, kde je zatím 0/X)
    const allTypeNames = Array.from(new Set([
        ...Object.keys(plannedStats), 
        ...Object.keys(actualStats)
    ]));

    return (
        <div className="d-flex align-items-center flex-wrap gap-2 flex-grow-1">
            <span className="fw-bold text-dark text-nowrap">
                {topic.name || topic.nameEn || `Téma ${topic.order ?? ""}`}
            </span>
            
            <div className="d-flex gap-2 ms-2">
                {allTypeNames.map(typeName => {
                    // Pokud některá hodnota chybí, je to 0
                    const actual = actualStats[typeName] || 0;
                    const planned = plannedStats[typeName] || 0;
                    
                    return (
                        <span key={typeName} className="badge bg-white text-secondary border border-secondary border-opacity-25 fw-normal">
                            {actual}/{planned} {typeName}
                        </span>
                    );
                })}
            </div>
        </div>
    )
}

// ── 4. FORMULÁŘ PRO PŘIDÁNÍ LEKCE ──
const AddLessonForm = ({ topicId, planId, lessonTypes }) => {

    const dispatch = useDispatch();

    const [lessonName, setLessonName] = useState("");
    const [selectedLessonTypeId, setSelectedLessonTypeId] = useState("");

    const { run: addLesson, loading } = useAsync(AddLessonAsyncAction, null, { deferred: true });

    useEffect(() => {
        if (lessonTypes && lessonTypes.length > 0 && !selectedLessonTypeId) {
            setSelectedLessonTypeId(lessonTypes[0].id);
        }
    }, [lessonTypes, selectedLessonTypeId]);

    const handleSave = async () => {
        if (!selectedLessonTypeId) {
            alert("Počkejte na načtení typů výuky nebo nějaký vyberte.");
            return;
        }
       
        const insertPayload = {
            planId,
            topicId,
            name: lessonName || "Nová výuka",
            lessontypeId: selectedLessonTypeId,
        };

        try {
            // 1. Pošleme na server
            const result = await addLesson(insertPayload);
            
            // 2. Vytvoříme lokální objekt lekce pro Redux (vezmeme ID z odpovědi serveru)
            // Cesty k ID (result.data...) si uprav podle toho, co reálně vrací tvé GraphQL
            const newLessonId = result?.data?.lessonInsert?.id || result?.id || Math.random().toString(); 
            
            // Najdeme celý objekt typu výuky, aby se nám v UI hned správně vypsal badge (odznáček)
            const selectedTypeObj = lessonTypes.find(t => t.id === selectedLessonTypeId);

            const newLessonForRedux = {
                id: newLessonId,
                name: insertPayload.name,
                topicId: insertPayload.topicId,
                lessontypeId: insertPayload.lessontypeId,
                lessontype: selectedTypeObj, // Pro zobrazení názvu typu v UI
                instructors: [],
                facilities: [],
                studyGroups: []
            };

            // 3. Uložíme lokálně do Reduxu
            dispatch(addLessonLocal({ lesson: newLessonForRedux }));

            // 4. Vyčistíme formulář
            setLessonName("");
            
            // ODEBRÁNO: await reloadPlan({ id: planId, limit: 1000 });

        } catch (err) {
            console.error("Chyba při ukládání lekce:", err);
            alert("Nepodařilo se přidat lekci.");
        }
    };

    return (
        <div className="d-flex align-items-center gap-3 ms-auto">
            <input
                type="text"
                className="form-control form-control-sm w-auto flex-grow-1"
                placeholder="Zadejte název výuky..."
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
            />
            
            <div className="mb-0">
                <select 
                    className="form-select form-select-sm w-auto" 
                    value={selectedLessonTypeId}
                    onChange={(e) => setSelectedLessonTypeId(e.target.value)}
                >
                    {/* Mapujeme rovnou data z props */}
                    {(!lessonTypes || lessonTypes.length === 0) && <option value="">Načítám...</option>}
                    {lessonTypes?.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name || type.nameEn || type.id}
                        </option>
                    ))}
                </select>
            </div>

            <button 
                className="btn btn-outline-secondary btn-sm w-auto text-nowrap"
                onClick={handleSave}
                disabled={loading}
            >
                {loading ? "Ukládám..." : "Uložit lekci"}
            </button>
        </div>
    )
}

// ── 5a. POTVRZOVACÍ DIALOG (PREVENCE MISS-CLICK) ──
const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
        <div
            className="modal d-block bg-dark bg-opacity-50"
            tabIndex="-1"
            onClick={onCancel}
        >
            <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
                <div className="modal-content shadow">
                    <div className="modal-header py-2 border-0">
                        <h6 className="modal-title text-danger">⚠ Potvrzení</h6>
                        <button type="button" className="btn-close btn-sm" onClick={onCancel} />
                    </div>
                    <div className="modal-body py-2">
                        <p className="mb-0 small">{message}</p>
                    </div>
                    <div className="modal-footer py-2 border-0 gap-2">
                        <button className="btn btn-sm btn-danger" onClick={onConfirm}>Ano, smazat</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Zrušit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── 5. ŘÁDEK JEDNÉ LEKCE (S AKCEMI PRO CONFIG) ──

const LessonRow = ({ lesson, planId }) => {
    const { selectedTeachers = [], selectedRooms = [], selectedGroups = [] } = useContext(SelectionContext);

    const dispatch = useDispatch();

    const { run: assignInstructor, loading: loadingInstructor } = useAsync(AddInstructorAsyncAction, null, { deferred: true });
    const { run: assignFacility, loading: loadingFacility } = useAsync(AddRoomAsyncAction, null, { deferred: true });
    const { run: assignGroup, loading: loadingGroup } = useAsync(AddGroupAsyncAction, null, { deferred: true });
    const { run: deleteLesson } = useAsync(DeleteLessonAsyncAction, null, { deferred: true });

    const { run: deleteVyucujiciho } = useAsync(DeleteTeacherAsyncAction, null, { deferred: true });
    const { run: deleteMistnost } = useAsync(DeleteRoomAsyncAction, null, { deferred: true });
    const { run: deleteSkupinu } = useAsync(DeleteGroupAsyncAction, null, { deferred: true });

    const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });
    const withConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
    const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });
    const handleConfirm = async () => { closeConfirm(); if (confirmState.onConfirm) await confirmState.onConfirm(); };

    // Přidá VŠECHNY vybrané učitele k lekci najednou (přeskočí ty, co už u ní jsou)
    const fvyucujici = async () => {
        const alreadyIds = new Set((lesson.instructors || []).map(i => i.id));
        const toAdd = selectedTeachers.filter(t => !alreadyIds.has(t.id));
        for (const teacher of toAdd) {
            try {
                await assignInstructor({ planitemId: lesson.id, userId: teacher.id });
                dispatch(addInstructorLocal({ lessonId: lesson.id, teacher }));
            } catch (err) {
                console.error("Chyba serveru při přidávání učitele:", err);
            }
        }
    };

    const handleRemoveInstructor = async (instructorId) => {
        try {
            await deleteVyucujiciho({ planitemId: lesson.id, userId: instructorId });
            dispatch(removeInstructorLocal({ lessonId: lesson.id, teacherId: instructorId }));
        } catch (err) { console.error(err); }
    };

    // Přidá VŠECHNY vybrané místnosti k lekci najednou (přeskočí ty, co už u ní jsou)
    const fmistnost = async () => {
        const alreadyIds = new Set((lesson.facilities || []).map(f => f.id));
        const toAdd = selectedRooms.filter(r => !alreadyIds.has(r.id));
        for (const room of toAdd) {
            try {
                await assignFacility({ planitemId: lesson.id, facilityId: room.id });
                dispatch(addFacilityLocal({ lessonId: lesson.id, facility: room }));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleRemoveFacility = async (facilityId) => {
        try {
            await deleteMistnost({ planitemId: lesson.id, facilityId: facilityId });
            dispatch(removeFacilityLocal({ lessonId: lesson.id, facilityId }));
        } catch (err) { console.error(err); }
    };

    // Přidá VŠECHNY vybrané skupiny k lekci najednou (přeskočí ty, co už u ní jsou)
    const fskupina = async () => {
        const alreadyIds = new Set((lesson.studyGroups || []).map(g => g.id));
        const toAdd = selectedGroups.filter(g => !alreadyIds.has(g.id));
        for (const group of toAdd) {
            try {
                await assignGroup({ planitemId: lesson.id, groupId: group.id });
                dispatch(addGroupLocal({ lessonId: lesson.id, group }));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleRemoveGroup = async (groupId) => {
        try {
            await deleteSkupinu({ planitemId: lesson.id, groupId: groupId });
            dispatch(removeGroupLocal({ lessonId: lesson.id, groupId }));
        } catch (err) { console.error(err); }
    };

    const fsmazat = async () => {
        try {
            await deleteLesson({ id: lesson.id, lastchange: lesson.lastchange });
            dispatch(deleteLessonLocal({ lessonId: lesson.id }));
        } catch (err) { console.error(err); }
    };

    return (
        <>
        <ConfirmModal
            show={confirmState.show}
            message={confirmState.message}
            onConfirm={handleConfirm}
            onCancel={closeConfirm}
        />
        <div className="d-flex align-items-center gap-2 py-1 px-3 rounded bg-white bg-opacity-50">
            <span className="fw-medium text-dark">{lesson.name || "Bez názvu"}</span>
            
            {lesson.lessontype?.name && (
                <span className="badge bg-light text-secondary border ms-2">
                    {lesson.lessontype.name}
                </span>
            )}

            <div className="d-flex align-items-center gap-3 ms-3 small text-secondary">
            {/* Učitelé */}
            {lesson.instructors?.map(inst => (
                <span key={inst.id} className="badge bg-white text-dark border d-flex align-items-center gap-2 px-2 py-1 shadow-sm">
                    👤 {inst.fullname || inst.surname || "Neznámý"}
                    <button type="button" className="btn-close"
                        onClick={() => withConfirm(
                            `Odebrat vyučujícího ${inst.fullname || inst.surname || "Neznámý"}?`,
                            async () => {
                                try {
                                    await deleteVyucujiciho({ planitemId: lesson.id, userId: inst.id });
                                    dispatch(removeInstructorLocal({ lessonId: lesson.id, teacherId: inst.id }));
                                } catch (e) { console.error(e); }
                            }
                        )}
                    />
                </span>
            ))}

            {/* Místnosti */}
            {lesson.facilities?.map(fac => (
                <span key={fac.id} className="badge bg-white text-dark border d-flex align-items-center gap-2 px-2 py-1 shadow-sm">
                    🏫 {fac.label || fac.name || "Neznámá"}
                    <button type="button" className="btn-close"
                        onClick={() => withConfirm(
                            `Odebrat místnost ${fac.label || fac.name || "Neznámá"}?`,
                            async () => {
                                try {
                                    await deleteMistnost({ planitemId: lesson.id, facilityId: fac.id });
                                    dispatch(removeFacilityLocal({ lessonId: lesson.id, facilityId: fac.id }));
                                } catch (e) { console.error(e); }
                            }
                        )}
                    />
                </span>
            ))}

            {/* Skupiny */}
            {lesson.studyGroups?.map(grp => (
                <span key={grp.id} className="badge bg-white text-dark border d-flex align-items-center gap-2 px-2 py-1 shadow-sm">
                    👥 {grp.abbreviation || grp.name || "Neznámá"}
                    <button type="button" className="btn-close"
                        onClick={() => withConfirm(
                            `Odebrat skupinu ${grp.abbreviation || grp.name || "Neznámá"}?`,
                            async () => {
                                try {
                                    await deleteSkupinu({ planitemId: lesson.id, groupId: grp.id });
                                    dispatch(removeGroupLocal({ lessonId: lesson.id, groupId: grp.id }));
                                } catch (e) { console.error(e); }
                            }
                        )}
                    />
                </span>
            ))}
        </div>
            {/* Ovládací tlačítka akcí */}
            <div className="ms-auto d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" disabled={selectedTeachers.length === 0 || loadingInstructor} onClick={fvyucujici}>
                    {loadingInstructor ? "..." : `👤 Přidat učitele${selectedTeachers.length ? ` (${selectedTeachers.length})` : ""}`}
                </button>
                <button className="btn btn-sm btn-outline-success" disabled={selectedRooms.length === 0 || loadingFacility} onClick={fmistnost}>
                    {loadingFacility ? "..." : `🏫 Přidat místnosti${selectedRooms.length ? ` (${selectedRooms.length})` : ""}`}
                </button>
                <button className="btn btn-sm btn-outline-warning text-dark" disabled={selectedGroups.length === 0 || loadingGroup} onClick={fskupina}>
                    {loadingGroup ? "..." : `👥 Přidat skupiny${selectedGroups.length ? ` (${selectedGroups.length})` : ""}`}
                </button>
                <button className="btn btn-sm btn-outline-danger"
                    onClick={() => withConfirm(
                        `Opravdu smazat lekci "${lesson.name || "Bez názvu"}"?`,
                        fsmazat
                    )}
                >Smazat</button>
            </div>
        </div>
        </>
    );
};

// ── 6. ORECHESTRAČNÍ KOMPONENTA PRO JEDNO TÉMA ──
const TopicRow = ({ topic, lessons, planId, lessonTypes }) => {
    return (
        <div className="border-bottom border-danger border-opacity-25">
            <div className="d-flex align-items-center justify-content-between px-4 py-3 gap-3">
                <TopicHeader topic={topic} lessons={lessons} />
                {/* PŘIDÁNO: předání do formuláře */}
                <AddLessonForm topicId={topic.id} planId={planId} lessonTypes={lessonTypes} />
            </div>

            {lessons && lessons.length > 0 && (
                <div className="px-5 pb-3">
                    <div className="d-flex flex-column gap-1">
                        {lessons.map((lesson) => (
                            <LessonRow 
                                key={lesson.id} 
                                lesson={lesson} 
                                planId={planId} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── 7. HLAVNÍ EXPORTOVANÁ KOMPONENTA DETAILU ──

export const StudyPlanDetail = ({ item: incomingItem, children }) => {
    const dispatch = useDispatch();

    const [globalLessonTypes, setGlobalLessonTypes] = useState([]);
    const { run: fetchLessonTypes } = useAsync(ReadLessonAsyncAction, null, { deferred: true });

    // 2. PŘIDÁNO: Načtení proběhne pouze jednou při mountování hlavní komponenty
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const response = await fetchLessonTypes({ limit: 1000 });
                const fetchedTypes = response?.data?.lessonTypePage || response?.lessonTypePage || [];
                setGlobalLessonTypes(fetchedTypes);
            } catch (e) {
                console.error("Chyba při načítání typů výuky:", e);
            }
        };
        loadTypes();
    }, []);

    // Načtení dat z props do Reduxu při prvním renderu
    useEffect(() => {
        if (incomingItem) {
            dispatch(setStudyPlan(incomingItem));
        }
    }, [incomingItem, dispatch]);

    // Odebírání živého stavu z Reduxu
    const reduxItem = useSelector((state) => state.studyPlan.item);

    // Pokud ještě nemáme data v Reduxu, použijeme fallback z props
    const activeItem = reduxItem || incomingItem;

    const semester = activeItem?.semester;
    const lessons = activeItem?.lessons || []; // Tohle jsou ty "živé" vytvořené lekce
    
    // ==========================================
    // TADY JE TO MASIVNÍ ZJEDNODUŠENÍ
    // Témata bereme POUZE z activeItem.semester.topics.
    // Nemusíme spojovat nic s lekcemi ani odstraňovat duplicity!
    // ==========================================
    const semesterTopics = semester?.topics || [];
    const sortedTopics = [...semesterTopics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // 4. Rozřazení "živých" lekcí k tématům (toto potřebujeme, abychom je mohli poslat do TopicRow jako čitatele)
    const lessonsByTopic = lessons.reduce((acc, l) => {
        (acc[l.topicId] = acc[l.topicId] || []).push(l);
        return acc;
    }, {});

    return (
        <div className="min-vh-100">
            <div className="bg-white py-2">
                <div className="row g-0 align-items-start">
                    <InfoPanel item={activeItem} />
                    <div className="col-12 col-md px-4 py-2 bg-white border-start border-success border-opacity-50">
                        {children}
                    </div>
                </div>
            </div>

            <div className="pt-1 bg-danger bg-opacity-25">
                {sortedTopics.length === 0 ? (
                    <div className="p-4 text-secondary fst-italic">Žádná témata nebyla nalezena.</div>
                ) : (
                    sortedTopics.map((topic) => (
                        <TopicRow
                            key={topic.id}
                            topic={topic}
                            lessons={lessonsByTopic[topic.id] || []}
                            planId={activeItem?.id}
                            lessonTypes={globalLessonTypes}
                        />
                    ))
                )}
            </div>
        </div>
    );
};