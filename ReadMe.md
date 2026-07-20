# StudyPlan — příběh vývoje (deníček)

Tento dokument popisuje vývoj aplikace **app_studyplan** (balíček `packages/Study_Plan`) v rámci monorepa `Kalensky_frontendui`, postavené nad generickým frontendovým frameworkem `_template` (GQLModel pattern, GraphQL, React, Vite). Deníček je řazen chronologicky podle commitů, počínaje **1.4.2026**. U každého commitu je uvedený problém, který jsme řešili, co jsme při tom objevili, a jak jsme to nakonec vyřešili. Čistě mechanické commity (sladění verzí, lockfile, drobné texty) jsou uvedené jen datem a názvem, bez rozpisu — nešlo u nich o žádný problém k řešení.

## Zadání / problémy k vyřešení

Na začátku období existoval obecný `_template` balíček (generické GQLModel stránky pro libovolnou GraphQL entitu) a bylo potřeba nad ním postavit konkrétní doménu — správu **studijních plánů** (StudyPlan). Rozpadli jsme si to na tyto dílčí problémy:

1. Založit novou aplikaci `app_studyplan` nad `_template` frameworkem a rozchodit v ní první tabulkový výpis dat.
2. Zprovoznit publikaci balíčků na npm pod vlastním scope.
3. Postavit UI pro **vyhledávání a přiřazování** učitelů, místností a skupin k lekcím studijního plánu.
4. Umožnit **vytváření a mazání** studijních plánů, témat a lekcí (CRUD nad entitami, které v šabloně dosud neexistovaly).
5. Ošetřit **destruktivní akce** tak, aby nešlo o data přijít omylem.
6. Rozšířit přiřazování z výběru **jedné entity** na **výběr více entit najednou**.
7. Vytvořit dedikovaný formulář pro založení **nového studijního plánu** včetně šablony lekcí.
8. Doplnit **JSDoc dokumentaci** do komponent.
9. Průběžně **uklízet appku** od částí, které se v praxi přestaly používat.

## Časová posloupnost commitů

### Fáze 1 — Založení app_studyplan (1.4. – 23.4.2026)

- `1.4.` zmena — drobná oprava v `packages/Projekt/index.html` (mimo Study_Plan, mechanický commit)

**`5.4.` uceni_zprovozneni_tabulky**
- Problém: potřebovali jsme založit appku `app_studyplan` nad `_template` frameworkem a zprovoznit první zobrazení dat.
- Co jsme objevili: kostru šlo zkopírovat z existující appky (`index.html`, `App.jsx`, routing, eslint konfigurace) a přepsat na naši entitu, místo psaní od nuly.
- Jak jsme to vyřešili: vznikla appka se základním nastavením (`AppRouter.jsx`, `AppNavbar.jsx`, `package.json`) a prvním tabulkovým výpisem studijních plánů.

**`7.4.` hodina**
- Problém: tabulka zobrazovala jen základní pole, chyběl detailnější náhled lekce.
- Co jsme objevili: stačilo rozšířit existující `MediumContent.jsx`, ne psát komponentu znovu.
- Jak jsme to vyřešili: `MediumContent.jsx` doplněn o zobrazení detailu lekce.

**`8.4.` opravy**
- Problém: cesty k položkám (`Link.jsx`) a čtecí GraphQL akce neodpovídaly skutečné struktuře dat.
- Co jsme objevili: chyby byly v drobnostech — špatně sestavené URI a nesprávně mapovaná pole v odpovědi z GraphQL.
- Jak jsme to vyřešili: opraveny cesty a čtecí akce (`ReadAsyncAction.jsx`).

**`9.4.` vlastni_page**
- Problém: obecná šablonová stránka nestačila na to, co jsme chtěli s daty dělat.
- Co jsme objevili: `_template` umožňuje snadno přidat vlastní stránku vedle generických a napojit ji do routingu.
- Jak jsme to vyřešili: založena vlastní stránka `muj_pokus_page.jsx` a komponenta `muj_pokus_componenta.jsx`.

- `10.4.` zmena — rozšíření vlastní stránky a komponenty (přímé pokračování předchozího commitu, mechanický)

**`13.4.` aktualizace**
- Problém: potřebovali jsme jednu centrální komponentu pro detail studijního plánu, ne rozdrobené kusy na víc místech.
- Co jsme objevili: přepisem `muj_pokus_componenta` a `muj_pokus_page` vznikl prostor pro samostatnou komponentu detailu.
- Jak jsme to vyřešili: založen `StudyPlanDetail.jsx` — dnes hlavní soubor celé appky.

