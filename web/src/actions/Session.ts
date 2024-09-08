'use server';

import { actionFetch } from './ActionUtils';

export async function login(username: string, password: string) {
    const res = await actionFetch(`/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {},
        body: JSON.stringify({ username, password }),
    });

    return {
        ok: res.ok,
        status: res.status,
    };
}

export async function logout() {
    const res = await actionFetch('api/logout', { method: 'POST' });

    return {
        ok: res.ok,
        status: res.status,
    };
}
