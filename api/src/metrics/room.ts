import { Gauge } from 'prom-client';
import type Room from '../core/Room';
import { getModeString } from '../util/RoomUtils';
import { registry } from './metrics';

export const roomsTotal = new Gauge({
    name: 'rooms_total',
    help: 'Current number of active rooms',
    registers: [registry],
});

const roomInfo = new Gauge({
    name: 'room_info',
    help: 'Information about an active room',
    labelNames: [
        'room',
        'game',
        'mode',
        'variant',
        'generator',
        'race_handler',
        'exploration',
        'hidden_card',
    ],
    registers: [registry],
});

const roomPlayers = new Gauge({
    name: 'room_players',
    help: 'Number of players associated with an active room',
    labelNames: ['room', 'role'],
    registers: [registry],
});

const roomPlayersConnected = new Gauge({
    name: 'room_players_connected',
    help: 'Number of players currently connected to an active room',
    labelNames: ['room', 'role'],
    registers: [registry],
});

const roomCompleted = new Gauge({
    name: 'room_completed',
    help: 'Whether an active room is complete',
    labelNames: ['room'],
    registers: [registry],
});

const roomSecondsSinceActivity = new Gauge({
    name: 'room_seconds_since_activity',
    help: 'Seconds since the last activity in an active room',
    labelNames: ['room'],
    registers: [registry],
});

/**
 * Refreshes metrics that describe the current set of rooms. All labeled gauges
 * are reset first so rooms that have closed since the previous scrape do not
 * remain exposed as stale time series.
 */
export const observeRooms = (rooms: Iterable<Room>) => {
    roomInfo.reset();
    roomPlayers.reset();
    roomPlayersConnected.reset();
    roomCompleted.reset();
    roomSecondsSinceActivity.reset();

    const activeRooms = Array.from(rooms);
    roomsTotal.set(activeRooms.length);

    activeRooms.forEach((room) => {
        roomInfo.set(
            {
                room: room.slug,
                game: room.gameSlug,
                mode: getModeString(room.bingoMode, room.lineCount),
                variant: room.variantName,
                generator: room.newGenerator ? 'new' : 'legacy',
                race_handler: room.raceHandler.key(),
                exploration: room.exploration.toString(),
                hidden_card: room.hideCard.toString(),
            },
            1,
        );

        const players = {
            player: 0,
            spectator: 0,
        };
        const connectedPlayers = {
            player: 0,
            spectator: 0,
        };

        room.players.forEach((player) => {
            const role = player.spectator ? 'spectator' : 'player';
            players[role]++;
            if (player.hasConnections()) {
                connectedPlayers[role]++;
            }
        });

        (['player', 'spectator'] as const).forEach((role) => {
            roomPlayers.set({ room: room.slug, role }, players[role]);
            roomPlayersConnected.set(
                { room: room.slug, role },
                connectedPlayers[role],
            );
        });

        roomCompleted.set({ room: room.slug }, room.completed ? 1 : 0);
        roomSecondsSinceActivity.set(
            { room: room.slug },
            Math.max(0, (Date.now() - room.lastMessage) / 1000),
        );
    });
};
