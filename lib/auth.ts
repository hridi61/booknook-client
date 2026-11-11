import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);
const db = mongoClient.db("booknook");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client: mongoClient }),

  // "Invalid origin" error er fix
  trustedOrigins: [
    "http://localhost:3000",
    "https://booknook-client-lake.vercel.app",
    "https://*.vercel.app",
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false, // register korle Login page e jabe
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-up/email": { window: 60, max: 20 },
      "/sign-in/email": { window: 60, max: 20 },
    },
  },

  plugins: [jwt(), nextCookies()],
});