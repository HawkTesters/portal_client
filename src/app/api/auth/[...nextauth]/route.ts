import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

// NextAuth() returns a handler function that the App Router will use:
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
