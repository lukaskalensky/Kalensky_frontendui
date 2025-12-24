import { useNavigate } from "react-router-dom";
import { useGQLEntityContext } from "../../Base/Helpers/GQLEntityProvider";
import { PermissionGate } from "../../../../dynamic/src/Hooks/useRoles"
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { LinkURI, MediumContent } from "../Components";
import { DeleteAsyncAction } from "../Queries";
import { AsyncStateIndicator } from "../../Base/Helpers/AsyncStateIndicator";
import { useState } from "react";
import { useCallback } from "react";
import { VectorItemsURI } from "../Pages";
import { ProxyLink, useLink } from "../../Base/Components/ProxyLink";
import { useMemo } from "react";
import { Dialog } from "../../Base/FormControls/Dialog";
import { makeMutationURI } from "./helpers";


export const DeleteURI = makeMutationURI(LinkURI, "delete", { withId: true });

export const DeleteLink = ({ 
    item, 
    preserveHash = true, 
    preserveSearch = true, 
    oneOfRoles=["superadmin"],
    mode="absolute",
    uriPattern=DeleteURI,
    ...props 
}) => {
    const to = useMemo(() => {
        const id = item?.id ?? "";
        return uriPattern.replace(":id", String(id));
    }, [uriPattern, item?.id]);

    return (
        <PermissionGate oneOfRoles={oneOfRoles} mode={mode}>
            <ProxyLink
                to={to}
                preserveHash={preserveHash}
                preserveSearch={preserveSearch}
                {...props}
            />
        </PermissionGate>
    );
};

const DefaultContent = MediumContent

export const DeleteButton = ({ 
    children, 
    mutationAsyncAction = DeleteAsyncAction, 
    oneOfRoles=["superadmin"],
    mode="absolute",
    DefaultContent: DefaultContent_ = DefaultContent,
    ...props 
}) => {
    // const { can, roleNames } = useRoles(item, ["superadmin"])
    const { follow } = useLink({ to: VectorItemsURI })
    const [visible, setVisible] = useState(false)
    const togleVisible = () => setVisible(prev => !prev)
    const handleOkClick = () => {
        setVisible(false)
        follow()
    }
    const handleCancelClick = () => {
        setVisible(false)
    }

    return (
        <PermissionGate oneOfRoles={oneOfRoles} mode={mode}>
            <button {...props} onClick={togleVisible}>{children || "Odstranit"}</button>
            {visible && (
                <DeleteDialog 
                    onOk={handleOkClick} 
                    onCancel={handleCancelClick} 
                    mutationAsyncAction={mutationAsyncAction}
                    DefaultContent={DefaultContent_}
                />
            )}
            {/* {JSON.stringify(visible)} */}
        </PermissionGate>
    )
}

const dummyFunc = () => null
export const DeleteDialog = ({
    title = "Odstranit",

    oklabel = "Odstranit",
    cancellabel = "Zrušit",
    onOk: handleOk = dummyFunc,
    onCancel: handleCancel = dummyFunc,
    mutationAsyncAction = DeleteAsyncAction,
    DefaultContent: DefaultContent_ = DefaultContent

}) => {
    const {
        item,
        // onChange: contextOnChange 
    } = useGQLEntityContext()
    const {
        commitNow,
        error,
        loading: saving
    } = useEditAction(mutationAsyncAction, item, { mode: "confirm" })

    const handleConfirm = useCallback(async () => {
        const result = await commitNow(item);
        handleOk(result);

        return result;
    }, [commitNow, handleOk, item]);

    return (
        <Dialog
            title={title}
            oklabel={oklabel}
            cancellabel={cancellabel}
            onCancel={handleCancel}
            onOk={handleConfirm}
        >
            <AsyncStateIndicator error={error} loading={saving} text={"Odstraňuji"} />
            <DefaultContent_ item={item} />
        </Dialog>
    )
}

export const DeleteBody = ({ 
    children, 
    mutationAsyncAction = DeleteAsyncAction,
    DefaultContent: DefaultContent_=DefaultContent,
    oneOfRoles=["superadmin"],
    mode="absolute"
}) => {
    const navigate = useNavigate();
    const { item } = useGQLEntityContext()

    const {
        loading: saving,
        error: savingError,
        commitNow
    } = useEditAction(mutationAsyncAction, item, {
        mode: "confirm",
        // onCommit: contextOnChange
    })

    const handleConfirm = useCallback(async () => {
        const result = await commitNow(item)
        console.log("handleConfirm", result)
        if (result && navigate) {
            navigate(VectorItemsURI, { replace: true })
        }
    }, [navigate, commitNow])

    const handleCancel = () => {
        navigate(-1)
    }

    if (!item) return null

    return (
        <PermissionGate oneOfRoles={oneOfRoles} mode={mode}>
            <DefaultContent_ item={item} >
                <AsyncStateIndicator error={savingError} loading={saving} text={"Odstraňuji"} />
                {children}
                <button
                    className="btn btn-warning form-control"
                    onClick={handleCancel}
                    disabled={saving}
                >
                    Zrušit
                </button>
                <button
                    className="btn btn-primary form-control"
                    onClick={handleConfirm}
                    disabled={saving}
                >
                    Smazat
                </button>

            </DefaultContent_>
        </PermissionGate>
    )
}
