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
        <Box flex="column" flexGrow={1}>
            <Box display="flex" className="flex h-[30%] gap-x-4 pb-4">
                <Box>
                    <RoomInfo />
                </Box>
                <Box>
                    <Card className="flex h-fit flex-col gap-y-3 rounded-md border border-border bg-foreground p-3">
                        <CardContent>
                            <Box
                                display="flex"
                                alignItems="center"
                                flexGrow={1}
                            >
                                <Typography
                                    variant="h6"
                                    flexGrow={1}
                                    className="float-left text-lg font-semibold"
                                >
                                    Playing as {nickname}
                                </Typography>
                                {connectionStatus !==
                                    ConnectionStatus.CLOSED && (
                                    <Button
                                        className="float-right rounded-md border bg-background px-2 py-1 shadow-md shadow-white/20 hover:bg-border"
                                        onClick={disconnect}
                                    >
                                        Disconnect
                                    </Button>
                                )}
                            </Box>
                            <Box className="rounded-md border bg-background p-2 shadow-md shadow-white/20">
                                <Typography className="pb-1 font-semibold">
                                    Choose your color
                                </Typography>
                                <ColorSelect />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
            <Box display="flex" flexGrow={1}>
                <Box maxHeight="100%" maxWidth="50%" flexGrow={1}>
                    <Board />
                </Box>
                <div>
                    <RoomChat />
                </div>
                <div>
                    <PlayerList />
                </div>
            </Box>
        </Box>
    );
}
