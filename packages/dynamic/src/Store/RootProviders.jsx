import { Provider as ReduxProvider } from "react-redux";
import { store } from "./Store";
import { createGraphQLClient } from "../Core/gqlClient2";
import { createContext, useContext, useMemo } from "react";

export const RootProviders = ({ children }) => (
    <GQLClientProvider>
        <ReduxProvider store={store}>
            {children}
        </ReduxProvider>
    </GQLClientProvider>
);

const GQLClientContext = createContext(null);

const GQLClientProvider = ({children}) => {
    const client = useMemo(
        () => createGraphQLClient({ /* sem pak endpoint, headers, ... */ }),
        []
    );
    return (
        <GQLClientContext.Provider value={client}>
            {children}
        </GQLClientContext.Provider>
    )
}

export const useGQLClient = () => {
    return useContext(GQLClientContext)
}