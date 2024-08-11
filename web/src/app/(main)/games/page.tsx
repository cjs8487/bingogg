'use client';
import Link from 'next/link';
import { Game } from '@/types/Game';
import { useApi } from '../../../lib/Hooks';
import { useContext } from 'react';
import { UserContext } from '../../../context/UserContext';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Container,
    Typography,
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';

export default function Games() {
    const { loggedIn } = useContext(UserContext);

    const { data: games, isLoading, error } = useApi<Game[]>('/api/games');

    if (!games || isLoading) {
        return null;
    }

    if (error) {
        return 'Unable to load game list.';
    }

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
                    <Card
                        key={game.slug}
                        sx={{
                            animation: '1.5s 1 slidein',
                            animationDelay: `${1 + index * 0.1}s`,
                            animationFillMode: 'backwards',
                        }}
                    >
                        <CardActionArea
                            href={`/games/${game.slug}`}
                            LinkComponent={Link}
                        >
                            {game.coverImage && (
                                <CardMedia
                                    component="img"
                                    image={game.coverImage}
                                />
                            )}
                            {!game.coverImage && (
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        border: '1px',
                                        pt: '80%',
                                        boxShadow: 'inset 0 0 12px',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            top: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {game.slug}
                                    </Typography>
                                </Box>
                            )}
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    textAlign="center"
                                    // pt={2}
                                >
                                    {game.name}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Masonry>
        </Box>
    );
}
