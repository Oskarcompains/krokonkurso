import Pusher from "pusher";
import PusherJS from "pusher-js";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

let pusherClient: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (!pusherClient) {
    pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return pusherClient;
}

export const CONTEST_CHANNEL = (contestId: string) =>
  `presence-contest-${contestId}`;

export const EVENTS = {
  CONTEST_OPEN: "contest:open",
  CONTEST_LIVE: "contest:live",
  PARTICIPANT_JOINED: "contest:participant-joined",
  DRAWING: "contest:drawing",
  WINNER: "contest:winner",
  ENDED: "contest:ended",
  CANCELLED: "contest:cancelled",
} as const;
