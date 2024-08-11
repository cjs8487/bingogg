'use client';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import IconLogout from '@mui/icons-material/Logout';
import { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import LinkButton from '../LinkButton';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import Person from '@mui/icons-material/Person';
import NextLink from 'next/link';

export const pages = [
    { name: 'Games', path: '/games' },
    { name: 'Play', path: '/rooms' },
];

export default function Header() {
    const { user, loggedIn, logout } = useContext(UserContext);

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        logout();
        handleCloseUserMenu();
    };

    return (
        <AppBar position="sticky">
            <Toolbar>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
                    <DesktopMenu />
                </Box>
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
                    <MobileMenu />
                </Box>

                {user ? (
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open user menu">
                            <Button
                                style={{ color: 'white' }}
                                onClick={handleOpenUserMenu}
                                sx={{
                                    display: 'flex',
                                    columnGap: 1,
                                }}
                            >
                                {user.username}
                                <Avatar alt={user.username} />
                            </Button>
                        </Tooltip>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem component={NextLink} href="/profile">
                                <ListItemIcon>
                                    <Person />
                                </ListItemIcon>
                                <ListItemText>Profile</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <IconLogout fontSize="small" />
                                </ListItemIcon>
                                <Typography textAlign="center">
                                    Logout
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <LinkButton href="/login">Login</LinkButton>
                )}
            </Toolbar>
        </AppBar>
    );
}
