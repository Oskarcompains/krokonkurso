import { ContestForm } from "@/components/admin/ContestForm";
import { prisma } from "@/lib/prisma";

export default async function NewContestPage() {
  const prizes = await prisma.prize.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">Nuevo concurso</h1>
      <ContestForm prizes={prizes} />
    </div>
  );
}
