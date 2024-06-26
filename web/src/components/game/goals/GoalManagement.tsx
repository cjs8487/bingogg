import { useApi } from '@/lib/Hooks';
import { Goal } from '@/types/Goal';
import {
    faAdd,
    faSortDown,
    faSortUp,
    faTrash,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useState } from 'react';
import GoalEditor from './GoalEditor';
import Select from 'react-select';
import GoalUpload from './GoalUpload';
import { alertError } from '../../../lib/Utils';

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

    const [catList, setCatList] = useState<{ label: string; value: string }[]>(
        [],
    );

    const [sort, setSort] = useState<{
        label: string;
        value: SortOptions;
    } | null>(null);
    const [shownCats, setShownCats] = useState<
        { label: string; value: string }[]
    >([]);
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
        setCatList(cats.map((cat) => ({ label: cat, value: cat })));
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
                shown = shownCats.some(
                    (cat) => goal.categories?.includes(cat.value),
                );
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
            switch (sort?.value) {
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
        <div className="flex h-full grow flex-col gap-y-3">
            <div className="relative flex items-center justify-center">
                <div className="text-center text-2xl">Goal Management</div>
                <button
                    className="absolute right-0 flex items-center gap-x-2 rounded-md bg-text-lighter px-2 py-1 text-black hover:bg-text-light/50"
                    onClick={() => {
                        setGoalUploadOpen(true);
                    }}
                >
                    <FontAwesomeIcon icon={faUpload} />
                    Upload Goals
                </button>
            </div>
            <div>
                <div className="flex w-full gap-x-4">
                    <div className="w-1/3">
                        <Select
                            options={catList}
                            placeholder="Filter by"
                            onChange={(options) =>
                                setShownCats(options.toSpliced(0, 0))
                            }
                            isMulti
                            classNames={{
                                control: () => 'rounded-md',
                                menuList: () => 'text-black',
                                container: () => '',
                            }}
                        />
                    </div>
                    <div className="flex w-1/3 items-center gap-x-1">
                        <Select
                            options={sortOptions}
                            placeholder="Sort by"
                            onChange={setSort}
                            className="grow"
                            classNames={{
                                control: () => 'rounded-md',
                                menuList: () => 'text-black',
                                container: () => '',
                            }}
                        />
                        <FontAwesomeIcon
                            icon={reverse ? faSortUp : faSortDown}
                            className="cursor-pointer rounded-full px-2.5 py-1.5 text-white hover:bg-gray-400"
                            onClick={() => setReverse(!reverse)}
                        />
                    </div>
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Search"
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-full w-full rounded-md text-black"
                        />
                    </div>
                </div>
                <div className="pt-2">
                    {goals.length} total goals, {shownGoals.length} shown
                </div>
            </div>
            <div className="flex w-full grow gap-x-5">
                <div className="flex w-1/3 flex-col rounded-md border-2 border-white/40 px-3">
                    <div className="h-px grow overflow-y-auto">
                        {shownGoals.map((goal) => (
                            <div key={goal.id} className="border-b py-2">
                                <div
                                    className="group/item flex cursor-pointer items-center rounded-md px-2 py-1 hover:bg-gray-400 hover:bg-opacity-60"
                                    onClick={() => setSelectedGoal(goal)}
                                >
                                    {goal.goal}
                                    <div className="grow" />
                                    {canModerate && <FontAwesomeIcon
                                        icon={faTrash}
                                        className="group/edit invisible rounded-full p-2.5 hover:bg-black group-hover/item:visible"
                                        onClick={(e) => {
                                            deleteGoal(goal.id);
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    />}
                                </div>
                            </div>
                        ))}
                        {canModerate && (
                            <div className="py-2">
                                <div
                                    className="cursor-pointer rounded-md px-2 py-2 hover:bg-gray-400 hover:bg-opacity-60"
                                    onClick={() => setNewGoal(true)}
                                >
                                    <FontAwesomeIcon
                                        icon={faAdd}
                                        className="pr-2 text-green-500"
                                    />
                                    New Goal
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="grow text-center">
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
                </div>
                <GoalUpload
                    isOpen={goalUploadOpen}
                    close={() => {
                        setGoalUploadOpen(false);
                    }}
                    slug={slug}
                />
            </div>
        </div>
    );
}
