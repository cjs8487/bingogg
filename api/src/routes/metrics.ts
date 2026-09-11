import { Router } from 'express';
import { Gauge } from 'prom-client';
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

// Insert any other metrics we might want

metricsRouter.get('/', async (_req, res) => {
    res.set('Content-Type', metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
});
