import { prisma } from "@/lib/prisma";

export async function listInvoicesForClient(clientId: string) {
  return prisma.invoice.findMany({
    where: { clientId },
    orderBy: { issuedDate: "desc" },
    take: 20,
  });
}

export function invoiceTone(status: string): "ok" | "warning" | "danger" | "muted" {
  if (status === "paid") return "ok";
  if (status === "overdue") return "danger";
  if (status === "pending") return "warning";
  return "muted";
}
