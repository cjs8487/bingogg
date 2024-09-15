'use server';

import { serverFetch } from '../app/ServerUtils';

export async function register(
    email: string,
    username: string,
    password: string,
): Promise<
    {
        status: number;
    } & ({ ok: false; message: string } | { ok: true })
> {
    const res = await serverFetch('/api/registration/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            username,
            password,
        }),
    });

    if (!res.ok) {
        return {
            ok: false,
            status: res.status,
            message: await res.text(),
        };
    }

    return {
        ok: true,
        status: res.status,
    };
}
