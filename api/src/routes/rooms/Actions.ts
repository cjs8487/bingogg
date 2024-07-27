import { Router } from 'express';
import { verifyRoomToken } from '../../auth/RoomAuth';
import { allRooms } from '../../core/RoomServer';
import { getAccessToken } from '../../lib/RacetimeConnector';
import { racetimeHost } from '../../Environment';
import { connectRoomToRacetime } from '../../database/Rooms';
import { getRacetimeConfiguration } from '../../database/games/Games';
import { getConnectionForUser } from '../../database/Connections';
import { ConnectionService } from '@prisma/client';
import { logInfo, logWarn } from '../../Logger';

const actions = Router();

actions.post('/createRacetimeRoom', async (req, res) => {
    if (!req.session.user) {
        logWarn('Unauthorized racetime room create request');
        res.sendStatus(401);
        return;
    }

    const { slug, authToken } = req.body;

    if (!slug || !authToken) {
        logInfo(`Malformed action body request`);
        res.status(400).send('Missing required body parameter');
        return;
    }
    const room = allRooms.get(slug);
    if (!room) {
        logInfo(`Unable to find room to take action on`);
        res.sendStatus(404);
        return;
    }
    if (!verifyRoomToken(authToken, slug)) {
        logWarn(`[${room.slug}] Unauthorized action request`);
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
    await connectRoomToRacetime(slug, url).then();
    room.handleRacetimeRoomCreated(url);

    res.status(200).json({
        url,
    });
});

actions.post('/refreshRacetimeConnection', async (req, res) => {
    const { slug, authToken } = req.body;

    if (!slug || !authToken) {
        logInfo(`Malformed action body request`);
        res.status(400).send('Missing required body parameter');
        return;
    }
    const room = allRooms.get(slug);
    if (!room) {
        logInfo(`Unable to find room to take action on`);
        res.sendStatus(404);
        return;
    }
    if (!verifyRoomToken(authToken, slug)) {
        logWarn(`[${room.slug}] Unauthorized action request`);
        res.sendStatus(403);
        return;
    }
    room.refreshRacetimeHandler();
    res.status(200);
});

actions.post('/racetime/join', async (req, res) => {
    if (!req.session.user) {
        logWarn('Unauthorized racetime join request');
        res.sendStatus(401);
        return;
    }

    const { slug, authToken } = req.body;

    if (!slug || !authToken) {
        logInfo(`Malformed action body request`);
        res.status(400).send('Missing required body parameter');
        return;
    }
    const room = allRooms.get(slug);
    if (!room) {
        logInfo(`Unable to find room to take action on`);
        res.sendStatus(404);
        return;
    }
    const roomToken = verifyRoomToken(authToken, slug);
    if (!roomToken) {
        logWarn(`[${room.slug}] Unauthorized action request`);
        res.sendStatus(403);
        return;
    }

    const rtConnection = await getConnectionForUser(
        req.session.user,
        ConnectionService.RACETIME,
    );
    if (!rtConnection) {
        logInfo(
            `[${room.slug}] Unable to join a user to the racetime room - no racetime connection found`,
        );
        res.sendStatus(403);
        return;
    }

    const token = await getAccessToken(req.session.user);
    if (!token) {
        logInfo(
            `[${room.slug}] Unable to join a user to the racetime room - unable to generate token`,
        );
        res.sendStatus(403);
        return;
    }

    if (!room.joinRacetimeRoom(token, rtConnection.serviceId, roomToken)) {
        res.sendStatus(403);
        return;
    }
    res.sendStatus(200);
});

export default actions;
