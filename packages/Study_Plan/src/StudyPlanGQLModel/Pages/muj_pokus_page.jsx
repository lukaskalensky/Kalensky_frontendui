import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { MyCustomWidget } from "../Components/muj_pokus_componenta";
import { PageItemBase } from "./PageBase";
import { StudyPlanDetail } from "../Components";
import { SelectionContext } from "../Components/SelectionContext";
import { useState } from "react";

// Vlastní GraphQL dotaz pro stránku detailu studijního plánu. Nahrazuje generický
// dotaz z šablony/generátoru, protože potřebujeme natáhnout mnohem víc vnořených dat
// najednou (semestr s tématy, každé téma se svými naplánovanými lekcemi, u reálných
// lekcí i jména přiřazených učitelů/skupin/místností), aby StudyPlanDetail.jsx nemusel
// dělat další dotazy na server jen kvůli zobrazení jednoho řádku lekce.
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

// Zpracuje textový GraphQL dotaz výše do podoby, kterou umí použít Apollo/gql klient
const MujPokusQuery = createQueryStrLazy(MujPokusQueryStr);
// Async akce (thunk) pro Redux, kterou se dotaz skutečně spustí — používá ji jak
// tahle stránka (queryAsyncAction v PageItemBase níže), tak StudyPlanDetail.jsx
// (reloadPlan), když potřebuje po lokální změně znovu natáhnout čerstvá data plánu
export const FetchMojeDataAction = createAsyncGraphQLAction2(MujPokusQuery);

// Přidá entitu do seznamu, pokud tam podle id ještě není
const addUnique = (setList) => (entity) => {
    if (!entity) return;
    setList((prev) => (prev.some((x) => x.id === entity.id) ? prev : [...prev, entity]));
};

// Odebere entitu ze seznamu podle id
const removeById = (setList) => (id) => {
    setList((prev) => prev.filter((x) => x.id !== id));
};

// Stránka detailu studijního plánu (route pro /StudyPlanGQLModel/view/:id).
// Kromě natažení dat přes FetchMojeDataAction a vykreslení StudyPlanDetail hlavně
// zakládá a poskytuje SelectionContext — sdílený "košík" vybraných učitelů, místností
// a skupin, do kterého se v MyCustomWidget (nahoře v `SubPage`) sbírají entity
// vyhledané přes EntityLookup a ze kterého je pak StudyPlanDetail (`ItemLayout`) čte,
// aby je šlo v LessonRow hromadně přiřadit ke konkrétní lekci jedním kliknutím.
export const MujPokusPage = () => {

    // Místo jedné vybrané entity držíme pole -> umožňuje výběr více učitelů/místností/skupin najednou
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);

    // Vložíme je do jednoho objektu, který se pak jako jediná hodnota předá
    // SelectionContext.Provider níže — tím ho dostanou všechny komponenty ve stromu
    // (MyCustomWidget i StudyPlanDetail/LessonRow), aniž by se musel prop-drillovat
    // přes všechny mezikomponenty ručně
    const contextValue = {
        selectedTeachers, addTeacher: addUnique(setSelectedTeachers), removeTeacher: removeById(setSelectedTeachers),
        selectedRooms, addRoom: addUnique(setSelectedRooms), removeRoom: removeById(setSelectedRooms),
        selectedGroups, addGroup: addUnique(setSelectedGroups), removeGroup: removeById(setSelectedGroups),
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
