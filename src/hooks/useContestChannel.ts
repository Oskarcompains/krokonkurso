"use client";

import { useEffect, useRef, useState } from "react";
import { getPusherClient, CONTEST_CHANNEL, EVENTS } from "@/lib/pusher";
import { WinnerPayload } from "@/types";

interface ContestChannelHandlers {
  onOpen?: () => void;
  onLive?: (data: { participantCount: number }) => void;
  onParticipantJoined?: (data: {
    userId: string;
    name: string;
    ticketNumber: number;
  }) => void;
  onDrawing?: (data: { rank: number; prize: { name: string } }) => void;
  onWinner?: (data: WinnerPayload) => void;
  onEnded?: (data: { contestId: string; winners?: WinnerPayload[] }) => void;
  onCancelled?: (data: { contestId: string; reason?: string }) => void;
}

export function useContestChannel(
  contestId: string | null,
  handlers: ContestChannelHandlers
) {
  const [memberCount, setMemberCount] = useState(0);
  const [connectionState, setConnectionState] = useState("disconnected");
  const channelRef = useRef<ReturnType<
    ReturnType<typeof getPusherClient>["subscribe"]
  > | null>(null);

  useEffect(() => {
    if (!contestId) return;

    const pusher = getPusherClient();
    setConnectionState("connecting");

    const channel = pusher.subscribe(CONTEST_CHANNEL(contestId));
    channelRef.current = channel;

    channel.bind("pusher:subscription_succeeded", (members: { count: number }) => {
      setMemberCount(members.count);
      setConnectionState("connected");
    });

    channel.bind("pusher:member_added", () => {
      setMemberCount((c) => c + 1);
    });

    channel.bind("pusher:member_removed", () => {
      setMemberCount((c) => Math.max(0, c - 1));
    });

    channel.bind(EVENTS.CONTEST_OPEN, () => handlers.onOpen?.());
    channel.bind(EVENTS.CONTEST_LIVE, handlers.onLive ?? (() => {}));
    channel.bind(EVENTS.PARTICIPANT_JOINED, handlers.onParticipantJoined ?? (() => {}));
    channel.bind(EVENTS.DRAWING, handlers.onDrawing ?? (() => {}));
    channel.bind(EVENTS.WINNER, handlers.onWinner ?? (() => {}));
    channel.bind(EVENTS.ENDED, handlers.onEnded ?? (() => {}));
    channel.bind(EVENTS.CANCELLED, handlers.onCancelled ?? (() => {}));

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CONTEST_CHANNEL(contestId));
      channelRef.current = null;
      setConnectionState("disconnected");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  return { memberCount, connectionState };
}
