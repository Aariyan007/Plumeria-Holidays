import { HeroJourney } from "@/components/motion/HeroJourney";
import { DestinationExplorer } from "@/components/motion/DestinationExplorer";
import { KeralaMap } from "@/components/motion/KeralaMap";
import { getDestinations, getHeroScenes, getKeralaDestinations } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <HeroJourney scenes={getHeroScenes()} />
      <DestinationExplorer destinations={getDestinations().slice(0, 8)} />
      <KeralaMap stops={getKeralaDestinations()} />
    </main>
  );
}
