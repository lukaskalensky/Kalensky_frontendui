import { describe, it, expect, vi } from "vitest";
import { createFetchQuery, createAsyncGraphQLAction2 } from "./createAsyncGraphQLAction2";
import { updateItemsFromGraphQLResult } from "../Store";

import * as gqlClientModule from "./gqlClient2";

const id1 = "832bd904-de58-432b-aaf4-6dff721fd9e5"
const id2 = "2732984b-0206-4063-8e8a-e81d00a2289a"

describe("createAsyncGraphQLAction2", () => {
    it("zavolá gqlClient.request a spustí middlewares", async () => {
        const mockRequest = vi.fn().mockResolvedValue({
            data: {
                me: { id: id1, __typename: "User", name: "Alice" },
            },
        });

        const gqlClient = { request: mockRequest };

        // // mockni globální klient
        // vi.spyOn(gqlClientModule, "gqlClient", "get").mockReturnValue({
        //     request: mockRequest,
        // });

        const query = `query Me { me { id __typename name } }`;

        const mw = vi.fn((result) => (dispatch, getState, next) => {
            // můžu něco udělat s result
            return next(result.data.me); // do chainu pustíme jen me
        });

        const AsyncAction = createAsyncGraphQLAction2(query, mw);
        const dispatch = vi.fn();
        const getState = vi.fn(() => ({}));

        const thunk = AsyncAction({}, gqlClient);              // (vars) => thunk
        const out = await thunk(dispatch, getState); // spustím thunk

        expect(mockRequest).toHaveBeenCalledWith({
            query,
            variables: {},
        });
        expect(mw).toHaveBeenCalled(); // middleware byl použit
        expect(out).toEqual({ id: id1, __typename: "User", name: "Alice" });
    });


    // it("createFetchQuery spojí defaultParams a variables a zavolá gqlClient.request", async () => {
    //     const mockRequest = vi.fn().mockResolvedValue({ data: { ok: true } });
    //     vi.spyOn(gqlClientModule, "gqlClient", "get").mockReturnValue({
    //         request: mockRequest,
    //     });

    //     const query = "query Test($id: ID!) { item(id: $id) { id } }";
    //     const fetchQuery = createFetchQuery(query, { limit: 10 });

    //     const res = await fetchQuery({ id: "123" });

    //     expect(mockRequest).toHaveBeenCalledWith({
    //         query,
    //         variables: { limit: 10, id: "123" },
    //     });
    //     expect(res).toEqual({ data: { ok: true } });
    // });


    it("createAsyncGraphQLAction2 podporuje graphQLQuery jako funkci (lazy)", async () => {
        const mockRequest = vi.fn().mockResolvedValue({ data: {} });
        // vi.spyOn(gqlClientModule, "gqlClient", "get").mockReturnValue({
        //     request: mockRequest,
        // });
        const gqlClient = { request: mockRequest };


        const query = "query Lazy { me { id } }";
        const queryFn = vi.fn(() => query);

        const AsyncAction = createAsyncGraphQLAction2(queryFn, {}); // params = {}

        const dispatch = vi.fn();
        const getState = vi.fn();

        const thunk = AsyncAction({}, gqlClient); // vars
        await thunk(dispatch, getState);

        expect(queryFn).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledWith({
            query,
            variables: {},
        });
    });


    it("createAsyncGraphQLAction2 vyhodí chybu, když middleware není funkce", () => {
        const badMiddleware = 123;

        expect(() =>
            createAsyncGraphQLAction2("query {}", {}, badMiddleware)
        ).toThrow(/Middleware at index 0 is not a function/);
    });


    // it("AsyncAction při chybě v middleware dispatchne ASYNC_GRAPHQL_ACTION_GENERAL_ERROR a chybu rethrowne", async () => {
    //     const mockRequest = vi.fn().mockResolvedValue({ data: { foo: "bar" } });
    //     vi.spyOn(gqlClientModule, "gqlClient", "get").mockReturnValue({
    //         request: mockRequest,
    //     });

    //     const failingMiddleware = () => async () => {
    //         throw new Error("Middleware exploded");
    //     };

    //     const AsyncAction = createAsyncGraphQLAction2("query {}", {}, failingMiddleware);

    //     const dispatch = vi.fn();
    //     const getState = vi.fn();

    //     const thunk = AsyncAction({});

    //     await expect(thunk(dispatch, getState)).rejects.toThrow("Middleware exploded");

    //     expect(dispatch).toHaveBeenCalledWith({
    //         type: "ASYNC_GRAPHQL_ACTION_GENERAL_ERROR",
    //         payload: "Middleware exploded",
    //     });
    // });


    it("updateItemsFromGraphQLResult - pokud dataRoot není objekt (např. null), nic ne-normalizuje a jen zavolá next", async () => {
        const dispatch = vi.fn();
        const getState = vi.fn();
        const next = vi.fn((x) => x);

        const result = null; // nebo 42

        const mw = updateItemsFromGraphQLResult(result);
        const out = await mw(dispatch, getState, next);

        expect(dispatch).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(result);
        expect(out).toBe(result);
    });

});
