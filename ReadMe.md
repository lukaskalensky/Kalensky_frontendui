# StudyPlan — příběh vývoje (deníček)

Tento dokument popisuje vývoj aplikace **app_studyplan** (balíček `packages/Study_Plan`) v rámci monorepa `Kalensky_frontendui`, postavené nad generickým frontendovým frameworkem `_template` (GQLModel pattern, GraphQL, React, Vite). Deníček je řazen chronologicky podle commitů, počínaje **1.4.2026**.

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

## Časová posloupnost commitů

### Fáze 1 — Založení app_studyplan (1.4. – 23.4.2026)
- `1.4.` **zmena** — drobná oprava v `packages/Projekt/index.html`
- `5.4.` **uceni_zprovozneni_tabulky** — založení aplikace `app_studyplan` (eslint config, `index.html`, `package.json`, `App.jsx`) — první rozchozený tabulkový výpis dat
- `7.4.` **hodina** — rozšíření `MediumContent.jsx` o zobrazení lekce
- `8.4.` **opravy** — opravy cest (`jsconfig.json`) a čtecí GraphQL akce (`ReadAsyncAction.jsx`)
- `9.4.` **vlastni_page** — založení vlastní stránky `muj_pokus_page.jsx` a komponenty `muj_pokus_componenta.jsx`, registrace v `RouterSegment`
- `10.4.` **zmena** — rozšíření vlastní stránky a komponenty
- `13.4.` **aktualizace** — vznik `StudyPlanDetail.jsx`, přepis `muj_pokus_componenta` a `muj_pokus_page`
- `23.4.` **zmena** — založení aplikace `app_semestr` + routing v `app_granting`

**Problém:** rozchodit nad `_template` frameworkem novou samostatnou aplikaci a první vlastní stránku, aniž bychom zasahovali do jádra šablony.
**Co jsme objevili:** novou appku i vlastní stránku šlo postavit zkopírováním existující kostry (`index.html`, `App.jsx`, `RouterSegment`) a postupným nahrazováním obsahu — `_template` framework je navržený tak, aby se dal takto znovupoužívat.

### Fáze 2 — Příprava na publikaci balíčku (29.4.2026)
- `29.4.` **prepared version for next version** — příprava verze pro další release
- `29.4.` **version update for app** — zvýšení verze `app_studyplan` + aktualizace `package-lock.json`
- `29.4.` **name edit for npmjs username access** — přejmenování npm scope `@lukaskalensky/app_studyplan` → `@lukas.kalensky/app_studyplan`

**Problém:** publikace balíčku na npm pod scoped jménem selhávala.
**Co jsme objevili:** npm scope musí **přesně** odpovídat reálnému uživatelskému jménu na npmjs.com (včetně tečky), jinak registry publikaci odmítne.
**Vyřešeno:** přejmenováním scope na `@lukas.kalensky` publikace prošla.

### Fáze 3 — Vyhledávání a přiřazování entit (4.5. – 13.5.2026)
- `4.5.` **zmena** (a merge) — řada drobných commitů se sladěním verze balíčku, závislostí a `package-lock.json`
- `6.5.` **EntitylookUp** — nová komponenta `MujEntitylookup.jsx` (autocomplete vyhledávání) + `SearchAsyncAction.jsx`
- `11.5.` **update_komponeta** — oprava mutace `Update.jsx` a `muj_pokus_componenta`
- `12.5.` **vizualizace** — navbar s dropdowny Programy/Studenti/Požadavky, přepis `StudyPlanDetail.jsx`, nové `SearchGroupAsyncAction`/`SearchRoomAsyncAction`
- `12.5.` **doplneni readme** — doplnění ReadMe.md
- `12.5.` **Pokusy** — zaveden `SelectionContext.jsx`, nová akce `AddInstructor.jsx` — přiřazení učitele k lekci
- `13.5.` **publish** — oprava CI workflow pro publikaci (`single-publish.yml`)
- `13.5.` **zmena** — rozšíření `StudyPlanDetail`, úprava verze balíčku a lockfilu
- `13.5.` **zmena_u_tabule** — drobná úprava tabulky v `muj_pokus_componenta`

**Problém:** potřebovali jsme UI pro přiřazování učitelů/místností/skupin k lekcím a vyhledávací komponentu, pro kterou v šabloně nebyl vzor.
**Co jsme objevili:** generický `EntityLookup` z `_template` šlo rozšířit o vlastní vyhledávací GraphQL akci (`SearchAsyncAction`) a vybranou entitu sdílet napříč komponentami přes `SelectionContext` — nemuseli jsme stav protahovat props přes celý strom komponent.
**Vyřešeno:** funkční vyhledávání a přiřazování učitele k lekci.

