import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const useGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const useLine = !!(process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "CLIENT";
      }
      return token;
    },
  },
  providers: [
    ...(useLine
      ? [
          Line({
            clientId: process.env.LINE_CHANNEL_ID,
            clientSecret: process.env.LINE_CHANNEL_SECRET,
            authorization: {
              params: { scope: "openid profile" },
            },
            // LINE rejects authorize without state; bring it back alongside
            // the default PKCE check.
            checks: ["state"],
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
    ...(useGoogle ? [Google] : []),
  ],
});
