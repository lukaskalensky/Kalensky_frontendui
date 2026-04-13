import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on RoleTypeGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
    name
  nameEn
  path
  mastertypeId
  mastertype {
    __typename
  }
  
}
`

const MediumFragmentStr = `
fragment Medium on RoleTypeGQLModel {
  ...Link
  rbacobject {
    ...RBRoles
  }
}
`

const LargeFragmentStr = `
fragment User on UserGQLModel {
  __typename
  id
  studies { __typename }
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename }
  changedby { __typename }
  rbacobject { __typename }
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
  memberships { __typename }
  roles { __typename }
  isThisMe
  rolesOn { __typename }
  gdpr
  fullname
  memberOf { __typename }
  }

fragment RBACObject on RBACObjectGQLModel {
  __typename
  id
  roles { __typename }
  currentUserRoles { __typename }
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
  createdby { __typename }
  changedby { __typename }
  rbacobject { __typename }
  order
  mandatory
  credits
  classificationtypeId
  subjectId
  subject { __typename }
  prerequisites { __typename }
  topics { __typename }
  plans { __typename }
  }

fragment StudyPlanLesson on StudyPlanLessonGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename }
  changedby { __typename }
  rbacobject { __typename }
  order
  name
  nameEn
  length
  eventId
  event { __typename }
  topicId
  topic { __typename }
  lessontypeId
  lessontype { __typename }
  linkedWithId
  planId
  plan { __typename }
  linkedWith { __typename }
  instructors { __typename }
  studyGroups { __typename }
  facilities { __typename }
  }

fragment Exam on ExamGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename }
  changedby { __typename }
  rbacobject { __typename }
  path
  name
  nameEn
  description
  descriptionEn
  minScore
  maxScore
  typeId
  type { __typename }
  parentId
  parent { __typename }
  parts { __typename }
  evaluations { __typename }
  planId
  plan { __typename }
  }

fragment Event on EventGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename }
  changedby { __typename }
  rbacobject { __typename }
  path
  name
  nameEn
  description
  startdate
  enddate
  duration_raw
  valid
  place
  facilityId
  facility { __typename }
  facilityReservations { __typename }
  mastereventId
  masterevent { __typename }
  subevents { __typename }
  typeId
  type { __typename }
  userInvitations { __typename }
  # duration
  }

fragment StudyPlan on StudyPlanGQLModel {
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
semesterId
semester {
  ...Semester
}
examId
lessons {
  ...StudyPlanLesson
}
exam {
  ...Exam
}
eventId
event {
  ...Event
}
}
`

const RoleFragmentStr = `
fragment Role on RoleGQLModel {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    createdby { id __typename }
    changedby { id __typename }
    rbacobject { id __typename }
    valid
    deputy
    startdate
    enddate
    roletypeId
    userId
    groupId
    roletype { __typename id }
    user { __typename id fullname }
    group { __typename id name }
  }
`

const RBACFragmentStr = `
fragment RBRoles on RBACObjectGQLModel {
  __typename
  id
  currentUserRoles {
    __typename
    id
    lastchange
    valid
    startdate
    enddate
    roletype {
      __typename
      id
      name
    }
    group {
      __typename
      id
      name
      grouptype {
        __typename
        id
        name
      }
    }
  }
}`

export const RoleFragment = createQueryStrLazy(`${RoleFragmentStr}`)
export const RBACFragment = createQueryStrLazy(`${RBACFragmentStr}`)

export const LinkFragment = createQueryStrLazy(`${LinkFragmentStr}`)
export const MediumFragment = createQueryStrLazy(`${MediumFragmentStr}`, LinkFragment, RBACFragment)
export const LargeFragment = createQueryStrLazy(`${LargeFragmentStr}`)
  