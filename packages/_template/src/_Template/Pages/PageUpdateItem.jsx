import { LinkURI } from "../Components"
import { UpdateBody } from "../Mutations/Update"
import { PageItemBase } from "./PageBase"

export const UpdateItemURI = `${LinkURI.replace('view', 'edit')}:id`

export const PageUpdateItem = ({ 
    SubPage=UpdateBody,
    ...props
}) => {
    return (
        <PageItemBase 
            SubPage={SubPage}
            {...props}
        />
    )
}