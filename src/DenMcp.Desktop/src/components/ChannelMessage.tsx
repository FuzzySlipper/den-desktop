/**
 * Richer channel message rendering with sender badges and inline markdown.
 *
 * Phase 3 of the channel UX integration — renders:
 * - Sender-type badges with distinct colors (human, agent, system, desktop)
 * - Full message body (no truncation) with inline markdown formatting
 * - Timestamp + metadata layout
 */
import { Fragment } from 'react';
import type { ChannelMessageRow } from '../electron/sidecarProtocol';
import { renderInlineMarkdown } from '../channelMarkdown';

// ── Sender-type identity map ───────────────────────────────────────────────

interface SenderProfile {
  label: string;
  icon: string;
  cssClass: string;
}

const SENDER_PROFILES: Record<string, SenderProfile> = {
  human:   { label: 'Human',   icon: '👤', cssClass: 'ch-sender-human' },
  agent:   { label: 'Agent',   icon: '🤖', cssClass: 'ch-sender-agent' },
  system:  { label: 'System',  icon: '⚙',  cssClass: 'ch-sender-system' },
  desktop: { label: 'Desktop', icon: '🖥',  cssClass: 'ch-sender-desktop' },
  user:    { label: 'User',    icon: '👤', cssClass: 'ch-sender-human' },
};

function getSenderProfile(senderType: string): SenderProfile {
  return SENDER_PROFILES[senderType.toLowerCase()] ?? {
    label: senderType,
    icon: '❓',
    cssClass: 'ch-sender-other',
  };
}

// ── Timestamp helpers ──────────────────────────────────────────────────────

function formatMessageTimestamp(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '--:--:--';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatMessageDate(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── Message body rendering ─────────────────────────────────────────────────

function renderMessageBody(body: string): React.ReactElement {
  const lines = body.split('\n');

  if (lines.length === 1) {
    return <span className="ch-body">{renderInlineMarkdown(lines[0])}</span>;
  }

  return (
    <span className="ch-body ch-body-multiline">
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderInlineMarkdown(line)}
        </Fragment>
      ))}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface ChannelMessageProps {
  message: ChannelMessageRow;
  isFirstToday?: boolean;
}

/**
 * Renders a single channel message row with sender badge, timestamp, and
 * full markdown-rendered body.
 *
 * Designed to slot into the console-output grid layout alongside existing
 * diag/cmd/progress lines.
 */
export function ChannelMessage({ message, isFirstToday }: ChannelMessageProps) {
  const profile = getSenderProfile(message.sender_type);
  const timestamp = formatMessageTimestamp(message.created_at);
  const dateLabel = isFirstToday ? formatMessageDate(message.created_at) : null;

  return (
    <div className={`console-line console-channel-msg ${profile.cssClass}`}>
      <span className="ts ch-ts">{timestamp}</span>
      <span className={`lvl ch-badge ${profile.cssClass}`} title={profile.label}>
        {profile.icon}
      </span>
      <span className="ch-content">
        {dateLabel && <span className="ch-date-separator">{dateLabel}</span>}
        <span className="ch-sender">{message.sender_identity}</span>
        {renderMessageBody(message.body)}
      </span>
    </div>
  );
}
