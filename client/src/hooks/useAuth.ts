import { useEffect, useState } from "react";
import type { User } from "@shared/schema";
import { buildUserForRole, getDemoSession, setDemoRole, type DemoRole } from "@/lib/demoSession";

function subscribeToSessionChanges(callback: () => void) {
  // Only listen to custom demo-session-updated event, not all storage events
  // to avoid unnecessary re-renders from other localStorage operations
  window.addEventListener("demo-session-updated", callback);
  return () => {
    window.removeEventListener("demo-session-updated", callback);
  };
}

export function useAuth() {
  const [user, setUser] = useState<User>(() => buildUserForRole(getDemoSession().role));

  useEffect(() => {
    const handleUpdate = () => {
      const session = getDemoSession();
      const newUser = buildUserForRole(session.role);
      // Only update if role actually changed to prevent unnecessary re-renders
      setUser((prevUser) => {
        if (prevUser.role !== newUser.role || prevUser.id !== newUser.id) {
          return newUser;
        }
        return prevUser;
      });
    };
    return subscribeToSessionChanges(handleUpdate);
  }, []);

  const sessionRole = user.role as DemoRole;

  return {
    user,
    role: sessionRole,
    isLoading: false,
    isAuthenticated: true,
    accessDenied: false,
    notRegisteredSupplier: false,
    errorMessage: undefined,
    switchRole: setDemoRole,
  };
}
