import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listChannelMessages,
  postChannelMessage,
  ensureDefaultChannel,
  listChannels,
  listChannelActivityEvents,
} from './sidecarBridgeApi';
import type { ChannelSummary, ChannelMessageRow, ChannelActivityEventRow } from '../electron/sidecarProtocol';

/** How often to poll for new messages and activity events (ms). */
const POLL_INTERVAL_MS = 30_000;

export interface ChannelState {
  /** The active/default channel for the current project, or null when no project is selected. */
  activeChannel: ChannelSummary | null;
  /** Most recent channel messages. */
  messages: ChannelMessageRow[];
  /** Recent channel activity events (agent runs, deliveries, etc.). */
  activityEvents: ChannelActivityEventRow[];
  /** All available channels in the current project. */
  channels: ChannelSummary[];
  /** The currently selected channel id, or null. */
  selectedChannelId: number | null;
  /** True while loading channel info or messages. */
  loading: boolean;
  /** Error message from the last operation, or null. */
  error: string | null;
  /** Send a plain-text message to the active channel. */
  sendMessage: (body: string) => Promise<void>;
  /** Refresh the message list from the bridge. */
  refreshMessages: () => Promise<void>;
  /** Switch to a different channel by id. */
  selectChannel: (channelId: number) => Promise<void>;
}

/**
 * Load both messages and activity events for a channel.
 */
async function loadChannelData(channelId: number) {
  const [msgResult, evResult] = await Promise.all([
    listChannelMessages({ channel_id: channelId, limit: 50 }),
    listChannelActivityEvents({ channel_id: channelId, limit: 30 }),
  ]);
  return { messages: msgResult.messages, activityEvents: evResult.events };
}

/**
 * Hook that manages channel state for a given project.
 *
 * - When `projectId` is null, all state is reset and no bridge calls are made.
 * - When `projectId` changes, `ensureDefaultChannel` is called to get/create the channel,
 *   then `listChannelMessages` loads recent messages.
 * - `sendMessage` posts via `postChannelMessage` and appends the result locally.
 * - Activity events are loaded in parallel with messages.
 */
export function useChannelState(projectId: string | null): ChannelState {
  const [activeChannel, setActiveChannel] = useState<ChannelSummary | null>(null);
  const [messages, setMessages] = useState<ChannelMessageRow[]>([]);
  const [activityEvents, setActivityEvents] = useState<ChannelActivityEventRow[]>([]);
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelIdRef = useRef<number | null>(null);

  // Refresh messages from the bridge using the current channel id.
  const refreshMessages = useCallback(async () => {
    const chId = channelIdRef.current;
    if (chId == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loadChannelData(chId);
      setMessages(data.messages);
      setActivityEvents(data.activityEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // On projectId change: list channels, ensure default, then load messages.
  useEffect(() => {
    if (!projectId) {
      setActiveChannel(null);
      setMessages([]);
      setActivityEvents([]);
      setChannels([]);
      setSelectedChannelId(null);
      channelIdRef.current = null;
      setError(null);
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        // List all channels for the project
        const { channels: projectChannels } = await listChannels({ project_id: projectId });
        if (cancelled) return;
        setChannels(projectChannels);

        // Ensure the default channel exists
        const defaultChannel = await ensureDefaultChannel({ project_id: projectId });
        if (cancelled) return;

        // Auto-select the default channel
        setActiveChannel(defaultChannel);
        setSelectedChannelId(defaultChannel.id);
        channelIdRef.current = defaultChannel.id;

        // Load messages + activity events for the selected (default) channel
        const data = await loadChannelData(defaultChannel.id);
        if (!cancelled) {
          setMessages(data.messages);
          setActivityEvents(data.activityEvents);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();

    const pollId = window.setInterval(() => {
      const chId = channelIdRef.current;
      if (chId == null) return;
      // Silently refresh — no loading spinner for polls, just update state
      loadChannelData(chId).then((data) => {
        setMessages(data.messages);
        setActivityEvents(data.activityEvents);
      }).catch(() => {
        // Silently swallow poll errors; UI error state is set by explicit operations
      });
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
    };
  }, [projectId]);

  // Send a message and append the result to local state.
  const sendMessage = useCallback(async (body: string) => {
    const chId = channelIdRef.current;
    if (chId == null) throw new Error('No active channel');
    setError(null);
    try {
      const result = await postChannelMessage({
        channel_id: chId,
        body,
        sender_identity: 'user',
        sender_type: 'desktop',
      });
      // Append the confirmed message to local state
      setMessages((prev) => [...prev, result.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }, []);

  // Switch to a different channel by id.
  const selectChannel = useCallback(async (channelId: number) => {
    // Find the channel in our cached list, or fall back to a lookup
    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return;
    setSelectedChannelId(channelId);
    setActiveChannel(channel);
    setMessages([]);
    setActivityEvents([]);
    setError(null);
    channelIdRef.current = channelId;
    setLoading(true);
    try {
      const data = await loadChannelData(channelId);
      setMessages(data.messages);
      setActivityEvents(data.activityEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [channels]);

  return {
    activeChannel,
    messages,
    activityEvents,
    channels,
    selectedChannelId,
    loading,
    error,
    sendMessage,
    refreshMessages,
    selectChannel,
  };
}
