import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { Field, Form, Formik } from 'formik';
import { Fragment, useCallback, useContext, useState } from 'react';
import { useAsync, useCopyToClipboard } from 'react-use';
import { RoomContext } from '../../context/RoomContext';
import { Game } from '../../types/Game';
import { toast } from 'react-toastify';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Typography,
} from '@mui/material';
import ConnectionState from './ConnectionState';

export default function RoomInfo() {
    const { roomData, regenerateCard, board } = useContext(RoomContext);

    const [showControlModal, setShowControlModal] = useState(false);

    const close = useCallback(() => {
        setShowControlModal(false);
    }, []);

    const modes = useAsync(async () => {
        if (!roomData) {
            return [];
        }

        const res = await fetch(`/api/games/${roomData.gameSlug}`);
        if (!res.ok) {
            return [];
        }
        const gameData: Game = await res.json();

        const modes = ['Random'];
        if (gameData.enableSRLv5) {
            modes.push('SRLv5');
        }
        return modes;
    }, [roomData]);

    const [, copyToClipboard] = useCopyToClipboard();

    if (!roomData) {
        return (
            <div className="rounded-md border border-white p-2 text-center">
                No Room Data found.
            </div>
        );
    }

    if (modes.loading || modes.error || !modes.value) {
        return null;
    }

    return (
        <>
            <Card className="cursor-pointer rounded-md border-2 border-border bg-foreground px-4 py-2 text-center shadow-lg shadow-border/40">
                <CardActionArea
                    onClick={() => {
                        setShowControlModal(true);
                    }}
                >
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h5"
                            className="text-2xl font-semibold"
                        >
                            {roomData.name}
                        </Typography>
                        <Typography>{roomData.game}</Typography>
                        <Typography component="div" variant="caption" mb={2}>
                            {roomData.slug}
                        </Typography>
                        {/* <div className="flex text-xs">
                            <div>Variant</div>
                            <div className="grow" />
                            <div>Mode</div>
                        </div> */}
                        <ConnectionState />
                    </CardContent>
                </CardActionArea>
            </Card>
            <Transition appear show={showControlModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={close}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-border bg-foreground p-6 text-left align-middle text-white shadow-lg shadow-border/10 transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-medium leading-6"
                                    >
                                        Room Controls
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <div>
                                            <div className="pb-2 text-lg font-semibold">
                                                Card Controls
                                            </div>

                                            <Formik
                                                initialValues={{
                                                    seed: undefined,
                                                    generationMode: '',
                                                }}
                                                onSubmit={({
                                                    seed,
                                                    generationMode,
                                                }) => {
                                                    regenerateCard({
                                                        seed,
                                                        generationMode,
                                                    });
                                                    close();
                                                }}
                                            >
                                                <Form>
                                                    <div className="mb-2">
                                                        <Disclosure>
                                                            {({ open }) => (
                                                                <>
                                                                    <Disclosure.Button className="flex w-full items-center justify-between gap-x-4 text-left text-sm font-medium">
                                                                        <span>
                                                                            Advanced
                                                                            Generation
                                                                            Options
                                                                        </span>
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                open
                                                                                    ? faChevronUp
                                                                                    : faChevronDown
                                                                            }
                                                                        />
                                                                    </Disclosure.Button>
                                                                    <Disclosure.Panel className="flex flex-col gap-y-3 pb-2 pt-2 text-sm">
                                                                        <label className="w-full">
                                                                            <div>
                                                                                Seed
                                                                            </div>
                                                                            <Field
                                                                                type="number"
                                                                                name="seed"
                                                                                pattern="[0-9]*"
                                                                                inputMode="numeric"
                                                                                className="no-step w-full"
                                                                            />
                                                                        </label>
                                                                        <label className="">
                                                                            <div>
                                                                                Generation
                                                                                Mode
                                                                            </div>
                                                                            <Field
                                                                                as="select"
                                                                                name="generationMode"
                                                                                className="w-full rounded-md p-1"
                                                                            >
                                                                                <option value="">
                                                                                    Select
                                                                                    Generation
                                                                                    Mode
                                                                                </option>
                                                                                {modes.value.map(
                                                                                    (
                                                                                        mode,
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                mode
                                                                                            }
                                                                                            value={
                                                                                                mode
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                mode
                                                                                            }
                                                                                        </option>
                                                                                    ),
                                                                                )}
                                                                            </Field>
                                                                        </label>
                                                                    </Disclosure.Panel>
                                                                </>
                                                            )}
                                                        </Disclosure>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className="rounded-md border p-2 hover:bg-gray-700"
                                                    >
                                                        Regenerate Card
                                                    </button>
                                                </Form>
                                            </Formik>
                                        </div>
                                        <div className="pt-6">
                                            <div className="text-lg font-semibold">
                                                Local Actions
                                            </div>
                                            <div className="pt-1 text-xs">
                                                These actions are potentially
                                                destructive and should only be
                                                used if the application is
                                                exhibiting strange or incorrect
                                                behavior
                                            </div>
                                            <div className="flex gap-x-3 pt-3">
                                                <button
                                                    className="rounded-md border p-2 hover:bg-gray-700"
                                                    onClick={() => {
                                                        window.dispatchEvent(
                                                            new Event('resize'),
                                                        );
                                                    }}
                                                >
                                                    Fit Goal Text
                                                </button>
                                            </div>
                                        </div>
                                        <div className="pt-6">
                                            <button
                                                className="rounded-md border p-2 hover:bg-gray-700"
                                                onClick={() => {
                                                    const data = board.board
                                                        .map((row) =>
                                                            row.map((cell) => ({
                                                                name: cell.goal,
                                                            })),
                                                        )
                                                        .flat();
                                                    copyToClipboard(
                                                        JSON.stringify(data),
                                                    );
                                                    toast(
                                                        'Copied bingosync goal list for this board to your clipboard',
                                                    );
                                                }}
                                            >
                                                Export to Bingosync
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
