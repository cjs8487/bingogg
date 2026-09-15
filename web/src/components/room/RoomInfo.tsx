import { Box, Card, CardContent, Typography } from '@mui/material';
import { useContext } from 'react';
import { RoomContext } from '../../context/RoomContext';
import ConnectionState from './ConnectionState';

export default function RoomInfo() {
    const { roomData } = useContext(RoomContext);

    if (!roomData) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                    No Room Data found.
                </CardContent>
            </Card>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="h5">{roomData.name}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <ConnectionState />
            </Box>
            <Typography variant="subtitle1">
                <div>
                    {roomData.game} ({roomData.variant})
                </div>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        borderRight: 1,
                        borderColor: 'divider',
                        pr: 1,
                        mr: 1,
                    }}
                >
                    {roomData.mode}
                </Typography>
                <Typography variant="body2">{roomData.seed}</Typography>
            </Box>
        </Box>
    );
}
