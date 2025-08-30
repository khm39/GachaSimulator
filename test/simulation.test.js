import { assert, test } from './assert.js';
import { calculateCurrentSsrRate, unifiedDraw } from '../src/games/common.js';

// --- Test Suite for calculateCurrentSsrRate ---

test('calculateCurrentSsrRate: should return base SSR rate', () => {
    const state = { pityCount: 0 };
    const config = { ssrRate: 0.01 };
    const rate = calculateCurrentSsrRate(state, config);
    assert.equal(rate, 0.01, 'Should return the base SSR rate when pity is low');
});

test('calculateCurrentSsrRate: should apply rate steps correctly', () => {
    const state = { pityCount: 75 };
    const config = {
        ssrRate: 0.01,
        rateSteps: [
            { after: 74, ssrRate: 0.5 },
            { after: 76, ssrRate: 0.8 }
        ]
    };
    const rate = calculateCurrentSsrRate(state, config);
    assert.equal(rate, 0.5, 'Should use the rate from the step if pity count is >= step.after');
});

test('calculateCurrentSsrRate: should apply the last applicable rate step', () => {
    const state = { pityCount: 77 };
    const config = {
        ssrRate: 0.01,
        rateSteps: [
            { after: 74, ssrRate: 0.5 },
            { after: 76, ssrRate: 0.8 }
        ]
    };
    const rate = calculateCurrentSsrRate(state, config);
    assert.equal(rate, 0.8, 'Should use the last and highest applicable rate step');
});

test('calculateCurrentSsrRate: should return 1.0 at hard pity', () => {
    const state = { pityCount: 90 };
    const config = { ssrRate: 0.01, pity: 90 };
    const rate = calculateCurrentSsrRate(state, config);
    assert.equal(rate, 1.0, 'Rate should be 1.0 when pity count reaches the hard pity limit');
});

test('calculateCurrentSsrRate: should prioritize hard pity over rate steps', () => {
    const state = { pityCount: 100 };
    const config = {
        ssrRate: 0.01,
        pity: 100,
        rateSteps: [{ after: 99, ssrRate: 0.5 }]
    };
    const rate = calculateCurrentSsrRate(state, config);
    assert.equal(rate, 1.0, 'Hard pity should take precedence over any other rate modifications');
});

test('calculateCurrentSsrRate: should handle additive soft pity', () => {
    const state = { pityCount: 52 };
    const config = {
        ssrRate: 0.01,
        softPity: { start: 51, factor: 0.02, type: 'additive' }
    };
    // Base (0.01) + (52 - (51 - 1)) * 0.02 = 0.01 + 2 * 0.02 = 0.05
    const rate = calculateCurrentSsrRate(state, config);
    // Use a small epsilon for float comparison
    assert.isTrue(Math.abs(rate - 0.05) < 0.0001, 'Should correctly calculate additive soft pity');
});

// --- Test Suite for unifiedDraw ---

// Helper to mock Math.random
function withMockedRandom(values, fn) {
    const originalRandom = Math.random;
    let i = 0;
    Math.random = () => {
        if (i < values.length) {
            return values[i++];
        }
        return originalRandom(); // Fallback to original if we run out of mock values
    };
    try {
        fn();
    } finally {
        Math.random = originalRandom; // Restore original function
    }
}

test('unifiedDraw: should return an R rarity item', () => {
    withMockedRandom([0.9], () => {
        const state = { pityCount: 0 };
        const config = { ssrRate: 0.01, srRate: 0.05 };
        const result = unifiedDraw(state, config);
        assert.deepEqual(result, { rarity: 'R' });
    });
});

test('unifiedDraw: should return an SR rarity item', () => {
    withMockedRandom([0.02], () => { // 0.01 (SSR) < 0.02 < 0.06 (SSR+SR)
        const state = { pityCount: 0 };
        const config = { ssrRate: 0.01, srRate: 0.05 };
        const result = unifiedDraw(state, config);
        assert.deepEqual(result, { rarity: 'SR' });
    });
});

test('unifiedDraw: should return a non-PU SSR and set guarantee', () => {
    // First random for the main draw (SSR), second for the 50/50 (fail)
    withMockedRandom([0.005, 0.6], () => {
        const state = { pityCount: 0, isGuaranteedPu: false };
        const config = { ssrRate: 0.01, srRate: 0.05, puRate: 0.5 };
        const result = unifiedDraw(state, config);
        assert.deepEqual(result, { rarity: 'SSR', isPu: false, guaranteed: false });
        assert.isTrue(state.isGuaranteedPu, 'isGuaranteedPu should be true after losing 50/50');
        assert.equal(state.pityCount, 0, 'Pity should reset after getting an SSR');
    });
});

test('unifiedDraw: should return a PU SSR when 50/50 is won', () => {
    // First random for main draw (SSR), second for 50/50 (win)
    withMockedRandom([0.005, 0.4], () => {
        const state = { pityCount: 0, isGuaranteedPu: false };
        const config = { ssrRate: 0.01, srRate: 0.05, puRate: 0.5 };
        const result = unifiedDraw(state, config);
        assert.deepEqual(result, { rarity: 'SSR', isPu: true, guaranteed: false });
        assert.isTrue(!state.isGuaranteedPu, 'isGuaranteedPu should be false after winning 50/50');
    });
});

test('unifiedDraw: should return a guaranteed PU SSR', () => {
    // Only one random needed, since the 50/50 is guaranteed to be won
    withMockedRandom([0.005], () => {
        const state = { pityCount: 10, isGuaranteedPu: true };
        const config = { ssrRate: 0.01, srRate: 0.05, puRate: 0.5 };
        const result = unifiedDraw(state, config);
        assert.deepEqual(result, { rarity: 'SSR', isPu: true, guaranteed: false });
        assert.isTrue(!state.isGuaranteedPu, 'isGuaranteedPu should be reset after using the guarantee');
    });
});

test('unifiedDraw: should return a guaranteed SSR at hard pity', () => {
    withMockedRandom([0.99], () => { // This random value would normally be an 'R'
        const state = { pityCount: 89, isGuaranteedPu: false };
        const config = { ssrRate: 0.01, srRate: 0.05, pity: 90, puRate: 0.5 };
        // The draw will increment pityCount to 90, triggering hard pity
        const result = unifiedDraw(state, config);
        assert.deepEqual(result, { rarity: 'SSR', isPu: true, guaranteed: true });
        assert.equal(state.pityCount, 0, 'Pity should reset after hard pity SSR');
    });
});

test('unifiedDraw: should increment pity count', () => {
    withMockedRandom([0.9], () => {
        const state = { pityCount: 5 };
        const config = { ssrRate: 0.01, srRate: 0.05 };
        unifiedDraw(state, config);
        assert.equal(state.pityCount, 6);
    });
});
