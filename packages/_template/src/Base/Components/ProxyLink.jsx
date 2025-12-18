import React from "react";
import { Link, useResolvedPath } from "react-router-dom";

/**
 * shared module.
 * @module shared/components
 */

/**
 * A `ProxyLink` component that conditionally reloads the document based on whether the link's target
 * is local or external. It also preserves existing hash and query parameters from the current URL
 * and appends them to the target path if they are not already specified.
 *
 * @param {Object} props - The properties for the ProxyLink component.
 * @param {string} props.to - The target path or URL for the link.
 * @param {React.ReactNode} props.children - The content to render inside the link.
 * @param {boolean} [props.preserveHash=true] - Flag indicating whether to preserve the current URL's hash.
 * @param {boolean} [props.preserveSearch=true] - Flag indicating whether to preserve the current URL's query parameters.
 * @param {Object} [props.others] - Additional props to pass to the underlying React Router `Link` component.
 *
 * @returns {JSX.Element} A React Router `Link` component with conditional reload behavior and parameter preservation.
 *
 * @example
 * // Example usage:
 * <ProxyLink to="/local-path">Local Link</ProxyLink>
 * <ProxyLink to="https://external-site.com">External Link</ProxyLink>
 */
export const ProxyLink = ({ to, children, preserveHash=true, preserveSearch=true, ...others }) => {
    const { pathname } = useResolvedPath(to); // Resolves the target path
    const base = pathname.split("/")[1]; // Extracts the base path from the resolved path

    // Determines if the target path is local to the current application
    const isLocal = window.location.pathname.startsWith(`/${base}`);

    // Preserve existing hash and query parameters
    const currentUrl = new URL(window.location.href);
    const currentHash = preserveHash ? currentUrl.hash : ''; // Extracts the current hash
    const currentSearch = preserveSearch ? currentUrl.search : ''; // Extracts the current query parameters

    const destinationUrl = new URL(to, window.location.origin); // Resolve `to` as a complete URL
    // const destinationUrl_hash = destinationUrl.hash
    destinationUrl.search = destinationUrl.search || currentSearch; // Merge query parameters if missing
    destinationUrl.hash = destinationUrl.hash || currentHash; // Merge hash if missing
    // destinationUrl.hash = ""
    return (
        <Link to={destinationUrl.pathname + destinationUrl.search + destinationUrl.hash} {...others} reloadDocument={!isLocal}>
            {children}
        </Link>
    );
};

