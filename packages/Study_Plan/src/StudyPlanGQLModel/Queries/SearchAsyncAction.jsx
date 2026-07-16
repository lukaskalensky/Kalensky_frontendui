import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2"
import { reduceToFirstEntity } from "../../../../dynamic/src/Store" // <-- Vrátit import reduceru

// Hledání uživatelů (kandidátů na vyučující) pro políčko EntityLookup v
// EntityLookupCard (muj_pokus_componenta.jsx) — vrací jen id/name/fullname, aby byla
// odpověď malá a rychlá, protože se posílá po každém napsaném znaku (živý našeptávač).
const SearchQueryStr = `
query SearchQuery($skip: Int, $limit: Int, $pattern: String) {
  # Hledáme podle name (to je pro DB bezpečnější), ale vyžádáme si id i fullname
  result: userPage(skip: $skip, limit: $limit, where: {fullname: {_ilike: $pattern}}) {
    id
    name
    fullname
  }
}
`

export const SearchAsyncActionQuery = createQueryStrLazy(`${SearchQueryStr}`)

// reduceToFirstEntity převede odpověď GraphQL serveru (objekt s klíčem `result`)
// rovnou na čisté pole položek — bez toho by EntityLookup musel znát vnitřní tvar
// odpovědi a nešel by tak snadno znovupoužít pro jiné entity (skupiny, místnosti)
// <-- Tady se musel vrátit reduceToFirstEntity, aby se "vybalilo" čisté pole!
export const SearchAsyncAction = createAsyncGraphQLAction2(SearchAsyncActionQuery, reduceToFirstEntity)