- `23.4.` zmena — založení appky `app_semestr` a routing v `app_granting` (mimo Study_Plan, mechanický commit)

### Fáze 2 — Příprava na publikaci balíčku (29.4.2026)

- `29.4.` version update for app — zvýšení verze appky (mechanický commit)

**`29.4.` name edit for npmjs username access**
- Problém: publikace balíčku na npm pod scoped jménem `@lukaskalensky/app_studyplan` selhávala.
- Co jsme objevili: npm scope musí **přesně** odpovídat reálnému uživatelskému jménu na npmjs.com — včetně tečky.
- Jak jsme to vyřešili: scope přejmenován na `@lukas.kalensky`, publikace prošla.

- `29.4.` prepared version for next version — příprava verze pro další release (mechanický commit)

### Fáze 3 — Vyhledávání a přiřazování entit (4.5. – 13.5.2026)

- `4.5.` řada commitů (zmena ×6 + merge) — sladění verze balíčku, závislostí a `package-lock.json` po sloučení větví; po mergi se rozešly verze závislostí a bylo potřeba je ručně srovnat, dokud instalace neprošla čistě (mechanické, bez samostatného problému k řešení)

**`6.5.` EntitylookUp**
- Problém: potřebovali jsme autocomplete vyhledávání učitelů, které `_template` neměl pro naši doménu.
- Co jsme objevili: generický `EntityLookup` z `_template` šlo použít, stačilo mu dodat vlastní vyhledávací GraphQL akci.
- Jak jsme to vyřešili: vznikla komponenta `MujEntitylookup.jsx` a akce `SearchAsyncAction.jsx`.

**`11.5.` update_komponeta**
- Problém: mutace pro úpravu (`Update.jsx`) neodpovídala tomu, co komponenta reálně posílala.
- Co jsme objevili: drobná neshoda v posílaných datech mezi formulářem a mutací.
- Jak jsme to vyřešili: opravena mutace `Update.jsx` a navazující komponenta.

**`12.5.` vizualizace**
- Problém: appka neměla žádnou navigaci mezi obecnými seznamy (programy, studenti, studijní plány) a chybělo vyhledávání i pro skupiny a místnosti, ne jen pro učitele.
- Co jsme objevili: stejný vzor jako u učitelů (`EntityLookup` + vlastní `SearchAsyncAction`) šel zopakovat i pro další entity.
- Jak jsme to vyřešili: přidána horní navigační lišta s rozbalovacími nabídkami (Programy/Studenti/Požadavky) a nové vyhledávací akce `SearchGroupAsyncAction`/`SearchRoomAsyncAction`. *(Poznámka: tuhle lištu jsme o pár měsíců později, 20.7., zase odstranili — viz Fáze 9, appka se nakonec používá jinak.)*

**`12.5.` Pokusy**
- Problém: vybraná entita z vyhledávání se musela nějak dostat až ke konkrétní lekci, bez zbytečného protahování přes komponenty.
- Co jsme objevili: React Context řeší sdílení vybrané entity mnohem čistěji než posílání přes props přes víc úrovní.
- Jak jsme to vyřešili: založen `SelectionContext.jsx` a první přiřazovací akce `AddInstructor.jsx`.

**`13.5.` publish**
- Problém: publikace balíčku přes CI padala.
- Co jsme objevili: CI workflow (`single-publish.yml`) měl špatně nastavený krok.
- Jak jsme to vyřešili: opraven CI workflow.

- `13.5.` zmena ×2 + zmena_u_tabule — rozšíření `StudyPlanDetail.jsx` a drobná úprava tabulky v `muj_pokus_componenta` (pokračování předchozích commitů, mechanické)

### Fáze 4 — Přiřazování skupin/místností, mazání, první publikace (27.5. – 1.6.2026)

**`27.5.` úpravy behem pauzy**
- Problém: přiřazování fungovalo jen pro učitele, chyběly skupiny a místnosti.
- Co jsme objevili: stejný vzor (GraphQL akce + widget), jaký fungoval pro učitele, šel zopakovat i pro skupiny a místnosti.
- Jak jsme to vyřešili: přidány akce `AddGroup`, `AddRoom`, `LessonType`.

**`27.5.` Upravy**
- Problém: entity šlo jen přidávat, ne odebrat, když se přiřazení udělalo omylem.
- Co jsme objevili: potřebný je symetrický protějšek ke každé přidávací akci.
- Jak jsme to vyřešili: přidány mazací akce `DeleteGroup`, `DeleteLesson`, `DeleteRoom`, `DeleteTeacher`.

