"use client";

import { WinnerPayload } from "@/types";
import { useEffect, useState } from "react";

interface WinnerAnnouncementProps {
  winner: WinnerPayload | null;
  isDrawing: boolean;
  drawingPrize?: { rank: number; prize: { name: string } } | null;
}

export function WinnerAnnouncement({
  winner,
  isDrawing,
  drawingPrize,
}: WinnerAnnouncementProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (winner) {
      setVisible(true);
    }
  }, [winner]);

  if (isDrawing && drawingPrize) {
    return (
      <div className="text-center py-8 animate-pulse">
        <div className="text-5xl mb-4">🎰</div>
        <p className="text-xl font-bold text-indigo-600">
          Sorteando {drawingPrize.prize.name}...
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!winner || !visible) return null;

  return (
    <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-6xl mb-4">🎉</div>
      <p className="text-gray-500 text-sm mb-1">
        {winner.rank === 1 ? "🥇 1er Premio" : winner.rank === 2 ? "🥈 2do Premio" : `🥉 ${winner.rank}er Premio`}
      </p>
      <h2 className="text-3xl font-black text-gray-900 mb-2">{winner.userName}</h2>
      <p className="text-indigo-600 font-semibold text-lg">{winner.prize.name}</p>
      <p className="text-gray-400 text-sm mt-1">Ticket #{winner.ticketNumber}</p>
    </div>
  );
}
