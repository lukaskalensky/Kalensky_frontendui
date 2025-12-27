import { MediumEditableContent, ReadItemURI } from "../Components"
import { InsertAsyncAction } from "../Queries"
import { 
    CreateBody as BaseCreateBody, 
    CreateButton as BaseCreateButton, 
    CreateDialog as BaseCreateDialog, 
    CreateLink  as BaseCreateLink
} from "../../Base/Mutations/Create"

const DefaultContent = MediumEditableContent
const mutationAsyncAction = InsertAsyncAction

const permissions = {
    oneOfRoles: ["superadmin"],
    mode: "absolute",
}

export const CreateLink = ({...props}) => (
    <BaseCreateLink {...props} uriPattern={CreateURI} />
);

export const CreateButton = ({...props}) => {
    return <BaseCreateButton 
        {...props}
        DefaultContent={DefaultContent} 
        readItemURI={ReadItemURI}
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}

export const CreateDialog = ({...props}) => {
    return <BaseCreateDialog 
        {...props} 
        DefaultContent={DefaultContent} 
        readItemURI={ReadItemURI}
        mutationAsyncAction={mutationAsyncAction}
    />
};

export const CreateBody = ({...props}) => {
    return <BaseCreateBody 
        {...props} 
        DefaultContent={DefaultContent} 
        readItemURI={ReadItemURI}
        mutationAsyncAction={mutationAsyncAction}

    />
};

