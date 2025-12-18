import { useMemo } from "react";
import { Link } from "./Link";


const CellId = ({ row, name }) => (
    <td key={name}>
        <Link item={row}>{row?.id || "Data Error"}</Link>
    </td>
)

const CellName = ({ row, name }) => (
    <td key={name}>
        <Link item={row} />
    </td>
)

const CellDefault = ({ row, name }) => {
    const value = row?.[name] ?? ""

    const idpos = name.indexOf("Id")
    if (idpos === -1) {
        return <td key={name}>{typeof value === "object" ? `${value}` : (value || "")}</td>
    }

    const scalarname = name.replace("Id", "")
    const { id, __typename } = row?.[scalarname] || {}

    if (id && __typename && id == value) {
        return (
            <td key={name}>
                <Link item={row?.[scalarname]}>{value || ""}</Link>
            </td>
        )
    }

    return <td key={name}>{typeof value === "object" ? `${value}` : (value || "")}</td>
}

// 2) Funkce, která z dat vyrobí table_def
export const buildTableDef = (data) => {
    const row = data?.[0] ?? {}
    const priority = ["__typename", "id", "name"]

    const attribute_names = Object.keys(row).filter((attribute_name) => {
        const v = row[attribute_name]
        if (Array.isArray(v)) return false
        if (typeof v === "object" && v !== null) return false
        return true
    })

    const columns = [
        ...priority.filter((a) => attribute_names.includes(a)),
        ...attribute_names.filter((a) => !priority.includes(a)),
    ]

    // table_def: colname -> { label, component }
    const result = Object.fromEntries(
        columns.map((name) => {
            let component = CellDefault
            if (name === "id") component = CellId
            if (name === "name") component = CellName

            return [
                name,
                {
                    label: name,        // tady si můžeš dát hezčí label
                    component,          // React komponenta pro buňku
                },
            ]
        })
    )

    result["tools"] = {
        label: "Nástroje",
        component: () => <td><KebabMenu actions={[
            { label: "Editovat", onClick: () => console.log("edit") },
            { label: "Smazat", onClick: () => console.log("delete") },
            { label: "Detail", onClick: () => console.log("detail") },
        ]} /></td>,
    }

    return result
}

import { useState, useRef, useEffect } from "react";

export const KebabMenu = ({ actions = [] }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // zavření při kliku mimo
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
            <button
            className="btn btn-sm btn-outline-secondary"
                onClick={() => setOpen((o) => !o)}
                // style={{
                //     border: "none",
                //     background: "transparent",
                //     cursor: "pointer",
                //     fontSize: "20px",
                //     lineHeight: 1,
                //     padding: "4px 8px",
                // }}
                aria-label="Menu"
            >
                ⋮
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        minWidth: 140,
                    }}
                >
                    {actions.map((action, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setOpen(false);
                                action.onClick();
                            }}
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            {action.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export const TableRow = ({ row, table_def }) => {
    return (
        <tr>
            {Object.keys(table_def).map((name) => {
                const Cell = table_def[name].component
                return <Cell key={name} row={row} name={name} />
            }
            )}
        </tr>
    )
}

const TableRow_ = TableRow
// 3) Table už jen používá definici
export const TableBody = ({ data, table_def, TableRow = TableRow_ }) => {
    return (
        <tbody>
            {data.map((row) => <TableRow key={row?.id} row={row} table_def={table_def} />)}
        </tbody>
    )
}

const TableBody_ = TableBody

export const Table = ({ data, table_def = null, TableBody = TableBody_ }) => {
    if (!data || data.length === 0) return null

    const _table_def = useMemo(() => table_def || buildTableDef(data), [data, table_def])
    const colnames = useMemo(() => Object.keys(_table_def).map((k) => _table_def[k].label), [_table_def])

    return (
        <div className="table-responsive">
            <table className="table table-stripped">
                <thead>
                    <tr>
                        {colnames.map((name) => (
                            <th key={name}>{_table_def?.[name]?.label || `Nevim(${name})`}</th>
                        ))}
                    </tr>
                </thead>

                <TableBody data={data} table_def={_table_def} />
            </table>
        </div>
    )
}