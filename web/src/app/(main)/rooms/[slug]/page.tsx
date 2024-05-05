'use client';
import Board from '@/components/board/Board';
import ColorSelect from '@/components/room/ColorSelect';
import RoomChat from '@/components/room/RoomChat';
import RoomInfo from '@/components/room/RoomInfo';
import RoomLogin from '@/components/room/RoomLogin';
import { ConnectionStatus, RoomContext } from '@/context/RoomContext';
import {
    Box,
    Button,
    Card,
    CardContent,
    Link,
    Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { useContext } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import PlayerList from '../../../../components/room/PlayerList';

export default function Room() {
    const {
        connectionStatus,
        roomData,
        nickname,
        disconnect,
        createRacetimeRoom,
    } = useContext(RoomContext);

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
                            <Box>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">
                                            racetime.gg
                                        </Typography>
                                        {!roomData?.racetimeUrl && (
                                            <Button
                                                onClick={createRacetimeRoom}
                                            >
                                                Create racetime.gg race
                                            </Button>
                                        )}
                                        {roomData?.racetimeUrl && (
                                            <>
                                                Connected{' '}
                                                <Link
                                                    component={NextLink}
                                                    href={roomData.racetimeUrl}
                                                >
                                                    {roomData.racetimeUrl}
                                                </Link>
                                            </>
                                        )}
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
