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

// Actions are endpoints that allow consumers to execute actions on a bingo
// room. Many times, these are actions that not suitable to the websocket
// connection because they require a login session or an OAuth token (typically
// because they need access to user data, such as external connections in order
// to function). As much as possible, action endpoints try to send a helpful
// status and message, regardless of the outcome. However, given the nature of
// some of these actions (especially integration related actions), it is not
// always possible (or reasonable) for the endpoint to block and/or determine
// if the action was successful (success is also a fairly difficult thing to
// define in some cases). AS such, the only guarantee that action endpoints make
// is that if a 4xx or 5xx code is sent, the action did not dispatch or was
// obviously unsuccessful, and that a 2xx status code indicates that the action
// was successfully dispatched for processing. The successful completion of an
// action will always result in an appropriate room update being dispatched. It
// is up to Consuming applications to watch for updates via their preferred
// mechanism if they need to react to the success/completion of the action. It
// is generally not recommended to act based on the success of actions, and to
// rather accurately display the state of the room based on the data the server
// sends out, as that is the source of truth, and relying on manual or predicted
// triggers will likely result in desyncs.

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
        room.logWarn('Unauthorized action request');
        res.sendStatus(403);
        return;
    }
    room.refreshRacetimeHandler();
    res.status(200).send();
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

actions.post('/racetime/ready', async (req, res) => {
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
    room.readyPlayer(token, roomToken);
    res.status(200).send();
});

actions.post('/racetime/unready', async (req, res) => {
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
    room.unreadyPlayer(token, roomToken);
    res.status(200).send();
});

export default actions;
