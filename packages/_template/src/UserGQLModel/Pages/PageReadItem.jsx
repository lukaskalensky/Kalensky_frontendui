import { useGQLEntityContext } from "../../Base/Helpers/GQLEntityProvider"
import { MediumCardScalars } from "../../Base/Scalars/ScalarAttribute"
import { MediumCardVectors } from "../../Base/Vectors/VectorAttribute"
import { LargeCard } from "../Components"
import { ReadAsyncAction } from "../Queries"
import { PageBase } from "./PageBase"

export const PageReadItem = ({ children, queryAsyncAction=ReadAsyncAction, ...props }) => {
    return (
        <PageBase queryAsyncAction={queryAsyncAction}>
            <Read {...props} />
        </PageBase>
    )
}

const Read = ({...props}) => {
    const { item } = useGQLEntityContext()
    if (!item) return null
    return (
        <LargeCard item={item} {...props} >
            <MediumCardScalars item={item} />
            <MediumCardVectors item={item} />
        </LargeCard>        
    )    
}