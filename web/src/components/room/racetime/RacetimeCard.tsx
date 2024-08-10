import Refresh from '@mui/icons-material/Refresh';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Link,
    Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { useRoomContext } from '../../../context/RoomContext';
import Timer from './Timer';
import { useUserContext } from '../../../context/UserContext';

export default function RacetimeCard() {
    const {
        roomData,
        createRacetimeRoom,
        updateRacetimeRoom,
        joinRacetimeRoom,
        racetimeReady,
        racetimeUnready,
    } = useRoomContext();
    const { loggedIn, user } = useUserContext();

    if (!roomData) {
        return null;
    }

    const { racetimeConnection } = roomData;
    if (!racetimeConnection) {
        return null;
    }

    const { gameActive, url, status } = racetimeConnection;
    if (!gameActive) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">racetime.gg</Typography>
                {!url && (
                    <>
                        <Typography fontStyle="italic" variant="body2">
                            Not connected
                        </Typography>
                        {loggedIn && (
                            <Button onClick={createRacetimeRoom}>
                                Create race room
                            </Button>
                        )}
                    </>
                )}
                {url && (
                    <Box>
                        <Box display="flex" alignItems="center">
                            <Link
                                component={NextLink}
                                href={url}
                                target="_blank"
                            >
                                Connected
                            </Link>
                            <IconButton onClick={updateRacetimeRoom}>
                                <Refresh />
                            </IconButton>
                            {user?.racetimeConnected && (
                                <>
                                    <Button onClick={joinRacetimeRoom}>
                                        Join Race
                                    </Button>
                                    <Button onClick={racetimeReady}>
                                        Ready
                                    </Button>
                                    <Button onClick={racetimeUnready}>
                                        Not ready
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                )}
                {status && (
                    <>
                        <Typography>{status}</Typography>
                        <Timer />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
