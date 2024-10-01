'use client';
import { useEffect, useContext } from 'react';
import { Box } from '@mui/material';
import { RoomContext } from '@/context/RoomContext';
import Board from '@/components/board/Board';
import AutoSizer from 'react-virtualized-auto-sizer';

export default function RoomStream() {
    const { roomData } = useContext(RoomContext);

    // Use useEffect to remove the header and footer on component mount
    useEffect(() => {
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');

        if (header) {
            header.style.display = 'none'; // Hide the header
        }
        if (footer) {
            footer.style.display = 'none'; // Hide the footer
        }

        
        return () => {
            if (header) {
                header.style.display = ''; // Restore original display property
            }
            if (footer) {
                footer.style.display = ''; // Restore original display property
            }
        };
    }, []);

    if (!roomData) {
        return <Box>Room data not available.</Box>;
    }

    return (
        <Box flex="column" flexGrow={1} p={2}>
            <AutoSizer>
                {({ width, height }) => (
                    <Box
                        width={width}
                        height={height}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Box width="100%" height="100%">
                            <Board />
                        </Box>
                    </Box>
                )}
            </AutoSizer>
        </Box>
    );
}
