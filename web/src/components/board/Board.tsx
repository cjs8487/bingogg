import { useContext } from 'react';
import { RoomContext } from '../../context/RoomContext';
import Cell from './Cell';
import { Box } from '@mui/material';

export default function Board() {
    const { board } = useContext(RoomContext);
    return (
        <Box
            sx={{
                aspectRatio: '1 / 1',
                maxHeight: '100%',
                maxWidth: '100%',
                border: 1,
                borderColor: 'divider',
            }}
        >
            {board.board.map((row, rowIndex) => (
                <Box
                    key={rowIndex}
                    sx={{
                        display: 'flex',
                        height: '20%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}
                >
                    {row.map((goal, colIndex) => (
                        <Cell
                            key={`(${rowIndex},${colIndex})`}
                            row={rowIndex}
                            col={colIndex}
                            cell={goal}
                        />
                    ))}
                </Box>
            ))}
        </Box>
    );
}
