// DeleteConfirmationDialogContent.tsx
import { DialogContent, DialogTitle, DialogActions, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';

interface DeleteConfirmationDialogContentProps {
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

export const DeleteConfirmationDialogContent: React.FC<DeleteConfirmationDialogContentProps> = ({ onConfirm, onCancel, loading }) => {
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

    return (
        <>
            <DialogTitle>Confirm Delete All Goals</DialogTitle>
            <DialogContent>
                <Typography>
                    To confirm deletion of all goals, type <strong>DELETE</strong> below:
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Type DELETE to confirm"
                    fullWidth
                    variant="outlined"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    disabled={loading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    disabled={deleteConfirmationText !== "DELETE" || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                </Button>
            </DialogActions>
        </>
    );
};
