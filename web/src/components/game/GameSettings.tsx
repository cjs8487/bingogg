import Info from '@mui/icons-material/Info';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import {
    ErrorMessage,
    Field,
    Form,
    Formik,
    useField,
    useFormikContext,
} from 'formik';
import { useAsync } from 'react-use';
import { mutate } from 'swr';
import { alertError } from '../../lib/Utils';
import { Game } from '../../types/Game';
import HoverIcon from '../HoverIcon';
import FormikSwitch from '../input/FormikSwitch';
import FormikTextField from '../input/FormikTextField';

async function validateRacetimeCategory(value: string) {
    if (value) {
        const res = await fetch(`http://localhost:8000/${value}/data`);
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
    return (
        <div>
            <Typography variant="h5" align="center">
                Game Settings
            </Typography>
            <Formik
                initialValues={{
                    name: gameData.name,
                    coverImage: gameData.coverImage,
                    enableSRLv5: gameData.enableSRLv5,
                    racetimeCategory: gameData.racetimeCategory,
                    racetimeGoal: gameData.racetimeGoal,
                }}
                onSubmit={async ({
                    name,
                    coverImage,
                    enableSRLv5,
                    racetimeCategory,
                    racetimeGoal,
                }) => {
                    const res = await fetch(`/api/games/${gameData.slug}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            name,
                            coverImage,
                            enableSRLv5,
                            racetimeCategory,
                            racetimeGoal,
                        }),
                    });
                    if (!res.ok) {
                        const error = await res.text();
                        alertError(`Failed to update game - ${error}`);
                        return;
                    }
                    mutate(`/api/games/${gameData.slug}`);
                }}
            >
                <Form>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyItems="center"
                        rowGap={2}
                        pt={2}
                    >
                        <FormikTextField
                            id="game-name"
                            name="name"
                            label="Name"
                        />
                        <FormikTextField
                            id="game-cover-image"
                            name="coverImage"
                            label="Cover Image"
                        />
                        <Box display="flex" alignItems="center">
                            <FormikSwitch
                                id="game-srlv5-generation-switch"
                                label="Enable SRLv5 Board Generation"
                                name="enableSRLv5"
                            />
                            <HoverIcon icon={<Info />}>
                                <Typography variant="caption">
                                    SRLv5 generation requires goals to have a
                                    difficulty value assigned to them in order
                                    to be used in generation. The generator uses
                                    the difficulty value to balance each row,
                                    column, and diagonal, by having the
                                    difficulty of goals in each sum to the same
                                    value. It also tries to minimize synergy
                                    between goals in the same line by minimizing
                                    the category overlap.
                                </Typography>
                            </HoverIcon>
                        </Box>
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
            </Formik>
        </div>
    );
}
