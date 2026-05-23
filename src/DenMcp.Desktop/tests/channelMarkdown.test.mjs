import assert from 'node:assert/strict';
import test from 'node:test';
import { renderInlineMarkdown, flattenText } from '../src/channelMarkdown.ts';

// ── Helper: render markdown and return plain text ──────────────────────────

function mdText(input) {
  return flattenText(renderInlineMarkdown(input));
}

// ── Bold ───────────────────────────────────────────────────────────────────

test('renderInlineMarkdown: **bold** renders as bold text', () => {
  const result = renderInlineMarkdown('hello **world**');
  // hello<SPACE> + <strong>world</strong> — trailing empty string is not emitted
  // when match ends at the string boundary
  assert.equal(result.length, 2);
  assert.equal(typeof result[0], 'string');
  assert.equal(result[0], 'hello ');
  // The second segment should be a strong element
  assert.equal(typeof result[1], 'object');
  // Text extraction should work
  assert.equal(flattenText(result[1]), 'world');
});

test('renderInlineMarkdown: **bold** extracts to bold text', () => {
  assert.equal(mdText('**bold**'), 'bold');
  assert.equal(mdText('before **bold** after'), 'before bold after');
});

// ── Italic ─────────────────────────────────────────────────────────────────

test('renderInlineMarkdown: *italic* renders as italic text', () => {
  assert.equal(mdText('*italic*'), 'italic');
  assert.equal(mdText('text *italic* here'), 'text italic here');
});

// ── Inline code ────────────────────────────────────────────────────────────

test('renderInlineMarkdown: `code` renders as code', () => {
  assert.equal(mdText('`code`'), 'code');
  assert.equal(mdText('use `fn()` here'), 'use fn() here');
});

test('renderInlineMarkdown: ``code`` renders as code', () => {
  assert.equal(mdText('``code``'), 'code');
  assert.equal(mdText('use ``cmd --flag`` here'), 'use cmd --flag here');
});

// ── Markdown links ─────────────────────────────────────────────────────────

test('renderInlineMarkdown: [text](url) renders link', () => {
  assert.equal(mdText('[click me](https://example.com)'), 'click me');
  assert.equal(mdText('see [docs](http://den.dev) for details'), 'see docs for details');
});

// ── Bare URLs ──────────────────────────────────────────────────────────────

test('renderInlineMarkdown: bare http URL renders as link', () => {
  assert.equal(mdText('visit https://example.com now'), 'visit https://example.com now');
});

// ── @mentions ──────────────────────────────────────────────────────────────

test('renderInlineMarkdown: @mention renders as mention', () => {
  assert.equal(mdText('hello @runner'), 'hello @runner');
  assert.equal(mdText('@agent-name here'), '@agent-name here');
});

// ── #task references ───────────────────────────────────────────────────────

test('renderInlineMarkdown: #123 renders as task ref', () => {
  assert.equal(mdText('task #1234 done'), 'task #1234 done');
  assert.equal(mdText('see #42'), 'see #42');
});

// ── HTML escaping ──────────────────────────────────────────────────────────

test('renderInlineMarkdown: escapes HTML entities', () => {
  // HTML tags should be escaped, not rendered as elements
  const result = renderInlineMarkdown('<script>alert("xss")</script>');
  const text = flattenText(result);
  assert.ok(text.includes('&lt;script&gt;'));
  assert.ok(text.includes('&lt;/script&gt;'));
  // Quotes are not escaped by default (only &, <, >)
  assert.ok(text.includes('"xss"'));
});

// ── Mixed content ─────────────────────────────────────────────────────────

test('renderInlineMarkdown: mixed bold and code', () => {
  assert.equal(mdText('run **npm install** `lodash`'), 'run npm install lodash');
});

test('renderInlineMarkdown: mention and task ref', () => {
  assert.equal(mdText('@agent see #123'), '@agent see #123');
});

// ── Plain text passthrough ─────────────────────────────────────────────────

test('renderInlineMarkdown: plain text passes through', () => {
  assert.equal(mdText('hello world'), 'hello world');
  assert.equal(mdText(''), '');
});

// ── No markdown patterns ───────────────────────────────────────────────────

test('renderInlineMarkdown: single asterisk is not italic', () => {
  assert.equal(mdText('5 * 3 = 15'), '5 * 3 = 15');
});
