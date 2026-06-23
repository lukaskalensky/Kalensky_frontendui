import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { MyCustomWidget } from "../Components/muj_pokus_componenta";
import { PageItemBase } from "./PageBase";
import { StudyPlanDetail } from "../Components";
import { SelectionContext } from "../Components/SelectionContext";
import { useState } from "react";

const MujPokusQueryStr = `
# 1. Základní fragmenty (Doplněné o potřebná data pro UI i Backend)
fragment User on UserGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  name
  givenname
  middlename
  email
  firstname
  surname
  valid
  fullname
}

fragment RBACObject on RBACObjectGQLModel {
  __typename
  id
  roles { id }
  currentUserRoles { id }
}

fragment Subject on SubjectGQLModel {
  __typename
  id
  name
  nameEn
}

fragment Topic on TopicGQLModel {
  __typename
  id
  name
  nameEn
  order
  lessons {
    __typename
    id
    count
    typeId
    type {
      __typename
      id
      name
      nameEn
    }
  }
}

fragment LessonType on LessonTypeGQLModel {
  __typename
  id
  name
  nameEn
}

fragment Exam on ExamGQLModel {
  __typename
  id
  lastchange
  created
  name
  nameEn
  description
  descriptionEn
  minScore
  maxScore
}

fragment Event on EventGQLModel {
  __typename
  id
  lastchange
  created
  name
  nameEn
  description
  startdate
  enddate
  valid
  place
}

# 2. Komplexní fragmenty (Spojené relace)
fragment Semester on SemesterGQLModel {
  __typename
  id
  lastchange
  created
  order
  mandatory
  credits
  subjectId
  subject {
    ...Subject
  }
  topics {
    ...Topic
  }
}

fragment StudyPlanLesson on StudyPlanLessonGQLModel {
  __typename
  id
  lastchange
  created
  order
  name
  nameEn
  length
  eventId
  topicId
  topic {
    __typename
    id
    name
    nameEn
  }
  lessontypeId
  lessontype {
    ...LessonType
  }
  # Oproti dlouhému dotazu zde netaháme jen ID, ale jména pro UI
  instructors {
    __typename
    id
    fullname
    surname
  }
  studyGroups {
    __typename
    id
    name
    abbreviation
  }
  facilities {
    __typename
    id
    name
    label
  }
}

# 3. Hlavní fragment plánu
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
  exam {
    ...Exam
  }
  eventId
  event {
    ...Event
  }
  # Zásadní: Používáme limit 1000 pro jistotu, že se načtou všechny lekce
  lessons(limit: 1000) {
    ...StudyPlanLesson
  }
}

# 4. Samotný Query dotaz
query studyPlanById($id: UUID!) {
  studyPlanById(id: $id) {
    ...StudyPlan
  }
}
`;

const MujPokusQuery = createQueryStrLazy(MujPokusQueryStr);
export const FetchMojeDataAction = createAsyncGraphQLAction2(MujPokusQuery);

export const MujPokusPage = () => {

  const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Vložíme je do jednoho objektu
    const contextValue = {
        selectedTeacher, setSelectedTeacher,
        selectedRoom, setSelectedRoom,
        selectedGroup, setSelectedGroup
    };


    return (
      <SelectionContext.Provider value={contextValue}>
        <PageItemBase
            queryAsyncAction={FetchMojeDataAction}
            SubPage={MyCustomWidget}
            ItemLayout={StudyPlanDetail}
        />
        </SelectionContext.Provider>
    );
};
