import { h } from '../vdom.js';
import { Input, InputGroup, Select } from './uiPrimitives.js';

/**
 * Renders the settings form for the "Custom" game type.
 * @param {object} state The application state.
 * @param {object} actions The application actions.
 * @returns {object|null} A VDOM node or null.
 */
export function CustomSettings({ state, actions }) {
    if (state.game !== 'custom') {
        return null; // Don't render anything if not in custom mode
    }

    return h('div', { id: 'custom-settings', class: 'mb-3' }, [
        h('hr', {}, []),
        h('h6', { class: 'mb-3' }, ['カスタム設定']),
        InputGroup({ id: 'custom-ssr-rate', label: 'SSR確率 (%):' }, [
            Input({ type: 'number', id: 'custom-ssr-rate', name: 'customSsrRate', value: state.customSsrRate, step: 0.1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-pu-rate', label: 'PU確率 (%):' }, [
            Input({ type: 'number', id: 'custom-pu-rate', name: 'customPuRate', value: state.customPuRate, step: 0.1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-sr-rate', label: 'SR確率 (%):' }, [
            Input({ type: 'number', id: 'custom-sr-rate', name: 'customSrRate', value: state.customSrRate, step: 0.1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-pity-count', label: '天井までの回数:' }, [
            Input({ type: 'number', id: 'custom-pity-count', name: 'customPityCount', value: state.customPityCount, step: 1, onchange: actions.updateCustomSetting })
        ]),
    ]);
}
