import { BingoMode } from '@prisma/client';
import type Player from '../../core/Player';
import type Room from '../../core/Room';
import metrics from '../../metrics';

const player = (spectator: boolean, connected: boolean) =>
    ({
        spectator,
        hasConnections: () => connected,
    }) as Player;

const room = (slug: string, players: Player[], overrides: Partial<Room> = {}) =>
    ({
        slug,
        gameSlug: 'test-game',
        bingoMode: BingoMode.LINES,
        lineCount: 1,
        variantName: 'Normal',
        newGenerator: true,
        raceHandler: { key: () => 'local' },
        exploration: false,
        hideCard: false,
        completed: false,
        lastMessage: Date.now(),
        players: new Map(players.map((value, index) => [`${index}`, value])),
        ...overrides,
    }) as Room;

describe('room metrics', () => {
    it('observes active room configuration and player state', async () => {
        const activeRoom = room('active-room', [
            player(false, true),
            player(false, false),
            player(true, true),
        ]);

        metrics.room.observeRooms([activeRoom]);
        const output = await metrics.registry.metrics();

        expect(output).toContain('rooms_total 1');
        expect(output).toContain(
            'room_info{room="active-room",game="test-game",mode="Single Bingo",variant="Normal",generator="new",race_handler="local",exploration="false",hidden_card="false"} 1',
        );
        expect(output).toContain(
            'room_players{room="active-room",role="player"} 2',
        );
        expect(output).toContain(
            'room_players{room="active-room",role="spectator"} 1',
        );
        expect(output).toContain(
            'room_players_connected{room="active-room",role="player"} 1',
        );
        expect(output).toContain(
            'room_players_connected{room="active-room",role="spectator"} 1',
        );
        expect(output).toContain('room_completed{room="active-room"} 0');
        expect(output).toMatch(
            /room_seconds_since_activity\{room="active-room"\} \d+(?:\.\d+)?/,
        );
    });

    it('removes closed rooms from labeled gauges', async () => {
        metrics.room.observeRooms([room('closed-room', [])]);
        metrics.room.observeRooms([]);
        const output = await metrics.registry.metrics();

        expect(output).toContain('rooms_total 0');
        expect(output).not.toContain('room="closed-room"');
    });
});
