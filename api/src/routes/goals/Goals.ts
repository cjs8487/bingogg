import { Router } from 'express';
import { isModerator } from '../../database/games/Games';
import { deleteGoal, deleteAllGoals, editGoal, gameForGoal } from '../../database/games/Goals';
import upload from './Upload';

const goals = Router();

goals.get('/:id', (req, res) => {
    res.sendStatus(500);
});

goals.post('/:id', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    const game = await gameForGoal(req.params.id);

    // If no game could be found, the goal probably doesn't exist
    if(!game) {
        res.sendStatus(404);
        return;
    }

    if (!(await isModerator(game.slug, req.session.user))) {
        res.sendStatus(403);
        return;
    }

    const { id } = req.params;
    const { goal, description, categories, difficulty } = req.body;
    
    if (!goal && !description && !categories && !difficulty) {
        res.status(400).send('No changes submitted');
        return;
    }
    const success = await editGoal(id, {
        goal,
        description,
        categories,
        difficulty,
    });
    if (!success) {
        res.sendStatus(404);
        return;
    }
    res.sendStatus(200);
});

goals.delete('/:id', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    const game = await gameForGoal(req.params.id);

    // If no game could be found, the goal probably doesn't exist
    if(!game) {
        res.sendStatus(404);
        return;
    }

    if (!(await isModerator(game.slug, req.session.user))) {
        res.sendStatus(403);
        return;
    }

    const { id } = req.params;
    const success = await deleteGoal(id);
    if (!success) {
        res.sendStatus(404);
        return;
    }
    res.sendStatus(200);
});

// Route to delete all goals for a game
goals.delete('/game/:slug/delete-all', async (req, res) => {
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

    const success = await deleteAllGoals(slug);

    if (!success) {
        res.status(500).send('Failed to delete all goals');
        return;
    }

    res.status(200).send('All goals deleted successfully');
});

goals.use('/upload', upload);

export default goals;
