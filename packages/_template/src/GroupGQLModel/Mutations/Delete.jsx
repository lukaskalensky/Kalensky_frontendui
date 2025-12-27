import { DeleteURI, ListURI, MediumContent } from "../Components";
import { DeleteAsyncAction } from "../Queries";
import { 
    DeleteBody as BaseDeleteBody, 
    DeleteButton as BaseDeleteButton, 
    DeleteDialog as BaseDeleteDialog, 
    DeleteLink as BaseDeleteLink
} from "../../Base/Mutations/Delete";

const DefaultContent = MediumContent
const mutationAsyncAction = DeleteAsyncAction

const permissions = {
    oneOfRoles: ["superadmin"],
    mode: "absolute",
}

export const DeleteLink = ({ ...props }) => {
    return (
        <BaseDeleteLink 
            {...props} 
            uriPattern={DeleteItemURI} 
            {...permissions}
        />
    )
};

export const DeleteButton = ({ ...props }) => {
    return (
        <BaseDeleteButton 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={ListURI}
            {...permissions}
        />
    )
}

export const DeleteDialog = ({ ...props }) => {
    return (
        <BaseDeleteDialog 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={ListURI}
            {...permissions}
        />
    )
}

export const DeleteBody = ({ ...props }) => {
    return (
        <BaseDeleteBody 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={ListURI}
            {...permissions}
        />
    )
}
