import { Router } from 'express';
import { Gauge, Registry } from 'prom-client';
import { allRooms } from '../core/RoomServer';
import metrics from '../metrics';

export const metricsRouter = Router();

export const roomCounter = new Gauge({
    name: 'rooms_total',
    help: 'Total number of rooms',
    registers: [metrics.registry],
    collect() {
        this.set(allRooms.size);
    },
});

export const connectionCounter = new Gauge({
    name: 'connections_total',
    help: 'Total number of active websocket connections',
    registers: [metrics.registry],
    labelNames: ['room'],
    collect() {
        allRooms.forEach((room) => {
            this.labels(room.slug).set(
                room.players
                    .values()
                    .reduce((sum, player) => sum + player.connections.size, 0),
            );
        });
    },
});

// Insert any other metrics we might want

metricsRouter.get('/', async (_req, res) => {
    res.set('Content-Type', metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
});
