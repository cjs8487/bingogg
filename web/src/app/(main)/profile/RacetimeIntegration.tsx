import Link from 'next/link';
import { use } from 'react';
import { alertError } from '../../../lib/Utils';
import { redirect } from 'next/navigation';

async function checkRacetimeStatus() {
    const res = await fetch('/api/connection/racetime');
    if (!res.ok) {
        alertError('Unable to retrieve racetime connection data.');
        return false;
    }
    const data = await res.json();
    return data;
}

export default function RacetimeIntegration() {
    const { hasRacetimeConnection, racetimeUser } = use(checkRacetimeStatus());

    return (
        <div>
            <div className="text-lg">racetime.gg</div>
            {!hasRacetimeConnection && (
                <>
                    <div>Not connected</div>

                    <Link
                        href={`/api/connect/racetime`}
                        className="rounded-md bg-black px-2 py-1"
                    >
                        Connect to racetime.gg
                    </Link>
                </>
            )}
            {hasRacetimeConnection && (
                <>
                    Connected as {racetimeUser}.{' '}
                    <button
                        className="rounded-md bg-red-500 px-1 py-0.5 text-xs"
                        onClick={async () => {
                            const res = await fetch(
                                '/api/connection/disconnect/racetime',
                                { method: 'POST' },
                            );
                            if (!res.ok) {
                                alertError(
                                    'Unable to disconnect from racetime.gg',
                                );
                                redirect('/profile');
                            }
                        }}
                    >
                        Disconnect
                    </button>
                </>
            )}
        </div>
    );
}
