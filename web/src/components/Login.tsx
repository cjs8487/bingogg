'use client';
import { Box, Button, Link, Typography, IconButton } from '@mui/material';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login } from '../actions/Session';
import { useUserContext } from '../context/UserContext';
import FormikTextField from './input/FormikTextField';
import logo from '@/images/playbingologo.png';
import {
    HubTwoTone as Hub,
    LockTwoTone as Lock,
    SportsEsportsTwoTone as SportsEsports,
    SyncTwoTone as Sync,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import Image from 'next/image';

interface LoginProps {
    useRouterBack?: boolean;
}

export default function Login({ useRouterBack }: LoginProps) {
    const { checkSession } = useUserContext();

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
                sx={{
                    p: 2,
                    flexGrow: 1,
                }}
            >
                <Box sx={{ mb: 1, textAlign: 'center' }}>
                    <Image src={logo} alt="PlayBingo logo" height={78} />
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        mb: 2,
                        ml: 2,
                    }}
                >
                    No login is required to play.
                </Typography>
                <Box sx={{ p: 2 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 2,
                                opacity: 0,
                                animation: '1s ease-in-out forwards slidein',
                            }}
                        >
                            <SportsEsports
                                color="secondary"
                                fontSize="large"
                                sx={{ mr: 1, mt: 0.5 }}
                            />
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        mb: 0.5,
                                    }}
                                >
                                    Game Management
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Create and manage your own bingo games, no
                                    coding required!
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 2,
                                opacity: 0,
                                animation:
                                    '1s ease-in-out 0.5s forwards slidein',
                            }}
                        >
                            <Hub
                                color="secondary"
                                fontSize="large"
                                sx={{ mr: 1, mt: 0.5 }}
                            />
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        mb: 0.5,
                                    }}
                                >
                                    Connect with Services
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Integrate with external platforms like
                                    racetime.gg for enhanced bingo experiences
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 2,
                                opacity: 0,
                                animation: '1s ease-in-out 1s forwards slidein',
                            }}
                        >
                            <Sync
                                color="secondary"
                                fontSize="large"
                                sx={{ mr: 1, mt: 0.5 }}
                            />
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        mb: 0.5,
                                    }}
                                >
                                    Sync Across Devices
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Seamlessly sync your preferences and game
                                    data across all your devices
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 2,
                                opacity: 0,
                                animation:
                                    '1s ease-in-out 1.5s forwards slidein',
                            }}
                        >
                            <Lock
                                color="secondary"
                                fontSize="large"
                                sx={{ mr: 1, mt: 0.5 }}
                            />
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        mb: 0.5,
                                    }}
                                >
                                    Passwordless Room Entry
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Quickly rejoin rooms that you're already a
                                    part of without re-entering the password
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right', mt: 2 }}>
                    <Link
                        href="/legal/privacy"
                        component={NextLink}
                        variant="caption"
                        color="text.secondary"
                    >
                        Privacy Policy
                    </Link>
                </Box>
                {error && (
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                )}
            </Box>
            <Formik
                initialValues={{ username: '', password: '' }}
                onSubmit={async ({ username, password }) => {
                    const res = await login(username, password);
                    if (!res.ok) {
                        if (res.status === 401) {
                            setError('Incorrect username or password.');
                        } else {
                            setError(
                                'An error occurred while processing your request.',
                            );
                        }
                        return;
                    }
                    await checkSession();
                    if (useRouterBack) {
                        router.back();
                    } else {
                        router.push('/');
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: 2,
                        backgroundColor: 'background.paper',
                        p: 4,
                        boxShadow: 2,
                        minWidth: 300,
                    }}
                    component={Form}
                >
                    <FormikTextField
                        id="username"
                        name="username"
                        label="Username"
                    />
                    <Box sx={{ textAlign: 'right' }}>
                        <FormikTextField
                            id="password"
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            fullWidth
                            endAdornment={
                                <IconButton
                                    onClick={() =>
                                        setShowPassword((curr) => !curr)
                                    }
                                    edge="end"
                                    size="small"
                                >
                                    {showPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            }
                        />
                        <Link
                            href="/forgotpass"
                            component={NextLink}
                            variant="caption"
                        >
                            Forgot password?
                        </Link>
                    </Box>
                    <Button type="submit" variant="contained" color="primary">
                        Log In
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        href="/register"
                    >
                        Register
                    </Button>
                </Box>
            </Formik>
        </Box>
    );
}
