'use client';
import { useCallback, useContext, useState } from 'react';
import { Cell } from '../../types/Cell';
import TextFit from '../TextFit';
import { RoomContext } from '../../context/RoomContext';
import {
    useFloating,
    useHover,
    useInteractions,
    useTransitionStyles,
} from '@floating-ui/react';
import { Box } from '@mui/material';

interface CellProps {
    cell: Cell;
    row: number;
    col: number;
}

export default function BoardCell({
    cell: { goal, description, colors },
    row,
    col,
}: CellProps) {
    // context
    const { color, markGoal, unmarkGoal } = useContext(RoomContext);

    // callbacks
    const toggleSpace = useCallback(() => {
        if (colors.includes(color)) {
            unmarkGoal(row, col);
        } else {
            markGoal(row, col);
        }
    }, [row, col, markGoal, unmarkGoal, color, colors]);

    // description tooltip
    const [descriptionOpen, setDescriptionOpen] = useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: descriptionOpen,
        onOpenChange: setDescriptionOpen,
    });
    const hover = useHover(context, { restMs: 500 });
    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
    const { isMounted, styles } = useTransitionStyles(context, {
        initial: {
            opacity: 0,
        },
        duration: 200,
    });

    // calculations
    const colorPortion = 360 / colors.length;

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    flexGrow: 1,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                    transition: 'all',
                    transitionDuration: 300,
                    background: 'background.default',
                    ':hover': {
                        zIndex: 10,
                        scale: '110%',
                    },
                }}
                onClick={toggleSpace}
                ref={refs.setReference}
                {...getReferenceProps()}
                // style={{ width: 50 }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: 10,
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1,
                    }}
                >
                    <TextFit
                        text={goal}
                        sx={{
                            p: 1,
                            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0))',
                        }}
                    />
                </Box>
                {colors.map((color, index) => (
                    <Box
                        key={color}
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                        }}
                        style={{
                            backgroundImage: `conic-gradient(from ${
                                colorPortion * index
                            }deg, ${color} 0deg, ${color} ${colorPortion}deg, rgba(0,0,0,0) ${colorPortion}deg)`,
                        }}
                    />
                ))}

                {/* <div className="box absolute h-full w-full origin-top skew-x-[-0.84007rad] bg-green-400" /> */}
            </Box>
            {isMounted && description.length > 0 && (
                <div
                    ref={refs.setFloating}
                    style={{ ...floatingStyles, ...styles }}
                    {...getFloatingProps()}
                    className="z-20 max-w-md rounded-lg border border-gray-300 bg-slate-100 p-2 text-sm text-slate-700 shadow-md"
                >
                    {description}
                </div>
            )}
        </>
    );
}
