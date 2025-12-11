import { describe, it, expect, vi, beforeEach } from "vitest";

// // 1) Auto-mock celého modulu ./gqlFetch
// vi.mock("./gqlFetch");

vi.mock("./gqlFetch", async () => {
    const actual = await vi.importActual("./gqlFetch");
    return {
        ...actual,
        fetchGraphQL: vi.fn(), // tohle budeme ovládat v testech
    };
});

// 2) Až po vi.mock importujeme testované věci
import { createGraphQLClient } from "./gqlClient2";
import { fetchGraphQL, GraphQLResponseError } from "./gqlFetch";
import { error } from "happy-dom/lib/PropertySymbol";

// Pomocný alias, aby měl Vitest typově vědomý mock
const mockFetchGraphQL = /** @type {vi.Mock} */ (fetchGraphQL);

describe("createGraphQLClient", () => {
    beforeEach(() => {
        mockFetchGraphQL.mockReset();
    });

    it("request: volá fetchGraphQL s endpointem a sloučenými hlavičkami a vrací response", async () => {
        const client = createGraphQLClient({
            endpoint: "/test-gql",
            getHeaders: () => ({ "X-Extra": "2" }),
        });

        const fakeResponse = { data: { hello: "world" } };
        mockFetchGraphQL.mockResolvedValueOnce(fakeResponse);

        const result = await client.request(
            { query: "query Test { hello }", variables: { id: 123 } },
            { headers: { "X-Init": "1" } }
        );

        expect(mockFetchGraphQL).toHaveBeenCalledTimes(1);
        expect(mockFetchGraphQL).toHaveBeenCalledWith(
            "/test-gql",
            { query: "query Test { hello }", variables: { id: 123 } },
            expect.objectContaining({
                headers: {
                    "X-Init": "1",
                    "X-Extra": "2",
                },
            })
        );
        expect(result).toBe(fakeResponse);
    });

    it("request: při GraphQL errors zavolá onGraphQLErrors a vyhodí GraphQLResponseError (mock)", async () => {
        const onGraphQLErrors = vi.fn();
        const client = createGraphQLClient({
            endpoint: "/test-gql",
            onGraphQLErrors,
        });

        const errors = [{ message: "Boom" }];
        const fakeResponse = { errors };
        mockFetchGraphQL.mockResolvedValueOnce(fakeResponse);

        let caught;
        try {
            await client.request({ query: "query Broken { boom }" });
        } catch (err) {
            caught = err;
        }

        expect(onGraphQLErrors).toHaveBeenCalledTimes(1);
        expect(onGraphQLErrors).toHaveBeenCalledWith(errors, fakeResponse);

        expect(caught).toBeTruthy();
        expect(caught.response).toBe(fakeResponse);
        // expect(caught.name).toBe("GraphQLResponseError");
        // expect(caught.errors).toBe(errors);

    });

    it("query: zabalí argumenty do { query, variables } a použije request", async () => {
        const client = createGraphQLClient({ endpoint: "/test-gql" });

        const fakeResponse = { data: { me: { id: "1" } } };
        mockFetchGraphQL.mockResolvedValueOnce(fakeResponse);

        const result = await client.query("query Me { me { id } }", { id: 1 });

        expect(mockFetchGraphQL).toHaveBeenCalledTimes(1);
        expect(mockFetchGraphQL).toHaveBeenCalledWith(
            "/test-gql",
            { query: "query Me { me { id } }", variables: { id: 1 } },
            expect.any(Object)
        );
        expect(result).toBe(fakeResponse);
    });

    it("mutate: zabalí argumenty do { query: mutation, variables } a použije request", async () => {
        const client = createGraphQLClient({ endpoint: "/test-gql" });

        const fakeResponse = { data: { updateUser: { id: "1" } } };
        mockFetchGraphQL.mockResolvedValueOnce(fakeResponse);

        const result = await client.mutate("mutation UpdateUser { ... }", { id: 1 });

        expect(mockFetchGraphQL).toHaveBeenCalledTimes(1);
        expect(mockFetchGraphQL).toHaveBeenCalledWith(
            "/test-gql",
            { query: "mutation UpdateUser { ... }", variables: { id: 1 } },
            expect.any(Object)
        );
        expect(result).toBe(fakeResponse);
    });

    it("introspect: první volání udělá request, další používají cache", async () => {
        const client = createGraphQLClient({ endpoint: "/test-gql" });

        const fakeIntrospection = { data: { __schema: { queryType: { name: "Query" } } } };
        mockFetchGraphQL.mockResolvedValueOnce(fakeIntrospection);

        const first = await client.introspect();
        const second = await client.introspect();

        expect(mockFetchGraphQL).toHaveBeenCalledTimes(1); // jen jednou – caching
        expect(first).toBe(fakeIntrospection);
        expect(second).toBe(fakeIntrospection);
    });

    it("sdl: první volání načte sdl a uloží do cache, další už fetchGraphQL nevolají", async () => {
        const client = createGraphQLClient({ endpoint: "/test-gql" });

        // pozor: podle tvé implementace:
        // const data = await request({ query: ... });
        // cachedSDL = data?._service?.sdl || null;
        // => tedy request vrací objekt s _service na top-levelu
        const fakeSDLResponse = { _service: { sdl: "SCHEMA_DEFINITION" } };
        mockFetchGraphQL.mockResolvedValueOnce(fakeSDLResponse);

        const first = await client.sdl();
        const second = await client.sdl();

        expect(mockFetchGraphQL).toHaveBeenCalledTimes(1);
        expect(first).toBe("SCHEMA_DEFINITION");
        expect(second).toBe("SCHEMA_DEFINITION");
    });


    it("request při GraphQL errors ale bez onGraphQLErrors prostě jen vyhodí GraphQLResponseError", async () => {
        const client = createGraphQLClient({ endpoint: "/test" });

        const errors = [{ message: "Boom" }];
        mockFetchGraphQL.mockResolvedValueOnce({ errors });

        await expect(
            client.request({ query: "query X { boom }" })
        ).rejects.toBeInstanceOf(GraphQLResponseError);
    });

    // it("sdl() kešuje výsledek a volá request jen jednou", async () => {
    //     const request = vi.fn()
    //         .mockResolvedValueOnce({ _service: { sdl: "type Query { hello: String }" }, errors: null});

    //     const client = (function () {
    //         // hack: vytvoříme client tak, abysme mu nahradili request
    //         const c = createGraphQLClient({ endpoint: "/test" });
    //         return { ...c, request }; // přepíšem request
    //     })();

    //     const first = await client.sdl();
    //     const second = await client.sdl();

    //     expect(first).toBe("type Query { hello: String }");
    //     expect(second).toBe("type Query { hello: String }");
    //     expect(request).toHaveBeenCalledTimes(1);
    // });

});
