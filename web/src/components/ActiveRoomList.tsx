import {
    Card,
    CardActionArea,
    CardContent,
    List,
    ListItem,
    Paper,
    Typography,
} from '@mui/material';
import { use } from 'react';
import { RoomData } from '../types/RoomData';
import CacheBreaker from './CacheBreaker';
import Link from 'next/link';

async function getRooms(): Promise<RoomData[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/api/rooms`);
    return res.json();
}

export default function ActiveRoomList() {
    const rooms = use(getRooms());

    if (rooms.length === 0) {
        return <Typography fontStyle="italic">No active rooms</Typography>;
    }

    return (
        <List>
            {rooms.map((room) => (
                <ListItem key={room.slug}>
                    <Card variant="outlined">
                        <CardActionArea
                            href={`/rooms/${room.slug}`}
                            LinkComponent={Link}
                        >
                            <CardContent>
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
                </ListItem>
            ))}
            <CacheBreaker />
        </List>
    );
}
