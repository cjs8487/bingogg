'use server';

export async function createToken(name: string) {
    const res = await fetch('/api/tokens', {
        method: 'POST',
        body: JSON.stringify({
            name,
        }),
    });

    return {
        ok: res.ok,
        status: res.status,
    };
}
