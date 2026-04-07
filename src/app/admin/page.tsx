import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const [totalContests, totalPrizes, totalUsers, recentContests] = await Promise.all([
    prisma.contest.count(),
    prisma.prize.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.contest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { participations: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">Resumen</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-3xl font-black text-indigo-600">{totalContests}</p>
          <p className="text-sm text-gray-500 mt-1">Concursos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-3xl font-black text-green-600">{totalPrizes}</p>
          <p className="text-sm text-gray-500 mt-1">Premios</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-3xl font-black text-purple-600">{totalUsers}</p>
          <p className="text-sm text-gray-500 mt-1">Usuarios</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/admin/contests/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Nuevo concurso
        </Link>
        <Link
          href="/admin/prizes/new"
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          + Nuevo premio
        </Link>
      </div>

      {/* Recent contests */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Concursos recientes</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {recentContests.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm text-center">No hay concursos todavía.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Título</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Participantes</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentContests.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.scheduledAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}>
                        {getStatusLabel(c.status)}
                      </span>
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
    </div>
  );
}
