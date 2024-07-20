'use client';
import { Formik, Form, Field, ErrorMessage, FastField } from 'formik';
import { useSearchParams } from 'next/navigation';
import * as yup from 'yup';
import { alertError } from '../../../lib/Utils';
import { Box, Button, Container, Typography } from '@mui/material';
import FormikTextField from '../../../components/input/FormikTextField';

const validationSchema = yup.object({
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

export default function ResetPassword() {
    const params = useSearchParams();
    const token = params.get('token');

    if (!token) {
        return null;
    }

    return (
        <Container
            sx={{ pt: 3, maxWidth: { sm: '75%', lg: '50%', xl: '35%' } }}
        >
            <Typography variant="h5" align="center" pb={2}>
                Reset Password
            </Typography>
            <Formik
                initialValues={{ password: '', passwordConfirm: '' }}
                validationSchema={validationSchema}
                onSubmit={async ({ password }) => {
                    const res = await fetch('/api/auth/resetPassword', {
                        method: 'POST',
                        body: JSON.stringify({ token, password }),
                    });
                    if (!res.ok) {
                        const error = await res.text();
                        alertError(
                            `Unable to submit reset request - ${error}. You may need to request a new reset link.`,
                        );
                        return;
                    }
                }}
            >
                {({ isValid, isSubmitting, values: { password } }) => (
                    <Form
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <FormikTextField
                            id="new-password"
                            name="password"
                            type="password"
                            label="New Password"
                        />
                        <Typography variant="caption" mt={0.5} ml={0.5}>
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
                        <FormikTextField
                            id="new-password-confirm"
                            name="passwordConfirmation"
                            type="password"
                            label="Confirm New Password"
                            sx={{ mt: 2, mb: 1 }}
                        />
                        <Box display="flex">
                            <Box flexGrow={1} />
                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                            >
                                Reset Password
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Container>
    );
}
