import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      // True if you want to allow the user to visit the route.
      // e.g. only allow if there's a valid JWT token
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
