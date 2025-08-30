import { h } from '../vdom.js';
import { Controls } from './Controls.js';
import { Results } from './Results.js';

const AppHeader = () => h('header', { class: 'pb-3 mb-4 border-bottom' }, [
    h('h1', { class: 'fs-4' }, ['ガチャシミュレーター'])
]);

const AppFooter = () => h('footer', { class: 'pt-3 mt-4 text-muted border-top' }, [
    h('p', { class: 'small' }, ['このシミュレーターは、公開されている確率に基づいていますが、あくまでシミュレーションであり、実際の結果を保証するものではありません。また、確率の正確性についても責任を負いません。'])
]);

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
        AppHeader(),
        h('main', {}, [
            h('div', { class: 'row' }, [
                Controls({ state, actions, allGames }),
                Results({ state }),
            ])
        ]),
        AppFooter()
    ]);
}
