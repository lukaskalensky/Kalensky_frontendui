import { CardCapsule } from "./CardCapsule"
import { Link } from "./Link"
import { MediumContent } from "./MediumContent"

export const MediumCard = ({ header, item }) => {
    return (
        <CardCapsule header={header || <Link item={item}/>} item={item}>
            <MediumContent item={item} />
        </CardCapsule>
    )
}
