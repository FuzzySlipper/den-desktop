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
