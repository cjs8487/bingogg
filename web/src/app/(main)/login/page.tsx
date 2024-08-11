'use client';
import { Field, Form, Formik, FormikHelpers, FormikValues } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/UserContext';
import FormikTextField from '../../../components/input/FormikTextField';
import { Box, Button, Link, Paper, Typography } from '@mui/material';

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState('');
    const { checkSession, user } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
        >
            <Paper sx={{ px: 8, py: 4 }}>
                <Box paddingBottom={2} textAlign="center">
                    <Typography variant="h4">Login to bingo.gg</Typography>
                    <Typography variant="caption" color="text.secondary">
                        No login is required to play bingo.
                    </Typography>
                    {error && (
                        <Typography variant="body2" color="error">
                            {error}
                        </Typography>
                    )}
                </Box>
                <Formik
                    initialValues={{ username: '', password: '' }}
                    onSubmit={async ({ username, password }) => {
                        const res = await fetch('/api/auth/login', {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, password }),
                        });
                        if (!res.ok) {
                            if (res.status === 403) {
                                setError('Incorrect username or password.');
                            } else {
                                setError(
                                    'An error occurred while processing your request.',
                                );
                            }
                            return;
                        }
                        await checkSession();
                        router.push('/');
                    }}
                >
                    <Form>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                rowGap: 2,
                            }}
                        >
                            <FormikTextField
                                id="username"
                                name="username"
                                label="Username"
                            />
                            <Box>
                                <FormikTextField
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    autoComplete="current-password"
                                    fullWidth
                                />
                                <Link
                                    href="/forgotpass"
                                    component={NextLink}
                                    variant="caption"
                                >
                                    Forgot password?
                                </Link>
                            </Box>
                            <Box textAlign="right">
                                <Button href="/register" component={NextLink}>
                                    Register
                                </Button>
                                <Button type="submit" variant="contained">
                                    Log In
                                </Button>
                            </Box>
                        </Box>
                    </Form>
                </Formik>
            </Paper>
        </Box>
    );
}
