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

  if (contest.status !== "UPCOMING") {
    return NextResponse.json({ error: "Contest is not in UPCOMING state" }, { status: 400 });
  }

  const updated = await prisma.contest.update({
    where: { id: contestId },
    data: { status: "OPEN" },
  });

  await pusherServer.trigger(CONTEST_CHANNEL(contestId), EVENTS.CONTEST_OPEN, {
    contestId,
    openAt: new Date().toISOString(),
  });

  return NextResponse.json(updated);
}
