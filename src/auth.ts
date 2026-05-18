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
  providers: [
    ...(useGoogle ? [Google] : []),
    ...(useLine
      ? [
          Line({
            clientId: process.env.LINE_CHANNEL_ID,
            clientSecret: process.env.LINE_CHANNEL_SECRET,
            authorization: {
              // openid required, profile returns displayName + picture.
              // email scope only resolves when the user granted email
              // permission on the LINE channel — we fall back synthetically
              // below.
              params: { scope: "openid profile email" },
            },
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
