import { ButtonWithDialog } from "@hrbolek/uoisfrontend-shared"
import { useRoles } from "../../../../dynamic/src/Hooks/useRoles"


export const GroupGDPR = ({ item, ...props }) => {
    const { can, roleNames } = useRoles(item, ["zpracovatel gdpr"])
    if (can)
        return (
            <ButtonWithDialog {...props}>
                GroupGDPR<br/>
                {JSON.stringify(roleNames)}
            </ButtonWithDialog>
        )
    else 
        return (<span className="btn btn-danger">Nemáte oprávnění</span>)
}