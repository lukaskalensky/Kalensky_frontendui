import { Input } from "../../../../_template/src/Base/FormControls/Input";
import { useState, useEffect } from "react";
import { useAsync } from "../../../../dynamic/src/Hooks";

// Očekávám, že máte dostupnou akci pro načtení typů výuky (jako ve StudyPlanDetail)
// Pokud je cesta jiná, upravte si ji prosím podle své struktury.
import { ReadLessonAsyncAction } from "../Queries/LessonType"; 

export const MediumEditableContent = ({ item, onChange = (e) => null, onBlur = (e) => null, children }) => {
    
    // ─── 1. NAČÍTÁNÍ TYPŮ VÝUKY Z DATABÁZE ───
    const [lessonTypes, setLessonTypes] = useState([]);
    const [genCount, setGenCount] = useState(14); // Výchozí počet pro generátor
    const { run: fetchLessonTypes } = useAsync(ReadLessonAsyncAction, null, { deferred: true });

    useEffect(() => {
        const loadTypes = async () => {
            try {
                const response = await fetchLessonTypes({ limit: 1000 });
                const fetchedTypes = response?.data?.lessonTypePage || response?.lessonTypePage || [];
                setLessonTypes(fetchedTypes);
            } catch (e) {
                console.error("Chyba při načítání typů výuky:", e);
            }
        };
        loadTypes();
    }, []);

    // ─── 2. SPRÁVA LOKÁLNÍHO STAVU (Témata a Lekce) ───
    // Ukládáme to do item.plannedTopics, aby to pak zachytila nadřazená Save akce
    const topics = item?.plannedTopics || [];

    const updateTopics = (newTopics) => {
    onChange({ 
        target: { 
            id: "plannedTopics",     // <--- Změněno z 'name' na 'id'
            name: "plannedTopics", 
            value: newTopics 
        } 
    });
};

    // Hromadné generování
    const generateTopics = (e) => {
        e.preventDefault();
        const count = parseInt(genCount, 10) || 0;
        const defaultTypeId = lessonTypes.length > 0 ? lessonTypes[0].id : "";
        const newTopics = [];

        for (let i = 0; i < count; i++) {
            newTopics.push({
                id: Math.random().toString(36).substr(2, 9), // Unikátní ID pro UI
                name: `Téma ${topics.length + i + 1}`,
                lessons: defaultTypeId ? [{ 
                    id: Math.random().toString(36).substr(2, 9), 
                    lessontypeId: defaultTypeId, 
                    count: 2 // Výchozí počet hodin v novém tématu
                }] : []
            });
        }
        updateTopics([...topics, ...newTopics]);
    };

    // Práce s tématy
    const addTopic = (e) => {
        e.preventDefault();
        updateTopics([...topics, { id: Math.random().toString(36).substr(2, 9), name: `Nové téma`, lessons: [] }]);
    };
    const removeTopic = (id) => updateTopics(topics.filter(t => t.id !== id));
    const updateTopicName = (id, name) => updateTopics(topics.map(t => t.id === id ? { ...t, name } : t));

    // Práce s lekcemi uvnitř tématu
    const addLesson = (e, topicId) => {
        e.preventDefault();
        const defaultTypeId = lessonTypes.length > 0 ? lessonTypes[0].id : "";
        updateTopics(topics.map(t => {
            if (t.id === topicId) {
                return { ...t, lessons: [...t.lessons, { id: Math.random().toString(36).substr(2, 9), lessontypeId: defaultTypeId, count: 1 }] };
            }
            return t;
        }));
    };
    const removeLesson = (topicId, lessonId) => {
        updateTopics(topics.map(t => t.id === topicId ? { ...t, lessons: t.lessons.filter(l => l.id !== lessonId) } : t));
    };
    const updateLesson = (topicId, lessonId, field, value) => {
        updateTopics(topics.map(t => {
            if (t.id === topicId) {
                return { ...t, lessons: t.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l) };
            }
            return t;
        }));
    };

    // ─── 3. RENDEROVÁNÍ UI ───
    return (
        <div className="d-flex flex-column gap-4">
            
            {/* ZÁKLADNÍ VAZBY (Předvyplněné z props) */}
            <div className="card shadow-sm border-0 bg-light">
                <div className="card-body">
                    <h6 className="card-title text-secondary border-bottom pb-2 mb-3">🔗 Základní vazby</h6>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <Input id={"semesterId"} label={"ID Semestru (UUID)"} className="form-control bg-white" value={item?.semesterId || ""} onChange={onChange} onBlur={onBlur} />
                        </div>
                        <div className="col-12 col-md-6">
                            <Input id={"eventId"} label={"ID Události / Event (UUID)"} className="form-control bg-white" value={item?.eventId || ""} onChange={onChange} onBlur={onBlur} />
                        </div>
                    </div>
                </div>
            </div>

            {/* STRUKTURA PLÁNU (Témata a výuka) */}
            <div className="card shadow-sm border-primary border-opacity-25">
                <div className="card-header bg-primary bg-opacity-10 fw-bold text-primary d-flex justify-content-between align-items-center">
                    <span>📚 Struktura plánu (Témata a výuka)</span>
                    <span className="badge bg-primary rounded-pill">Témat: {topics.length}</span>
                </div>
                
                <div className="card-body">
                    
                    {/* Generátor */}
                    <div className="d-flex align-items-end gap-2 mb-4 p-3 bg-light rounded border border-secondary border-opacity-25">
                        <div>
                            <label className="form-label small mb-1 fw-medium">Rychlé generování témat:</label>
                            <input type="number" className="form-control form-control-sm" style={{ width: '100px' }} value={genCount} onChange={(e) => setGenCount(e.target.value)} min="1" max="50" />
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={generateTopics}>+ Vygenerovat</button>
                    </div>

                    {/* Výpis jednotlivých témat */}
                    <div className="d-flex flex-column gap-3">
                        {topics.length === 0 && (
                            <div className="text-center text-muted fst-italic py-3">Zatím nebylo přidáno žádné téma.</div>
                        )}
                        
                        {topics.map((topic, tIndex) => (
                            <div key={topic.id} className="border border-secondary border-opacity-25 rounded p-3 bg-white shadow-sm">
                                
                                {/* Hlavička tématu */}
                                <div className="d-flex gap-2 align-items-center mb-3 border-bottom pb-2">
                                    <span className="fw-bold text-secondary">#{tIndex + 1}</span>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-sm flex-grow-1 fw-medium" 
                                        value={topic.name} 
                                        onChange={(e) => updateTopicName(topic.id, e.target.value)}
                                        placeholder="Název tématu"
                                    />
                                    <button className="btn btn-sm btn-outline-danger" title="Smazat téma" onClick={(e) => { e.preventDefault(); removeTopic(topic.id); }}>🗑</button>
                                </div>

                                {/* Seznam lekcí v tématu */}
                                <div className="ps-2 ps-md-4">
                                    {topic.lessons.map((lesson) => (
                                        <div key={lesson.id} className="d-flex flex-wrap gap-2 align-items-center mb-2 p-1 rounded bg-light">
                                            <select 
                                                className="form-select form-select-sm w-auto"
                                                value={lesson.lessontypeId}
                                                onChange={(e) => updateLesson(topic.id, lesson.id, 'lessontypeId', e.target.value)}
                                            >
                                                {lessonTypes.length === 0 && <option value="">Načítám...</option>}
                                                {lessonTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name || lt.nameEn}</option>)}
                                            </select>
                                            
                                            <div className="input-group input-group-sm w-auto">
                                                <span className="input-group-text bg-white text-muted">Počet:</span>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    style={{width: '70px'}} 
                                                    value={lesson.count} 
                                                    onChange={(e) => updateLesson(topic.id, lesson.id, 'count', e.target.value)}
                                                    min="1"
                                                />
                                            </div>
                                            
                                            <button className="btn btn-sm btn-close ms-auto" title="Odebrat lekci" onClick={(e) => { e.preventDefault(); removeLesson(topic.id, lesson.id); }}></button>
                                        </div>
                                    ))}
                                    
                                    <button className="btn btn-sm btn-link text-decoration-none p-0 mt-2 fw-medium" onClick={(e) => addLesson(e, topic.id)}>
                                        + Přidat výuku (přednáška/cviko...)
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="btn btn-outline-secondary w-100 mt-4" onClick={addTopic}>
                        + Přidat prázdné téma
                    </button>

                </div>
            </div>

            {children}
        </div>
    )
}