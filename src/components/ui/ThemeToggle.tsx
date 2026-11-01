"use client";
import { useSyncExternalStore } from "react";

// The `dark` class on <html> is the source of truth: set before paint by the script in layout.tsx,
// flipped here, and saved to localStorage. Without a saved choice it follows the system setting.
const media = () => window.matchMedia("(prefers-color-scheme: dark)");
const saved = () => { try { return localStorage.getItem("theme"); } catch { return null; } };

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const onSystem = (e: MediaQueryListEvent) => { if (!saved()) document.documentElement.classList.toggle("dark", e.matches); };
  const mq = media();
  mq.addEventListener("change", onSystem);
  return () => { observer.disconnect(); mq.removeEventListener("change", onSystem); };
}
const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const toggle = () => {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-fg/10 ${className}`}>
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        </svg>
      )}
    </button>
  );
}
