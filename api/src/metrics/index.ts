import * as http from './http';
import { registry } from './metrics';
import * as room from './room';
import * as websocket from './websocket';

export default {
    registry,
    http,
    room,
    websocket,
};
