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
            <div className="rounded-md border border-white p-2 text-center">
                No Room Data found.
            </div>
        );
    }

    return (
        <>
            <Card className="cursor-pointer rounded-md border-2 border-border bg-foreground px-4 py-2 text-center shadow-lg shadow-border/40">
                <CardActionArea
                    onClick={() => {
                        setShowControlModal(true);
                    }}
                >
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h5"
                            className="text-2xl font-semibold"
                        >
                            {roomData.name}
                        </Typography>
                        <Typography>{roomData.game}</Typography>
                        <Typography component="div" variant="caption" mb={2}>
                            {roomData.slug}
                        </Typography>
                        {/* <div className="flex text-xs">
                            <div>Variant</div>
                            <div className="grow" />
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
