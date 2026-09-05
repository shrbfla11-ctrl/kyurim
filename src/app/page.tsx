import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ResultPreview } from "@/components/landing/ResultPreview";
import { Features } from "@/components/landing/Features";
import { Trust } from "@/components/landing/Trust";
import { Faq } from "@/components/landing/Faq";
import { Cta, Footer } from "@/components/landing/CtaFooter";

export default function Home() {
  return (
    <>
      <Nav />
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
