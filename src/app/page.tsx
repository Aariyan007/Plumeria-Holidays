import { HeroJourney } from "@/components/motion/HeroJourney";
import { getHeroScenes } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <HeroJourney scenes={getHeroScenes()} />
      <section className="h-screen" />
    </main>
  );
}
