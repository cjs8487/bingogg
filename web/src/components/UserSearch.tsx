'use client';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { forwardRef, useCallback, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Virtuoso } from 'react-virtuoso';
import { useApi } from '../lib/Hooks';
import { alertError } from '../lib/Utils';
import { User } from '../types/User';

interface UserSearchProps {
    isOpen: boolean;
    close: () => void;
    submit: (selectedUsers: string[]) => void;
    listPath?: string;
}

export default function UserSearch({
    isOpen,
    close,
    submit,
    listPath,
}: UserSearchProps) {
    const {
        data: users,
        isLoading,
        error,
    } = useApi<User[]>(listPath ?? '/api/users');

    const [selected, setSelected] = useState<string[]>([]);

    const cancel = useCallback(() => {
        setSelected([]);
        close();
    }, [close]);

    const onSubmit = useCallback(() => {
        submit(selected);
        setSelected([]);
        close();
    }, [submit, selected, close]);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    if (!users || isLoading) {
        return null;
    }

    if (error) {
        alertError("Couldn't load user list.");
        return null;
    }

    return (
        <Dialog
            onClose={close}
            open={isOpen}
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>User Search</DialogTitle>
            <DialogContent sx={{ minHeight: '300px' }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <Virtuoso<User>
                            height={height}
                            width={width}
                            style={{ height, width }}
                            components={{
                                // eslint-disable-next-line react/display-name
                                List: forwardRef(
                                    ({ style, children }, listRef) => {
                                        return (
                                            <List
                                                style={{
                                                    padding: 0,
                                                    ...style,
                                                    margin: 0,
                                                }}
                                                component="div"
                                                ref={listRef}
                                            >
                                                {children}
                                            </List>
                                        );
                                    },
                                ),
                                Item: ({ children, ...props }) => {
                                    return (
                                        <ListItem
                                            {...props}
                                            style={{
                                                margin: 0,
                                            }}
                                            disableGutters
                                        >
                                            {children}
                                        </ListItem>
                                    );
                                },
                            }}
                            data={users}
                            itemContent={(index, user) => (
                                <ListItemButton
                                    onClick={() => {
                                        if (selected.includes(user.id)) {
                                            setSelected(
                                                selected.filter(
                                                    (u) => u !== user.id,
                                                ),
                                            );
                                        } else {
                                            setSelected([...selected, user.id]);
                                        }
                                    }}
                                    divider
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selected.includes(user.id)}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{
                                                'aria-labelledby': `user-list-label-${index}`,
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        id={`user-list-label-${index}`}
                                    >
                                        {user.username}
                                    </ListItemText>
                                </ListItemButton>
                            )}
                        />
                    )}
                </AutoSizer>
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={cancel}>
                    Cancel
                </Button>
                <Button type="button" color="success" onClick={onSubmit}>
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}
