import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment, useCallback, useState } from 'react';
import { mutate } from 'swr';
import { Game } from '../../types/Game';
import UserSearch from '../UserSearch';
import { alertError } from '../../lib/Utils';
import { Box, Button, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface PermissionsManagementProps {
    slug: string;
    gameData: Game;
}

export default function PermissionsManagement({
    slug,
    gameData,
}: PermissionsManagementProps) {
    const [searchOpenOwner, setSearchOpenOwner] = useState(false);
    const [searchOpenMod, setSearchOpenMod] = useState(false);

    const updateData = useCallback(() => {
        mutate(`/api/games/${slug}`);
        mutate(`/api/games/${slug}/eligibleMods`);
    }, [slug]);

    return (
        <Box>
            <Box pb={3}>
                <Typography variant="h6">Owners</Typography>
                <Typography pb={3} variant="caption">
                    Owners have full moderation powers over a game, including
                    appointing additional owners and moderators.
                </Typography>
                <Box>
                    {gameData.owners?.map((owner) => (
                        <Box display="flex" alignItems="center" key={owner.id}>
                            <Typography variant="body1">
                                {owner.username}
                            </Typography>
                            {gameData.owners?.length &&
                                gameData.owners.length > 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={async () => {
                                            const res = await fetch(
                                                `/api/games/${slug}/owners`,
                                                {
                                                    method: 'DELETE',
                                                    headers: {
                                                        'Content-Type':
                                                            'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        user: owner.id,
                                                    }),
                                                },
                                            );
                                            if (!res.ok) {
                                                const error = await res.text();
                                                alertError(
                                                    `Unable to remove owner - ${error}`,
                                                );
                                                return;
                                            }
                                            updateData();
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                )}
                        </Box>
                    ))}
                </Box>
                <Button
                    onClick={() => setSearchOpenOwner(true)}
                    startIcon={<AddIcon />}
                >
                    Add new owner
                </Button>
                <UserSearch
                    isOpen={searchOpenOwner}
                    close={() => setSearchOpenOwner(false)}
                    submit={async (selectedUsers) => {
                        const res = await fetch(`/api/games/${slug}/owners`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ users: selectedUsers }),
                        });
                        if (!res.ok) {
                            const error = await res.text();
                            alertError(`Unable to add new owners - ${error}`);
                            return;
                        }
                        updateData();
                    }}
                    listPath={`/api/games/${slug}/eligibleMods`}
                />
            </Box>
            <Box>
                <Typography variant="h5">Moderators</Typography>
                <Typography variant="caption" pb={3}>
                    Moderators have the power to modify goal lists and create
                    game modes and variants, as well as modify some game
                    settings.
                </Typography>
                <div>
                    {gameData.moderators?.map((mod) => (
                        <Box display="flex" alignItems="center" key={mod.id}>
                            <Typography variant="body1">
                                {mod.username}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={async () => {
                                    const res = await fetch(
                                        `/api/games/${slug}/moderators`,
                                        {
                                            method: 'DELETE',
                                            headers: {
                                                'Content-Type':
                                                    'application/json',
                                            },
                                            body: JSON.stringify({
                                                user: mod.id,
                                            }),
                                        },
                                    );
                                    if (!res.ok) {
                                        const error = await res.text();
                                        alertError(
                                            `Unable to remove moderator - ${error}`,
                                        );
                                        return;
                                    }
                                    updateData();
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                </div>
                <Button
                    onClick={() => setSearchOpenMod(true)}
                    startIcon={<AddIcon />}
                >
                    Add new moderator
                </Button>
                <UserSearch
                    isOpen={searchOpenMod}
                    close={() => setSearchOpenMod(false)}
                    submit={async (selectedUsers) => {
                        const res = await fetch(
                            `/api/games/${slug}/moderators`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ users: selectedUsers }),
                            },
                        );
                        if (!res.ok) {
                            const error = await res.text();
                            alertError(
                                `Unable to add new moderators - ${error}`,
                            );
                            return;
                        }
                        updateData();
                    }}
                    listPath={`/api/games/${slug}/eligibleMods`}
                />
            </Box>
        </Box>
    );
}
