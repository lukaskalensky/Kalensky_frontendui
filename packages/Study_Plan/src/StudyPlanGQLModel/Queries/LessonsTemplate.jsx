import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const InsertLessonTemplateMutationStr = `
mutation lessonInsert($topicId: UUID!, $typeId: UUID!, $count: Int!) {
  lessonInsert(lesson: {topicId: $topicId, typeId: $typeId, count: $count}) {
    ... on LessonGQLModel {
      __typename
      id
      count
      typeId
    }
  }
}
`;

const InsertLessonTemplateQuery = createQueryStrLazy(InsertLessonTemplateMutationStr);
export const InsertLessonTemplateAsyncAction = createAsyncGraphQLAction2(InsertLessonTemplateQuery);