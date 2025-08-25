import { Input } from "@hrbolek/uoisfrontend-shared"
import { DigitalFormSectionCardCapsule } from "../../DigitalFormSectionGQLModel/Components/DigitalFormSectionCardCapsule"
import { DigitalSubmissionCardCapsule } from "./DigitalSubmissionCardCapsule"
import { DigitalSubmissionFieldMediumEditableContent } from "../../DigitalSubmissionFieldGQLModel/Components/DigitalSubmissionFieldMediumEditableContent"
import { DigitalSubmissionSectionCardCapsule } from "../../DigitalSubmissionSectionGQLModel/Components/DigitalSubmissionSectionCardCapsule"
import { DigitalSubmissionSectionMediumEditableContent } from "../../DigitalSubmissionSectionGQLModel/Components/DigitalSubmissionSectionMediumEditableContent"
/**
 * A component that displays medium-level content for an digitalsubmission entity.
 *
 * This component renders a label "DigitalSubmissionMediumContent" followed by a serialized representation of the `digitalsubmission` object
 * and any additional child content. It is designed to handle and display information about an digitalsubmission entity object.
 *
 * @component
 * @param {Object} props - The properties for the DigitalSubmissionMediumContent component.
 * @param {Object} props.digitalsubmission - The object representing the digitalsubmission entity.
 * @param {string|number} props.digitalsubmission.id - The unique identifier for the digitalsubmission entity.
 * @param {string} props.digitalsubmission.name - The name or label of the digitalsubmission entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `digitalsubmission` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const digitalsubmissionEntity = { id: 123, name: "Sample Entity" };
 * 
 * <DigitalSubmissionMediumContent digitalsubmission={digitalsubmissionEntity}>
 *   <p>Additional information about the entity.</p>
 * </DigitalSubmissionMediumContent>
 */
export const DigitalSubmissionMediumEditableContent = ({
    digitalsubmission, onChange=(e)=>null, onBlur=(e)=>null, children
}) => {
    const sections = digitalsubmission?.sections || []
    return (
        <DigitalSubmissionSections sections={sections} onChange={onChange} onBlur={onBlur}/>           
    )
}

export const DigitalSubmissionSections = ({
    sections, onChange=(e)=>null, onBlur=(e)=>null, children
}) => {
    const groupedSections = groupSectionsByFormSection(sections)
    return (
        <>           
            {groupedSections.map(({formSection, sections}, index) => {
                return (
                    <div key={index+":"+formSection.id}>
                        {/* 4{formSection?.repeatable?"T":"N"} */}
                        {/* 5{formSection?.repeatableMax > sections.length?"T":"N"} */}
                        {sections.map((digitalsubmissionsection, index) => (<div>
                            
                            <DigitalSubmissionSectionCardCapsule 
                                key={digitalsubmissionsection.id} 
                                title={
                                   formSection?.name + (sections.length > 1 ? ` [${index+1}]` : "") 
                                }
                                digitalsubmissionsection={digitalsubmissionsection}
                            >
                                {/* DigitalSubmissionSectionMediumEditableContent
                                <pre>{JSON.stringify(digitalsubmissionsection, null, 2)}</pre> */}
                                <DigitalSubmissionSectionMediumEditableContent 
                                    digitalsubmissionsection={digitalsubmissionsection}
                                    onChange={onChange} 
                                    onBlur={onBlur}
                                />
                            </DigitalSubmissionSectionCardCapsule>
                                
                        </div>))}
                        {formSection?.repeatable && formSection?.repeatableMax > sections.length && (
                            <button className="btn btn-outline-primary form-control">Zopakovat sekci ({formSection?.name})</button>
                        )}
                    </div>
                )
            })}
        </>
    )
}

export const groupSectionsByFormSection = (sections) => {
    const grouped = {}
    sections.forEach(section => {
        const formSectionId = section?.formSection?.id || "no-section"
        if(!grouped[formSectionId]) {
            grouped[formSectionId] = {
                formSection: section?.formSection || {id: null, name: "no-section"},
                sections: []
            }
        }
        grouped[formSectionId].sections.push(section)
    })
    Object.values(grouped).forEach(group => {
        group.sections.sort((a, b) => (a.index || 0) - (b.index || 0))
    })
    return Object.values(grouped)
}

