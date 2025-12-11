/**
 * Helper: vrátí "data root" z GraphQL výsledku.
 * Podporuje jak raw { data, errors }, tak přímo { ...data }.
 *
 * @param {any} result - GraphQL výsledek z klienta / serveru
 * @returns {any} dataRoot - typicky objekt s fieldy query
 */
const getDataRoot = (result) =>
    result &&
    typeof result === "object" &&
    "data" in result &&
    result.data != null
        ? result.data
        : result;

/**
 * Helper: z dataRoot vytáhne jednu entitu.
 *
 * - pokud je `fieldName` zadané a existuje v dataRoot → vrátí dataRoot[fieldName]
 * - jinak vezme první hodnotu z Object.values(dataRoot)
 *
 * @param {any} dataRoot - kořenová část GraphQL dat (typicky objekt)
 * @param {string} [fieldName] - volitelný název fieldu, který chceme vybrat
 * @returns {any|null} - vybraná entita nebo null
 */
const resolveEntity = (dataRoot, fieldName) => {
    if (!dataRoot || typeof dataRoot !== "object") return null;

    if (fieldName && fieldName in dataRoot) {
        return dataRoot[fieldName];
    }

    const values = Object.values(dataRoot);
    return values.length > 0 ? values[0] : null;
};

/**
 * Middleware pro redukci GraphQL výsledku na "jednu entitu".
 *
 * Má dva režimy použití:
 *
 * 1) Bez parametru (stejné chování jako původní verze):
 *
 *    ```js
 *    createAsyncGraphQLAction2(query, reduceToFirstEntity);
 *    ```
 *
 *    → vezme `dataRoot` (result.data nebo result) a vrátí jeho první hodnotu:
 *       `Object.values(dataRoot)[0]`.
 *
 * 2) S názvem fieldu:
 *
 *    ```js
 *    createAsyncGraphQLAction2(query, reduceToFirstEntity("me"));
 *    createAsyncGraphQLAction2(query, reduceToFirstEntity("templateById"));
 *    ```
 *
 *    → vezme `dataRoot[fieldName]`, pokud existuje,
 *      jinak fallback na první hodnotu z `Object.values(dataRoot)`.
 *
 * Signatura middleware (pro použití v createAsyncGraphQLAction2):
 *  - buď: (result) => async (dispatch, getState, next) => any
 *  - nebo: reduceToFirstEntity(fieldName) vrací funkci (result) => async ...
 *
 * @param {string|object} [arg] - buď název fieldu (např. "me"), nebo přímo GraphQL result
 * @returns {Function} Middleware v očekávaném tvaru:
 *   - pokud je `arg` string → (result) => async (dispatch, getState, next) => any
 *   - pokud je `arg` objekt (GraphQL result) → async (dispatch, getState, next) => any
 */
export const reduceToFirstEntity = (arg) => {
    // Režim 1: reduceToFirstEntity("me") → vrací middleware factory
    if (typeof arg === "string") {
        const fieldName = arg;
        return (result) => async (dispatch, getState, next) => {
            const dataRoot = getDataRoot(result);
            const entity = resolveEntity(dataRoot, fieldName);
            return next(entity);
        };
    }

    // Režim 2: původní tvar: (result) => async (...) => ...
    const result = arg;
    return async (dispatch, getState, next) => {
        const dataRoot = getDataRoot(result);
        const entity = resolveEntity(dataRoot);
        return next(entity);
    };
};
