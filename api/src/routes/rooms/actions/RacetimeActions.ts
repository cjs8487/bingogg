import { ConnectionService } from '@prisma/client';
import Room from '../../../core/Room';
import { getRacetimeConfiguration } from '../../../database/games/Games';
import { connectRoomToRacetime } from '../../../database/Rooms';
import { racetimeHost } from '../../../Environment';
import { getAccessToken } from '../../../lib/RacetimeConnector';
import { ActionResult, unknownAction } from './Actions';
import { getConnectionForUser } from '../../../database/Connections';
import { RoomTokenPayload } from '../../../auth/RoomAuth';

export const handleRacetimeAction = async (
    room: Room,
    action: string,
    user: string,
    roomToken: RoomTokenPayload,
) => {
    const rtConnection = await getConnectionForUser(
        user,
        ConnectionService.RACETIME,
    );
    if (!rtConnection) {
        room.logInfo(
            'Unable to join a user to the racetime room - no racetime connection found',
        );
        return {
            code: 403,
            message: 'Forbidden',
        };
    }

    const token = await getAccessToken(user);
    if (!token) {
        return {
            code: 403,
            message: 'Forbidden',
        };
    }

    switch (action) {
        case 'create':
            return createRacetimeRoom(room, token);
        case 'refresh':
            return refreshConnection(room);
        case 'join':
            return joinPlayer(room, user, roomToken, rtConnection.serviceId);
        case 'ready':
            return readyPlayer(room, token, roomToken);
        case 'unready':
            return unreadyPlayer(room, token, roomToken);
        default:
            return unknownAction(room);
    }
};

const createRacetimeRoom = async (
    room: Room,
    token: string,
): Promise<ActionResult> => {
    const racetimeConfiguration = await getRacetimeConfiguration(room.gameSlug);
    if (
        !racetimeConfiguration ||
        !racetimeConfiguration.racetimeCategory ||
        !racetimeConfiguration.racetimeGoal
    ) {
        return {
            code: 400,
            message:
                "This game isn't properly configured for racetime.gg integration",
        };
    }

    const createRes = await fetch(
        `${racetimeHost}/o/${racetimeConfiguration.racetimeCategory}/startrace`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
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
        return {
            code: 400,
            message: 'Invalid racetime configuration for the category',
        };
    }
    if (createRes.status !== 201) {
        // uh oh
        return {
            code: 500,
            message:
                'Received a response from racetime that the server does not know how to handle',
        };
    }

    const relativePath = createRes.headers.get('Location');
    if (!relativePath) {
        return {
            code: 500,
            message:
                'Received a response from racetime that the server does not know how to handle',
        };
    }
    const url = `${racetimeHost}${relativePath}`;
    await connectRoomToRacetime(room.slug, url).then();
    room.handleRacetimeRoomCreated(url);

    return {
        code: 200,
        value: { url },
    };
};

const refreshConnection = async (room: Room): Promise<ActionResult> => {
    room.refreshRacetimeHandler();
    return {
        code: 200,
        value: {},
    };
};

const joinPlayer = async (
    room: Room,
    user: string,
    roomToken: RoomTokenPayload,
    racetimeId: string,
): Promise<ActionResult> => {
    const token = await getAccessToken(user);
    if (!token) {
        room.logInfo(
            'Unable to join a user to the racetime room - unable to generate token',
        );
        return {
            code: 403,
            message: 'Forbidden',
        };
    }

    if (!room.joinRacetimeRoom(token, racetimeId, roomToken)) {
        return {
            code: 403,
            message: 'Forbidden',
        };
    }
    return {
        code: 200,
        value: {},
    };
};

const readyPlayer = async (
    room: Room,
    token: string,
    roomToken: RoomTokenPayload,
): Promise<ActionResult> => {
    room.readyPlayer(token, roomToken);
    return {
        code: 200,
        value: {},
    };
};

const unreadyPlayer = async (
    room: Room,
    token: string,
    roomToken: RoomTokenPayload,
): Promise<ActionResult> => {
    room.unreadyPlayer(token, roomToken);
    return {
        code: 200,
        value: {},
    };
};
