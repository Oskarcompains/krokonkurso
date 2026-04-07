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
      status: "UPCOMING",
      registrationOpenAt: { lte: now },
    },
  });

  const updated = await Promise.all(
    contests.map(async (contest) => {
      await prisma.contest.update({
        where: { id: contest.id },
        data: { status: "OPEN" },
      });

      await pusherServer.trigger(
        CONTEST_CHANNEL(contest.id),
        EVENTS.CONTEST_OPEN,
        { contestId: contest.id, openAt: now.toISOString() }
      );

      return contest.id;
    })
  );

  return NextResponse.json({ opened: updated });
}
