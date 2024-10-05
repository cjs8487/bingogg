import Settings from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useRef, useState, ReactNode } from 'react';
import { useGoalManagerContext } from '../../../context/GoalManagerContext';
import Dialog, { DialogRef } from '../../Dialog';
import GoalEditor from './GoalEditor';
import GoalUpload from './GoalUpload';
import Search from './Search';
import GoalList from './GoalList';
import { SettingsDialogContent } from '@/components/input/SettingsDialogContent';
import { DeleteConfirmationDialogContent } from '@/components/input/DeleteConfirmationDialogContent';
import { notifyMessage } from '@/lib/Utils';

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

    const [goalUploadOpen, setGoalUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dialogContent, setDialogContent] = useState<ReactNode>(null);
    const dialogRef = useRef<DialogRef>(null);

    const openSettingsDialog = () => {
        setDialogContent(
            <SettingsDialogContent
                showDetails={settings.showDetails}
                setShowDetails={(value) =>
                    setSettings({ ...settings, showDetails: value })
                }
            />,
        );
        dialogRef.current?.open();
    };

    const openDeleteConfirmationDialog = () => {
        setDialogContent(
            <DeleteConfirmationDialogContent
                onConfirm={deleteAllGoals}
                onCancel={() => dialogRef.current?.close()}
                loading={loading}
            />,
        );
        dialogRef.current?.open();
    };

    const deleteAllGoals = async () => {
        if (!dialogRef.current) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/games/${slug}/deleteAllGoals`, {
                method: 'DELETE',
            });
            if (response.ok) notifyMessage('All goals deleted successfully');
            else notifyMessage('Failed to delete all goals');
        } catch (error) {
            // TODO: error handler
        } finally {
            mutateGoals();
            setLoading(false);
            dialogRef.current?.close();
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
                            onClick={() => setGoalUploadOpen(true)}
                            startIcon={<UploadIcon />}
                        >
                            Upload Goals
                        </Button>
                        {canModerate && (
                            <Button
                                onClick={openDeleteConfirmationDialog}
                                color="error"
                                sx={{ maxWidth: '200px' }}
                            >
                                Delete All Goals
                            </Button>
                        )}
                        <IconButton onClick={openSettingsDialog}>
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
                <Box sx={{ display: 'flex', flexGrow: 1, columnGap: 5 }}>
                    <Box sx={{ display: 'flex', flexGrow: 1, maxWidth: '33%' }}>
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
                        close={() => setGoalUploadOpen(false)}
                        slug={slug}
                    />
                </Box>
            </Box>

            {/* Unified Dialog */}
            <Dialog ref={dialogRef}>{dialogContent}</Dialog>
        </>
    );
}
