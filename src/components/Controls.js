import { h } from '../vdom.js';
import { Col, Card, CardHeader, CardBody, Select, Button } from './uiPrimitives.js';
import { CustomSettings } from './CustomSettings.js';
import { Status } from './Status.js';

/**
 * Renders the main controls and settings panel.
 * @param {object} state The application state.
 * @param {object} actions The application actions.
 * @param {Array} allGames An array of all available game configurations.
 * @returns {object} A VDOM node.
 */
export function Controls({ state, actions, allGames }) {
    const { game } = state;

    const gameOptions = allGames.map(g => ({
        value: g.id,
        // Generate a user-friendly name from the ID, e.g., "game_a" -> "Game A"
        text: g.name || g.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        selected: g.id === game,
    }));

    return Col({ size: 4 }, [
        Card({}, [
            // Collapsible Header
            h('div', {
                class: 'card-header',
                'data-bs-toggle': 'collapse',
                'data-bs-target': '#settings-collapse',
                'aria-expanded': 'true',
                'aria-controls': 'settings-collapse'
            }, ['シミュレーション設定']),

            // Collapsible Body
            h('div', { id: 'settings-collapse', class: 'collapse show' }, [
                CardBody({}, [
                    h('div', { class: 'mb-3' }, [
                        h('label', { for: 'game-select', class: 'form-label' }, ['ゲームを選択:']),
                        Select({ id: 'game-select', name: 'game', options: gameOptions, onchange: actions.selectGame }),
                    ]),
                    // Use the CustomSettings component
                    CustomSettings({ state, actions }),
                    h('div', { class: 'd-grid gap-2 mb-3' }, [
                        Button({ color: 'primary', text: '1回引く', onclick: actions.draw1 }),
                        Button({ color: 'success', text: '10回引く', onclick: actions.draw10 }),
                        Button({ color: 'danger', text: 'リセット', onclick: actions.reset }),
                    ]),
                ]),
            ])
        ]),
        // Use the Status component
        Status({ state }),
    ]);
}