**`28.5.` zobrazeni_plan_lekci_tema**
- Problém: u tématu nebylo vidět, kolik lekcí už reálně existuje oproti tomu, kolik jich má podle plánu být.
- Co jsme objevili: dalo se to spočítat porovnáním dvou polí z GraphQL odpovědi — naplánovaných (`topic.lessons`) a reálně vytvořených lekcí.
- Jak jsme to vyřešili: přidán badge u tématu, např. „8/10 přednáška“.

**`1.6.` publikace**
- Problém: appka potřebovala první ostrou publikaci na npm po delší době vývoje.
- Co jsme objevili: zvýšení verze balíčku bez odpovídající aktualizace `package-lock.json` ve stejném commitu způsobí, že instalace v jiném prostředí hlásí nesoulad verzí a spadne.
- Jak jsme to vyřešili: verze zvýšena, o pár minut později (commit `publikace_oprava`) doplněna oprava `package-lock.json`.

### Fáze 5 — CRUD studijního plánu, ochrana proti omylům (9.6. – 11.6.2026)

**`9.6.` vytvoreni_a_smazani_studijniho_planu**
- Problém: generický formulář používal defaultní název mutace (`roleTypeInsert`/`roleTypeDelete`), který neodpovídal backendu pro entitu StudyPlan — appka se tvářila funkčně, ale request na server padal.
- Co jsme objevili: šablona odvozuje název mutace jen podle konvence; u konkrétní entity je potřeba ho ručně zkontrolovat a přepsat.
- Jak jsme to vyřešili: mutace přejmenovány na `studyPlanInsert`/`studyPlanDelete`, přidána tlačítka Vytvořit/Smazat plán.

**`9.6.` hlasi_to_chybu**
- Problém: appka nehlásila chyby srozumitelně a stav plánu nebyl nikde centrálně držený, takže se lokální změny (přiřazení, mazání) špatně promítaly do zobrazení.
- Co jsme objevili: stav plánu je potřeba přesunout do Reduxu, aby se lokální úpravy zobrazily okamžitě, bez čekání na refetch dat ze serveru.
- Jak jsme to vyřešili: založen `StudyPlanSlice.jsx` a `StudyPlanDetail.jsx` nad ním přepsán.

**`10.6.` seznam_predvidanych_ucitelu**
- Problém: nebylo souhrnně vidět, kteří učitelé jsou na plán už přiřazení, napříč všemi lekcemi.
- Co jsme objevili: dalo se to spočítat agregací z existujícího pole `lessons`, bez další GraphQL query navíc.
- Jak jsme to vyřešili: přidána komponenta `ExpectedTeachers`.

**`10.6.` prevence_miss_click_potvrzovaci_dialogy**
- Problém: mazání lekcí a přiřazení nemělo žádné potvrzení — jeden omylem kliknutý křížek smazal data bez varování.
- Co jsme objevili: stačí jedna znovupoužitelná komponenta bez vlastního stavu, napojená na všechny čtyři destruktivní akce.
- Jak jsme to vyřešili: přidán `ConfirmModal` před každou destruktivní akci.

- `11.6.` readme — aktualizace ReadMe.md (mechanický commit)

### Fáze 6 — Obtížný bug ve vytváření témat (23.6.2026)

- `23.6.` Upravy, Upravy_z_minula, Zmeny — postupné drobné úpravy `DeleteAsyncAction`/`InsertAsyncAction` a zjednodušení `StudyPlanDetail.jsx` během ladění (viz další commit)

**`23.6.` Opravit CREATE!!!!**
- Problém: založení nového tématu v rámci studijního plánu dlouhodobě nefungovalo — název commitu se třemi vykřičníky odráží, kolik pokusů to stálo.
- Co jsme objevili: chyba nebyla tam, kde jsme ji nejdřív hledali (v cestě k ID vráceném z mutace), ale v tom, že `MediumEditableContent` neuměl rozlišit editaci existující položky od zakládání nové.
- Jak jsme to vyřešili: `Create.jsx` přepsán, přidána samostatná akce `CreateTopic.jsx` oddělená od obecné `InsertAsyncAction`, s explicitním create-módem místo odvozování ze stavu formuláře.

### Fáze 7 — Výběr více entit najednou (30.6.2026)

