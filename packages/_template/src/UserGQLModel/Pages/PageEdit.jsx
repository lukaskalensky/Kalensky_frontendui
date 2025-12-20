import { LiveEdit } from "../Components";
import { UpdateAsyncAction } from "../Queries";
import { PlaceChild } from "../../Base/Helpers/PlaceChild";
import { PageBase } from "./PageBase";

const UpdateLiveEdit = (props) => (
    <LiveEdit {...props} asyncMutationAction={UpdateAsyncAction} />
);

export const PageEdit = ({ children, Editor = UpdateLiveEdit }) => {
    return (
        <PageBase>
            {children?children:<PlaceChild Component={Editor} />
            }
        </PageBase>
    );
};
