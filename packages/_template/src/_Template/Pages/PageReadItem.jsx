import { MediumCardScalars } from "../../Base/Scalars/ScalarAttribute"
import { MediumCardVectors } from "../../Base/Vectors/VectorAttribute"
import { LinkURI } from "../Components"
import { PageItemBase } from "./PageBase"

export const ReadItemURI = `${LinkURI}:id`

export const GeneratedContentBase = ({ item }) => (<>
    <MediumCardScalars item={item} />
    <MediumCardVectors item={item} />
</>)

export const PageReadItem = ({ 
    SubPage=GeneratedContentBase,
    ...props
}) => {
    return (
        <PageItemBase SubPage={SubPage} {...props}/>
    )
}