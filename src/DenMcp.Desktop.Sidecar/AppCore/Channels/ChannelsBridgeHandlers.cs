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
