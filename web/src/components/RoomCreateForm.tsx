'use client';
import { Game } from '@/types/Game';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure } from '@headlessui/react';
import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useAsync } from 'react-use';
import * as yup from 'yup';
import { useApi } from '../lib/Hooks';
import { alertError } from '@/lib/Utils';

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
                game: '',
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
                    alertError(
                        `Unable to create room - ${error}`,
                    );
                    return;
                }
                const { slug, authToken } = await res.json();
                localStorage.setItem('bingogg.temp.nickname', values.nickname);
                localStorage.setItem(`authToken-${slug}`, authToken);
                router.push(`/rooms/${slug}`);
            }}
        >
            <Form className="flex flex-col gap-y-3">
                <div>
                    <label>
                        <div>Room Name</div>
                        <Field name="name" className="w-full" />
                    </label>
                    <ErrorMessage
                        name="name"
                        component="div"
                        className="mt-1 text-xs text-error-content"
                    />
                </div>

                <div>
                    <label>
                        <div>Nickname</div>
                        <Field name="nickname" className="w-full" />
                    </label>
                    <ErrorMessage
                        name="nickname"
                        component="div"
                        className="mt-1 text-xs text-error-content"
                    />
                </div>

                <div>
                    <label>
                        <div>Password</div>
                        <Field
                            type="password"
                            name="password"
                            className="w-full"
                        />
                    </label>
                    <ErrorMessage
                        name="game"
                        component="div"
                        className="mt-1 text-xs text-error-content"
                    />
                </div>
                <div>
                    <label>
                        <div>Game</div>
                        <Field as="select" name="game" className="w-full">
                            <option value="">Select Game</option>
                            {games.map((game) => (
                                <option key={game.slug} value={game.slug}>
                                    {game.name}
                                </option>
                            ))}
                        </Field>
                    </label>
                    <ErrorMessage
                        name="game"
                        component="div"
                        className="mt-1 text-xs text-error-content"
                    />
                </div>
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
                                            open ? faChevronUp : faChevronDown
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
                <div className="flex">
                    <div className="grow" />
                    <button className="rounded-md bg-primary px-2 py-1 transition-all duration-200 hover:bg-primary-light">
                        Create Room
                    </button>
                </div>
            </Form>
        </Formik>
    );
}

interface InlineLabelProps {
    label: string;
    children: ReactNode;
}

function InlineLabel({ label, children }: InlineLabelProps) {
    return (
        <label className="flex justify-center gap-x-8 text-xl">
            <span className="w-1/2 text-right">{label}</span>
            <div className="grow text-black">{children}</div>
        </label>
    );
}
