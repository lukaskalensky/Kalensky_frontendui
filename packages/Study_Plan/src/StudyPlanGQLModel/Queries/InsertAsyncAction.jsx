import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";


const InsertMutationStr = `
mutation studyPlanInsert($semesterId: UUID!, $eventId: UUID, $id: UUID, $examId: UUID) {
  studyPlanInsert(studyPlan: {semesterId: $semesterId, eventId: $eventId, id: $id, examId: $examId}) {
    ... on InsertError { ...InsertError }
    ... on StudyPlanGQLModel { ...StudyPlan }
  }
}

fragment InsertError on InsertError {
  __typename
  msg
  failed
  code
  location
  input
}
`

const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`)
export const InsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)
