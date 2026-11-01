import { HeroJourney } from "@/components/motion/HeroJourney";
import { DestinationExplorer } from "@/components/motion/DestinationExplorer";
import { CircuitExplorer } from "@/components/motion/CircuitExplorer";
import { Marquee } from "@/components/motion/Marquee";
import { PickedForYou } from "@/components/motion/PickedForYou";
import { FeaturedPackages, HolidayTypesGrid, Stats, Testimonials, CtaBand } from "@/components/ui/HomeSections";
import { getDestinations, getHeroScenes, getCircuits } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <HeroJourney scenes={getHeroScenes()} />
      <Marquee items={["Kashmir", "Golden Triangle", "Houseboats", "Thailand", "Bali", "Dubai", "Vietnam", "Azerbaijan"]} />
      <PickedForYou />
      <DestinationExplorer destinations={getDestinations().slice(0, 8)} />
      <CircuitExplorer circuits={getCircuits()} />
      <FeaturedPackages />
      <HolidayTypesGrid />
      <Stats />
      <Testimonials />
      <CtaBand />
    </main>
  );
}
