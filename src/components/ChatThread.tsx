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
      <p className="text-[13px] text-ink-3 py-6 text-center">
        ยังไม่มีข้อความในเธรดนี้
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {messages.map((m) => {
        const mine = m.userId === currentUserId;
        const designer = m.user.role === "COACH" || m.user.role === "ADMIN";
        return (
          <li
            key={m.id}
            className={`flex ${mine ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
              <span className="text-[10px] text-ink-4 mb-0.5">
                {mine ? "คุณ" : designer ? "designer" : m.user.name} ·{" "}
                {new Date(m.createdAt).toLocaleString("th-TH", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div
                className={`rounded-lg px-3 py-2 text-[14px] ${
                  mine
                    ? "bg-ink text-white"
                    : designer
                    ? "bg-pillar-sleep-wash text-ink"
                    : "bg-surface border border-border text-ink"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
