"use client";

import { useCountdown } from "@/hooks/useCountdown";

interface CountdownTimerProps {
  targetDate: string | Date;
  label?: string;
}

export function CountdownTimer({ targetDate, label = "El concurso empieza en" }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <div className="text-center py-4">
        <p className="text-indigo-600 font-bold text-lg animate-pulse">¡El concurso ha comenzado!</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-gray-500 text-sm mb-3">{label}</p>
      <div className="flex items-center justify-center gap-3">
        {days > 0 && (
          <div className="flex flex-col items-center">
            <div className="bg-indigo-600 text-white rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow">
              {String(days).padStart(2, "0")}
            </div>
            <span className="text-xs text-gray-500 mt-1">días</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="bg-indigo-600 text-white rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow">
            {String(hours).padStart(2, "0")}
          </div>
          <span className="text-xs text-gray-500 mt-1">horas</span>
        </div>
        <div className="text-indigo-400 text-2xl font-bold mb-4">:</div>
        <div className="flex flex-col items-center">
          <div className="bg-indigo-600 text-white rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow">
            {String(minutes).padStart(2, "0")}
          </div>
          <span className="text-xs text-gray-500 mt-1">min</span>
        </div>
        <div className="text-indigo-400 text-2xl font-bold mb-4">:</div>
        <div className="flex flex-col items-center">
          <div className="bg-indigo-600 text-white rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow">
            {String(seconds).padStart(2, "0")}
          </div>
          <span className="text-xs text-gray-500 mt-1">seg</span>
        </div>
      </div>
    </div>
  );
}
