import * as generation from './generation';
import * as http from './http';
import { registry } from './metrics';
import * as room from './room';
import * as websocket from './websocket';

export default {
    registry,
    generation,
    http,
    room,
    websocket,
};
