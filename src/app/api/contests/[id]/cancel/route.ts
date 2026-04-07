import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, CONTEST_CHANNEL, EVENTS } from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contestId } = await params;
  const body = await req.json().catch(() => ({}));

  const contest = await prisma.contest.update({
    where: { id: contestId },
    data: { status: "CANCELLED" },
  });

  await pusherServer.trigger(CONTEST_CHANNEL(contestId), EVENTS.CANCELLED, {
    contestId,
    reason: body.reason || null,
  });

  return NextResponse.json(contest);
}
