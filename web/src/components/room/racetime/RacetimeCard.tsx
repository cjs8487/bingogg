import Refresh from '@mui/icons-material/Refresh';
import {
    Button,
    Card,
    CardContent,
    IconButton,
    Link,
    Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { useRoomContext } from '../../../context/RoomContext';
import Timer from './Timer';

export default function RacetimeCard() {
    const { roomData, createRacetimeRoom, updateRacetimeRoom } =
        useRoomContext();
    if (!roomData) {
        return null;
    }

    const { racetimeConnection } = roomData;
    if (!racetimeConnection) {
        return null;
    }

    const { gameActive, url } = racetimeConnection;
    if (!gameActive) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">racetime.gg</Typography>
                {!url && (
                    <Button onClick={createRacetimeRoom}>
                        Create racetime.gg race
                    </Button>
                )}
                {url && (
                    <>
                        Connected{' '}
                        <Link component={NextLink} href={url} target="_blank">
                            {url}
                        </Link>
                        <IconButton onClick={updateRacetimeRoom}>
                            <Refresh />
                        </IconButton>
                    </>
                )}
                <Timer />
            </CardContent>
        </Card>
    );
}
