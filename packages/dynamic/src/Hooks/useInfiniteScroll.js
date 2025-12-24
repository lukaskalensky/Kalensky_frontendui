import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useGQLClient } from "../Store";

const mergeArraysById = (array1 = [], array2 = []) => {
    const mergedMap = new Map();
    array1.forEach((item) => item?.id != null && mergedMap.set(item.id, item));
    array2.forEach((item) => item?.id != null && mergedMap.set(item.id, item));
    return Array.from(mergedMap.values());
};

const defaultCalculateNewFilter = (oldfilter) => {
    const newFilter = ({
        ...oldfilter,
        skip: (oldfilter.skip || 0) + (oldfilter.limit || 10),
        limit: oldfilter.limit || 10,
    });
    console.log("newFilter", newFilter)
    return newFilter
}

const extractArrayFromThunkResult = (thunkResult) => {
    // očekáváš { data: { something: [...] } } nebo podobně
    const root = thunkResult?.data ? thunkResult.data : thunkResult;
    const values = root ? Object.values(root) : [];

    // 1) přímo první hodnota
    let candidate = values?.[0];
    if (Array.isArray(candidate)) return candidate;

    // 2) najdi první pole uvnitř
    candidate = values.find((v) => Array.isArray(v));
    if (Array.isArray(candidate)) return candidate;

    // 3) fallback
    return [];
};

const isVisibleInViewport = (node) => {
    if (!node) return false;
    const r = node.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
};

const dummy = () => null;
/**
 * useInfiniteScroll
 *
 * @param {Object} args
 * @param {Array<Object>} [args.preloadedItems]
 * @param {Object} args.actionParams  - { skip, limit, ... }
 * @param {(params:any)=>any} args.asyncAction - redux thunk (dispatch(asyncAction(params)))
 * @param {(oldFilter:any)=>any} [args.calculateNewFilter]
 * @param {number} [args.reset] - změna hodnoty provede reset stránkování (např. filtr změněn)
 * @param {()=>void} [args.onAll] - zavolá se, když už není co načítat
 * @param {boolean} [args.enabled] - možnost scroll vypnout
 */
