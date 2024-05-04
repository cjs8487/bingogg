import { Router } from 'express';
import { verifyRoomToken } from '../../auth/RoomAuth';
import { allRooms } from '../../core/RoomServer';
import { getAccessToken } from '../../lib/RacetimeConnector';
import { racetimeHost } from '../../Environment';

const actions = Router();

actions.post('/createRacetimeRoom', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    const { slug, authToken } = req.body;

    if (!slug || !authToken) {
        res.status(400).send('Missing required body parameter');
        return;
    }
    if (!allRooms.get(slug)) {
        res.sendStatus(404);
        return;
    }
    if (!verifyRoomToken(authToken, slug)) {
        res.sendStatus(403);
        return;
    }

    const rtToken = await getAccessToken(req.session.user);
    if (!rtToken) {
        res.sendStatus(403);
        return;
    }

    const createRes = await fetch(`${racetimeHost}/o/coh/startrace`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rtToken}`,
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            start_delay: '15',
            time_limit: `24`,
            chat_message_delay: '0',
            goal: 'Beat the Game',
        }),
    });
    if (!createRes.ok) {
        // error case
    } else {
        // figure out what the race room is
    }
    res.status(200).send();
});

export default actions;
