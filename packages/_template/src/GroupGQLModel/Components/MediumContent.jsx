import { BaseUI } from "../../Base"
import { Attribute } from "../../Base/Components/Attribute"
import { Col } from "../../Base/Components/Col"
import { Row } from "../../Base/Components/Row"
import { Link } from "./Link"
import { Link as BaseLink } from "../../Base/Components/Link"
/**
 * A component that displays medium-level content for an template entity.
 *
 * This component renders a label "TemplateMediumContent" followed by a serialized representation of the `template` object
 * and any additional child content. It is designed to handle and display information about an template entity object.
 *
 * @component
 * @param {Object} props - The properties for the TemplateMediumContent component.
 * @param {Object} props.template - The object representing the template entity.
 * @param {string|number} props.template.id - The unique identifier for the template entity.
 * @param {string} props.template.name - The name or label of the template entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `template` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const templateEntity = { id: 123, name: "Sample Entity" };
 * 
 * <TemplateMediumContent template={templateEntity}>
 *   <p>Additional information about the entity.</p>
 * </TemplateMediumContent>
 */
export const MediumContent = ({ item }) => {
    return (<>
        <Attribute label="Název" item={item}>
            <Link item={item} />
        </Attribute>
        <Attribute label="Anglický název" item={item} attribute_name={"nameEn"} />
        <Attribute label="Email" item={item} attribute_name={"email"} />
        <hr />
        <Attribute label={"Nadřízený"}>
            <Link item={item?.mastergroup} />
        </Attribute>
        <hr/>
        <Attribute label="Poslední změna" item={item} attribute_name={"lastchange"} />
        <Attribute label="Provedl" item={item} attribute_name={"lastchange"}>
            <BaseLink item={item?.changedby} />
        </Attribute>
    </>)
}
