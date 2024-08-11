import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Goal } from '../types/Goal';
import { useApi } from '../lib/Hooks';
import { alertError } from '../lib/Utils';
import { KeyedMutator } from 'swr';

export enum SortOptions {
    DEFAULT,
    NAME,
    DIFFICULTY,
}

interface SearchParams {
    sort: SortOptions | null;
    reverse: boolean;
    search: string;
    shownCats: string[];
}

interface GoalManagerSettings {
    showDetails: boolean;
}

interface GoalManagerContext {
    slug: string;
    canModerate: boolean;
    selectedGoal: Goal | undefined;
    goals: Goal[];
    shownGoals: Goal[];
    catList: string[];
    searchParams: SearchParams;
    settings: GoalManagerSettings;
    setSelectedGoal: (goal: Goal) => void;
    deleteGoal: (id: string) => void;
    setShownCats: (cats: string[]) => void;
    setSort: (sort: SortOptions) => void;
    setReverse: Dispatch<SetStateAction<boolean>>;
    setSearch: (search: string) => void;
    setSettings: (settings: GoalManagerSettings) => void;
    mutateGoals: KeyedMutator<Goal[]>;
    newGoal: boolean;
    setNewGoal: (newGoal: boolean) => void;
}

const GoalManagerContext = createContext<GoalManagerContext>({
    slug: '',
    canModerate: false,
    selectedGoal: undefined,
    goals: [],
    shownGoals: [],
    catList: [],
    searchParams: { sort: null, reverse: false, search: '', shownCats: [] },
    settings: {
        showDetails: true,
    },
    setSelectedGoal() {},
    deleteGoal() {},
    setShownCats() {},
    setSort() {},
    setReverse() {},
    setSearch() {},
    setSettings() {},
    async mutateGoals() {
        return undefined;
    },
    newGoal: false,
    setNewGoal() {},
});

interface GoalManagerContextProps {
    slug: string;
    canModerate: boolean;
    children: ReactNode;
}

export function GoalManagerContextProvider({
    slug,
    canModerate,
    children,
}: GoalManagerContextProps) {
    // API
    const {
        data: goals,
        isLoading: goalsLoading,
        mutate: mutateGoals,
    } = useApi<Goal[]>(`/api/games/${slug}/goals`);

    // state
    // core
    const [selectedGoal, setSelectedGoal] = useState<Goal>();
    const [catList, setCatList] = useState<string[]>([]);
    const [newGoal, setNewGoal] = useState(false);
    // search params
    const [sort, setSort] = useState<SortOptions | null>(null);
    const [shownCats, setShownCats] = useState<string[]>([]);
    const [reverse, setReverse] = useState(false);
    const [search, setSearch] = useState('');
    //settings
    const [settings, setSettings] = useState({ showDetails: true });

    // callbacks
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

    /// effects
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

    // base case
    if (!goals || goalsLoading) {
        return null;
    }

    // calculations
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
        <GoalManagerContext.Provider
            value={{
                slug,
                canModerate,
                selectedGoal,
                goals,
                shownGoals,
                catList,
                searchParams: { sort, search, reverse, shownCats },
                settings,
                setSelectedGoal,
                deleteGoal,
                setShownCats,
                setSort,
                setSearch,
                setReverse,
                setSettings,
                mutateGoals,
                newGoal,
                setNewGoal,
            }}
        >
            {children}
        </GoalManagerContext.Provider>
    );
}

export function useGoalManagerContext() {
    return useContext(GoalManagerContext);
}
