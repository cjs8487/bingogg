import { Router } from 'express';
import auth from './auth/Auth';
import games from './games/Games';
import goals from './goals/Goals';
import registration from './registration/Registration';
import rooms from './rooms/Rooms';
import { getUser } from '../database/Users';
import users from './users/Users';

const api = Router();

api.use('/rooms', rooms);
api.use('/games', games);
api.use('/goals', goals);
api.use('/registration', registration);
api.use('/auth', auth);
api.use('/users', users);

api.get('/me', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = await getUser(req.session.user);
    if (!user) {
        res.sendStatus(403);
        return;
    }
    res.status(200).send(user);
});

api.post('/logout', (req, res, next) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    req.session.user = undefined;
    req.session.save((err) => {
        if (err) {
            next(err);
            return;
        }
        req.session.destroy((destErr) => {
            if (destErr) {
                next(destErr);
                return;
            }
            res.sendStatus(200);
        });
    });
});

export default api;
