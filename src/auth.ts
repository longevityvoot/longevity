import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const useGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const useLine = !!(process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  debug: true,
  logger: {
    error(error) {
      // Drill into the `cause` chain so OAuthCallbackError surfaces the
      // underlying provider response (LINE returns the actual reason in
      // error.cause.error_description).
      const layers: Record<string, unknown> = { message: error.message };
      let cur: unknown = (error as { cause?: unknown }).cause;
      let depth = 0;
      while (cur && depth < 5) {
        layers[`cause_${depth}`] = cur instanceof Error
          ? { message: cur.message, name: cur.name, stack: cur.stack }
          : cur;
        cur = (cur as { cause?: unknown }).cause;
        depth++;
      }
      console.error("[NEXTAUTH ERROR]", JSON.stringify(layers, null, 2));
    },
    warn(code) {
      console.warn("[NEXTAUTH WARN]", code);
    },
  },
  providers: [
    ...(useGoogle ? [Google] : []),
    ...(useLine
      ? [
          Line({
            clientId: process.env.LINE_CHANNEL_ID,
            clientSecret: process.env.LINE_CHANNEL_SECRET,
            authorization: {
              params: { scope: "openid profile" },
            },
            // LINE's authorize endpoint rejects requests without `state`.
            // NextAuth v5 defaults the LINE provider to PKCE-only — bring
            // state back explicitly so the authorization URL carries both.
            checks: ["pkce", "state"],
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name ?? "ลูกค้า LINE",
                email: profile.email ?? `line-${profile.sub}@line.local`,
                image: profile.picture ?? null,
              };
            },
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
