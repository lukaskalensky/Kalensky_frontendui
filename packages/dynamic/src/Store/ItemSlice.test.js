import { describe, it, expect } from "vitest";
import { ItemReducer, ItemActions, selectItemById, selectAllItems } from "./ItemSlice";

const reduce = (state, action) => ItemReducer(state, action);

const id1 = "832bd904-de58-432b-aaf4-6dff721fd9e5"
const id2 = "2732984b-0206-4063-8e8a-e81d00a2289a"

describe("ItemSlice", () => {
    it("item_add - přidá nový item", () => {
        const initialState = undefined; // RTK si vezme initialState
        const item = { id: id1, __typename: "User", name: "Alice" };

        const state = reduce(initialState, ItemActions.item_add(item));

        expect(state.ids).toEqual([id1]);
        expect(state.entities[id1]).toMatchObject({
            id: id1,
            __typename: "User",
            name: "Alice",
        });
    });

    it("item_add - přidá nový item bez id", () => {
        const initialState = undefined; // RTK si vezme initialState
        const item = { __typename: "User", name: "Alice" };

        const state = reduce(initialState, ItemActions.item_add(item));
        const id1 = state.ids[0]
        expect(state.ids).toEqual([id1]);
        expect(state.entities[id1]).toMatchObject({
            id: id1,
            __typename: "User",
            name: "Alice",
        });
    });

    it("item_update - mergne existující item", () => {
        const initialState = reduce(
            undefined,
            ItemActions.item_add({ id: id1, __typename: "User", name: "Alice" })
        );

        const state = reduce(initialState, ItemActions.item_update({ id: id1, name: "Bob" }));

        expect(state.entities[id1]).toMatchObject({
            id: id1,
            __typename: "User",
            name: "Bob", // změněno
        });
    });


    it("item_replace - nahradi existující item", () => {
        const initialState = reduce(
            undefined,
            ItemActions.item_add({ id: id1, __typename: "User", name: "Alice" })
        );

        const state = reduce(initialState, ItemActions.item_replace({ id: id1, name: "Bob" }));

        expect(state.entities[id1]).toMatchObject({
            id: id1,
            // __typename: "User", // odstraněno
            name: "Bob", // změněno
        });
    });


    it("item_delete - odstrani existující item", () => {
        const initialState = reduce(
            undefined,
            ItemActions.item_add({ id: id1, __typename: "User", name: "Alice" })
        );

        const state = reduce(initialState, ItemActions.item_delete({ id: id1 }));

        expect(state.entities).toEqual({});
        expect(state.ids).toEqual([]);
    });


    it("selektory - selectItemById a selectAllItems", () => {
        let state = reduce(
            undefined,
            ItemActions.item_add({ id: id1, __typename: "User", name: "Alice" })
        );
        state = reduce(
            state,
            ItemActions.item_add({ id: id2, __typename: "User", name: "Bob" })
        );

        const user1 = selectItemById({ items: state }, id1);
        const all = selectAllItems({ items: state });

        expect(user1.name).toBe("Alice");
        expect(all.map((x) => x.id)).toEqual([id1, id2]);
    });

    it("item_updateAttributeScalar - primitivní scalar přepíše hodnotu a inkrementuje _version", () => {
        // 1) Vytvoříme výchozí stav s jedním itemem
        const initialState = reduce(
            undefined,
            ItemActions.item_add({ id: id1, __typename: "User", name: "Alice", age: 20 })
        );
        const prevVersion = initialState.entities[id1]._version ?? 0;

        // 2) Provedeme update scalaru `age`
        const state = reduce(
            initialState,
            ItemActions.item_updateAttributeScalar({
                item: { id: id1, age: 21 },
                scalarname: "age",
            })
        );

        // 3) Ověříme změnu
        expect(state.entities[id1]).toMatchObject({
            id: id1,
            __typename: "User",
            name: "Alice",
            age: 21,
        });

        // _version by se měl zvýšit o 1
        expect(state.entities[id1]._version).toBe(prevVersion + 1);
        // _updatedAt neřešíme přesnou hodnotu, jen že existuje
        expect(typeof state.entities[id1]._updatedAt).toBe("number");
    });


    it("item_updateAttributeScalar - objektový scalar s __typename se mergne a zároveň se normalizuje jako entita", () => {
        const initialState = reduce(
            undefined,
            ItemActions.item_add({
                id: id1,
                __typename: "User",
                name: "Alice",
                owner: null,
            })
        );

        const owner = {
            id: id2,
            __typename: "User",
            name: "Bob",
        };

        const state = reduce(
            initialState,
            ItemActions.item_updateAttributeScalar({
                item: {
                    id: id1,
                    owner,
                },
                scalarname: "owner",
            })
        );

        // 1) Parent má owner nastavený
        expect(state.entities[id1]).toMatchObject({
            id: id1,
            name: "Alice",
            owner: {
                id: id2,
                __typename: "User",
                name: "Bob",
            },
        });

        // 2) Owner je zároveň samostatná normalizovaná entita
        expect(state.entities[id2]).toMatchObject({
            id: id2,
            __typename: "User",
            name: "Bob",
        });

        expect(typeof state.entities[id2]._updatedAt).toBe("number");
        expect(state.entities[id2]._version).toBeGreaterThanOrEqual(1);
    });

    it("item_updateAttributeVector - mergne starý a nový vektor bez __typename (bez normalizace)", () => {
        // 1) Parent s původním vektorem children
        let state = reduce(
            undefined,
            ItemActions.item_add({
                id: id1,
                __typename: "User",
                name: "Alice",
                children: [
                    { id: "c1", name: "Child 1", age: 5 },
                    { id: "c2", name: "Child 2", age: 7 },
                ],
            })
        );

        const prevVersion = state.entities[id1]._version ?? 0;

        // 2) Update vektoru children
        state = reduce(
            state,
            ItemActions.item_updateAttributeVector({
                item: {
                    id: id1,
                    children: [
                        // update existujícího sub-itemu (bez __typename)
                        { id: "c1", age: 6 },
                        // nový sub-item (bez __typename)
                        { id: "c3", name: "Child 3", age: 1 },
                    ],
                },
                vectorname: "children",
            })
        );

        const parent = state.entities[id1];
        expect(Array.isArray(parent.children)).toBe(true);
        expect(parent.children).toHaveLength(3);

        // Helper: index podle id, abychom neřešili pořadí
        const byId = Object.fromEntries(parent.children.map((c) => [c.id, c]));

        expect(byId["c1"]).toMatchObject({
            id: "c1",
            name: "Child 1",
            age: 6, // updatnuto
        });

        expect(byId["c2"]).toMatchObject({
            id: "c2",
            name: "Child 2",
            age: 7, // původní
        });

        expect(byId["c3"]).toMatchObject({
            id: "c3",
            name: "Child 3",
            age: 1,
        });

        // Žádná normalizace – pořád jen jeden item v adapteru
        expect(state.ids).toEqual([id1]);

        // parent dostal novou verzi a updatedAt
        expect(parent._version).toBe(prevVersion + 1);
        expect(typeof parent._updatedAt).toBe("number");
    });

    it("item_updateAttributeVector - normalizuje sub-entit s __typename do entities a zároveň je uloží v parentovi", () => {
        // 1) Parent bez children
        let state = reduce(
            undefined,
            ItemActions.item_add({
                id: id1,
                __typename: "User",
                name: "Alice",
                children: [],
            })
        );

        const prevVersion = state.entities[id1]._version ?? 0;

        const children = [
            { id: id2, __typename: "Role", name: "Admin" },
            { id: "role-2", __typename: "Role", name: "Editor" },
        ];

        // 2) Update vektoru children
        state = reduce(
            state,
            ItemActions.item_updateAttributeVector({
                item: {
                    id: id1,
                    children,
                },
                vectorname: "children",
            })
        );

        const parent = state.entities[id1];
        expect(Array.isArray(parent.children)).toBe(true);
        expect(parent.children).toHaveLength(2);

        const byId = Object.fromEntries(parent.children.map((c) => [c.id, c]));

        // Parent má v children celé objekty
        expect(byId[id2]).toMatchObject({
            id: id2,
            __typename: "Role",
            name: "Admin",
        });

        expect(byId["role-2"]).toMatchObject({
            id: "role-2",
            __typename: "Role",
            name: "Editor",
        });

        // A zároveň jsou oba normalizované v adapteru přes upsertItem
        expect(state.entities[id2]).toMatchObject({
            id: id2,
            __typename: "Role",
            name: "Admin",
        });

        expect(state.entities["role-2"]).toMatchObject({
            id: "role-2",
            __typename: "Role",
            name: "Editor",
        });

        // Adapter obsahuje parent + oba children
        const sortedIds = [...state.ids].sort();
        expect(sortedIds).toEqual([id1, id2, "role-2"].sort());

        // parent má zvýšenou verzi a updatedAt
        expect(parent._version).toBe(prevVersion + 1);
        expect(typeof parent._updatedAt).toBe("number");
    });

});
