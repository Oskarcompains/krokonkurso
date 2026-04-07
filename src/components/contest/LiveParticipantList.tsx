"use client";

import { ParticipantData } from "@/types";

interface LiveParticipantListProps {
  participants: ParticipantData[];
  currentUserId?: string;
}

export function LiveParticipantList({
  participants,
  currentUserId,
}: LiveParticipantListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Participantes</h3>
        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
          {participants.length}
        </span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {participants.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">
            Nadie se ha unido todavía
          </p>
        )}
        {participants.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              p.userId === currentUserId
                ? "bg-indigo-50 border border-indigo-200"
                : "bg-gray-50"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
              {(p.user.name || p.user.email)[0].toUpperCase()}
            </div>
            <span className="flex-1 truncate text-gray-700">
              {p.user.name || p.user.email}
              {p.userId === currentUserId && (
                <span className="text-indigo-500 ml-1 text-xs">(tú)</span>
              )}
            </span>
            <span className="text-gray-400 text-xs shrink-0">#{p.ticketNumber}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
