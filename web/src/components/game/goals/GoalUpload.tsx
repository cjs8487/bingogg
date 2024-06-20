import { SRLv5UploadForm } from './uploadForms/Srlv5';
import { ListUploadForm } from './uploadForms/List';
import { Dialog, Tab, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';

export interface UploadFormProps {
    slug: string;
    close: () => void;
}

interface GoalUploadProps {
    isOpen: boolean;
    close: () => void;
    slug: string;
}

const uploadModes = ['List', 'SRLv5'];

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
                                        {uploadModes.map((tab) => (
                                        <Tab.Panel key={tab} className="h-full rounded-xl p-3">
                                            {tab === 'List' && (
                                                <div>
                                                    <div className="mb-2.5 flex items-center gap-x-3 rounded-md bg-yellow-300 px-2 py-1 text-sm text-black">
                                                        <div>
                                                            <FontAwesomeIcon
                                                                icon={faExclamation}
                                                                className="mt-1 rounded-full border border-black px-3 py-1 text-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p>Please ensure that the list
                                                            you upload is a proper json array.</p>
                                                            <p>If you have troubles with the data format,
                                                                verify that it is correctly formatted at
                                                                <a className="underline text-blue-600 hover:text-blue-800"
                                                                   href='https://jsonlint.com'> jsonlint.com
                                                                </a>
                                                            </p>
                                                            <p>Please refresh the page afterwards to see the changes.</p>
                                                        </div>
                                                    </div>
                                                    <ListUploadForm
                                                        slug={slug}
                                                        close={close}
                                                    />
                                                </div>
                                            )}
                                            {tab === 'SRLv5' && (
                                                <div>
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
                                            </div>
                                            )}
                                        </Tab.Panel>))}
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
