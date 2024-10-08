import NextLink from 'next/link';
import { use } from 'react';
import { alertError } from '../../../lib/Utils';
import { redirect } from 'next/navigation';
import { Box, Button, Link, Typography } from '@mui/material';
import { RacetimeConnection } from '../../../types/RoomData';

interface RacetimeConnectionStatus {
    hasRacetimeConnection: boolean;
    racetimeUser: string;
}

async function checkRacetimeStatus(): Promise<
    RacetimeConnectionStatus | false
> {
    const res = await fetch('/api/connection/racetime');
    if (!res.ok) {
        return false;
    }
    const data = await res.json();
    return data;
}

export default function RacetimeIntegration() {
    const result = use(checkRacetimeStatus());

    if (!result) {
        return null;
    }

    const { hasRacetimeConnection, racetimeUser } = result;

    return (
        <div>
            <Typography variant="h6">racetime.gg</Typography>
            {!hasRacetimeConnection && (
                <Box display="flex" alignItems="center">
                    <Link href={`/api/connect/racetime`} component={NextLink}>
                        Connect to racetime.gg
                    </Link>
                </Box>
            )}
            {hasRacetimeConnection && (
                <Box display="flex" alignItems="center" columnGap={1}>
                    <Typography>Connected as {racetimeUser}</Typography>
                    <Button
                        color="error"
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
