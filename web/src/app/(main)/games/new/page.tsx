'use client';
import { Field, Form, Formik } from 'formik';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useContext, useLayoutEffect } from 'react';
import * as yup from 'yup';
import { UserContext } from '../../../../context/UserContext';
import { alertError } from '../../../../lib/Utils';

const newGameValidationSchema = yup.object().shape({
    name: yup.string().required('Game name is required'),
    slug: yup
        .string()
        .required('Game slug is required')
        .min(2, 'Slugs must be at least 5 characters')
        .max(8, 'Slugs cannot be longer than 8 characters'),
    coverImage: yup
        .string()
        .url('Game cover images ust be a valid URL pointing to the image'),
});

export default function NewGame() {
    const { loggedIn } = useContext(UserContext);
    const router = useRouter();

    useLayoutEffect(() => {
        if (!loggedIn) {
            router.push('/');
        }
    });
    if (!loggedIn) {
        return null;
    }

    return (
        <div>
            <div className="pb-8 text-center text-3xl">Create a new game</div>
            <div className="flex">
                <div className="w-1/4" />
                <Formik
                    initialValues={{ name: '', slug: '', coverImage: '' }}
                    validationSchema={newGameValidationSchema}
                    onSubmit={async (values) => {
                        const res = await fetch('/api/games', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(values),
                        });
                        if (!res.ok) {
                            const error = await res.text();
                            alertError(`Unable to create game - ${error}`);
                            return;
                        }
                        router.push('/');
                    }}
                >
                    {({ errors, touched }) => (
                        <Form className="flex w-1/2 flex-col content-center items-center gap-y-2">
                            <div className="w-full">
                                <label className="flex gap-x-4">
                                    <span className="w-1/3 text-right">
                                        Game Name
                                    </span>
                                    <Field
                                        name="name"
                                        className="w-2/3 text-black"
                                    />
                                </label>
                                {errors.name && touched.name && (
                                    <div className="flex gap-x-4 pt-1 text-sm text-red-600">
                                        <div className="w-1/3" />
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <label className="flex gap-x-4">
                                    <span className="w-1/3 text-right">
                                        Slug
                                    </span>
                                    <Field
                                        name="slug"
                                        className="w-2/3 text-black"
                                    />
                                </label>
                                {errors.slug && touched.slug && (
                                    <div className="flex gap-x-4 pt-1 text-sm text-red-600">
                                        <div className="w-1/3" />
                                        {errors.slug}
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <label className="flex gap-x-4">
                                    <span className="w-1/3 text-right">
                                        Cover Image
                                    </span>
                                    <Field
                                        name="coverImage"
                                        className="w-2/3 text-black"
                                    />
                                </label>
                                {errors.coverImage && touched.coverImage && (
                                    <div className="flex gap-x-4 pt-1 text-sm text-red-600">
                                        <div className="w-1/3" />
                                        {errors.coverImage}
                                    </div>
                                )}
                            </div>
                            <div className="flex w-full pt-2">
                                <div className="grow" />
                                <button
                                    type="submit"
                                    className="rounded-md border bg-green-700 px-2 py-1"
                                >
                                    Submit
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
