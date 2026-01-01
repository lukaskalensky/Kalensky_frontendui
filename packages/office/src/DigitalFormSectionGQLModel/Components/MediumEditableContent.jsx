import { SimpleCardCapsule } from "../../../../_template/src/Base/Components"
import { Col } from "../../../../_template/src/Base/Components/Col"
import { Row } from "../../../../_template/src/Base/Components/Row"
import { Input } from "../../../../_template/src/Base/FormControls/Input"
import { EditableSectionFields } from "../Vectors/EditableSectionFields"

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
export const MediumEditableContent = ({ item, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    return (
        <>           
        {/* defaultValue={item?.name|| "Název"}  */}
            <Input id={"name"} label={"Název"} className="form-control" value={item?.name|| "Název"} onChange={onChange} onBlur={onBlur} />
            <Row>
                <Col>
                    <Input id={"label"} label={"Označení"} className="form-control" value={item?.label|| "Anglický název"} onChange={onChange} onBlur={onBlur} />
                </Col>
                <Col>
                    <Input id={"labelEn"} label={"Anglické označení"} className="form-control" value={item?.labelEn|| "Anglický název"} onChange={onChange} onBlur={onBlur} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Input id={"repeatableMin"} type="number" label={"Minimální počet"} className="form-control" value={item?.repeatableMin|| 1} onChange={onChange} onBlur={onBlur} />
                </Col>
                <Col>
                    <Input id={"repeatableMax"} type="number" label={"Maximální počet"} className="form-control" value={item?.repeatableMax|| 1} onChange={onChange} onBlur={onBlur} />
                </Col>
            </Row>
            
            {/* <SimpleCardCapsule title="Položky">
            </SimpleCardCapsule> */}
            <EditableSectionFields item={item} />
            
            <pre>{JSON.stringify(item, null, 2)}</pre>
            {children}
        </>
    )
}
