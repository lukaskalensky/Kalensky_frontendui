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
export const LinkURI = GenericURIRoot + "/view/";
export const VectorItemsURI = GenericURIRoot + "/list/";

export const Link = ({ item, action="view", children, ...others }) => {
    const SpecificLink = item?.__typename ? RegisterofLinks[item.__typename] : null;
    if (SpecificLink && SpecificLink !== Link) {
        // console.log('Using specific link for typename:', item.__typename);
        return <SpecificLink item={item} action={action} {...others}>{children}</SpecificLink>;
    }
    
    const label =
        children || item?.fullname || item?.name || item?.id || "Missing";

    const to = item?.__typename && item?.id
        ? `${GenericURIRoot}/${item.__typename}/${action}/${item.id}`
        : "#";

    return <ProxyLink to={to} {...others}>{label}</ProxyLink>;
};

export const makeMutationURI = (linkURI, action, { withId = false } = {}) => {
    const viewSegmentRe = /\/view(\/|$)/;
    if (!viewSegmentRe.test(linkURI)) throw new Error(`LinkURI must contain '/view'. Got: ${linkURI}`);

    const base = linkURI.replace(viewSegmentRe, `/${action}$1`).replace(/\/?$/, "/");
    return withId ? `${base}:id` : base.replace(/\/$/, "");
};