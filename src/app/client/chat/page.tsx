import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listMessages, threadIdForClient } from "@/lib/messages";
import { ChatThread } from "@/components/ChatThread";
import { sendMessageAsClient } from "./actions";

export default async function ClientChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [messages, profile] = await Promise.all([
    listMessages(threadIdForClient(session.user.id)),
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { assignedCoach: { select: { name: true } } },
    }),
  ]);
  const designerName = profile?.assignedCoach?.name ?? "Longevity Designer";

  return (
    <main className="min-h-screen bg-canvas pb-6">
      <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/client"
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3"
            aria-label="กลับ"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-ink leading-tight">
              บันทึกการคุย
            </p>
            <p className="text-[11px] text-ink-3 leading-tight truncate">
              กับ Longevity Designer · ไม่ realtime — ทาง designer จะตอบเมื่อสะดวก
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-4 pt-4">
        <ChatThread messages={messages} currentUserId={session.user.id} />

        <form
          action={sendMessageAsClient}
          className="mt-6 bg-surface border border-border rounded-lg p-3"
        >
          <p className="text-[12px] font-semibold text-ink-3 mb-2">เขียนคำถามใหม่</p>
          <textarea
            name="content"
            required
            rows={3}
            placeholder="เช่น สัปดาห์นี้ HRV ต่ำลง ปกติมั้ย?"
            className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[10px] text-ink-4">
              เหมือนคอมเมนต์ — เก็บเป็น thread อ่านย้อนหลังได้
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
