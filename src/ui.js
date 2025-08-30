import { h } from './vdom.js';
import { Controls } from './components/Controls.js';
import { Results } from './components/Results.js';

/**
 * Renders the entire application UI as a VDOM tree.
 * @param {object} state The current application state.
 * @param {object} actions An object containing all the action functions.
 * @param {Array} allGames An array of all available game configurations.
 * @returns {object} A virtual DOM node representing the entire app.
 */
export function renderApp(state, actions, allGames) {
    if (!state || !state.config) {
        // Render a loading state or an empty div if state is not ready
        return h('div', {}, []);
    }

    return h('div', { class: 'container py-4' }, [
        h('header', { class: 'pb-3 mb-4 border-bottom' }, [
            h('h1', { class: 'fs-4' }, ['ガチャシミュレーター'])
        ]),
        h('main', {}, [
            h('div', { class: 'row' }, [
                Controls({ state, actions, allGames }),
                Results({ state }),
            ])
        ]),
    ]);
}
