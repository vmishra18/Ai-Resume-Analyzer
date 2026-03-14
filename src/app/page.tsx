import { ArchitectureSection } from "@/components/marketing/architecture-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <ArchitectureSection />
    </>
  );
}
