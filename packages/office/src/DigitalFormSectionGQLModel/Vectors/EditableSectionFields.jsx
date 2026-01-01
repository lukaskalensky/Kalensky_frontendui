import { SimpleCardCapsule } from "../../../../_template/src/Base/Components"

export const EditableSectionFields = ({ item }) => {
    const { fields = []} = item || {}
    return (
        <SimpleCardCapsule item={item} title="Položky">

        </SimpleCardCapsule>
    )
}