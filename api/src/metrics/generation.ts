import { Counter, Histogram } from 'prom-client';
import { registry } from './metrics';

const cardsGenerated = new Counter({
    name: 'cards_generated_total',
    help: 'Total number of cards successfully generated',
    registers: [registry],
});

const cardGenerationDuration = new Histogram({
    name: 'card_generation_duration_seconds',
    help: 'Duration of card generation attempts in seconds',
    labelNames: ['status'],
    buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30, 60, 120],
    registers: [registry],
});

export const cardGenerationStarted = () => {
    const stopTimer = cardGenerationDuration.startTimer();

    return (successful: boolean) => {
        if (successful) {
            cardsGenerated.inc();
        }
        stopTimer({ status: successful ? 'success' : 'failure' });
    };
};
