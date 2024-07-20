'use client';
import Board from '@/components/board/Board';
import ColorSelect from '@/components/room/ColorSelect';
import ConnectionState from '@/components/room/ConnectionState';
import RoomChat from '@/components/room/RoomChat';
import RoomInfo from '@/components/room/RoomInfo';
import RoomLogin from '@/components/room/RoomLogin';
import { ConnectionStatus, RoomContext } from '@/context/RoomContext';
import { useContext } from 'react';
import PlayerList from '../../../../components/room/PlayerList';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import AutoSizer from 'react-virtualized-auto-sizer';

export default function Room() {
    const { connectionStatus, roomData, nickname, disconnect } =
        useContext(RoomContext);

    if (connectionStatus === ConnectionStatus.UNINITIALIZED) {
        return <RoomLogin />;
    }

    // something went wrong attempting to connect to the server, show the login
    // page which when submitted will restart the connection process, or show an
    // adequate error message on failure
    if (connectionStatus === ConnectionStatus.CLOSED && !roomData) {
        return <RoomLogin />;
    }

    return (
        <Box flex="column" flexGrow={1} p={2}>
            <AutoSizer>
                {({ width, height }) => (
                    <Box
                        width={width}
                        height={height}
                        display="flex"
                        flexDirection="column"
                    >
                        <Box
                            display="flex"
                            columnGap={2}
                            maxHeight="30%"
                            pb={2}
                        >
                            <Box>
                                <RoomInfo />
                            </Box>
                            <Box>
                                <Card>
                                    <CardContent>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            flexGrow={1}
                                        >
                                            <Typography
                                                variant="h6"
                                                flexGrow={1}
                                            >
                                                Playing as {nickname}
                                            </Typography>
                                            {connectionStatus !==
                                                ConnectionStatus.CLOSED && (
                                                <Button onClick={disconnect}>
                                                    Disconnect
                                                </Button>
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography>
                                                Choose your color
                                            </Typography>
                                            <ColorSelect />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                        <Box display="flex" maxHeight="70%" columnGap={8}>
                            <Box flexGrow={1} maxWidth="50%">
                                <Board />
                            </Box>
                            <Box>
                                <RoomChat />
                            </Box>
                            <Box>
                                <PlayerList />
                            </Box>
                        </Box>
                    </Box>
                )}
            </AutoSizer>
        </Box>
    );
}
