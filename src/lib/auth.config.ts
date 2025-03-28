import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
        // Add an optional field for 2FA verification status.
        tokenVerified: { type: "text" },
      },
      async authorize(credentials) {
        console.log("CREDENTIALS? ", credentials);
        if (!credentials?.email) return null;

        if (credentials.tokenVerified === "true") {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          return user ?? null;
        }

        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        console.log("RES? ", res);
        if (!res.ok) {
          return null;
        }

        const user = await res.json();
        console.log("USER? ", user);
        // Ensure the returned user object has an id and email.
        if (!user.id) {
          user.id = user.userId; // In case your endpoint returned userId
        }
        if (!user.email) {
          user.email = credentials.email;
        }
        return user;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.clientId = user.clientId;
        token.picture = user.avatarUrl;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.userType = token.userType;
      session.user.clientId = token.clientId;
      session.user.picture = token.picture;
      return session;
    },
  },
};

export default authConfig;
