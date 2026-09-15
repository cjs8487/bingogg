'use client';

import { Box, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import TextFit from '../components/TextFit';

const mockBoard = {
    hidden: false,
    width: 5,
    height: 5,
    board: [
        ['Oops!', 'So Lost', 'Wow', 'Much Empty', 'Try Again'],
        ['Not Found', 'Woot', 'Where?', 'Still Empty', 'Lost Again'],
        ['Nothing Here', 'Uh-Oh!', '404', 'Dead End', 'Broken Link'],
        ['Wrong Turn', 'Go Back', 'Really?', 'Click Me', 'Out of Bounds'],
        ['Misstep', 'No Bingo', 'Whoops', 'Error!', 'Return Home'],
    ].map((row, rowIndex) =>
        row.map((text, colIndex) => ({
            goal: {
                id: `${rowIndex}:${colIndex}`,
                goal: text,
                description: '',
            },
            completedPlayers: text === '404' ? ['1'] : [],
            revealed: true,
        })),
    ),
};

const titles = [
    { title: 'Bingo!', subtitle: 'You found a 404!' },
    {
        title: 'Seems like you wrong warped.',
        subtitle: "The page you're looking for isn't here.",
    },
    {
        title: "It's dangerous to go alone",
        subtitle: 'Take this bingo for the journey home.',
    },
    {
        title: 'Looks like you found a softlock.',
        subtitle: 'Reload from your last save or head back to the start.',
    },
    {
        title: '404: Missing No.',
        subtitle:
            "This page doesn't exist, but maybe you can glitch your way back home.",
    },
    {
        title: "You've fallen out of the world!",
        subtitle:
            "You're in uncharted territor now, better head back before it's too late.",
    },
    {
        title: 'Critical miss!',
        subtitle: "You may have rolled poorly, but there's always next time",
    },
    {
        title: "This isn't the final boss.",
        subtitle: "The page you're looking for is in another castle.",
    },
    { title: '404: Game Over', subtitle: 'Continue or reset?' },
    {
        title: 'This is not the fastest route.',
        subtitle:
            'Navigate back to the main route to compete for the best time.',
    },
    {
        title: "The RNG wasn't in your favor.",
        subtitle: "The poage you're looking for must be a rare drop.",
    },
    { title: 'Wrong item equipped', subtitle: 'Try using a different URL.' },
    {
        title: 'This page has despawned',
        subtitle: 'Try another route to reach your goal.',
    },
    {
        title: 'This door is locked',
        subtitle: 'Head back and try to find another way in.',
    },
    {
        title: 'This page has been loading for a long time...',
        subtitle: 'Maybe your game crashed?',
    },
];

const randomIndex = Math.floor(Math.random() * titles.length);

export default function NotFound() {
    const { title, subtitle } = titles[randomIndex];

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gridTemplateRows: 'auto 1fr auto',
                height: '100%',
                maxHeight: '100%',
                overflow: 'auto',
            }}
        >
            <Box
                sx={{
                    textAlign: 'center',
                    p: 5,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        pt: 1,
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        pb: 2,
                    }}
                >
                    {subtitle}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        pb: 2,
                    }}
                >
                    We couldn&#39;t find the page you are looking for. Take this
                    bingo with you for the journey home!
                </Typography>
                <Box
                    sx={{
                        width: '400px',
                        margin: '0 auto',
                    }}
                >
                    <Link
                        component={NextLink}
                        href="/"
                        passHref
                        underline="none"
                    >
                        <Box
                            sx={{
                                width: `400px`,
                                maxWidth: '100%',
                                height: `400px`,
                                minHeight: '400px',
                                maxHeight: '100%',
                                border: 1,
                                borderColor: 'divider',
                                display: 'grid',
                                gridTemplateRows: 'repeat(5, 1fr)',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: '#fff',
                            }}
                        >
                            {mockBoard.board.map((row) =>
                                row.map((cell) => (
                                    <Box
                                        key={cell.goal.id}
                                        sx={{
                                            position: 'relative',
                                            aspectRatio: '1 / 1',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            border: 1,
                                            borderColor: 'divider',
                                            transition: 'all',
                                            transitionDuration: 300,
                                            background: (theme) =>
                                                theme.palette.background
                                                    .default,
                                            ':hover': {
                                                zIndex: 10,
                                                scale: '110%',
                                            },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                zIndex: 10,
                                                display: 'flex',
                                                height: '100%',
                                                width: '100%',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 1,
                                            }}
                                        >
                                            <TextFit
                                                text={cell.goal.goal}
                                                sx={{
                                                    p: 1,
                                                    filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0))',
                                                }}
                                            />
                                        </Box>
                                        {cell.goal.goal === '404' && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor:
                                                        'accent.dark',
                                                }}
                                            />
                                        )}
                                    </Box>
                                )),
                            )}
                        </Box>
                    </Link>
                </Box>
                <Box
                    sx={{
                        pt: 2,
                    }}
                >
                    <Link
                        href="/"
                        component={NextLink}
                        sx={{
                            color: '#fff',
                        }}
                    >
                        ← Return Home
                    </Link>
                </Box>
            </Box>
            <Box
                sx={{
                    flexGrow: 1,
                }}
            />
        </Box>
    );
}
