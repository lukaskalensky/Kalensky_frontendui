import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const DeleteMutationStr = `
mutation studyPlanDelete($id: UUID!, $lastchange: DateTime!) {
  studyPlanDelete(studyPlan: {id: $id, lastchange: $lastchange}) {
    ...StudyPlanGQLModelDeleteError
  }
}

fragment StudyPlanGQLModelDeleteError on StudyPlanGQLModelDeleteError {
  __typename
  Entity {
    ...StudyPlan
  }
  msg
  code
  failed
  location
  input
}
`

const DeleteMutation = createQueryStrLazy(`${DeleteMutationStr}`)
export const DeleteAsyncAction = createAsyncGraphQLAction2(DeleteMutation)
