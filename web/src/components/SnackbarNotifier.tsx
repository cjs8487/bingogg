import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface SnackbarNotifierProps {
    severity?: 'success' | 'error' | 'warning' | 'info';
}

export interface SnackbarRef {
    notify: (message: string) => void;
}

const SnackbarNotifier = forwardRef<SnackbarRef, SnackbarNotifierProps>(
    ({ severity = 'info' }, ref) => {
        const [open, setOpen] = useState(false);
        const [message, setMessage] = useState('');

        const notify = useCallback((message: string) => {
            setMessage(message);
            setOpen(true);
        }, []);

        const handleClose = useCallback(() => {
            setOpen(false);
        }, []);

        useImperativeHandle(ref, () => ({
            notify,
        }));

        return (
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        );
    }
);

export default SnackbarNotifier;
