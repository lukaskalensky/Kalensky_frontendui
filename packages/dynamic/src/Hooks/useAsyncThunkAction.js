// useAsyncThunkAction.js
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectItemById } from "../Store/ItemSlice"; // uprav cestu
import { useGqlClient } from "../Store";

// jednoduchý shallowEqual pro porovnání vars
const shallowEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
        if (a[k] !== b[k]) return false;
    }
    return true;
};

/**
 * Hook pro Redux thunk async akce (např. z createAsyncGraphQLAction2).
 *
 * - AsyncAction: (vars) => thunk(dispatch, getState) => Promise<result>
 * - vars: počáteční parametry (např. {}, { id }, { id, filter... })
 *
 * Vrací:
 *  - loading
 *  - error
 *  - data          – návratová hodnota z thunk (výsledek chainu middlewarů)
 *  - entity        – pokud vars obsahuje id, vrátí item ze storu (ItemSlice)
 *  - run(override) – manuální spuštění fetchu s optional override vars
 *
 * Ochrana proti smyčkám:
 *  - `vars` si ukládá do interního stavu jen pokud se **shallow** změnilo
 *  - auto-fetch efekt závisí na stabilním `varsState`
 */
export const useAsyncThunkAction = (
    AsyncAction,
    vars,
    options = {}
) => {
    const { deferred = false, network = true } = options;
    const dispatch = useDispatch();
    const gqlClient = useGqlClient();

    // stabilizovaná verze vars (aby každé nové {} nebo {id} neznamenalo novou fetch smyčku)
    const [varsState, setVarsState] = useState(vars || {});

    useEffect(() => {
        const nextVars = vars || {};
        if (!shallowEqual(nextVars, varsState)) {
            setVarsState(nextVars);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vars]);

    // základní stav hooku
    const [state, setState] = useState({
        loading: !deferred && network,
        error: null,
        data: null,
    });

    // když ve varsState existuje id, přečteme entitu z ItemSlice
    const id = varsState && varsState.id;
    const entity = useSelector((rootState) => {
        const result = id != null ? selectItemById(rootState, id) : null
        console.log(id, rootState, result)
        return result
    }
        
    );

    const run = useCallback(
        (overrideVars) => {
            if (!network || !AsyncAction) {
                return Promise.resolve(null);
            }

            const mergedVars =
                overrideVars === undefined
                    ? varsState
                    : { ...(varsState || {}), ...overrideVars };

            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            return dispatch(AsyncAction(mergedVars, gqlClient))
                .then((result) => {
                    setState({
                        loading: false,
                        error: null,
                        data: result,
                    });
                    return result;
                })
                .catch((err) => {
                    setState({
                        loading: false,
                        error: err,
                        data: null,
                    });
                    throw err;
                });
        },
        [AsyncAction, dispatch, network, varsState]
    );

    // auto-fetch na mount / změnu varsState (ale ne při každém renderu díky shallowEqual)
    useEffect(() => {
        if (!deferred && network) {
            run();
        }
    }, [deferred, network, run]);

    return {
        loading: state.loading,
        error: state.error,
        data: state.data,
        entity, // item z ItemSlice, pokud máme id
        run,
    };
};
