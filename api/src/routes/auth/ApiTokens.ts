import { Router } from 'express';
import { getUser } from '../../database/Users';
import { createApiToken, getAllTokens } from '../../database/auth/ApiTokens';

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
    const { name } = req.body;

    if (!name) {
        res.sendStatus(400);
        return;
    }

    const token = await createApiToken(name);
    res.status(200).json(token);
});

export default tokens;
