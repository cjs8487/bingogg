import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Grid,
    List,
    ListItem,
    Typography,
} from '@mui/material';
import { RoomData } from '@playbingo/types';
import { connection } from 'next/server';
import { serverGet } from '../app/ServerUtils';
import { getFullUrl } from '../lib/Utils';

async function getRooms(): Promise<RoomData[]> {
    const res = await serverGet('/api/rooms');
    if (!res.ok) {
        return [];
    }
    return res.json();
}

export default async function ActiveRoomList() {
    await connection();
    const rooms = await getRooms();

    if (rooms.length === 0) {
        return (
            <Typography
                sx={{
                    fontStyle: 'italic',
                }}
            >
                No active rooms
            </Typography>
        );
    }

    return (
        <Grid container spacing={2} sx={{ maxHeight: '100%' }}>
            {rooms.map((room) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 6 }} key={room.slug}>
                    <Card>
                        <CardActionArea
                            href={`/rooms/${room.slug}`}
                            sx={{
                                display: 'flex',
                            }}
                        >
                            <CardMedia
                                component="img"
                                image={getFullUrl(
                                    `/media/gameCover/${room.gameSlug}`,
                                )}
                                sx={{
                                    width: '120px',
                                    aspectRatio: '11 / 16',
                                    objectFit: 'cover',
                                }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5">
                                    {room.name}
                                </Typography>
                                <Typography variant="caption">
                                    {room.slug}
                                </Typography>
                                <Typography>{room.game}</Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
