import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const ReadLessonTypeMutationStr = `
query lessonTypePage($skip: Int, $limit: Int, $orderby: String, $where: LessonTypeInputFilter) {
  lessonTypePage(skip: $skip, limit: $limit, orderby: $orderby, where: $where) {
  ...LessonType
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

fragment LessonType on LessonTypeGQLModel {
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
  abbr
}
`;

const ReadLessonTypeQuery = createQueryStrLazy(ReadLessonTypeMutationStr);
export const ReadLessonAsyncAction = createAsyncGraphQLAction2(ReadLessonTypeQuery);