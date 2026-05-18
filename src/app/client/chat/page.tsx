import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listMessages, threadIdForClient } from "@/lib/messages";
import { ChatThread } from "@/components/ChatThread";
import { sendMessageAsClient } from "./actions";

export default async function ClientChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const threadId = threadIdForClient(session.user.id);
  const messages = await listMessages(threadId);

  return (
    <main className="min-h-screen bg-canvas pb-24">
      <div className="max-w-[420px] mx-auto px-5 py-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          คุยกับ designer
        </h1>

        <section className="mt-5 bg-surface border border-border rounded-lg p-4 min-h-[400px]">
          <ChatThread messages={messages} currentUserId={session.user.id} />
        </section>

        <form
          action={sendMessageAsClient}
          className="fixed left-0 right-0 bottom-16 bg-surface border-t border-border px-5 py-3 z-20"
        >
          <div className="max-w-[420px] mx-auto flex gap-2">
            <input
              name="content"
              required
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 h-11 rounded-md border border-border-strong px-3 text-[14px]"
            />
            <button
              type="submit"
              className="px-4 rounded-md bg-ink text-white font-semibold text-[14px]"
            >
              ส่ง
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
