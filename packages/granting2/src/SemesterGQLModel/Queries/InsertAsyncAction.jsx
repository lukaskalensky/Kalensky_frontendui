import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";


const InsertMutationStr = `
mutation semesterInsert($subjectId: UUID, $id: UUID, $order: Int, $mandatory: Boolean, $credits: Int, $classificationtypeId: UUID, $topics: [TopicInsertGQLModel!]) {
  semesterInsert(semester: {subjectId: $subjectId, id: $id, order: $order, mandatory: $mandatory, credits: $credits, classificationtypeId: $classificationtypeId, topics: $topics}) {
    ... on InsertError { ...InsertError }
    ... on SemesterGQLModel { ...Large }
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

const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`, LargeFragment)
export const InsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)