import { Goal } from '@prisma/client';
import { OPEN, WebSocket } from 'ws';
import { logError, logInfo, logWarn } from '../Logger';
import { RoomTokenPayload, invalidateToken } from '../auth/RoomAuth';
import {
    addChangeColorAction,
    addChatAction,
    addJoinAction,
    addLeaveAction,
    addMarkAction,
    addUnmarkAction,
    setRoomBoard,
} from '../database/Rooms';
import { goalsForGame } from '../database/games/Goals';
import {
    ChangeColorAction,
    ChatAction,
    JoinAction,
    LeaveAction,
    MarkAction,
    NewCardAction,
    UnmarkAction,
} from '../types/RoomAction';
import {
    Board,
    ChatMessage,
    Player,
    ServerMessage,
} from '../types/ServerMessage';
import { shuffle } from '../util/Array';
import { listToBoard } from '../util/RoomUtils';
import { generateSRLv5 } from './generation/SRLv5';
import RacetimeHandler, { RaceData } from './integration/RacetimeHandler';

type RoomIdentity = {
    nickname: string;
    color: string;
    racetimeId?: string;
};

export enum BoardGenerationMode {
    RANDOM = 'Random',
    SRLv5 = 'SRLv5',
}

/**
 * Represents a room in the bingo.gg service. A room is container for a single
 * "game" of bingo, containing the board, game state, history, and all other
 * game level data.
 */
export default class Room {
    name: string;
    game: string;
    gameSlug: string;
    password: string;
    slug: string;
    connections: Map<string, WebSocket>;
    board: Board;
    identities: Map<string, RoomIdentity>;
    chatHistory: ChatMessage[];
    id: string;

    lastGenerationMode: BoardGenerationMode;

    racetimeEligible: boolean;
    racetimeHandler: RacetimeHandler;

    constructor(
        name: string,
        game: string,
        gameSlug: string,
        slug: string,
        password: string,
        id: string,
        racetimeEligible: boolean,
        racetimeUrl?: string,
    ) {
        this.name = name;
        this.game = game;
        this.gameSlug = gameSlug;
        this.password = password;
        this.slug = slug;
        this.identities = new Map();
        this.connections = new Map();
        this.chatHistory = [];
        this.id = id;

        this.lastGenerationMode = BoardGenerationMode.RANDOM;

        this.racetimeEligible = !!racetimeEligible;
        this.racetimeHandler = new RacetimeHandler(this);

        this.board = {
            board: [],
        };

        if (racetimeUrl) {
            this.racetimeHandler.connect(racetimeUrl);
        }
    }

    async generateBoard(mode: BoardGenerationMode) {
        this.lastGenerationMode = mode;
        const goals = await goalsForGame(this.gameSlug);
        let goalList: Goal[];
        try {
            switch (mode) {
                case BoardGenerationMode.SRLv5:
                    goalList = generateSRLv5(goals);
                    goalList.shift();
                    break;
                case BoardGenerationMode.RANDOM:
                default:
                    shuffle(goals);
                    goalList = goals.splice(0, 25);
                    break;
            }
        } catch {
            logError(`Failed to generate board for for room ${this.slug}`);
            return;
        }

        this.board = { board: listToBoard(goalList) };
        this.sendSyncBoard();
        setRoomBoard(
            this.id,
            this.board.board.flat().map((cell) => cell.goal),
        );
    }

    getPlayers() {
        const players: Player[] = [];
        this.identities.forEach((i) => {
            const rtUser = this.racetimeHandler.getPlayer(i.racetimeId ?? '');
            players.push({
                nickname: i.nickname,
                color: i.color,
                goalCount: this.board.board.reduce((prev, row) => {
                    return (
                        prev +
                        row.reduce((p, cell) => {
                            if (cell.colors.includes(i.color)) {
                                return p + 1;
                            }
                            return p;
                        }, 0)
                    );
                }, 0),
                racetimeStatus: rtUser
                    ? {
                          connected: true,
                          username: rtUser.user.full_name,
                          status: rtUser.status.verbose_value,
                          finishTime: rtUser.finish_time ?? undefined,
                      }
                    : { connected: false },
            });
        });
        return players;
    }

