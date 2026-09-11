import { RoomAction, ServerMessage } from '@playbingo/types';
import { WebSocketServer } from 'ws';
import {
    createRoomToken,
    hasPermission,
    verifyRoomToken,
} from '../auth/RoomAuth';
import { roomCleanupInterval } from '../Environment';
import { logInfo, logWarn } from '../Logger';
import Room from './Room';
import metrics from '../metrics';

export const roomWebSocketServer: WebSocketServer = new WebSocketServer({
    noServer: true,
});

export const allRooms = new Map<string, Room>();

const cleanupInterval = setInterval(() => {
    allRooms.forEach((room, key) => {
        if (room.canClose()) {
            room.close();
            allRooms.delete(key);
        }
    });
}, roomCleanupInterval);

roomWebSocketServer.on('connection', (ws, req) => {
    let isConnected = false;
    let isJoined = false;
    if (!req.url) {
        ws.send(JSON.stringify({ action: 'unauthorized' }));
        ws.close();
        return;
    }

    const segments = req.url.split('/');
    segments.shift(); // remove leading empty segment
    const [, slug] = segments;

    const room = allRooms.get(slug);
    if (!room) {
        metrics.websocket.messageSent(slug, 'unauthorized');
        ws.send(JSON.stringify({ action: 'unauthorized' }));
        ws.close();
        return;
    }

    const stopConnectiontimer = metrics.websocket.websocketOpened(slug);
    isConnected = true;

    const sendWsMessage = (
        message: ServerMessage | { action: string } | string,
    ) => {
        const action = typeof message === 'string' ? message : message.action;
        metrics.websocket.messageSent(slug, action);
        ws.send(
            typeof message === 'string' ? message : JSON.stringify(message),
        );
    };

    // create timeout for uninitialized connections
    const timeout = setTimeout(() => {
        sendWsMessage({ action: 'unauthorized' });
        ws.close();
    }, 60 * 1000);

    // const pingTimeout = setTimeout(
    //     () => {
    //         let found = false;
    //         allRooms.forEach((room) => {
    //             if (found) return;
    //             found = room.handleSocketClose(ws);
    //         });
    //         ws.close();
    //     },
    //     5 * 60 * 1000,
    // );

    // handlers
    ws.on('message', (message) => {
        const messageString = message.toString();

        if (messageString === 'ping') {
            metrics.websocket.messageReceived(slug, 'ping');
            sendWsMessage('pong');
            // pingTimeout.refresh();
            return;
        }

        const action: RoomAction = JSON.parse(messageString);
        const stopProcessingTimer = metrics.websocket.messageReceived(
            slug,
            action.action,
        );
        const payload = verifyRoomToken(action.authToken, slug);
        if (!payload) {
            sendWsMessage({ action: 'unauthorized' });
            stopProcessingTimer({ room: slug, action: action.action });
            return;
        }
        const room = allRooms.get(payload.roomSlug);
        if (!room) {
            sendWsMessage({ action: 'unauthorized' });
            stopProcessingTimer({ room: slug, action: action.action });
            return;
        }
        if (action.action === 'join') {
            clearTimeout(timeout);
            sendWsMessage(room.handleJoin(action, payload, ws));
        }

        // helpers
        if (!hasPermission(action.action, payload)) {
            sendWsMessage({ action: 'forbidden' });
            stopProcessingTimer({ room: slug, action: action.action });
            return;
        }

        switch (action.action) {
            case 'leave':
                sendWsMessage(
                    room.handleLeave(action, payload, action.authToken),
                );
                ws.close();
                break;
            case 'mark':
                const markResult = room.handleMark(action, payload);
                if (markResult) {
                    sendWsMessage(markResult);
                }
                break;
            case 'unmark':
                const unmarkResult = room.handleUnmark(action, payload);
                if (unmarkResult) {
                    sendWsMessage(unmarkResult);
                }
                break;
            case 'chat':
                const chatResult = room.handleChat(action, payload);
                if (chatResult) {
                    sendWsMessage(chatResult);
                }
                break;
            case 'changeColor':
                const changeColorResult = room.handleChangeColor(
                    action,
                    payload,
                );
                if (changeColorResult) {
                    sendWsMessage(changeColorResult);
                }
                break;
            case 'newCard':
                room.handleNewCard(action);
                break;
            case 'revealCard':
                room.handleRevealCard(payload);
                break;
            case 'changeAuth':
                const newToken = createRoomToken(
                    room,
                    {
                        isSpectating: action.payload.spectate,
                        isMonitor: payload.isMonitor,
                    },
                    payload.playerId.split(':')[1],
                    payload.userId,
                );
                const player = room.players.get(payload.playerId);
                if (player) {
                    player.spectator = action.payload.spectate;
                    player.sendMessage({
                        action: 'reauthenticate',
                        authToken: newToken,
                    });
                    if (player.spectator) {
                        player.markedGoals = 0n;
                        player.goalCount = 0;
                        room.sendChat(
                            `${player.nickname} is now spectating`,
                            new Date(),
                        );
                    } else {
                        room.sendChat(
                            `${player.nickname} is now playing`,
                            new Date(),
                        );
                    }
                }
                break;
            case 'startTimer':
                room.handleStartTimer();
                break;
            case 'changeRaceHandler':
                room.handleChangeRaceHandler(action);
                break;
            case 'resetTimer':
                room.handleResetTimer();
                break;
            case 'setChatEnabled':
                room.handleSetChatEnabled(action);
                break;
        }
        stopProcessingTimer({ room: slug, action: action.action });
    });
    ws.on('close', (code, reason) => {
        // cleanup
        // attempt to close the connection from the room, in case the connection
        // is closed unexpectedly without a leave message
        logInfo(
            `[ws] Socket connection closed - ${code} - ${reason.toString()}`,
        );
        let found = false;
        allRooms.forEach((room) => {
            if (found) return;
            found = room.handleSocketClose(ws);
        });
        if (!found) {
            logWarn(
                'Received a close frame for a websocket connection, but there was no matching socket associated with a room',
            );
        }
        if (isConnected) {
            metrics.websocket.websocketClosed(slug, code, stopConnectiontimer);
        }
    });
});

roomWebSocketServer.on('close', () => {
    // cleanup
    clearInterval(cleanupInterval);
});
