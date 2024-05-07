'use client';
import { useApi } from '@/lib/Hooks';
import { Game } from '@/types/Game';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Container, Link, Tab, Typography } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';
import { useLayoutEffect, useState } from 'react';
import GameSettings from '../../../../components/game/GameSettings';
import PermissionsManagement from '../../../../components/game/PermissionsManagement';
import GoalManagement from '../../../../components/game/goals/GoalManagement';
import { GoalManagerContextProvider } from '../../../../context/GoalManagerContext';
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
                    <GameSettings gameData={gameData} />
                </TabPanel>
            </TabContext>
        </Container>
    );
}
