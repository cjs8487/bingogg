import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    IconButton,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { mutate } from 'swr';
import CardHiddenActions from '../../../components/CardHiddenActions';
import { Game } from '../../../types/Game';
import { useTimeout, useTimeoutFn } from 'react-use';

interface IGameCardProps {
    game: Game;
    index: number;
}
export default function GameCard({
    game: { slug, favorited, coverImage, name },
    index,
}: IGameCardProps) {
    const [hasRendered, setHasRendered] = useState(false);

    const toggleFavorite = useCallback(async () => {
        await fetch(`/api/games/${slug}/favorite`, {
            method: favorited ? 'DELETE' : 'POST',
        });
        mutate('/api/games');
    }, [slug, favorited]);

    useTimeoutFn(
        () => {
            setHasRendered(true);
        },
        1500 + 1000 + 100 * index,
    );

    return (
        <Card
            key={slug}
            sx={
                hasRendered
                    ? {}
                    : {
                          animation: '1.5s 1 slidein',
                          animationDelay: `${1 + index * 0.1}s`,
                          animationFillMode: 'backwards',
                      }
            }
        >
            <CardHiddenActions align="right">
                <IconButton onClick={toggleFavorite}>
                    {favorited ? <Star /> : <StarBorder />}
                </IconButton>
            </CardHiddenActions>
            <CardActionArea href={`/games/${slug}`} LinkComponent={Link}>
                {coverImage && <CardMedia component="img" image={coverImage} />}
                {!coverImage && (
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
                            {slug}
                        </Typography>
                    </Box>
                )}
                <CardContent>
                    <Typography variant="h6" textAlign="center">
                        {name}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
