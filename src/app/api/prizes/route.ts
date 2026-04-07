import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prizes = await prisma.prize.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(prizes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, imageUrl, value, quantity } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const prize = await prisma.prize.create({
    data: {
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      value: value || null,
      quantity: quantity || 1,
    },
  });

  return NextResponse.json(prize, { status: 201 });
}
