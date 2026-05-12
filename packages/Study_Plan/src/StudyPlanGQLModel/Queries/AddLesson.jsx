import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const AddLessonMutationStr = `
mutation studyPlanLessonInsert($planId: UUID!, $lessontypeId: UUID!, $topicId: UUID!, $eventId: UUID, $linkedWithId: UUID, $name: String, $nameEn: String, $length: Int, $order: Int, $id: UUID) {
  studyPlanLessonInsert(studyPlanLesson: {planId: $planId, lessontypeId: $lessontypeId, topicId: $topicId, eventId: $eventId, linkedWithId: $linkedWithId, name: $name, nameEn: $nameEn, length: $length, order: $order, id: $id}) {
    ... on StudyPlanLessonGQLModel { ...StudyPlanLesson }
    ... on StudyPlanLessonGQLModelInsertError { ...StudyPlanLessonGQLModelInsertError }
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

fragment Event on EventGQLModel {
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
      facility { id }
      facilityReservations { id }
      mastereventId
      masterevent { id }
      subevents { id }
      typeId
      type { id }
      userInvitations { id }
      # duration
    }

fragment Topic on TopicGQLModel {
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
      name
      nameEn
      order
      description
      semesterId
      semester { id }
      lessons { id }
    }

fragment LessonType on LessonTypeGQLModel {
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
      name
      nameEn
      abbr
    }

fragment StudyPlan on StudyPlanGQLModel {
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
      semesterId
      semester { id }
      examId
      lessons { id }
      exam { id }
      eventId
      event { id }
    }

fragment Group on GroupGQLModel {
      __typename
      id
      accreditedPrograms { id }
      accreditedSubjects { id }
      projects { id }
      lastchange
      created
      createdbyId
      changedbyId
      rbacobjectId
      createdby { id }
      changedby { id }
      rbacobject { id }
      name
      nameEn
      email
      abbreviation
      startdate
      enddate
      grouptypeId
      grouptype { id }
      subgroups { id }
      mastergroupId
      mastergroup { id }
      path
      memberships { id }
      roles { id }
      valid
      mastergroups { id }
      rolesOn { id }
    }

fragment Facility on FacilityGQLModel {
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
      path
      name
      nameEn
      label
      startdate
      enddate
      address
      valid
      capacity
      geometry
      geolocation
      reservations { id }
      groupId
      facilitytypeId
      masterFacilityId
      type { id }
      masterFacility { id }
      masterFacilities { id }
      subFacilities { id }
      group { id }
    }

fragment StudyPlanLesson on StudyPlanLessonGQLModel {
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
    order
    name
    nameEn
    length
    eventId
    event {
  ...Event
}
    topicId
    topic {
  ...Topic
}
    lessontypeId
    lessontype {
  ...LessonType
}
    linkedWithId
    planId
    plan {
  ...StudyPlan
}
    linkedWith { id }
    instructors {
  ...User
}
    studyGroups {
  ...Group
}
    facilities {
  ...Facility
}
  }

fragment StudyPlanLessonGQLModelInsertError on StudyPlanLessonGQLModelInsertError {
    __typename
    Entity {
  ...StudyPlanLesson
}
    msg
    failed
    code
    location
    input
  }

`;

const AddLessonQuery = createQueryStrLazy(AddLessonMutationStr);
export const AddLessonAsyncAction = createAsyncGraphQLAction2(AddLessonQuery);