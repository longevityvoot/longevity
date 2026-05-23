"use client";

import { useEffect, useRef } from "react";
import { signInWithLine } from "./actions";

// Auto-submits the LINE sign-in server action on mount. Used when we
// detect the LINE in-app browser so the user never sees the login page
// — just a brief "กำลังเข้าสู่ระบบ..." then straight into LINE OAuth
// (which auto-authorizes since they're already inside LINE).
export function AutoLineSignIn({ from }: { from: string }) {
  const submitted = useRef(false);
  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    signInWithLine(from);
  }, [from]);

  return null;
}
