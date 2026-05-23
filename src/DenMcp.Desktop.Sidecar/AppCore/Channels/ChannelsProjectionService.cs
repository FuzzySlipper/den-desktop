using System.Globalization;

namespace DenMcp.Desktop.Sidecar;

public sealed class ChannelsProjectionService
{
    private readonly DenHttpClient _den;
    private readonly Func<CancellationToken, Task<OperatorSettings>> _settingsProvider;
    private readonly Func<DateTimeOffset> _now;

    public ChannelsProjectionService(
        DenHttpClient den,
        OperatorRuntimeService runtime,
        Func<DateTimeOffset>? now = null)
        : this(den, runtime.GetSettingsAsync, now)
    {
    }

    public ChannelsProjectionService(
        DenHttpClient den,
        Func<CancellationToken, Task<OperatorSettings>> settingsProvider,
        Func<DateTimeOffset>? now = null)
    {
        _den = den;
        _settingsProvider = settingsProvider;
        _now = now ?? (() => DateTimeOffset.UtcNow);
    }

    public async Task<ListChannelMessagesResponse> ListMessagesAsync(
        ListChannelMessagesRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentException.ThrowIfNullOrWhiteSpace(request.ProjectId);

        var settings = await _settingsProvider(cancellationToken).ConfigureAwait(false);
        var baseUrl = settings.DenBaseUrl;

        var messages = await _den.ListChannelMessagesAsync(
            baseUrl,
            request.ChannelId,
            request.Limit,
            request.AfterId,
            cancellationToken).ConfigureAwait(false);

        return new ListChannelMessagesResponse
        {
            ChannelId = request.ChannelId,
            Messages = messages.Select(ToRow).ToList(),
            TotalCount = messages.Count,
        };
    }

    public async Task<PostChannelMessageResponse> PostMessageAsync(
        PostChannelMessageRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentException.ThrowIfNullOrWhiteSpace(request.ProjectId);
        ArgumentException.ThrowIfNullOrWhiteSpace(request.Body);
        ArgumentException.ThrowIfNullOrWhiteSpace(request.SenderIdentity);

        var settings = await _settingsProvider(cancellationToken).ConfigureAwait(false);
        var baseUrl = settings.DenBaseUrl;

        var message = await _den.PostChannelMessageAsync(
            baseUrl,
            request.ChannelId,
            new DenSendChannelMessageRequest
            {
                Body = request.Body,
                SenderIdentity = request.SenderIdentity,
                SenderType = request.SenderType,
            },
            cancellationToken).ConfigureAwait(false);

        return new PostChannelMessageResponse
        {
            Message = ToRow(message),
        };
    }

    public async Task<EnsureDefaultChannelResponse> EnsureDefaultChannelAsync(
        EnsureDefaultChannelRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentException.ThrowIfNullOrWhiteSpace(request.ProjectId);

        var settings = await _settingsProvider(cancellationToken).ConfigureAwait(false);
        var baseUrl = settings.DenBaseUrl;

        var result = await _den.EnsureProjectDefaultChannelAsync(
            baseUrl,
            request.ProjectId,
            cancellationToken).ConfigureAwait(false);

        return new EnsureDefaultChannelResponse
        {
            Id = result.Id,
            Slug = result.Slug,
            ProjectId = result.ProjectId,
            Kind = result.Kind,
            WasCreated = result.WasCreated,
        };
    }

    public async Task<ListChannelsResponse> ListChannelsAsync(
        ListChannelsRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentException.ThrowIfNullOrWhiteSpace(request.ProjectId);

        var settings = await _settingsProvider(cancellationToken).ConfigureAwait(false);
        var baseUrl = settings.DenBaseUrl;

        var channels = await _den.ListChannelsAsync(
            baseUrl,
            request.ProjectId,
            cancellationToken).ConfigureAwait(false);

        return new ListChannelsResponse
        {
            Channels = channels.ToList(),
        };
    }

    public async Task<ListChannelActivityEventsResponse> ListChannelActivityEventsAsync(
        ListChannelActivityEventsRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var settings = await _settingsProvider(cancellationToken).ConfigureAwait(false);
        var baseUrl = settings.DenBaseUrl;

        var events = await _den.ListChannelActivityEventsAsync(
            baseUrl,
            request.ChannelId,
            request.TaskId,
            request.Limit,
            cancellationToken).ConfigureAwait(false);

        return new ListChannelActivityEventsResponse
        {
            ChannelId = request.ChannelId,
            Events = events.Select(ToActivityEventRow).ToList(),
        };
    }

    private static ChannelMessageRow ToRow(DenChannelMessage message)
    {
        return new ChannelMessageRow
        {
            Id = message.Id,
            ChannelId = message.ChannelId,
            SenderIdentity = message.SenderIdentity,
            SenderType = message.SenderType,
            Body = message.Body,
            CreatedAt = message.CreatedAt,
        };
    }

    private static ChannelActivityEventRow ToActivityEventRow(DenChannelActivityEvent evt)
    {
        return new ChannelActivityEventRow
        {
            Id = evt.Id,
            ChannelId = evt.ChannelId,
            AgentIdentity = evt.AgentIdentity,
            EventType = evt.EventType,
            Status = evt.Status,
            Sequence = evt.Sequence,
            UpdateVersion = evt.UpdateVersion,
            CreatedAt = evt.CreatedAt,
        };
    }
}
