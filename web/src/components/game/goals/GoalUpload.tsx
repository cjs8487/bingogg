import { Dialog, Tab, Transition } from '@headlessui/react';
import { Field, Form, Formik } from 'formik';
import { Fragment } from 'react';
import { parseSRLv5BingoList } from '../../../lib/goals/SRLv5Parser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';
import { alertError } from '../../../lib/Utils';

interface UploadFormProps {
    slug: string;
    close: () => void;
}

function SRLv5UploadForm({ slug, close }: UploadFormProps) {
    return (
        <Formik
            initialValues={{ data: '' }}
            onSubmit={async ({ data }) => {
                const parsedList = parseSRLv5BingoList(data);
                if (!parsedList) {
                    alertError('Unable to parse file contents');
                    return;
                }

                let invalid = false;
                const goals = parsedList
                    .map((goalList, difficulty) => {
                        if (invalid) {
                            return [];
                        }
                        if (difficulty < 1 || difficulty > 25) {
                            invalid = true;
                            return [];
                        }
                        return goalList.map((goal) => {
                            if (!goal.name) {
                                invalid = true;
                            }
                            return {
                                goal: goal.name,
                                difficulty,
                                categories: goal.types,
                            };
                        });
                    })
                    .flat();
                if (invalid) {
                    alertError('The data entered is invalid.');
                    return;
                }
                const res = await fetch('/api/goals/upload/srlv5', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        slug,
                        goals,
                    }),
                });
                if (!res.ok) {
                    const error = await res.text();
                    alertError(`Could not upload results - ${error}`);
                    return;
                }
                close();
            }}
        >
            <Form>
                <label>
                    Data
                    <Field
                        name="data"
                        as="textarea"
                        className="h-full w-full p-2 text-black"
                        rows={10}
                    />
                </label>
                <div className="mt-5">
                    <button
                        type="button"
                        className="rounded-md border border-transparent bg-error px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                        onClick={close}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="float-right rounded-md border border-transparent bg-success px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                    >
                        Submit
                    </button>
                </div>
            </Form>
        </Formik>
    );
}
interface GoalUploadProps {
    isOpen: boolean;
    close: () => void;
    slug: string;
}

const uploadModes = ['SRLv5'];

export default function GoalUpload({ isOpen, close, slug }: GoalUploadProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                                    Upload Goals
                                </Dialog.Title>

                                <Tab.Group>
                                    <Tab.List className="mt-3 flex rounded-xl bg-blue-900/20 p-1">
                                        {uploadModes.map((tab) => (
                                            <Tab
                                                key={tab}
                                                className={({ selected }) =>
                                                    `w-full rounded-lg  py-2.5 text-sm font-medium leading-5 ${
                                                        selected
                                                            ? 'cursor-default bg-gray-500 shadow'
                                                            : 'bg-slate-700 text-blue-100 hover:bg-slate-600 hover:text-white'
                                                    }`
                                                }
                                            >
                                                {tab}
                                            </Tab>
                                        ))}
                                    </Tab.List>
                                    <Tab.Panels className="mt-2 h-full">
                                        <Tab.Panel className="h-full rounded-xl p-3">
                                            <div className="mb-2.5 flex items-center gap-x-3 rounded-md bg-yellow-300 px-2 py-1 text-sm text-black">
                                                <div>
                                                    <FontAwesomeIcon
                                                        icon={faExclamation}
                                                        className="mt-1 rounded-full border border-black px-3 py-1 text-lg"
                                                    />
                                                </div>
                                                <div>
                                                    Only use this upload method
                                                    if you trust the author of
                                                    the goal list.
                                                </div>
                                            </div>
                                            <SRLv5UploadForm
                                                slug={slug}
                                                close={close}
                                            />
                                        </Tab.Panel>
                                    </Tab.Panels>
                                </Tab.Group>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
