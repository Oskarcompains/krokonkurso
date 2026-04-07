import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const contest = await prisma.contest.findFirst({
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

  if (!contest) {
    // Return the next upcoming contest if no contest today
    const next = await prisma.contest.findFirst({
      where: {
        status: { not: "CANCELLED" },
        scheduledAt: { gt: now },
      },
      include: {
        contestPrizes: {
          include: { prize: true },
          orderBy: { rank: "asc" },
        },
        _count: { select: { participations: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(next);
  }

  return NextResponse.json(contest);
}
