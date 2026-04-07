"use client";

import { useState } from "react";
import { useContestChannel } from "@/hooks/useContestChannel";
import { WinnerPayload, ContestStatus } from "@/types";

interface Contest {
  id: string;
  title: string;
  status: string;
  contestPrizes: { id: string; rank: number; prize: { name: string } }[];
}

export function LiveControlPanel({ contest }: { contest: Contest }) {
  const [status, setStatus] = useState<ContestStatus>(
    contest.status as ContestStatus
  );
  const [winners, setWinners] = useState<WinnerPayload[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Subscribe to contest channel so admin sees live state too
  useContestChannel(contest.id, {
    onOpen: () => setStatus("OPEN"),
    onLive: () => setStatus("LIVE"),
    onWinner: (w) => setWinners((prev) => [...prev, w]),
    onEnded: () => setStatus("ENDED"),
    onCancelled: () => setStatus("CANCELLED"),
  });

  async function action(endpoint: string, label: string) {
    setLoading(label);
    setError("");
    const res = await fetch(`/api/contests/${contest.id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error");
    } else {
      const d = await res.json();
      if (d.status) setStatus(d.status);
    }
    setLoading(null);
  }

  const awardedRanks = winners.map((w) => w.rank);
  const pendingPrizes = contest.contestPrizes.filter(
    (cp) => !awardedRanks.includes(cp.rank)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-gray-900 mb-4">Panel de control en directo</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        {status === "UPCOMING" && (
          <button
            onClick={() => action("open", "open")}
            disabled={loading === "open"}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading === "open" ? "..." : "✅ Abrir inscripción"}
          </button>
        )}

        {status === "OPEN" && (
          <button
            onClick={() => action("start", "start")}
            disabled={loading === "start"}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loading === "start" ? "..." : "🔴 Iniciar concurso en directo"}
          </button>
        )}

        {["LIVE", "DRAWING"].includes(status) && pendingPrizes.length > 0 && (
          <button
            onClick={() => action("draw", "draw")}
            disabled={loading === "draw" || status === "DRAWING"}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading === "draw" || status === "DRAWING"
              ? "🎰 Sorteando..."
              : `🎲 Sortear ${pendingPrizes[0]?.prize.name}`}
          </button>
        )}

        {["LIVE", "DRAWING", "OPEN"].includes(status) && (
          <button
            onClick={() => action("end", "end")}
            disabled={!!loading}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            ⏹ Finalizar
          </button>
        )}

        {!["ENDED", "CANCELLED"].includes(status) && (
          <button
            onClick={() => action("cancel", "cancel")}
            disabled={!!loading}
            className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
          >
            ❌ Cancelar
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {winners.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Ganadores</h3>
          <div className="space-y-2">
            {winners.map((w) => (
              <div
                key={w.contestPrizeId}
                className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm"
              >
                <span>{w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : "🥉"}</span>
                <span className="font-medium text-gray-900">{w.userName}</span>
                <span className="text-gray-500">— {w.prize.name}</span>
                <span className="text-gray-400 text-xs ml-auto">#{w.ticketNumber}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "ENDED" && winners.length === 0 && (
        <p className="text-gray-400 text-sm">
          Concurso finalizado. Recarga para ver los resultados completos.
        </p>
      )}
    </div>
  );
}
