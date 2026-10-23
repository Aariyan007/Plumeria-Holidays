import { getPackagedHolidayTypes, getPackages, type HolidayTypeSlug } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageFilter } from "@/components/motion/PackageFilter";

export const metadata = { title: "Tour Packages", description: "Domestic and international tour packages from Kochi, Kerala." };

export default async function PackagesPage({ searchParams }: PageProps<"/packages">) {
  const types = getPackagedHolidayTypes();
  const t = (await searchParams).type;
  const initialType = types.find((x) => x.slug === t)?.slug as HolidayTypeSlug | undefined;
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Packages" title="Ready-made journeys, made to bend" intro="Every package can be tailored: dates, hotels, pace and budget." />
      <div className="mt-12"><PackageFilter packages={getPackages()} types={types} initialType={initialType} /></div>
    </main>
  );
}
