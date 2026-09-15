'use client';
import { Box, Button, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import { RoomContext } from '../../context/RoomContext';
import FormikTextField from '../input/FormikTextField';

export default function RoomLogin() {
    // context
    const { connect } = useContext(RoomContext);

    // state
    const [error, setError] = useState<string>();

    return (
        <Box
            sx={{
                display: 'flex',
                flexGrow: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Formik
                initialValues={{ nickname: '', password: '', spectator: false }}
                onSubmit={async ({ nickname, password, spectator }) => {
                    const result = await connect(nickname, password, spectator);
                    if (!result.success) {
                        setError(result.message);
                    }
                }}
            >
                {({ setFieldValue, submitForm }) => (
                    <Form>
                        {error && (
                            <Typography
                                color="error"
                                variant="body2"
                                sx={{
                                    pb: 1,
                                }}
                            >
                                {error}
                            </Typography>
                        )}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                rowGap: 2,
                            }}
                        >
                            <FormikTextField
                                id="nickname"
                                name="nickname"
                                label="Nickname"
                            />
                            <FormikTextField
                                id="password"
                                name="password"
                                type="password"
                                label="Password"
                            />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 1,
                                mt: 2,
                            }}
                        >
                            <Button
                                type="button"
                                color="secondary"
                                onClick={async () => {
                                    await setFieldValue('spectator', true);
                                    await submitForm();
                                }}
                            >
                                Join as spectator
                            </Button>
                            <Button
                                type="button"
                                onClick={async () => {
                                    await setFieldValue('spectator', false);
                                    await submitForm();
                                }}
                            >
                                Join Room
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}
