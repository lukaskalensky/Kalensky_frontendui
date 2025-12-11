import { describe, it, expect, vi } from "vitest";
import { reduceToFirstEntity } from "./reduceToFirstEntity";

const createCtx = () => {
    const dispatch = vi.fn();
    const getState = vi.fn(() => ({}));
    const next = vi.fn((x) => x);
    return { dispatch, getState, next };
};

const id1 = "832bd904-de58-432b-aaf4-6dff721fd9e5"
const id2 = "2732984b-0206-4063-8e8a-e81d00a2289a"

describe("reduceToFirstEntity", () => {
    it("bez argumentu - vezme první hodnotu z dataRoot", async () => {
        const result = { data: { me: { id: id1 }, other: { id: id2 } } };
        const middleware = reduceToFirstEntity(result); // režim 2 (původní)

        const { dispatch, getState, next } = createCtx();
        const out = await middleware(dispatch, getState, next);

        expect(next).toHaveBeenCalledWith({ id: id1 }); // me
        expect(out).toEqual({ id: id1 });
    });

    it("s fieldName  vezme konkrétní field", async () => {
        const result = { data: { me: { id: id1 }, other: { id: id2 } } };
        const middlewareFactory = reduceToFirstEntity("other");
        const middleware = middlewareFactory(result);

        const { dispatch, getState, next } = createCtx();
        const out = await middleware(dispatch, getState, next);

        expect(next).toHaveBeenCalledWith({ id: id2 });
        expect(out).toEqual({ id: id2 });
    });
});
