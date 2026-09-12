import metrics from '../../metrics';

describe('generation metrics', () => {
    it('counts generated cards and observes successful generation time', async () => {
        const finishGeneration = metrics.generation.cardGenerationStarted();

        finishGeneration(true);
        const output = await metrics.registry.metrics();

        expect(output).toContain('cards_generated_total 1');
        expect(output).toContain(
            'card_generation_duration_seconds_count{status="success"} 1',
        );
    });

    it('times failed generation without counting a generated card', async () => {
        const finishGeneration = metrics.generation.cardGenerationStarted();

        finishGeneration(false);
        const output = await metrics.registry.metrics();

        expect(output).toContain('cards_generated_total 1');
        expect(output).toContain(
            'card_generation_duration_seconds_count{status="failure"} 1',
        );
    });
});
