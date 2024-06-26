import { Router } from 'express';
import {
    gameForSlug,
    isOwner,
    updateSRLv5Enabled,
} from '../../database/games/Games';
import { createGoals } from '../../database/games/Goals';

const upload = Router();

upload.post('/srlv5', async (req, res) => {
    const { slug, goals } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!slug) {
        res.status(400).send('Missing game slug');
        return;
    }
    if (!goals) {
        res.status(400).send('Missing goal list');
        return;
    }
    if (!Array.isArray(goals)) {
        res.status(400).send('Invalid goal list format');
    }

    if (!gameForSlug(slug)) {
        res.sendStatus(404);
        return;
    }

    await createGoals(slug, goals);
    await updateSRLv5Enabled(slug, true);
    res.sendStatus(201);
});

upload.post('/list', async (req, res) => {
    const { slug, goals } : {slug: string, goals: string[]} = req.body;
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!slug) {
        res.status(400).send('Missing game slug');
        return;
    }
    if (!goals) {
        res.status(400).send('Missing goal list');
        return;
    }
    if (!Array.isArray(goals)) {
        res.status(400).send('Invalid goal list format');
    }

    if (!gameForSlug(slug)) {
        res.sendStatus(404);
        return;
    }

    const convertedGoals: {goal: string}[] = goals.map((goal: string) => {
        return {
            goal: goal,
            
        };
    });
    await createGoals(slug, convertedGoals);
    res.sendStatus(201);
});

export default upload;
