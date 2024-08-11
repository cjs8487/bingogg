'use client';
import { useApi } from '@/lib/Hooks';
import { Game } from '@/types/Game';
import Info from '@mui/icons-material/Info';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Container, Link, Tab, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import Image from 'next/image';
import NextLink from 'next/link';
import { useLayoutEffect, useState } from 'react';
import { mutate } from 'swr';
import HoverIcon from '../../../../components/HoverIcon';
import PermissionsManagement from '../../../../components/game/PermissionsManagement';
import GoalManagement from '../../../../components/game/goals/GoalManagement';
import FormikSwitch from '../../../../components/input/FormikSwitch';
import FormikTextField from '../../../../components/input/FormikTextField';
import { alertError } from '../../../../lib/Utils';
import { GoalManagerContextProvider } from '../../../../context/GoalManagerContext';

export default function GamePage({
    params: { slug },
}: {
    params: { slug: string };
}) {
    const { data: gameData, isLoading } = useApi<Game>(`/api/games/${slug}`);

    const [isOwner, setIsOwner] = useState(false);
    const [canModerate, setCanModerate] = useState(false);
    const [tab, setTab] = useState('Goals');
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
    };

    useLayoutEffect(() => {
        async function loadPermissions() {
            const res = await fetch(`/api/games/${slug}/permissions`);
            if (!res.ok) {
                if (res.status !== 401 && res.status !== 403) {
                    alertError('Unable to determine game permissions.');
                }
                return;
            }
            const permissions = await res.json();
            setIsOwner(permissions.isOwner);
            setCanModerate(permissions.canModerate);
        }
        loadPermissions();
    }, [slug]);

    if (!gameData || isLoading) {
        return null;
    }

    const tabs = ['Goals'];
    if (isOwner) {
        tabs.push('Permissions');
        tabs.push('Settings');
    }

    return (
        <Container
            sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                pt: 2,
            }}
        >
            <Box display="flex">
                <Box position="fixed" mr={4}>
                    {gameData.coverImage && (
                        <Image src={gameData.coverImage} alt="" fill />
                    )}
                    {!gameData.coverImage && (
                        <div>
                            <div>{slug}</div>
                        </div>
                    )}
                </Box>
                <Box flexGrow={1}>
                    <Link component={NextLink} href={`/games/${slug}`}>
                        {gameData.slug}
                    </Link>
                    <Typography variant="h6">{gameData.name}</Typography>
                </Box>
                <Box minWidth="30%">
                    <Typography
                        variant="body1"
                        sx={{ textDecoration: 'underline' }}
                    >
                        Owners
                    </Typography>
                    <Typography variant="body2">
                        {gameData.owners?.map((o) => o.username).join(', ')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ textDecoration: 'underline' }}
                    >
                        Moderators
                    </Typography>
                    <Typography variant="body2">
                        {gameData.moderators?.map((o) => o.username).join(', ')}
                    </Typography>
                </Box>
            </Box>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        onChange={handleChange}
                        aria-label="lab API tabs example"
                    >
                        {tabs.map((tab) => (
                            <Tab key={tab} label={tab} value={tab} />
                        ))}
                    </TabList>
                </Box>
                <TabPanel
                    value="Goals"
                    sx={{
                        display: tab === 'Goals' ? 'flex' : 'none',
                        flexGrow: 1,
                    }}
                >
                    <GoalManagerContextProvider
                        slug={slug}
                        canModerate={canModerate}
                    >
                        <GoalManagement />
                    </GoalManagerContextProvider>
                </TabPanel>
                <TabPanel value="Permissions">
                    <PermissionsManagement slug={slug} gameData={gameData} />
                </TabPanel>
                <TabPanel value="Settings">
                    <div>
                        <Typography variant="h5" align="center">
                            Game Settings
                        </Typography>
                        <Formik
                            initialValues={{
                                name: gameData.name,
                                coverImage: gameData.coverImage,
                                enableSRLv5: gameData.enableSRLv5,
                            }}
                            onSubmit={async ({
                                name,
                                coverImage,
                                enableSRLv5,
                            }) => {
                                const res = await fetch(`/api/games/${slug}`, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        name,
                                        coverImage,
                                        enableSRLv5,
                                    }),
                                });
                                if (!res.ok) {
                                    const error = await res.text();
                                    alertError(
                                        `Failed to update game - ${error}`,
                                    );
                                    return;
                                }
                                mutate(`/api/games/${slug}`);
                            }}
                        >
                            <Form>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    justifyItems="center"
                                    rowGap={2}
                                    pt={2}
                                >
                                    <FormikTextField
                                        id="game-name"
                                        name="name"
                                        label="Name"
                                    />
                                    <FormikTextField
                                        id="game-cover-image"
                                        name="coverImage"
                                        label="Cover Image"
                                    />
                                    <Box display="flex" alignItems="center">
                                        <FormikSwitch
                                            id="game-srlv5-generation-switch"
                                            label="Enable SRLv5 Board Generation"
                                            name="enableSRLv5"
                                        />
                                        <HoverIcon icon={<Info />}>
                                            <Typography variant="caption">
                                                SRLv5 generation requires goals
                                                to have a difficulty value
                                                assigned to them in order to be
                                                used in generation. The
                                                generator uses the difficulty
                                                value to balance each row,
                                                column, and diagonal, by having
                                                the difficulty of goals in each
                                                sum to the same value. It also
                                                tries to minimize synergy
                                                between goals in the same line
                                                by minimizing the category
                                                overlap.
                                            </Typography>
                                        </HoverIcon>
                                    </Box>
                                    <Box pt={1} display="flex">
                                        <Box flexGrow={1} />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="success"
                                        >
                                            Save Changes
                                        </Button>
                                    </Box>
                                </Box>
                            </Form>
                        </Formik>
                    </div>
                </TabPanel>
            </TabContext>
        </Container>
    );
}
