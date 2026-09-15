'use client';

import { Box, Button, Paper } from '@mui/material';
import { Game } from '@playbingo/types';
import NextLink from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';
import { alertError } from '../../../../../lib/Utils';

interface Props {
    gameData: Game;
}

export default function GameTabs({
    gameData: {
        slug,
        newGeneratorBeta,
        descriptionMd,
        setupMd,
        difficultyVariants,
    },
}: Props) {
    const [isOwner, setIsOwner] = useState(false);
    const [canModerate, setCanModerate] = useState(false);

    const segment = useSelectedLayoutSegment();

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

    const tabs: string[] = [];
    if (descriptionMd || setupMd || (difficultyVariants?.length ?? 0) > 0) {
        tabs.push('overview');
    }
    tabs.push('goals');
    tabs.push('variants');
    if (canModerate) {
        tabs.push('categories');
        tabs.push('images');
    }

    if (isOwner) {
        tabs.push('permissions');
        if (newGeneratorBeta) {
            tabs.push('generation');
        }
        tabs.push('settings');
    }

    return (
        <Box
            sx={{
                display: 'flex',
                maxWidth: '100%',
                overflowX: 'auto',
                pt: 4,
                pl: 4,
                zIndex: 2,
                scrollbarWidth: 0,
                '::-webkit-scrollbar': {
                    display: 'none',
                },
            }}
        >
            {tabs.map((page, index) => (
                <Paper
                    key={page}
                    elevation={page === segment ? 1 : 0}
                    sx={{
                        border: 2,
                        borderBottom: page === segment ? 0 : 2,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        borderColor: 'divider',
                        marginLeft: index > 0 ? '-2px' : 0,
                        minWidth: 'fit-content',
                        zIndex: 10,
                        '::before': {
                            content: '""',
                            display: page === segment ? 'block' : 'none',
                            width: '100%',
                            height: 4,
                            background: 'white',
                            borderRadius: 1,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            zIndex: 0,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {page === segment ? (
                        <Box
                            sx={{
                                p: 2,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                textTransform: 'uppercase',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'accent.main',
                                pointerEvents: 'none',
                                cursor: 'default',
                                userSelect: 'none',
                            }}
                        >
                            {page}
                        </Box>
                    ) : (
                        <Button
                            component={NextLink}
                            href={`/games/${slug}/${page}`}
                            sx={{
                                p: 2,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                            }}
                        >
                            {page}
                        </Button>
                    )}
                </Paper>
            ))}
        </Box>
    );
}
