import { Goal } from '@prisma/client';
import { OPEN, WebSocket } from 'ws';
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
import { logError } from '../Logger';

type RoomIdentity = {
    nickname: string;
    color: string;
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

    constructor(
        name: string,
        game: string,
        gameSlug: string,
        slug: string,
        password: string,
        id: string,
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

        this.board = {
            board: [],
        };
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
            });
        });
        return players;
    }

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

    private sendServerMessage(message: ServerMessage) {
        this.connections.forEach((client) => {
            if (client.readyState === OPEN) {
                client.send(
                    JSON.stringify({ ...message, players: this.getPlayers() }),
                );
            }
        });
    }
}
