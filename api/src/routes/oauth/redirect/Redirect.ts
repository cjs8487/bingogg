import { Router } from 'express';
import {
    clientUrl,
    racetimeClientId,
    racetimeClientSecret,
    racetimeHost,
} from '../../../Environment';

interface RacetimeTokenResponse {
    access_token: string;
    expires_in: 36000;
    token_type: string;
    scope: string;
    refresh_token: string;
}

interface RacetimeTokenErrorResponse {
    error: string;
}

const redirect = Router();

redirect.get('/racetime', async (req, res) => {
    const code = req.query.code;
    if (typeof code !== 'string') {
        res.redirect(
            `${clientUrl}?type="error"&message=Unable to connect account.`,
        );
        return;
    }

    const tokenRes = await fetch(`${racetimeHost}/o/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: racetimeClientId,
            client_secret: racetimeClientSecret,
            grant_type: 'authorization_code',
            code,
        }),
    });
    if (!tokenRes.ok) {
        const data = (await tokenRes.json()) as RacetimeTokenErrorResponse;
        res.redirect(
            `${clientUrl}?type="error&message=Unable to connect account - ${data.error}}`,
        );
    }

    const data = (await tokenRes.json()) as RacetimeTokenResponse;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    res.sendStatus(200);
});

export default redirect;
