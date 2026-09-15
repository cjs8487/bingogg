import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
    Box,
    Button,
    Portal,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useRoomContext } from '../../context/RoomContext';
import ConnectionState from './ConnectionState';
import Timer from './timer/Timer';

export default function RoomHeader() {
    const { roomData } = useRoomContext();

    const theme = useTheme();

    const [collapsed, setCollapsed] = useState(false);
    const canCollapse = useMediaQuery(theme.breakpoints.up('lg'));
    const isXSmall = useMediaQuery(theme.breakpoints.only('xs'));

    if (!roomData) {
        return null;
    }

    let portalContent;
    if (isXSmall) {
        portalContent = (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    columnGap: 1,
                    px: 2,
                }}
            >
                <Timer />
            </Box>
        );
    } else if (canCollapse && collapsed) {
        portalContent = (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: 1,
                }}
            >
                <ConnectionState collapsed />
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        textAlign: 'center',
                        width: '100%',
                        zIndex: -1,
                    }}
                >
                    <Timer />
                </Box>
                {canCollapse && (
                    <Button
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%) translateY(-50%)',
                        }}
                        variant="contained"
                        color="accent"
                        size="small"
                        onClick={() => setCollapsed(false)}
                    >
                        <ExpandMore fontSize="small" />
                    </Button>
                )}
            </Box>
        );
    } else {
        portalContent = (
            <Box
                sx={{
                    position: 'relative',
                    gridColumn: '1 / -1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 3,
                    py: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ flexGrow: 1 }} className="grow">
                    <Typography variant="h5" className="mb-0.5 text-lg">
                        {roomData.name}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        className="mb-1.5 flex text-xs"
                    >
                        <div>
                            {roomData.game} ({roomData.variant})
                        </div>
                    </Typography>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center' }}
                        className="flex text-xs"
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                borderRight: 1,
                                borderColor: 'divider',
                                pr: 1,
                                mr: 1,
                            }}
                        >
                            {roomData.slug}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                borderRight: 1,
                                borderColor: 'divider',
                                pr: 1,
                                mr: 1,
                            }}
                        >
                            {roomData.mode}
                        </Typography>
                        <Typography variant="body2">{roomData.seed}</Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        position: 'absolute',
                        textAlign: 'center',
                    }}
                >
                    <Timer />
                </Box>
                <ConnectionState />
                {canCollapse && (
                    <Button
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%) translateY(-50%)',
                        }}
                        variant="contained"
                        color="accent"
                        size="small"
                        onClick={() => setCollapsed(true)}
                    >
                        <ExpandLess fontSize="small" />
                    </Button>
                )}
            </Box>
        );
    }

    return (
        <Portal
            container={() =>
                document.getElementById(
                    collapsed ? 'collapsed-header-slot' : 'global-header',
                )
            }
        >
            {portalContent}
        </Portal>
    );
}
