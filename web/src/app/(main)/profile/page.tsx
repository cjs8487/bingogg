'use client';
import { Suspense, useContext, useLayoutEffect } from 'react';
import { UserContext } from '../../../context/UserContext';
import { redirect } from 'next/navigation';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import RacetimeIntegration from './RacetimeIntegration';
import { Box, Button, Container, Typography } from '@mui/material';
import FormikTextField from '../../../components/input/FormikTextField';

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
        <Container>
            <Typography variant="h4" mb={2}>
                {user.username}
            </Typography>
            {/* <Typography variant="h5" mb={1}>
                Account Info
            </Typography>
            <Formik initialValues={{}} onSubmit={() => {}}>
                <Form>
                    <Box display="flex" flexDirection="column" rowGap={1}>
                        <FormikTextField
                            id="username"
                            name="username"
                            label="Username"
                            size="small"
                        />
                        <FormikTextField
                            id="email"
                            name="email"
                            label="Email"
                            size="small"
                        />
                        <Box display="flex">
                            <Box flexGrow={1} />
                            <Button className="rounded-md bg-green-700 px-2 py-1">
                                Update
                            </Button>
                        </Box>
                    </Box>
                </Form>
            </Formik>
            <Box mb={3}>
                <Typography variant="h6" mb={1}>
                    Password
                </Typography>
                <Button color="error" variant="outlined">
                    Change Password
                </Button>
                <Box>
                    <Typography variant="caption">
                        Changing your password will end all login sessions.
                    </Typography>
                </Box>
            </Box> */}
            <Box>
                <Typography variant="h5" mb={1}>
                    Integrations
                </Typography>
                <Suspense>
                    <RacetimeIntegration />
                </Suspense>
            </Box>
        </Container>
    );
}
