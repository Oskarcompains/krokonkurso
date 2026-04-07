import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contests = await prisma.contest.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      contestPrizes: { include: { prize: true }, orderBy: { rank: "asc" } },
      _count: { select: { participations: true } },
    },
  });
  return NextResponse.json(contests);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, scheduledAt, registrationOpenAt, maxParticipants } =
    await req.json();

  if (!title || !scheduledAt || !registrationOpenAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const contest = await prisma.contest.create({
    data: {
      title,
      description: description || null,
      scheduledAt: new Date(scheduledAt),
      registrationOpenAt: new Date(registrationOpenAt),
      maxParticipants: maxParticipants || null,
    },
  });

  return NextResponse.json(contest, { status: 201 });
}
