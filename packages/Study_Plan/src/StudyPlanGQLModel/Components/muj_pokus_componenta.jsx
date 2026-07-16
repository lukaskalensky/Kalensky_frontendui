import { EntityLookup } from '../../../../_template/src';
import { SearchAsyncAction } from '../Queries/SearchAsyncAction';
import { SearchGroupAsyncAction } from '../Queries/SearchGroupAsyncAction';
import { SearchRoomAsyncAction } from '../Queries/SearchRoomAsyncAction';
import { SelectionContext } from './SelectionContext';
import { useContext } from 'react';

// Jedna "karta" pro výběr entit (učitelů/místností/skupin) — obsahuje políčko
// EntityLookup pro vyhledání a přidání entity a pod ním seznam už vybraných
// entit jako odebiratelné odznaky. `asyncAction` určuje, co se hledá (jiná akce
// pro učitele, jinou pro místnosti, jinou pro skupiny — viz Queries/Search*AsyncAction),
// `selectedList`/`onAdd`/`onRemove` přicházejí z SelectionContextu přes rodičovskou
// komponentu MyCustomWidget, takže tahle karta si sama žádný stav nepamatuje.
const EntityLookupCard = ({ title, asyncAction, selectedList, onAdd, onRemove }) => {

    return (
        <div className="col">
            <div className="fw-semibold mb-1 fs-6">
                {title}
                {selectedList.length > 0 && (
                    <span className="badge bg-secondary rounded-pill ms-2">{selectedList.length}</span>
                )}
            </div>
            <div className="rounded px-3 py-2 bg-warning">
                <EntityLookup
                    className="form-control"
                    id={`lookup-${title}`}
                    asyncAction={asyncAction}
                    value={null}
                    onSelect={(entity) => {
                        onAdd(entity); // Přidáme entitu do seznamu vybraných (místo přepsání jedné hodnoty)
                        return { clear: true };
                    }}
                    placeholder="Napište alespoň 3 znaky"
                />
            </div>
            {selectedList.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-1">
                    {selectedList.map((entity) => (
                        <span
                            key={entity.id}
                            className="badge bg-white text-dark border d-flex align-items-center gap-2 px-2 py-1 shadow-sm"
                        >
                            {entity.fullname || entity.name || entity.abbreviation || entity.label}
                            <button
                                type="button"
                                className="btn-close"
                                style={{ fontSize: "0.55rem" }}
                                aria-label="Odebrat"
                                onClick={() => onRemove(entity.id)}
                            />
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// Hlavní widget s trojicí EntityLookupCard vedle sebe (učitelé / místnosti / skupiny).
// Sám o sobě neřeší žádnou logiku výběru — jen vytáhne aktuální seznamy a add/remove
// funkce ze SelectionContextu (naplněného v MujPokusPage) a předá je dál třem kartám.
// Vybrané entity odsud pak čte LessonRow ve StudyPlanDetail.jsx, když se mají hromadně
// přiřadit ke konkrétní lekci.
export const MyCustomWidget = ({ item }) => {

    const {
        selectedTeachers = [], addTeacher, removeTeacher,
        selectedRooms = [], addRoom, removeRoom,
        selectedGroups = [], addGroup, removeGroup,
    } = useContext(SelectionContext);

    if (!item) return null;

    return (
        <div className="row gap-5 align-items-start">
            <EntityLookupCard title="Vyučující" asyncAction={SearchAsyncAction}
                selectedList={selectedTeachers} onAdd={addTeacher} onRemove={removeTeacher} />
            <EntityLookupCard title="Místnosti" asyncAction={SearchRoomAsyncAction}
                selectedList={selectedRooms} onAdd={addRoom} onRemove={removeRoom} />
            <EntityLookupCard title="Skupiny" asyncAction={SearchGroupAsyncAction}
                selectedList={selectedGroups} onAdd={addGroup} onRemove={removeGroup} />
        </div>
    );
};
