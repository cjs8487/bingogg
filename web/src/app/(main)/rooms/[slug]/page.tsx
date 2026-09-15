'use client';
import Board from '@/components/board/Board';
import PlayerInfo from '@/components/room/PlayerInfo';
import RoomChat from '@/components/room/RoomChat';
import RoomInfo from '@/components/room/RoomInfo';
import RoomLogin from '@/components/room/RoomLogin';
import Timer from '@/components/room/timer/Timer';
import TimerControls from '@/components/room/timer/TimerControls';
import TimingMethodSelector from '@/components/room/timer/TimingMethodSelector';
import { ConnectionStatus, useRoomContext } from '@/context/RoomContext';
import {
    alpha,
    Box,
    Dialog,
    DialogContent,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import PlayerList from '../../../../components/room/PlayerList';
import RoomHeader from '../../../../components/room/RoomHeader';
import SettingsPanel from '../../../../components/room/SettingsPanel';
import ConnectionState from '../../../../components/room/ConnectionState';

export default function Room() {
    const { connectionStatus, roomData } = useRoomContext();

    let showLogin = false;
    if (connectionStatus === ConnectionStatus.UNINITIALIZED) {
        showLogin = true;
    }

    // something went wrong attempting to connect to the server, show the login
    // page which when submitted will restart the connection process, or show an
    // adequate error message on failure
    if (connectionStatus === ConnectionStatus.CLOSED && !roomData) {
        showLogin = true;
    }

    return (
        <>
            <RoomHeader />
            <Box sx={{ width: '100%', height: '100%', maxHeight: '100%' }}>
                <Box
                    sx={{
                        display: { xs: 'flex', sm: 'none' },
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        flexDirection: 'column',
                        rowGap: 1.5,
                        p: 1,
                    }}
                >
                    <RoomXs />
                </Box>
                <Box
                    sx={{
                        display: {
                            xs: 'none',
                            sm: 'flex',
                            md: 'none',
                        },
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        flexDirection: 'column',
                        rowGap: 1.5,
                        p: 1,
                    }}
                >
                    <RoomSm />
                </Box>
                <Box
                    sx={{
                        display: {
                            xs: 'none',
                            md: 'flex',
                            lg: 'none',
                        },
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        flexDirection: 'column',
                        rowGap: 1.5,
                        p: 1,
                    }}
                >
                    <RoomMd />
                </Box>
                <Box
                    sx={{
                        display: {
                            xs: 'none',
                            lg: 'flex',
                            xl: 'none',
                        },
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        columnGap: 1,
                        p: 1,
                    }}
                >
                    <RoomLg />
                </Box>
                <Box
                    sx={{
                        display: { xs: 'none', xl: 'flex' },
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        columnGap: 1,
                    }}
                >
                    <RoomXl />
                </Box>
            </Box>
            <Dialog open={showLogin}>
                <DialogContent>
                    <RoomLogin />
                </DialogContent>
            </Dialog>
        </>
    );
}

function RoomXs() {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
            }}
        >
            <Box
                sx={{ position: 'relative', height: '100%' }}
                className="board-wrapper"
            >
                <Board />
            </Box>
            <Paper sx={{ p: 1.5, mb: 1 }}>
                <RoomInfo />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <PlayerList />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <SettingsPanel />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <Box>
                    <Typography variant="h6">Timer Controls</Typography>
                    <TimingMethodSelector />
                    <TimerControls />
                </Box>
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
            </Paper>
            <Box
                sx={{
                    position: 'relative',
                    height: '100%',
                }}
                className="relative h-full"
            >
                <RoomChat />
            </Box>
        </Box>
    );
}

function RoomSm() {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
            }}
        >
            <Box
                sx={{ position: 'relative', height: '100%' }}
                className="board-wrapper"
            >
                <Board />
            </Box>
            <Box sx={{ display: 'flex', height: '100%', gap: 1 }}>
                <Paper sx={{ p: 1.5, width: '50%' }}>
                    <RoomInfo />
                    <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                    <PlayerList />
                    <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                    <SettingsPanel />
                    <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                    <Box>
                        <Typography variant="h6">Timer Controls</Typography>
                        <TimingMethodSelector />
                        <TimerControls />
                    </Box>
                    <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                </Paper>
                <Box
                    sx={{
                        position: 'relative',
                        height: '100%',
                        flexGrow: 1,
                        width: '50%',
                    }}
                    className="relative h-full"
                >
                    <RoomChat />
                </Box>
            </Box>
        </Box>
    );
}

function RoomMd() {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr 350px',
                gridTemplateRows: 'auto',
            }}
        >
            <Box
                sx={{ position: 'relative', height: '100%' }}
                className="board-wrapper"
            >
                <Board />
            </Box>
            <Paper sx={{ display: 'flex', flexDirection: 'column', p: 1.5 }}>
                <RoomInfo />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <PlayerList />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <SettingsPanel />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <Box>
                    <Typography variant="h6">Timer Controls</Typography>
                    <TimingMethodSelector />
                    <TimerControls />
                </Box>
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <Box sx={{ position: 'relative', height: '100%' }}>
                    <RoomChat />
                </Box>
            </Paper>
        </Box>
    );
}

function RoomLg() {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '300px 1fr 300px',
                gridTemplateRows: 'auto',
            }}
        >
            <Paper sx={{ p: 1.5 }}>
                <RoomInfo />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <Box
                    sx={{
                        maxHeight: 250,
                        overflowY: 'auto',
                        width: '100%',
                        pr: 1,
                        pt: 1,
                    }}
                >
                    <PlayerList />
                </Box>
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <SettingsPanel />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <Box>
                    <Typography variant="h6">Timer Controls</Typography>
                    <TimingMethodSelector />
                    <TimerControls />
                </Box>
            </Paper>
            <Box
                sx={{ position: 'relative', height: '100%' }}
                className="board-wrapper"
            >
                <Board />
            </Box>
            <Box
                sx={{ position: 'relative', height: '100%' }}
                className="relative h-full"
            >
                <RoomChat />
            </Box>
        </Box>
    );
}

function RoomXl() {
    const { roomData } = useRoomContext();
    if (!roomData) {
        return null;
    }
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '300px 1fr 300px',
                gridTemplateRows: 'auto',
            }}
        >
            <Paper sx={{ p: 1.5 }}>
                <RoomInfo />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <Box
                    sx={{
                        maxHeight: 250,
                        overflowY: 'auto',
                        width: '100%',
                        pr: 1,
                        pt: 1,
                    }}
                >
                    <PlayerList />
                </Box>
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <SettingsPanel />
                <Box sx={{ my: 2, border: 1, borderColor: 'divider' }} />
                <Box>
                    <Typography variant="h6">Timer Controls</Typography>
                    <TimingMethodSelector />
                    <TimerControls />
                </Box>
            </Paper>
            <Box
                sx={{ position: 'relative', height: '100%' }}
                className="board-wrapper"
            >
                <Board />
            </Box>
            <Box
                sx={{ position: 'relative', height: '100%' }}
                className="relative h-full"
            >
                <RoomChat />
            </Box>
        </Box>
    );
}
