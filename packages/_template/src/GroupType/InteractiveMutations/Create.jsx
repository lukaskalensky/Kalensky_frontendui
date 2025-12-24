import { useNavigate } from "react-router"
import { AbsolutePermissionGate, useRoles as useRolePermission } from "../../../../dynamic/src/Hooks/useRoles"
import { LinkURI, MediumEditableContent } from "../Components"
import { useState } from "react"
import { Dialog, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"
import { ReadItemURI } from "../Pages/PageReadItem"
import { useCreateSession } from "./useCreateSession"
import { InsertAsyncAction } from "../Queries"

export const CreateURI = LinkURI.replace('view', 'create')

export const CreateLink = ({ ...props }) => {
    // const { can, roleNames } = useRolePermission(item, ["administrátor"])
    const navigate = useNavigate()
    const handleClick = () => {
        navigate(CreateURI)
    }
    return (
        <AbsolutePermissionGate roles={["superadmin"]} >
            {/* <button {...props} onClick={handleClick} /> */}
            <a href="/#create" {...props} onClick={handleClick} >Create</a>
        </AbsolutePermissionGate>
    )
}

export const CreateButton = ({ children, ...props }) => {
    const [visible, setVisible] = useState(false)
    const handleClick = (state) => () => {
        setVisible(state)
    }
    return (
        <AbsolutePermissionGate>
            <button {...props} onClick={handleClick(!visible)}>{children || "Vytvořit nový"}</button>
            {visible && <CreateDialog onOk={handleClick(false)} onCancel={handleClick(false)} />}
        </AbsolutePermissionGate>
    )
}

export const CreateDialog = ({
    title = "Editace",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    mutationAsyncAction = InsertAsyncAction,
    onOk,
    onCancel,
    children,
    ...props
}) => {
    const session = useCreateSession({
        mutationAsyncAction,
        onAfterConfirm: async (result) => {
            if (onOk) onOk(result);
        },
        onAfterCancel: async () => {
            if (onCancel) onCancel();
        },
    });

    return (
        <Dialog
            title={title}
            oklabel={oklabel}
            cancellabel={cancellabel}
            onCancel={session.handleCancel}
            onOk={session.handleConfirm}
            {...props}
        >
            <MediumEditableContent item={session.draft} onChange={session.onChange} onBlur={session.onBlur}>
                {session.saving && <LoadingSpinner />}
                {session.error && <ErrorHandler errors={session.error} />}
                {children}
            </MediumEditableContent>
        </Dialog>
    );
};

export const CreateBody = ({
    children,
    mutationAsyncAction = InsertAsyncAction,
    onOk,
    onCancel,
    ...props
}) => {
    const session = useCreateSession({
        readUri: ReadItemURI,
        mutationAsyncAction,
        onAfterConfirm: async (result, draft) => {
            if (onOk) return onOk(result, draft);
            // když onOk není, session udělá default navigaci
        },
        onAfterCancel: async () => {
            if (onCancel) return onCancel();
            // když onCancel není, session udělá default navigate(-1)
        }
    });

    return (
        <MediumEditableContent
            item={session.draft}
            onChange={session.onChange}
            onBlur={session.onBlur}
            {...props}
        >
            {session.saving && <LoadingSpinner />}
            {session.error && <ErrorHandler errors={session.error} />}
            {children}

            <button
                className="btn btn-warning form-control"
                onClick={session.handleCancel}
            // disabled={!session.dirty || session.saving}
            >
                Zrušit změny
            </button>

            <button
                className="btn btn-primary form-control"
                onClick={session.handleConfirm}
            // disabled={!session.dirty || session.saving}
            >
                Uložit změny
            </button>
        </MediumEditableContent>
    );
};

