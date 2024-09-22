import Database, { Database as DB } from 'better-sqlite3';
import SqliteStore from 'better-sqlite3-session-store';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import { port, sessionSecret, testing } from './Environment';
import { logDebug, logger, logInfo } from './Logger';
import { allRooms, roomWebSocketServer } from './core/RoomServer';
import { disconnect } from './database/Database';
import api from './routes/api';

declare module 'express-session' {
    interface SessionData {
        user?: string;
    }
}

const app = express();

// configure session store
const sessionDb: DB = new Database('sessions.db');
const sessionStore = new (SqliteStore(session))({
    client: sessionDb,
    expired: {
        clear: true,
        intervalMs: 900000,
    },
});
app.use(
    session({
        store: sessionStore,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: !testing },
        proxy: !testing,
        unset: 'destroy',
    }),
);

// request logger
app.use((req, res, next) => {
    const profiler = logger.startTimer();
    const path = req.path;
    res.on('finish', () => {
        profiler.done({
            message: `${req.method} ${path} ${res.statusCode}`,
            method: req.method,
            path,
            sessionId: req.sessionID,
            userAgent: req.get('User-Agent') ?? '',
            ip: req.ip ?? '',
            statusCode: res.statusCode,
        });
    });
    next();
});

app.use(bodyParser.json());

app.use('/api', api);

const server = app.listen(port, () => {
    logInfo(`API application listening on port ${port}`);
});

server.on('upgrade', (req, socket, head) => {
    logInfo('[websocket] Client initiating protocol upgrade');
    if (!req.url) {
        socket.destroy();
        return;
    }
    const segments = req.url.split('/');
    segments.shift(); // remove leading empty segment
    if (segments.length < 2) {
        socket.destroy();
        return;
    }
    const [target, slug] = segments;
    if (target === 'socket') {
        const room = allRooms.get(slug);
        if (!room) {
            socket.destroy();
            return;
        }
        roomWebSocketServer.handleUpgrade(req, socket, head, (ws) => {
            roomWebSocketServer.emit('connection', ws, req);
            logInfo(`Successfully upgraded connection for ${slug}`);
        });
    } else {
        logInfo('[websocket] Unknown upgrade path');
        socket.destroy();
    }
});

const cleanup = async () => {
    logDebug('Server shutting down');
    await Promise.all([
        new Promise((resolve) => {
            roomWebSocketServer.close(() => {
                logDebug('Room WebSocket server closed');
                resolve(undefined);
            });
            logDebug('Closing open websocket connections');
            roomWebSocketServer.clients.forEach((client) => {
                client.close();
            });
        }),
        new Promise((resolve) => {
            server.close(() => {
                logDebug('HTTP server closed');
                resolve(undefined);
            });
            logDebug('Closing open server connections');
            server.closeAllConnections();
        }),
        new Promise(async (resolve) => {
            logDebug('Closing database connection');
            await disconnect();
            logDebug('Database connection closed');
            resolve(undefined);
        }),
        new Promise((resolve) => {
            logDebug('Closing session database connection');
            sessionDb.close();
            logDebug('Session database connection closed');
            resolve(undefined);
        }),
    ]);
    process.exit(0);
};

process.on('exit', () => {
    logInfo('API server shut down');
});

process.on('SIGHUP', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

process.once('SIGUSR2', cleanup);
