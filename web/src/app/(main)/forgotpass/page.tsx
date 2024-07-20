'use client';
import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import * as yup from 'yup';
import { alertError } from '../../../lib/Utils';
import FormikTextField from '../../../components/input/FormikTextField';
import { Box, Button, Typography } from '@mui/material';

const validationSchema = yup.object({
    email: yup
        .string()
        .required('Email is required.')
        .email('Not a properly formatted email.'),
    username: yup.string().required('Username is required'),
});

export default function ForgotPassword() {
    const [success, setSuccess] = useState(false);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
        >
            <Typography variant="h4">Forgot Password</Typography>
            <Typography pb={2} variant="body2" color="text.secondary">
                Forgot your password? Follow the steps below to reset it.
            </Typography>
            {!success && (
                <Formik
                    initialValues={{ email: '', username: '' }}
                    validationSchema={validationSchema}
                    onSubmit={async ({ email, username }) => {
                        const res = await fetch('/api/auth/forgotPassword', {
                            method: 'POST',
                            body: JSON.stringify({ email, username }),
                        });
                        if (!res.ok) {
                            const error = await res.text();
                            alertError(
                                `Unable to submit reset request - ${error}`,
                            );
                            return;
                        }
                        setSuccess(true);
                    }}
                >
                    {({ isValid, isSubmitting }) => (
                        <Form>
                            <FormikTextField
                                id="email"
                                name="email"
                                label="Email"
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                            <FormikTextField
                                id="username"
                                name="username"
                                label="Username"
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                            <Box textAlign="right">
                                <Button
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                    variant="contained"
                                >
                                    Reset Password
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            )}
            {success && (
                <Typography>
                    We&#39;ve sent you an email with further details on
                    resetting your password. If you don&#39;t receive it soon,
                    be sure to check your spam folder.
                </Typography>
            )}
        </Box>
    );
}
