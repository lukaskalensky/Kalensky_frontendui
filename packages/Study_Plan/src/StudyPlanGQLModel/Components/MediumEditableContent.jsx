import { Input } from "../../../../_template/src/Base/FormControls/Input"

export const MediumEditableContent = ({ item, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    return (
        <>
            <Input id={"semesterId"} label={"ID semestru (UUID)"} className="form-control" value={item?.semesterId || ""} onChange={onChange} onBlur={onBlur} />
            <Input id={"examId"} label={"ID zkoušky (UUID, volitelné)"} className="form-control" value={item?.examId || ""} onChange={onChange} onBlur={onBlur} />
            {children}
        </>
    )
}
