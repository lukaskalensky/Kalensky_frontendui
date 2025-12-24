import { ButtonWithDialog, Dialog, ErrorHandler, Input, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"
import { AbsolutePermissionGate, useAbsoluteRoles, useRoles as useRolePermission, useRoles} from "../../../../dynamic/src/Hooks/useRoles"
import { useAsync } from "../../../../dynamic/src/Hooks"
import { UpdateAsyncAction } from "../Queries"
import { EntityLookup } from "../../Base/FormControls/EntityLookup"
import { SearchAsyncAction } from "../Queries/SearchAsyncAction"
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction"
import { useNavigate, useSearchParams } from "react-router"
import { useState } from "react"
import { LinkURI, LiveEdit, MediumEditableContent } from "../Components"
import { useCallback } from "react"
import { useGQLEntityContext } from "../../Base/Helpers/GQLEntityProvider"
import { useMemo } from "react"

export const UpdateURI = `${LinkURI.replace('view', 'edit')}:id`

export const UpdateLink = ({item, ...props}) => {
    const Link = useMemo(() => {
        return UpdateURI.replace(":id", id)
    }, [item])

    const navigate = useNavigate()
    const handleClick = (e) => {
        e.preventDefault()
        navigate(Link)
    }
    return (
        <AbsolutePermissionGate roles={["superadmin"]} >
            <a href={Link} {...props} onClick={handleClick} />
        </AbsolutePermissionGate>
    )
}

export const UpdateButton = ({children, ...props}) => {
    // const { can, roleNames } = useRoles(item, ["superadmin"])
    const [visible, setVisible] = useState(false)
    const handleClick = (state) => () => {
        setVisible(state)
    }
    
    return (
        <AbsolutePermissionGate roles={["superadmin"]} >
            <button {...props} onClick={handleClick(!visible)}>{children || "Editovat"}</button>
            {visible && <UpdateDialog onOk={handleClick(false)} onCancel={handleClick(false)} />}
        </AbsolutePermissionGate>
    )
}

export const UpdateDialog = ({
    title = "Editace",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    onOk: handleOk,
    onCancel: handleCancel,
}) => {
    const { item, onChange: contextOnChange } = useGQLEntityContext()
    const {
        draft,
        onChange, 
        onBlur,
        onCancel,
        onConfirm,
        error,
        loading: saving
    } = useEditAction(UpdateAsyncAction, item, {mode: "confirm"})

    const handleCancel_ = useCallback(async () => {
        onCancel()
        handleCancel()
    }, [onCancel, handleCancel])

    const handleConfirm = useCallback(async () => {
        const result = await onConfirm();
        console.log("ConfirmEdit handleConfirm result", result, "draft", draft)
        if (result) {
            const event = { target: { value: result } };
            // důležité: použij params z kontextu (provider si je drží jako "poslední vars")
            await contextOnChange(event);
        }
        handleOk()
        return result;
    }, [onConfirm, contextOnChange]);

    return (
        <Dialog 
            title={title}
            oklabel={oklabel}
            cancellabel={cancellabel}
            onCancel={handleCancel_} 
            onOk={handleConfirm}
        >
            {error && <ErrorHandler errors={error} />}
            {saving && <LoadingSpinner text="Ukládám" />}
            <MediumEditableContent item={item} onChange={onChange} onBlur={onBlur} />
        </Dialog>
    )
}

export const Update = ({ item, ...props }) => {
    const { can, roleNames } = useRoles(item, ["superadmin"])
    // const { loading, error, data, entity, run } = useAsync(UpdateAsyncAction, {}, { deferred: true })
    const {
        error,
        loading,
        commitNow: run
    } = useEditAction(UpdateAsyncAction, item, {
        mode: "live", 
        // onCommit: contextOnChange
    })
    const handleConfirm = async (e) => {
        // const { target={} } = e || {}
        // const { value } = target?.value
        console.log("confirmed", e)
        if (e) {
            const result = await run(e)
            console.log("response", result)
        }
        // newId.current = crypto.randomUUID()
    }
    return (<>HI</>)
    if (true)
        return (
            <>
                {error && <ErrorHandler errors={error} />}
                {loading && <LoadingSpinner text="Upravuji..." />}
                <ButtonWithDialog {...props} params={item} onClick={handleConfirm}>
                    Update<br />
                    <Input id={"name"} label={"Název"} className="form-control" value={item?.name || "Název typu"} />
                    <Input id={"name_en"} label={"Anglický název"} className="form-control" value={item?.nameEn || "Type name"} />
                    <EntityLookup 
                        id={"mastertypeId"}
                        label="Nadřízený typ"
                        className="form-control"
                        value={item?.mastertype}
                        asyncAction={SearchAsyncAction}
                        // onSelect={handleSelect}
                    />
                    {JSON.stringify(item)}<br />
                    {JSON.stringify(roleNames)}
                </ButtonWithDialog>
            </>

        )
    else
        return (<span className="btn btn-danger">Nemáte oprávnění</span>)
}

export const UpdateItem = ({mutationAsyncAction=UpdateAsyncAction}) => {
    const { item } = useGQLEntityContext()
    const { can, roleNames } = useRolePermission(item, ["administrátor"])

    if (!item) return null  
    if (false) return (
        <div>
            <h1>
                Nemáte oprávnění
            </h1>
            <pre>{JSON.stringify(roleNames)}</pre>
        </div>
    )
    return (
        <LiveEdit item={item} mutationAsyncAction={mutationAsyncAction}/>
    )    
}

const onDone_=() => null;

export const UpdateItemConfirm = ({ onDone=onDone_, children }) => {
    const { item, onChange: contextOnChange } = useGQLEntityContext()
    
    const {
        draft,
        dirty,
        onChange, 
        onBlur,
        onCancel,
        onConfirm,
        error,
        loading: saving
    } = useEditAction(UpdateAsyncAction, item, {mode: "confirm"})

    const handleCancel = useCallback(async () => {
        onCancel()
        onDone()
    }, [onDone, onCancel])

    const handleConfirm = useCallback(async () => {
        const result = await onConfirm();
        console.log("ConfirmEdit handleConfirm result", result, "draft", draft)
        if (result) {
            const event = { target: { value: result } };
            // důležité: použij params z kontextu (provider si je drží jako "poslední vars")
            await contextOnChange(event);
        }
        onDone()
        return result;
    }, [onDone, onConfirm, contextOnChange]);


    return (<>
        {error && <ErrorHandler errors={error} />}
        {saving && <LoadingSpinner text="Ukládám" />}
        <MediumEditableContent item={item} onChange={onChange} onBlur={onBlur} >
            {children}
            <hr />
            {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
            <button 
                className="btn btn-warning form-control" 
                onClick={handleCancel}
                disabled={!dirty || loading}
            >
                Zrušit změny
            </button>
            <button 
                className="btn btn-primary form-control" 
                onClick={handleConfirm}
                disabled={!dirty || loading}
            >
                Uložit změny
            </button>
        </MediumEditableContent>
        </>
    )
}