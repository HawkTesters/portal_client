import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `getSession`, `useSession`, etc.
   */
  interface Session {
    user: {
      id: string;
      userType?: "GENERIC" | "TEAM" | "CLIENT" | "ADMIN";
      clientId?: string;
    } & DefaultSession["user"];
  }

  /**
   * Used to type the credentials input for the Credentials provider.
   */
  interface CredentialsInputs {
    email: string;
    password: string;
  }
}
