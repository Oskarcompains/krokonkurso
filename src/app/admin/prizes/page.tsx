import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPrizesPage() {
  const prizes = await prisma.prize.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Premios</h1>
        <Link
          href="/admin/prizes/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Nuevo premio
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prizes.length === 0 ? (
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-3">No hay premios todavía.</p>
            <Link href="/admin/prizes/new" className="text-indigo-600 font-medium hover:underline">
              Crear el primero →
            </Link>
          </div>
        ) : (
          prizes.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-bold text-gray-900">{p.name}</h3>
              {p.description && (
                <p className="text-sm text-gray-500 mt-1">{p.description}</p>
              )}
              {p.value && (
                <p className="text-indigo-600 font-semibold text-sm mt-2">
                  {p.value.toFixed(2)} €
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Cantidad: {p.quantity}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
