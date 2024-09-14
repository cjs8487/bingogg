import { Router } from 'express';
import { getUser } from '../../database/Users';
import {
    activateToken,
    createApiToken,
    deactivateToken,
    getAllTokens,
    revokeToken,
    tokenExists,
} from '../../database/auth/ApiTokens';

const tokens = Router();

tokens.get('/', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = await getUser(req.session.user);
    if (!user) {
        res.sendStatus(403);
        return;
    }
    if (!user.staff) {
        res.sendStatus(403);
        return;
    }

    res.status(200).json(await getAllTokens());
});

tokens.post('/', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = await getUser(req.session.user);
    if (!user) {
        res.sendStatus(403);
        return;
    }
    if (!user.staff) {
        res.sendStatus(403);
        return;
    }

    const { name } = req.body;

    if (!name) {
        res.sendStatus(400);
        return;
    }

    const token = await createApiToken(name);
    res.status(200).json(token);
});

tokens.post('/:id', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = await getUser(req.session.user);
    if (!user) {
        res.sendStatus(403);
        return;
    }
    if (!user.staff) {
        res.sendStatus(403);
        return;
    }

    const { id } = req.params;
    if (!(await tokenExists(id))) {
        res.sendStatus(404);
        return;
    }

    const { active } = req.body;

    if (typeof active !== 'boolean') {
        res.sendStatus(400);
        return;
    }
    let token;
    if (active) {
        token = activateToken(id);
    } else {
        token = deactivateToken(id);
    }
    res.status(200).json(token);
});

tokens.delete('/:id', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = await getUser(req.session.user);
    if (!user) {
        res.sendStatus(403);
        return;
    }
    if (!user.staff) {
        res.sendStatus(403);
        return;
    }

    const { id } = req.params;
    if (!(await tokenExists(id))) {
        res.sendStatus(404);
        return;
    }
    res.status(200).json(await revokeToken(id));
});

export default tokens;
