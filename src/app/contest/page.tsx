export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { LiveContestRoom } from "./LiveContestRoom";
import Link from "next/link";

async function getTodayContest() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const today = await prisma.contest.findFirst({
    where: {
      scheduledAt: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
    include: {
      contestPrizes: {
        include: {
          prize: true,
          wonPrize: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
        orderBy: { rank: "asc" },
      },
      _count: { select: { participations: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  if (today) return today;

  return prisma.contest.findFirst({
    where: { status: { not: "CANCELLED" }, scheduledAt: { gt: now } },
    include: {
      contestPrizes: {
        include: { prize: true },
        orderBy: { rank: "asc" },
      },
      _count: { select: { participations: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

async function getParticipants(contestId: string) {
  return prisma.participation.findMany({
    where: { contestId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
}

export default async function ContestPage() {
  const contest = await getTodayContest();

  if (!contest) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No hay concurso disponible</h1>
        <p className="text-gray-500 mb-6">
          No hay ningún concurso programado por ahora. Vuelve pronto.
        </p>
        <Link href="/" className="text-indigo-600 font-medium hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const participants = await getParticipants(contest.id);

  // Serialize for client component
  const serializedContest = JSON.parse(JSON.stringify(contest));
  const serializedParticipants = JSON.parse(JSON.stringify(participants));

  return (
    <LiveContestRoom
      contest={serializedContest}
      initialParticipants={serializedParticipants}
    />
  );
}
