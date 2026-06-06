import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.sub) {
        token.googleSub = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.googleSub) {
        session.user.uid = token.googleSub;
      }
      return session;
    },
  },
};
