'use server';

import { revalidatePath } from 'next/cache';

export async function createToken(name: string) {
    const res = await fetch('/api/tokens', {
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
    const res = await fetch(`/api/tokens/${id}`, {
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
    const res = await fetch(`/api/tokens/${id}`, {
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
    const res = await fetch(`/api/tokens/${id}`, {
        method: 'DELETE',
    });

    return {
        ok: res.ok,
        status: res.status,
    };
}
