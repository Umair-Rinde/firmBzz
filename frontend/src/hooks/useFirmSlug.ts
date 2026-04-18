import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useAuth } from "@/context/AuthContext";

/**
 * Single source of truth for the active firm slug.
 * Priority: URL param > (admin acting as firm_admin: cookie firm) > auth user firm_slug > cookie.
 * Auth is preferred over cookie for normal users so switch-firm/login cannot leave a stale cookie
 * overriding the user returned from the server.
 */
export function useFirmSlug(): string | null {
  const { firmId } = useParams<{ firmId: string }>();
  const [cookies] = useCookies(["firm", "current_role"]);
  const { user } = useAuth();

  if (firmId) return firmId;

  if (
    user?.role === "admin" &&
    cookies.current_role === "firm_admin" &&
    cookies.firm
  ) {
    return cookies.firm;
  }

  return user?.firm_slug || cookies.firm || null;
}
