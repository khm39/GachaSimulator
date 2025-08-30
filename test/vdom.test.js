import { h, createElement, updateElement } from '../src/js/vdom.js';
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

    assert.equal(el.tagName, 'DIV', 'Should create an element with the correct tag');
    assert.equal(el.id, 'test', 'Should set attributes correctly');
    assert.equal(el.textContent, 'Hello World', 'Should create text nodes correctly');
});

test('createElement() should create nested DOM elements', () => {
    const vnode = h('div', {}, [h('span', {}, ['Nested'])]);
    const el = createElement(vnode);

    assert.equal(el.children.length, 1, 'Should create child elements');
    assert.equal(el.children[0].tagName, 'SPAN', 'Child element should have the correct tag');
    assert.equal(el.children[0].textContent, 'Nested', 'Child element should have correct content');
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

    assert.equal(container.children.length, 1, 'Container should have one child');
    assert.equal(container.children[0].tagName, 'SPAN', 'New node should be a SPAN');
    assert.equal(container.children[0].textContent, 'New', 'New node should have new content');
});

test('updateElement() should update props on the same node', () => {
    const oldVNode = h('div', { key: 'a', id: 'old-id', class: 'c1' });
    const newVNode = h('div', { key: 'a', id: 'new-id', 'data-foo': 'bar' });
    const { container, el } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(el.id, 'new-id', 'Should update changed properties');
    assert.equal(el.hasAttribute('class'), false, 'Should remove old properties');
    assert.equal(el.getAttribute('data-foo'), 'bar', 'Should add new properties');
});

test('updateElement() should update text content of a text node', () => {
    const oldVNode = h('p', { key: 'a' }, ['Old text']);
    const newVNode = h('p', { key: 'a' }, ['New text']);
    const { container } = setupTestDOM(oldVNode);

    updateElement(container, newVNode, oldVNode);

    assert.equal(container.children[0].textContent, 'New text', 'Text content should be updated');
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

    assert.equal(container.children[0].children.length, 2, 'Should have two children now');
    assert.equal(container.children[0].children[1].textContent, 'B', 'The new child should be "B"');
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

    assert.equal(container.children[0].children.length, 1, 'Should have one child now');
    assert.equal(container.children[0].children[0].textContent, 'A', 'The remaining child should be "A"');
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

    const children = container.children[0].children;
    assert.equal(children.length, 3, 'Should still have three children');
    assert.equal(children[0].textContent, 'C', 'First child should be C');
    assert.equal(children[1].textContent, 'A', 'Second child should be A');
    assert.equal(children[2].textContent, 'B', 'Third child should be B');
});
