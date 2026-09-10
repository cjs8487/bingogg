import { collectDefaultMetrics, Registry } from 'prom-client';

export const registry = new Registry();

collectDefaultMetrics({ register: registry });
