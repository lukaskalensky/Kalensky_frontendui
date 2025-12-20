// import { URIRoot } from "../../uriroot";
import { ProxyLink } from "./ProxyLink";

const RegisterofLinks = {};
export const registerLink = (__typename, Link) => {
    const registeredLink = RegisterofLinks[__typename];
    if (!registeredLink) {
        RegisterofLinks[__typename] = Link;
    } else {
        // throw new Error(`Link for typename ${__typename} is already registered.`);
        console.warn(`Link for typename ${__typename} is already registered.`);
    }
}

export const GenericURIRoot = "/generic";

export const Link = ({ item, action, children }) => {
    const SpecificLink = item?.__typename ? RegisterofLinks[item.__typename] : null;
    if (SpecificLink && SpecificLink !== Link) {
        console.log('Using specific link for typename:', item.__typename);
        return <SpecificLink item={item} action={action}>{children}</SpecificLink>;
    }
    
    const label =
        children || item?.fullname || item?.name || item?.id || "Data Error";

    const to = item?.__typename && item?.id
        ? `${GenericURIRoot}/${item.__typename}/view/${item.id}`
        : "#";

    return <ProxyLink to={to}>{label}</ProxyLink>;
};
