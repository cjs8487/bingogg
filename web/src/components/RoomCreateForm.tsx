'use client';
import { alertError } from '@/lib/Utils';
import { Game } from '@/types/Game';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure } from '@headlessui/react';
import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { Field, Form, Formik, useField, useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { HTMLInputTypeAttribute } from 'react';
import { useAsync } from 'react-use';
import * as yup from 'yup';
import { useApi } from '../lib/Hooks';

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
        <label>
            <div>Generation Mode</div>
            <Field as="select" name="generationMode" className="w-full">
                <option value="">Select Generation Mode</option>
                {modes.value.map((mode) => (
                    <option key={mode} value={mode}>
                        {mode}
                    </option>
                ))}
            </Field>
        </label>
    );
}

interface FormikTextFieldProps {
    id?: string;
    name: string;
    label: string;
    type?: HTMLInputTypeAttribute;
}

function FormikTextField({ id, name, label, type }: FormikTextFieldProps) {
    const [field, meta] = useField<string>(name);
    return (
        <TextField
            id={id ?? name}
            name={name}
            label={label}
            type={type}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
        />
    );
}

interface SelectOption {
    label: string;
    value: string;
}
interface FormikSelectProps {
    id: string;
    name: string;
    label: string;
    options: SelectOption[];
    placeholder?: string;
}

function FormikSelectField({ id, name, label, options }: FormikSelectProps) {
    const [field, meta, helpers] = useField<string>(name);

    return (
        <Autocomplete
            disablePortal
            id={id}
            value={
                options.find((opt) => opt.value === field.value)?.label ?? ''
            }
            onChange={(event, newValue) => {
                helpers.setValue(
                    options.find((option) => option.label === newValue)
                        ?.value ?? '',
                );
            }}
            onBlur={field.onBlur}
            options={options.map((option) => option.label)}
            renderInput={(params) => <TextField {...params} label={label} />}
        />
    );
}

export default function RoomCreateForm() {
    const { data: games, isLoading } = useApi<Game[]>('/api/games');
    const router = useRouter();

    if (isLoading) {
        return null;
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
                    <FormikSelectField
                        id="gameSelect"
                        name="game"
                        label="Game"
                        options={games.map((game) => ({
                            label: game.name,
                            value: game.slug,
                        }))}
                    />
                    {/* <div className="flex gap-x-4">
                    <div className="w-1/2">
                        <label>
                            <div>Variant</div>
                            <Field name="variant" className="w-full" />
                        </label>
                        <ErrorMessage
                            name="variant"
                            component="div"
                            className="mt-1 text-xs text-error-content"
                        />
                    </div>
                    <div className="w-1/2">
                        <label>
                            <div>Game Mode</div>
                            <Field as="select" name="mode" className="w-full">
                                <option value="">Select Game Mode</option>
                                <option value="lines">Lines</option>
                                <option value="blackout">Blackout</option>
                                <option value="lockout">Lockout</option>
                            </Field>
                        </label>
                        <ErrorMessage
                            name="mode"
                            component="div"
                            className="mt-1 text-xs text-error-content"
                        />
                    </div>
                </div> */}
                    <div className="rounded-md border border-text-lighter bg-foreground px-3 py-2 shadow-lg shadow-text-lighter/10">
                        <Disclosure>
                            {({ open }) => (
                                <>
                                    <Disclosure.Button className="flex w-full items-center justify-between gap-x-4 text-left text-sm font-medium">
                                        <span>Advanced Generation Options</span>
                                        <FontAwesomeIcon
                                            icon={
                                                open
                                                    ? faChevronUp
                                                    : faChevronDown
                                            }
                                        />
                                    </Disclosure.Button>
                                    <Disclosure.Panel className="flex gap-x-3 px-4 pb-2 pt-4 text-sm text-text">
                                        <label>
                                            <div>Seed</div>
                                            <Field
                                                type="number"
                                                name="seed"
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                                className="no-step w-full"
                                            />
                                        </label>
                                        <GenerationModeSelectField />
                                    </Disclosure.Panel>
                                </>
                            )}
                        </Disclosure>
                    </div>
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
