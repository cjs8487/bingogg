import RoomCreateForm from '@/components/RoomCreateForm';
import { Suspense } from 'react';
import ActiveRoomList from '../../components/ActiveRoomList';
import { Box, Paper, Typography } from '@mui/material';

export default async function Home() {
    return (
        <>
            <Box mt={2} pb={4}>
                <Typography variant="h3" textAlign="center">
                    Welcome to bingo.gg
                </Typography>
                <Typography
                    variant="subtitle1"
                    fontStyle="italic"
                    textAlign="center"
                >
                    The new way to bingo.
                </Typography>
            </Box>
            <Box
                display="flex"
                columnGap={8}
                width="100%"
                justifyContent="center"
            >
                <Paper
                    sx={{ textAlign: 'center', px: 12, py: 4 }}
                    elevation={2}
                >
                    <Typography variant="h4">Join an Existing Room</Typography>
                    <Suspense fallback={<>Loading...</>}>
                        <ActiveRoomList />
                    </Suspense>
                </Paper>
                <Paper
                    sx={{ textAlign: 'center', px: 12, py: 4 }}
                    elevation={2}
                >
                    <Typography variant="h4" mb={2}>
                        Create a New Room
                    </Typography>
                    <RoomCreateForm />
                </Paper>
            </Box>
        </>
    );
}
