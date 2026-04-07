"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
}

interface ContestFormProps {
  prizes: Prize[];
  initial?: {
    id?: string;
    title?: string;
    description?: string;
    scheduledAt?: string;
    registrationOpenAt?: string;
    maxParticipants?: number | null;
  };
}

export function ContestForm({ prizes, initial }: ContestFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? new Date(initial.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [registrationOpenAt, setRegistrationOpenAt] = useState(
    initial?.registrationOpenAt
      ? new Date(initial.registrationOpenAt).toISOString().slice(0, 16)
      : ""
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initial?.maxParticipants?.toString() ?? ""
  );
  const [selectedPrizes, setSelectedPrizes] = useState<
    { prizeId: string; rank: number }[]
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contests", {
      method: "POST",
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
      const data = await res.json();
      setError(data.error || "Error al crear el concurso");
      setLoading(false);
      return;
    }

    const contest = await res.json();

    // Add prizes
    await Promise.all(
      selectedPrizes.map((sp) =>
        fetch(`/api/contests/${contest.id}/prizes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sp),
        })
      )
    );

    router.push(`/admin/contests/${contest.id}`);
  }

  function addPrize(prizeId: string, rank: number) {
    setSelectedPrizes((prev) => {
      const filtered = prev.filter((p) => p.rank !== rank && p.prizeId !== prizeId);
      return [...filtered, { prizeId, rank }];
    });
  }

  const ranks = [1, 2, 3];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Concurso del martes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Descripción del concurso..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inscripción abre *
          </label>
          <input
            type="datetime-local"
            value={registrationOpenAt}
            onChange={(e) => setRegistrationOpenAt(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora del sorteo *
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Máximo de participantes (dejar vacío = ilimitado)
        </label>
        <input
          type="number"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          min="1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Sin límite"
        />
      </div>

      {prizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Asignar premios
          </label>
          <div className="space-y-3">
            {ranks.map((rank) => {
              const selected = selectedPrizes.find((sp) => sp.rank === rank);
              return (
                <div key={rank} className="flex items-center gap-3">
                  <span className="text-sm w-20 shrink-0 text-gray-500">
                    {rank === 1 ? "🥇 1er lugar" : rank === 2 ? "🥈 2do lugar" : "🥉 3er lugar"}
                  </span>
                  <select
                    value={selected?.prizeId ?? ""}
                    onChange={(e) => {
                      if (e.target.value) addPrize(e.target.value, rank);
                      else setSelectedPrizes((prev) => prev.filter((p) => p.rank !== rank));
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— Sin premio —</option>
                    {prizes.map((p) => (
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

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? "Creando..." : "Crear concurso"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
