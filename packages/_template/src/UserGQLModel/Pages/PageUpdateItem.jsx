import { useGQLEntityContext } from "../../Base/Helpers/GQLEntityProvider"
import { LargeCard, LiveEdit } from "../Components"
import { ReadAsyncAction, UpdateAsyncAction } from "../Queries"
import { PageBase } from "./PageBase"

export const PageUpdateItem = ({ children, queryAsyncAction=ReadAsyncAction, ...props }) => {
    return (
        <PageBase queryAsyncAction={queryAsyncAction}>
            PageUpdateItem
            <Update {...props} />
        </PageBase>
    )
}

const Update = ({mutationAsyncAction=UpdateAsyncAction, ...props}) => {
    const { item } = useGQLEntityContext()
    if (!item) return null  
    return (
        <LargeCard item={item} {...props} >
            <LiveEdit item={item} mutationAsyncAction={mutationAsyncAction}/>
        </LargeCard>        
    )    
}