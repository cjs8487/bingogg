/**
 * Utility function for server actions provided by the Next server to React components. Not all utility functions
 * in this module are exposed, instead they are exported on an as needed basis.
 */
import { cookies } from 'next/headers';
import parser from 'set-cookie-parser';

/**
 * Fetch function that should be used for all fetches sent out by server actions to the API server. This
 * version of fetch handles forwarding cookies on both the outgoing request to the API server as well as
 * setting cookies from the response the server action response, which ensures session continuity. It also
 * sets the special API key into the Authentication header that gives the website access to protected
 * endpoints, such as session and user management endpoints.
 *
 * @param path The path to send the fetch to. This can be a relative path or an absolute URL. Relative
 *  paths are assumed to be realtive to the same api root as the proxy.
 * @param init Request properties. Values in this parameter are forwarded to the actual fetch call, but
 *  may be modified. Certain values may always be overwritten, such as the Content-Type and Authentication
 *  headers
 * @returns The fetch response object
 */
export async function actionFetch(path: string, init?: RequestInit) {
    const res = await fetch(getFullUrl(path), {
        ...init,
        headers: {
            ...(init?.headers ?? {}),
            'Content-Type': 'application/json',
            // forward client cookieos
            cookie: cookies()
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join('; '),
        },
    });

    // forward response cookies to the client
    parser(res.headers.getSetCookie()).forEach((cookie) => {
        cookies().set({
            name: cookie.name,
            value: cookie.value,
            httpOnly: cookie.httpOnly,
            path: cookie.path,
        });
    });

    return res;
}

/**
 * Determines the full URL for a request from a relative or absolute path.
 *
 * @param path Path to fetch from
 * @returns The full URL to the API server for the path
 */
function getFullUrl(path: string) {
    if (path.startsWith('http')) {
        return path;
    }
    if (path.startsWith('/')) {
        return `${process.env.NEXT_PUBLIC_API_PATH}${path}`;
    }
    return `${process.env.NEXT_PUBLIC_API_PATH}/${path}`;
}
