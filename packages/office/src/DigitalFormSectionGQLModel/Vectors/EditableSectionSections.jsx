import { SimpleCardCapsule } from "../../../../_template/src/Base/Components"
import { LiveEdit as SectionLiveEdit } from "../../DigitalFormSectionGQLModel/Components/LiveEdit"

export const EditableSectionSections = ({ item }) => {
    const { sections=[] } = item || {}
    return (<>
            {sections.map(section => {
                return (<SimpleCardCapsule key={section?.id} title={section?.name}>
                    <SectionLiveEdit item={section} />
                </SimpleCardCapsule>)
            })}
    </>)
}