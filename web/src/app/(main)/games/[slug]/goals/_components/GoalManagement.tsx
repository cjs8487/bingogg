'use client';
import { DeleteConfirmationDialogContent } from '@/components/input/DeleteConfirmationDialogContent';
import { SettingsDialogContent } from '@/components/input/SettingsDialogContent';
import { notifyMessage } from '@/lib/Utils';
import Settings from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import CodeIcon from '@mui/icons-material/Code';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { ReactNode, useRef, useState } from 'react';
import { useGoalManagerContext } from '../../../../../../context/GoalManagerContext';
import Dialog, { DialogRef } from '../../../../../../components/Dialog';
import GoalEditor from './GoalEditor';
import GoalList from './GoalList';
import GoalUpload from './GoalUpload';
import GoalCodeDialog from './GoalCodeDialog';
import Search from './Search';

export default function GoalManagement() {
    const {
        slug,
        canModerate,
        selectedGoal,
        goals,
        shownGoals,
        catList,
        mutateGoals,
        newGoal,
        setNewGoal,
    } = useGoalManagerContext();

    const [goalUploadOpen, setGoalUploadOpen] = useState(false);
    const [goalCodeOpen, setGoalCodeOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dialogContent, setDialogContent] = useState<ReactNode>(null);
    const dialogRef = useRef<DialogRef>(null);

    const openSettingsDialog = () => {
        setDialogContent(<SettingsDialogContent />);
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
        } catch {
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
                    display: 'grid',
                    gridTemplateRows: '80px 1fr',
                    gridTemplateColumns: '1fr 2fr',
                    rowGap: 3,
                    columnGap: 5,
                    height: '100%',
                }}
            >
                <Box sx={{ gridColumn: '1 / -1' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            columnGap: 4,
                            width: '100%',
                            alignItems: 'center',
                        }}
                    >
                        <Search />
                        <Box>
                            {canModerate && (
                                <>
                                    <Button
                                        onClick={() => setGoalUploadOpen(true)}
                                        startIcon={<UploadIcon />}
                                    >
                                        Upload
                                    </Button>
                                    <Button
                                        onClick={() => setGoalCodeOpen(true)}
                                        startIcon={<CodeIcon />}
                                        color="secondary"
                                    >
                                        Code
                                    </Button>
                                    <Button
                                        onClick={openDeleteConfirmationDialog}
                                        color="error"
                                    >
                                        Delete All
                                    </Button>
                                </>
                            )}
                            <IconButton onClick={openSettingsDialog}>
                                <Settings />
                            </IconButton>
                        </Box>
                    </Box>
                    <Typography>
                        {goals.length} total goals, {shownGoals.length} shown
                    </Typography>
                </Box>
                <Box sx={{ height: '100%' }}>
                    <GoalList />
                </Box>
                <Box sx={{ flexGrow: 1, height: '100%', overflowY: 'auto' }}>
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
                    <GoalUpload
                        isOpen={goalUploadOpen}
                        close={() => setGoalUploadOpen(false)}
                        slug={slug}
                    />
                    <GoalCodeDialog
                        isOpen={goalCodeOpen}
                        close={() => setGoalCodeOpen(false)}
                        slug={slug}
                    />
                </Box>
            </Box>

            {/* Unified Dialog */}
            <Dialog ref={dialogRef}>{dialogContent}</Dialog>
        </>
    );
}
