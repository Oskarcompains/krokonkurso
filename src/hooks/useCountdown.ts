"use client";

import { useState, useEffect } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function useCountdown(targetDate: Date | string | null): CountdownResult {
  const target = targetDate ? new Date(targetDate) : null;

  const calculate = (): CountdownResult => {
    if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  };

  const [state, setState] = useState<CountdownResult>(calculate);

  useEffect(() => {
    if (!target) return;
    const interval = setInterval(() => setState(calculate()), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.getTime()]);

  return state;
}
