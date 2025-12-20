import { CardCapsule } from "../Components"
import { GroupGDPR } from "./GroupGDPR"
import { GroupUpdate } from "./GroupUpdate"

export const InteractiveMutations = ({ item }) => {
    return (
    <CardCapsule item={item} title="Nástroje">
        <GroupUpdate className="btn btn-outline-success" item={item} buttonLabel={"Update"} />
        <GroupGDPR className="btn btn-outline-success" item={item} buttonLabel={"GDPR"} />
    </CardCapsule>)
}
