import { Router } from 'express';
import { verifyRoomToken } from '../../auth/RoomAuth';
import { allRooms } from '../../core/RoomServer';
import { getAccessToken } from '../../lib/RacetimeConnector';
import { racetimeHost } from '../../Environment';
import {
    connectRoomToRacetime,
    disconnectRoomFromRacetime,
} from '../../database/Rooms';
import { getRacetimeConfiguration } from '../../database/games/Games';

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

    const racetimeConfiguration = await getRacetimeConfiguration(room.gameSlug);

    if (
        !racetimeConfiguration ||
        !racetimeConfiguration.racetimeCategory ||
        !racetimeConfiguration.racetimeGoal
    ) {
        res.status(400).send(
            "This game isn't properly configured for racetime.gg integration",
        );
        return;
    }

    const createRes = await fetch(
        `${racetimeHost}/o/${racetimeConfiguration.racetimeCategory}/startrace`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${rtToken}`,
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                start_delay: '15',
                time_limit: `24`,
                chat_message_delay: '0',
                goal: racetimeConfiguration.racetimeGoal,
            }),
        },
    );
    if (!createRes.ok) {
        res.status(400).send('Invalid racetime configuration for the category');
        return;
    }
    if (createRes.status !== 201) {
        // uh oh
        res.status(500).send(
            'Received a response from racetime that the server does not know how to handle',
        );
        return;
    }

    const relativePath = createRes.headers.get('Location');
    if (!relativePath) {
        res.status(500).send(
            'Received a response from racetime that the server does not know how to handle',
        );
        return;
    }
    const url = `${racetimeHost}${relativePath}`;
    connectRoomToRacetime(slug, relativePath).then();
    room.handleRacetimeRoomCreated(url);

    res.status(200).json({
        url,
    });
});

actions.post('/refreshRacetimeConnection', async (req, res) => {
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

    const racetimeRes = await fetch(`${racetimeHost}${room.racetimeUrl}/data`);
    if (!racetimeRes.ok) {
        disconnectRoomFromRacetime(slug).then();
        room.handleRacetimeRoomDisconnected();
        return;
    }
    const data = (await racetimeRes.json()) as { status: { value: string } };
    if (data.status.value === 'cancelled') {
        disconnectRoomFromRacetime(slug).then();
        room.handleRacetimeRoomDisconnected();
    }
    res.status(200);
});

export default actions;
