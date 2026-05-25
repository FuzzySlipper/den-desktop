import { useState } from 'react';
import type { ChannelMemberRow } from '../electron/sidecarProtocol';

/** Profile lookup for agent member display. */
const memberProfiles: Record<string, { icon: string; label: string }> = {
  agent: { icon: '🤖', label: 'Agent' },
  human: { icon: '👤', label: 'Human' },
};

function memberProfile(memberType: string) {
  return memberProfiles[memberType] ?? { icon: '❓', label: memberType };
}

function statusClass(status: string): string {
  switch (status) {
    case 'active': return 'ok';
    case 'inactive': return 'warn';
    case 'left': return 'err';
    case 'invited': return 'run';
    default: return 'info';
  }
}

export function ChannelMembers({ members, channelId }: { members: ChannelMemberRow[]; channelId: number }) {
  const [togglingMembers, setTogglingMembers] = useState<Set<number>>(new Set());
  const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});

  if (members.length === 0) {
    return (
      <div className="console-line ch-members-empty">
        <span className="ts" />
        <span className="lvl info">info</span>
        <span>No agents in this channel</span>
      </div>
    );
  }

  async function handleToggle(member: ChannelMemberRow) {
    const newStatus = member.membership_status === 'active' ? 'inactive' : 'active';
    setTogglingMembers((prev: Set<number>) => new Set(prev).add(member.id));
    setErrorMessages((prev: Record<number, string>) => {
      const next = { ...prev };
      delete next[member.id];
      return next;
    });

    try {
      await window.denDesktopSidecar?.updateChannelMemberStatus({
        channel_id: channelId,
        membership_id: member.id,
        membership_status: newStatus,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessages((prev: Record<number, string>) => ({ ...prev, [member.id]: msg }));
    } finally {
      setTogglingMembers((prev: Set<number>) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }
  }

  return (
    <div className="ch-members-panel">
      {members.map((member) => {
        const profile = memberProfile(member.member_type);
        const statusCls = statusClass(member.membership_status);
        const isActive = member.membership_status === 'active';
        const isToggling = togglingMembers.has(member.id);
        const error = errorMessages[member.id];
        return (
          <div key={member.id} className="console-line ch-member-row">
            <span className="ts">{profile.icon}</span>
            <span className={`lvl ${statusCls}`}>{member.membership_status}</span>
            <span className="ch-member-info">
              <span className="ch-member-identity">{member.member_identity}</span>
              <span className="ch-member-meta">
                {member.wake_policy ? (
                  <span className="ch-member-tag" title={`Wake policy: ${member.wake_policy}`}>
                    {member.wake_policy}
                  </span>
                ) : null}
                {!isActive ? (
                  <span className="ch-member-tag ch-member-inactive" title="Delivery disabled">
                    paused
                  </span>
                ) : null}
                <span className="ch-member-tag" title={`${member.cooldown_seconds}s cooldown`}>
                  {member.cooldown_seconds}s
                </span>
                <button
                  className="ch-member-toggle"
                  onClick={() => handleToggle(member)}
                  disabled={isToggling}
                  title={isActive ? 'Deactivate member' : 'Activate member'}
                >
                  {isToggling ? '🔄' : isActive ? '⏸' : '▶️'}
                </button>
              </span>
              {error ? (
                <span className="ch-member-error" title={error}>❌</span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
