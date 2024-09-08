'use client';
import { useContext, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { useClickAway, useLocalStorage } from 'react-use';
import { RoomContext } from '../../context/RoomContext';
import { Box, ButtonBase, Typography } from '@mui/material';

export default function ColorSelect() {
    const { color, changeColor } = useContext(RoomContext);

    const colors = ['blue', 'red', 'orange', 'green', 'purple'];

    const [storedCustomColor, setStoredCustomColor] = useLocalStorage(
        'PlayBingo.customcolor',
        '',
    );

    const [customColor, setCustomColor] = useState(storedCustomColor ?? '');
    const [picker, setPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useClickAway(pickerRef, () => {
        setPicker(false);
        changeColor(customColor);
    });

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            columnGap={2}
            rowGap={1}
        >
            {colors.map((colorItem) => (
                <Box
                    key={colorItem}
                    sx={{
                        backgroundColor: colorItem,
                        cursor: 'pointer',
                        border: color === colorItem ? 4 : 0,
                        borderColor: 'white',
                        px: 1,
                        py: 0.5,
                        ':hover': {
                            scale: '110%',
                        },
                    }}
                    bgcolor={colorItem}
                    onClick={() => changeColor(colorItem)}
                >
                    {colorItem}
                </Box>
            ))}
            <Box display="flex" flexDirection="column">
                <Box
                    sx={{
                        backgroundColor: customColor,
                        cursor: 'pointer',
                        border: color === customColor ? 4 : 0,
                        borderColor: 'white',
                        px: 1,
                        py: 0.5,
                        ':hover': {
                            scale: '110%',
                        },
                    }}
                    onClick={() => setPicker(true)}
                >
                    custom
                </Box>
                {picker && (
                    <Box position="absolute" zIndex={20} ref={pickerRef}>
                        <SketchPicker
                            color={customColor}
                            onChange={(color) => {
                                setStoredCustomColor(color.hex);
                                setCustomColor(color.hex);
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
