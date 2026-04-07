import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const participations = await prisma.participation.findMany({
    where: { userId: session.user.id },
    include: {
      contest: {
        include: {
          contestPrizes: { include: { prize: true }, orderBy: { rank: "asc" } },
          wonPrizes: {
            where: { userId: session.user.id },
            include: { contestPrize: { include: { prize: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const wins = participations.filter((p) => p.contest.wonPrizes.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Mi cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">{session.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-black text-indigo-600">{participations.length}</p>
          <p className="text-xs text-gray-500 mt-1">Concursos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-black text-green-600">{wins.length}</p>
          <p className="text-xs text-gray-500 mt-1">Premios ganados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-black text-yellow-600">
            {wins.filter((w) => !w.contest.wonPrizes[0]?.claimed).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Sin reclamar</p>
        </div>
      </div>

      {/* Won prizes */}
      {wins.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-gray-900 mb-4">🏆 Premios ganados</h2>
          <div className="space-y-3">
            {wins.map((p) =>
              p.contest.wonPrizes.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-xl border border-yellow-200 p-4 flex items-center gap-4"
                >
                  <div className="text-2xl">
                    {w.contestPrize.rank === 1
                      ? "🥇"
                      : w.contestPrize.rank === 2
                      ? "🥈"
                      : "🥉"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {w.contestPrize.prize.name}
                    </p>
                    <p className="text-sm text-gray-500">{p.contest.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(w.drawnAt)}</p>
                  </div>
                  {w.claimed ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Reclamado
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      Pendiente
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Participation history */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4">Historial de participación</h2>
        {participations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">Todavía no has participado en ningún concurso.</p>
            <Link href="/contest" className="text-indigo-600 font-medium hover:underline mt-2 inline-block">
              Ver el concurso de hoy →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {participations.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{p.contest.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(p.contest.scheduledAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(p.contest.status)}`}
                  >
                    {getStatusLabel(p.contest.status)}
                  </span>
                  <span className="text-xs text-gray-400">Ticket #{p.ticketNumber}</span>
                  {p.contest.wonPrizes.length > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">
                      🏆 Ganador
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
