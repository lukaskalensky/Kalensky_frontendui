
import { ReadPageAsyncAction } from "../Queries"
import { useInfiniteScroll } from "../../../../dynamic/src/Hooks/useInfiniteScroll"
import { Table } from "../../Base/Components/Table"
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"

export const PageVector = ({ children, queryAsyncAction=ReadPageAsyncAction }) => {
    const { items, loading, error, hasMore, sentinelRef, loadMore } = useInfiniteScroll(
        {
            asyncAction:queryAsyncAction, 
            actionParams: { skip: 0, limit: 10 }
        }
    )
    
    // const items = []
    return (
        <>
            {/* <PageNavbar /> */}
            <Table data={items} />
            
            {error && <ErrorHandler errors={error} />}
            {loading && <LoadingSpinner text="Nahrávám další..." />}
            
            {hasMore && <div ref={sentinelRef} style={{ height: 80, backgroundColor: "lightgray" }} />}            
            {hasMore && <button className="btn btn-success form-control" onClick={() => loadMore()}>Více</button>}  
        </>
    )
}

