import { useApi } from '@/lib/Hooks';
import { Goal } from '@/types/Goal';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { alertError } from '../../../lib/Utils';
import GoalEditor from './GoalEditor';
import GoalUpload from './GoalUpload';

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

enum SortOptions {
    DEFAULT,
    NAME,
    DIFFICULTY,
}

const sortOptions = [
    { label: 'Default', value: SortOptions.DEFAULT },
    { label: 'Name', value: SortOptions.NAME },
    { label: 'Difficulty', value: SortOptions.DIFFICULTY },
];

interface GoalManagementParams {
    slug: string;
    canModerate?: boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function GoalManagement({
    slug,
    canModerate,
}: GoalManagementParams) {
    const {
        data: goals,
        isLoading: goalsLoading,
        mutate: mutateGoals,
    } = useApi<Goal[]>(`/api/games/${slug}/goals`);

    const [selectedGoal, setSelectedGoal] = useState<Goal>();
    const [newGoal, setNewGoal] = useState(false);

    const [catList, setCatList] = useState<string[]>([]);

    const [sort, setSort] = useState<SortOptions | null>(null);
    const [shownCats, setShownCats] = useState<string[]>([]);
    const [reverse, setReverse] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const cats: string[] = [];
        goals?.forEach((goal) => {
            if (goal.categories) {
                cats.push(
                    ...goal.categories.filter((cat) => !cats.includes(cat)),
                );
            }
        });
        cats.sort();
        setCatList(cats);
    }, [goals]);

    const deleteGoal = useCallback(
        async (id: string) => {
            const res = await fetch(`/api/goals/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                const error = await res.text();
                alertError(`Failed to delete goal - ${error}`);
                return;
            }
            mutateGoals();
        },
        [mutateGoals],
    );

    const [goalUploadOpen, setGoalUploadOpen] = useState(false);

    if (!goals || goalsLoading) {
        return null;
    }

    const shownGoals = goals
        .filter((goal) => {
            let shown = true;
            if (shownCats.length > 0) {
                shown = shownCats.some((cat) => goal.categories?.includes(cat));
            }
            if (!shown) {
                return false;
            }
            if (search && search.length > 0) {
                shown =
                    goal.goal.toLowerCase().includes(search.toLowerCase()) ||
                    goal.description
                        ?.toLowerCase()
                        .includes(search.toLowerCase());
            }
            return shown;
        })
        .sort((a, b) => {
            switch (sort) {
                case SortOptions.DEFAULT:
                    return 1;
                case SortOptions.NAME:
                    return a.goal.localeCompare(b.goal);
                case SortOptions.DIFFICULTY:
                    return (a.difficulty ?? 26) - (b.difficulty ?? 26);
                default:
                    return 1;
            }
        });
    if (reverse) {
        shownGoals.reverse();
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                rowGap: 3,
                maxWidth: '100%',
            }}
            className="flex h-full grow flex-col gap-y-3"
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
                <Button
                    sx={{
                        position: 'absolute',
                        right: 0,
                    }}
                    onClick={() => {
                        setGoalUploadOpen(true);
                    }}
                    startIcon={<UploadIcon />}
                >
                    Upload Goals
                </Button>
            </Box>
            <Box>
                <Box sx={{ display: 'flex', columnGap: 4, width: '100%' }}>
                    <Box width="33%" className="w-1/3">
                        <Autocomplete
                            multiple
                            id="filter-categories"
                            options={catList}
                            onChange={(_, newValue) => {
                                setShownCats(newValue);
                            }}
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => {
                                return (
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                );
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Categories" />
                            )}
                            fullWidth
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '33%',
                            alignItems: 'center',
                            columnGap: 1,
                        }}
                        className="flex w-1/3 items-center gap-x-1"
                    >
                        <FormControl fullWidth>
                            <InputLabel id="filter-sort-by-label">
                                Sort by
                            </InputLabel>
                            <Select
                                id="filter-sort-by"
                                labelId="filter-sort-by-label"
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value as SortOptions);
                                }}
                                label="Sort by"
                            >
                                {sortOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title="Toggle sort direction">
                            <IconButton
                                onClick={() => setReverse((curr) => !curr)}
                            >
                                {reverse ? <ArrowUpward /> : <ArrowDownward />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <TextField
                        type="text"
                        label="Search"
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ width: '33%' }}
                    />
                </Box>
                <div className="pt-2">
                    {goals.length} total goals, {shownGoals.length} shown
                </div>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexGrow: 1,
                    columnGap: 5,
                }}
                className="flex w-full grow gap-x-5"
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                        maxWidth: '33%',
                    }}
                >
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
                                            className="cursor-pointer rounded-md px-2 py-2 hover:bg-gray-400 hover:bg-opacity-60"
                                            onClick={() => setNewGoal(true)}
                                            alignItems="flex-start"
                                        >
                                            <ListItemIcon>
                                                <AddIcon />
                                            </ListItemIcon>
                                            <ListItemText>
                                                New Goal
                                            </ListItemText>
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
                                    <ListItemText>{goal.goal}</ListItemText>
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
                </Box>
                <Box
                    sx={{ flexGrow: 1, maxWidth: '67%' }}
                    className="grow text-center"
                >
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
    );
}
