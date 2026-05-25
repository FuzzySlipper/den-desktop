using System.Text.Json.Serialization;

namespace DenMcp.Desktop.Sidecar;

public sealed record ListChannelMessagesRequest
{
    [JsonPropertyName("project_id")]
    public required string ProjectId { get; init; }

    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("limit")]
    public int Limit { get; init; } = 50;

    [JsonPropertyName("after_id")]
    public long? AfterId { get; init; }
}

public sealed record ListChannelMessagesResponse
{
    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("messages")]
    public required IReadOnlyList<ChannelMessageRow> Messages { get; init; }

    [JsonPropertyName("total_count")]
    public int TotalCount { get; init; }
}

public sealed record ChannelMessageRow
{
    [JsonPropertyName("id")]
    public long Id { get; init; }

    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("sender_identity")]
    public string SenderIdentity { get; init; } = string.Empty;

    [JsonPropertyName("sender_type")]
    public string SenderType { get; init; } = string.Empty;

    [JsonPropertyName("body")]
    public string Body { get; init; } = string.Empty;

    [JsonPropertyName("created_at")]
    public string? CreatedAt { get; init; }
}

public sealed record PostChannelMessageRequest
{
    [JsonPropertyName("project_id")]
    public required string ProjectId { get; init; }

    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("body")]
    public required string Body { get; init; }

    [JsonPropertyName("sender_identity")]
    public required string SenderIdentity { get; init; }

    [JsonPropertyName("sender_type")]
    public string SenderType { get; init; } = "user";
}

public sealed record PostChannelMessageResponse
{
    [JsonPropertyName("message")]
    public required ChannelMessageRow Message { get; init; }
}

public sealed record EnsureDefaultChannelRequest
{
    [JsonPropertyName("project_id")]
    public required string ProjectId { get; init; }
}

public sealed record EnsureDefaultChannelResponse
{
    [JsonPropertyName("id")]
    public long Id { get; init; }

    [JsonPropertyName("slug")]
    public string Slug { get; init; } = string.Empty;

    [JsonPropertyName("project_id")]
    public string ProjectId { get; init; } = string.Empty;

    [JsonPropertyName("kind")]
    public string Kind { get; init; } = string.Empty;

    [JsonPropertyName("was_created")]
    public bool WasCreated { get; init; }
}

public sealed record ListChannelsRequest
{
    [JsonPropertyName("project_id")]
    public required string ProjectId { get; init; }
}

public sealed record ListChannelsResponse
{
    [JsonPropertyName("channels")]
    public required IReadOnlyList<DenChannelSummary> Channels { get; init; }
}

public sealed record ListChannelActivityEventsRequest
{
    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("task_id")]
    public long? TaskId { get; init; }

    [JsonPropertyName("limit")]
    public int Limit { get; init; } = 50;
}

public sealed record ListChannelActivityEventsResponse
{
    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("events")]
    public required IReadOnlyList<ChannelActivityEventRow> Events { get; init; }
}

public sealed record ChannelActivityEventRow
{
    [JsonPropertyName("id")]
    public long Id { get; init; }

    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("agent_identity")]
    public string AgentIdentity { get; init; } = string.Empty;

    [JsonPropertyName("event_type")]
    public string EventType { get; init; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; init; } = string.Empty;

    [JsonPropertyName("sequence")]
    public long Sequence { get; init; }

    [JsonPropertyName("update_version")]
    public long UpdateVersion { get; init; }

    [JsonPropertyName("created_at")]
    public string? CreatedAt { get; init; }
}

public sealed record ListChannelMembersRequest
{
    [JsonPropertyName("project_id")]
    public required string ProjectId { get; init; }

    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }
}

public sealed record ListChannelMembersResponse
{
    [JsonPropertyName("members")]
    public required IReadOnlyList<ChannelMemberRow> Members { get; init; }
}

public sealed record ChannelMemberRow
{
    [JsonPropertyName("id")]
    public long Id { get; init; }

    [JsonPropertyName("member_type")]
    public string MemberType { get; init; } = string.Empty;

    [JsonPropertyName("member_identity")]
    public string MemberIdentity { get; init; } = string.Empty;

    [JsonPropertyName("membership_status")]
    public string MembershipStatus { get; init; } = string.Empty;

    [JsonPropertyName("wake_policy")]
    public string? WakePolicy { get; init; }

    [JsonPropertyName("can_send")]
    public bool CanSend { get; init; }

    [JsonPropertyName("can_react")]
    public bool CanReact { get; init; }

    [JsonPropertyName("can_invite")]
    public bool CanInvite { get; init; }

    [JsonPropertyName("cooldown_seconds")]
    public int CooldownSeconds { get; init; }

    [JsonPropertyName("max_auto_replies_per_window")]
    public int MaxAutoRepliesPerWindow { get; init; }

    [JsonPropertyName("settings_label")]
    public string? SettingsLabel { get; init; }
}

public sealed record UpdateChannelMemberStatusRequest
{
    [JsonPropertyName("channel_id")]
    public long ChannelId { get; init; }

    [JsonPropertyName("membership_id")]
    public long MembershipId { get; init; }

    [JsonPropertyName("membership_status")]
    public required string MembershipStatus { get; init; }
}

public sealed record UpdateChannelMemberStatusResponse
{
    [JsonPropertyName("member")]
    public required ChannelMemberRow Member { get; init; }
}
