"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setOpen(false); }
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => { const y = window.scrollY; setHidden(y > last && y > 120); last = y; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ${hidden && !open ? "-translate-y-full" : ""}`}>
      <div className="mx-4 mt-4 flex items-center justify-between rounded-full border border-white/40 bg-page/45 px-5 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl backdrop-saturate-150 md:mx-8 dark:border-white/10 dark:bg-page/50">
        <Link href="/" className="flex items-center gap-2 text-heading" aria-label="Plumeria Holidays home">
          <Logo /> <span className="font-display text-lg">Plumeria</span>
        </Link>
        <nav className="hidden gap-7 text-sm lg:flex" aria-label="Main">
          {site.nav.map((n) => (
            <Link key={n.href} href={n.href} className={`hover:text-accent ${pathname.startsWith(n.href) ? "text-accent" : ""}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 lg:gap-3">
          <ThemeToggle />
          <div className="hidden lg:block"><Button href="/contact">Plan my trip</Button></div>
          <button className="p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            <span className="sr-only">Menu</span>
            <span className="block h-0.5 w-6 bg-fg" /><span className="mt-1.5 block h-0.5 w-6 bg-fg" />
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="mx-4 mt-2 rounded-3xl bg-plum p-8 text-cream lg:hidden" aria-label="Mobile">
          {site.nav.map((n) => <Link key={n.href} href={n.href} className="block py-2 font-display text-3xl">{n.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