    //#region Handlers
    handleJoin(
        action: JoinAction,
        auth: RoomTokenPayload,
        socket: WebSocket,
    ): ServerMessage {
        let identity: RoomIdentity | undefined;
        if (action.payload) {
            identity = {
                nickname: action.payload.nickname,
                color: 'blue',
            };
            this.identities.set(auth.uuid, identity);
        } else {
            identity = this.identities.get(auth.uuid);
            if (!identity) {
                return { action: 'unauthorized' };
            }
        }
        this.sendChat([
            { contents: identity.nickname, color: identity.color },
            ' has joined.',
        ]);

        this.connections.set(auth.uuid, socket);
        addJoinAction(this.id, identity.nickname, identity.color).then();
        return {
            action: 'connected',
            board: this.board,
            chatHistory: this.chatHistory,
            nickname: identity.nickname,
            color: identity.color,
            roomData: {
                game: this.game,
                slug: this.slug,
                name: this.name,
                gameSlug: this.gameSlug,
                racetimeConnection: {
                    gameActive: this.racetimeEligible,
                    url: this.racetimeHandler.url,
                    startDelay: this.racetimeHandler.data?.start_delay,
                    started: this.racetimeHandler.data?.started_at ?? undefined,
                    ended: this.racetimeHandler.data?.ended_at ?? undefined,
                    status: this.racetimeHandler.data?.status.verbose_value,
                },
            },
            players: this.getPlayers(),
        };
    }

    handleLeave(
        action: LeaveAction,
        auth: RoomTokenPayload,
        token: string,
    ): ServerMessage {
        const identity = this.identities.get(auth.uuid);
        if (!identity) {
            return { action: 'unauthorized' };
        }
        this.sendChat([
            { contents: identity.nickname, color: identity.color },
            ' has left.',
        ]);
        invalidateToken(token);
        this.identities.delete(auth.uuid);
        this.connections.delete(auth.uuid);
        addLeaveAction(this.id, identity.nickname, identity.color).then();
        return { action: 'disconnected' };
    }

    handleChat(
        action: ChatAction,
        auth: RoomTokenPayload,
    ): ServerMessage | undefined {
        const identity = this.identities.get(auth.uuid);
        if (!identity) {
            return { action: 'unauthorized' };
        }
        const { message: chatMessage } = action.payload;
        if (!chatMessage) return;
        this.sendChat(`${identity.nickname}: ${chatMessage}`);
        addChatAction(
            this.id,
            identity.nickname,
            identity.color,
            chatMessage,
        ).then();
    }

    handleMark(
        action: MarkAction,
        auth: RoomTokenPayload,
    ): ServerMessage | undefined {
        const identity = this.identities.get(auth.uuid);
        if (!identity) {
            return { action: 'unauthorized' };
        }
        const { row, col } = action.payload;
        if (row === undefined || col === undefined) return;
        if (this.board.board[row][col].colors.includes(identity.color)) return;
        this.board.board[row][col].colors.push(identity.color);
        this.board.board[row][col].colors.sort((a, b) => a.localeCompare(b));
        this.sendCellUpdate(row, col);
        this.sendChat([
            {
                contents: identity.nickname,
                color: identity.color,
            },
            ` is marking (${row},${col})`,
        ]);
        addMarkAction(
            this.id,
            identity.nickname,
            identity.color,
            row,
            col,
        ).then();
    }

    handleUnmark(
        action: UnmarkAction,
        auth: RoomTokenPayload,
    ): ServerMessage | undefined {
        const identity = this.identities.get(auth.uuid);
        if (!identity) {
            return { action: 'unauthorized' };
        }
        const { row: unRow, col: unCol } = action.payload;
        if (unRow === undefined || unCol === undefined) return;
        this.board.board[unRow][unCol].colors = this.board.board[unRow][
            unCol
        ].colors.filter((color) => color !== identity.color);
        this.sendCellUpdate(unRow, unCol);
        this.sendChat([
            { contents: identity.nickname, color: identity.color },
            ` is unmarking (${unRow},${unCol})`,
        ]);
        addUnmarkAction(
            this.id,
            identity.nickname,
            identity.color,
            unRow,
            unCol,
        ).then();
    }

    handleChangeColor(
        action: ChangeColorAction,
        auth: RoomTokenPayload,
    ): ServerMessage | undefined {
        const identity = this.identities.get(auth.uuid);
        if (!identity) {
            return { action: 'unauthorized' };
        }
        const { color } = action.payload;
        if (!color) {
            return;
        }
        this.identities.set(auth.uuid, {
            ...identity,
            color,
        });
        this.sendChat([
            { contents: identity.nickname, color: identity.color },
            ' has changed their color to ',
            { contents: color, color },
        ]);
        addChangeColorAction(
            this.id,
            identity.nickname,
            identity.color,
            color,
        ).then();
    }

    handleNewCard(action: NewCardAction) {
        if (action.generationMode) {
            this.generateBoard(action.generationMode as BoardGenerationMode);
        } else {
            this.generateBoard(this.lastGenerationMode);
        }
    }

