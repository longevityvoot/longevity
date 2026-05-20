"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  icon: (active: boolean) => React.ReactNode;
};

const ITEMS: Item[] = [
  {
    href: "/client",
    label: "หน้าหลัก",
    match: (p) =>
      p === "/client" || p.startsWith("/client/checkin") || p.startsWith("/client/pillars") || p.startsWith("/client/chat"),
    icon: HomeIcon,
  },
  {
    href: "/client/body",
    label: "บอดี้",
    match: (p) => p.startsWith("/client/body") || p.startsWith("/client/labs") || p.startsWith("/client/meds"),
    icon: BodyIcon,
  },
  {
    href: "/client/nutrition",
    label: "อาหาร",
    match: (p) => p.startsWith("/client/nutrition"),
    icon: UtensilIcon,
  },
  {
    href: "/client/profile",
    label: "โปรไฟล์",
    match: (p) => p.startsWith("/client/profile"),
    icon: ProfileIcon,
  },
];

// Hide the nav on focused flows where the page owns the bottom band itself
// (full-page form with sticky save, modal-like quick-log, etc).
const HIDE_ON = ["/client/checkin", "/client/weekly", "/client/body/log", "/client/labs/new", "/client/nutrition/add"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur border-t border-border pb-safe">
      <div className="max-w-[420px] mx-auto px-2 py-1.5 grid grid-cols-4">
        {ITEMS.map((it) => {
          const active = it.match(pathname);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center justify-center gap-0.5 h-12 rounded-md text-[10px] font-semibold ${
                active ? "text-ink" : "text-ink-4"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {it.icon(active)}
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon(active: boolean) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8.5z"
        stroke="currentColor"
        strokeWidth={1.75}
        fill={active ? "currentColor" : "none"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BodyIcon(active: boolean) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx={12} cy={6} r={3} stroke="currentColor" strokeWidth={1.75} fill={active ? "currentColor" : "none"} />
      <path
        d="M5 21v-1.5C5 16 8 14 12 14s7 2 7 5.5V21"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

function UtensilIcon(active: boolean) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3v8a2 2 0 002 2v8" fill={active ? "currentColor" : "none"} />
      <path d="M5 3v6" />
      <path d="M9 3v6" />
      <path d="M16 3c-1.5 0-3 1.5-3 5s1.5 5 3 5v8" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function ProfileIcon(active: boolean) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx={12} cy={8} r={4} stroke="currentColor" strokeWidth={1.75} fill={active ? "currentColor" : "none"} />
      <path
        d="M4 21c0-3.5 3-6 8-6s8 2.5 8 6"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
