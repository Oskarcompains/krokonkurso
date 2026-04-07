"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <span className="text-2xl">🎁</span>
          <span>KroKonkurso</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
            Inicio
          </Link>
          <Link href="/contest" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
            Concurso
          </Link>
          {session && (
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
              Mi cuenta
            </Link>
          )}
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:block">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
