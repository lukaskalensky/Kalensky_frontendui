import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2"
import { reduceToFirstEntity } from "../../../../dynamic/src/Store" // <-- Vrátit import reduceru

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

// <-- Tady se musel vrátit reduceToFirstEntity, aby se "vybalilo" čisté pole!
export const SearchAsyncAction = createAsyncGraphQLAction2(SearchAsyncActionQuery, reduceToFirstEntity)