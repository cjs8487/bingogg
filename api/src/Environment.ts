import 'dotenv/config';

export const port = process.env.PORT || 8000;
export const testing = !!process.env.TESTING;
export const roomTokenSecret = process.env.ROOM_TOKEN_SECRET || '';
export const sessionSecret = process.env.SESSION_SECRET || '';
export const clientUrl = process.env.CLIENT_URL ?? '';
export const smtpHost = process.env.SMTP_HOST ?? '';
export const smtpUser = process.env.SMTP_USER ?? '';
export const smtpPassword = process.env.SMTP_PASSWORD ?? '';
export const urlBase = process.env.URL_BASE ?? '';

//racetime integration
export const racetimeClientId = process.env.RT_CLIENT_ID ?? '';
export const racetimeClientSecret = process.env.RT_CLIENT_SECRET ?? '';
export const racetimeHost = process.env.RT_HOST ?? 'racetime.gg';