    handleSocketClose(ws: WebSocket) {
        let socketKey;
        this.connections.forEach((v, k) => {
            if (v === ws) {
                socketKey = k;
            }
        });
        if (socketKey) {
            const identity = this.identities.get(socketKey);
            this.connections.delete(socketKey);
            if (!identity) return true;
            this.sendChat([
                { contents: identity.nickname, color: identity.color },
                'has left.',
            ]);
            addLeaveAction(this.id, identity.nickname, identity.color).then();
            return true;
        }
        return false;
    }

    async handleRacetimeRoomCreated(url: string) {
        this.sendServerMessage({
            action: 'updateRoomData',
            roomData: {
                game: this.game,
                slug: this.slug,
                name: this.name,
                gameSlug: this.gameSlug,
                racetimeConnection: {
                    url,
                },
            },
        });
        this.sendChat(`Racetime.gg room created ${url}`);
        this.racetimeHandler.connect(url);
        this.racetimeHandler.connectWebsocket();
    }

    handleRacetimeRoomDisconnected() {
        this.racetimeHandler.disconnect();
        this.sendServerMessage({
            action: 'updateRoomData',
            roomData: {
                game: this.game,
                slug: this.slug,
                name: this.name,
                gameSlug: this.gameSlug,
                racetimeConnection: {
                    url: undefined,
                },
            },
        });
    }
    //#endregion

    sendChat(message: string): void;
    sendChat(message: ChatMessage): void;

    sendChat(message: string | ChatMessage) {
        if (typeof message === 'string') {
            this.chatHistory.push([message]);
            this.sendServerMessage({ action: 'chat', message: [message] });
        } else {
            this.chatHistory.push(message);
            this.sendServerMessage({ action: 'chat', message: message });
        }
    }

    sendCellUpdate(row: number, col: number) {
        this.sendServerMessage({
            action: 'cellUpdate',
            row,
            col,
            cell: this.board.board[row][col],
        });
    }

    sendSyncBoard() {
        this.sendServerMessage({ action: 'syncBoard', board: this.board });
    }

    sendRaceData(data: RaceData) {
        this.logInfo('Dispatching race data update');
        this.sendServerMessage({
            action: 'syncRaceData',
            players: this.getPlayers(),
            racetimeConnection: {
                gameActive: this.racetimeEligible,
                url: this.racetimeHandler.url,
                startDelay: data.start_delay ?? undefined,
                started: data.started_at ?? undefined,
                ended: data.ended_at ?? undefined,
                status: data.status.verbose_value,
            },
        });
    }

    private sendServerMessage(message: ServerMessage) {
        this.connections.forEach((client) => {
            if (client.readyState === OPEN) {
                client.send(
                    JSON.stringify({ ...message, players: this.getPlayers() }),
                );
            }
        });
    }

    //#region Racetime Integration
    async connectRacetimeWebSocket() {
        this.racetimeHandler.connectWebsocket();
    }

    joinRacetimeRoom(
        token: string,
        racetimeId: string,
        authToken: RoomTokenPayload,
    ) {
        const identity = this.identities.get(authToken.uuid);
        if (!identity) {
            this.logWarn(
                'Unable to find an identity for a verified room token',
            );
            return false;
        }
        this.logInfo(`Connecting ${identity.nickname} to racetime`);
        this.identities.set(authToken.uuid, {
            ...identity,
            racetimeId: racetimeId,
        });
        return this.racetimeHandler.joinUser(token);
    }

    async refreshRacetimeHandler() {
        this.racetimeHandler.refresh();
    }

    readyPlayer(token: string, roomAuth: RoomTokenPayload) {
        const identity = this.identities.get(roomAuth.uuid);
        if (!identity) {
            this.logWarn(
                'Unable to find an identity for a verified room token',
            );
            return false;
        }
        this.logInfo(`Readying ${identity.nickname} to race`);
        return this.racetimeHandler.ready(token);
    }

    unreadyPlayer(token: string, roomAuth: RoomTokenPayload) {
        const identity = this.identities.get(roomAuth.uuid);
        if (!identity) {
            this.logWarn(
                'Unable to find an identity for a verified room token',
            );
            return false;
        }
        this.logInfo(`Readying ${identity.nickname} to race`);
        return this.racetimeHandler.unready(token);
    }
    //#endregion

    //#region Logging
    logInfo(message: string) {
        logInfo(`[${this.slug}] ${message}`);
    }

    logWarn(message: string) {
        logWarn(`[${this.slug}] ${message}`);
    }

    logError(message: string) {
        logError(`[${this.slug}] ${message}`);
    }
    //#endregion
}
