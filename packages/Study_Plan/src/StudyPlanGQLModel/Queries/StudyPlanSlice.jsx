import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Zde je uložený celý studijní plán, který si na začátku jednou stáhnete z DB
    item: null, 
    isLoading: false,
    error: null,
};

const studyPlanSlice = createSlice({
    name: 'studyPlan',
    initialState,
    reducers: {
        // 1. Akce pro prvotní uložení staženého plánu z databáze do storu
        setStudyPlan: (state, action) => {
            state.item = action.payload;
        },

        // ── LOKÁLNÍ UPDATY PRO UČITELE ──
        addInstructorLocal: (state, action) => {
            const { lessonId, teacher } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson) {
                // Pokud pole ještě neexistuje, vytvoříme ho
                if (!lesson.instructors) lesson.instructors = [];
                // Díky Immer.js můžeme použít normální .push()
                lesson.instructors.push(teacher);
            }
        },
        removeInstructorLocal: (state, action) => {
            const { lessonId, teacherId } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson && lesson.instructors) {
                // Vyfiltrujeme učitele, jehož ID chceme smazat
                lesson.instructors = lesson.instructors.filter(inst => inst.id !== teacherId);
            }
        },

        // ── LOKÁLNÍ UPDATY PRO MÍSTNOSTI ──
        addFacilityLocal: (state, action) => {
            const { lessonId, facility } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson) {
                if (!lesson.facilities) lesson.facilities = [];
                lesson.facilities.push(facility);
            }
        },
        removeFacilityLocal: (state, action) => {
            const { lessonId, facilityId } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson && lesson.facilities) {
                lesson.facilities = lesson.facilities.filter(fac => fac.id !== facilityId);
            }
        },

        // ── LOKÁLNÍ UPDATY PRO SKUPINY ──
        addGroupLocal: (state, action) => {
            const { lessonId, group } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson) {
                if (!lesson.studyGroups) lesson.studyGroups = [];
                lesson.studyGroups.push(group);
            }
        },
        removeGroupLocal: (state, action) => {
            const { lessonId, groupId } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson && lesson.studyGroups) {
                lesson.studyGroups = lesson.studyGroups.filter(grp => grp.id !== groupId);
            }
        },

        // ── LOKÁLNÍ UPDATE PRO SMAZÁNÍ CELÉ LEKCE ──
        deleteLessonLocal: (state, action) => {
            const { lessonId } = action.payload;
            if (state.item && state.item.lessons) {
                // Prostě vyhodíme celou lekci z hlavního pole
                state.item.lessons = state.item.lessons.filter(l => l.id !== lessonId);
            }
        }
    }
});

// Exportujeme samotné akce, které pak voláme v komponentě přes dispatch()
export const { 
    setStudyPlan,
    addInstructorLocal, 
    removeInstructorLocal,
    addFacilityLocal,
    removeFacilityLocal,
    addGroupLocal,
    removeGroupLocal,
    deleteLessonLocal
} = studyPlanSlice.actions;

// Exportujeme reducer, který se musí zaregistrovat v hlavním store.js
export default studyPlanSlice.reducer;