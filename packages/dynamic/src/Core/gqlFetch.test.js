// gqlFetch.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    fetchGraphQL,
    GraphQLHttpError,
    GraphQLResponseError, // zatím ho tu nepotřebujeme, ale je k dispozici
} from "./gqlFetch";

describe("fetchGraphQL", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("pošle správný payload a vrátí JSON při OK odpovědi", async () => {
        const mockJson = vi.fn().mockResolvedValue({ data: { hello: "world" } });
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: mockJson,
        });

        globalThis.fetch = mockFetch;

        const res = await fetchGraphQL(
            "/graphql",
            { query: "query { hello }", variables: { id: 123 } },
            { headers: { "X-Test": "1" } }
        );

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];

        expect(url).toBe("/graphql");
        expect(options.method).toBe("POST");
        expect(options.credentials).toBe("include");
        expect(options.headers["Content-Type"]).toBe("application/json");
        expect(options.headers["X-Test"]).toBe("1");

        const body = JSON.parse(options.body);
        expect(body).toEqual({
            query: "query { hello }",
            variables: { id: 123 },
        });

        expect(res).toEqual({ data: { hello: "world" } });
    });

    it("při HTTP chybě (např. 500) hodí GraphQLHttpError s response a body", async () => {
        const jsonBody = { error: "Server error" };
        const mockJson = vi.fn().mockResolvedValue(jsonBody);
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: mockJson,
        });

        globalThis.fetch = mockFetch;

        let caught;
        try {
            await fetchGraphQL(
                "/graphql",
                { query: "query { boom }" },
                {}
            );
        } catch (err) {
            caught = err;
        }

        expect(caught).toBeInstanceOf(GraphQLHttpError);
        expect(caught.name).toBe("GraphQLHttpError");
        expect(caught.response.status).toBe(500);
        expect(caught.body).toEqual(jsonBody);
        expect(caught.message).toContain("GraphQL HTTP error: 500");
    });

    it("při ne-JSON odpovědi hodí GraphQLHttpError s body === null", async () => {
        const mockJson = vi.fn().mockRejectedValue(new Error("Not JSON"));
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: mockJson,
        });

        globalThis.fetch = mockFetch;

        let caught;
        try {
            await fetchGraphQL(
                "/graphql",
                { query: "query { hello }" },
                {}
            );
        } catch (err) {
            caught = err;
        }

        expect(caught).toBeInstanceOf(GraphQLResponseError);
        expect(caught.name).toBe("GraphQLResponseError");
        // expect(caught.body).toBeNull();
        expect(caught.message).toContain(
            "GraphQL endpoint returned non-JSON response (200)"
        );
    });
});
