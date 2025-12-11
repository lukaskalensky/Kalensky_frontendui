import { fetchGraphQL, GraphQLResponseError } from "./gqlFetch";

/**
 * @typedef {Object} GraphQLClientOptions
 * @property {string} endpoint - URL GraphQL endpointu.
 * @property {() => Record<string,string> | Promise<Record<string,string>>} [getHeaders]
 * @property {(errors: any[], response: any) => void} [onGraphQLErrors]
 */

const introspectionQuery = `
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      description
      kind
      fields {
        name
        description
        args {
          name
          description
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
        type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
      inputFields {
        name
        description
        type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
      possibleTypes {
        name
        kind
      }
    }
  }
}
`;


export function createGraphQLClient(options) {
    const {
        endpoint,
        getHeaders,
        onGraphQLErrors,
    } = options;

    /**
     * Základní request metoda – všechno přes ni.
     *
     * @param {GraphQLRequest} request
     * @param {RequestInit} [init]
     */
    const request = async (request, init = {}) => {
        const extraHeaders = getHeaders ? await getHeaders() : {};
        const res = await fetchGraphQL(endpoint, request, {
            ...init,
            headers: {
                ...(init.headers || {}),
                ...extraHeaders,
            },
        });

        if (res?.errors && res.errors.length) {
            if (onGraphQLErrors) {
                onGraphQLErrors(res.errors, res);
            }
            throw new GraphQLResponseError(
                "GraphQL returned errors",
                res.errors,
                res
            );
        }

        return res;
    };

    const query = (query, variables, init) =>
        request({ query, variables }, init);

    const mutate = (mutation, variables, init) =>
        request({ query: mutation, variables }, init);

    // případný introspection helper apod.
    let cachedIntrospection = null;
    const introspect = async () => {
        if (!cachedIntrospection) {
            cachedIntrospection = await request({ query: introspectionQuery });
        }
        return cachedIntrospection;
    };

    let cachedSDL = null;
    const sdl = async () => {
        if (!cachedSDL) {
            const data = await request({
                query: `query __ApolloGetServiceDefinition__ { _service { sdl } }`,
            });
            cachedSDL = data?._service?.sdl || null;
        }
        return cachedSDL;
    };

    return {
        request,
        query,
        mutate,
        introspect,
        sdl
    };
}


export const gqlClient = createGraphQLClient({ endpoint: "/api/gql" });