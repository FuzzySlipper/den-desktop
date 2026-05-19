import assert from 'node:assert/strict';
import test from 'node:test';
import { buildActivityEventView, buildMessagesView, stripHtmlTags } from '../src/messagesView.ts';

function makeSnapshot(overrides = {}) {
  return {
    snapshot_id: 'messages:den-hermes-bridge:fixture',
    project_id: 'den-hermes-bridge',
    task_id: 1529,
    thread_id: null,
    generated_at: '2026-05-19T03:00:00.000Z',
    messages: [],
    activity_events: [],
    thread_root: null,
    unread_count: 0,
    total_count: 0,
    freshness: { source: 'den_http', is_partial: false, warnings: [], errors: [] },
    ...overrides,
  };
}

test('buildMessagesView includes non-message activity breadcrumbs in empty state and count', () => {
  const view = buildMessagesView(makeSnapshot({
    activity_events: [
      {
        id: 3,
        channel_id: 5,
        agent_identity: 'den-channels-runner',
        delivery_request_id: 'delivery-1',
        hermes_session_key: 'session-1',
        task_id: 1529,
        thread_id: null,
        anchor_message_id: null,
        event_type: 'tool_call_completed',
        status: 'completed',
        sequence: 2,
        update_version: 1,
        title: 'tool terminal',
        summary: 'finished terminal command',
        preview_json: '{"command":"dotnet test"}',
        metadata_json: '{"count":3}',
        created_at: '2026-05-19T02:59:00.000Z',
        updated_at: '2026-05-19T02:59:30.000Z',
      },
    ],
  }), Date.parse('2026-05-19T03:00:00.000Z'));

  assert.equal(view.messages.length, 0);
  assert.equal(view.activityEvents.length, 1);
  assert.equal(view.isEmpty, false);
  assert.equal(view.activityEvents[0].statusLabel, 'done');
  assert.equal(view.activityEvents[0].statusTone, 'ok');
  assert.match(view.activityEvents[0].summary, /×3/);
});

test('buildActivityEventView tolerates malformed metadata and maps failed status', () => {
  const row = buildActivityEventView({
    id: 4,
    channel_id: 5,
    agent_identity: 'den-channels-runner',
    event_type: 'tool_call_failed',
    status: 'failed',
    sequence: 3,
    update_version: 1,
    title: '',
    summary: 'tool failed',
    preview_json: null,
    metadata_json: '{not-json',
    created_at: '2026-05-19T02:59:00.000Z',
    updated_at: null,
  }, Date.parse('2026-05-19T03:00:00.000Z'));
  assert.equal(row.title, 'tool call failed');
  assert.equal(row.statusLabel, 'failed');
  assert.equal(row.statusTone, 'err');
  assert.equal(row.count, 1);
});

test('stripHtmlTags strips details/summary tags keeping inner text', () => {
  const input = `<details>
<summary>What I'd propose</summary>

1. Take #1308
2. Store findings
3. Create implementation tasks
</details>`;

  const result = stripHtmlTags(input);
  assert.equal(result.includes('<details>'), false);
  assert.equal(result.includes('</details>'), false);
  assert.equal(result.includes('<summary>'), false);
  assert.equal(result.includes('</summary>'), false);
  assert.ok(result.includes("What I'd propose"));
  assert.ok(result.includes('Take #1308'));
});

test('stripHtmlTags handles nested HTML tags', () => {
  const result = stripHtmlTags('<div class="x"><span>hello</span> <strong>world</strong></div>');
  assert.equal(result, 'hello world');
});

test('stripHtmlTags returns empty string for empty/only-tag input', () => {
  assert.equal(stripHtmlTags(''), '');
  assert.equal(stripHtmlTags('<br/>'), '');
  assert.equal(stripHtmlTags('<div></div>'), '');
});

test('buildMessagesView strips HTML from message content', () => {
  const view = buildMessagesView(makeSnapshot({
    messages: [{
      id: 100,
      sender: 'den-desktop-runner',
      content: `<details>\n<summary>Proposal</summary>\n1. Audit\n2. Clean up\n</details>`,
      content_summary: '<details><summary>Proposal</summary>1. Audit, 2. Clean up</details>',
      intent: 'handoff',
      metadata_type: 'implementation_packet',
      created_at: '2026-05-19T02:59:00.000Z',
      is_unread: false,
      task_id: null,
      thread_id: null,
    }],
  }), Date.parse('2026-05-19T03:00:00.000Z'));

  assert.equal(view.messages.length, 1);
  const msg = view.messages[0];
  assert.equal(msg.contentFull.includes('<details>'), false);
  assert.equal(msg.contentFull.includes('</details>'), false);
  assert.ok(msg.contentFull.includes('Proposal'));
  assert.ok(msg.contentFull.includes('1. Audit'));
  assert.equal(msg.contentPreview.includes('<summary>'), false);
  assert.ok(msg.contentPreview.includes('Proposal'));
});