const submission = {
    __typename: "DigitalSubmission",
    // id: "1",
    name: "Moje první podání",
    sections: [
        {
            __typename: "DigitalSubmissionSection",
            id: "3275f7c8-bf72-4bab-a345-f1f709c909c2",
            index: 2,
            formSection: {
                __typename: "DigitalFormSection",
                id: "6ac54b2f-56b2-4ecd-aa54-7686684425ae",
                name: "Sekce A",
                repeatable: true,
                repeatableMin: 1,
                repeatableMax: 3    
            },
            fields: [
                {
                    __typename: "DigitalSubmissionField",
                    id: "4a308417-3c1c-4a0d-9898-d533086f770e",
                    value: "",
                    field: {
                        __typename: "DigitalFormField",
                        id: "aedc92af-db76-4900-b23f-7db23fb9e358",
                        label: "Od",
                        typeId: "eed38692-157c-479c-97f6-eafe244acd1d"
                    }
                },
                {
                    __typename: "DigitalSubmissionField",
                    id: "9bfd48c6-4eeb-49e0-9202-8823ec3f790a",
                    value: "",
                    field: {
                        __typename: "DigitalFormField",
                        id: "6b09d217-82c6-4aeb-a2f4-73bf58fec52c",
                        label: "Do",
                        typeId: "eed38692-157c-479c-97f6-eafe244acd1d"
                    }
                }
            ]
        },
        {
            __typename: "DigitalSubmissionSection",
            id: "d533d45f-bfb0-4217-9b26-e686adaaa08c",
            index: 1,
            formSection: {
                __typename: "DigitalFormSection",
                id: "6ac54b2f-56b2-4ecd-aa54-7686684425ae",
                name: "Sekce A",
                repeatable: true,
                repeatableMin: 1,
                repeatableMax: 3    
            },
            fields: [
                {
                    __typename: "DigitalSubmissionField",
                    id: "864a2349-f4d5-4734-89a6-ce88b9c88881",
                    value: "",
                    field: {
                        __typename: "DigitalFormField",
                        id: "aedc92af-db76-4900-b23f-7db23fb9e358",
                        label: "Od",
                        typeId: "eed38692-157c-479c-97f6-eafe244acd1d"
                    }
                },
                {
                    __typename: "DigitalSubmissionField",
                    id: "278d4653-a684-4bac-898f-7dbe803cd7c6",
                    value: "",
                    field: {
                        __typename: "DigitalFormField",
                        id: "6b09d217-82c6-4aeb-a2f4-73bf58fec52c",
                        label: "Do",
                        typeId: "eed38692-157c-479c-97f6-eafe244acd1d"
                    }
                }
            ]
        },
        {
            __typename: "DigitalSubmissionSection",
            id: "f515c216-5ed2-4a33-ba7d-3047696e57de",
            index: 1,
            formSection: {
                __typename: "DigitalFormSection",
                id: "cff17592-e618-411f-80f6-588f5cac7364",
                name: "Sekce B",
                repeatable: true,
                repeatableMin: 1,
                repeatableMax: 4
            },
            fields: [
                {
                    __typename: "DigitalSubmissionField",
                    id: "c58a60dc-8718-44ec-acf1-5934f7facb2b",
                    value: "Popis",
                    field: {
                        __typename: "DigitalFormField",
                        id: "06a4549b-0dbd-4f08-9b7a-0a5ec0ce76aa",
                        label: "Textové pole",
                        typeId: "cc335bb5-4e4e-40ce-8dc1-e7bfedf4d3cf"
                    }
                }
            ]
        }
    ]
}
export const ExampleDS = ({digitalsubmission=submission}) => {
    const onEvent = (next) => (e, field) => {
        console.log(`ExampleDS.${next}`, e.target.id, e.target.value, field)
    }
    return (
        <DigitalSubmissionCardCapsule digitalsubmission={submission} title={`Ukázka DigitalSubmissionMediumEditableContent`}>
            <DigitalSubmissionMediumEditableContent 
                digitalsubmission={submission} 
                onChange={onEvent("onChange")} 
                onBlur={onEvent("onBlur")}
            />
        </DigitalSubmissionCardCapsule>
    )
}