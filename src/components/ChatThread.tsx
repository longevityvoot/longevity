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
        <div className="size-16 rounded-full bg-pillar-sleep-wash flex items-center justify-center text-pillar-sleep text-[28px]">
          💬
        </div>
        <p className="mt-3 text-[14px] font-semibold text-ink-2">เริ่มคุยกับ designer</p>
        <p className="mt-1 text-[12px] text-ink-3 max-w-[260px]">
          ถามอะไรก็ได้ — ปวด, สงสัยเรื่องผลตรวจ, ของกิน, ยา
          <br />
          designer จะตอบเมื่อสะดวก
        </p>
      </div>
    );
  }

  // Group by day so each chunk gets a separator (e.g. "วันนี้", "เมื่อวาน",
  // "18 พ.ค.") instead of every message carrying a duplicate date.
  const groups = groupByDay(messages);

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.dayKey}>
          <p className="text-[10px] uppercase tracking-wider text-ink-4 font-semibold text-center mb-3">
            {g.label}
          </p>
          <ul className="space-y-2">
            {g.messages.map((m) => {
              const mine = m.userId === currentUserId;
              const designer = m.user.role === "COACH" || m.user.role === "ADMIN";
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] flex flex-col ${mine ? "items-end" : "items-start"}`}
                  >
                    {!mine ? (
                      <span className="text-[10px] text-ink-4 mb-0.5 ml-1">
                        {designer ? "designer" : m.user.name}
                      </span>
                    ) : null}
                    <div
                      className={`px-3 py-2 text-[14px] leading-relaxed ${
                        mine
                          ? "bg-ink text-white rounded-2xl rounded-br-md"
                          : designer
                          ? "bg-pillar-sleep-wash text-ink rounded-2xl rounded-bl-md"
                          : "bg-surface border border-border text-ink rounded-2xl rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                    <span className="text-[9px] text-ink-4 mt-0.5 px-1">
                      {formatTime(m.createdAt)}
                    </span>
                  </div>
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
      const diff = Math.round((today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
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
