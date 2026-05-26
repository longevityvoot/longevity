import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Longeneer Profile · Chaivoot",
  description: "24 คำถาม self-reflection สำหรับออกแบบระบบ longevity ที่เหมาะกับนิสัยตัวจริงของคุณ",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
