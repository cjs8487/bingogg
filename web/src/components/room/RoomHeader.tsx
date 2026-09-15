import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
    Box,
    Button,
    Portal,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useRoomContext } from '../../context/RoomContext';
import ConnectionState from './ConnectionState';
import Timer from './timer/Timer';

export default function RoomHeader() {
    const { roomData } = useRoomContext();

    const theme = useTheme();

    const isXSmall = useMediaQuery(theme.breakpoints.only('xs'));

    if (!roomData) {
        return null;
    }

    let portalContent;
    if (isXSmall) {
        portalContent = (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    columnGap: 1,
                    px: 2,
                }}
            >
                <Timer />
            </Box>
        );
    } else {
        portalContent = (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: 1,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        textAlign: 'center',
                        width: '100%',
                        zIndex: -1,
                    }}
                >
                    <Timer />
                </Box>
            </Box>
        );
    }

    return (
        <Portal
            container={() => document.getElementById('collapsed-header-slot')}
        >
            {portalContent}
        </Portal>
    );
}
