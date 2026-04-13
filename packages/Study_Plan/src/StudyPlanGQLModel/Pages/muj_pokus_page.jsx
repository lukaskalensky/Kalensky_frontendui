import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { MyCustomWidget } from "../Components/muj_pokus_componenta";
import { PageItemBase } from "./PageBase";
import { LargeCard, StudyPlanDetail } from "../Components";

const MujPokusQueryStr = `
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


query studyPlanById($id: UUID!) {
  studyPlanById(id: $id) {
  ...StudyPlan
}
}
`;
const MujPokusQuery = createQueryStrLazy(MujPokusQueryStr);
export const FetchMojeDataAction = createAsyncGraphQLAction2(MujPokusQuery);


export const MujPokusPage = () => {
    return (
        <PageItemBase 
            queryAsyncAction={FetchMojeDataAction}
            SubPage={MyCustomWidget} 

            ItemLayout={StudyPlanDetail} 
        />
    );
};