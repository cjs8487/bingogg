import { useContext, useMemo } from 'react';
import { ConnectionStatus, RoomContext } from '../../context/RoomContext';
import { Box, Card, CardContent, Paper, Typography } from '@mui/material';

function getStatusContents(status: ConnectionStatus) {
    switch (status) {
        case ConnectionStatus.UNINITIALIZED:
            return {
                color: '',
                text: 'Uninitialized',
            };
        case ConnectionStatus.CONNECTING:
            return {
                color: 'success.light',
                text: 'Connecting',
            };
        case ConnectionStatus.CONNECTED:
            return {
                color: 'success.dark',
                text: 'Connected',
            };
        case ConnectionStatus.UNAUTHORIZED:
            return {
                color: 'error.dark',
                text: 'Unauthorized',
            };
        case ConnectionStatus.CLOSING:
            return {
                color: 'warning.main',
                text: 'Disconnecting',
            };
        case ConnectionStatus.CLOSED:
            return {
                color: '',
                text: 'Disconnected',
            };
        default:
            return {
                color: '',
                text: 'Unknown connection status',
            };
    }
}

export default function ConnectionState() {
    const { connectionStatus } = useContext(RoomContext);

    const contents = getStatusContents(ConnectionStatus.CONNECTED);

    return (
        <Paper elevation={8} sx={{ py: 1, backgroundColor: contents.color }}>
            <Typography>{contents.text}</Typography>
        </Paper>
    );
}
