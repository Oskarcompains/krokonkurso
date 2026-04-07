"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PrizeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [value, setValue] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/prizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        value: value ? parseFloat(value) : null,
        quantity: parseInt(quantity) || 1,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al crear el premio");
      setLoading(false);
      return;
    }

    router.push("/admin/prizes");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-lg"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Tarjeta regalo Amazon 50€"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Descripción del premio..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL de imagen
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor (€)
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="50.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

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
          {loading ? "Creando..." : "Crear premio"}
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
