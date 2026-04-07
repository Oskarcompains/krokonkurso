export type ContestStatus =
  | "UPCOMING"
  | "OPEN"
  | "LIVE"
  | "DRAWING"
  | "ENDED"
  | "CANCELLED";

export interface ContestWithPrizes {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  registrationOpenAt: string;
  status: ContestStatus;
  maxParticipants: number | null;
  contestPrizes: ContestPrizeWithPrize[];
  _count?: { participations: number };
}

export interface ContestPrizeWithPrize {
  id: string;
  rank: number;
  prize: PrizeData;
  wonPrize?: WonPrizeData | null;
}

export interface PrizeData {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  value: number | null;
}

export interface WonPrizeData {
  id: string;
  userId: string;
  drawnAt: string;
  claimed: boolean;
  user?: { id: string; name: string | null; email: string };
}

export interface ParticipantData {
  id: string;
  userId: string;
  ticketNumber: number;
  joinedAt: string;
  user: { id: string; name: string | null; email: string };
}

export interface WinnerPayload {
  rank: number;
  userId: string;
  userName: string;
  ticketNumber: number;
  prize: PrizeData;
  contestPrizeId: string;
}
