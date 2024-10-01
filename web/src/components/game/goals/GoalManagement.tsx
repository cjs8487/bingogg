import Settings from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import {
    Box,
    Button,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Switch,
    Typography,
    DialogActions,
    TextField
} from '@mui/material';
import { useRef, useState } from 'react';
import { useGoalManagerContext } from '../../../context/GoalManagerContext';
import Dialog, { DialogRef } from '../../Dialog';
import SnackbarNotifier, { SnackbarRef } from '../../SnackbarNotifier';
import GoalEditor from './GoalEditor';
import GoalUpload from './GoalUpload';
import Search from './Search';
import GoalList from './GoalList';
import axios from 'axios';

export default function GoalManagement() {
    const {
        slug,
        canModerate,
        selectedGoal,
        goals,
        shownGoals,
        catList,
        settings,
        mutateGoals,
        setSettings,
        newGoal,
        setNewGoal,
    } = useGoalManagerContext();
    const { showDetails } = settings;

    const [goalUploadOpen, setGoalUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false); // State to manage loading during deletion
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const settingsDialogRef = useRef<DialogRef>(null); // Settings dialog
    const deleteDialogRef = useRef<DialogRef>(null); // Delete confirmation dialog
    const snackbarRef = useRef<SnackbarRef>(null); // Snackbar notifier

    // Function to handle deleting all goals
    const deleteAllGoals = async () => {
        if (deleteConfirmationText !== "DELETE") {
            snackbarRef.current?.notify("You must write 'DELETE' to confirm.");
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`/api/goals/game/${slug}/delete-all`);
            snackbarRef.current?.notify('All goals deleted successfully');
            mutateGoals(); // Optionally refresh the goal list if needed
        } catch (error) {
            console.error('Error deleting all goals:', error);
            snackbarRef.current?.notify('Failed to delete all goals');
        } finally {
            setLoading(false);
            deleteDialogRef.current?.close(); // Close the dialog after the operation
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    rowGap: 3,
                    maxWidth: '100%',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h5" align="center">
                        Goal Management
                    </Typography>
                    <Box sx={{ position: 'absolute', right: 0 }}>
                        <Button
                            onClick={() => {
                                setGoalUploadOpen(true);
                            }}
                            startIcon={<UploadIcon />}
                        >
                            Upload Goals
                        </Button>
                        <IconButton onClick={() => settingsDialogRef.current?.open()}>
                            <Settings />
                        </IconButton>
                    </Box>
                </Box>
                <Box>
                    <Box sx={{ display: 'flex', columnGap: 4, width: '100%' }}>
                        <Search />
                    </Box>
                    <Typography>
                        {goals.length} total goals, {shownGoals.length} shown
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                        columnGap: 5,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexGrow: 1,
                            maxWidth: '33%',
                        }}
                    >
                        <GoalList />
                    </Box>
                    <Box sx={{ flexGrow: 1, maxWidth: '67%' }}>
                        {!newGoal && selectedGoal && (
                            <GoalEditor
                                slug={slug}
                                goal={selectedGoal}
                                mutateGoals={mutateGoals}
                                categories={catList}
                                canModerate={canModerate}
                            />
                        )}
                        {newGoal && (
                            <GoalEditor
                                slug={slug}
                                goal={{ id: '', goal: '', description: '' }}
                                isNew
                                cancelNew={() => setNewGoal(false)}
                                mutateGoals={mutateGoals}
                                categories={catList}
                                canModerate={canModerate}
                            />
                        )}
                    </Box>
                    <GoalUpload
                        isOpen={goalUploadOpen}
                        close={() => {
                            setGoalUploadOpen(false);
                        }}
                        slug={slug}
                    />
                </Box>
                {canModerate && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', mt: 3 }}>
                        <Button
                            onClick={() => deleteDialogRef.current?.open()} // Opens delete confirmation dialog
                            disabled={loading}
                            color="error"
                            variant="contained"
                            sx={{ maxWidth: '200px' }}
                        >
                            {loading ? 'Deleting...' : 'Delete All Goals'}
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Settings Dialog */}
            <Dialog ref={settingsDialogRef}>
                <DialogTitle>Goal Manager Settings</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Switch
                                defaultChecked
                                value={showDetails}
                                onChange={(event) =>
                                    setSettings({
                                        ...settings,
                                        showDetails: event.target.checked,
                                    })
                                }
                            />
                        }
                        label="Display additional information in goal list"
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog ref={deleteDialogRef}>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => deleteDialogRef.current?.close()} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={deleteAllGoals}
                        color="error"
                        disabled={deleteConfirmationText !== "DELETE" || loading}
                    >
                        {loading ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Notifier */}
            <SnackbarNotifier ref={snackbarRef} />
        </>
    );
}
