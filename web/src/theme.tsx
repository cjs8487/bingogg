'use client';
import { LinkProps } from '@mui/material/Link';
import { createTheme } from '@mui/material/styles';
import { Lato, Nunito } from 'next/font/google';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { forwardRef } from 'react';

declare module '@mui/material/styles' {
    interface Palette {
        accent: Palette['primary'];
    }

    interface PaletteOptions {
        accent?: PaletteOptions['primary'];
    }
}

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        borderless: true;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        accent: true;
    }
}

const lato = Lato({
    weight: '700',
    subsets: ['latin'],
    display: 'swap',
});

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

const LinkBehavior = forwardRef<HTMLAnchorElement, NextLinkProps>(
    function Link(props, ref) {
        const { href, ...other } = props;
        // Map href (Material UI) -> to (react-router)
        return <NextLink ref={ref} href={href} {...other} />;
    },
);

const baseTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#12091d',
            paper: '#211035',
        },
        primary: {
            main: '#a66cff',
        },
        secondary: {
            main: '#627fbe',
        },
        success: {
            main: '#85bb65',
        },
        text: {
            primary: '#fff9ec',
            secondary: '#ecd9ff',
        },
        contrastThreshold: 4.5,
    },
    typography: {
        fontFamily: nunito.style.fontFamily,
        h1: {
            fontFamily: lato.style.fontFamily,
            letterSpacing: '0.03em',
        },
        h2: {
            fontFamily: lato.style.fontFamily,
            letterSpacing: '0.03em',
        },
        h3: {
            fontFamily: lato.style.fontFamily,
            letterSpacing: '0.02em',
        },
        h4: {
            fontFamily: lato.style.fontFamily,
            letterSpacing: '0.02em',
        },
        h5: {
            fontFamily: lato.style.fontFamily,
        },
        h6: {
            fontFamily: lato.style.fontFamily,
        },
        button: {
            fontWeight: 800,
            letterSpacing: '0.04em',
        },
        subtitle1: {
            fontWeight: 700,
            letterSpacing: '0.03em',
        },
    },
    components: {
        MuiAppBar: {
            defaultProps: {
                enableColorOnDark: true,
            },
            styleOverrides: {
                root: {
                    background:
                        'linear-gradient(90deg, #600011 0%, rgba(44,18,75,0.95) 60%, rgba(27,17,50,0.95) 100%)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '2px solid rgba(255, 183, 3, 0.4)',
                    color: '#fff9ec',
                },
            },
        },
        MuiIcon: {
            defaultProps: {
                color: 'action',
            },
        },
        MuiDialog: {
            defaultProps: {
                transitionDuration: 500,
            },
        },
        MuiLink: {
            defaultProps: {
                component: LinkBehavior,
                color: 'secondary',
                sx: {
                    textDecoration: 'none',
                },
            } as LinkProps,
        },
        MuiButtonBase: {
            defaultProps: {
                LinkComponent: LinkBehavior,
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    backgroundColor: 'rgba(15, 7, 26, 0.7)',
                },
                notchedOutline: {
                    borderColor: 'rgba(236, 217, 255, 0.35)',
                },
            },
        },
    },
    shape: {
        borderRadius: 14,
    },
});

const theme = createTheme(baseTheme, {
    palette: {
        accent: baseTheme.palette.augmentColor({ color: { main: '#ffb703' } }),
    },
    components: {
        MuiCard: {
            styleOverrides: {
                //@ts-expect-error no-implicit-any
                root: ({ theme }) =>
                    theme.unstable_sx({
                        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35)',
                        variants: [
                            {
                                props: { variant: 'outlined' },
                                style: {
                                    // border: '2px solid rgba(255, 183, 3, 0.25)',
                                },
                            },
                            {
                                props: { variant: 'borderless' },
                                style: {
                                    border: 'none',
                                },
                            },
                        ],
                    }),
            },
            defaultProps: {
                variant: 'outlined',
            },
        },
    },
});

export default theme;
