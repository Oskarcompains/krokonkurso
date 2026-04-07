import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  const contests = await prisma.contest.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { scheduledAt: "desc" },
    include: {
      contestPrizes: { include: { prize: true }, orderBy: { rank: "asc" } },
      wonPrizes: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { participations: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Todos los concursos</h1>
        <p className="text-gray-500 mt-1">Historial de concursos y resultados</p>
      </div>

      {contests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500">No hay concursos todavía.</p>
          <Link href="/" className="text-indigo-600 font-medium hover:underline mt-2 inline-block">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((contest) => {
            const isLive = ["LIVE", "DRAWING", "OPEN"].includes(contest.status);
            const isEnded = contest.status === "ENDED";
            return (
              <div
                key={contest.id}
                className={`bg-white rounded-2xl border p-5 hover:shadow-sm transition-shadow ${
                  isLive ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(contest.status)}`}
                      >
                        {getStatusLabel(contest.status)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(contest.scheduledAt)}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {contest.title}
                    </h2>
                    {contest.description && (
                      <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                        {contest.description}
                      </p>
                    )}

                    {/* Prize names */}
                    {contest.contestPrizes.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {contest.contestPrizes.map((cp) => (
                          <span
                            key={cp.id}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {cp.rank === 1 ? "🥇" : cp.rank === 2 ? "🥈" : "🥉"}{" "}
                            {cp.prize.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Winners */}
                    {isEnded && contest.wonPrizes.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-xs text-gray-400">Ganadores:</span>
                        {contest.wonPrizes.map((w) => (
                          <span
                            key={w.id}
                            className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full"
                          >
                            {w.user.name || w.user.email}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-xl font-black text-indigo-600">
                        {contest._count.participations}
                      </p>
                      <p className="text-xs text-gray-400">participantes</p>
                    </div>
                    <Link
                      href={
                        isLive
                          ? "/contest"
                          : `/contests/${contest.id}`
                      }
                      className={`text-sm px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isLive
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {isLive ? "Ver en directo" : "Ver resultados"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
