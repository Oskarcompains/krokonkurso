export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CountdownTimer } from "@/components/contest/CountdownTimer";
import { PrizeDisplay } from "@/components/contest/PrizeDisplay";
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils";

async function getTodayContest() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const today = await prisma.contest.findFirst({
    where: {
      scheduledAt: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
    include: {
      contestPrizes: {
        include: {
          prize: true,
          wonPrize: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
        orderBy: { rank: "asc" },
      },
      _count: { select: { participations: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  if (today) return today;

  return prisma.contest.findFirst({
    where: { status: { not: "CANCELLED" }, scheduledAt: { gt: now } },
    include: {
      contestPrizes: {
        include: { prize: true },
        orderBy: { rank: "asc" },
      },
      _count: { select: { participations: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export default async function HomePage() {
  const contest = await getTodayContest();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-gray-900 mb-4">
          🎁 Gana premios cada día
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          Únete al concurso diario, participa en directo y llévate premios increíbles.
          Gratis. Cada día.
        </p>
      </div>

      {contest ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 ${getStatusColor(contest.status)}`}
              >
                {getStatusLabel(contest.status)}
              </span>
              <h2 className="text-2xl font-bold text-gray-900">{contest.title}</h2>
              {contest.description && (
                <p className="text-gray-500 mt-1">{contest.description}</p>
              )}
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>{formatDate(contest.scheduledAt)}</p>
              <p className="mt-1">
                {contest._count.participations} participante
                {contest._count.participations !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {["UPCOMING", "OPEN"].includes(contest.status) && (
            <div className="mb-8">
              <CountdownTimer
                targetDate={contest.scheduledAt}
                label={
                  contest.status === "OPEN"
                    ? "El concurso empieza en"
                    : "La inscripción abre en"
                }
              />
            </div>
          )}

          {contest.contestPrizes.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-4">Premios de hoy</h3>
              <PrizeDisplay prizes={contest.contestPrizes} />
            </div>
          )}

          <div className="flex justify-center">
            <Link
              href="/contest"
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-lg shadow-md hover:shadow-lg"
            >
              {["LIVE", "DRAWING"].includes(contest.status)
                ? "Ver en directo →"
                : contest.status === "OPEN"
                ? "Inscribirse ahora →"
                : "Ver concurso →"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center mb-10">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No hay concurso hoy</h2>
          <p className="text-gray-400">Vuelve mañana para el próximo concurso diario.</p>
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: "⚡",
            title: "En directo",
            desc: "El sorteo ocurre en tiempo real. Todos ven quién gana al instante.",
          },
          {
            icon: "🎯",
            title: "Gratis",
            desc: "No hace falta pagar nada. Solo regístrate y únete al concurso de hoy.",
          },
          {
            icon: "🏆",
            title: "Premios reales",
            desc: "Regalamos productos, tarjetas regalo y mucho más cada día.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
