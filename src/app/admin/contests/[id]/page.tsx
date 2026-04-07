import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LiveControlPanel } from "@/components/admin/LiveControlPanel";
import { PrizeDisplay } from "@/components/contest/PrizeDisplay";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";

export default async function AdminContestDetailPage({
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
          wonPrize: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
        orderBy: { rank: "asc" },
      },
      participations: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { participations: true } },
    },
  });

  if (!contest) notFound();

  const serialized = JSON.parse(JSON.stringify(contest));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mb-1 ${getStatusColor(contest.status)}`}>
            {getStatusLabel(contest.status)}
          </span>
          <h1 className="text-2xl font-black text-gray-900">{contest.title}</h1>
          <p className="text-gray-500 text-sm">{formatDate(contest.scheduledAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Control panel */}
        <div className="lg:col-span-2 space-y-6">
          <LiveControlPanel contest={serialized} />

          {/* Prizes */}
          {contest.contestPrizes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Premios</h2>
              <PrizeDisplay prizes={serialized.contestPrizes} />
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Participantes</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
              {contest._count.participations}
            </span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {contest.participations.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin participantes</p>
            ) : (
              contest.participations.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                    {(p.user.name || p.user.email)[0].toUpperCase()}
                  </div>
                  <span className="flex-1 truncate text-gray-700">
                    {p.user.name || p.user.email}
                  </span>
                  <span className="text-gray-400 text-xs">#{p.ticketNumber}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
