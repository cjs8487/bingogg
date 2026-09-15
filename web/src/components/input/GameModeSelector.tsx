'use client';
import {
    alpha,
    Box,
    Button,
    ButtonGroup,
    FormControlLabel,
    Switch,
    Typography,
    useTheme,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { useState } from 'react';
import { RoomFormValues } from '../RoomCreateForm';

interface GameMode {
    id: string;
    name: string;
    description: string;
    detailedDescription?: string;
    icon?: string;
}

const gameModes: GameMode[] = [
    {
        id: 'LINES',
        name: 'Bingo',
        description: 'Complete a set number of lines to win',
        detailedDescription:
            'Traditional line based bingo with a configurable number of lines required to complete the board. Complete horizontal lines, vertical lines, or diagonal lines to win.',
        icon: '🎯',
    },
    {
        id: 'BLACKOUT',
        name: 'Blackout',
        description: 'Cover the entire card to win',
        detailedDescription:
            'Complete blackout mode where all squares must be marked to achieve victory. This mode typically takes longer and offers a different strategic challenge.',
        icon: '⚫',
    },
];

interface StandardBingoWinCondition {
    name: string;
    lineCount: number;
}

const winConditions: StandardBingoWinCondition[] = [
    {
        name: 'Single Bingo',
        lineCount: 1,
    },
    {
        name: 'Double Bingo',
        lineCount: 2,
    },
    {
        name: 'Triple Bingo',
        lineCount: 3,
    },
    {
        name: 'Quad Bingo',
        lineCount: 4,
    },
    {
        name: 'Cinco Bingo',
        lineCount: 5,
    },
];

function BingoModeConfig() {
    const { values, setFieldValue } = useFormikContext<RoomFormValues>();

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                Win Condition
            </Typography>
            <ButtonGroup
                size="small"
                color="secondary"
                sx={{ flexWrap: 'wrap' }}
            >
                {winConditions.map((condition) => (
                    <Button
                        key={condition.name}
                        variant={
                            values.lineCount === condition.lineCount
                                ? 'contained'
                                : 'outlined'
                        }
                        onClick={() =>
                            setFieldValue('lineCount', condition.lineCount)
                        }
                        sx={{
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1,
                            color: 'white',
                        }}
                    >
                        {condition.name}
                    </Button>
                ))}
            </ButtonGroup>
        </Box>
    );
}

function BlackoutModeConfig() {
    const { values, setFieldValue, handleBlur } =
        useFormikContext<RoomFormValues>();

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                Blackout Settings
            </Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={values.mode === 'LOCKOUT'}
                        onChange={(e) =>
                            setFieldValue(
                                'mode',
                                e.target.checked ? 'LOCKOUT' : 'BLACKOUT',
                            )
                        }
                        onBlur={handleBlur}
                    />
                }
                label={<Typography>Lockout</Typography>}
                sx={{
                    color: 'white',
                    fontSize: '0.9rem',
                }}
            />
            <Typography
                variant="caption"
                sx={{ opacity: 0.8, mb: 1, display: 'block' }}
            >
                {values.mode === 'LOCKOUT'
                    ? 'Lockout enabled: Only one player can claim each goal. First to majority wins! Best played with exactly 2 players.'
                    : 'Standard blackout: First player to complete all the goals on the board wins!'}
            </Typography>
        </Box>
    );
}

function GameModeButton({
    mode,
    isSelected,
    onClick,
}: {
    mode: GameMode;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <Box
            sx={{
                flex: isSelected ? 1 : 0,
                transition: 'flex 0.3s ease-in-out',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '45px',
            }}
        >
            <Box
                onClick={onClick}
                sx={{
                    height: '100%',
                    py: 2,
                    px: 3,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    bgcolor: (theme) =>
                        isSelected
                            ? alpha(theme.palette.secondary.main, 0.1)
                            : theme.palette.background.paper,
                    opacity: isSelected ? 1 : 0.8,
                    borderColor: isSelected ? 'secondary.main' : 'divider',
                    '&:hover': isSelected
                        ? {}
                        : {
                              bgcolor: 'action.hover',
                              transform: 'translateY(-2px)',
                          },
                    minWidth: 0,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    cursor: isSelected ? 'default' : 'pointer',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        rotate: isSelected ? 0 : '90deg',
                        transformOrigin: 'center left',
                        gap: 1,
                        mb: 1,
                        textAlign: 'center',
                        color: 'text.primary',
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: isSelected ? '1.5rem' : '1.2rem',
                        }}
                    >
                        {mode.icon}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: isSelected ? '1.1rem' : '0.9rem',
                            fontWeight: isSelected ? 600 : 500,
                        }}
                    >
                        {mode.name}
                    </Typography>
                </Box>
                {isSelected && (
                    <>
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 1,
                                    opacity: 0,
                                    animation:
                                        '0.5s ease-in-out 0.2s forwards slidein',
                                }}
                            >
                                {mode.description}
                            </Typography>
                            {mode.detailedDescription && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: '0.8rem',
                                        lineHeight: 1.4,
                                        opacity: 0,
                                        animation:
                                            '0.5s ease-in-out 0.3s forwards slidein',
                                    }}
                                >
                                    {mode.detailedDescription}
                                </Typography>
                            )}
                        </Box>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                borderRadius: 1,
                                border: '1px solid rgba(255,255,255,0.2)',
                                width: '100%',
                                opacity: 0,
                                animation:
                                    '0.5s ease-in-out 0.4s forwards slidein',
                            }}
                        >
                            {mode.id === 'LINES' && <BingoModeConfig />}
                            {mode.id === 'BLACKOUT' && <BlackoutModeConfig />}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default function GameModeSelector() {
    const [field] = useField('gameMode');
    const { setFieldValue } = useFormikContext();
    const [selectedMode, setSelectedMode] = useState(
        field.value || gameModes[0].id,
    );

    const theme = useTheme();

    const handleModeSelect = (modeId: string) => {
        setSelectedMode(modeId);
        setFieldValue('mode', modeId);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
                [theme.breakpoints.only('xs')]: {
                    minHeight: 450,
                    height: 450,
                },
                [theme.breakpoints.up('sm')]: {
                    minHeight: 350,
                    height: 350,
                },
                [theme.breakpoints.up('md')]: {
                    minHeight: 300,
                    height: 300,
                },
            }}
        >
            {gameModes.map((mode) => (
                <GameModeButton
                    key={mode.id}
                    mode={mode}
                    isSelected={selectedMode === mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                />
            ))}
        </Box>
    );
}
