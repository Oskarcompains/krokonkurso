import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANK_LABELS = ["🥇 1er Premio", "🥈 2do Premio", "🥉 3er Premio"];
const RANK_BG = ["bg-yellow-50 border-yellow-300", "bg-gray-50 border-gray-300", "bg-amber-50 border-amber-300"];

export default async function ContestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      contestPrizes: {
        include: {
          prize: true,
          wonPrize: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { rank: "asc" },
      },
      _count: { select: { participations: true } },
    },
  });

  if (!contest) notFound();

  const isLive = ["LIVE", "DRAWING", "OPEN"].includes(contest.status);
  if (isLive) {
    // Redirect to live page
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔴</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Este concurso está en directo!</h1>
        <Link
          href="/contest"
          className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Ver en directo →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/contests"
        className="text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← Todos los concursos
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(contest.status)}`}
          >
            {getStatusLabel(contest.status)}
          </span>
          <span className="text-sm text-gray-400">{formatDate(contest.scheduledAt)}</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">{contest.title}</h1>
        {contest.description && (
          <p className="text-gray-500 mt-1">{contest.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-2">
          {contest._count.participations} participante
          {contest._count.participations !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Winners / prizes */}
      {contest.contestPrizes.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">
            {contest.status === "ENDED" ? "Ganadores" : "Premios"}
          </h2>
          {contest.contestPrizes.map((cp) => (
            <div
              key={cp.id}
              className={`border-2 rounded-2xl p-5 ${RANK_BG[cp.rank - 1] ?? "bg-white border-gray-200"}`}
            >
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {RANK_LABELS[cp.rank - 1] ?? `Premio ${cp.rank}`}
              </p>

              <div className="flex items-start gap-4">
                {cp.prize.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cp.prize.imageUrl}
                    alt={cp.prize.name}
                    className="w-20 h-20 object-cover rounded-xl shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{cp.prize.name}</h3>
                  {cp.prize.description && (
                    <p className="text-gray-500 text-sm mt-0.5">{cp.prize.description}</p>
                  )}
                  {cp.prize.value && (
                    <p className="text-indigo-600 font-semibold text-sm mt-1">
                      Valor: {cp.prize.value.toFixed(2)} €
                    </p>
                  )}

                  {cp.wonPrize ? (
                    <div className="mt-3 inline-flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-green-200">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                        {(cp.wonPrize.user.name || cp.wonPrize.user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {cp.wonPrize.user.name || cp.wonPrize.user.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(cp.wonPrize.drawnAt).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {cp.wonPrize.claimed ? (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Reclamado
                        </span>
                      ) : (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          Pendiente
                        </span>
                      )}
                    </div>
                  ) : (
                    contest.status === "ENDED" && (
                      <p className="text-gray-400 text-sm mt-2 italic">Sin ganador asignado</p>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400">Este concurso no tenía premios configurados.</p>
        </div>
      )}

      {/* Upcoming status */}
      {contest.status === "UPCOMING" && (
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
          <p className="text-indigo-700 font-medium">
            Este concurso aún no ha comenzado. Comienza el{" "}
            {formatDate(contest.scheduledAt)}.
          </p>
          <Link
            href="/contest"
            className="inline-block mt-3 text-indigo-600 font-semibold hover:underline"
          >
            Ir al concurso →
          </Link>
        </div>
      )}
    </div>
  );
}
