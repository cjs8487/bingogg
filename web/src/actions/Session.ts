'use server';

import { serverFetch } from '../app/ServerUtils';

export async function login(username: string, password: string) {
    const res = await serverFetch(`/api/auth/login`, {
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
    const res = await serverFetch('api/logout', { method: 'POST' });

    return {
        ok: res.ok,
        status: res.status,
    };
}
