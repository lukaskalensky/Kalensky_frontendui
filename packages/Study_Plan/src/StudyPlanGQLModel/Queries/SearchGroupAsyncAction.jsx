import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2"
import { reduceToFirstEntity } from "../../../../dynamic/src/Store"

// Hledání studijních skupin pro EntityLookup v EntityLookupCard
// (muj_pokus_componenta.jsx) — stejný vzor jako SearchAsyncAction.jsx, jen nad
// jiným typem entity (groupPage místo userPage).
const SearchGroupQueryStr = `
query SearchGroupQuery($skip: Int, $limit: Int, $pattern: String) {
  result: groupPage(skip: $skip, limit: $limit, where: {name: {_ilike: $pattern}}) {
    id
    name
  }
}
`

export const SearchGroupAsyncActionQuery = createQueryStrLazy(`${SearchGroupQueryStr}`)
export const SearchGroupAsyncAction = createAsyncGraphQLAction2(SearchGroupAsyncActionQuery, reduceToFirstEntity)
