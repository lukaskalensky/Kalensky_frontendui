import { useParams } from "react-router"
import { createAsyncGraphQLAction2 } from '../../../../dynamic/src/Core/createAsyncGraphQLAction2';
import { introspectionQuery } from '../../../../dynamic/src/Core/gqlClient2';
import { useAsync } from '../../../../dynamic/src/Hooks';
import { MediumCard } from '../Components/MediumCard'
import { Col } from '../Components/Col';
import { GQLEntityProvider, useGQLEntityContext } from '../Helpers/GQLEntityProvider';
import { Row } from '../Components/Row';
import { MediumCardScalars } from '../Scalars/ScalarAttribute';
import { MediumCardVectors } from '../Vectors/VectorAttribute';
import { LargeCard } from "../Components/LargeCard";

const HomeLink = () => {
    const { goToHome } = useGQLEntityContext();
    const onClick = async (e) => {
        e.preventDefault();
        // setLoading(true);
        goToHome()
        // setLoading(false);                
    }
    return (
        <a href="#" onClick={onClick}>🏠</a>
    )
}

export const PageContent = ({ children }) => {
    const { data } = useGQLEntityContext()
    return (

        <div className="container-fluid mt-5">
            <div><HomeLink /></div>
            <LargeCard item={data}>
                {children}
            </LargeCard>
        </div>
    );
}

const introspectionAction = createAsyncGraphQLAction2(introspectionQuery)

export const Page = ({ item, children }) => {
    const { typename, id } = useParams()
    const { loading, error, data } = useAsync(introspectionAction)
    // console.log("BaseUI.Page", data)
    if (loading) return (<div>Loading</div>)
    if (error) return (<div>{JSON.stringify(error)}</div>)
    if (data) {
        const introspection = data.data;
        
        return (
            <GQLEntityProvider introspection={introspection} entity= {{__typename: typename, id}}>
                {/* <Binded /> */}
                <PageContent />
            </GQLEntityProvider>
        )
    }
    return (<div>Neco je spatne</div>)
}