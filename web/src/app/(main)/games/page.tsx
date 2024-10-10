'use client';
import { Game } from '@/types/Game';
import Masonry from '@mui/lab/Masonry';
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../../../context/UserContext';
import { useApi } from '../../../lib/Hooks';
import GameCard from '../rooms/GameCard';
import { useLocalStorage } from 'react-use';

export default function Games() {
    const { loggedIn } = useContext(UserContext);

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

    const games = gameList
        .map((game) => {
            return {
                ...game,
                favorited:
                    game.favorited || localFavorites?.includes(game.slug),
            };
        })
        .sort((a, b) => {
            if (a.favorited === b.favorited) {
                return a.name.localeCompare(b.name);
            }
            return a.favorited ? -1 : 1;
        });

    return (
        <Box flexGrow={1}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 4,
                    py: 1,
                    px: 2,
                    borderBottom: 2,
                    borderColor: 'divider',
                }}
            >
                <Typography>{games.length} games loaded</Typography>
                <Box flexGrow={1} />
                {loggedIn && (
                    <div>
                        <Button href="/games/new" LinkComponent={Link}>
                            Create a new game
                        </Button>
                    </div>
                )}
            </Box>
            <Masonry
                columns={{ xs: 1, sm: 2, md: 4, lg: 5, xl: 6 }}
                spacing={2}
                sx={{ px: 2 }}
            >
                {games.map((game, index) => (
                    <GameCard
                        key={game.slug}
                        game={game}
                        index={index}
                        localFavorites={localFavorites}
                        setLocalFavorites={setLocalFavorites}
                    />
                ))}
            </Masonry>
        </Box>
    );
}
