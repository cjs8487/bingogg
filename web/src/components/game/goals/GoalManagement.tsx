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
} from '@mui/material';
import { useRef, useState } from 'react';
import { useGoalManagerContext } from '../../../context/GoalManagerContext';
import Dialog, { DialogRef } from '../../Dialog';
import GoalEditor from './GoalEditor';
import GoalUpload from './GoalUpload';
import Search from './Search';
import GoalList from './GoalList';

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

    const dialogRef = useRef<DialogRef>(null);

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
                        <IconButton onClick={() => dialogRef.current?.open()}>
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
            </Box>
            <Dialog ref={dialogRef}>
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
        </>
    );
}
