import { Request, Response } from 'express';
import { Counter, Gauge, Histogram } from 'prom-client';
import { registry } from './metrics';

const requestDurationHistogram = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
});

const requestSizeHistogram = new Histogram({
    name: 'http_request_body_size',
    help: 'Size of HTTP request body in bytes',
    buckets: [
        1,
        10,
        100,
        512,
        1024,
        1024 * 5,
        1024 * 10,
        1024 * 100,
        1024 * 1024,
        1024 * 1024 * 5,
    ],
    labelNames: ['method'],
    registers: [registry],
});

const responseSizeHistogram = new Histogram({
    name: 'http_response_size',
    help: 'Size of HTTP response body in bytes',
    buckets: [
        1,
        10,
        100,
        512,
        1024,
        1024 * 5,
        1024 * 10,
        1024 * 100,
        1024 * 1024,
        1024 * 1024 * 5,
    ],
    labelNames: ['method'],
    registers: [registry],
});

const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
});

const httpActiveRequests = new Gauge({
    name: 'http_requests_active',
    help: 'Total number of active HTTP requests',
    registers: [registry],
});

export const observeRequest = (req: Request, res: Response) => {
    httpActiveRequests.inc();
    const route = req.route ? req.route.path : req.path;
    const method = req.method;

    const stopTimer = requestDurationHistogram.startTimer();
    const contentLength = req.get('Content-Length');
    if (contentLength) {
        requestSizeHistogram.observe(
            { method: req.method },
            parseInt(contentLength, 10),
        );
    }
    res.on('finish', () => {
        stopTimer({
            route,
            method,
            status_code: res.statusCode,
        });
        httpActiveRequests.dec();
        httpRequestCounter.inc({
            route,
            method,
            status_code: res.statusCode,
        });
        const contentLength = res.get('Content-Length');
        if (contentLength) {
            responseSizeHistogram.observe(
                { method: req.method },
                parseInt(contentLength, 10),
            );
        }
    });
};
