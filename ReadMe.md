# Změny

## 28.5.2026 — zobraz_plan_lekcí_téma

- badge u tématu teď ukazuje `8/10 přednáška` místo `11x přednáška`
- query rozšířena o `topic.lessons { count type }` z `LessonGQLModel`

## 27.5.2026 — mazání a přiřazování (app_studyplan)

- nové GQL akce `DeleteLesson`, `DeleteGroup`, `DeleteRoom`, `DeleteTeacher`
- tlačítko Smazat u každé lekce, křížky pro odebrání učitele / místnosti / skupiny
- `AddGroup`, `AddRoom` — přiřazení skupiny a místnosti k lekci
- načítání typů výuky přes `LessonType.jsx` (`lessonTypePage`)

## 12.–13.5.2026 — přidávání lekcí a layout

- `SelectionContext` pro sdílení vybraného učitele, místnosti a skupiny
- `AddLesson`, `AddInstructor` — vytváření lekce a přiřazení učitele
- přepis `StudyPlanDetail.jsx` — vstupy a tlačítko Uložit lekci v hlavičce tématu
- publish workflow aktualizován

## 12.5.2026 — vizualizace (app_studyplan)

- navbar s dropdowny Programy / Studenti / Požadavky, napojené na granting2 routy
- layout detail stránky: bílý info panel vlevo (UUID, semestr, zkouška, autor), tři entity lookup pole vpravo (Vyučující, Místnosti, Skupiny), témata přes celou šířku s červeným pozadím
- nové GQL akce `SearchGroupAsyncAction` a `SearchRoomAsyncAction`

## 11.5.2026 — update_komponenta

- úpravy `muj_pokus_componenta.jsx` a oprava `Update.jsx`

## 6.5.2026 — EntitylookUp

- nová komponenta `MujEntitylookup.jsx` s autocomplete vyhledáváním
- `SearchAsyncAction.jsx` pro vyhledávání uživatelů přes `userPage`

## 23.4.2026 — zmena

- nová app `app_semestr`, rozšíření `app_granting` a `app_ug3`
- nové stránky v `_template` GroupGQLModel (PageVectorBase, PageVectorStruct)

## 3.4.2025

- script `createscalar.js`
- script `createvector.js`
- template `EmptyVectorsAttribute.jsx`




# Jak spustit konrétní app

```cmd
npm run dev -w @hrbolek/app_dynamic
```

# Jak sestavit konrétní app

```cmd
npm run build -w @hrbolek/app_dynamic
```