/**
 * Higher-order helper pro injektování UI sady do komponent.
 *
 * Použití:
 *   const ui = inheritUI();
 *   const MediumCardWithUI = withUI(ui)(MediumCard);
 *
 * Vzniklá komponenta dostane prop `UI` automaticky (spolu s ostatními props).
 *
 * @template UISet
 * @template P
 * @param {UISet} UI - Objekt reprezentující aktuální sadu UI komponent.
 * @returns {(Component: (props: P & { UI: UISet }) => any) => (props: P) => any}
 *   Funkce, která vezme komponentu a vrátí novou, s automaticky přidaným `UI` propem.
 */
export const withUI =
    (UI) =>
    (Component) =>
    (props) =>
        Component({ UI, ...props });

/**
 * Varianta HOC, která „uzamkne“ UI na konkrétní sadu.
 *
 * Ignoruje případný `UI` prop zvenku a vždy do komponenty předá `_UI`.
 * Vhodné, pokud nechceš, aby parent mohl přepsat UI set uvnitř.
 *
 * @template UISet
 * @template P
 * @param {UISet} _UI - „Zamčená“ UI sada, která se má používat uvnitř komponenty.
 * @returns {(Component: (props: P & { UI: UISet }) => any) => (props: P & { UI?: any }) => any}
 */
export const withLockedUI =
    (_UI) =>
    (Component) =>
    ({ UI, ...props }) =>
        Component({ UI: _UI, ...props });

/**
 * Základní komponenta pro zobrazení "medium" obsahu.
 * Využívá položku `item` a snaží se zobrazit nějaký rozumný identifikátor.
 *
 * @param {{ UI?: any, item?: { fullname?: string, name?: string, id?: string }, children?: any }} props
 */
const MediumContent = ({ UI, item, children }) =>
    f`dummy ${item?.fullname || item?.name || item?.id}`;

/**
 * Jednoduchý „obal“ pro kartu. Zobrazuje titulek a vnitřní obsah (children).
 *
 * @param {{ UI?: any, item?: any, title?: string, children?: any }} props
 */
const CardCapsule = ({ UI, item, title, children }) => (
    <div>
        {title ? title : "title"}
        <div>{children}</div>
    </div>
);

/**
 * Střední varianta karty, složená z CardCapsule a MediumContent.
 * Obě přicházejí z UI sady (UI.CardCapsule, UI.MediumContent), takže je lze
 * snadno přepsat v potomcích přes inheritUI.
 *
 * @param {{ UI: any, item?: any, title?: string, children?: any }} props
 */
const MediumCard = ({ UI, item, title, children }) => (
    <UI.CardCapsule item={item} title={title}>
        <UI.MediumContent item={item} />
        {children}
    </UI.CardCapsule>
);

/**
 * Výchozí (dummy) UI sada – funguje jako základní implementace,
 * od které se může dědit pomocí inheritUI.
 */
const DummyUISet = {
    /** @type {(props: any) => any} */
    Link: MediumContent,
    /** @type {(props: any) => any} */
    CardCapsule: CardCapsule,
    /** @type {(props: any) => any} */
    MediumCard: MediumCard,
    /** @type {(props: any) => any} */
    LargeCard: MediumCard,
    /** @type {(props: any) => any} */
    MediumContent: MediumContent,
    /** @type {(props: any) => any} */
    MediumEditableContent: MediumContent,
    /** @type {(props: any) => any} */
    Page: MediumCard,
};

/**
 * „Přebinduje“ daný UI spec tak, aby všechny komponenty automaticky
 * dostávaly `UI` prop = celý `spec` objekt.
 *
 * Tzn. výsledné `ui.MediumCard` se volá jako běžná komponenta, ale uvnitř
 * se jí předá { UI: spec, ...props }.
 *
 * @template UISet
 * @param {UISet & {
 *   Link: Function,
 *   CardCapsule: Function,
 *   MediumCard: Function,
 *   LargeCard: Function,
 *   MediumContent: Function,
 *   MediumEditableContent: Function,
 *   Page: Function
 * }} spec
 * @returns {{ 
 *   Link: Function,
 *   CardCapsule: Function,
 *   MediumCard: Function,
 *   LargeCard: Function,
 *   MediumContent: Function,
 *   MediumEditableContent: Function,
 *   Page: Function
 * }}
 */
const bindUISet = (spec) => ({
    Link: withUI(spec)(spec.Link),
    CardCapsule: withUI(spec)(spec.CardCapsule),
    MediumCard: withUI(spec)(spec.MediumCard),
    LargeCard: withUI(spec)(spec.LargeCard),
    MediumContent: withUI(spec)(spec.MediumContent),
    MediumEditableContent: withUI(spec)(spec.MediumEditableContent),
    Page: withUI(spec)(spec.Page),
});

/**
 * Vytvoří novou UI sadu děděním z `parent` a přepsáním specifikovaných částí v `child`.
 *
 * Logika:
 *  - vezme `parent` (defaultně DummyUISet)
 *  - přepíše ho hodnotami z `child`
 *  - výsledný objekt projene přes `bindUISet`, takže všechny komponenty
 *    dostanou automaticky `UI` = celý sloučený set.
 *
 * Typické použití:
 *   const AdminUI = inheritUI({
 *     MediumCard: CustomAdminMediumCard,
 *   });
 *
 * @template ParentUI
 * @template ChildUI
 * @param {Partial<ParentUI & ChildUI>} [child={}] - Přepsané/rozšiřující komponenty.
 * @param {ParentUI} [parent=DummyUISet] - Výchozí UI sada, od které se dědí.
 * @returns {any} - Nová UI sada s navázaným `UI` (vhodná k přímému použití v komponentách).
 */
export const inheritUI = (child = {}, parent = DummyUISet) => {
    const ui = { ...parent, ...child };
    return bindUISet(ui);
};
