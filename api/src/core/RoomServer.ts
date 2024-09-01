import { WebSocketServer } from 'ws';
import { invalidateToken, verifyRoomToken } from '../auth/RoomAuth';
import { RoomAction } from '../types/RoomAction';
import Room from './Room';
import 'http';
import { Session, SessionData } from 'express-session';
import { logWarn } from '../Logger';
import { getSession } from '../util/Session';

export const roomWebSocketServer: WebSocketServer = new WebSocketServer({
    noServer: true,
});

export const allRooms = new Map<string, Room>();

declare module 'http' {
    interface IncomingMessage {
        session: Session & Partial<SessionData>;
    }
}

roomWebSocketServer.on('connection', (ws, req) => {
    if (!req.url) {
        ws.send(JSON.stringify({ action: 'unauthorized' }));
        ws.close();
        return;
    }
    const segments = req.url.split('/');
    segments.shift(); // remove leading empty segment
    const [, slug] = segments;

    // create timeout for uninitialized connections
    const timeout = setTimeout(() => {
        ws.send(JSON.stringify({ action: 'unauthorized' }));
        ws.close();
    }, 1000);

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

    // security
    const sessionId = req.session.id;

    // handlers
    ws.on('message', async (message) => {
        const messageString = message.toString();

        if (messageString === 'ping') {
            ws.send('pong');
            // pingTimeout.refresh();
            return;
        }

        const action: RoomAction = JSON.parse(messageString);
        const payload = verifyRoomToken(action.authToken, slug);
        if (!payload) {
            ws.send(JSON.stringify({ action: 'unauthorized' }));
            return;
        }
        const room = allRooms.get(payload.roomSlug);
        if (!room) {
            ws.send(JSON.stringify({ action: 'unauthorized' }));
            return;
        }

        // authentication
        if (payload.sessionId) {
            if (payload.sessionId !== sessionId) {
                logWarn(
                    'Got a valid socket token with a session, but it does not match the initial request session',
                );
                ws.send(JSON.stringify({ action: 'unauthorized' }));
                invalidateToken(action.authToken);
                ws.close();
                return;
            }
            const session = await getSession(payload.sessionId);
            if (!session) {
                // session no longer exists, this isn't really a problem, but we
                // kill the socket connection anyway as a form of timeout. This
                // also allows revoking open connections for a user by
                // regenerating their session
                ws.send(JSON.stringify({ action: 'unauthorized' }));
                invalidateToken(action.authToken);
                ws.close();
                return;
            }
        }

        // join handling
        if (action.action === 'join') {
            clearTimeout(timeout);
            ws.send(JSON.stringify(room.handleJoin(action, payload, ws)));
        }

        switch (action.action) {
            case 'leave':
                ws.send(
                    JSON.stringify(
                        room.handleLeave(action, payload, action.authToken),
                    ),
                );
                ws.close();
                break;
            case 'mark':
                const markResult = room.handleMark(action, payload);
                if (markResult) {
                    ws.send(JSON.stringify(markResult));
                }
                break;
            case 'unmark':
                const unmarkResult = room.handleUnmark(action, payload);
                if (unmarkResult) {
                    ws.send(JSON.stringify(unmarkResult));
                }
                break;
            case 'chat':
                const chatResult = room.handleChat(action, payload);
                if (chatResult) {
                    ws.send(JSON.stringify(chatResult));
                }
                break;
            case 'changeColor':
                const changeColorResult = room.handleChangeColor(
                    action,
                    payload,
                );
                if (changeColorResult) {
                    ws.send(JSON.stringify(changeColorResult));
                }
                break;
            case 'newCard':
                room.handleNewCard(action);
                break;
        }
    });
    ws.on('close', () => {
        // cleanup
        // attempt to close the connection from the room, in case the connection
        // is closed unexpectedly without a leave message
        let found = false;
        allRooms.forEach((room) => {
            if (found) return;
            found = room.handleSocketClose(ws);
        });
    });
});
roomWebSocketServer.on('close', () => {
    // cleanup
});
