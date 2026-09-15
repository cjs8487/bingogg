'use client';
import { useApi } from '@/lib/Hooks';
import { alertError } from '@/lib/Utils';
import { ArrowDropDown } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Typography,
} from '@mui/material';
import { Game } from '@playbingo/types';
import { Form, Formik, FormikValues } from 'formik';
import { useRouter } from 'next/navigation';
import {
    FormikSelectField,
    FormikSelectFieldAutocomplete,
} from '../../../components/input/FormikSelectField';
import FormikSwitch from '../../../components/input/FormikSwitch';
import FormikTextField from '../../../components/input/FormikTextField';
import GameModeSelector from '../../../components/input/GameModeSelector';
import NumberInput from '../../../components/input/NumberInput';
import VariantSelectField from '../../../components/input/VariantSelectField';

export default function HomePageRoomForm() {
    const { data: games, isLoading } = useApi<Game[]>('/api/games');
    const router = useRouter();

    if (isLoading) {
        return <CircularProgress />;
    }

    if (!games) {
        return 'Unable to load game list';
    }

    return (
        <Formik
            initialValues={{
                name: '',
                nickname: '',
                game: '',
                password: '',
                variant: '',
                mode: 'LINES',
                lineCount: 1,
                seed: undefined,
                hideCard: false,
                spectator: false,
                exploration: false,
                explorationStart: 'TL',
                explorationStartCount: '',
            }}
            onSubmit={async (values: FormikValues) => {
                const res = await fetch('/api/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                if (!res.ok) {
                    const error = await res.text();
                    alertError(`Unable to create room - ${error}`);
                    return;
                }

                const { slug, authToken } = await res.json();
                localStorage.setItem(
                    'PlayBingo.temp.nickname',
                    values.nickname,
                );
                localStorage.setItem(`authToken-${slug}`, authToken);
                router.push(`/rooms/${slug}`);
            }}
        >
            {({ values: { exploration }, setFieldValue, submitForm }) => (
                <Box
                    component={Form}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormikTextField
                            id="room-name"
                            name="name"
                            label="Room Name"
                            fullWidth
                        />

                        <FormikTextField
                            id="room-password"
                            name="password"
                            label="Password"
                            fullWidth
                            type="password"
                        />
                        <FormikTextField
                            id="player-nickname"
                            name="nickname"
                            label="Nickname"
                            fullWidth
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormikSelectFieldAutocomplete
                            id="game-select"
                            name="game"
                            label="Game"
                            options={games.map((game) => ({
                                label: game.name,
                                value: game.slug,
                            }))}
                            fullWidth
                        />
                        <VariantSelectField fullWidth />
                    </Box>
                    <GameModeSelector />
                    <Accordion className="bg-surface">
                        <AccordionSummary expandIcon={<ArrowDropDown />}>
                            <Typography>Advanced Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormikSwitch
                                    id="hide-card"
                                    name="hideCard"
                                    label="Hide card initially?"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormikSwitch
                                    id="exploration-toogle"
                                    name="exploration"
                                    label="Enable fog of war?"
                                />
                                <FormikSelectField
                                    id="room-mode-select"
                                    name="explorationStart"
                                    label="Starting Square"
                                    disabled={!exploration}
                                    sx={{
                                        flexGrow: 1,
                                        textAlign: 'left',
                                    }}
                                    options={[
                                        { value: 'TL', label: 'Top Left' },
                                        { value: 'TR', label: 'Top Right' },
                                        { value: 'BL', label: 'Bottom Left' },
                                        { value: 'BR', label: 'Bottom Right' },
                                        {
                                            value: 'CENTER',
                                            label: 'Center',
                                            tooltip:
                                                'The center square of the board starts revealed. If the board has an even width or height, two squares will be revealed in that direction.',
                                        },
                                        {
                                            value: 'RANDOM',
                                            label: 'Random',
                                            tooltip:
                                                'A specified number of cells in the square will be chosen at random to start revealed',
                                        },
                                    ]}
                                />
                                <NumberInput
                                    id="exploration-random-revealed-count"
                                    name="explorationStartCount"
                                    label="Starting Square Count"
                                    min={1}
                                    max={5}
                                />
                            </Box>
                            <FormikTextField
                                type="number"
                                name="seed"
                                label="Seed"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                fullWidth
                            />
                        </AccordionDetails>
                    </Accordion>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        <Box sx={{ flexGrow: 1 }} />
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                            }}
                        >
                            <Button
                                type="button"
                                color="secondary"
                                onClick={async () => {
                                    await setFieldValue('spectator', true);
                                    await submitForm();
                                }}
                            >
                                Create As Spectator
                            </Button>

                            <Button
                                type="button"
                                onClick={async () => {
                                    await setFieldValue('spectator', false);
                                    await submitForm();
                                }}
                            >
                                Create Room
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
        </Formik>
    );
}
