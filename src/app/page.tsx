import { getUserSummary } from "@/lib/auth/user";
import { Nav } from "@/components/landing/Nav";
import { SmoothAnchors } from "@/components/app/SmoothAnchors";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ResultPreview } from "@/components/landing/ResultPreview";
import { Features } from "@/components/landing/Features";
import { Trust } from "@/components/landing/Trust";
import { Faq } from "@/components/landing/Faq";
import { Cta, Footer } from "@/components/landing/CtaFooter";

export default async function Home() {
  const summary = await getUserSummary();

  return (
    <>
      <SmoothAnchors />
      <Nav user={summary} />
      <main>
        <Hero />
        <HowItWorks />
        <ResultPreview />
        <Features />
        <Trust />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
