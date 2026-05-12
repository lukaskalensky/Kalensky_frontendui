import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { MyCustomWidget } from "../Components/muj_pokus_componenta";
import { PageItemBase } from "./PageBase";
import { StudyPlanDetail } from "../Components";
import { SelectionContext } from "../Components/SelectionContext";
import { useState } from "react";

const MujPokusQueryStr = `
fragment User on UserGQLModel {
  __typename
  id
  fullname
  name
  email
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
}

fragment Semester on SemesterGQLModel {
  __typename
  id
  order
  subjectId
  subject {
    ...Subject
  }
  topics {
    ...Topic
  }
}

fragment LessonType on LessonTypeGQLModel {
  __typename
  id
  name
  nameEn
}

fragment StudyPlanLesson on StudyPlanLessonGQLModel {
  __typename
  id
  order
  name
  topicId
  topic {
    __typename
    id
    name
  }
  lessontypeId
  lessontype {
    ...LessonType
  }
  instructors {
    __typename
    id
    fullname
  }
  studyGroups {
    __typename
    id
    name
  }
  facilities {
    __typename
    id
    name
  }
}

fragment Exam on ExamGQLModel {
  __typename
  id
  name
  nameEn
}

fragment StudyPlan on StudyPlanGQLModel {
  __typename
  id
  lastchange
  created
  createdby {
    ...User
  }
  changedby {
    ...User
  }
  semesterId
  semester {
    ...Semester
  }
  examId
  exam {
    ...Exam
  }
  lessons {
    ...StudyPlanLesson
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
