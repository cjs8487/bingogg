'use client';
import { useState } from 'react';
import { createToken } from '../../../../actions/ApiTokens';
import { useRouter } from 'next/navigation';

export default function CreateTokenForm() {
    const [name, setName] = useState('');
    const router = useRouter();

    return (
        <>
            <input
                type="text"
                name="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
            />
            <button
                onClick={() => {
                    createToken(name);
                    router.refresh();
                }}
            >
                Create Token
            </button>
        </>
    );
}
