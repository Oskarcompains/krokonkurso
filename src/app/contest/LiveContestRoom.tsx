"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useContestChannel } from "@/hooks/useContestChannel";
import { CountdownTimer } from "@/components/contest/CountdownTimer";
import { LiveParticipantList } from "@/components/contest/LiveParticipantList";
import { WinnerAnnouncement } from "@/components/contest/WinnerAnnouncement";
import { PrizeDisplay } from "@/components/contest/PrizeDisplay";
import { getStatusLabel, getStatusColor } from "@/lib/utils";
import {
  ContestWithPrizes,
  ParticipantData,
  WinnerPayload,
  ContestStatus,
} from "@/types";

interface Props {
  contest: ContestWithPrizes;
  initialParticipants: ParticipantData[];
}

export function LiveContestRoom({ contest, initialParticipants }: Props) {
  const { data: session } = useSession();

  const [status, setStatus] = useState<ContestStatus>(contest.status as ContestStatus);
  const [participants, setParticipants] = useState(initialParticipants);
  const [latestWinner, setLatestWinner] = useState<WinnerPayload | null>(null);
  const [allWinners, setAllWinners] = useState<WinnerPayload[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPrize, setDrawingPrize] = useState<{
    rank: number;
    prize: { name: string };
  } | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [hasJoined, setHasJoined] = useState(
    initialParticipants.some((p) => p.userId === session?.user?.id)
  );

  const handlers = {
    onOpen: useCallback(() => setStatus("OPEN"), []),
    onLive: useCallback(() => setStatus("LIVE"), []),
    onParticipantJoined: useCallback(
      (data: { userId: string; name: string; ticketNumber: number }) => {
        setParticipants((prev) => [
          ...prev,
          {
            id: data.userId + data.ticketNumber,
            userId: data.userId,
            ticketNumber: data.ticketNumber,
            joinedAt: new Date().toISOString(),
            user: { id: data.userId, name: data.name, email: "" },
          },
        ]);
      },
      []
    ),
    onDrawing: useCallback(
      (data: { rank: number; prize: { name: string } }) => {
        setIsDrawing(true);
        setDrawingPrize(data);
        setStatus("DRAWING");
        setLatestWinner(null);
      },
      []
    ),
    onWinner: useCallback((data: WinnerPayload) => {
      setIsDrawing(false);
      setDrawingPrize(null);
      setLatestWinner(data);
      setAllWinners((prev) => [...prev, data]);
    }, []),
    onEnded: useCallback(() => {
      setStatus("ENDED");
      setIsDrawing(false);
    }, []),
    onCancelled: useCallback(() => setStatus("CANCELLED"), []),
  };

  const { memberCount } = useContestChannel(contest.id, handlers);

  async function joinContest() {
    if (!session) {
      window.location.href = `/login`;
      return;
    }
    setJoinLoading(true);
    setJoinError("");

    const res = await fetch(`/api/contests/${contest.id}/join`, {
      method: "POST",
    });

    if (res.ok) {
      setHasJoined(true);
    } else {
      const data = await res.json();
      setJoinError(data.error || "Error al unirse");
    }
    setJoinLoading(false);
  }

  const isLiveOrDrawing = ["LIVE", "DRAWING"].includes(status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusColor(status)}`}
          >
            {isLiveOrDrawing && (
              <span className="w-2 h-2 bg-current rounded-full inline-block" />
            )}
            {getStatusLabel(status)}
          </span>
          {memberCount > 0 && (
            <span className="text-xs text-gray-400">{memberCount} viendo ahora</span>
          )}
        </div>
        <h1 className="text-3xl font-black text-gray-900">{contest.title}</h1>
        {contest.description && (
          <p className="text-gray-500 mt-1">{contest.description}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status-specific content */}
          {status === "UPCOMING" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <CountdownTimer
                targetDate={contest.registrationOpenAt}
                label="La inscripción abre en"
              />
            </div>
          )}

          {status === "OPEN" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-center mb-6">
                <CountdownTimer
                  targetDate={contest.scheduledAt}
                  label="El concurso empieza en"
                />
              </div>
              {!hasJoined ? (
                <div className="text-center">
                  {!session && (
                    <p className="text-gray-500 text-sm mb-3">
                      Necesitas una cuenta para participar
                    </p>
                  )}
                  <button
                    onClick={joinContest}
                    disabled={joinLoading}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-lg"
                  >
                    {joinLoading ? "Uniéndose..." : "¡Quiero participar!"}
                  </button>
                  {joinError && (
                    <p className="text-red-500 text-sm mt-2">{joinError}</p>
                  )}
                </div>
              ) : (
                <div className="text-center bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-semibold text-lg">
                    ✅ ¡Estás inscrito! Buena suerte 🍀
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Te avisaremos cuando empiece el sorteo
                  </p>
                </div>
              )}
            </div>
          )}

          {isLiveOrDrawing && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-center text-red-500 font-bold text-sm mb-4 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                CONCURSO EN DIRECTO
              </div>

              <WinnerAnnouncement
                winner={latestWinner}
                isDrawing={isDrawing}
                drawingPrize={drawingPrize}
              />

              {!isDrawing && !latestWinner && hasJoined && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🤞</div>
                  <p className="text-gray-600 font-medium">¡El sorteo va a comenzar!</p>
                </div>
              )}

              {!hasJoined && (
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No estás inscrito en este concurso</p>
                </div>
              )}
            </div>
          )}

          {status === "ENDED" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">🏆</div>
                <h2 className="text-2xl font-bold text-gray-900">Ganadores</h2>
              </div>
              {allWinners.length > 0 ? (
                <div className="space-y-4">
                  {allWinners.map((w) => (
                    <div
                      key={w.contestPrizeId}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="text-2xl">
                        {w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : "🥉"}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{w.userName}</p>
                        <p className="text-gray-500 text-sm">{w.prize.name}</p>
                      </div>
                      <span className="text-gray-400 text-xs">#{w.ticketNumber}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">Cargando resultados...</p>
              )}
            </div>
          )}

          {status === "CANCELLED" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-2">❌</div>
              <p className="text-gray-600">Este concurso ha sido cancelado.</p>
            </div>
          )}

          {/* Prizes */}
          {contest.contestPrizes.length > 0 && !["ENDED"].includes(status) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Premios</h3>
              <PrizeDisplay prizes={contest.contestPrizes} />
            </div>
          )}
        </div>

        {/* Sidebar: participants */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-fit">
          <LiveParticipantList
            participants={participants}
            currentUserId={session?.user?.id}
          />
        </div>
      </div>
    </div>
  );
}
