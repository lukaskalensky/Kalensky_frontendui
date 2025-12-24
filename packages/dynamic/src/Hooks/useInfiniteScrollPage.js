import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useGQLClient } from "../Store";
import { useInfiniteScroll } from "./useInfiniteScroll";


/**
 * useInfiniteScrollPage
 *
 * Wrapper nad `useInfiniteScroll`, který bere `where` z URL query parametru (např. `?where=...`)
 * a při jeho změně provede `restart()` s novým filtrem.
 *
 * Typicky:
 * - URL se změní (FilterButton nastaví paramName)
 * - hook načte where z URL
 * - restartne stránkování (items = [])
 * - autoload/loadMore dotáhne první stránku
 *
 * @param {Object} args
 * @param {string} args.paramName - Název query parametru v URL, ze kterého se čte where (např. "where").
 * @param {Object} [args.actionParams] - Základní params pro thunk (skip/limit/orderBy/...), `where` bude přepsáno URL hodnotou.
 * @param {any} [args.props] - Zbytek jde přímo do `useInfiniteScroll` (asyncAction, preloadedItems, enabled, autoload, onAll, ...).
 *
 * @returns {{
 *   items: any[],
 *   loading: boolean,
 *   error: any,
 *   hasMore: boolean,
 *   filter: any,
 *   result: any,
 *   loadMore: () => Promise<any>,
 *   restart: (newActionParams?: any) => Promise<any>,
 *   sentinelRef: (node: any) => void
 * }}
 */
export const useInfiniteScrollPage = ({
    paramName = "where",
    actionParams = {},
    ...props
} = {}) => {
    const [sp] = useSearchParams();

    // Stabilní derivace where z URL
    const whereFromUrl = useMemo(() => {
        return safeParseWhere(sp, paramName);
        // pokud safeParseWhere interně čte sp.get(paramName),
        // je nejlepší dependency udělat přes string snapshot:
    }, [sp.toString(), paramName]);

    const infiniteScroll = useInfiniteScroll({
        ...props,
        actionParams: { ...actionParams, where: whereFromUrl },
    });

    // restart při změně where v URL (a případně i actionParams)
    useEffect(() => {
        if (props.enabled === false) return;

        const params = { ...actionParams, where: whereFromUrl };
        infiniteScroll.restart(params);
    }, [
        whereFromUrl,
        paramName, // volitelné, ale harmless
        props.enabled,
        actionParams,
        infiniteScroll.restart,
    ]);

    return infiniteScroll;
};