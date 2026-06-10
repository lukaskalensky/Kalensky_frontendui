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
    deleteLessonLocal, setStudyPlan
} from "../Queries/StudyPlanSlice"; 


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
            <div className="fw-semibold small mb-2">👥 Předvídaní vyučující ({teachers.length})</div>
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
                <CreateButton
                    className="btn btn-sm btn-outline-success w-100"
                    rbacitem={item}
                    item={{ semesterId: item?.semesterId }}
                >
                    Vytvořit nový plán
                </CreateButton>
                <DeleteButton
                    className="btn btn-sm btn-outline-danger w-100"
                    item={item}
                >
                    Smazat plán
                </DeleteButton>
            </div>
        </div>
    )
}

// ── 3. HLAVIČKA TÉMATU (NÁZEV + BADGES S POČTY) ──
const TopicHeader = ({ topic, lessons }) => {
    const actualByTypeName = (lessons || []).reduce((acc, l) => {
        const typeName = l.lessontype?.name || l.lessontype?.nameEn || null;
        if (!typeName) return acc;
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
    }, {});

    const plannedByTypeName = (topic?.lessons || []).reduce((acc, l) => {
        const typeName = l.type?.name || l.type?.nameEn || null;
        if (!typeName) return acc;
        acc[typeName] = l.count || 0;
        return acc;
    }, {});

    const allTypeNames = new Set([...Object.keys(actualByTypeName), ...Object.keys(plannedByTypeName)]);
    const typeEntries = [...allTypeNames].map(typeName => ({
        typeName,
        actual: actualByTypeName[typeName] || 0,
        planned: plannedByTypeName[typeName] ?? null,
    }));

    return (
        <div className="d-flex align-items-center flex-wrap gap-2 flex-grow-1">
            <ProxyLink
                to={`/granting/TopicGQLModel/view/${topic.id}`}
                className="fw-bold text-decoration-none text-dark text-nowrap"
            >
                {topic.name || topic.nameEn || `Téma ${topic.order ?? ""}`}
            </ProxyLink>
            
            <div className="d-flex gap-2 ms-2">
                {typeEntries.map(({ typeName, actual, planned }) => (
                    <span key={typeName} className="badge bg-white text-secondary border border-secondary border-opacity-25 fw-normal">
                        {planned !== null ? `${actual}/${planned}` : `${actual}x`} {typeName}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ── 4. FORMULÁŘ PRO PŘIDÁNÍ LEKCE ──
const AddLessonForm = ({ topicId, planId }) => {
    const [lessonName, setLessonName] = useState("");
    const [lessonTypes, setLessonTypes] = useState([]);
    const [selectedLessonTypeId, setSelectedLessonTypeId] = useState("");

    const { run: addLesson, loading } = useAsync(AddLessonAsyncAction, null, { deferred: true });
    const { run: fetchLessonTypes } = useAsync(ReadLessonAsyncAction, null, { deferred: true });
    const { run: reloadPlan } = useAsyncThunkAction(FetchMojeDataAction, null, { deferred: true }); // Tip: Pokud implementujete Redux lokální update, toto nahradíte za useDispatch

    useEffect(() => {
        const loadLessonTypes = async () => {
            try {
                const response = await fetchLessonTypes({ limit: 1000 });
                const fetchedTypes = response?.data?.lessonTypePage || response?.lessonTypePage || [];
                setLessonTypes(fetchedTypes);
                if (fetchedTypes.length > 0) {
                    setSelectedLessonTypeId(fetchedTypes[0].id);
                }
            } catch (e) {
                console.error("Chyba při načítání typů výuky:", e);
            }
        };
        loadLessonTypes();
    }, []);

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
            await addLesson(insertPayload);
            setLessonName("");
            alert("Lekce byla přidána.");
            await reloadPlan({ id: planId, limit: 1000 });
        } catch (err) {
            console.error("Chyba při ukládání lekce:", err);
        }
    };

    return (
        <div className="d-flex align-items-center gap-3 ms-auto">
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
                    {lessonTypes.length === 0 && <option value="">Načítám...</option>}
                    {lessonTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name || type.nameEn || type.id}
                        </option>
                    ))}
                </select>
            </div>

            <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleSave}
                disabled={loading}
                style={{ minWidth: "100px" }}
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
            className="modal d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}
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
    const { selectedTeacher, selectedRoom, selectedGroup } = useContext(SelectionContext);
    
    // 1. Inicializujeme dispatch (už nepotřebujeme useAsyncThunkAction / reloadPlan!)
    const dispatch = useDispatch();

    // Síťové mutace pro zápis do DB (deferred: true)
    const { run: assignInstructor, loading: loadingInstructor } = useAsync(AddInstructorAsyncAction, null, { deferred: true });
    const { run: assignFacility, loading: loadingFacility } = useAsync(AddRoomAsyncAction, null, { deferred: true });
    const { run: assignGroup, loading: loadingGroup } = useAsync(AddGroupAsyncAction, null, { deferred: true });
    const { run: deleteLesson } = useAsync(DeleteLessonAsyncAction, null, { deferred: true });

    const { run: deleteVyucujiciho } = useAsync(DeleteTeacherAsyncAction, null, { deferred: true });
    const { run: deleteMistnost } = useAsync(DeleteRoomAsyncAction, null, { deferred: true });
    const { run: deleteSkupinu } = useAsync(DeleteGroupAsyncAction, null, { deferred: true });

    // ── POTVRZOVACÍ STAV ──
    const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });
    const withConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
    const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });
    const handleConfirm = async () => { closeConfirm(); if (confirmState.onConfirm) await confirmState.onConfirm(); };

    // ── AKCE: PŘIDÁNÍ UČITELE ──
    const fvyucujici = async () => {
        try {
            // A) Zápis do DB na serveru
            await assignInstructor({ planitemId: lesson.id, userId: selectedTeacher.id });
            
            // B) MÍSTO reloadPlan() provedeme instantní lokální update v Redux storu
            dispatch(addInstructorLocal({ 
                lessonId: lesson.id, 
                teacher: selectedTeacher  // objekt učitele, kterého už máme v kontextu
            }));
        } catch (err) { 
            console.error("Chyba serveru při přidávání učitele:", err); 
        }
    };

    // ── AKCE: ODEBRÁNÍ UČITELE (Křížek) ──
    const handleRemoveInstructor = async (instructorId) => {
        try {
            await deleteVyucujiciho({ planitemId: lesson.id, userId: instructorId });
            
            // Lokální smazání ze storu
            dispatch(removeInstructorLocal({ lessonId: lesson.id, teacherId: instructorId }));
        } catch (err) { console.error(err); }
    };

    // ── AKCE: PŘIDÁNÍ MÍSTNOSTI ──
    const fmistnost = async () => {
        try {
            await assignFacility({ planitemId: lesson.id, facilityId: selectedRoom.id });
            
            // Lokální update místnosti
            dispatch(addFacilityLocal({ lessonId: lesson.id, facility: selectedRoom }));
        } catch (err) { console.error(err); }
    };

    // ── AKCE: ODEBRÁNÍ MÍSTNOSTI (Křížek) ──
    const handleRemoveFacility = async (facilityId) => {
        try {
            await deleteMistnost({ planitemId: lesson.id, facilityId: facilityId });
            dispatch(removeFacilityLocal({ lessonId: lesson.id, facilityId }));
        } catch (err) { console.error(err); }
    };

    // ── AKCE: PŘIDÁNÍ SKUPINY ──
    const fskupina = async () => {
        try {
            await assignGroup({ planitemId: lesson.id, groupId: selectedGroup.id });
            
            // Lokální update skupiny
            dispatch(addGroupLocal({ lessonId: lesson.id, group: selectedGroup }));
        } catch (err) { console.error(err); }
    };

    // ── AKCE: ODEBRÁNÍ SKUPINY (Křížek) ──
    const handleRemoveGroup = async (groupId) => {
        try {
            await deleteSkupinu({ planitemId: lesson.id, groupId: groupId });
            dispatch(removeGroupLocal({ lessonId: lesson.id, groupId }));
        } catch (err) { console.error(err); }
    };

    // ── AKCE: SMAZÁNÍ CELÉ LEKCE ──
    const fsmazat = async () => {
        try {
            await deleteLesson({ id: lesson.id, lastchange: lesson.lastchange });
            
            // Lokální smazání lekce ze seznamu
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
        <div className="d-flex align-items-center gap-2 py-1 px-3 rounded" style={{ backgroundColor: "rgba(255,255,255,0.4)" }}>
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
                    <button type="button" className="btn-close" style={{ fontSize: "0.5rem" }}
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
                    <button type="button" className="btn-close" style={{ fontSize: "0.5rem" }}
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
                    <button type="button" className="btn-close" style={{ fontSize: "0.5rem" }}
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
                <button className="btn btn-sm btn-outline-primary" disabled={!selectedTeacher || loadingInstructor} onClick={fvyucujici}>
                    {loadingInstructor ? "..." : `👤 ${selectedTeacher?.surname || "Učitel"}`}
                </button>
                <button className="btn btn-sm btn-outline-success" disabled={!selectedRoom || loadingFacility} onClick={fmistnost}>
                    {loadingFacility ? "..." : `🏫 ${selectedRoom?.label || "Místnost"}`}
                </button>
                <button className="btn btn-sm btn-outline-warning text-dark" disabled={!selectedGroup || loadingGroup} onClick={fskupina}>
                    {loadingGroup ? "..." : `👥 ${selectedGroup?.abbreviation || "Skupina"}`}
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
const TopicRow = ({ topic, lessons, planId }) => {
    return (
        <div className="border-bottom border-danger border-opacity-25">
            <div className="d-flex align-items-center justify-content-between px-4 py-3 gap-3">
                <TopicHeader topic={topic} lessons={lessons} />
                <AddLessonForm topicId={topic.id} planId={planId} />
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
    const topics = semester?.topics || [];
    const lessons = activeItem?.lessons || [];
    
    // Rozřazení živých lekcí k tématům
    const lessonsByTopic = lessons.reduce((acc, l) => {
        const tid = l.topicId;
        if (!acc[tid]) acc[tid] = [];
        acc[tid].push(l);
        return acc;
    }, {});
    
    const sortedTopics = [...topics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
                        />
                    ))
                )}
            </div>
        </div>
    );
};