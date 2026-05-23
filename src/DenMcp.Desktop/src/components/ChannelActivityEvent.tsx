/**
 * Channel activity event rendering — shows agent runs, deliveries,
 * status changes, and other lifecycle events in the channel surface.
 *
 * Phase 4 of the channel UX integration.
 */
import type { ChannelActivityEventRow } from '../electron/sidecarProtocol';

// ── Event type identity map ────────────────────────────────────────────────

interface EventProfile {
  icon: string;
  label: string;
  cssClass: string;
}

const EVENT_PROFILES: Record<string, EventProfile> = {
  worker_run:         { icon: '🏃', label: 'Worker run',       cssClass: 'ch-ev-run' },
  delivery:           { icon: '📬', label: 'Delivery',         cssClass: 'ch-ev-delivery' },
  delivery_request:   { icon: '📨', label: 'Delivery request', cssClass: 'ch-ev-delivery' },
  review_requested:   { icon: '🧐', label: 'Review requested', cssClass: 'ch-ev-review' },
  review_completed:   { icon: '✅', label: 'Review completed', cssClass: 'ch-ev-review' },
  status_change:      { icon: '🔄', label: 'Status change',    cssClass: 'ch-ev-status' },
  agent_joined:       { icon: '👋', label: 'Agent joined',     cssClass: 'ch-ev-join' },
  agent_left:         { icon: '👋', label: 'Agent left',       cssClass: 'ch-ev-leave' },
  message_sent:       { icon: '💬', label: 'Message sent',     cssClass: 'ch-ev-msg' },
  error:              { icon: '❌', label: 'Error',            cssClass: 'ch-ev-error' },
};

const STATUS_GLYPHS: Record<string, string> = {
  completed:  '✅',
  success:    '✅',
  running:    '⟳',
  pending:    '⏳',
  failed:     '❌',
  error:      '❌',
  cancelled:  '🚫',
  skipped:    '⏭',
  requested:  '📨',
};

const STATUS_TONES: Record<string, string> = {
  completed:  'ok',
  success:    'ok',
  running:    'run',
  pending:    'warn',
  failed:     'err',
  error:      'err',
  cancelled:  'warn',
  skipped:    'warn',
  requested:  'info',
};

function getEventProfile(eventType: string): EventProfile {
  return EVENT_PROFILES[eventType.toLowerCase()] ?? {
    icon: 'ℹ️',
    label: eventType,
    cssClass: 'ch-ev-other',
  };
}

function getStatusGlyph(status: string): string {
  return STATUS_GLYPHS[status.toLowerCase()] ?? '❓';
}

function getStatusTone(status: string): string {
  return STATUS_TONES[status.toLowerCase()] ?? 'info';
}

// ── Formatted timestamp ────────────────────────────────────────────────────

function formatTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return '--:--:--';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '--:--:--';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Main component ─────────────────────────────────────────────────────────

interface ChannelActivityEventProps {
  event: ChannelActivityEventRow;
}

/**
 * Renders a single channel activity event row.
 *
 * Shows: timestamp, event type icon, agent identity, event summary
 * with status glyph. Designed to slot into the console-output grid.
 */
export function ChannelActivityEvent({ event }: ChannelActivityEventProps) {
  const profile = getEventProfile(event.event_type);
  const statusGlyph = getStatusGlyph(event.status);
  const statusTone = getStatusTone(event.status);
  const timestamp = formatTimestamp(event.created_at);

  // Build a short summary from available fields
  const parts: string[] = [];
  if (event.task_id != null) parts.push(`task #${event.task_id}`);
  if (event.thread_id != null) parts.push(`thread #${event.thread_id}`);
  if (event.hermes_session_key) parts.push(`session ${event.hermes_session_key.slice(0, 12)}…`);
  const summary = parts.length > 0 ? ` — ${parts.join(', ')}` : '';

  return (
    <div className={`console-line console-activity-event ${profile.cssClass} ch-ev-${statusTone}`}>
      <span className="ts ch-ev-ts">{timestamp}</span>
      <span className={`lvl ch-ev-glyph ${statusTone}`} title={`${profile.label}: ${event.status}`}>
        {profile.icon}
      </span>
      <span className="ch-ev-content">
        <span className="ch-ev-agent">{event.agent_identity}</span>
        <span className="ch-ev-action">{profile.label}</span>
        <span className={`ch-ev-status-badge ${statusTone}`} title={event.status}>
          {statusGlyph} {event.status}
        </span>
        {summary && <span className="ch-ev-summary">{summary}</span>}
      </span>
    </div>
  );
}
