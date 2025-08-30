import { h, createElement, updateElement } from '../src/vdom.js';
import { assert, test } from './assert.js';

// --- Test Suite for h() ---
test('h() should create a basic VNode', () => {
    const vnode = h('div', { id: 'foo' }, ['Hello']);
    assert.deepEqual(vnode, {
        tag: 'div',
        props: { id: 'foo' },
        children: [{
            tag: 'TEXT_NODE',
            props: {},
            children: ['Hello'],
            key: null
        }],
        key: undefined
    });
});

test('h() should handle null and undefined children', () => {
    const vnode = h('ul', {}, [
        h('li', {}, ['Item 1']),
        null,
        h('li', {}, ['Item 2']),
        undefined,
        h('li', {}, ['Item 3'])
    ]);
    assert.equal(vnode.children.length, 3, 'Null and undefined children should be filtered out');
});

test('h() should flatten children arrays', () => {
    const items = [h('li', {}, ['Item 1']), h('li', {}, ['Item 2'])];
    const vnode = h('ul', {}, [items]);
    assert.equal(vnode.children.length, 2, 'Should flatten nested child arrays');
    assert.equal(vnode.children[0].tag, 'li');
});

test('h() should correctly assign a key', () => {
    const vnode = h('div', { key: 'my-key' });
    assert.equal(vnode.key, 'my-key', 'Key should be extracted from props');
    assert.deepEqual(vnode.props, {}, 'Key should be removed from props object');
});

// --- Test Suite for createElement() ---
test('createElement() should create a simple DOM element', () => {
    const vnode = h('div', { id: 'test' }, ['Hello World']);
    const el = createElement(vnode);
    assert.equal(el.outerHTML, '<div id="test">Hello World</div>');
});

test('createElement() should create nested DOM elements', () => {
    const vnode = h('div', {}, [h('span', {}, ['Nested'])]);
    const el = createElement(vnode);
    assert.equal(el.outerHTML, '<div><span>Nested</span></div>');
});

test('createElement() should handle text nodes correctly', () => {
    const vnode = h('p', {}, ['This is a test.']);
    const el = createElement(vnode);
    assert.equal(el.childNodes[0].nodeType, 3, 'Should create a text node (nodeType 3)');
});


// --- Test Suite for updateElement() ---

// Helper to set up a DOM environment for a test
function setupTestDOM(vnode) {
    const container = document.getElementById('test-container');
    container.innerHTML = ''; // Clear previous test content
    const el = createElement(vnode);
    container.appendChild(el);
    return { container, el };
}

test('updateElement() should replace a node if tags are different', () => {
    const oldVNode = h('div', { key: 'a' }, ['Old']);
    const newVNode = h('span', { key: 'a' }, ['New']);
    const { container } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(container.innerHTML, '<span>New</span>', 'Node should be replaced with a span');
});

test('updateElement() should update props on the same node', () => {
    const oldVNode = h('div', { key: 'a', id: 'old-id', class: 'c1' });
    const newVNode = h('div', { key: 'a', id: 'new-id', 'data-foo': 'bar' });
    const { container } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(container.innerHTML, '<div id="new-id" data-foo="bar"></div>');
});

test('updateElement() should update text content of a text node', () => {
    const oldVNode = h('p', { key: 'a' }, ['Old text']);
    const newVNode = h('p', { key: 'a' }, ['New text']);
    const { container } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(container.innerHTML, '<p>New text</p>');
});

test('updateElement() should add new child nodes (append)', () => {
    const oldVNode = h('div', { key: 'parent' }, [
        h('p', { key: '1' }, ['A'])
    ]);
    const newVNode = h('div', { key: 'parent' }, [
        h('p', { key: '1' }, ['A']),
        h('p', { key: '2' }, ['B'])
    ]);
    const { container } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(container.innerHTML, '<div><p>A</p><p>B</p></div>');
});

test('updateElement() should remove old child nodes (from end)', () => {
    const oldVNode = h('div', { key: 'parent' }, [
        h('p', { key: '1' }, ['A']),
        h('p', { key: '2' }, ['B'])
    ]);
    const newVNode = h('div', { key: 'parent' }, [
        h('p', { key: '1' }, ['A'])
    ]);
    const { container } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(container.innerHTML, '<div><p>A</p></div>');
});

test('updateElement() should reorder child nodes', () => {
    const oldVNode = h('div', { key: 'parent' }, [
        h('p', { key: '1' }, ['A']),
        h('p', { key: '2' }, ['B']),
        h('p', { key: '3' }, ['C'])
    ]);
    const newVNode = h('div', { key: 'parent' }, [
        h('p', { key: '3' }, ['C']),
        h('p', { key: '1' }, ['A']),
        h('p', { key: '2' }, ['B'])
    ]);
    const { container } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(container.innerHTML, '<div><p>C</p><p>A</p><p>B</p></div>');
});
