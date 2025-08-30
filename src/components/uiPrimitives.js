import { h } from '../vdom.js';

export const Col = (props, children) => h('div', { ...props, class: (`col-md-${props.size} mb-4 ` + (props.class || '')).trim() }, children);
export const Card = (props, children) => h('div', { ...props, class: ('card ' + (props.class || '')).trim() }, children);
export const CardBody = (props, children) => h('div', { ...props, class: ('card-body ' + (props.class || '')).trim() }, children);

export const Select = (props) => h('select', {
    class: 'form-select',
    id: props.id,
    name: props.name,
    onchange: props.onchange,
}, props.options.map(opt => h('option', { value: opt.value, selected: opt.selected }, [opt.text])));

export const Button = (props) => h('button', { class: `btn btn-${props.color}`, onclick: props.onclick }, [props.text]);

export const Input = (props) => h('input', {
    type: props.type,
    class: 'form-control',
    id: props.id,
    name: props.name,
    value: props.value,
    step: props.step,
    onchange: props.onchange,
});

export const InputGroup = (props, children) => h('div', { class: 'mb-2' }, [
    h('label', { for: props.id, class: 'form-label' }, [props.label]),
    ...children
]);
