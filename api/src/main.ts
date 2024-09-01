import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import session from 'express-session';
import { port, sessionSecret, testing } from './Environment';
import { logDebug, logInfo } from './Logger';
import { allRooms, roomWebSocketServer } from './core/RoomServer';
import { disconnect } from './database/Database';
import api from './routes/api';
import { closeSessionDatabase, sessionStore } from './util/Session';

declare module 'express-session' {
    interface SessionData {
        loggedIn: boolean;
        user?: string;
    }
}

const app = express();

const sessionParser = session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !testing },
    proxy: !testing,
    unset: 'destroy',
});

app.use(sessionParser);

app.use((req, res, next) => {
    if (req.session.loggedIn === undefined) {
        req.session.loggedIn = false;
    }
    next();
});

app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', clientUrl);
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    // res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use(bodyParser.json());

app.use('/api', api);

const server = app.listen(port, () => {
    logInfo(`API application listening on port ${port}`);
});

server.on('upgrade', (req, socket, head) => {
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
            return;
        }
        sessionParser(req as unknown as Request, {} as Response, () => {
            roomWebSocketServer.handleUpgrade(req, socket, head, (ws) => {
                roomWebSocketServer.emit('connection', ws, req);
            });
        });
    } else {
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
            closeSessionDatabase();
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
