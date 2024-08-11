import {
    ReactNode,
    forwardRef,
    useCallback,
    useImperativeHandle,
    useState,
} from 'react';
import { Dialog as MuiDialog } from '@mui/material';

interface DialogProps {
    children: ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
}

export interface DialogRef {
    open: () => void;
    close: () => void;
}

const Dialog = forwardRef<DialogRef, DialogProps>(function Dialog(
    { children, onOpen, onClose },
    ref,
) {
    const [isOpen, setOpen] = useState(false);

    const open = useCallback(() => {
        setOpen(true);
        if (onOpen) {
            onOpen();
        }
    }, [onOpen]);

    const close = useCallback(() => {
        setOpen(false);
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    useImperativeHandle(ref, () => ({
        open,
        close,
    }));

    return (
        <MuiDialog open={isOpen} onClose={close}>
            {children}
        </MuiDialog>
    );
});

export default Dialog;
