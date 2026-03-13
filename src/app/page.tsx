import { ArchitectureSection } from "@/components/marketing/architecture-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";
import { RoadmapSection } from "@/components/marketing/roadmap-section";
import { ScoringSection } from "@/components/marketing/scoring-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <ArchitectureSection />
      <ScoringSection />
      <RoadmapSection />
    </>
  );
}
