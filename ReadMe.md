# Změny

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