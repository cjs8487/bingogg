import { useContext } from 'react';
import { RoomContext } from '../../context/RoomContext';
import { Box, Paper, Typography } from '@mui/material';
import { Duration } from 'luxon';

export default function PlayerList() {
    const { players, roomData, joinRacetimeRoom } = useContext(RoomContext);
    const racetimeConnected = !!roomData?.racetimeConnection?.url;

    return (
        <Paper
            sx={{
                maxHeight: '100%',
                overflowY: 'auto',
                px: 1.5,
                pt: 1,
                pb: 1.5,
            }}
        >
            <Typography variant="h6" pb={1}>
                Connected Players
            </Typography>
            <Box display="flex" flexDirection="column" rowGap={3}>
                {players.map((player) => (
                    <Box key={player.nickname}>
                        <Box display="flex" columnGap={2}>
                            <Box
                                px={0.5}
                                style={{ background: player.color }}
                                border={1}
                                borderColor="divider"
                            >
                                <Typography>{player.goalCount}</Typography>
                            </Box>
                            <Typography>{player.nickname}</Typography>
                        </Box>
                        {racetimeConnected && (
                            <>
                                {!player.racetimeStatus.connected && (
                                    <Typography>Not connected</Typography>
                                )}
                                {player.racetimeStatus.connected && (
                                    <Typography>
                                        {player.racetimeStatus.username} -{' '}
                                        {player.racetimeStatus.status}
                                        {player.racetimeStatus.finishTime &&
                                            ` - ${Duration.fromISO(player.racetimeStatus.finishTime).toFormat('h:mm:ss')}`}
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}
