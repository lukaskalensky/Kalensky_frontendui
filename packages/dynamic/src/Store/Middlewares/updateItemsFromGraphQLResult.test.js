import { describe, it, expect, vi } from "vitest";
import { updateItemsFromGraphQLResult } from "./updateItemsFromGraphQLResult";
import { ItemActions } from "../ItemSlice"; // cesta stejně jako v ItemSlice.test.js

describe("updateItemsFromGraphQLResult middleware", () => {
    const createMocks = () => {
        const dispatch = vi.fn();
        const getState = vi.fn();
        const next = vi.fn((result) => result);
        return { dispatch, getState, next };
    };

    it("z { data } vytáhne entity, dispatchne item_add a předá result do next", async () => {
        const { dispatch, getState, next } = createMocks();

        const user = { id: "u1", __typename: "User", name: "Alice" };
        const role = { id: "r1", __typename: "Role", name: "Admin" };

        const result = {
            data: {
                viewer: user,
                roles: [role],
                meta: { total: 1 },
            },
        };

        const mw = updateItemsFromGraphQLResult(result);

        const returned = await mw(dispatch, getState, next);

        // next dostane původní result a vrátí ho dál
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(result);
        expect(returned).toBe(result);

        // dispatch byl volán jednou pro každou entitu
        expect(dispatch).toHaveBeenCalledTimes(2);

        const dispatchedActions = dispatch.mock.calls.map(([action]) => action);

        // typ akce je item_add a payload je příslušná entita
        expect(dispatchedActions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: ItemActions.item_add.type,
                    payload: user,
                }),
                expect.objectContaining({
                    type: ItemActions.item_add.type,
                    payload: role,
                }),
            ])
        );
    });

    it("funguje i když dostane rovnou data (bez wrapperu { data })", async () => {
        const { dispatch, getState, next } = createMocks();

        const user = { id: "u2", __typename: "User", name: "Bob" };

        // tady rovnou data, ne { data: ... }
        const result = {
            currentUser: user,
        };

        const mw = updateItemsFromGraphQLResult(result);

        const returned = await mw(dispatch, getState, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(result);
        expect(returned).toBe(result);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: ItemActions.item_add.type,
                payload: user,
            })
        );
    });

    it("při entitě s id ale bez __typename vyhodí chybu, nedispatchne nic a nezavolá next", async () => {
        const { dispatch, getState, next } = createMocks();

        const badUser = { id: "u3", name: "NoTypename" }; // chybí __typename

        const result = {
            data: {
                viewer: badUser,
            },
        };

        const mw = updateItemsFromGraphQLResult(result);

        await expect(mw(dispatch, getState, next)).rejects.toThrow(
            /missing __typename/i
        );

        // žádné dispatchování ani next
        expect(dispatch).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("rekurzivně najde entity i hluboko zanořené ve strukturách", async () => {
        const { dispatch, getState, next } = createMocks();

        const user = { id: "u4", __typename: "User", name: "Deep" };
        const project = { id: "p1", __typename: "Project", title: "X" };

        const result = {
            data: {
                wrapper: {
                    nested: [
                        { info: { owner: user } },
                        { project },
                    ],
                },
            },
        };

        const mw = updateItemsFromGraphQLResult(result);

        await mw(dispatch, getState, next);

        const actions = dispatch.mock.calls.map(([a]) => a);

        expect(actions).toHaveLength(2);
        expect(actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: ItemActions.item_add.type,
                    payload: user,
                }),
                expect.objectContaining({
                    type: ItemActions.item_add.type,
                    payload: project,
                }),
            ])
        );
    });
});
