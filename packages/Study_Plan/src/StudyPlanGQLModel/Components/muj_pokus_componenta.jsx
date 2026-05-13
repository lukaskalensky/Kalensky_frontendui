import { useState } from 'react';
import { EntityLookup } from '../../../../_template/src';
import { SearchAsyncAction } from '../Queries/SearchAsyncAction';
import { SearchGroupAsyncAction } from '../Queries/SearchGroupAsyncAction';
import { SearchRoomAsyncAction } from '../Queries/SearchRoomAsyncAction';
import { SelectionContext } from './SelectionContext';
import { useContext } from 'react';

const EntityLookupCard = ({ title, asyncAction, selected, onSelectChange }) => {

    return (
        <div className="col">
            <div className="fw-semibold mb-1 fs-6">
                {title}
            </div>
            <div className="rounded px-3 py-2 bg-warning">
                <EntityLookup
                    className="form-control"
                    id={`lookup-${title}`}
                    asyncAction={asyncAction}
                    value={selected}
                    onSelect={(entity) => { 
                        onSelectChange(entity); // Zavoláme funkci od rodiče a předáme jí entitu
                        return { clear: true }; 
                    }}
                    placeholder="Napište alespoň 3 znaky"
                />
            </div>
            {selected && (
                <div className="mt-1 small text-secondary">
                    Vybráno: <strong className="fw-bold">{selected.fullname || selected.name}</strong>
                </div>
            )}
        </div>
    );
};

export const MyCustomWidget = ({ item }) => {

    const { 
        selectedTeacher, setSelectedTeacher,
        selectedRoom, setSelectedRoom,
        selectedGroup, setSelectedGroup 
    } = useContext(SelectionContext);

    if (!item) return null;

    return (
        <div className="row gap-5 align-items-start">
            <EntityLookupCard title="Vyučující" asyncAction={SearchAsyncAction} selected={selectedTeacher}
                onSelectChange={setSelectedTeacher} />
            <EntityLookupCard title="Místnosti" asyncAction={SearchRoomAsyncAction} selected={selectedRoom}
                onSelectChange={setSelectedRoom}/>
            <EntityLookupCard title="Skupiny" asyncAction={SearchGroupAsyncAction} selected={selectedGroup}
                onSelectChange={setSelectedGroup}/>
        </div>
    );
};