import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, CONTEST_CHANNEL, EVENTS } from "@/lib/pusher";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contestId } = await params;

  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!["UPCOMING", "OPEN"].includes(contest.status)) {
    return NextResponse.json({ error: "Cannot start contest in current state" }, { status: 400 });
  }

  const participantCount = await prisma.participation.count({ where: { contestId } });

  const updated = await prisma.contest.update({
    where: { id: contestId },
    data: { status: "LIVE" },
  });

  await pusherServer.trigger(CONTEST_CHANNEL(contestId), EVENTS.CONTEST_LIVE, {
    contestId,
    participantCount,
  });

  return NextResponse.json(updated);
}
