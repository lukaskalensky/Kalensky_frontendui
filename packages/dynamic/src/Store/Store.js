import { configureStore } from "@reduxjs/toolkit";
import { ItemReducer } from "./ItemSlice"; // uprav cestu podle sebe
import studyPlanReducer from "../../../Study_Plan/src/StudyPlanGQLModel/Queries/StudyPlanSlice.jsx";
/**
 * Funkce pro vytvoření store (super pro testy/SSR)
 */
export const createAppStore = (preloadedState) =>
    configureStore({
        reducer: {
            items: ItemReducer,
            // sem můžeš přidávat další slicy: auth, ui, ...
            studyPlan: studyPlanReducer
        },
        preloadedState,
    });

/**
 * Defaultní singleton store pro klientskou appku
 */
export const store = createAppStore();
