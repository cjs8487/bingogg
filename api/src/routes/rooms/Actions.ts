import { Router } from 'express';
import { verifyRoomToken } from '../../auth/RoomAuth';
import { allRooms } from '../../core/RoomServer';
import { getAccessToken } from '../../lib/RacetimeConnector';
import { racetimeHost } from '../../Environment';
import { connectRoomToRacetime } from '../../database/Rooms';

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
    const room = allRooms.get(slug);
    if (!room) {
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
        res.status(400).send('Invalid racetime configuration for the category');
        return;
    }
    if (createRes.status !== 201) {
        // uh oh
        res.status(500).send(
            'Recieved a response from racetime that the server does not know how to handle',
        );
        return;
    }

    const relativePath = createRes.headers.get('Location');
    if (!relativePath) {
        res.status(500).send(
            'Recieved a response from racetime that the server does not know how to handle',
        );
        return;
    }
    const url = `${racetimeHost}${relativePath}`;
    connectRoomToRacetime(slug, url).then();
    room.handleRacetimeRoomCreated(url);

    res.status(200).json({
        url,
    });
});

export default actions;
