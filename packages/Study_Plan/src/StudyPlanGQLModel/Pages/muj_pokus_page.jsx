import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { MyCustomWidget } from "../Components/muj_pokus_componenta";

const MujPokusQueryStr = `
query semesterById($id: UUID!) {
  semesterById(id: $id) {
    id
    __typename
  }
}
`;
const MujPokusQuery = createQueryStrLazy(MujPokusQueryStr);
export const FetchMojeDataAction = createAsyncGraphQLAction2(MujPokusQuery);

export const MujPokusPage = () => {
   
    return (
        <div style={{ 
            minHeight: "100vh", 
            backgroundColor: "white", 
            padding: "40px",
            zIndex: 1000, 
            position: "relative" 
        }}>
            <MyCustomWidget>

            </MyCustomWidget>
        </div>
    );
};