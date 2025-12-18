import { Attribute } from "./Attribute"
import { Link } from "./Link"

const NonPriorityAttributeValue = ({ datarow = {}, name }) => {
    const value = datarow?.[name] || ""
    if (name === "id")
        return (
            <Attribute item={datarow} label={name} attribute_name={name} attribute_value_result={<Link item={datarow} >{datarow?.id || "Data Error"}</Link >} />
        )
    if (name === "name")
        return (
            <Attribute item={datarow} label={name} attribute_name={name} attribute_value_result={<Link item={datarow} />} />
        )

    const idpos = name.indexOf("Id")
    if (idpos === -1) {
        if (typeof value === "object")
            return null
        else
            return (
                <Attribute item={datarow} label={name} attribute_name={name} attribute_value_result={value || ""} />
            )
    }

    const scalarname = name.replace("Id", "")
    const { id, __typename} = datarow?.[scalarname] || {}
    if (id && __typename && id == value) {
        return <Attribute item={datarow} label={name} attribute_name={name} attribute_value_result={<Link item={datarow?.[scalarname]}>{id}</Link>} />
    } else {
        if (typeof value === "object")
            return <Attribute item={datarow} label={name} attribute_name={name} attribute_value_result={`${value?.fullname || value?.name || value?.id}`} />
        else
            return <Attribute item={datarow} label={name} attribute_name={name} attribute_value_result={value || ""} />
    }
    
}

export const MediumContent = ({ item, children }) => {
    return (
        <>
            {Object.entries(item).map(([attribute_name, attribute_value]) => {
                // if (attribute_name !== "id") return null
                if (Array.isArray(attribute_value)) return null
                if (attribute_value)
                    return (
                        <NonPriorityAttributeValue key={attribute_name} datarow={item} name={attribute_name} />
                    )
                else return null
            })}
            {Object.entries(item).map(([attribute_name, attribute_value]) => {
                if (attribute_value !== null) return null
                if (attribute_value)
                    return null
                else
                    return (
                        <NonPriorityAttributeValue key={attribute_name} datarow={item} name={attribute_name} />
                    )
            })}
            {children}
        </>
    )
}
