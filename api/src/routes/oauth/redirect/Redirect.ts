import { Router } from 'express';
import {
    clientUrl,
    racetimeClientId,
    racetimeClientSecret,
    racetimeHost,
} from '../../../Environment';
import { getAccessToken, registerUser } from '../../../lib/RacetimeConnector';
import { createRacetimeConnection } from '../../../database/Connections';

export interface RacetimeTokenResponse {
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
    const { user } = req.session;
    if (!user) {
        res.redirect(
            `${clientUrl}?type=error&message=Unable to connect account`,
        );
        return;
    }

    const code = req.query.code;
    if (typeof code !== 'string') {
        res.redirect(
            `${clientUrl}?type=error&message=Unable to connect account.`,
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
            `${clientUrl}?type=error&message=Unable to connect account - ${data.error}}`,
        );
    }

    const data = (await tokenRes.json()) as RacetimeTokenResponse;

    registerUser(user, data.access_token, data.refresh_token, data.expires_in);
    const token = await getAccessToken(user);

    const userRes = await fetch(`${racetimeHost}/o/userinfo`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
        res.redirect(
            `${clientUrl}?type=error&message=Unable to connect account`,
        );
        return;
    }
    const userData = (await userRes.json()) as {
        id: string;
        full_name: string;
    };

    createRacetimeConnection(user, userData.id, data.refresh_token);

    res.redirect(
        `${clientUrl}?type=success&message=Successfully connected to racetime.gg user ${userData.full_name}`,
    );
});

export default redirect;
