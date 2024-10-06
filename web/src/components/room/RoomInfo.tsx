import { Card, CardActionArea, CardContent, Typography, Button, Link } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import { RoomContext } from '../../context/RoomContext';
import ConnectionState from './ConnectionState';
import RoomControlDialog from './RoomControlDialog';
import NextLink from 'next/link';

export default function RoomInfo() {
    const { roomData } = useContext(RoomContext);
    const [showControlModal, setShowControlModal] = useState(false);

    const close = useCallback(() => {
        setShowControlModal(false);
    }, []);

    if (!roomData) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                    No Room Data found.
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardActionArea onClick={() => setShowControlModal(true)}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">{roomData.name}</Typography>
                        <Typography>{roomData.game}</Typography>
                        <Typography component="div" variant="caption" mb={2}>
                            {roomData.slug}
                        </Typography>
                        <ConnectionState />
                    </CardContent>
                </CardActionArea>
            </Card>

            {/* Add a button to view only the board */}
            <Button 
                variant="contained" 
                color="secondary" 
                sx={{ mt: 2, ml: 2, color: 'white' }} // Ensure text is white
            >
                <Link 
                    component={NextLink} 
                    href={`/rooms/${roomData.slug}/board`} 
                    underline="none" 
                    sx={{ color: 'white' }} // Ensure link text is also white
                >
                    Streamer Mode / Board Only
                </Link>
            </Button>

            <RoomControlDialog show={showControlModal} close={close} />
        </>
    );
}
