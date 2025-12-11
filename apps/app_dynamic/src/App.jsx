import 'bootstrap/dist/css/bootstrap.min.css';

import { createGraphQLClient } from '@hrbolek/uoisfrontend-dynamic';
import { useAsyncAction, useAsyncThunkAction } from "@hrbolek/uoisfrontend-dynamic";
import { RootProviders } from "@hrbolek/uoisfrontend-dynamic";
import { createAsyncGraphQLAction2 } from '../../../packages/dynamic/src/Core/createAsyncGraphQLAction2';
import { reduceToFirstEntity } from '../../../packages/dynamic/src/Store/Middlewares';

const client = createGraphQLClient({
    endpoint: "/api/gql",
});

// const getSdl = () => client.sdl()
export const App = () => {
    const { data: sdl, loading, error } = useAsyncAction(
        // asyncFn: může ignorovat vars
        client.sdl,
        null,
        { deferred: false, network: true }
    );

    if (loading) {
        return <div>Načítám SDL…</div>;
    }

    if (error) {
        return <div>Chyba: {String(error.message ?? error)}</div>;
    }

    return (
        <RootProviders>
            <Page />
            <div>
                <h1>Hello world changed</h1>
                {sdl && (
                    <>
                        <h2>Service SDL</h2>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{sdl}</pre>
                    </>
                )}
            </div>
        </RootProviders>
    );
};


const meQuery = `{
  me {
    __typename
    id
    email
    name
    fullname
    surname
  }
}`

const meAsyncAction = createAsyncGraphQLAction2(meQuery, reduceToFirstEntity)

export const Page = () => {
    const { loading, error, data, entity } = useAsyncThunkAction(meAsyncAction, {id: "51d101a0-81f1-44ca-8366-6cf51432e8d6"})
    return (
        <div>
            {loading&&<div>Loading</div>}
            {error&&<div>{JSON.stringify(error)}</div>}
            {data&&<div>{JSON.stringify(data)}</div>}
            {entity&&<div>{JSON.stringify(entity)}</div>}
            Page
        </div>
    )
}