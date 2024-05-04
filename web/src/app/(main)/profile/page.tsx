'use client';
import { Suspense, useContext, useLayoutEffect } from 'react';
import { UserContext } from '../../../context/UserContext';
import { redirect } from 'next/navigation';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import RacetimeIntegration from './RacetimeIntegration';

export default function ProfilePage() {
    const { user, loggedIn } = useContext(UserContext);

    useLayoutEffect(() => {
        if (!loggedIn) {
            redirect('/');
        }
    });
    if (!loggedIn || !user) {
        return null;
    }

    return (
        <>
            <div className="mb-6 text-2xl">{user.username}</div>
            <div className="mb-2 text-xl">Account Info</div>
            <Formik initialValues={{}} onSubmit={() => {}}>
                <Form className="flex w-1/2 flex-col gap-y-2">
                    <div>
                        <label>
                            <div>Username</div>
                            <Field name="username" className="w-full" />
                        </label>
                        <ErrorMessage
                            name="name"
                            component="div"
                            className="mt-1 text-xs text-error-content"
                        />
                    </div>
                    <div>
                        <label>
                            <div>Email</div>
                            <Field name="email" className="w-full" />
                        </label>
                        <ErrorMessage
                            name="name"
                            component="div"
                            className="mt-1 text-xs text-error-content"
                        />
                    </div>
                    <div className="mt-2 flex">
                        <div className="grow" />
                        <button className="rounded-md bg-green-700 px-2 py-1">
                            Update
                        </button>
                    </div>
                </Form>
            </Formik>
            <div className="mb-6">
                <div className="mb-2 text-xl">Password</div>
                <button className="mb-1 rounded-md border border-red-500 bg-red-600 px-2 py-1 ">
                    Change Password
                </button>
                <div className="text-xs">
                    Changing your password will end all login sessions.
                </div>
            </div>
            <div>
                <div className="mb-2 text-xl">Integrations</div>
                <Suspense>
                    <RacetimeIntegration />
                </Suspense>
            </div>
        </>
    );
}
