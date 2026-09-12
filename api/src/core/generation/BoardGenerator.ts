import { GeneratorSettings } from '@playbingo/shared';
import { Category } from '@prisma/client';
import {
    BoardLayoutGenerator,
    createLayoutGenerator,
} from './BoardLayoutGenerator';
import { GenerationFailedError } from './GenerationFailedError';
import { GeneratorGoal } from './GeneratorCore';
import prand from 'pure-rand';
import type { RandomGenerator } from 'pure-rand/types/RandomGenerator';
import { createGlobalAdjustment, GlobalAdjustment } from './GlobalAdjustments';
import { createPruner, GoalListPruner } from './GoalListPruner';
import { createTransformer, GoalListTransformer } from './GoalListTransformer';
import {
    createPlacementRestriction,
    GoalPlacementRestriction,
} from './GoalPlacementRestriction';
import { shuffle } from '../../util/Array';
import metrics from '../../metrics';

export type LayoutCell = Extract<
    GeneratorSettings['boardLayout'],
    { mode: 'custom' }
>['layout'][number][number];
/**
 *
 */
export class BoardGenerator {
    // generation strategies
    goalFilters: GoalListPruner[];
    goalTransformers: GoalListTransformer[];
    layoutGenerator: BoardLayoutGenerator;
    placementRestrictions: GoalPlacementRestriction[];
    globalAdjustments: GlobalAdjustment[];

    // core generation elements
    seed: number;
    rng: RandomGenerator;
    allGoals: GeneratorGoal[] = [];
    categories: Category[];
    goals: GeneratorGoal[] = [];
    layout: LayoutCell[][] = [];
    board: GeneratorGoal[][] = [];

    // global state
    categoryMaxes: { [k: string]: number } = {};

    customBoardLayout?: LayoutCell[][];

    difficultyDistribution?: { difficulty: number; count: number }[];

    goalsByDifficulty: { [d: number]: GeneratorGoal[] } = {};
    goalsByCategoryId: { [id: string]: GeneratorGoal[] } = {};
    goalCopies: { [k: string]: number } = {};
    categoriesById: { [id: string]: Category } = {};

    constructor(
        goals: GeneratorGoal[],
        categories: Category[],
        config: GeneratorSettings,
        seed?: number,
    ) {
        this.allGoals = goals;
        this.goals = [...this.allGoals];
        this.categories = categories;
        this.goalFilters = config.goalFilters.map((s) => createPruner(s));
        this.goalTransformers = config.goalTransformation.map((t) =>
            createTransformer(t),
        );
        this.layoutGenerator = createLayoutGenerator(config.boardLayout);
        this.placementRestrictions = config.restrictions.map((s) =>
            createPlacementRestriction(s),
        );
        this.globalAdjustments = config.adjustments.map((s) =>
            createGlobalAdjustment(s),
        );

        this.seed = seed ?? Math.ceil(999999 * Math.random());
        this.rng = prand.xoroshiro128plus(this.seed);
        categories.forEach((cat) => {
            this.categoryMaxes[cat.id] = cat.max <= 0 ? -1 : cat.max;
            this.categoriesById[cat.id] = cat;
        });

        this.goals.forEach((goal) => {
            if (goal.difficulty) {
                const prev = this.goalsByDifficulty[goal.difficulty] ?? [];
                this.goalsByDifficulty[goal.difficulty] = [...prev, goal];
            }
            goal.categories.forEach((cat) => {
                const prev = this.goalsByCategoryId[cat.id] ?? [];
                this.goalsByCategoryId[cat.id] = [...prev, goal];
            });
            this.goalCopies[goal.id] = 1;
        });

        this.customBoardLayout =
            config.boardLayout.mode === 'custom'
                ? config.boardLayout.layout
                : undefined;

        this.difficultyDistribution =
            config.boardLayout.mode === 'difficulty-distribution'
                ? config.boardLayout.distribution
                : undefined;
    }

    async reset(seed?: number) {
        this.seed = seed ?? Math.ceil(999999 * Math.random());
        this.rng = prand.xoroshiro128plus(this.seed);
        this.goals = [...this.allGoals];
        this.layout = [];
        this.board = [];
        this.categoryMaxes = {};
        this.goalsByDifficulty = {};
        this.goalsByCategoryId = {};
        this.goalCopies = {};

        this.categories.forEach((cat) => {
            this.categoryMaxes[cat.id] = cat.max <= 0 ? -1 : cat.max;
        });

        this.goals.forEach((goal) => {
            if (goal.difficulty) {
                const prev = this.goalsByDifficulty[goal.difficulty] ?? [];
                this.goalsByDifficulty[goal.difficulty] = [...prev, goal];
            }
            goal.categories.forEach((cat) => {
                const prev = this.goalsByCategoryId[cat.id] ?? [];
                this.goalsByCategoryId[cat.id] = [...prev, goal];
            });
            this.goalCopies[goal.id] = 1;
        });
    }

