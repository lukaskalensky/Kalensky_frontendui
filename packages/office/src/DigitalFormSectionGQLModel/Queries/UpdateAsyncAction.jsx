import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { reduceToFirstEntity, updateItemsFromGraphQLResult } from "../../../../dynamic/src/Store";

const UpdateMutationStr = `
mutation digitalFormSectionUpdate($id: UUID!, $lastchange: DateTime!, $name: String, $label: String, $labelEn: String, $repeatableMin: Int, $repeatableMax: Int, $repeatable: Boolean) {
  digitalFormSectionUpdate(digitalFormSection: {id: $id, lastchange: $lastchange, name: $name, label: $label, labelEn: $labelEn, repeatableMin: $repeatableMin, repeatableMax: $repeatableMax, repeatable: $repeatable}) {
    ... on DigitalFormSectionGQLModel { ...Large }
    ... on DigitalFormSectionGQLModelUpdateError { ...Error }
  }
}

fragment Error on DigitalFormSectionGQLModelUpdateError {
  __typename
  Entity {
    ...Large
  }
  msg
  failed
  code
  location
  input
}
`

const UpdateMutation = createQueryStrLazy(`${UpdateMutationStr}`, LargeFragment)
export const UpdateAsyncAction = createAsyncGraphQLAction2(UpdateMutation, 
    updateItemsFromGraphQLResult, reduceToFirstEntity)