import { Card, CardActionArea, CardContent, Typography, Button } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import { RoomContext } from '../../context/RoomContext';
import ConnectionState from './ConnectionState';
import RoomControlDialog from './RoomControlDialog';

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

    const handleStreamButtonClick = () => {
        // Redirect to the stream page by rendering a link element
        window.location.href = `/rooms/${roomData.slug}/stream`; // Redirect using href
    };

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

            <Button variant="contained" color="primary" onClick={handleStreamButtonClick} sx={{ mt: 2 }}>
                Stream Board
            </Button>

            <RoomControlDialog show={showControlModal} close={close} />
        </>
    );
}
