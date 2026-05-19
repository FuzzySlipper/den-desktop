import assert from 'node:assert/strict';
import test from 'node:test';
import { buildActivityEventView, buildMessagesView } from '../src/messagesView.ts';

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