### Fáze 4 — Přiřazování skupin/místností, mazání, první publikace (27.5. – 1.6.2026)
- `27.5.` **úpravy behem pauzy** — nové GQL akce `AddGroup`/`AddRoom`/`LessonType` — přiřazení skupiny a místnosti k lekci
- `27.5.` **Upravy** — nové GQL akce `DeleteGroup`/`DeleteLesson`/`DeleteRoom`/`DeleteTeacher` — mazání lekcí a přiřazení
- `28.5.` **zobrazeni_plan_lekcí_téma** — badge počtu lekcí u tématu (`8/10 přednáška`), query rozšířena o `topic.lessons { count type }`
- `28.5.` **aktualizace readme** — aktualizace ReadMe.md
- `1.6.` **publikace** — zvýšení verze `app_studyplan` (publikace)
- `1.6.` **publikace_oprava** — oprava `package-lock.json` po publikaci

**Problém:** první ostrá publikace balíčku na npm selhala kvůli neaktuálnímu `package-lock.json`.
**Co jsme objevili:** při zvýšení verze balíčku je nutné zaktualizovat i lockfile ve stejném commitu, jinak workspace instalace hlásí nesoulad verzí.
**Vyřešeno:** opravným commitem publikace_oprava hned následující den.

### Fáze 5 — CRUD studijního plánu, ochrana proti omylům (9.6. – 11.6.2026)
- `9.6.` **hlasi_to_chybu** — refaktoring `StudyPlanDetail.jsx`, nový `StudyPlanSlice.jsx` (stavové akce pro plán)
- `9.6.` **vytvoreni_a_smazani_studijniho_planu** — oprava mutací `roleTypeInsert`→`studyPlanInsert`, `roleTypeDelete`→`studyPlanDelete`, tlačítka Vytvořit/Smazat plán
- `10.6.` **seznam_predvidanych_ucitelu** — komponenta `ExpectedTeachers` (agregace předpokládaných učitelů z lekcí)
- `10.6.` **prevence_miss_click_potvrzovaci_dialogy** — komponenta `ConfirmModal`, potvrzovací dialog pro 4 destruktivní akce
- `11.6.` **readme** — aktualizace ReadMe.md

**Problém:** generický `_template` formulář pro vytváření entit používal defaultní název mutace odvozený od typu (`roleTypeInsert`/`roleTypeDelete`), který pro `StudyPlan` neodpovídal skutečnému GraphQL schématu — vytváření/mazání plánu tak vracelo chybu.
**Co jsme objevili:** při odvozování nové entity ze šablony nestačí zkopírovat komponenty — název mutace se musí ručně přepsat pro každou entitu zvlášť, jinak se aplikace tváří funkčně, ale backend request padá. Při ručním testování jsme také zjistili, že mazání lekcí/přiřazení nemělo žádné potvrzení — jediný omylem kliknutý křížek smazal data bez varování.
**Vyřešeno:** opravou názvů mutací na `studyPlanInsert`/`studyPlanDelete` a přidáním `ConfirmModal` před každou destruktivní akci.

### Fáze 6 — Obtížný bug ve vytváření témat (23.6.2026)
- `23.6.` **Upravy** — drobné opravy `DeleteAsyncAction`/`InsertAsyncAction`
- `23.6.` **Upravy_z_minula** — zjednodušení `StudyPlanDetail.jsx`
- `23.6.` **Zmeny** — rozšíření `DeleteAsyncAction`/`InsertAsyncAction`
- `23.6.` **Opravit CREATE!!!!** — rozsáhlá oprava `MediumEditableContent.jsx`, `Create.jsx`, nová akce `CreateTopic.jsx`, úprava `muj_pokus_page.jsx`

**Problém, který se dlouho nedařilo vyřešit:** formulář pro vytvoření nového tématu (topic) v rámci studijního plánu dlouhodobě nefungoval — název commitu se třemi vykřičníky odráží, kolik pokusů to stálo. Vytvářecí mutace neposílala správná data a `MediumEditableContent` nerozlišoval mezi editací existující položky a zakládáním nové.
**Jak byl vyřešen:** commit Opravit CREATE!!!! přepsal `Create.jsx` a přidal samostatnou akci `CreateTopic.jsx`, oddělenou od obecné `InsertAsyncAction`, a `MediumEditableContent` dostal explicitní create-mód namísto odvozování ze stavu formuláře.

