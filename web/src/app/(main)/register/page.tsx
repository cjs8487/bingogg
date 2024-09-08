'use client';
import { ErrorMessage, FastField, Field, Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import * as yup from 'yup';
import { UserContext } from '../../../context/UserContext';
import { alertError } from '../../../lib/Utils';
import FormikTextField from '../../../components/input/FormikTextField';
import { Box, Button, Link, Paper, Typography } from '@mui/material';
import { register } from '../../../actions/Registration';

const validationSchema = yup.object({
    email: yup
        .string()
        .required('Email is required.')
        .email('Not a properly formatted email.')
        .test(
            'isAvailable',
            'An account is already registered with that email.',
            async (email) => {
                const res = await fetch(
                    `/api/registration/checkEmail?email=${email}`,
                );
                if (!res.ok) {
                    return false;
                }
                const data = await res.json();
                if (data.valid) {
                    return true;
                }
                return false;
            },
        ),
    username: yup
        .string()
        .required('Username is required.')
        .min(4, 'Username must be at least 4 characters.')
        .max(16, 'Username cannot be longer than 16 characters.')
        .matches(
            /^[a-zA-Z0-9]*$/,
            'Username can only contain letters and numbers.',
        )
        .test(
            'isAvailable',
            'An account with that username already exists.',
            async (username, ctx) => {
                const res = await fetch(
                    `/api/registration/checkUsername?name=${username}`,
                );
                if (!res.ok) {
                    return ctx.createError({
                        message: 'Unable to validate username availability.',
                    });
                }
                const data = await res.json();
                if (!data.valid) {
                    if (data.reason) {
                        return ctx.createError({ message: data.reason });
                    }
                    return false;
                }
                return true;
            },
        ),
    password: yup
        .string()
        .required('Password is required.')
        .matches(
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}\[\]:;<>,.?\/~_+-=|]).{8,}$/,
            'Password does not meet strength requirements.',
        ),
    passwordConfirmation: yup
        .string()
        .required('Confirm your password.')
        .test(
            'matches',
            'Passwords do not match.',
            (confirm, ctx) =>
                ctx.parent.password && confirm === ctx.parent.password,
        ),
});

export default function Register() {
    const router = useRouter();
    const { user, checkSession } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            router.replace('/');
        }
    }, [user, router]);

    return (
        <Box
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
            display="flex"
        >
            <Paper sx={{ px: 8, py: 4 }}>
                <Box textAlign="center" pb={2}>
                    <Typography variant="h4">
                        Register for an Account
                    </Typography>
                    <Typography variant="caption">
                        Already have an account?{' '}
                        <Link href="/login" component={NextLink}>
                            Log in instead
                        </Link>
                    </Typography>
                </Box>
                <Formik
                    initialValues={{
                        email: '',
                        username: '',
                        password: '',
                        passwordConfirmation: '',
                    }}
                    validationSchema={validationSchema}
                    validateOnChange={false}
                    onSubmit={async ({ email, username, password }) => {
                        const res = await register(email, username, password);
                        if (!res.ok) {
                            const error = res.message;
                            alertError(
                                `Unable to submit registration - ${error}`,
                            );
                            return;
                        }
                        if (res.status === 201) {
                            await checkSession();
                            router.push('/');
                        }
                    }}
                >
                    {({ isValid, isSubmitting, values: { password } }) => (
                        <Form
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                rowGap: 16,
                            }}
                        >
                            <FormikTextField
                                id="email"
                                name="email"
                                label="Email"
                                fullWidth
                            />
                            <FormikTextField
                                id="username"
                                name="username"
                                label="Username"
                                autoComplete="username"
                                fullWidth
                            />
                            <Box>
                                <FormikTextField
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                />
                                <Typography variant="caption">
                                    Your password must contain the following:
                                    <ul style={{ margin: 0 }}>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.length >= 8
                                                    ? 'success.main'
                                                    : ''
                                            }
                                        >
                                            At least 8 characters
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(/[a-z]+/)
                                                    ? 'success.main'
                                                    : ''
                                            }
                                        >
                                            One lowercase letter
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(/[A-Z]+/)
                                                    ? 'success.main'
                                                    : ''
                                            }
                                        >
                                            One uppercase letter
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(/[0-9]+/)
                                                    ? 'success.main'
                                                    : ''
                                            }
                                        >
                                            A number
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(
                                                    /[*.!@$%^&(){}\[\]:;<>,.?\/~_\+\-=|\\]+/,
                                                )
                                                    ? 'success.main'
                                                    : ''
                                            }
                                        >
                                            A symbol
                                        </Typography>
                                    </ul>
                                </Typography>
                            </Box>
                            <FormikTextField
                                id="confirmPassword"
                                type="password"
                                name="passwordConfirmation"
                                label="Confirm Password"
                                autoComplete="new-password"
                                fullWidth
                            />
                            <Box textAlign="right">
                                <Button
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                >
                                    Register
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Paper>
        </Box>
    );
}
