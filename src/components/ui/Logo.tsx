import { useId } from "react";

export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F7C548" />
          <stop offset="55%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EC5B8C" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} d="M50 50 C 38 30, 42 8, 58 6 C 72 6, 68 32, 50 50 Z"
          fill={`url(#${id})`} stroke="currentColor" strokeWidth="1.5" transform={`rotate(${r} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="5" fill="#F7C548" />
    </svg>
  );
}
