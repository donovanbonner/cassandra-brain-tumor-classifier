import BrainHero from "@/components/BrainHero";
import HowItWorks from "@/components/HowItWorks";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <BrainHero />
      <HowItWorks />
      <SiteFooter />
    </main>
  );
}