    generateBoard() {
        const finishGeneration = metrics.generation.cardGenerationStarted();
        let successful = false;
        try {
            this.generateBoardInternal();
            successful = true;
        } finally {
            finishGeneration(successful);
        }
    }

    private generateBoardInternal() {
        // get the goal list to be used in generation
        this.pruneGoalList();
        this.transformGoals();

        // board generation
        this.generateBoardLayout();
        if (this.goals.length < this.layout.length * this.layout[0].length) {
            throw new GenerationFailedError(
                'Not enough goals to generate. Are too many goals filtered?',
                this,
            );
        }

        // preprocessing
        this.preprocessFixedGoals();

        // goal placement
        this.layout.forEach((row, rowIndex) => {
            this.board[rowIndex] = [];
            row.forEach((_, colIndex) => {
                const goals = this.validGoalsForCell(rowIndex, colIndex);
                const goal = goals.pop();
                if (!goal) {
                    throw new GenerationFailedError(
                        `No valid goals found to place in cell`,
                        this,
                        rowIndex,
                        colIndex,
                        this.layout[rowIndex][colIndex],
                    );
                }
                this.board[rowIndex][colIndex] = goal;
                this.adjustGoalList(goal);
            });
        });
    }

    pruneGoalList() {
        this.goalFilters.forEach((f) => f(this));

        this.goalsByDifficulty = {};
        this.goalsByCategoryId = {};
        this.goalCopies = {};
        this.goals.forEach((goal) => {
            if (goal.difficulty) {
                const prev = this.goalsByDifficulty[goal.difficulty] ?? [];
                this.goalsByDifficulty[goal.difficulty] = [...prev, goal];
            }
            goal.categories.forEach((cat) => {
                const prev = this.goalsByCategoryId[cat.id] ?? [];
                this.goalsByCategoryId[cat.id] = [...prev, goal];
            });
            this.goalCopies[goal.id] = 1;
        });
    }

    transformGoals() {
        this.goalTransformers.forEach((t) => t(this));
    }

    generateBoardLayout() {
        this.layoutGenerator(this);
    }

    validGoalsForCell(row: number, col: number) {
        let goals: GeneratorGoal[] = [];
        switch (this.layout[row][col].selectionCriteria) {
            case 'difficulty':
                goals =
                    this.goalsByDifficulty[this.layout[row][col].difficulty];
                break;
            case 'category':
                goals = this.goalsByCategoryId[this.layout[row][col].category];
                break;
            case 'random':
                goals = this.goals;
                break;
            case 'fixed':
                goals = [this.getGoal(this.layout[row][col].goal)];
                this.goalCopies[goals[0].id] = 1; // ensure fixed goals are always available
                break;
        }
        if (!goals || !goals.length) {
            goals = [];
        }
        let finalList: GeneratorGoal[] = [];
        goals.forEach((goal) => {
            finalList.push(...Array(this.goalCopies[goal.id]).fill(goal));
        });
        this.placementRestrictions.forEach(
            (f) => (finalList = f(this, row, col, finalList)),
        );
        // Keep one seeded random stream for the whole board. Recreating the
        // PRNG from the board seed for every cell correlates the choices as
        // the candidate list shrinks, which biases particular board cells.
        shuffle(finalList, undefined, this.rng);
        return finalList;
    }

    adjustGoalList(lastPlaced: GeneratorGoal) {
        this.goalCopies[lastPlaced.id] = 0;
        this.globalAdjustments.forEach((f) => f(this, lastPlaced));
    }

    /**
     * Processes fixed goals in the layout to ensure they aren't consumed while
     * generating a different cell in the board. Sets their available copies to
     * 0 so that they remain in the goal list, but don't get returned as a valid
     * goal for any cell besides their fixed location.
     */
    preprocessFixedGoals() {
        this.layout.forEach((row) => {
            row.forEach((cell) => {
                if (cell.selectionCriteria === 'fixed') {
                    const goal = this.getGoal(cell.goal);
                    this.goalCopies[goal.id] = this.goalCopies[goal.id] = 0;
                }
            });
        });
    }

    private getGoal(id: string) {
        const goal = this.goals.find((g) => g.id === id);
        if (!goal) {
            throw new GenerationFailedError(
                `Unable to find goal with id ${id}`,
                this,
            );
        }
        return goal;
    }
}
