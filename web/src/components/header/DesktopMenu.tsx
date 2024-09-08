import { Box, Button, Typography } from '@mui/material';
import { pages } from './Header';
import LinkButton from '../LinkButton';

export default function DesktopMenu() {
    return (
        <>
            <Typography
                variant="h6"
                noWrap
                component={LinkButton}
                href="/"
                sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.1rem',
                    color: 'inherit',
                    textDecoration: 'none',
                    textTransform: 'none',
                }}
            >
                PlayBingo
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box display="flex">
                {pages.map((page) => (
                    <LinkButton key={page.name} href={page.path}>
                        {page.name}
                    </LinkButton>
                ))}
            </Box>
        </>
    );
}
