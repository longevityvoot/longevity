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
    <main className="min-h-screen bg-canvas pb-32">
      <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/client"
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3"
            aria-label="กลับ"
          >
            ←
          </Link>
          <div className="size-10 rounded-full bg-pillar-sleep-wash text-pillar-sleep flex items-center justify-center text-[14px] font-bold">
            {designerName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-ink leading-tight truncate">
              {designerName}
            </p>
            <p className="text-[11px] text-ink-3 leading-tight">designer ของคุณ</p>
          </div>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-4 pt-4">
        <ChatThread messages={messages} currentUserId={session.user.id} />
      </div>

      <form
        action={sendMessageAsClient}
        className="fixed left-0 right-0 bottom-16 bg-surface/95 backdrop-blur border-t border-border px-4 py-2.5 z-20"
      >
        <div className="max-w-[420px] mx-auto flex gap-2 items-end">
          <input
            name="content"
            required
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 h-11 rounded-pill border border-border-strong px-4 text-[14px] bg-canvas focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            className="size-11 rounded-full bg-ink text-white font-semibold text-[14px] flex items-center justify-center"
            aria-label="ส่ง"
          >
            ↑
          </button>
        </div>
      </form>
    </main>
  );
}
