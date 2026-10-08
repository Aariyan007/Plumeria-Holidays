import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo className="h-20 w-20 text-plum" />
      <h1 className="font-display text-6xl">Lost in the backwaters</h1>
      <p className="text-ink/70">This page drifted away. Let us steer you home.</p>
      <Button href="/">Back to home</Button>
    </main>
  );
}
