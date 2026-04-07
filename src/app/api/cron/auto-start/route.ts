import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer, CONTEST_CHANNEL, EVENTS } from "@/lib/pusher";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const contests = await prisma.contest.findMany({
    where: {
      status: "OPEN",
      scheduledAt: { lte: now },
    },
  });

  const started = await Promise.all(
    contests.map(async (contest) => {
      const participantCount = await prisma.participation.count({
        where: { contestId: contest.id },
      });

      await prisma.contest.update({
        where: { id: contest.id },
        data: { status: "LIVE" },
      });

      await pusherServer.trigger(
        CONTEST_CHANNEL(contest.id),
        EVENTS.CONTEST_LIVE,
        { contestId: contest.id, participantCount }
      );

      return contest.id;
    })
  );

  return NextResponse.json({ started });
}
