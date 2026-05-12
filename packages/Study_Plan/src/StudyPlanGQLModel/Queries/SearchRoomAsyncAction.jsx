import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2"
import { reduceToFirstEntity } from "../../../../dynamic/src/Store"

const SearchRoomQueryStr = `
query SearchRoomQuery($skip: Int, $limit: Int, $pattern: String) {
  result: facilityPage(skip: $skip, limit: $limit, where: {name: {_ilike: $pattern}}) {
    id
    name
  }
}
`

export const SearchRoomAsyncActionQuery = createQueryStrLazy(`${SearchRoomQueryStr}`)
export const SearchRoomAsyncAction = createAsyncGraphQLAction2(SearchRoomAsyncActionQuery, reduceToFirstEntity)
