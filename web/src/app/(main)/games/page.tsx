'use client';
import { Game } from '@/types/Game';
import Masonry from '@mui/lab/Masonry';
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useContext } from 'react';
import { useLocalStorage } from 'react-use';
import { UserContext } from '../../../context/UserContext';
import { useApi } from '../../../lib/Hooks';
import { isUserModerator } from '../../../lib/Utils';
import GameCard from '../rooms/GameCard';

const modKey = 'Moderated Games';
const favoritesKey = 'Favorites';
const allKey = 'All Games';

export default function Games() {
    const { user, loggedIn } = useContext(UserContext);

    const { data: gameList, isLoading, error } = useApi<Game[]>('/api/games');

    const [localFavorites, setLocalFavorites] = useLocalStorage<string[]>(
        'playbingo-favorites',
        [],
    );

    if (!gameList || isLoading) {
        return null;
    }

    if (error) {
        return 'Unable to load game list.';
    }

    const gamesBase: { [k: string]: Game[] } = {};
    gamesBase[modKey] = [];
    gamesBase[favoritesKey] = [];
    gamesBase[allKey] = [];
    const games = gameList.reduce<{ [k: string]: Game[] }>((curr, game) => {
        if (loggedIn && user && game.isMod) {
            curr[modKey].push(game);
        }
        if (game.favorited || localFavorites?.includes(game.slug)) {
            curr[favoritesKey].push(game);
        }
        curr[allKey].push(game);

        return curr;
    }, gamesBase);
    Object.values(games).forEach((list) =>
        list.sort((a, b) => {
            if (
                (a.favorited || localFavorites?.includes(a.slug)) ===
                (b.favorited || localFavorites?.includes(b.slug))
            ) {
                return a.name.localeCompare(b.name);
            }
            return a.favorited ? -1 : 1;
        }),
    );

    return (
        <Box flexGrow={1} px={2}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 4,
                    py: 1,
                    borderBottom: 2,
                    borderColor: 'divider',
                }}
            >
                <Typography>{gameList.length} games loaded</Typography>
                <Box flexGrow={1} />
                {loggedIn && (
                    <div>
                        <Button href="/games/new" LinkComponent={Link}>
                            Create a new game
                        </Button>
                    </div>
                )}
            </Box>
            {Object.keys(games)
                .filter((k) => games[k].length > 0)
                .map((key) => (
                    <>
                        <Typography variant="h5" pb={1}>
                            {key}
                        </Typography>
                        <Masonry
                            columns={{
                                xs: 1,
                                sm: 2,
                                md: 4,
                                lg: 5,
                                xl: 6,
                            }}
                            spacing={2}
                        >
                            {games[key].map((game, index) => (
                                <GameCard
                                    key={game.slug}
                                    game={game}
                                    index={index}
                                    localFavorites={localFavorites}
                                    setLocalFavorites={setLocalFavorites}
                                />
                            ))}
                        </Masonry>
                    </>
                ))}
        </Box>
    );
}
