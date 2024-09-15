import { serverFetch } from '../../../ServerUtils';
import TokenTable from './TokenTable';

export interface ApiToken {
    id: string;
    name: string;
    active: boolean;
    token: string;
    revokedOn?: string;
}

async function getTokens(): Promise<ApiToken[]> {
    const res = await serverFetch('/api/tokens');
    if (!res.ok) {
        return [];
    }
    return res.json();
}

export default async function Keys() {
    const tokens = await getTokens();

    return (
        <>
            <TokenTable tokens={tokens} />
        </>
    );
}
