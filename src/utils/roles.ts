/**
 * Head-coach checks for the signed-in user. The backend computes `is_head_coach` (coach-1 or
 * DEFAULT_COACH_EMAIL) and returns it on every user object, so the frontend never hard-codes
 * who the head coach is.
 */
export interface RoleAwareUser {
  id?: string;
  email?: string;
  role?: string;
  is_head_coach?: boolean;
}

export const isHeadCoach = (user: RoleAwareUser | null | undefined): boolean => Boolean(user?.is_head_coach);

/** The signed-in user cached at login and refreshed from /auth/me. */
export const getStoredUser = (): (RoleAwareUser & { full_name?: string; avatar?: string }) | null => {
  try {
    const stored = localStorage.getItem('globalorators_user') || localStorage.getItem('nubianfit_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};
