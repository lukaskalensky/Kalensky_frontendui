import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const DeleteMutationStr = `
mutation digitalFormSectionDelete($id: UUID!, $lastchange: DateTime!) {
  digitalFormSectionDelete(digitalFormSection: {id: $id, lastchange: $lastchange}) {
  ...DigitalFormSectionGQLModelDeleteError
}
}

fragment DigitalFormSectionGQLModelDeleteError on DigitalFormSectionGQLModelDeleteError {
  __typename
  Entity {
    ...Large
  }
  msg
  code
  failed
  location
  input
}
`
const DeleteMutation = createQueryStrLazy(`${DeleteMutationStr}`, LargeFragment)
export const DeleteAsyncAction = createAsyncGraphQLAction2(DeleteMutation)