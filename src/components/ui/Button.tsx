import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";

export function Button({ href, children, variant = "primary", external = false }:
  { href: string; children: React.ReactNode; variant?: "primary" | "ghost"; external?: boolean }) {
  const cls = variant === "primary"
    ? "bg-pink text-ink hover:bg-plum hover:text-cream"
    : "border border-current hover:bg-ink hover:text-cream";
  const props = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Magnetic>
      <Link href={href} {...props}
        className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors ${cls}`}>
        {children}
      </Link>
    </Magnetic>
  );
}
