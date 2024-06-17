import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { pages } from './Header';
import Link from 'next/link';

export default function MobileMenu() {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    return (
        <>
            <Box display="flex" justifyItems="center" mr={1}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                >
                    <MenuIcon />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorElNav}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    open={Boolean(anchorElNav)}
                    onClose={handleCloseNavMenu}
                >
                    {pages.map((page) => (
                        <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                            <Link href={page.path}>
                                <Typography textAlign="center">
                                    {page.name}
                                </Typography>
                            </Link>
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
            <Typography
                variant="h5"
                noWrap
                component={Link}
                href="/"
                sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.1rem',
                    color: 'inherit',
                    textDecoration: 'none',
                }}
            >
                bingo.gg
            </Typography>
            <Box flexGrow={1} />
        </>
    );
}
