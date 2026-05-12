import { useState } from 'react';
import { EntityLookup } from '../../../../_template/src';
import { SearchAsyncAction } from '../Queries/SearchAsyncAction';
import { SearchGroupAsyncAction } from '../Queries/SearchGroupAsyncAction';
import { SearchRoomAsyncAction } from '../Queries/SearchRoomAsyncAction';

const LOOKUP_YELLOW = "#e8c040";

const EntityLookupCard = ({ title, asyncAction }) => {
    const [selected, setSelected] = useState(null);

    return (
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: "0.95rem" }}>{title}</div>
            <div
                style={{
                    background: LOOKUP_YELLOW,
                    borderRadius: "4px",
                    padding: "8px 12px",
                }}
            >
                <EntityLookup
                    id={`lookup-${title}`}
                    asyncAction={asyncAction}
                    value={selected}
                    onSelect={(entity) => { setSelected(entity); return { clear: true }; }}
                    placeholder="Napište alespoň 3 znaky"
                />
            </div>
            {selected && (
                <div style={{ marginTop: 4, fontSize: "0.82rem", color: "#444" }}>
                    Vybráno: <strong>{selected.fullname || selected.name}</strong>
                </div>
            )}
        </div>
    );
};

export const MyCustomWidget = ({ item }) => {
    if (!item) return null;

    return (
        <div style={{ display: "flex", gap: "48px", alignItems: "flex-start" }}>
            <EntityLookupCard title="Vyučující" asyncAction={SearchAsyncAction} />
            <EntityLookupCard title="Místnosti" asyncAction={SearchRoomAsyncAction} />
            <EntityLookupCard title="Skupiny" asyncAction={SearchGroupAsyncAction} />
        </div>
    );
};
