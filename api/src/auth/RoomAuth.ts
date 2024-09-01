import { sign, verify } from 'jsonwebtoken';
import Room from '../core/Room';
import { roomTokenSecret } from '../Environment';
import { randomUUID } from 'crypto';

export type RoomTokenPayload = {
    roomSlug: string;
    uuid: string;
    sessionId?: string;
};

const tokenStore: string[] = [];

export const createRoomToken = (room: Room, sessionId?: string) => {
    const payload: RoomTokenPayload = {
        roomSlug: room.slug,
        uuid: randomUUID(),
        sessionId,
    };
    const token = sign(payload, roomTokenSecret);
    tokenStore.push(token);
    return token;
};

export const invalidateToken = (token: string) => {
    tokenStore.splice(tokenStore.findIndex((t) => t === token));
};

export const verifyRoomToken = (
    token: string,
    room: string,
): RoomTokenPayload | false => {
    try {
        if (!tokenStore.includes(token)) {
            return false;
        }
        const payload = verify(token, roomTokenSecret) as RoomTokenPayload;
        if (payload.roomSlug !== room) {
            invalidateToken(token);
            return false;
        }
        return payload;
    } catch (e) {
        return false;
    }
};
