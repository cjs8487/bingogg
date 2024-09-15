'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../app/ServerUtils';

export async function createToken(name: string) {
    const res = await serverFetch('/api/tokens', {
        method: 'POST',
        body: JSON.stringify({
            name,
        }),
    });

    revalidatePath('/staff');
    return {
        ok: res.ok,
        status: res.status,
    };
}

export async function deactivateToken(id: string) {
    const res = await serverFetch(`/api/tokens/${id}`, {
        method: 'POST',
        body: JSON.stringify({ active: false }),
    });

    revalidatePath('/staff');
    return {
        ok: res.ok,
        status: res.status,
    };
}

export async function activateToken(id: string) {
    const res = await serverFetch(`/api/tokens/${id}`, {
        method: 'POST',
        body: JSON.stringify({ active: true }),
    });

    revalidatePath('/staff');
    return {
        ok: res.ok,
        status: res.status,
    };
}

export async function revokeToken(id: string) {
    const res = await serverFetch(`/api/tokens/${id}`, {
        method: 'DELETE',
    });

    revalidatePath('/staff');
    return {
        ok: res.ok,
        status: res.status,
    };
}
