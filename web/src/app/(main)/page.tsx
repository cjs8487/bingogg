import RoomCreateForm from '@/components/RoomCreateForm';
import { Suspense } from 'react';
import ActiveRoomList from '../../components/ActiveRoomList';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import ToasterOven from '../../components/utilities/ToasterOven';

export default async function Home() {
    return (
        <>
            <Box flexGrow={1}>
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
                    rowGap={1}
                    flexWrap="wrap"
                    width="100%"
                    justifyContent="center"
                    px={4}
                >
                    <Paper
                        sx={{
                            textAlign: 'center',
                            px: { xs: 2, md: 12 },
                            py: 4,
                            mb: 4,
                            animation: '1.5s 1 slidein',
                            animationDelay: '1s',
                            animationFillMode: 'backwards',
                        }}
                        elevation={2}
                    >
                        <Typography variant="h4">
                            Join an Existing Room
                        </Typography>
                        <Suspense fallback={<CircularProgress />}>
                            <ActiveRoomList />
                        </Suspense>
                    </Paper>
                    <Paper
                        sx={{
                            textAlign: 'center',
                            px: { xs: 2, sm: 6, md: 12 },
                            py: 4,
                            mb: 4,
                            animation: '1.8s 1 slidein',
                            animationDelay: '1.3s',
                            animationFillMode: 'backwards',
                        }}
                        elevation={2}
                    >
                        <Typography variant="h4" mb={2}>
                            Create a New Room
                        </Typography>
                        <RoomCreateForm />
                    </Paper>
                </Box>
            </Box>
            <ToasterOven />
        </>
    );
}
