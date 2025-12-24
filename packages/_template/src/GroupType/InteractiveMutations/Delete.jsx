import { useNavigate } from "react-router";
import { useGQLEntityContext } from "../../Base/Helpers/GQLEntityProvider";
import { AbsolutePermissionGate, useRoles as useRolePermission } from "../../../../dynamic/src/Hooks/useRoles"
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { LinkURI, MediumEditableContent } from "../Components";
import { Row } from "../../Base/Components/Row";
import { Col } from "../../Base/Components/Col";
import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { DeleteAsyncAction } from "../Queries";
import { AsyncStateIndicator } from "../../Base/Helpers/AsyncStateIndicator";

export const DeleteURI = LinkURI.replace('view', 'delete')


export const DeleteLink = ({ ...props }) => {
    // const { can, roleNames } = useRolePermission(item, ["administrátor"])
    const navigate = useNavigate()
    const handleClick = () => {
        navigate(CreateURI)
    }
    return (
        <AbsolutePermissionGate roles={["superadmin"]} >
            <button {...props} onClick={handleClick} />
        </AbsolutePermissionGate>
    )
}

export const DeleteItem = ({ children, mutationAsyncAction = DeleteAsyncAction }) => {
    const navigate = useNavigate();
    const { item } = useGQLEntityContext()
    // const { can, roleNames } = useRolePermission(item, ["administrátor"])
    const { loading, allowed, error } = useAbsoluteRoles(["superadmin"]);
    const {
        draft,
        dirty,
        loading: saving,
        onChange,
        onBlur,
        onCancel,
        commitNow
    } = useEditAction(mutationAsyncAction, item, {
        mode: "confirm",
        // onCommit: contextOnChange
    })

    const handleConfirm = async () => {
        const result = await commitNow(draft)
        console.log("handleConfirm", result)

        if (navigate) {
            const link = VectorItemsURI
            navigate(link, { replace: true })
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (!item) return null

    return (
        <div>
            <AsyncStateIndicator error={error} loading={loading} text="Ověřuji oprávnění..." />
            {!allowed && (
                <div>
                    <h1>
                        Nemáte oprávnění
                    </h1>
                    {/* <pre>{JSON.stringify(roleNames)}</pre> */}
                </div>
            )}
            {allowed && (
                <Row>
                    <Col></Col>
                    <Col>
                        <MediumEditableContent item={draft} onChange={onChange} onBlur={onBlur} >
                            {saving && <LoadingSpinner />}
                            {children}
                            <button
                                className="btn btn-warning form-control"
                                onClick={handleCancel}
                            // disabled={!dirty || saving}
                            >
                                Zrušit
                            </button>
                            <button
                                className="btn btn-primary form-control"
                                onClick={handleConfirm}
                            // disabled={!dirty || saving}
                            >
                                Smazat
                            </button>

                        </MediumEditableContent>
                    </Col>
                    <Col></Col>
                </Row>
            )}
        </div>

    )
}


