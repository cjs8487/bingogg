'use client';
import { useContext } from 'react';
import { Box } from '@mui/material';
import { RoomContext } from '@/context/RoomContext';
import Board from '@/components/board/Board';
import AutoSizer from 'react-virtualized-auto-sizer'; // Keep the same autosizer

export default function RoomStream() {
    const { roomData } = useContext(RoomContext); // Use the same RoomContext to get the board

    if (!roomData) {
        return <Box>Room data not available.</Box>;
    }

    return (
        <Box flex="column" flexGrow={1} p={2}>
            {/* Use AutoSizer to automatically adjust the Board's size */}
            <AutoSizer>
                {({ width, height }) => (
                    <Box
                        width={width}  // Ensure it resizes the board properly
                        height={height}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Box width="100%" height="100%">
                            <Board /> {/* JUST the board component */}
                        </Box>
                    </Box>
                )}
            </AutoSizer>
        </Box>
    );
}
