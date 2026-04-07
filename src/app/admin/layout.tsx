import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white shrink-0">
        <div className="p-4 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Admin Panel</p>
        </div>
        <nav className="p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            📊 Resumen
          </Link>
          <Link
            href="/admin/contests"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            🎯 Concursos
          </Link>
          <Link
            href="/admin/prizes"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            🎁 Premios
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );
}
