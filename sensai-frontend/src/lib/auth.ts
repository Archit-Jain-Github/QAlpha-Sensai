"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// Global auth state outside React's lifecycle
// This ensures authentication is managed once per browser session
const globalAuthState = {
  hasLoggedAuthentication: false,
  knownUserIds: new Set<string>()
};

// Type declarations are now in /src/types/next-auth.d.ts

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null as any
  });
  
  // Process session changes in an effect to control when it happens
  useEffect(() => {
    const isAuthenticated = status === "authenticated";
    const isLoading = status === "loading";
    
    // Only process authenticated sessions
    if (isAuthenticated && session?.user) {
      const userId = session.user.id;
      
      // Log authentication exactly once per unique user ID
      if (userId && !globalAuthState.knownUserIds.has(userId)) {
        globalAuthState.knownUserIds.add(userId);
      } else if (!userId && !globalAuthState.hasLoggedAuthentication) {
        globalAuthState.hasLoggedAuthentication = true;
      }
    }
    
    // Update the state once
    setAuthState({
      isAuthenticated,
      isLoading,
      user: session?.user
    });
  }, [session, status]);

  return authState;
};

interface GoogleUser {
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  image?: string;
  id?: string;
}

interface AuthCredentials {
  user: GoogleUser;
  account: {
    access_token?: string;
    id_token?: string;
    provider?: string;
  };
}

