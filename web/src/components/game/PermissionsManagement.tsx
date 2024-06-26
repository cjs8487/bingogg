import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import { Game } from '../../types/Game';
import UserSearch from '../UserSearch';
import { alertError } from '../../lib/Utils';

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
        <div>
            <div className="pb-5">
                <div className="text-xl">Owners</div>
                <div className="pb-3 text-xs">
                    Owners have full moderation powers over a game, including
                    appointing additional owners and moderators.
                </div>
                <div>
                    {gameData.owners?.map((owner) => (
                        <div key={owner.id} className="flex items-center">
                            <div>{owner.username}</div>
                            {gameData.owners?.length &&
                                gameData.owners.length > 1 && (
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="ml-1 cursor-pointer rounded-full p-2 hover:bg-gray-500 hover:bg-opacity-60"
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
                                    />
                                )}
                        </div>
                    ))}
                </div>
                <div
                    className="flex max-w-fit cursor-pointer items-center rounded-md px-2 py-1 text-sm hover:bg-gray-500 hover:bg-opacity-60"
                    onClick={() => setSearchOpenOwner(true)}
                >
                    <FontAwesomeIcon
                        icon={faAdd}
                        className="mr-2 text-green-400"
                    />
                    Add new owner
                </div>
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
            </div>
            <div>
                <div className="text-xl">Moderators</div>
                <div className="pb-3 text-xs">
                    Moderators have the power to modify goal lists and create
                    game modes and variants, as well as modify some game
                    settings.
                </div>
                <div>
                    {gameData.moderators?.map((mod) => (
                        <div key={mod.id} className="flex items-center">
                            <div>{mod.username}</div>
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="ml-1 cursor-pointer rounded-full p-2 hover:bg-gray-500 hover:bg-opacity-60"
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
                            />
                        </div>
                    ))}
                </div>
                <div
                    className="flex max-w-fit cursor-pointer items-center rounded-md px-2 py-1 text-sm hover:bg-gray-500 hover:bg-opacity-60"
                    onClick={() => setSearchOpenMod(true)}
                >
                    <FontAwesomeIcon
                        icon={faAdd}
                        className="mr-2 text-green-400"
                    />
                    Add new moderator
                </div>
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
            </div>
        </div>
    );
}
