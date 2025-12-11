import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ItemReducer, ItemActions } from "../Store/ItemSlice";
import { useAsyncThunkAction } from "./useAsyncThunkAction";

const id1 = "832bd904-de58-432b-aaf4-6dff721fd9e5"

// 1) testovací async akce – jednoduchý thunk
// simuluje createAsyncGraphQLAction2 bez middlewarů
const createTestAsyncAction = () => {
    const AsyncAction = (vars) => async (dispatch, getState) => {
        // jako by proběhl fetch...
        const entity = { id: vars.id ?? id1, __typename: "Test", name: "Alice" };

        // uložíme do ItemSlice
        dispatch(ItemActions.item_add(entity));

        // a vrátíme výsledek
        return entity;
    };
    return AsyncAction;
};

const TestComponent = ({ id }) => {
    const AsyncAction = React.useMemo(() => createTestAsyncAction(), []);
    const { loading, error, data, entity } = useAsyncThunkAction(
        AsyncAction,
        id ? { id } : {}
    );

    return (
        <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="error">{error ? "ERR" : ""}</div>
            <div data-testid="data">{data ? data.name : ""}</div>
            <div data-testid="entity">{entity ? entity.name : ""}</div>
        </div>
    );
};

describe("useAsyncThunkAction", () => {
    const renderWithStore = (ui, { preloadedState } = {}) => {
        const store = configureStore({
            reducer: { items: ItemReducer },
            preloadedState,
        });

        return render(<Provider store={store}>{ui}</Provider>);
    };

    it("načte data a uloží entity do storu, entity vrátí podle id", async () => {
        renderWithStore(<TestComponent id="123" />);

        // počáteční loading true
        expect(screen.getByTestId("loading").textContent).toBe("true");

        // po doběhnutí thunk
        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("false");
        });

        // data z thunk
        expect(screen.getByTestId("data").textContent).toBe("Alice");
        // entity z ItemSlice selectItemById (id = 123)
        expect(screen.getByTestId("entity").textContent).toBe("Alice");
    });
});
