'use client';
import { alertError } from '@/lib/Utils';
import { Game } from '@/types/Game';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';
import { Form, Formik, useField, useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { useAsync } from 'react-use';
import * as yup from 'yup';
import { useApi } from '../lib/Hooks';
import FormikSelectFieldAutocomplete from './input/FormikSelectFieldAutocomplete';
import FormikTextField from './input/FormikTextField';

const roomValidationSchema = yup.object().shape({
    name: yup.string().required('Room name is required'),
    nickname: yup.string().required('Player nickname is required'),
    password: yup.string().required('Password is required'),
    game: yup.string().required('Game is required'),
    // variant: yup.string().required('Game variant is required'),
    // mode: yup
    //     .string()
    //     .required('Game mode is required')
    //     .oneOf(['lines', 'blackout', 'lockout'], 'Invalid game mode'),
});

function GenerationModeSelectField() {
    const {
        values: { game },
    } = useFormikContext<{ game: string }>();
    const [field, meta] = useField<string>('generationMode');

    const modes = useAsync(async () => {
        if (!game) {
            return [];
        }

        const res = await fetch(`/api/games/${game}`);
        if (!res.ok) {
            return [];
        }
        const gameData: Game = await res.json();

        const modes = ['Random'];
        if (gameData.enableSRLv5) {
            modes.push('SRLv5');
        }
        return modes;
    }, [game]);

    if (modes.loading || modes.error || !modes.value) {
        return null;
    }

    return (
        <FormControl>
            <InputLabel id="generationMode-label">Generation Mode</InputLabel>
            <Select
                id="generationMode"
                labelId="generationMode-label"
                name="generationMode"
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                fullWidth
            >
                {modes.value.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                        {mode}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default function RoomCreateForm() {
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
                game: null,
                password: '',
                variant: '',
                mode: '',
                seed: undefined,
                generationMode: '',
            }}
            validationSchema={roomValidationSchema}
            onSubmit={async (values) => {
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
                localStorage.setItem('bingogg.temp.nickname', values.nickname);
                localStorage.setItem(`authToken-${slug}`, authToken);
                router.push(`/rooms/${slug}`);
            }}
        >
            <Form>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: 2.5,
                    }}
                >
                    <FormikTextField name="name" label="Room Name" />
                    <FormikTextField name="nickname" label="Nickname" />
                    <FormikTextField
                        id="roomPassword"
                        type="password"
                        name="password"
                        label="Password"
                    />
                    <FormikSelectFieldAutocomplete
                        id="gameSelect"
                        name="game"
                        label="Game"
                        options={games.map((game) => ({
                            label: game.name,
                            value: game.slug,
                        }))}
                    />
                    {/* <div>
                    <div>
                        <label>
                            <div>Variant</div>
                            <Field name="variant" />
                        </label>
                        <ErrorMessage
                            name="variant"
                            component="div"
                        />
                    </div>
                    <div>
                        <label>
                            <div>Game Mode</div>
                            <Field as="select" name="mode">
                                <option value="">Select Game Mode</option>
                                <option value="lines">Lines</option>
                                <option value="blackout">Blackout</option>
                                <option value="lockout">Lockout</option>
                            </Field>
                        </label>
                        <ErrorMessage
                            name="mode"
                            component="div"
                        />
                    </div>
                </div> */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Advanced Generation Options
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                rowGap: 3,
                            }}
                        >
                            <FormikTextField
                                type="number"
                                name="seed"
                                label="Seed"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                fullWidth
                            />
                            <GenerationModeSelectField />
                        </AccordionDetails>
                    </Accordion>
                    <Box display="flex">
                        <Box flexGrow={1} />
                        <Button variant="contained" type="submit">
                            Create Room
                        </Button>
                    </Box>
                </Box>
            </Form>
        </Formik>
    );
}
