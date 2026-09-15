import { StickyNav } from "@/components/layout/StickyNav";
import { Hero } from "@/components/marketing/Hero";
import { Marquee } from "@/components/marketing/Marquee";
import { PainSection } from "@/components/marketing/PainSection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <main>
      <StickyNav />
      <Hero />
      <Marquee />
      <PainSection />
      <HowItWorks />
      <FeatureGrid />
      <CTASection />
      <Footer />
    </main>
  );
}
