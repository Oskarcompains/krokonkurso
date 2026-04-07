import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, CONTEST_CHANNEL, EVENTS } from "@/lib/pusher";
import crypto from "crypto";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contestId } = await params;

  const result = await prisma.$transaction(async (tx) => {
    const contest = await tx.contest.findUnique({
      where: { id: contestId },
      include: {
        contestPrizes: { orderBy: { rank: "asc" } },
        wonPrizes: true,
      },
    });

    if (!contest) throw new Error("Contest not found");
    if (!["LIVE", "DRAWING"].includes(contest.status)) {
      throw new Error("Contest must be LIVE to draw winners");
    }

    // Find next unawarded prize rank
    const awardedPrizeIds = contest.wonPrizes.map((w) => w.contestPrizeId);
    const nextPrize = contest.contestPrizes.find(
      (cp) => !awardedPrizeIds.includes(cp.id)
    );

    if (!nextPrize) throw new Error("All prizes already awarded");

    // Get all participants who haven't already won a prize
    const alreadyWonUserIds = contest.wonPrizes.map((w) => w.userId);
    const participations = await tx.participation.findMany({
      where: {
        contestId,
        userId: { notIn: alreadyWonUserIds },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (participations.length === 0) throw new Error("No eligible participants");

    // Cryptographically secure random selection
    const winnerIndex = crypto.randomInt(0, participations.length);
    const winner = participations[winnerIndex];

    // Fetch the prize details
    const prize = await tx.prize.findUnique({ where: { id: nextPrize.prizeId } });

    // Update contest status to DRAWING
    await tx.contest.update({
      where: { id: contestId },
      data: { status: "DRAWING" },
    });

    // Record the win
    const wonPrize = await tx.wonPrize.create({
      data: {
        contestId,
        userId: winner.userId,
        contestPrizeId: nextPrize.id,
      },
    });

    // Check if all prizes have been awarded
    const totalPrizes = contest.contestPrizes.length;
    const awardedCount = awardedPrizeIds.length + 1;
    const allAwarded = awardedCount >= totalPrizes;

    if (allAwarded) {
      await tx.contest.update({
        where: { id: contestId },
        data: { status: "ENDED" },
      });
    }

    return {
      winner,
      prize,
      wonPrize,
      nextPrize,
      allAwarded,
    };
  });

  const winnerPayload = {
    rank: result.nextPrize.rank,
    userId: result.winner.userId,
    userName: result.winner.user.name || result.winner.user.email,
    ticketNumber: result.winner.ticketNumber,
    prize: result.prize,
    contestPrizeId: result.nextPrize.id,
  };

  // Trigger drawing animation event
  await pusherServer.trigger(
    CONTEST_CHANNEL(contestId),
    EVENTS.DRAWING,
    { rank: result.nextPrize.rank, prize: result.prize }
  );

  // Small delay simulation (Pusher handles ordering; winner event carries full data)
  await pusherServer.trigger(
    CONTEST_CHANNEL(contestId),
    EVENTS.WINNER,
    winnerPayload
  );

  if (result.allAwarded) {
    const allWinners = await prisma.wonPrize.findMany({
      where: { contestId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        contestPrize: { include: { prize: true } },
      },
    });

    await pusherServer.trigger(CONTEST_CHANNEL(contestId), EVENTS.ENDED, {
      contestId,
      winners: allWinners.map((w) => ({
        rank: w.contestPrize.rank,
        userId: w.userId,
        userName: w.user.name || w.user.email,
        prize: w.contestPrize.prize,
      })),
    });
  }

  return NextResponse.json({ winner: winnerPayload, allAwarded: result.allAwarded });
}
