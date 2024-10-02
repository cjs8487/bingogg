import Info from '@mui/icons-material/Info';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Chip,
    OutlinedInput,
    SelectChangeEvent,
} from '@mui/material';
import {
    Form,
    Formik,
    useField,
    useFormikContext,
} from 'formik';
import { useEffect, useState } from 'react';
import { mutate } from 'swr';
import { alertError } from '../../lib/Utils';
import { Game } from '../../types/Game';
import HoverIcon from '../HoverIcon';
import FormikSwitch from '../input/FormikSwitch';
import FormikTextField from '../input/FormikTextField';
import FormikApiSelectAutocomplete from '../input/FormikApiSelectFieldAutocomplete';
import { useAsync } from 'react-use';

async function validateRacetimeCategory(value: string) {
    if (value) {
        const res = await fetch(`/api/games/${value}/data`);
        if (!res.ok) {
            return 'Invalid slug';
        }
    }
}

function RacetimeSettings() {
    const {
        values: { racetimeCategory },
    } = useFormikContext<{ racetimeCategory: string }>();
    const [field, meta] = useField<string>('racetimeGoal');

    const goals = useAsync(async () => {
        const res = await fetch(
            `http://localhost:8000/${racetimeCategory}/data`,
        );
        if (res.ok) {
            const data = await res.json();
            return data.goals as string[];
        }
        return [];
    }, [racetimeCategory]);

    return (
        <>
            <Box display="flex" width="100%" columnGap={2}>
                <Box
                    display="flex"
                    columnGap={1}
                    alignItems="center"
                    flexGrow={1}
                >
                    <FormikTextField
                        id="game-racetime-category"
                        name="racetimeCategory"
                        label="Racetime Category Slug"
                        validate={validateRacetimeCategory}
                        fullWidth
                    />
                    <HoverIcon icon={<Info />}>
                        <Typography variant="caption">
                            This is the short name that appears in racetime URLs
                            pointing to category resources, such as race rooms.
                        </Typography>
                    </HoverIcon>
                </Box>
                <FormControl sx={{ flexGrow: 3 }}>
                    <InputLabel id="racetime-goal-label">
                        Racetime Goal
                    </InputLabel>
                    <Select
                        id="racetime-goal"
                        labelId="racetime-goal-label"
                        name="racetimeGoal"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        fullWidth
                    >
                        {goals.value?.map((goal) => (
                            <MenuItem key={goal} value={goal}>
                                {goal}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </>
    );
}

interface GameSettingsProps {
    gameData: Game;
}

export default function GameSettings({ gameData }: GameSettingsProps) {
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
        gameData.metadata?.platforms || []
    );
    const [selectedGenres, setSelectedGenres] = useState<string[]>(
        gameData.metadata?.genre || []
    );

    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await fetch('/api/games/platforms');
            if (res.ok) {
                const data = await res.json();
                setPlatforms(data.map((platform: { name: string }) => platform.name));
            } else {
                console.error('Failed to fetch platforms');
            }
        };

        const fetchGenres = async () => {
            const res = await fetch('/api/games/genres');
            if (res.ok) {
                const data = await res.json();
                setGenres(data.map((genre: { name: string }) => genre.name));
            } else {
                console.error('Failed to fetch genres');
            }
        };

        fetchPlatforms();
        fetchGenres();
    }, []);

    return (
        <div>
            <Typography variant="h5" align="center">
                Game Settings
            </Typography>
            <Formik
                initialValues={{
                    name: gameData.name,
                    metadata: {
                        coverImage: gameData.metadata?.coverImage || '',
                        year: gameData.metadata?.year || '',
                        genre: selectedGenres,
                        platforms: selectedPlatforms,
                    },
                    racetimeCategory: gameData.racetimeCategory,
                    racetimeGoal: gameData.racetimeGoal,
                }}
                onSubmit={async (values) => {
                    const res = await fetch(`/api/games/${gameData.slug}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    });
                    if (!res.ok) {
                        const error = await res.text();
                        alertError(`Failed to update game - ${error}`);
                        return;
                    }
                    mutate(`/api/games/${gameData.slug}`);
                }}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                    <Box display="flex" flexDirection="column" justifyItems="center" rowGap={2} pt={2}>
                        <FormikTextField id="game-name" name="name" label="Name" />
                        <FormikTextField
                            id="game-cover-image"
                            name="metadata.coverImage"
                            label="Cover Image"
                        />
                        <FormikTextField
                            id="game-year"
                            name="metadata.year"
                            label="Year"
                            type="number"
                        />

                        {/* Platforms */}
                        <FormikApiSelectAutocomplete
                            id="game-platforms"
                            name="metadata.platforms"
                            label="Platforms"
                            api="/api/games/platforms"
                            autocomplete={true}
                            multiple={true}
                        />

                        {/* Genres */}
                        <FormikApiSelectAutocomplete
                            id="game-genres"
                            name="metadata.genre"
                            label="Genres"
                            api="/api/games/genres"
                            autocomplete={true}
                            multiple={true}
                        />

                        {gameData.racetimeBeta && <RacetimeSettings />}
                        <Box pt={1} display="flex">
                            <Box flexGrow={1} />
                            <Button
                                type="submit"
                                variant="contained"
                                color="success"
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Box>
                </Form>
                )}
            </Formik>
        </div>
    );
}
