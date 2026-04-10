import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { MyCustomWidget } from "../Components/muj_pokus_componenta";
import { PageItemBase } from "./PageBase";

const MujPokusQueryStr = `
fragment Subject on SubjectGQLModel {
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
  name
  nameEn
  description
  descriptionEn
  programId
  program { __typename }
  semesters { __typename }
  guarantorsGroupId
  guarantors { __typename }
}


query semesterById($id: UUID!) {
  semesterById(id: $id) {
    id
    __typename
    subject {
  ...Subject
}
  }
}
`;
const MujPokusQuery = createQueryStrLazy(MujPokusQueryStr);
export const FetchMojeDataAction = createAsyncGraphQLAction2(MujPokusQuery);

// 1. Vytvoříme vlastní "prázdný" layout, který jen vezme vnitřek a vypíše ho bez levého menu
const EmptyLayout = ({ children }) => {
    return (
        <div style={{ width: '100%', padding: '20px' }}>
            {children}
        </div>
    );
};

export const MujPokusPage = () => {
    return (
        <PageItemBase 
            queryAsyncAction={FetchMojeDataAction}
            SubPage={MyCustomWidget} 
            // 2. Tímto přepíšeme výchozí "LargeCard" tvým prázdným layoutem:
            ItemLayout={EmptyLayout} 
        />
    );
};