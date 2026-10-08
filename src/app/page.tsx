import { HeroJourney } from "@/components/motion/HeroJourney";
import { DestinationExplorer } from "@/components/motion/DestinationExplorer";
import { getDestinations, getHeroScenes } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <HeroJourney scenes={getHeroScenes()} />
      <DestinationExplorer destinations={getDestinations().slice(0, 8)} />
    </main>
  );
}