export const useInfiniteScroll = ({
    preloadedItems,
    actionParams,
    asyncAction,
    calculateNewFilter = defaultCalculateNewFilter,
    reset = 0,
    onAll = dummy,
    enabled = true,
    autoload = true,
} = {}) => {
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

    const initialFilter = useMemo(() => ({ ...(actionParams || {}) }), [actionParams]);

    const [state, setState] = useState(() => ({
        filter: initialFilter,
        loading: false,
        hasMore: true,
        error: null,
        items: preloadedItems,
        result: null,
    }));

    const runIdRef = useRef(0);

    const inFlightRef = useRef(false);
    // refs pro stabilní přístup v async kódu
    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    const filterRef = useRef(initialFilter);
    useEffect(() => { filterRef.current = state.filter; }, [state.filter]);

    const enabledRef = useRef(enabled);
    useEffect(() => { enabledRef.current = enabled; }, [enabled]);

    // preloaded items update
    useEffect(() => {
        setState((prev) => ({ ...prev, items: preloadedItems }));
    }, [preloadedItems]);

    // reset
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            filter: { ...(actionParams || {}) },
            loading: false,
            hasMore: true,
            error: null,
            // dle potřeby: items: []
            // items: prev.items,
            items: []
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset]);

    const loadMore = useCallback(async () => {
        if (!enabledRef.current) return null;
        if (inFlightRef.current) return null;
        inFlightRef.current = true;

        const myRunId = runIdRef.current;

        try {
            const snap = stateRef.current;
            if (snap.loading || !snap.hasMore) return null;

            setState((prev) => ({ ...prev, loading: true, error: null }));

            const params = filterRef.current;
            const result = await dispatch(asyncAction(params, gqlClient));
            const fetched = extractArrayFromThunkResult(result);

            // ✅ pokud mezitím proběhl restart, tento výsledek ignoruj
            if (runIdRef.current !== myRunId) return null;

            setState((prev) => {
                const nextItems = mergeArraysById(prev.items, fetched);

                const fetchedCount = fetched.length;

                // limit ber z aktuálního requestu (params), nebo z prev.filter jako fallback
                const limit =
                    (params && params.limit != null ? params.limit : undefined) ??
                    (prev.filter && prev.filter.limit != null ? prev.filter.limit : undefined);

                // "má to ještě další stránku?"
                const hasMore =
                    limit == null ? fetchedCount > 0 : fetchedCount === limit;

                if (!hasMore) onAll();

                // ✅ tady konečně používáme calculateNewFilter
                const nextFilter = hasMore
                    ? (() => {
                        // kompatibilita: calculateNewFilter(oldFilter) i calculateNewFilter(oldFilter, ctx)
                        const ctx = { fetched, fetchedCount, limit, params, result };
                        const nf =
                            calculateNewFilter.length >= 2
                                ? calculateNewFilter(prev.filter, ctx)
                                : calculateNewFilter(prev.filter);

                        // bezpečný fallback, kdyby vrátil null/undefined
                        return nf ?? prev.filter;
                    })()
                    : prev.filter;

                filterRef.current = nextFilter;

                return {
                    ...prev,
                    items: nextItems,
                    filter: nextFilter,
                    hasMore,
                    loading: false,
                    result,
                };
            });

            return result;
        } catch (e) {
            // i error ignoruj, když to není aktuální běh
            if (runIdRef.current === myRunId) {
                setState((prev) => ({ ...prev, loading: false, hasMore: false, error: e }));
            }
            return null;
        } finally {
            inFlightRef.current = false;
        }
    }, [dispatch, asyncAction, gqlClient, onAll, calculateNewFilter]);

    const restart = useCallback(async (newActionParams = {}) => {
        // nový "běh" => zneplatní rozpracované výsledky
        runIdRef.current += 1;

        // odemkni případný in-flight lock, ať může hned startovat
        inFlightRef.current = false;

        const nextFilter = { ...(newActionParams || {}) };

        // hned aktualizuj ref, aby první loadMore použil nový filter
        filterRef.current = nextFilter;

        // reset state + items []
        setState((prev) => ({
            ...prev,
            filter: nextFilter,
            loading: false,
            hasMore: true,
            error: null,
            items: [],
            result: null,
        }));

        // nech React propsat state/refs do UI a pak načti první stránku
        await new Promise((r) => requestAnimationFrame(r));

        // první stránka (skip typicky 0)
        return loadMore();
    }, [loadMore]);

    // sentinel node
    const sentinelNodeRef = useRef(null);
    const sentinelRef = useCallback((node) => {
        sentinelNodeRef.current = node;
    }, []);

    // IO + robustní "prefill", když je sentinel už vidět
    useEffect(() => {
        const node = sentinelNodeRef.current;
        if (!enabled || !node) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && enabledRef.current) {
                loadMore();
            }
        });

        observer.observe(node);

        let cancelled = false;

        const prefill = async () => {
            if (!autoload) return;

            // nech doběhnout layout
            await new Promise((r) => requestAnimationFrame(r));
            await new Promise((r) => setTimeout(r, 0));

            // pokud je sentinel už vidět, načítej dokud se neodsune mimo viewport nebo není hasMore
            while (!cancelled && enabledRef.current) {
                const s = stateRef.current;
                if (s.loading || !s.hasMore) break;

                if (!isVisibleInViewport(node)) break;

                await loadMore();

                // render tick
                await new Promise((r) => requestAnimationFrame(r));
            }
        };

        prefill();

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [enabled, autoload, loadMore, reset]);

    return {
        items: state.items,
        loading: state.loading,
        error: state.error,
        hasMore: state.hasMore,
        filter: state.filter,
        result: state.result,

        loadMore,
        restart,
        sentinelRef,
    };
};