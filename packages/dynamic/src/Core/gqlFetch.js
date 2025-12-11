// gqlFetch.js
export class GraphQLHttpError extends Error {
    constructor(message, response, body) {
        super(message);
        this.name = "GraphQLHttpError";
        this.response = response;
        this.body = body;
    }
}

export class GraphQLResponseError extends Error {
    constructor(message, errors, response) {
        super(message);
        this.name = "GraphQLResponseError";
        this.errors = errors;  // GraphQL errors pole
        this.response = response;
    }
}

/**
 * Nejnižší vrstva – jen fetch na GraphQL endpoint.
 *
 * @param {string} endpoint
 * @param {GraphQLRequest} request
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function fetchGraphQL(endpoint, request, options = {}) {
    const { query, variables={}, operationName } = request;
    const { headers: userHeaders, ...restOptions } = options;
    const payload = {
        method: "POST",
        body: JSON.stringify({
            query,
            variables,
            // operationName,
        }),
        signal: options.signal,
        credentials: options.credentials ?? "include",
        headers: {
            "Content-Type": "application/json",
            ...(userHeaders  || {}),
        },
        ...restOptions
    }
    // console.log("payload", payload)
    // console.log("options", options)
    const res = await fetch(endpoint, payload);

    let json;
    try {
        json = await res.json();
    } catch (e) {
        throw new GraphQLResponseError(
            `GraphQL endpoint returned non-JSON response (${res.status})`,
            res,
            null
        );
    }

    if (!res.ok) {
        // HTTP-level error (500, 404...)
        throw new GraphQLHttpError(
            `GraphQL HTTP error: ${res.status}`,
            res,
            json
        );
    }

    // Vracíme raw, ale pokud chceš, můžeš už tady vynášet errors výš
    return /** @type {GraphQLResponse<any>} */ (json);
}