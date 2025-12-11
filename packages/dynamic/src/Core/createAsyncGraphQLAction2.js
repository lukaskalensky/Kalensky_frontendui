import { updateItemsFromGraphQLResult } from "../Store/Middlewares/updateItemsFromGraphQLResult";
import { gqlClient } from "./gqlClient2";


// export const createFetchQuery = (graphQLQuery, defaultParams = {}) => {
//     return async (variables) => {
//         const mergedVars = { ...defaultParams, ...variables };
//         return gqlClient.request({ query: graphQLQuery, variables: mergedVars });
//     };
// };


export const createAsyncGraphQLAction2 = (graphQLQuery, params=updateItemsFromGraphQLResult, ...middlewares) => {
    
    if (typeof graphQLQuery === "function") {
        graphQLQuery = graphQLQuery()
    }

    // If `params` is a function, treat it as middleware
    if (typeof params === "function") {
        middlewares = [params, ...middlewares]; // Add `params` as middleware
        params = {}; // Reset params to an empty object
    }

    // Validate that all middlewares are functions
    middlewares.forEach((middleware, index) => {
        if (typeof middleware !== "function") {
            throw new Error(`createAsyncGraphQLAction: Middleware at index ${index} is not a function.`);
        }
    });   

    const AsyncAction = (vars, gqlClient) => async (dispatch, getState, next = (jsonResult) => jsonResult) => {

        if (!gqlClient || typeof gqlClient.request !== "function") {
            throw new Error(
                "createAsyncGraphQLAction2: missing GraphQL client (second argument AsyncAction(vars, client))"
            );
        }

        const jsonResult = await gqlClient.request({ query: graphQLQuery, variables: { ...params, ...vars } });
        // tady lze volat svoje middlewary / normalizaci
        // updateItemsFromGraphQLResult(data)(dispatch, getState, () => data)

        try {
            
            // Middleware chain
            const chain = middlewares.reduceRight(
                (nextMiddleware, middleware) => {
                    return async (result) => {
                        return middleware(result)(dispatch, getState, nextMiddleware);
                    };
                },
                next // Use the provided `next` as the base case
            );

            // Execute the chain
            return chain(jsonResult);
        } catch (error) {
            console.error("createAsyncGraphQLAction: Error during async action execution", error);
            // Dispatch a general error action
            dispatch({
                type: "ASYNC_GRAPHQL_ACTION_GENERAL_ERROR",
                payload: error.message,
            });
            throw error;
        }
        
    };

    return AsyncAction;
};
