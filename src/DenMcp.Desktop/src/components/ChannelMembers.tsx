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

export function ChannelMembers({ members }: { members: ChannelMemberRow[] }) {
  if (members.length === 0) {
    return (
      <div className="console-line ch-members-empty">
        <span className="ts" />
        <span className="lvl info">info</span>
        <span>No agents in this channel</span>
      </div>
    );
  }

  return (
    <div className="ch-members-panel">
      {members.map((member) => {
        const profile = memberProfile(member.member_type);
        const statusCls = statusClass(member.membership_status);
        const isActive = member.membership_status === 'active';
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
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
