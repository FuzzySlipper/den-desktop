/**
 * Pure markdown renderer for channel message bodies.
 *
 * Uses React.createElement (not JSX) so it works from .ts files and is
 * directly importable by both components and tests.
 */

import { createElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

type InlineSegment = string | ReactElement;

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function applyPass(
  parts: InlineSegment[],
  re: RegExp,
  build: (captures: string[]) => ReactElement,
): InlineSegment[] {
  const result: InlineSegment[] = [];
  const globalRe = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');

  for (const part of parts) {
    if (typeof part !== 'string') {
      result.push(part);
      continue;
    }

    const matches: { start: number; end: number; el: ReactElement }[] = [];
    let m: RegExpExecArray | null;

    while ((m = globalRe.exec(part)) !== null) {
      const captures: string[] = [];
      for (let i = 1; i < m.length; i++) captures.push(m[i]);
      matches.push({ start: m.index, end: m.index + m[0].length, el: build(captures) });
    }

    if (matches.length === 0) {
      result.push(part);
      continue;
    }

    let cursor = 0;
    for (const rep of matches) {
      if (rep.start > cursor) result.push(part.slice(cursor, rep.start));
      result.push(rep.el);
      cursor = rep.end;
    }
    if (cursor < part.length) result.push(part.slice(cursor));
  }

  return result;
}

// ── Element factories (using createElement, no JSX) ─────────────────────────

function bold(inner: string): ReactElement {
  return createElement('strong', { key: crypto.randomUUID() }, inner);
}

function italic(inner: string): ReactElement {
  return createElement('em', { key: crypto.randomUUID() }, inner);
}

function codeSpan(inner: string): ReactElement {
  return createElement('code', { key: crypto.randomUUID(), className: 'ch-code' }, inner);
}

function link(href: string, text: string): ReactElement {
  return createElement('a', { key: crypto.randomUUID(), className: 'ch-link', href, target: '_blank', rel: 'noopener noreferrer' }, text);
}

function mention(inner: string): ReactElement {
  return createElement('span', { key: crypto.randomUUID(), className: 'ch-mention' }, inner);
}

function taskRef(inner: string): ReactElement {
  return createElement('span', { key: crypto.randomUUID(), className: 'ch-task-ref' }, inner);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Minimal inline markdown → React element array converter.
 *
 * Handles: **bold**, *italic*, `inline code`, `` fenced code ``,
 * [link text](url), bare URLs, @mentions, #task-refs, HTML entity escaping.
 *
 * Returns an array of strings and React elements suitable for rendering.
 * Pure function — no side effects, no component state.
 */
export function renderInlineMarkdown(text: string): (string | ReactElement)[] {
  const escaped = escapeHtml(text);
  let parts: InlineSegment[] = [escaped];

  // Bold: **text**
  parts = applyPass(parts, /\*\*(.+?)\*\*/, ([inner]) => bold(inner));

  // Italic: *text* (not **)
  parts = applyPass(parts, /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/, ([inner]) => italic(inner));

  // Inline code (double backtick first — fenced): ``code``
  parts = applyPass(parts, /``(.+?)``/, ([inner]) => codeSpan(inner));

  // Inline code (single backtick): `code`
  parts = applyPass(parts, /`([^`]+)`/, ([inner]) => codeSpan(inner));

  // Markdown links: [text](url)
  parts = applyPass(parts, /\[([^\]]+)\]\(([^)]+)\)/, ([text, url]) => link(url, text));

  // Bare URLs: http/https
  parts = applyPass(parts, /(https?:\/\/[^\s<]+[^\s<.,:;!?)\]}>])/, ([url]) => link(url, url));

  // @mentions: @username or @agent-name
  parts = applyPass(parts, /(@[a-zA-Z0-9_-]+)/, ([mentionTag]) => mention(mentionTag));

  // #task/issue references: #1234
  parts = applyPass(parts, /(#\d+)/, ([ref]) => taskRef(ref));

  return parts;
}

// ── Test helpers ───────────────────────────────────────────────────────────

/**
 * Flatten rendered markdown segments to plain text for test assertions.
 * Recursively extracts text content from React element trees.
 */
export function flattenText(nodes: unknown): string {
  if (typeof nodes === 'string') return nodes;
  if (nodes == null) return '';
  if (Array.isArray(nodes)) return nodes.map(flattenText).join('');
  if (typeof nodes === 'object' && nodes !== null) {
    const el = nodes as { props?: Record<string, unknown> };
    if (el.props?.children) return flattenText(el.props.children);
  }
  return '';
}
