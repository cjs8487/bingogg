'use client';
import {
    Box,
    Button,
    Link,
    Paper,
    Typography,
    IconButton,
} from '@mui/material';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import * as yup from 'yup';
import {
    emailAvailable,
    register,
    usernameAvailable,
} from '../../../actions/Registration';
import FormikTextField from '../../../components/input/FormikTextField';
import { UserContext } from '../../../context/UserContext';
import { alertError } from '../../../lib/Utils';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const validationSchema = yup.object({
    email: yup
        .string()
        .required('Email is required.')
        .email('Not a properly formatted email.')
        .test(
            'isAvailable',
            'An account is already registered with that email.',
            emailAvailable,
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
            usernameAvailable,
        ),
    password: yup
        .string()
        .required('Password is required.')
        .matches(
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|]).{8,}$/,
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            router.replace('/');
        }
    }, [user, router]);

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper sx={{ px: 8, py: 4 }}>
                <Box sx={{ textAlign: 'center', pb: 2 }}>
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
                                    type={showPassword ? 'text' : 'password'}
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
                                <Typography variant="caption">
                                    Your password must contain the following:
                                    <ul style={{ margin: 0 }}>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.length >= 8
                                                    ? 'success'
                                                    : ''
                                            }
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            {password.length >= 8 ? (
                                                <Check sx={{ fontSize: 16 }} />
                                            ) : (
                                                <Close sx={{ fontSize: 16 }} />
                                            )}
                                            At least 8 characters
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(/[a-z]+/)
                                                    ? 'success'
                                                    : ''
                                            }
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            {password.match(/[a-z]+/) ? (
                                                <Check sx={{ fontSize: 16 }} />
                                            ) : (
                                                <Close sx={{ fontSize: 16 }} />
                                            )}
                                            One lowercase letter
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(/[A-Z]+/)
                                                    ? 'success'
                                                    : ''
                                            }
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            {password.match(/[A-Z]+/) ? (
                                                <Check sx={{ fontSize: 16 }} />
                                            ) : (
                                                <Close sx={{ fontSize: 16 }} />
                                            )}
                                            One uppercase letter
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(/[0-9]+/)
                                                    ? 'success'
                                                    : ''
                                            }
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            {password.match(/[0-9]+/) ? (
                                                <Check sx={{ fontSize: 16 }} />
                                            ) : (
                                                <Close sx={{ fontSize: 16 }} />
                                            )}
                                            A number
                                        </Typography>
                                        <Typography
                                            component="li"
                                            variant="caption"
                                            color={
                                                password.match(
                                                    /[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]+/,
                                                )
                                                    ? 'success'
                                                    : ''
                                            }
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            {password.match(
                                                /[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]+/,
                                            ) ? (
                                                <Check sx={{ fontSize: 16 }} />
                                            ) : (
                                                <Close sx={{ fontSize: 16 }} />
                                            )}
                                            A symbol
                                        </Typography>
                                    </ul>
                                </Typography>
                            </Box>
                            <FormikTextField
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="passwordConfirmation"
                                label="Confirm Password"
                                autoComplete="new-password"
                                fullWidth
                                endAdornment={
                                    <IconButton
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (curr) => !curr,
                                            )
                                        }
                                        edge="end"
                                        size="small"
                                    >
                                        {showConfirmPassword ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                }
                            />
                            <Box sx={{ textAlign: 'right' }}>
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
