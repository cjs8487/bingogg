import { randomInt } from 'crypto';
import { Router } from 'express';
import { createRoomToken, verifyRoomToken } from '../../auth/RoomAuth';
import Room, { BoardGenerationMode } from '../../core/Room';
import { allRooms } from '../../core/RoomServer';
import {
    createRoom,
    getFullRoomList,
    getRoomFromSlug,
} from '../../database/Rooms';
import { gameForSlug, goalCount } from '../../database/games/Games';
import { chunk } from '../../util/Array';
import { logInfo, logWarn } from '../../Logger';

const MIN_ROOM_GOALS_REQUIRED = 25;
const rooms = Router();

const slugList = [
    'cool',
    'nimble',
    'weak',
    'feeling',
    'fire',
    'rapid',
    'messy',
    'living',
    'mill',
    'flour',
    'wheat',
];

rooms.get('/', async (req, res) => {
    const { inactive } = req.query;

    const roomList: { name: string; game: string; slug: string }[] = [];
    if (!inactive) {
        allRooms.forEach((room, key) => {
            roomList.push({ name: room.name, game: room.game, slug: key });
        });
        res.send(roomList);
    } else {
        res.json(
            (await getFullRoomList()).map((room) => ({
                name: room.name,
                game: room.game.name,
                slug: room.slug,
            })),
        );
    }
});

rooms.post('/', async (req, res) => {
    const {
        name,
        game,
        nickname,
        password,
        /*variant, mode,*/ generationMode,
    } = req.body;

    if (!name || !game || !nickname /*|| !variant || !mode*/) {
        res.status(400).send('Missing required element(s).');
        return;
    }

    const gameData = await gameForSlug(game);
    if (!gameData) {
        res.sendStatus(404);
        return;
    }

    // Might be better as a frontend check, but also way more imperformant
    const goalsNumber = await goalCount(game);

    if (goalsNumber < MIN_ROOM_GOALS_REQUIRED) {
        res.status(400).send(
            `Game has less than the minimum amount of goals required for room creation (${MIN_ROOM_GOALS_REQUIRED}).`,
        );
        return;
    }

    const slug = `${slugList[randomInt(0, slugList.length)]}-${
        slugList[randomInt(0, slugList.length)]
    }-${randomInt(1000, 10000)}`;

    const dbRoom = await createRoom(slug, name, gameData.id, false, password);
    const room = new Room(
        name,
        gameData.name,
        game,
        slug,
        password,
        dbRoom.id,
        gameData.racetimeBeta &&
            !!gameData.racetimeCategory &&
            !!gameData.racetimeGoal,
    );
    let genMode;
    if (generationMode) {
        genMode = generationMode;
    } else {
        if (gameData.enableSRLv5) {
            genMode = BoardGenerationMode.SRLv5;
        } else {
            genMode = BoardGenerationMode.RANDOM;
        }
    }
    await room.generateBoard(genMode);
    allRooms.set(slug, room);

    const token = createRoomToken(room);

    res.status(200).json({ slug, authToken: token });
});

rooms.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    if (allRooms.get(slug)) {
        res.sendStatus(200);
        return;
    }
    const dbRoom = await getRoomFromSlug(slug);
    if (!dbRoom) {
        res.sendStatus(404);
        return;
    }
    const room = new Room(
        dbRoom.name,
        dbRoom.game.name,
        dbRoom.game.slug,
        dbRoom.slug,
        dbRoom.password ?? '',
        dbRoom.id,
        (dbRoom.game.racetimeBeta &&
            !!dbRoom.game.racetimeCategory &&
            !!dbRoom.game.racetimeGoal) ||
            !!dbRoom.racetimeRoom,
        dbRoom.racetimeRoom ?? '',
    );
    room.board = {
        board: chunk(
            dbRoom.board.map((goal) => ({
                goal,
                description: '',
                colors: [],
            })),
            5,
        ),
    };
    dbRoom.history.forEach((action) => {
        const { nickname, color, newColor, oldColor, row, col, message } =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            action.payload as any;
        switch (action.action) {
            case 'JOIN':
                room.sendChat([{ contents: nickname, color }, ' has joined.']);
                break;
            case 'LEAVE':
                room.sendChat([{ contents: nickname, color }, ' has left.']);
                break;
            case 'MARK':
                if (room.board.board[row][col].colors.includes(color)) return;
                room.board.board[row][col].colors.push(color);
                room.board.board[row][col].colors.sort((a, b) =>
                    a.localeCompare(b),
                );
                room.sendCellUpdate(row, col);
                room.sendChat([
                    {
                        contents: nickname,
                        color: color,
                    },
                    ` is marking (${row},${col})`,
                ]);
                break;
            case 'UNMARK':
                room.board.board[row][col].colors = room.board.board[row][
                    col
                ].colors.filter((c) => c !== color);
                room.sendCellUpdate(row, col);
                room.sendChat([
                    { contents: nickname, color: color },
                    ` is unmarking (${row},${col})`,
                ]);
                break;
            case 'CHAT':
                room.sendChat(`${nickname}: ${message}`);
                break;
            case 'CHANGECOLOR':
                room.sendChat([
                    { contents: nickname, color: oldColor },
                    ' has changed their color to ',
                    { contents: color, color: newColor },
                ]);
                break;
        }
    });
    allRooms.set(slug, room);
});

rooms.post('/:slug/authorize', (req, res) => {
    const { slug } = req.params;
    const { password } = req.body;
    const room = allRooms.get(slug);
    if (!room) {
        res.sendStatus(404);
        return;
    }
    if (password !== room.password) {
        res.sendStatus(403);
        return;
    }
    const token = createRoomToken(room);
    res.status(200).send({ authToken: token });
});

interface ActionResultBase {
    code: number;
}

interface ActionResultError extends ActionResultBase {
    message: string;
}

interface ActionResult<T> extends ActionResultBase {
    value: T;
}

rooms.post<{ slug: string; action: string }>(
    '/:slug/actions/:action(*)',
    (req, res) => {
        const { slug, action } = req.params;

        if (!req.session.user) {
            logWarn(`Unauthorized action request ${action}`);
            res.sendStatus(401);
            return;
        }

        const { authToken } = req.body;
        if (!authToken) {
            logInfo(`Malformed action body request - missing authToken`);
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
            room.logWarn(`Unauthorized action request`);
            res.sendStatus(403);
            return;
        }

        const result = handleAction(room, action, req.session.user);

        res.status(result.code);
        if ('message' in result) {
            res.send(result.message);
        } else {
            res.json(result.value);
        }
    },
);

const handleAction = (
    room: Room,
    action: string,
    user: string,
): ActionResult<unknown> | ActionResultError => {
    switch (action) {
        case 'racetime/create':
            return {
                code: 200,
                value: { url: '' },
            };
        default:
            room.logInfo('Unknown action request');
            return {
                code: 400,
                message: 'Unknown action',
            };
    }
};

export default rooms;
