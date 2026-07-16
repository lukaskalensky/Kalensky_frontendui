import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

// GraphQL mutace pro vytvoření nového tématu (topicInsert) v rámci semestru.
// Používá ji ComplexInsertPlanAction v Mutations/Create.jsx, kde se pro každé téma
// zadané ve formuláři (MediumEditableContent) nejdřív založí téma touto mutací,
// a teprve poté (z návratového ID) se k němu přidají jeho lekce.
const CreateTopicMutationStr = `
mutation topicInsert($semesterId: UUID, $id: UUID, $name: String, $nameEn: String, $order: Int, $description: String, $lessons: [LessonInsertGQLModel!]) {
  topicInsert(topic: {semesterId: $semesterId, id: $id, name: $name, nameEn: $nameEn, order: $order, description: $description, lessons: $lessons}) {
    ... on TopicGQLModel { 
      ...Topic 
    }
    ... on TopicGQLModelInsertError { 
      ...TopicGQLModelInsertError 
    }
  }
}

fragment User on UserGQLModel {
      __typename
      id
      studies { id }
      lastchange
      created
      createdbyId
      changedbyId
      rbacobjectId
      createdby { id }
      changedby { id }
      rbacobject { id }
      name
      givenname
      middlename
      email
      firstname
      surname
      valid
      startdate
      enddate
      typeId
      memberships { id }
      roles { id }
      isThisMe
      rolesOn { id }
      gdpr
      fullname
      memberOf { id }
    }

fragment RBACObject on RBACObjectGQLModel {
      __typename
      id
      roles { id }
      currentUserRoles { id }
      # userCanWithState
      # userCanWithoutState
    }

fragment Semester on SemesterGQLModel {
      __typename
      id
      lastchange
      created
      createdbyId
      changedbyId
      rbacobjectId
      createdby { id }
      changedby { id }
      rbacobject { id }
      order
      mandatory
      credits
      classificationtypeId
      subjectId
      subject { id }
      prerequisites { id }
      classificationtype { id }
      topics { id }
      plans { id }
    }

fragment Lesson on LessonGQLModel {
      __typename
      id
      lastchange
      created
      createdbyId
      changedbyId
      rbacobjectId
      createdby { id }
      changedby { id }
      rbacobject { id }
      count
      topicId
      topic { id }
      typeId
      type { id }
    }

fragment Topic on TopicGQLModel {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    createdby {
  ...User
}
    changedby {
  ...User
}
    rbacobject {
  ...RBACObject
}
    name
    nameEn
    order
    description
    semesterId
    semester {
  ...Semester
}
    lessons {
  ...Lesson
}
  }

fragment TopicGQLModelInsertError on TopicGQLModelInsertError {
    __typename
    Entity {
  ...Topic
}
    msg
    failed
    code
    location
    input
  }

`;

const CreateTopicQuery = createQueryStrLazy(CreateTopicMutationStr);
// Redux thunk volaný jako `createTopic({ semesterId, name, order })`
export const CreateTopicAsyncAction = createAsyncGraphQLAction2(CreateTopicQuery);