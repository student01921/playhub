import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

function redirectToLogin(request: NextRequest, error: string, next: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("error", error);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), "/dashboard");

  const supabase = await createServerSupabase();
  if (!supabase) {
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    url.search = "";
    url.searchParams.set("reason", "auth");
    return NextResponse.redirect(url);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const url = request.nextUrl.clone();
      url.pathname = next.split("?")[0] ?? next;
      url.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
      return NextResponse.redirect(url);
    }

    return redirectToLogin(request, "link-failed", next);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      const url = request.nextUrl.clone();
      url.pathname = next.split("?")[0] ?? next;
      url.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
      return NextResponse.redirect(url);
    }

    return redirectToLogin(request, "link-failed", next);
  }

  return redirectToLogin(request, "missing-link", next);
}
