import type { ReactNode } from "react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/CtaFooter";
import { getUserSummary } from "@/lib/auth/user";

export type LegalSection = { title: string; body: ReactNode };

// 약관·개인정보처리방침처럼 긴 문서를 보여주는 공용 레이아웃
export async function LegalPage({
  title,
  effective,
  intro,
  sections,
}: {
  title: string;
  effective: string;
  intro: string;
  sections: LegalSection[];
}) {
  const user = await getUserSummary();
  return (
    <>
      <Nav user={user} />
      <main className="mx-auto w-full max-w-[800px] px-6 pb-20 pt-10 lg:pt-16">
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] text-ink lg:text-[32px]">{title}</h1>
        <p className="mt-2 text-sm text-gray-4">시행일 {effective}</p>
        <p className="mt-6 text-[15px] leading-relaxed text-gray-6 lg:text-base">{intro}</p>
        <div className="mt-10 flex flex-col gap-10">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold tracking-[-0.02em] text-ink lg:text-xl">
                제{i + 1}조 {s.title}
              </h2>
              <div className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-gray-6 lg:text-base [&_li]:list-decimal [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1.5 [&_ol]:pl-5 [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-gray-2 [&_td]:px-3 [&_td]:py-2 [&_th]:bg-gray-1 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
