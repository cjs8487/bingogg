import { useContext } from 'react';
import { ConnectionStatus, RoomContext } from '../../context/RoomContext';
import { Box, Card, CardContent, Paper, Typography } from '@mui/material';

export default function ConnectionState() {
    const { connectionStatus } = useContext(RoomContext);

    const padding = 'p-2';
    let contents;
    if (connectionStatus === ConnectionStatus.UNINITIALIZED) {
        contents = (
            <div className={`${padding} rounded-md bg-gray-600 bg-opacity-40`}>
                Uninitialized
            </div>
        );
    } else if (connectionStatus === ConnectionStatus.CONNECTING) {
        contents = (
            <div
                className={`${padding} rounded-md bg-orange-400 bg-opacity-80`}
            >
                Connecting
            </div>
        );
    } else if (connectionStatus === ConnectionStatus.CONNECTED) {
        contents = (
            <Typography bgcolor="success.main" textAlign="center">
                Connected
            </Typography>
        );
    } else if (connectionStatus === ConnectionStatus.UNAUTHORIZED) {
        contents = (
            <div className={`${padding} rounded-md bg-red-500 bg-opacity-80`}>
                Unauthorized
            </div>
        );
    } else if (connectionStatus === ConnectionStatus.CLOSING) {
        contents = (
            <div
                className={`${padding} rounded-md bg-orange-400 bg-opacity-80`}
            >
                Disconnecting
            </div>
        );
    } else if (connectionStatus === ConnectionStatus.CLOSED) {
        contents = (
            <div className={`${padding} rounded-md bg-gray-600 bg-opacity-80`}>
                Disconnected
            </div>
        );
    } else {
        contents = (
            <div className={`${padding} rounded-md bg-gray-600 bg-opacity-80`}>
                Unknown connection status
            </div>
        );
    }

    return (
        <Paper elevation={8} sx={{ py: 2 }}>
            {contents}
        </Paper>
    );
}
