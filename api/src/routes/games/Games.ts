import { Router } from 'express';
import {
    addModerators,
    addOwners,
    allGames,
    createGame,
    gameForSlug,
    isModerator,
    isOwner,
    removeModerator,
    removeOwner,
    updateGameCover,
    updateGameName,
    updateRacetimeCategory,
    updateRacetimeGoal,
    updateSRLv5Enabled,
} from '../../database/games/Games';
import { createGoal, goalsForGame, deleteAllGoalsForGame } from '../../database/games/Goals';
import { getUser, getUsersEligibleToModerateGame } from '../../database/Users';

const games = Router();

games.get('/', async (req, res) => {
    const result = await allGames();
    res.status(200).json(result);
});

games.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    const result = await gameForSlug(slug);
    if (result) {
        res.status(200).json(result);
    } else {
        res.sendStatus(404);
    }
});

games.post('/', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const { name, slug, coverImage } = req.body;
    if (!name) {
        res.status(400).send('Missing game name');
        return;
    }
    if (!slug) {
        res.status(400).send('Missing game slug');
        return;
    }
    const result = await createGame(name, slug, coverImage, [req.session.user]);
    if(!result) {
        res.status(500).send('Failed to create game');
        return
    }
    if ('statusCode' in result)  {
        res.status(result.statusCode).send(result.message);
        return;
    }

    res.status(200).json(result);
});

games.post('/:slug', async (req, res) => {
    const { slug } = req.params;
    const { name, coverImage, enableSRLv5, racetimeCategory, racetimeGoal } =
        req.body;

    let result = undefined;
    if (name) {
        result = await updateGameName(slug, name);
    }
    if (coverImage) {
        result = await updateGameCover(slug, coverImage);
    }
    if (enableSRLv5 !== undefined) {
        result = await updateSRLv5Enabled(slug, !!enableSRLv5);
    }
    if (racetimeCategory) {
        result = await updateRacetimeCategory(slug, racetimeCategory);
    }
    if (racetimeGoal) {
        result = await updateRacetimeGoal(slug, racetimeGoal);
    }

    if (!result) {
        res.status(400).send('No changes provided');
        return;
    }

    res.status(200).json(result);
});

games.get('/:slug/goals', async (req, res) => {
    const { slug } = req.params;
    const goals = await goalsForGame(slug);
    res.status(200).json(goals);
});

games.post('/:slug/goals', async (req, res) => {
    const { slug } = req.params;
    const { goal, description, categories, difficulty } = req.body;
    let difficultyNum: number | undefined = undefined;
    if (difficulty) {
        difficultyNum = Number(difficulty);
        if (Number.isNaN(difficultyNum)) {
            res.status(400).send('Invalid difficulty value');
            return;
        }
    }
    if (!goal) {
        res.status(400).send('Missing goal text');
        return;
    }
    const newGoal = await createGoal(
        slug,
        goal,
        description,
        categories,
        difficultyNum,
    );
    res.status(200).json(newGoal);
});

games.get('/:slug/eligibleMods', async (req, res) => {
    const { slug } = req.params;
    const userList = await getUsersEligibleToModerateGame(slug);
    res.status(200).json(userList);
});

games.post('/:slug/owners', async (req, res) => {
    const { slug } = req.params;
    const { users } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!users) {
        res.status(400).send('Missing users');
        return;
    }
    if (!Array.isArray(users)) {
        res.status(400).send('Users parameter is not an array');
        return;
    }
    const allUsersExist = (
        await Promise.all(
            users.map(async (user) => {
                if (!getUser(user)) {
                    return false;
                }
                return true;
            }),
        )
    ).every((b) => b);

    if (!allUsersExist) {
        res.sendStatus(400);
        return;
    }

    await addOwners(slug, users);
    res.sendStatus(200);
});

games.delete('/:slug/owners', async (req, res) => {
    const { slug } = req.params;
    const { user } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!user) {
        res.status(400).send('Missing user');
        return;
    }
    if (!getUser(user)) {
        res.sendStatus(404);
        return;
    }
    const game = await gameForSlug(slug);
    if (!game) {
        res.sendStatus(404);
        return;
    }
    if (game.owners.length <= 1) {
        res.status(400).send('Cannot remove the last owner of a game.');
    }

    await removeOwner(slug, user);
    res.sendStatus(200);
});

games.post('/:slug/moderators', async (req, res) => {
    const { slug } = req.params;
    const { users } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!users) {
        res.status(400).send('Missing users');
        return;
    }
    if (!Array.isArray(users)) {
        res.status(400).send('Users parameter is not an array');
        return;
    }
    const allUsersExist = (
        await Promise.all(
            users.map(async (user) => {
                if (!getUser(user)) {
                    return false;
                }
                return true;
            }),
        )
    ).every((b) => b);

    if (!allUsersExist) {
        res.sendStatus(400);
        return;
    }

    await addModerators(slug, users);
    res.sendStatus(200);
});

games.delete('/:slug/moderators', async (req, res) => {
    const { slug } = req.params;
    const { user } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!user) {
        res.status(400).send('Missing user');
        return;
    }
    if (!getUser(user)) {
        res.sendStatus(404);
        return;
    }

    await removeModerator(slug, user);
    res.sendStatus(200);
});

games.get('/:slug/permissions', async (req, res) => {
    const { slug } = req.params;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    res.status(200).json({
        isOwner: await isOwner(slug, req.session.user),
        canModerate: await isModerator(slug, req.session.user),
    });
});

games.delete('/:slug/deleteAllGoals', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    const { slug } = req.params;

    // Check if user is a moderator
    if (!(await isModerator(slug, req.session.user))) {
        res.sendStatus(403);
        return;
    }

    const success = await deleteAllGoalsForGame(slug);

    if (!success) {
        res.status(500).send('Failed to delete all goals');
        return;
    }

    res.status(200).send('All goals deleted successfully');
});

export default games;
