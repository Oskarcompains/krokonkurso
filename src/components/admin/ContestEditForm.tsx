"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Prize {
  id: string;
  name: string;
  value: number | null;
}

interface ContestPrize {
  id: string;
  rank: number;
  prize: Prize;
}

interface ContestEditFormProps {
  contest: {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    registrationOpenAt: string;
    maxParticipants: number | null;
    status: string;
    contestPrizes: ContestPrize[];
  };
  allPrizes: Prize[];
}

export function ContestEditForm({ contest, allPrizes }: ContestEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(contest.title);
  const [description, setDescription] = useState(contest.description ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    new Date(contest.scheduledAt).toISOString().slice(0, 16)
  );
  const [registrationOpenAt, setRegistrationOpenAt] = useState(
    new Date(contest.registrationOpenAt).toISOString().slice(0, 16)
  );
  const [maxParticipants, setMaxParticipants] = useState(
    contest.maxParticipants?.toString() ?? ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Prize management
  const [prizeAssignments, setPrizeAssignments] = useState<
    { rank: number; prizeId: string; contestPrizeId?: string }[]
  >(contest.contestPrizes.map((cp) => ({ rank: cp.rank, prizeId: cp.prize.id, contestPrizeId: cp.id })));
  const [prizeLoading, setPrizeLoading] = useState(false);

  const isEditable = ["UPCOMING", "OPEN"].includes(contest.status);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const res = await fetch(`/api/contests/${contest.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        scheduledAt: new Date(scheduledAt).toISOString(),
        registrationOpenAt: new Date(registrationOpenAt).toISOString(),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error al guardar");
    } else {
      setSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  async function updatePrize(rank: number, prizeId: string) {
    setPrizeLoading(true);
    const existing = prizeAssignments.find((p) => p.rank === rank);

    // Remove old assignment if exists
    if (existing?.contestPrizeId) {
      await fetch(`/api/contests/${contest.id}/prizes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestPrizeId: existing.contestPrizeId }),
      });
    }

    if (prizeId) {
      // Add new
      const res = await fetch(`/api/contests/${contest.id}/prizes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizeId, rank }),
      });
      const newCp = await res.json();
      setPrizeAssignments((prev) => {
        const filtered = prev.filter((p) => p.rank !== rank);
        return [...filtered, { rank, prizeId, contestPrizeId: newCp.id }];
      });
    } else {
      setPrizeAssignments((prev) => prev.filter((p) => p.rank !== rank));
    }

    setPrizeLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">Detalles del concurso</h2>
        {!isEditable && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
            Solo lectura (concurso activo o finalizado)
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isEditable}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isEditable}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inscripción abre</label>
            <input
              type="datetime-local"
              value={registrationOpenAt}
              onChange={(e) => setRegistrationOpenAt(e.target.value)}
              disabled={!isEditable}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora del sorteo</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={!isEditable}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Máx. participantes
          </label>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            disabled={!isEditable}
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Sin límite"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✅ Cambios guardados
          </p>
        )}

        {isEditable && (
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </form>

      {/* Prize assignments */}
      {allPrizes.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Premios asignados
            {prizeLoading && <span className="ml-2 text-gray-400 text-xs">Actualizando...</span>}
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((rank) => {
              const assignment = prizeAssignments.find((p) => p.rank === rank);
              return (
                <div key={rank} className="flex items-center gap-3">
                  <span className="text-sm w-20 shrink-0 text-gray-500">
                    {rank === 1 ? "🥇 1er" : rank === 2 ? "🥈 2do" : "🥉 3er"}
                  </span>
                  <select
                    value={assignment?.prizeId ?? ""}
                    onChange={(e) => updatePrize(rank, e.target.value)}
                    disabled={!isEditable || prizeLoading}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">— Sin premio —</option>
                    {allPrizes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.value ? ` (${p.value.toFixed(2)} €)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
