import Database, { Database as DB } from 'better-sqlite3';
import SqliteStore from 'better-sqlite3-session-store';
import session, { SessionData } from 'express-session';

// configure session store
const sessionDb: DB = new Database('sessions.db');
export const sessionStore = new (SqliteStore(session))({
    client: sessionDb,
    expired: {
        clear: true,
        intervalMs: 900000,
    },
});

export const getSession = (
    sid: string,
): Promise<SessionData | null | undefined> => {
    return new Promise((resolve, reject) => {
        sessionStore.get(sid, (err, ses) => {
            if (err) {
                reject(err);
            } else {
                resolve(ses);
            }
        });
    });
};

export const closeSessionDatabase = () => {
    sessionDb.close();
};
