import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { Prisma } from "@prisma/client";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  await prisma.clientProfile.update({
    where: { userId: session.user.id },
    data: {
      googleHealthConnected: false,
      googleHealthTokens: Prisma.DbNull,
    },
  });

  return NextResponse.redirect(
    `${process.env.AUTH_URL ?? "https://longeneer.com"}/client/profile`,
  );
}
