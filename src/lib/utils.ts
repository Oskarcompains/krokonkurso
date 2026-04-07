import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    UPCOMING: "Próximamente",
    OPEN: "Inscripción abierta",
    LIVE: "En directo",
    DRAWING: "Sorteando...",
    ENDED: "Finalizado",
    CANCELLED: "Cancelado",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    UPCOMING: "bg-gray-100 text-gray-700",
    OPEN: "bg-green-100 text-green-700",
    LIVE: "bg-red-100 text-red-700 animate-pulse",
    DRAWING: "bg-yellow-100 text-yellow-700 animate-pulse",
    ENDED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
