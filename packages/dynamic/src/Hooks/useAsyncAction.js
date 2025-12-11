// useAsyncAction.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @typedef UseAsyncActionOptions
 * @property {boolean} [deferred=false] - když true, automaticky se nespustí na mount
 * @property {boolean} [network=true] - když false, hook nic nevolá
 */

/**
 * Obecný hook pro libovolnou async akci:
 *  - asyncFn: (vars) => Promise<result>
 *  - initialVars: počáteční parametry (můžou být i null/undefined)
 *
 * Vrací:
 *  - data    – poslední úspěšný výsledek
 *  - error   – poslední chyba
 *  - loading – probíhá volání
 *  - run     – spustí akci s volitelnými novými parametry
 *  - read    – Suspense-friendly reader (sync, může thrownout Promise/Error)
 */
export const useAsyncAction = (
    asyncFn,
    initialVars,
    options /** @type {UseAsyncActionOptions} */ = {}
) => {
    const { deferred = false, network = true } = options;

    const varsRef = useRef(initialVars);
    const promiseRef = useRef(null);

    const [state, setState] = useState({
        loading: !deferred,
        error: null,
        data: null,
    });

    // kdyby se initialVars měnily zvenku
    useEffect(() => {
        varsRef.current = initialVars;
    }, [initialVars]);

    const run = useCallback(
        (overrideVars) => {
            if (!network || !asyncFn) {
                return Promise.resolve(null);
            }

            const mergedVars =
                overrideVars === undefined
                    ? varsRef.current
                    : { ...(varsRef.current || {}), ...overrideVars };

            varsRef.current = mergedVars;

            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            const p = (async () => {
                try {
                    const result = await asyncFn(mergedVars);
                    console.log("useAsync", result)
                    setState({ loading: false, error: null, data: result });
                    return result;
                } catch (err) {
                    setState({ loading: false, error: err, data: null });
                    throw err;
                } finally {
                    promiseRef.current = null;
                }
            })();

            promiseRef.current = p;
            return p;
        },
        [network]
    );

    // auto-run na mount, pokud není deferred
    useEffect(() => {
        if (!deferred && network) {
            run();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deferred, network, run]);

    // Suspense-friendly reader
    const read = useCallback(
        (overrideVars) => {
            if (state.error) {
                throw state.error;
            }

            if (state.data !== null && state.data !== undefined) {
                return state.data;
            }

            if (!promiseRef.current) {
                run(overrideVars);
            }

            throw promiseRef.current;
        },
        [state.data, state.error, run]
    );

    return {
        loading: state.loading,
        error: state.error,
        data: state.data,
        run,
        read,
    };
};
