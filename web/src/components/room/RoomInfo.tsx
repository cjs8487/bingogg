import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import { useAsync, useCopyToClipboard } from 'react-use';
import { RoomContext } from '../../context/RoomContext';
import { Game } from '../../types/Game';
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

    return (
        <>
            <Card>
                <CardActionArea
                    onClick={() => {
                        setShowControlModal(true);
                    }}
                >
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">{roomData.name}</Typography>
                        <Typography>{roomData.game}</Typography>
                        <Typography component="div" variant="caption" mb={2}>
                            {roomData.slug}
                        </Typography>
                        {/* <div>
                            <div>Variant</div>
                            <div />
                            <div>Mode</div>
                        </div> */}
                        <ConnectionState />
                    </CardContent>
                </CardActionArea>
            </Card>
            <RoomControlDialog show={showControlModal} close={close} />
        </>
    );
}
