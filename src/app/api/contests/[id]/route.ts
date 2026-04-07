import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contest = await prisma.contest.findUnique({
    where: { id },
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
  });

  if (!contest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contest);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const contest = await prisma.contest.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.scheduledAt && { scheduledAt: new Date(body.scheduledAt) }),
      ...(body.registrationOpenAt && {
        registrationOpenAt: new Date(body.registrationOpenAt),
      }),
      ...(body.maxParticipants !== undefined && {
        maxParticipants: body.maxParticipants,
      }),
    },
  });

  return NextResponse.json(contest);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.contest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
