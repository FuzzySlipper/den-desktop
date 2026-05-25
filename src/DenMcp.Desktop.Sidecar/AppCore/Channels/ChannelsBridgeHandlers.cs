using Den.Bridge.Abstractions;

namespace DenMcp.Desktop.Sidecar;

public sealed class ListChannelMessagesHandler
    : IBridgeCommandHandler<ListChannelMessagesRequest, ListChannelMessagesResponse>
{
    private readonly ChannelsProjectionService _projection;

    public ListChannelMessagesHandler(ChannelsProjectionService projection) => _projection = projection;

    public async ValueTask<ListChannelMessagesResponse?> HandleAsync(
        ListChannelMessagesRequest request,
        BridgeRequestContext context,
        CancellationToken cancellationToken)
    {
        return await _projection.ListMessagesAsync(request, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class PostChannelMessageHandler
    : IBridgeCommandHandler<PostChannelMessageRequest, PostChannelMessageResponse>
{
    private readonly ChannelsProjectionService _projection;

    public PostChannelMessageHandler(ChannelsProjectionService projection) => _projection = projection;

    public async ValueTask<PostChannelMessageResponse?> HandleAsync(
        PostChannelMessageRequest request,
        BridgeRequestContext context,
        CancellationToken cancellationToken)
    {
        return await _projection.PostMessageAsync(request, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class EnsureDefaultChannelHandler
    : IBridgeCommandHandler<EnsureDefaultChannelRequest, EnsureDefaultChannelResponse>
{
    private readonly ChannelsProjectionService _projection;

    public EnsureDefaultChannelHandler(ChannelsProjectionService projection) => _projection = projection;

    public async ValueTask<EnsureDefaultChannelResponse?> HandleAsync(
        EnsureDefaultChannelRequest request,
        BridgeRequestContext context,
        CancellationToken cancellationToken)
    {
        return await _projection.EnsureDefaultChannelAsync(request, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class ListChannelsHandler
    : IBridgeCommandHandler<ListChannelsRequest, ListChannelsResponse>
{
    private readonly ChannelsProjectionService _projection;

    public ListChannelsHandler(ChannelsProjectionService projection) => _projection = projection;

    public async ValueTask<ListChannelsResponse?> HandleAsync(
        ListChannelsRequest request,
        BridgeRequestContext context,
        CancellationToken cancellationToken)
    {
        return await _projection.ListChannelsAsync(request, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class ListChannelActivityEventsHandler
    : IBridgeCommandHandler<ListChannelActivityEventsRequest, ListChannelActivityEventsResponse>
{
    private readonly ChannelsProjectionService _projection;

    public ListChannelActivityEventsHandler(ChannelsProjectionService projection) => _projection = projection;

    public async ValueTask<ListChannelActivityEventsResponse?> HandleAsync(
        ListChannelActivityEventsRequest request,
        BridgeRequestContext context,
        CancellationToken cancellationToken)
    {
        return await _projection.ListChannelActivityEventsAsync(request, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class ListChannelMembersHandler
    : IBridgeCommandHandler<ListChannelMembersRequest, ListChannelMembersResponse>
{
    private readonly ChannelsProjectionService _projection;

    public ListChannelMembersHandler(ChannelsProjectionService projection) => _projection = projection;

    public async ValueTask<ListChannelMembersResponse?> HandleAsync(
        ListChannelMembersRequest request,
        BridgeRequestContext context,
        CancellationToken cancellationToken)
    {
        return await _projection.ListChannelMembersAsync(request, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class UpdateChannelMemberStatusHandler
    : IBridgeCommandHandler<UpdateChannelMemberStatusRequest, UpdateChannelMemberStatusResponse>
{
    private readonly ChannelsProjectionService _projection;

    public UpdateChannelMemberStatusHandler(ChannelsProjectionService projection) => _projection = projection;

    public async ValueTask<UpdateChannelMemberStatusResponse?> HandleAsync(
        UpdateChannelMemberStatusRequest request,
        BridgeRequestContext context,
        CancellationToken cancellationToken)
    {
        return await _projection.UpdateChannelMemberStatusAsync(request, cancellationToken).ConfigureAwait(false);
    }
}
