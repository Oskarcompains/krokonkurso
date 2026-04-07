import { ContestPrizeWithPrize } from "@/types";

interface PrizeDisplayProps {
  prizes: ContestPrizeWithPrize[];
}

const RANK_LABELS = ["🥇 1er Premio", "🥈 2do Premio", "🥉 3er Premio"];
const RANK_COLORS = [
  "border-yellow-400 bg-yellow-50",
  "border-gray-300 bg-gray-50",
  "border-amber-600 bg-amber-50",
];

export function PrizeDisplay({ prizes }: PrizeDisplayProps) {
  if (!prizes.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prizes.map((cp) => (
        <div
          key={cp.id}
          className={`border-2 rounded-xl p-4 ${RANK_COLORS[cp.rank - 1] ?? "border-gray-200 bg-white"}`}
        >
          <p className="text-xs font-semibold text-gray-500 mb-2">
            {RANK_LABELS[cp.rank - 1] ?? `Premio ${cp.rank}`}
          </p>
          {cp.prize.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cp.prize.imageUrl}
              alt={cp.prize.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          <h3 className="font-bold text-gray-900 text-lg">{cp.prize.name}</h3>
          {cp.prize.description && (
            <p className="text-sm text-gray-600 mt-1">{cp.prize.description}</p>
          )}
          {cp.prize.value && (
            <p className="text-indigo-600 font-semibold mt-2">
              Valor: {cp.prize.value.toFixed(2)} €
            </p>
          )}
          {cp.wonPrize && (
            <div className="mt-3 bg-white rounded-lg p-2 border border-green-200">
              <p className="text-xs text-green-600 font-medium">
                Ganador: {cp.wonPrize.user?.name || cp.wonPrize.user?.email}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
