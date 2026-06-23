import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const DeleteMutationStr = `
mutation studyPlanDelete($id: UUID!, $lastchange: DateTime!, $examId: UUID, $eventId: UUID) {
  studyPlanDelete(studyPlan: {id: $id, lastchange: $lastchange, examId: $examId, eventId: $eventId}) {
    ...StudyPlanGQLModelDeleteError
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

fragment StudyPlanLesson on StudyPlanLessonGQLModel {
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
      name
      nameEn
      length
      eventId
      event { id }
      topicId
      topic { id }
      lessontypeId
      lessontype { id }
      linkedWithId
      planId
      plan { id }
      linkedWith { id }
      instructors { id }
      studyGroups { id }
      facilities { id }
    }

fragment Exam on ExamGQLModel {
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
      descriptionEn
      minScore
      maxScore
      typeId
      type { id }
      parentId
      parent { id }
      parts { id }
      evaluations { id }
      planId
      plan { id }
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