**`30.6.` Vice_studentu_viceuceben...**
- Problém: šlo přiřadit vždy jen jednoho učitele/místnost/skupinu najednou, zadání znělo přiřadit jich víc jedním kliknutím.
- Co jsme objevili: backendové GraphQL API nemá dávkovou (batch) mutaci pro přiřazování — existují jen mutace pro jedno ID najednou.
- Jak jsme to vyřešili: `SelectionContext` rozšířen z jedné entity na pole (`selectedTeachers/Rooms/Groups`) s `addUnique`/`removeById`; přiřazení se odešle smyčkou s `try/catch` pro každou položku zvlášť, aby selhání jedné nezablokovalo zbytek.

### Fáze 8 — Vytváření nového plánu, šablony lekcí a JSDoc (7.7. – 16.7.2026)

**`7.7.` zmena (Create.jsx, CreateStudyPlan.jsx)**
- Problém: založení plánu šlo jen přes obecný formulář se surovými poli (ID semestru, ID zkoušky), bez návaznosti na témata a lekce.
- Co jsme objevili: bylo potřeba dedikovaný formulář, který založí plán i jeho témata a lekce najednou, ne obecný formulář odvozený ze šablony.
- Jak jsme to vyřešili: vznikla komponenta `CreateStudyPlan.jsx`, `Create.jsx` zjednodušen.

**`8.7.` zmena (LessonsTemplate.jsx)**
- Problém: nový plán vznikal bez lekcí — musely by se zakládat ručně jedna po druhé.
- Co jsme objevili: lekce šlo předvyplnit podle šablony místo ručního zadávání každé zvlášť.
- Jak jsme to vyřešili: přidána akce `LessonsTemplate.jsx`, `CreateStudyPlan.jsx` umí lekce rovnou předvyplnit.

**`16.7.` komentare_konecne_snad_vsechny**
- Problém: po týdnech bylo těžké se vrátit do rozsáhlého `StudyPlanDetail.jsx`, protože nikde nebylo napsané, proč jsme se rozhodli tak, jak jsme se rozhodli.
- Co jsme objevili: dokumentovat zpětně po týdnech trvá výrazně déle, než psát komentáře průběžně u každého commitu.
- Jak jsme to vyřešili: doplněn JSDoc do `AppNavbar`, `AppRouter`, `Link`, `MediumEditableContent`, `StudyPlanDetail`, mutací (`Create`/`Update`/`Delete`) a GraphQL akcí v `Queries/`.

**`16.7.` upraveny_linky**
- Problém: odkazy na některé entity (`Link.jsx`) vedly na špatné nebo neúplné cesty.
- Co jsme objevili: chyba byla v sestavování URI pro konkrétní typy entit.
- Jak jsme to vyřešili: opraveny cesty v `Link.jsx` a navazující použití v `StudyPlanDetail.jsx`.

- `16.7.` publikace ×2 — zvýšení verze balíčků po dokončení fáze (mechanické commity)

### Fáze 9 — Úklid horní navigace (20.7.2026)

**`20.7.` odstraneni_horniho panelu**
- Problém: appka měla od 12.5. horní lištu s odkazy na obecné seznamy (programy, studenti, semestry, témata), ale reálně se používá jen přes detail konkrétního studijního plánu.
- Co jsme objevili: na tyhle odkazy nikde jinde v appce nevedla žádná jiná cesta, takže šlo lištu i s příslušným routingem smazat bez ztráty funkčnosti.
- Jak jsme to vyřešili: smazán `AppNavbar.jsx` a zjednodušen `AppRouter.jsx` — čistý úbytek 83 řádků kódu.

## Shrnutí — co jsme vyřešili

- Založení aplikace `app_studyplan` nad generickým `_template` frameworkem.
- Publikaci balíčku `@lukas.kalensky/app_studyplan` na npm.
- Vyhledávání a přiřazování učitelů/místností/skupin k lekcím přes `EntityLookup` a `SelectionContext`.
- Kompletní CRUD nad studijním plánem, tématy a lekcemi (vytváření, editace, mazání).
- Ochranu proti nechtěnému smazání dat pomocí potvrzovacích dialogů.
- Výběr a hromadné přiřazení více entit najednou.
- Dedikovaný formulář pro založení nového studijního plánu se šablonou lekcí.
- JSDoc dokumentaci napříč komponentami a GraphQL akcemi balíčku `Study_Plan`.
- Úklid appky od nepoužívané horní navigace, když appka reálně žije z detailu plánu.

---

# Jak spustit konkrétní app

```cmd
npm run dev -w @hrbolek/app_dynamic
```

# Jak sestavit konkrétní app

```cmd
npm run build -w @hrbolek/app_dynamic
```
