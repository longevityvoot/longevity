import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listMessages, threadIdForClient } from "@/lib/messages";
import { ChatThread } from "@/components/ChatThread";
import { sendMessage } from "./actions";

export default async function CoachChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: clientId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, role: true },
  });
  if (!client || client.role !== "CLIENT") notFound();

  const threadId = threadIdForClient(clientId);
  const messages = await listMessages(threadId);

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[760px] mx-auto px-6 py-6">
        <Link
          href={`/coach/clients/${clientId}`}
          className="text-[13px] text-ink-3 inline-flex items-center gap-1"
        >
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          บันทึกการคุย — {client.name}
        </h1>
        <p className="text-[12px] text-ink-3 mt-1">
          เธรดแบบคอมเมนต์ ไม่ realtime
        </p>

        <section className="mt-6 bg-canvas border border-border rounded-lg p-4 min-h-[400px]">
          <ChatThread messages={messages} currentUserId={session.user.id} />
        </section>

        <form
          action={sendMessage.bind(null, clientId)}
          className="mt-4 bg-surface border border-border rounded-lg p-3"
        >
          <p className="text-[12px] font-semibold text-ink-3 mb-2">เขียนตอบกลับ</p>
          <textarea
            name="content"
            required
            rows={3}
            placeholder="เขียน insight / action item ให้ client..."
            className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[10px] text-ink-4">
              client เห็นทุกอย่างที่ส่งในเธรดนี้
            </p>
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-ink text-white font-semibold text-[13px]"
            >
              ส่ง
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
