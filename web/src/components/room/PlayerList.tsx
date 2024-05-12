import { useContext } from 'react';
import { RoomContext } from '../../context/RoomContext';
import { Box, Paper, Typography } from '@mui/material';

export default function PlayerList() {
    const { players, roomData } = useContext(RoomContext);
    const racetimeConnected = !!roomData?.racetimeUrl;

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
                            <div className="pl-1 pt-1.5 text-sm">
                                Not connected
                            </div>
                        )}
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}