### Fáze 7 — Výběr více entit najednou (30.6.2026)
- `30.6.` **Vice_studentu_viceuceben...** — rozšíření `SelectionContext` na pole vybraných entit, badge chipy v `muj_pokus_componenta` a `StudyPlanDetail`

**Zadání:** umožnit vybrat víc učitelů/místností/skupin najednou a přiřadit je jedním kliknutím, ne po jednom jako dřív.
**Problém:** backendové GraphQL API nemá dávkovou (batch) mutaci pro přiřazování — existují jen `studyPlanLessonAddInstructor/AddFacility/AddGroup` pro jedno ID najednou.
**Jak jsme to řešili:** `SelectionContext` byl rozšířen z jedné entity na pole (`selectedTeachers/Rooms/Groups`) s `addUnique`/`removeById` helpery, vybrané entity se zobrazují jako odebiratelné badge chipy a při odeslání se projde smyčka s `try/catch` pro každou položku zvlášť, aby selhání jedné nezablokovalo zbytek.
**Vyřešeno:** z pohledu uživatele jde o hromadné přidání jedním klikem.

### Fáze 8 — Vytváření nového plánu, šablony lekcí a JSDoc (7.7. – 16.7.2026)
- `7.7.` **zmena** — přepis mutace `Create.jsx` (zjednodušení), úpravy `MediumEditableContent`/`StudyPlanDetail`
- `7.7.` merge s `origin/monorepo`
- `7.7.` **zmena** — nová komponenta `CreateStudyPlan.jsx` — dedikovaný formulář pro založení nového studijního plánu
- `7.7.` **zmena** — rozšíření `StudyPlanDetail`
- `8.7.` **zmena** — rozšíření `CreateStudyPlan`, `StudyPlanDetail`, `StudyPlanSlice`
- `8.7.` **zmena** — nová GQL akce `LessonsTemplate.jsx` — předvyplnění lekcí podle šablony
- `8.7.` **zmena** — zjednodušení `StudyPlanDetail.jsx`
- `8.7.` **zmena** — doplnění `CreateStudyPlan.jsx`
- `16.7.` **komentare_konecne_snad_vsechny** — JSDoc komentáře napříč `AppNavbar`, `AppRouter`, `Link`, `MediumEditableContent`, `StudyPlanDetail`, `muj_pokus_componenta`, mutacemi (`Create`/`Update`/`Delete`) a všemi GraphQL akcemi v `Queries/`

**Problém:** založení nového studijního plánu šlo dosud jen přes obecný formulář se surovými poli (`semesterId`, `examId`) bez návaznosti na existující lekce/témata.
**Co jsme objevili:** dokud komponenty neměly JSDoc, bylo těžké se v rozsáhlém `StudyPlanDetail.jsx` po týdnech vrátit k vlastnímu kódu — doplnění komentářů zpětně zabralo výrazně víc času, než kdyby vznikaly průběžně u každého commitu.
**Vyřešeno:** vznikl dedikovaný `CreateStudyPlan.jsx` s možností předvyplnit lekce přes `LessonsTemplate`, a balíček `Study_Plan` dostal JSDoc dokumentaci ve všech klíčových komponentách a GraphQL akcích.

## Shrnutí — co jsme vyřešili

- Založení aplikace `app_studyplan` nad generickým `_template` frameworkem.
- Publikaci balíčku `@lukas.kalensky/app_studyplan` na npm.
- Vyhledávání a přiřazování učitelů/místností/skupin k lekcím přes `EntityLookup` a `SelectionContext`.
- Kompletní CRUD nad studijním plánem, tématy a lekcemi (vytváření, editace, mazání).
- Ochranu proti nechtěnému smazání dat pomocí potvrzovacích dialogů.
- Výběr a hromadné přiřazení více entit najednou.
- Dedikovaný formulář pro založení nového studijního plánu se šablonou lekcí.
- JSDoc dokumentaci napříč komponentami a GraphQL akcemi balíčku `Study_Plan`.

---

# Jak spustit konkrétní app

```cmd
npm run dev -w @hrbolek/app_dynamic
```

# Jak sestavit konkrétní app

```cmd
npm run build -w @hrbolek/app_dynamic
```
