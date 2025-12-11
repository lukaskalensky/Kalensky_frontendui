// updateItemsFromGraphQLResult.js
import { ItemActions } from "../ItemSlice";

/**
 * Rekurzivně vyhledá v JSON stromu všechny objekty s `id`
 * a vrátí je v poli. Při nálezu objektu s `id` **vyžaduje**
 * přítomnost `__typename` – jinak hodí chybu.
 *
 * @param {any} node
 * @param {Array<Object>} acc
 * @returns {Array<Object>}
 */
const collectEntities = (node, acc = []) => {
    if (!node || typeof node !== "object") {
        return acc;
    }

    if (Array.isArray(node)) {
        for (const item of node) {
            collectEntities(item, acc);
        }
        return acc;
    }

    // Objekt
    if (node.id != null) {
        if (!node.__typename) {
            // "assert" – fail fast, protože bez __typename se ti to rozbije všude jinde
            // (error boundary / log si uděláš podle sebe)
            // Můžeš změnit na `console.error` + return, pokud nechceš shazovat celý request.
            throw new Error(
                `GraphQL entity with id='${node.id}' is missing __typename. ` +
                `Add __typename to your query/fragment, otherwise normalizace nebude fungovat.`
            );
        }
        acc.push(node);
    }

    for (const value of Object.values(node)) {
        collectEntities(value, acc);
    }

    return acc;
};

/**
 * Z GraphQL response (raw {data, errors} nebo přímo { ...data }) vytáhne
 * všechny entitní objekty (s `id` a `__typename`) a:
 *  - pro každý `dispatch(ItemActions.item_add(entity))`
 *  - předá původní `result` dál do chainu
 *
 * Použití:
 *   createAsyncGraphQLAction2(queryStr, updateItemsFromGraphQLResult)
 *
 * @param {any} result - GraphQL výsledek (buď { data, errors } nebo jen { ...data })
 * @returns {(dispatch: Function, getState: Function, next: Function) => Promise<any>}
 */
export const updateItemsFromGraphQLResult = (result) => async (
    dispatch,
    getState,
    next
) => {
    // Podporujeme jak raw {data, errors}, tak případ, kdy client vrací jen data.
    const dataRoot =
        result && typeof result === "object" && "data" in result && result.data != null
            ? result.data
            : result;

    if (dataRoot && typeof dataRoot === "object") {
        let entities = [];
        try {
            entities = collectEntities(dataRoot, []);
        } catch (err) {
            // Tady máš tvrdý assert na __typename – můžeš případně logovat nebo dispatchnout error akci
            console.error("updateItemsFromGraphQLResult: normalization failed", err);
            // Volitelně:
            // dispatch({ type: "ITEMS_NORMALIZATION_ERROR", payload: String(err) });
            throw err;
        }

        // Normalizace do ItemSlice – každá entita jde přes item_add (upsert)
        for (const entity of entities) {
            dispatch(ItemActions.item_add(entity));
        }
    }

    // Předáme výsledek dál v chainu (např. do dalšího middleware nebo volajícího)
    return next(result);
};
