// tests/utils/mockGqlClient.js
import { vi } from "vitest";

export const createMockGqlClient = (overrides = {}) => {
    const client = {
        endpoint: "/test-gql",
        // základní metody
        request: vi.fn(),

        // syntactic sugar metody – defaultně jen volají request
        query: vi.fn((query, variables = {}, options = {}) =>
            client.request({ query, variables }, options)
        ),

        mutate: vi.fn((mutation, variables = {}, options = {}) =>
            client.request({ query: mutation, variables }, options)
        ),

        introspect: vi.fn(() =>
            client.request({
                query: `
                    query IntrospectionQuery {
                        __schema { queryType { name } }
                    }
                `,
                variables: {},
            })
        ),

        sdl: vi.fn(() =>
            client.request({
                query: `
                    query __SchemaDefinition {
                        _service { sdl }
                    }
                `,
                variables: {},
            }).then((res) => res?._service?.sdl ?? null)
        ),

        // cokoliv chceš přepsat / přidat zvenku
        ...overrides,
    };

    return client;
};
