import { prisma } from "@/lib/prisma";

// Thread ID convention: "client:<clientId>". Single thread per client where
// the client and their designer post messages back and forth.
export function threadIdForClient(clientId: string) {
  return `client:${clientId}`;
}

export async function listMessages(threadId: string, limit = 50) {
  const messages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { id: true, name: true, role: true } } },
  });
  return messages.reverse();
}
