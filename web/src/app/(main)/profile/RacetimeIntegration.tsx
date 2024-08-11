import NextLink from 'next/link';
import { use } from 'react';
import { alertError } from '../../../lib/Utils';
import { redirect } from 'next/navigation';
import { Box, Button, Link, Typography } from '@mui/material';

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
            <Typography variant="h6">racetime.gg</Typography>
            {!hasRacetimeConnection && (
                <Box display="flex" alignItems="center">
                    <Link
                        href={`/api/connect/racetime`}
                        component={NextLink}
                        className="rounded-md bg-black px-2 py-1"
                    >
                        Connect to racetime.gg
                    </Link>
                </Box>
            )}
            {hasRacetimeConnection && (
                <Box display="flex" alignItems="center" columnGap={1}>
                    <Typography>Connected as {racetimeUser}</Typography>
                    <Button
                        color="error"
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
                    </Button>
                </Box>
            )}
        </div>
    );
}
