import { ButtonWithDialog } from "@hrbolek/uoisfrontend-shared"
import { useRoles } from "../../../../dynamic/src/Hooks/useRoles"


export const GroupUpdate = ({ item, ...props }) => {
    const { can, roleNames } = useRoles(item, ["administrátor"])
    if (can)
        return (
            <ButtonWithDialog {...props}>
                GroupUpdate<br/>
                {JSON.stringify(roleNames)}
            </ButtonWithDialog>
        )
    else 
        return (<span className="btn btn-danger">Nemáte oprávnění</span>)
}