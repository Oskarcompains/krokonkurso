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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contestId } = await params;

  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (contest.status !== "OPEN") {
    return NextResponse.json(
      { error: "Registration is not open for this contest" },
      { status: 400 }
    );
  }

  const existing = await prisma.participation.findUnique({
    where: { userId_contestId: { userId: session.user.id, contestId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already joined" }, { status: 409 });
  }

  if (contest.maxParticipants) {
    const count = await prisma.participation.count({ where: { contestId } });
    if (count >= contest.maxParticipants) {
      return NextResponse.json({ error: "Contest is full" }, { status: 400 });
    }
  }

  const count = await prisma.participation.count({ where: { contestId } });

  const participation = await prisma.participation.create({
    data: {
      userId: session.user.id,
      contestId,
      ticketNumber: count + 1,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await pusherServer.trigger(
    CONTEST_CHANNEL(contestId),
    EVENTS.PARTICIPANT_JOINED,
    {
      userId: session.user.id,
      name: session.user.name || session.user.email,
      ticketNumber: participation.ticketNumber,
    }
  );

  return NextResponse.json(participation, { status: 201 });
}
