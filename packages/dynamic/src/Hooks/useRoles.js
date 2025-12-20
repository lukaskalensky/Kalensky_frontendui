import { useMemo } from "react";

/**
 * Normalizace názvů rolí pro porovnávání.
 * - trim
 * - volitelně case-insensitive (zde zapnuto)
 */
const normalizeRoleName = (name) => {
    if (typeof name !== "string") return "";
    return name.trim().toLowerCase();
};

/**
 * Vrací true, pokud mají dvě kolekce alespoň jeden společný prvek.
 * Optimalizované přes Set (O(n+m)).
 *
 * @param {Iterable<string>} a
 * @param {Iterable<string>} b
 * @returns {boolean}
 */
export const hasIntersection = (a, b) => {
    if (!a || !b) return false;

    // vytvoř set z menší kolekce (mikro-optimalizace)
    const arrA = Array.isArray(a) ? a : Array.from(a);
    const arrB = Array.isArray(b) ? b : Array.from(b);

    const small = arrA.length <= arrB.length ? arrA : arrB;
    const large = arrA.length <= arrB.length ? arrB : arrA;

    const set = new Set(small);
    for (const x of large) {
        if (set.has(x)) return true;
    }
    return false;
};

/**
 * useRoles
 *
 * @param {Object} item
 * @param {string[]} oneOfRoles - role names, které povolují akci (stačí jedna)
 * @param {Object} [options]
 * @param {boolean} [options.caseInsensitive=true]
 * @returns {{ can: boolean, roleNames: string[] }}
 */
export const useRoles = (item = {}, oneOfRoles = [], options = {}) => {
    const { caseInsensitive = false } = options;

    const can = useMemo(() => {
        const currentUserRoles = item?.rbacobject?.currentUserRoles ?? [];
        if (!Array.isArray(currentUserRoles) || currentUserRoles.length === 0) return false;
        if (!Array.isArray(oneOfRoles) || oneOfRoles.length === 0) return false;

        const norm = (s) => {
            if (typeof s !== "string") return "";
            const t = s.trim();
            return caseInsensitive ? t.toLowerCase() : t;
        };

        // roleNames uživatele → Set
        const userSet = new Set(
            currentUserRoles
                .map((role) => role?.roletype?.name)
                .map(norm)
                .filter(Boolean)
        );

        // stačí najít jednu shodu
        for (const r of oneOfRoles) {
            if (userSet.has(norm(r))) return true;
        }
        return false;
    }, [item, oneOfRoles, caseInsensitive]);

    // volitelně můžeš vracet i normalizované roleNames (užitečné pro debug/UI)
    const roleNames = useMemo(() => {
        const currentUserRoles = item?.rbacobject?.currentUserRoles ?? [];
        if (!Array.isArray(currentUserRoles)) return [];
        const norm = (s) => {
            if (typeof s !== "string") return "";
            const t = s.trim();
            return caseInsensitive ? t.toLowerCase() : t;
        };
        return currentUserRoles
            .map((role) => role?.roletype?.name)
            .map(norm)
            .filter(Boolean);
    }, [item, caseInsensitive]);

    return { can, roleNames };
};
