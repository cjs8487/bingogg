import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography,
} from '@mui/material';
import { Suspense } from 'react';
import ActiveRoomList from '../../components/ActiveRoomList';
import ToasterOven from '../../components/utilities/ToasterOven';
import HomePageRoomForm from './_components/HomePageRoomForm';

export default async function Home() {
    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    pb: 3,
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        textAlign: 'center',
                        textShadow: '0 6px 20px rgba(0,0,0,0.35)',
                        pb: 1,
                    }}
                >
                    PlayBingo
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        color: 'secondary.main',
                    }}
                >
                    Bingo Built For Communities
                </Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid size={{ lg: 12, xl: 6 }}>
                    <Card
                        sx={{
                            textAlign: 'center',
                            px: 2,
                            pt: 2,
                            m: '2px',
                            position: 'relative',
                            zIndex: 1,
                            width: 'calc(100% - 4px)',
                            boxSizing: 'border-box',
                        }}
                    >
                        <CardContent>
                            <HomePageRoomForm />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ lg: 12, xl: 6 }}>
                    <Card
                        sx={{
                            textAlign: 'center',
                            p: 2,
                            width: '100%',
                        }}
                    >
                        <Suspense fallback={<CircularProgress />}>
                            <ActiveRoomList />
                        </Suspense>
                    </Card>
                </Grid>
            </Grid>
            <ToasterOven />
        </Box>
    );
}
