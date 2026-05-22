import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

const secret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-better-auth-secret-change-in-production-min-32-chars";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required for Better Auth.");
}

const mongoClient = new MongoClient(uri);

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient),
  baseURL,
  secret,
  trustedOrigins: [
    baseURL,
    process.env.CLIENT_ORIGIN,
    "http://localhost:3000",
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
        definePayload: ({ user }) => ({
          userId: user.id,
          email: user.email,
          name: user.name,
        }),
      },
    }),
  ],
});
