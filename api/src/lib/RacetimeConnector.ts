import { ConnectionService } from '@prisma/client';
import {
    racetimeClientId,
    racetimeClientSecret,
    racetimeHost,
} from '../Environment';
import { logWarn } from '../Logger';
import {
    getConnectionForUser,
    updateRefreshToken,
} from '../database/Connections';
import { RacetimeTokenResponse } from '../routes/oauth/redirect/Redirect';

interface RacetimeToken {
    accessToken: string;
    refreshToken: string;
    refreshAfter: number;
}

const authTokens = new Map<string, RacetimeToken>();

const refresh = async (user: string): Promise<RacetimeToken | undefined> => {
    const token = authTokens.get(user);
    if (!token) {
        logWarn(
            'Attempted to refresh a non-existent racetime token.' +
                'This is a no-op but may be indicative of a configuration issue.',
        );
        return;
    }

    const res = await fetch(`${racetimeHost}/o/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: racetimeClientId,
            client_secret: racetimeClientSecret,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
        }),
    });
    if (!res.ok) {
        logWarn(
            `Failed to refresh token for user with id ${user}. ` +
                'This probably indicates that they revoked the connection on racetime, ' +
                'or that racetime is experiencing issues.',
        );
        return;
    }

    const newTokenRes = (await res.json()) as RacetimeTokenResponse;
    const newToken = {
        accessToken: newTokenRes.access_token,
        refreshToken: newTokenRes.refresh_token,
        // refresh slightly more often than needed to account for network delay
        refreshAfter: Date.now() + newTokenRes.expires_in * 0.9,
    };
    authTokens.set(user, newToken);
    updateRefreshToken(
        user,
        ConnectionService.RACETIME,
        newToken.refreshToken,
    ).then();

    return newToken;
};

export const registerUser = (
    user: string,
    accessToken: string,
    refreshToken: string,
    refreshAfter: number,
) => {
    authTokens.set(user, { accessToken, refreshToken, refreshAfter });
};

export const registerAndRefreshUser = async (
    user: string,
    refreshToken: string,
) => {
    authTokens.set(user, { accessToken: '', refreshToken, refreshAfter: 0 });
    return refresh(user);
};

export const revoke = (user: string) => {
    authTokens.delete(user);
};

export const getAccessToken = async (
    user: string,
): Promise<string | undefined> => {
    let token = authTokens.get(user);
    if (!token) {
        const connection = await getConnectionForUser(
            user,
            ConnectionService.RACETIME,
        );
        if (!connection) {
            return;
        }
        if (!connection.refreshToken) {
            return;
        }
        token = await registerAndRefreshUser(user, connection.refreshToken);
        if (!token) {
            return;
        }
    }
    if (Date.now() > token.refreshAfter) {
        return (await refresh(user))?.accessToken;
    }
    return token.accessToken;
};
