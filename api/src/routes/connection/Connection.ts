import { ConnectionService } from '@prisma/client';
import { Router } from 'express';
import { racetimeHost } from '../../Environment';
import {
    deleteConnection,
    getConnectionForUser,
} from '../../database/Connections';

const connection = Router();

connection.get('/racetime', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    res.status(200);
    const rtConnection = await getConnectionForUser(
        req.session.user,
        ConnectionService.RACETIME,
    );
    if (!rtConnection) {
        res.json({ hasRacetimeConnection: false });
        return;
    }

    const userRes = await fetch(
        `${racetimeHost}/user/${rtConnection.serviceId}/data`,
    );
    if (!userRes.ok) {
        res.json({ hasRacetimeConnection: false });
        return;
    }
    const userData = (await userRes.json()) as {
        full_name: string;
    };

    res.json({ hasRacetimeConnection: true, racetimeUser: userData.full_name });
});

connection.post('/disconnect/racetime', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const rtConnection = await getConnectionForUser(
        req.session.user,
        ConnectionService.RACETIME,
    );
    if (!rtConnection) {
        res.sendStatus(403);
        return;
    }
    if (
        !(await deleteConnection(req.session.user, ConnectionService.RACETIME))
    ) {
        res.sendStatus(403);
        return;
    }
    res.sendStatus(200);
});

export default connection;
