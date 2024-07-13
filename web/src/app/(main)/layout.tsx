'use client';
import {
    faDiscord,
    faGithub,
    faPatreon,
    faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import CookieConsent from 'react-cookie-consent';
import { ToastContainer } from 'react-toastify';
import Header from '../../components/header/Header';
import 'react-toastify/dist/ReactToastify.css';
import {
    Box,
    Container,
    IconButton,
    Link,
    Paper,
    Typography,
} from '@mui/material';

const icons: { icon: IconDefinition; url: string }[] = [
    { icon: faGithub, url: 'https://github.com/cjs8487/bingogg' },
    { icon: faPatreon, url: 'https://www.patreon.com/Bingothon' },
    { icon: faTwitter, url: 'https://twitter.com/bingothon' },
    { icon: faDiscord, url: 'https://discord.bingothon.com' },
];

export default function CoreLayout({ children }: { children: ReactNode }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <Header />
            <CookieConsent
                location="bottom"
                buttonText="I understand"
                buttonStyle={{
                    background: '#8c091b',
                    color: '#fbfbfb',
                    fontSize: '13px',
                }}
            >
                This website uses cookies to provide some parts of it&#39;s
                functionality.
            </CookieConsent>
            <Box flexGrow={1} height="100%" display="flex">
                {children}
            </Box>
            <Paper component="footer">
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'end',
                        px: 2,
                        pt: 2,
                        pb: 0.5,
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
                                    <FontAwesomeIcon
                                        icon={icon}
                                        className="fa-fw aspect-square rounded-full px-1 py-1.5 hover:bg-primary-content hover:bg-opacity-40"
                                    />
                                </IconButton>
                            ))}
                        </Box>
                        <Typography variant="caption">
                            © Copyright 2024 - 2024 Bingothon | All Rights
                            Reserved |{' '}
                            <Link
                                href="/legal/privacy"
                                component={NextLink}
                                className="underline"
                            >
                                Privacy Policy
                            </Link>
                        </Typography>
                    </Box>
                    <Typography variant="caption">
                        bingo.gg v{process.env.version}
                    </Typography>
                </Box>
            </Paper>
            <ToastContainer />
        </Box>
    );
}
