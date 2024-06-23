'use client';
import { useApi } from '@/lib/Hooks';
import { Game } from '@/types/Game';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Container, Tab } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useState } from 'react';
import { mutate } from 'swr';
import HoverIcon from '../../../../components/HoverIcon';
import PermissionsManagement from '../../../../components/game/PermissionsManagement';
import GoalManagement from '../../../../components/game/goals/GoalManagement';
import Toggle from '../../../../components/input/Toggle';
import { alertError } from '../../../../lib/Utils';

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
            }}
            className="flex h-full gap-x-3"
        >
            <Box display="flex">
                <Box position="fixed" mr={4}>
                    {gameData.coverImage && (
                        <Image
                            src={gameData.coverImage}
                            alt=""
                            fill
                            className="h-32 w-20 bg-cover bg-center bg-no-repeat"
                        />
                    )}
                    {!gameData.coverImage && (
                        <div className="relative flex h-32 w-20 border shadow-[inset_0_0_8px_white]">
                            <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
                                {slug}
                            </div>
                        </div>
                    )}
                </Box>
                <div className="grow">
                    <Link className="text-sm underline" href={`/games/${slug}`}>
                        {gameData.slug}
                    </Link>
                    <div className="text-xl">{gameData.name}</div>
                </div>
                <div className="w-2/5">
                    <div>
                        <div className="text-lg underline">Owners</div>
                        <div className="">
                            {gameData.owners?.map((o) => o.username).join(', ')}
                        </div>
                    </div>
                    <div>
                        <div className="text-lg underline">Moderators</div>
                        <div className="text-sm">
                            {gameData.moderators
                                ?.map((o) => o.username)
                                .join(', ')}
                        </div>
                    </div>
                </div>
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
                    <GoalManagement slug={slug} canModerate={canModerate} />
                </TabPanel>
                <TabPanel value="Permissions">
                    <PermissionsManagement slug={slug} gameData={gameData} />
                </TabPanel>
                <TabPanel value="Settings">
                    <div>
                        <div className="text-center text-2xl">
                            Game Settings
                        </div>
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
                            <Form className="flex w-full flex-col justify-center gap-y-3 pt-3">
                                <div className="w-1/2">
                                    <label className="flex gap-x-4">
                                        <span className="w-1/3">Game Name</span>
                                        <Field
                                            name="name"
                                            className="w-full text-black"
                                        />
                                    </label>
                                </div>
                                <div className="w-1/2">
                                    <label className="flex gap-x-4">
                                        <span className="w-1/3">
                                            Cover Image
                                        </span>
                                        <Field
                                            name="coverImage"
                                            className="w-full text-black"
                                        />
                                    </label>
                                </div>
                                <label className="flex items-center gap-x-3">
                                    <Field
                                        name="enableSRLv5"
                                        component={Toggle}
                                    />
                                    <span className="flex items-center gap-x-1">
                                        Enable SRLv5 Board Generation{' '}
                                        <HoverIcon icon={faInfo}>
                                            SRLv5 generation requires goals to
                                            have a difficulty value assigned to
                                            them in order to be used in
                                            generation. The generator uses the
                                            difficulty value to balance each
                                            row, column, and diagonal, by having
                                            the difficulty of goals in each sum
                                            to the same value. It also tries to
                                            minimize synergy between goals in
                                            the same line by minimizing the
                                            category overlap.
                                        </HoverIcon>
                                    </span>
                                </label>
                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        className="float-right rounded-md bg-green-400 px-4 py-2 text-center text-sm font-medium text-black hover:bg-green-300 disabled:bg-gray-300"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </Form>
                        </Formik>
                    </div>
                </TabPanel>
            </TabContext>
            {/* <div className="w-1/4 rounded-2xl border-4 p-5"></div> */}
        </Container>
    );
}
