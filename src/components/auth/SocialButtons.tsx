"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, KakaoIcon } from "@/components/icons";
import { FormError } from "./fields";

type Provider = "kakao" | "google";

export function SocialButtons() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Provider | null>(null);

  async function signIn(provider: Provider) {
    setError(null);
    setBusy(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(
        provider === "kakao"
          ? "카카오 로그인이 아직 준비되지 않았어요. 이메일로 로그인해 주세요."
          : "Google 로그인이 아직 준비되지 않았어요. 이메일로 로그인해 주세요.",
      );
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => signIn("kakao")}
        disabled={busy !== null}
        className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-kakao text-base font-semibold text-ink disabled:opacity-70"
      >
        <KakaoIcon size={20} />
        카카오로 계속하기
      </button>
      <button
        type="button"
        onClick={() => signIn("google")}
        disabled={busy !== null}
        className="flex h-14 items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-gray-2 bg-white text-base font-semibold text-ink disabled:opacity-70"
      >
        <GoogleIcon size={20} />
        Google로 계속하기
      </button>
      {error && <FormError>{error}</FormError>}
    </div>
  );
}
