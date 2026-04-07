import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils";

export default async function AdminContestsPage() {
  const contests = await prisma.contest.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      _count: { select: { participations: true } },
      contestPrizes: { include: { prize: true }, orderBy: { rank: "asc" } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Concursos</h1>
        <Link
          href="/admin/contests/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Nuevo concurso
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {contests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 mb-3">No hay concursos todavía.</p>
            <Link href="/admin/contests/new" className="text-indigo-600 font-medium hover:underline">
              Crear el primero →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Título</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Premios</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Participantes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contests.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.scheduledAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.contestPrizes.map((cp) => cp.prize.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {c._count.participations}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/contests/${c.id}`}
                      className="text-indigo-600 text-xs hover:underline"
                    >
                      Gestionar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
