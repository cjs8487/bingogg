import NumberInput from '@/components/input/NumberInput';
import { Goal } from '@/types/Goal';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    TextField,
    createFilterOptions,
} from '@mui/material';
import { Form, Formik, useField } from 'formik';
import { KeyedMutator } from 'swr';
import { alertError } from '../../../lib/Utils';
import FormikTextField from '../../input/FormikTextField';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const filter = createFilterOptions<string>();

interface CategorySelectProps {
    categories: string[];
}

function CategorySelect({ categories }: CategorySelectProps) {
    const [field, meta, helpers] = useField<string[]>('categories');
    return (
        <Autocomplete
            multiple
            id="goal-cat-select"
            options={categories}
            value={field.value}
            onChange={(_, newValue) => {
                helpers.setValue(newValue);
            }}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
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
            freeSolo
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some(
                    (option) => inputValue === option,
                );
                if (inputValue !== '' && !isExisting) {
                    filtered.push(`Add "${inputValue}"`);
                }

                return filtered;
            }}
        />
    );
}
interface GoalEditorProps {
    slug: string;
    goal: Goal;
    isNew?: boolean;
    cancelNew?: () => void;
    mutateGoals: KeyedMutator<Goal[]>;
    categories: string[];
    canModerate?: boolean;
}

export default function GoalEditor({
    slug,
    goal,
    isNew,
    cancelNew,
    mutateGoals,
    categories,
    canModerate,
}: GoalEditorProps) {
    console.log(goal);
    return (
        <Formik
            initialValues={{
                goal: goal.goal,
                description: goal.description ?? '',
                categories: goal.categories ?? [],
                difficulty: goal.difficulty ?? 0,
            }}
            onSubmit={async ({
                goal: goalText,
                description,
                categories,
                difficulty,
            }) => {
                if (isNew) {
                    const res = await fetch(`/api/games/${slug}/goals`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            goal: goalText,
                            description,
                            categories,
                            difficulty,
                        }),
                    });
                    if (!res.ok) {
                        const error = await res.text();
                        alertError(`Unable to create goal - ${error}`);
                        return;
                    }
                    mutateGoals();
                    if (cancelNew) {
                        cancelNew();
                    }
                } else {
                    const res = await fetch(`/api/goals/${goal.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            goal: goalText !== goal.goal ? goalText : undefined,
                            description:
                                description !== goal.description
                                    ? description
                                    : undefined,
                            categories:
                                categories.length !== goal.categories?.length ||
                                !categories.every(
                                    (cat) => goal.categories?.includes(cat),
                                )
                                    ? categories
                                    : undefined,
                            difficulty:
                                difficulty !== goal.difficulty
                                    ? difficulty
                                    : undefined,
                        }),
                    });
                    if (!res.ok) {
                        const error = await res.text();
                        alertError(`Unable to update goal - ${error}`);
                        return;
                    }
                    mutateGoals();
                }
            }}
            enableReinitialize
        >
            {({ isSubmitting, isValidating, resetForm }) => (
                <Form>
                    <Box
                        display="flex"
                        flexDirection="column"
                        width="100%"
                        rowGap={3}
                    >
                        <FormikTextField
                            id="goal-name"
                            name="goal"
                            label="Goal Text"
                            disabled={!canModerate}
                            fullWidth
                        />
                        <FormikTextField
                            id="goal-description"
                            name="description"
                            label="Goal Description"
                            disabled={!canModerate}
                            multiline
                            rows={6}
                            fullWidth
                        />
                        <Box display="flex" columnGap={2}>
                            <Box flexGrow={3}>
                                <CategorySelect categories={categories} />
                            </Box>
                            <Box flexGrow={1}>
                                <NumberInput
                                    id="goal-difficulty"
                                    name="difficulty"
                                    label="Difficulty"
                                    disabled={!canModerate}
                                    min={0}
                                    max={25}
                                />
                            </Box>
                        </Box>
                    </Box>
                    {canModerate && (
                        <Box display="flex" pt={1}>
                            <Button
                                type="button"
                                color="error"
                                onClick={() => {
                                    if (isNew && cancelNew) {
                                        cancelNew();
                                    }
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Box flexGrow={1} />
                            <Button
                                type="submit"
                                disabled={isSubmitting || isValidating}
                            >
                                Save
                            </Button>
                        </Box>
                    )}
                </Form>
            )}
        </Formik>
    );
}
