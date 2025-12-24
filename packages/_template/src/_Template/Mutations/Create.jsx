import { PermissionGate } from "../../../../dynamic/src/Hooks/useRoles"
import { LinkURI, MediumEditableContent } from "../Components"
import { useState } from "react"
import { ReadItemURI } from "../Pages/PageReadItem"
import { useCreateSession } from "../../../../dynamic/src/Hooks/useCreateSession"
import { InsertAsyncAction } from "../Queries"
import { AsyncStateIndicator } from "../../Base/Helpers/AsyncStateIndicator"
import { Dialog } from "../../Base/FormControls/Dialog"
import { ProxyLink } from "../../Base/Components/ProxyLink"
import { makeMutationURI } from "./helpers"


export const CreateURI = makeMutationURI(LinkURI, "create", { withId: false });

export const CreateLink = ({
    oneOfRoles=["superadmin"],
    mode="absolute",
    uriPattern=CreateURI,
    children,
    ...props
}) => (
    <PermissionGate oneOfRoles={oneOfRoles} mode={mode}>
        <ProxyLink to={uriPattern} {...props}>{children || "Vytvořit"}</ProxyLink>
    </PermissionGate>
);

const DefaultContent = MediumEditableContent
export const CreateButton = ({ 
    children, 
    mutationAsyncAction=InsertAsyncAction,
    oneOfRoles=["superadmin"],
    mode="absolute",
    DefaultContent: DefaultContent_ = DefaultContent,

    ...props 
}) => {
    const [visible, setVisible] = useState(false)
    const handleClick = () => {
        setVisible(prev => !prev)
    }

    return (
        <PermissionGate oneOfRoles={oneOfRoles} mode={mode}>
            <button {...props} onClick={handleClick}>{children || "Vytvořit nový"}</button>
            {visible && (
                <CreateDialog
                    onOk={handleClick}
                    onCancel={handleClick}
                    mutationAsyncAction={mutationAsyncAction}
                    DefaultContent={DefaultContent_}
                />
            )}
        </PermissionGate>
    )
}

const dummyFunc = () => null
export const CreateDialog = ({
    title = "Nový typ",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    onOk: handleOk = dummyFunc,
    onCancel: handleCancel = dummyFunc,
    mutationAsyncAction = InsertAsyncAction,
    DefaultContent: DefaultContent_ = DefaultContent,
    children,
    ...props
}) => {
    const session = useCreateSession({
        readUri: ReadItemURI,
        mutationAsyncAction,
        onAfterConfirm: handleOk,
        onAfterCancel: handleCancel
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
            <AsyncStateIndicator error={session.error} loading={session.saving} />
            <DefaultContent_ item={session.draft} onChange={session.onChange} onBlur={session.onBlur}>
                {children}
            </DefaultContent_>
        </Dialog>
    );
};

export const CreateBody = ({
    children,
    mutationAsyncAction = InsertAsyncAction,
    onOk,
    onCancel,
    DefaultContent: DefaultContent_=DefaultContent,
    oneOfRoles=["superadmin"],
    mode="absolute",    
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
        <PermissionGate oneOfRoles={oneOfRoles} mode={mode}>
            <DefaultContent_
                item={session.draft}
                onChange={session.onChange}
                onBlur={session.onBlur}
                {...props}
            >
                <AsyncStateIndicator error={session.error} loading={session.saving} />
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
            </DefaultContent_>
        </PermissionGate>
    );
};

