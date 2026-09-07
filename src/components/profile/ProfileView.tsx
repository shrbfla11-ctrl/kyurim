"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormError, PasswordField, SuccessText, TextField } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserSummary } from "@/components/auth/UserMenu";
import { collect, validateName, validateNewPassword, validatePasswordConfirm } from "@/components/auth/validate";

const card = "rounded-[20px] bg-white p-6 shadow-card";
const sectionTitle = "text-base font-bold";

function ProviderBadge({ provider }: { provider: string }) {
  const base = "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-gray-1 px-2.5 py-1.5 text-xs font-semibold text-gray-6";
  if (provider === "google")
    return (
      <span className={base}>
        <span className="h-2.5 w-2.5 rounded-full [background:conic-gradient(#EA4335_0_25%,#FBBC05_0_50%,#34A853_0_75%,#4285F4_0)]" />
        Google
      </span>
    );
  if (provider === "kakao")
    return (
      <span className={base}>
        <span className="h-2.5 w-2.5 rounded-full bg-kakao" />
        카카오
      </span>
    );
  return (
    <span className={base}>
      <Mail size={12} strokeWidth={2.5} />
      이메일
    </span>
  );
}

/** 내 프로필: 기본 정보 · 비밀번호 변경 · 마케팅 수신 · 계정 삭제 */
export function ProfileView({ user }: { user: UserSummary }) {
  const router = useRouter();
  const supabase = createClient();
  const hasPassword = user.providers.includes("email");

  // 기본 정보
  const [name, setName] = useState(user.name ?? "");
  const [nameError, setNameError] = useState<string>();
  const [nameSaved, setNameSaved] = useState(false);
  const [nameBusy, setNameBusy] = useState(false);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    const err = validateName(name);
    setNameError(err);
    if (err) return;
    setNameBusy(true);
    const { error } = await supabase.from("profiles").update({ name: name.trim() }).eq("id", user.id);
    if (!error) await supabase.auth.updateUser({ data: { name: name.trim() } });
    setNameBusy(false);
    if (error) return setNameError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    setNameSaved(true);
    router.refresh();
    window.setTimeout(() => setNameSaved(false), 2500);
  }

  // 비밀번호
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    const v = collect<typeof pwErrors>({
      current: pw.current ? undefined : "현재 비밀번호를 입력해 주세요.",
      next: validateNewPassword(pw.next),
      confirm: validatePasswordConfirm(pw.next, pw.confirm),
    });
    setPwErrors(v.errors);
    if (v.hasError) return;
    setPwBusy(true);
    // 현재 비밀번호 확인 후 변경
    const check = await supabase.auth.signInWithPassword({ email: user.email ?? "", password: pw.current });
    if (check.error) {
      setPwBusy(false);
      return setPwErrors({ current: "현재 비밀번호가 올바르지 않아요." });
    }
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setPwBusy(false);
    if (error) return setPwMsg({ ok: false, text: "변경하지 못했어요. 잠시 후 다시 시도해 주세요." });
    setPw({ current: "", next: "", confirm: "" });
    setPwMsg({ ok: true, text: "비밀번호를 변경했어요." });
  }

  // 마케팅 수신
  const [marketing, setMarketing] = useState(user.marketingOptIn);
  async function toggleMarketing() {
    const next = !marketing;
    setMarketing(next);
    const { error } = await supabase.from("profiles").update({ marketing_opt_in: next }).eq("id", user.id);
    if (error) setMarketing(!next);
  }

  // 계정 삭제 (서버 처리 연결 전까지 안내만)
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 text-ink">
      <div className={`${card} flex items-center gap-4`}>
        <Avatar className="size-16">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="bg-blue-light text-2xl font-bold text-blue">
            {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-bold tracking-[-0.02em]">{user.name ?? "PUF 사용자"}</div>
          {user.email && <div className="mt-0.5 font-inter text-sm text-gray-5">{user.email}</div>}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(user.providers.length ? user.providers : ["email"]).map((p) => (
              <ProviderBadge key={p} provider={p} />
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={saveName} noValidate className={card}>
        <div className={sectionTitle}>기본 정보</div>
        <div className="mt-4">
          <TextField
            label="이름"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(undefined);
            }}
            error={nameError}
            hint={nameSaved ? <SuccessText>저장했어요</SuccessText> : undefined}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" variant="secondary" size="md" loading={nameBusy} loadingLabel="저장 중...">저장</Button>
        </div>
      </form>

      <form onSubmit={changePassword} noValidate className={card}>
        <div className={sectionTitle}>비밀번호 변경</div>
        {hasPassword ? (
          <>
            <div className="mt-4 flex flex-col gap-3">
              <PasswordField label="현재 비밀번호" name="current" autoComplete="current-password" placeholder="현재 비밀번호" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} error={pwErrors.current} />
              <PasswordField label="새 비밀번호" name="next" autoComplete="new-password" placeholder="영문·숫자 포함 8자 이상" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={pwErrors.next} />
              <PasswordField label="새 비밀번호 확인" name="confirm" autoComplete="new-password" placeholder="새 비밀번호 다시 입력" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErrors.confirm} />
            </div>
            {pwMsg && (pwMsg.ok ? <div className="mt-3"><SuccessText>{pwMsg.text}</SuccessText></div> : <div className="mt-3"><FormError>{pwMsg.text}</FormError></div>)}
            <div className="mt-4 flex justify-end">
              <Button type="submit" variant="secondary" size="md" loading={pwBusy} loadingLabel="변경 중...">변경</Button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm leading-normal text-gray-5">소셜 계정으로 로그인한 계정은 비밀번호가 없어요. 이메일 로그인이 필요하면 로그인 화면의 &quot;비밀번호 찾기&quot; 로 비밀번호를 만들 수 있어요.</p>
        )}
      </form>

      <div className={`${card} flex items-center justify-between gap-4`}>
        <div>
          <div className={sectionTitle}>마케팅 정보 수신</div>
          <div className="mt-1 text-sm leading-normal text-gray-5">정품 확인 소식과 혜택을 이메일로 받아요.</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={marketing}
          aria-label="마케팅 수신 토글"
          onClick={toggleMarketing}
          className={`flex h-8 w-[52px] flex-none items-center rounded-full p-[3px] transition-colors duration-300 hover:brightness-100 ${marketing ? "bg-blue" : "bg-gray-3"}`}
        >
          <span className={`block h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-transform duration-300 ${marketing ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      <div className={`${card} flex items-center justify-between gap-4`}>
        <div>
          <div className={sectionTitle}>계정 삭제</div>
          <div className="mt-1 text-sm leading-normal text-gray-5">스캔 기록과 계정 정보가 모두 삭제되며 복구할 수 없어요.</div>
        </div>
        <button
          type="button"
          onClick={() => setDeleteOpen((v) => !v)}
          className="h-11 flex-none rounded-[14px] px-4 text-[15px] font-bold text-red transition-colors duration-300 hover:bg-red-light hover:brightness-100"
        >
          계정 삭제
        </button>
      </div>
      {deleteOpen && (
        <div className="rounded-2xl bg-red-light p-4 text-sm leading-normal text-red-text">
          계정 삭제 기능은 준비 중이에요. 지금 삭제를 원하시면 <a href="mailto:admin@puf.com" className="font-bold text-red-dark">admin@puf.com</a> 으로 요청해 주시면 처리해 드려요.
        </div>
      )}
    </div>
  );
}
