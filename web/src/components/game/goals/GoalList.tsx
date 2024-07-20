import AddIcon from '@mui/icons-material/Add';
import {
    Box,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
    styled,
} from '@mui/material';
import { forwardRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Goal } from '../../../types/Goal';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGoalManagerContext } from '../../../context/GoalManagerContext';

const ListItemHiddenSecondary = styled(ListItem)(() => ({
    '.MuiListItemSecondaryAction-root': {
        visibility: 'hidden',
    },
    '&.MuiListItem-root': {
        '&:hover .MuiListItemSecondaryAction-root': {
            visibility: 'inherit',
        },
    },
}));

function GoalListItemSecondary({ goal }: { goal: Goal }) {
    return (
        <>
            {goal.difficulty && (
                <>
                    <Typography variant="body2" component="span">
                        Difficulty:{' '}
                    </Typography>
                    {goal.difficulty}
                </>
            )}
            <Box pt={0.5}>
                {goal.categories?.map((cat) => (
                    <Chip key={cat} label={cat} size="small" sx={{ mr: 0.5 }} />
                ))}
            </Box>
        </>
    );
}

export default function GoalList() {
    const {
        shownGoals,
        selectedGoal,
        setSelectedGoal,
        deleteGoal,
        settings: { showDetails },
        canModerate,
        setNewGoal,
    } = useGoalManagerContext();

    return (
        <Virtuoso<Goal>
            components={{
                // eslint-disable-next-line react/display-name
                List: forwardRef(({ style, children }, listRef) => {
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
                }),
                Item: ({ children, ...props }) => {
                    return (
                        <ListItemHiddenSecondary
                            components={{ Root: 'div' }}
                            disableGutters
                            disablePadding
                            {...props}
                            style={{
                                margin: 0,
                                position: 'relative',
                            }}
                        >
                            {children}
                        </ListItemHiddenSecondary>
                    );
                },
                Footer: () =>
                    canModerate && (
                        <ListItem disableGutters disablePadding>
                            <ListItemButton
                                onClick={() => setNewGoal(true)}
                                alignItems="flex-start"
                            >
                                <ListItemIcon>
                                    <AddIcon color="success" />
                                </ListItemIcon>
                                <ListItemText>New Goal</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    ),
            }}
            data={shownGoals}
            style={{ flexGrow: 1 }}
            itemContent={(index, goal) => (
                <>
                    <ListItemButton
                        onClick={() => setSelectedGoal(goal)}
                        selected={selectedGoal === goal}
                        divider
                    >
                        <ListItemText
                            primary={goal.goal}
                            secondary={
                                showDetails && (
                                    <GoalListItemSecondary goal={goal} />
                                )
                            }
                        />
                    </ListItemButton>
                    {canModerate && (
                        <ListItemSecondaryAction>
                            <IconButton
                                aria-label="delete"
                                onClick={(e) => {
                                    deleteGoal(goal.id);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    )}
                </>
            )}
        />
    );
}
