import { h } from '../vdom.js';
import { Input, InputGroup, Select } from '../components/uiPrimitives.js';

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

    const pityOptions = [
        { value: 'exchange', text: '交換ポイント', selected: state.customPityType === 'exchange' },
        { value: 'direct', text: '直接保証', selected: state.customPityType === 'direct' },
        { value: 'none', text: 'なし', selected: state.customPityType === 'none' },
    ];

    return h('div', { id: 'custom-settings', class: 'mb-3' }, [
        h('hr', {}, []),
        h('h6', { class: 'mb-3' }, ['カスタム設定']),
        InputGroup({ id: 'custom-ssr-rate', label: 'SSR確率 (%):' }, [
            Input({ type: 'number', id: 'custom-ssr-rate', name: 'customSsrRate', value: state.customSsrRate, step: 0.1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-pu-rate', label: 'PU確率 (%):' }, [
            Input({ type: 'number', id: 'custom-pu-rate', name: 'customPuRate', value: state.customPuRate, step: 1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-sr-rate', label: 'SR確率 (%):' }, [
            Input({ type: 'number', id: 'custom-sr-rate', name: 'customSrRate', value: state.customSrRate, step: 0.1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-pity-type', label: '天井システム:' }, [
            Select({ id: 'custom-pity-type', name: 'customPityType', options: pityOptions, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-pity-count', label: '天井までの回数:' }, [
            Input({ type: 'number', id: 'custom-pity-count', name: 'customPityCount', value: state.customPityCount, step: 1, onchange: actions.updateCustomSetting })
        ]),
    ]);
}
