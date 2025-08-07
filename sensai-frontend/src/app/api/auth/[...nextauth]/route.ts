import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import type { User, Account, Profile } from "next-auth";
import { registerUserWithBackend } from "./utils";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // If signing in for the first time, save user info in token
      if (account && user) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        
        // If this is a Google signin, get userId from backend
        if (account.provider === 'google') {
          try {
            const result = await registerUserWithBackend(user, account);
            
            // Extract the ID from the result
            if (result && result.id) {
              // Store the backend userId directly in the token
              token.userId = result.id;
            } else {
              console.error("Backend response missing ID field");
            }
          } catch (error) {
            console.error("Error storing backend user ID:", error);
          }
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {      
      // Send properties to the client
      if (session.user) {
        // Use the backend user ID directly as the main ID
        if (token.userId) {
          session.user.id = String(token.userId); // Ensure ID is stored as string
        } else {
          console.log("No userId in token!");
        }
        
        // Add access token to session if it exists
        if (token.accessToken) {
          (session as any).accessToken = token.accessToken;
        }
      }
      
      return session;
    },
    
    async signIn({ user, account, profile }) {
      if (!account || !profile) return true;
      
      try {
        // We no longer need to call registerUserWithBackend here
        // since we're now doing it in the jwt callback to store the ID
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        // Still return true to not block the auth flow
        return true;
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 