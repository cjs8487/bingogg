'use client';
import AddIcon from '@mui/icons-material/Add';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    FormControlLabel,
    FormGroup,
    Switch,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import RoomCreateForm from '../../../components/RoomCreateForm';
import { useApi } from '../../../lib/Hooks';
import { RoomData } from '../../../types/RoomData';

export default function Rooms() {
    const [includeInactive, setIncludeInactive] = useState(false);
    const [showNewRoomModal, setShowNewRoomModal] = useState(false);

    const {
        data: roomList,
        isLoading,
        error,
    } = useApi<RoomData[]>(
        `/api/rooms${includeInactive ? '?inactive=true' : ''}`,
    );

    if (isLoading || !roomList) {
        return null;
    }
    if (error) {
        return 'Unable to load room list.';
    }

    return (
        <Box flexGrow={1}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 4,
                    py: 1,
                    px: 2,
                    borderBottom: 2,
                    borderColor: 'divider',
                }}
            >
                <Typography>{roomList.length} rooms loaded.</Typography>
                <Box flexGrow={1} />
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                value={includeInactive}
                                onChange={(e) =>
                                    setIncludeInactive(e.target.checked)
                                }
                            />
                        }
                        label="Include Closed Rooms"
                    />
                </FormGroup>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    rowGap: 2,
                }}
            >
                {roomList.map((room) => (
                    <Card key={room.slug}>
                        <CardActionArea
                            href={`/rooms/${room.slug}`}
                            LinkComponent={Link}
                        >
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    {room.name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {room.slug}
                                </Typography>
                                <Typography>{room.game}</Typography>
                                {/* <div className="flex text-sm">
                                    <div>Variant</div>
                                    <div className="grow" />
                                    <div>Mode</div>
                                </div> */}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    mb: 12,
                    mr: 2,
                }}
                onClick={() => setShowNewRoomModal(true)}
            >
                <AddIcon />
            </Fab>
            <Dialog
                open={showNewRoomModal}
                onClose={() => setShowNewRoomModal(false)}
            >
                <DialogTitle>Create a Room</DialogTitle>
                <DialogContent className="w-full max-w-md transform overflow-hidden rounded-2xl border border-border bg-foreground p-6 text-left align-middle text-white shadow-lg shadow-border/10 transition-all">
                    <RoomCreateForm />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
