// Redux slice, který drží "živou" kopii aktuálně otevřeného studijního plánu.
// Existuje proto, že LessonRow (StudyPlanDetail.jsx) potřebuje po přidání/odebrání
// učitele/místnosti/skupiny nebo po smazání lekce hned aktualizovat UI, aniž by čekal
// na nové stažení celého plánu ze serveru (refetch) — místo toho se po úspěšné
// mutaci rovnou upraví tenhle stav přes dispatch(add/removeXLocal(...)).
// Jednotlivé reducery využívají Immer (zabudovaný v @reduxjs/toolkit), takže i když
// vypadají, že mutují `state` přímo (push, filter s přiřazením), ve skutečnosti se
// pod kapotou vytváří nový immutabilní stav.
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
        // Najde lekci podle id a přidá jí do pole instructors nového učitele
        // (voláno hned po úspěšné AddInstructorAsyncAction mutaci v LessonRow)
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
        // Odebere učitele z pole instructors dané lekce podle jeho id
        removeInstructorLocal: (state, action) => {
            const { lessonId, teacherId } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);

            if (lesson && lesson.instructors) {
                // Vyfiltrujeme učitele, jehož ID chceme smazat
                lesson.instructors = lesson.instructors.filter(inst => inst.id !== teacherId);
            }
        },

        // ── LOKÁLNÍ UPDATY PRO MÍSTNOSTI ──
        // Přidá místnost do pole facilities dané lekce (stejný vzor jako u učitelů)
        addFacilityLocal: (state, action) => {
            const { lessonId, facility } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson) {
                if (!lesson.facilities) lesson.facilities = [];
                lesson.facilities.push(facility);
            }
        },
        // Odebere místnost z pole facilities dané lekce podle jejího id
        removeFacilityLocal: (state, action) => {
            const { lessonId, facilityId } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);

            if (lesson && lesson.facilities) {
                lesson.facilities = lesson.facilities.filter(fac => fac.id !== facilityId);
            }
        },

        // ── LOKÁLNÍ UPDATY PRO SKUPINY ──
        // Přidá skupinu do pole studyGroups dané lekce (stejný vzor jako u učitelů/místností)
        addGroupLocal: (state, action) => {
            const { lessonId, group } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);
            
            if (lesson) {
                if (!lesson.studyGroups) lesson.studyGroups = [];
                lesson.studyGroups.push(group);
            }
        },
        // Odebere skupinu z pole studyGroups dané lekce podle jejího id
        removeGroupLocal: (state, action) => {
            const { lessonId, groupId } = action.payload;
            const lesson = state.item?.lessons?.find(l => l.id === lessonId);

            if (lesson && lesson.studyGroups) {
                lesson.studyGroups = lesson.studyGroups.filter(grp => grp.id !== groupId);
            }
        },

        // ── LOKÁLNÍ UPDATE PRO SMAZÁNÍ CELÉ LEKCE ──
        // Odstraní celou lekci z pole lessons v plánu podle jejího id
        deleteLessonLocal: (state, action) => {
            const { lessonId } = action.payload;
            if (state.item && state.item.lessons) {
                // Prostě vyhodíme celou lekci z hlavního pole
                state.item.lessons = state.item.lessons.filter(l => l.id !== lessonId);
            }
        },
        addLessonLocal: (state, action) => {
            const { lesson } = action.payload;
            
            if (state.item) {
                // Pokud pole lessons ještě neexistuje, vytvoříme ho
                if (!state.item.lessons) {
                    state.item.lessons = [];
                }
                // Přidáme novou lekci na konec pole
                state.item.lessons.push(lesson);
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
    deleteLessonLocal,
    addLessonLocal
} = studyPlanSlice.actions;

// Exportujeme reducer, který se musí zaregistrovat v hlavním store.js
export default studyPlanSlice.reducer;