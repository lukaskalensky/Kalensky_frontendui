import { BaseUI } from "../../Base"
import { Attribute } from "../../Base/Components/Attribute"
import { CardCapsule } from "../Components"

export const UserMemberships = ({ item }) => {
    const { memberships } = item || []

    return (
        <CardCapsule item={item} title="Členství">
            <Memberships memberships={memberships} />
            {/* <AllRoles roles={rolesOn} /> */}
        </CardCapsule>
    )
}


export const Memberships = ({ memberships }) => {
    const groups = memberships.map(m => m?.group || {})
    const katedry = groups?.filter(g => g?.grouptype?.name === "katedra") || []
    const fakulty = groups?.filter(g => g?.grouptype?.name === "fakulta") || []
    const univerzity = groups?.filter(g => g?.grouptype?.name === "univerzita") || []
    
    return (
        <>
            {katedry.map(group => (
                <Attribute key={group.id} label="Katedra">
                    <BaseUI.Link item={group} />
                </Attribute>
            ))}
            {/* {katedry.length > 0 && <hr />}     */}
            {fakulty.map(group => (
                <Attribute key={group.id} label="Fakulta">
                    <BaseUI.Link item={group} />
                </Attribute>
            ))}
            {univerzity.map(group => (
                <Attribute key={group.id} label="Univerzita">
                    <BaseUI.Link item={group} />
                </Attribute>
            ))}
        </>
    )
}
