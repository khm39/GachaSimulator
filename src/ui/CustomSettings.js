import { h } from '../vdom.js';
import { Input, InputGroup, Select } from '../components/uiPrimitives.js';

function renderSettingInput(setting, state, onchange) {
    const { id, name, label, ...inputProps } = setting;
    return InputGroup({ id, label }, [
        Input({ id, name, value: state[name], onchange, ...inputProps })
    ]);
}

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

    const numberInputs = [
        { id: 'custom-ssr-rate', name: 'customSsrRate', label: 'SSR確率 (%):', type: 'number', step: 0.1 },
        { id: 'custom-pu-rate', name: 'customPuRate', label: 'PU確率 (%):', type: 'number', step: 1 },
        { id: 'custom-sr-rate', name: 'customSrRate', label: 'SR確率 (%):', type: 'number', step: 0.1 },
        { id: 'custom-pity-count', name: 'customPityCount', label: '天井までの回数:', type: 'number', step: 1 },
    ];

    const pityOptions = [
        { value: 'exchange', text: '交換ポイント', selected: state.customPityType === 'exchange' },
        { value: 'direct', text: '直接保証', selected: state.customPityType === 'direct' },
        { value: 'none', text: 'なし', selected: state.customPityType === 'none' },
    ];

    return h('div', { id: 'custom-settings', class: 'mb-3' }, [
        h('hr', {}, []),
        h('h6', { class: 'mb-3' }, ['カスタム設定']),
        ...numberInputs.map(setting => renderSettingInput(setting, state, actions.updateCustomSetting)),
        InputGroup({ id: 'custom-pity-type', label: '天井システム:' }, [
            Select({ id: 'custom-pity-type', name: 'customPityType', options: pityOptions, onchange: actions.updateCustomSetting })
        ]),
    ]);
}
