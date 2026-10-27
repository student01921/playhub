import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

/**
 * Handles the token-hash confirmation links used by Supabase's default email
 * templates. The PKCE `code` flow is handled by /auth/callback.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), "/dashboard");

  const supabase = await createServerSupabase();
  if (!supabase) {
    const setupUrl = request.nextUrl.clone();
    setupUrl.pathname = "/setup";
    setupUrl.search = "?reason=auth";
    return NextResponse.redirect(setupUrl);
  }

  if (!tokenHash || !type) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "?error=missing-link";
    return NextResponse.redirect(loginUrl);
  }

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "link-failed");
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  const destination = request.nextUrl.clone();
  destination.pathname = next.split("?")[0] ?? next;
  destination.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
  return NextResponse.redirect(destination);
}
