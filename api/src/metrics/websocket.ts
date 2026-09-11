import { Counter, Gauge, Histogram } from 'prom-client';
import { registry } from './metrics';

const totalConnections = new Counter({
    name: 'websocket_connections_total',
    help: 'Total number of websocket connections established',
    registers: [registry],
    labelNames: ['room'],
});

const activeConnections = new Gauge({
    name: 'websocket_connections_active',
    help: 'Total number of active websocket connections',
    registers: [registry],
    labelNames: ['room'],
});

const disconnectReasons = new Counter({
    name: 'websocket_disconnect_reasons',
    help: 'Number of websocket disconnects by reason code',
    registers: [registry],
    labelNames: ['room', 'code'],
});

const messageReceivedCounter = new Counter({
    name: 'websocket_messages_received',
    help: 'Number of websocket messages received',
    registers: [registry],
    labelNames: ['room', 'action'],
});

const messageSentCounter = new Counter({
    name: 'websocket_messages_sent',
    help: 'Number of websocket messages sent',
    registers: [registry],
    labelNames: ['room', 'message_type'],
});

const connectionDurationHistogram = new Histogram({
    name: 'websocket_connection_duration',
    help: 'Duration of websocket connections in seconds',
    registers: [registry],
    labelNames: ['room'],
    buckets: [
        60,
        60 * 5,
        60 * 15,
        60 * 30,
        60 * 60,
        60 * 60 * 2,
        60 * 60 * 3,
        60 * 60 * 5,
        60 * 60 * 6,
        60 * 60 * 8,
        60 * 60 * 12,
        60 * 60 * 24,
    ],
});

const messageProcessingDurationHistogram = new Histogram({
    name: 'websocket_message_processing_duration_seconds',
    help: 'Duration of websocket message processing in seconds',
    registers: [registry],
    labelNames: ['room', 'action'],
    buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const websocketOpened = (slug: string) => {
    activeConnections.labels(slug).inc();
    totalConnections.labels(slug).inc();
    return connectionDurationHistogram.startTimer({ room: slug });
};

export const websocketClosed = (
    slug: string,
    closeCode: number,
    stopTimer: ReturnType<typeof connectionDurationHistogram.startTimer>,
) => {
    activeConnections.labels(slug).dec();
    disconnectReasons.inc({ room: slug, code: closeCode.toString() });
    stopTimer({ room: slug });
};

export const messageReceived = (slug: string, action: string) => {
    messageReceivedCounter.inc({ room: slug, action });
    return messageProcessingDurationHistogram.startTimer({
        room: slug,
        action,
    });
};

export const messageSent = (slug: string, messageType: string) => {
    messageSentCounter.inc({ room: slug, message_type: messageType });
};
