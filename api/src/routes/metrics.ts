import { Router } from 'express';
import { allRooms } from '../core/RoomServer';
import metrics from '../metrics';

export const metricsRouter = Router();
export const roomCounter = metrics.room.roomsTotal;

metricsRouter.get('/', async (_req, res) => {
    metrics.room.observeRooms(allRooms.values());
    res.set('Content-Type', metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
});
