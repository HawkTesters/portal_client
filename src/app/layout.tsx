import { getServerSession } from "next-auth";
import authConfig from "@/lib/auth.config";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/sonner";
import { Lato } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Shadcn",
  description: "Basic dashboard with Next.js and Shadcn",
};

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Grab the session via getServerSession
  const session = await getServerSession(authConfig);

  return (
    <html lang="en" className={lato.className} suppressHydrationWarning>
      <body className="overflow-hidden">
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <Providers session={session}>
            <Toaster />
            {children}
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
