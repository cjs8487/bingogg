declare module 'better-sqlite3-session-store' {
    import Database from 'better-sqlite3';
    import { RequestHandler } from 'express';
    import { SessionOptions, Store } from 'express-session';

    declare class SqliteStore extends Store {
        constructor(options: {
            client: Database;
            expired: {
                clear: boolean;
                intervalMs: number;
            };
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export default (session: (opts: SessionOptions) => RequestHandler) =>
        SqliteStore;
}
