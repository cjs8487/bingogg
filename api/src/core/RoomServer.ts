import { WebSocketServer } from 'ws';
import { verifyRoomToken } from '../auth/RoomAuth';
import { RoomAction } from '../types/RoomAction';
import Room from './Room';
import { logger } from 'Logger';

export const roomWebSocketServer: WebSocketServer = new WebSocketServer({
    noServer: true,
});

export const allRooms = new Map<string, Room>();

roomWebSocketServer.on('connection', (ws, req) => {
    if (!req.url) {
        ws.send(JSON.stringify({ action: 'unauthorized' }));
        ws.close();
        return;
    }
    const segments = req.url.split('/');
    segments.shift(); // remove leading empty segment
    const [, slug] = segments;

    const timeout = setTimeout(() => {
        ws.send(JSON.stringify({ action: 'unauthorized' }));
        ws.close();
    }, 1000);

    ws.on('message', async (message) => {
        const messageString = message.toString();

        if (messageString === 'ping') {
            ws.send('pong');
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
        if (action.action === 'join') {
            clearTimeout(timeout);
            ws.send(JSON.stringify(room.handleJoin(action, payload, ws)));
        }

        switch (action.action) {
            case 'leave':
                ws.send(JSON.stringify(room.handleLeave(action, payload, action.authToken)));
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
                const changeColorResult = room.handleChangeColor(action, payload);
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
        let found = false;
        allRooms.forEach((room) => {
            if (found) return;
            found = room.handleSocketClose(ws);
        });
    });
});

roomWebSocketServer.on('close', () => {
    // Cleanup
});

const checkInactiveRooms = async () => {
    allRooms.forEach(async (room) => {
        // probably better to do this in batches in the future, but for now it's fine
        if (room.shouldSetInactive()) {
            room.handleInactive();
        }
    });
};

setInterval(() => {
    checkInactiveRooms().catch((e) => {
        logger.error('Error checking inactive rooms', e);
    });
}, 10 * 60 * 1000); // Check every 10 minutes
