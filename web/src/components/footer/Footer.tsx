import {
    IconDefinition,
    faDiscord,
    faGithub,
    faPatreon,
    faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, IconButton, Link, Paper, Typography } from '@mui/material';
import NextLink from 'next/link';

const icons: { icon: IconDefinition; url: string }[] = [
    { icon: faGithub, url: 'https://github.com/cjs8487/bingogg' },
    { icon: faPatreon, url: 'https://www.patreon.com/Bingothon' },
    { icon: faTwitter, url: 'https://twitter.com/bingothon' },
    { icon: faDiscord, url: 'https://discord.bingothon.com' },
];

function LargeFooter() {
    return (
        <Box
            sx={{
                alignItems: 'end',
                px: 2,
                pt: 2,
                pb: 0.5,
                display: { xs: 'none', md: 'flex' },
            }}
        >
            <Box flexGrow={1}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 1,
                        mb: 0,
                    }}
                >
                    {icons.map(({ icon, url }) => (
                        <IconButton
                            key={icon.iconName}
                            href={url}
                            LinkComponent={NextLink}
                            size="small"
                        >
                            <FontAwesomeIcon icon={icon} />
                        </IconButton>
                    ))}
                </Box>
                <Typography variant="caption">
                    © Copyright 2024 - 2024 Bingothon | All Rights Reserved |{' '}
                    <Link href="/legal/privacy" component={NextLink}>
                        Privacy Policy
                    </Link>
                </Typography>
            </Box>
            <Typography variant="caption">
                bingo.gg v{process.env.version}
            </Typography>
        </Box>
    );
}

function SmallFooter() {
    return (
        <Box
            sx={{
                alignItems: 'end',
                px: 2,
                pt: 2,
                pb: 0.5,
                display: { md: 'none' },
            }}
        >
            <Box flexGrow={1}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 1,
                        mb: 0,
                    }}
                >
                    {icons.map(({ icon, url }) => (
                        <IconButton
                            key={icon.iconName}
                            href={url}
                            LinkComponent={NextLink}
                            size="small"
                        >
                            <FontAwesomeIcon icon={icon} size="sm" />
                        </IconButton>
                    ))}
                </Box>
                <Typography variant="caption">
                    © Copyright 2024 - 2024 Bingothon | All Rights Reserved
                </Typography>
            </Box>
            <Box display="flex">
                <Box flexGrow={1}>
                    <Link
                        href="/legal/privacy"
                        component={NextLink}
                        variant="caption"
                    >
                        Privacy Policy
                    </Link>
                </Box>
                <Typography variant="caption">
                    bingo.gg v{process.env.version}
                </Typography>
            </Box>
        </Box>
    );
}

export default function Footer() {
    return (
        <Paper component="footer">
            <SmallFooter />
            <LargeFooter />
        </Paper>
    );
}
