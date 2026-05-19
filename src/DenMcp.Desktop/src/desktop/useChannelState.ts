import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listChannelMessages,
  postChannelMessage,
  ensureDefaultChannel,
} from './sidecarBridgeApi';
import type { ChannelSummary, ChannelMessageRow } from '../electron/sidecarProtocol';

export interface ChannelState {
  /** The active/default channel for the current project, or null when no project is selected. */
  activeChannel: ChannelSummary | null;
  /** Most recent channel messages. */
  messages: ChannelMessageRow[];
  /** True while loading channel info or messages. */
  loading: boolean;
  /** Error message from the last operation, or null. */
  error: string | null;
  /** Send a plain-text message to the active channel. */
  sendMessage: (body: string) => Promise<void>;
  /** Refresh the message list from the bridge. */
  refreshMessages: () => Promise<void>;
}

/**
 * Hook that manages channel state for a given project.
 *
 * - When `projectId` is null, all state is reset and no bridge calls are made.
 * - When `projectId` changes, `ensureDefaultChannel` is called to get/create the channel,
 *   then `listChannelMessages` loads recent messages.
 * - `sendMessage` posts via `postChannelMessage` and appends the result locally.
 */
export function useChannelState(projectId: string | null): ChannelState {
  const [activeChannel, setActiveChannel] = useState<ChannelSummary | null>(null);
  const [messages, setMessages] = useState<ChannelMessageRow[]>([]);
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
      const result = await listChannelMessages({ channel_id: chId, limit: 50 });
      setMessages(result.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // On projectId change: ensure default channel, then load messages.
  useEffect(() => {
    if (!projectId) {
      setActiveChannel(null);
      setMessages([]);
      channelIdRef.current = null;
      setError(null);
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const channel = await ensureDefaultChannel({ project_id: projectId });
        if (cancelled) return;
        setActiveChannel(channel);
        channelIdRef.current = channel.id;

        const result = await listChannelMessages({ channel_id: channel.id, limit: 50 });
        if (!cancelled) {
          setMessages(result.messages);
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

    return () => {
      cancelled = true;
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

  return {
    activeChannel,
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages,
  };
}
