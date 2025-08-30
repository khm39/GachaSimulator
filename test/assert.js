export const assert = {
    equal(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Assertion failed: ${actual} !== ${expected}`);
        }
    },

    deepEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(message || `Assertion failed: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
        }
    },

    isTrue(value, message) {
        if (value !== true) {
            throw new Error(message || `Assertion failed: expected true, but got ${value}`);
        }
    }
};

export function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (e) {
        console.error(`❌ ${name}`);
        console.error(e);
    }
}
