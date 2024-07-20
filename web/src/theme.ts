'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#627fbe',
        },
        secondary: {
            main: '#600011',
        },
        info: {
            main: '#627fbe',
        },
        contrastThreshold: 4.5,
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
    components: {
        MuiAppBar: {
            defaultProps: {
                color: 'secondary',
                enableColorOnDark: true,
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
        MuiBadge: {
            defaultProps: {
                color: 'primary',
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
});

export default theme;
