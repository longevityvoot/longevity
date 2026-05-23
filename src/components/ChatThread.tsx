// Renamed conceptually from "chat" to "thread of updates": comment-style
// list (all left-aligned, card per post) rather than left/right bubbles
// — sets honest async expectations since the system is not realtime.

type Author = { id: string; name: string; role: string };
type Message = { id: string; userId: string; content: string; createdAt: Date; user: Author };

export function ChatThread({
  messages,
  currentUserId,
}: {
  messages: Message[];
  currentUserId: string;
}) {
  if (messages.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center text-center">
        <div className="size-16 rounded-full bg-pillar-sleep-wash flex items-center justify-center text-pillar-sleep text-[24px]">
          ✎
        </div>
        <p className="mt-3 text-[14px] font-semibold text-ink-2">ยังไม่มีบันทึก</p>
        <p className="mt-1 text-[12px] text-ink-3 max-w-[260px]">
          เขียนถาม Longeneer ไว้ — เป็น thread บันทึกย้อนหลังได้ ไม่ต้องรอ realtime
        </p>
      </div>
    );
  }

  const groups = groupByDay(messages);

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.dayKey}>
          <p className="text-[10px] uppercase tracking-wider text-ink-4 font-semibold mb-2 px-1">
            {g.label}
          </p>
          <ul className="space-y-2">
            {g.messages.map((m) => {
              const mine = m.userId === currentUserId;
              const designer = m.user.role === "COACH" || m.user.role === "ADMIN";
              return (
                <li
                  key={m.id}
                  className={`rounded-lg p-3 border ${
                    designer
                      ? "bg-pillar-sleep-wash border-pillar-sleep/30"
                      : mine
                      ? "bg-surface border-border-strong"
                      : "bg-surface border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                        designer
                          ? "bg-pillar-sleep text-white"
                          : mine
                          ? "bg-ink text-white"
                          : "bg-canvas text-ink-2"
                      }`}
                    >
                      {(m.user.name ?? "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-ink leading-tight truncate">
                        {mine ? "คุณ" : designer ? "Longeneer" : m.user.name}
                      </p>
                      <p className="text-[10px] text-ink-4 leading-tight">
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[13.5px] text-ink whitespace-pre-wrap break-words leading-relaxed">
                    {m.content}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDay(messages: Message[]) {
  const out: { dayKey: string; label: string; messages: Message[] }[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const m of messages) {
    const d = new Date(m.createdAt);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    let group = out.find((g) => g.dayKey === dayKey);
    if (!group) {
      const diff = Math.round(
        (today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
          86400000,
      );
      const label =
        diff === 0
          ? "วันนี้"
          : diff === 1
          ? "เมื่อวาน"
          : d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      group = { dayKey, label, messages: [] };
      out.push(group);
    }
    group.messages.push(m);
  }
  return out;
}
