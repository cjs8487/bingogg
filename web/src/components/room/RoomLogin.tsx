'use client';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import { RoomContext } from '../../context/RoomContext';
import FormikTextField from '../input/FormikTextField';

export default function RoomLogin() {
    // context
    const { connect, roomData } = useContext(RoomContext);

    // state
    const [error, setError] = useState<string>();

    return (
        <Box
            display="flex"
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
        >
            <Paper
                sx={{
                    p: 4,
                }}
            >
                <Formik
                    initialValues={{ nickname: '', password: '' }}
                    onSubmit={async ({ nickname, password }) => {
                        const result = await connect(nickname, password);
                        if (!result.success) {
                            setError(result.message);
                        }
                    }}
                >
                    <Form>
                        {error && (
                            <Typography pb={1} color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                        <Box display="flex" flexDirection="column" rowGap={2}>
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
                        <Box display="flex">
                            <Box flexGrow={1} />
                            <Button type="submit">Join Room</Button>
                        </Box>
                    </Form>
                </Formik>
            </Paper>
        </Box>
    );
}
