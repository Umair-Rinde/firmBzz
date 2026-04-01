import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useAuth } from "@/context/AuthContext";

/**
 * Single source of truth for the active firm slug.
 * Priority: URL param > cookie > auth context.
 * Returns `null` when no firm context is available.
 */
export function useFirmSlug(): string | null {
  const { firmId } = useParams<{ firmId: string }>();
  const [cookies] = useCookies(["firm"]);
  const { user } = useAuth();

  return firmId || cookies.firm || user?.firm_slug || null;
}
