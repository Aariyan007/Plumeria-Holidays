"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A little traveller pulling a suitcase along the bottom of the screen, purely decorative. Walks to a random spot,
 * then waves, takes a photo, looks around or does a happy hop, and walks on; on desktop it waves when the mouse
 * comes close. Never takes clicks; hidden for reduced motion and print (see .walker in globals.css).
 * Drawn facing right in an 80x96 box; rotation pivots (svgOrigin) are hips, shoulders, neck and wheel hubs.
 */
export function Walker() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const [face, fig, head, eye, armF, armB, legF, legB, cam, flash, shadow] =
      [".wk-face", ".wk-fig", ".wk-head", ".wk-eye", ".wk-arm-f", ".wk-arm-b", ".wk-leg-f", ".wk-leg-b", ".wk-cam", ".wk-flash", ".wk-shadow"].map((s) => q(s)[0]);

    gsap.set(legF, { svgOrigin: "45 59" });
    gsap.set(legB, { svgOrigin: "38 59" });
    gsap.set(armF, { svgOrigin: "46 38" });
    gsap.set(armB, { svgOrigin: "37 38", rotation: 40 }); // holding the suitcase handle
    gsap.set(head, { svgOrigin: "42 31" });
    gsap.set(eye, { svgOrigin: "46 23" });
    gsap.set(flash, { svgOrigin: "61 27.5", scale: 0, autoAlpha: 0 });
    gsap.set(cam, { autoAlpha: 0 });
    gsap.set(shadow, { svgOrigin: "40 85" });
    q(".wk-wheel").forEach((w) => gsap.set(w, { svgOrigin: w.dataset.hub }));
    gsap.set(el, { x: -90, autoAlpha: 1 });

    // Walk cycle and rolling wheels run only while moving.
    const walk = gsap.timeline({ repeat: -1, yoyo: true, paused: true, defaults: { duration: 0.32, ease: "sine.inOut" } })
      .fromTo(legF, { rotation: 24 }, { rotation: -24 }, 0)
      .fromTo(legB, { rotation: -24 }, { rotation: 24 }, 0)
      .fromTo(armF, { rotation: -20 }, { rotation: 20 }, 0)
      .fromTo(fig, { y: 0 }, { y: -1.5, duration: 0.16, repeat: 1, yoyo: true }, 0);
    const wheels = gsap.to(q(".wk-wheel"), { rotation: 360, duration: 0.6, ease: "none", repeat: -1, paused: true });
    const startWalk = () => { walk.play(); wheels.play(); };
    const stopWalk = () => {
      walk.pause(); wheels.pause();
      gsap.to([legF, legB, armF], { rotation: 0, duration: 0.2 });
      gsap.to(fig, { y: 0, duration: 0.2 });
    };

    let facing = 1;
    const turn = (dir: number) => {
      if (dir === facing) return;
      facing = dir;
      gsap.to(face, { scaleX: dir, duration: 0.18, ease: "power1.inOut" });
    };

    const actions: (() => gsap.core.Timeline)[] = [
      // wave hello
      () => gsap.timeline()
        .to(armF, { rotation: -165, duration: 0.35, ease: "back.out(2)" })
        .to(head, { rotation: -5, duration: 0.3 }, "<")
        .to(armF, { rotation: -135, duration: 0.18, repeat: 5, yoyo: true, ease: "sine.inOut" })
        .to(armF, { rotation: 0, duration: 0.35, ease: "power2.inOut" })
        .to(head, { rotation: 0, duration: 0.3 }, "<"),
      // take a photo, with a flash
      () => gsap.timeline()
        .to(armF, { rotation: -118, duration: 0.4, ease: "power2.out" })
        .to(cam, { autoAlpha: 1, duration: 0.15 }, "<0.2")
        .to(head, { rotation: 4, duration: 0.3 }, "<")
        .to(flash, { scale: 6, autoAlpha: 0.9, duration: 0.08 }, "+=0.6")
        .to(flash, { autoAlpha: 0, duration: 0.35 })
        .set(flash, { scale: 0 })
        .to(cam, { autoAlpha: 0, duration: 0.15 }, "+=0.3")
        .to(armF, { rotation: 0, duration: 0.4, ease: "power2.inOut" }, "<")
        .to(head, { rotation: 0, duration: 0.3 }, "<"),
      // look around, glance back over the shoulder
      () => gsap.timeline()
        .to(head, { rotation: -9, duration: 0.4, ease: "sine.inOut" })
        .to(head, { rotation: 7, duration: 0.6, ease: "sine.inOut" }, "+=0.4")
        .to(head, { rotation: 0, duration: 0.4 }, "+=0.4")
        .call(() => turn(-facing), undefined, "+=0.2")
        .call(() => turn(-facing), undefined, "+=0.9"),
      // happy hop with both arms up (lets go of the suitcase for a moment)
      () => gsap.timeline()
        .to([armF, armB], { rotation: -165, duration: 0.25, ease: "power2.out" })
        .to(fig, { y: -12, duration: 0.22, ease: "power2.out", repeat: 3, yoyo: true })
        .to(shadow, { scale: 0.6, duration: 0.22, repeat: 3, yoyo: true }, "<")
        .to(armF, { rotation: 0, duration: 0.3 })
        .to(armB, { rotation: 40, duration: 0.3 }, "<"),
    ];

    // One step at a time; `current` is whatever is running, so a mouse wave can cut in.
    let current: gsap.core.Animation | null = null;
    const bounds = () => [70, Math.max(120, window.innerWidth - 150)]; // clear of the WhatsApp button

    function next() {
      const [min, max] = bounds();
      const x = gsap.getProperty(el, "x") as number;
      let target = gsap.utils.random(min, max);
      if (Math.abs(target - x) < 160) target = x < (min + max) / 2 ? Math.min(max, x + 260) : Math.max(min, x - 260);
      const dir = target > x ? 1 : -1;
      const speed = window.innerWidth < 768 ? 45 : 65; // px per second
      current = gsap.timeline({ onComplete: act })
        .call(turn, [dir])
        .call(startWalk, undefined, 0.2)
        .to(el, { x: target, duration: Math.abs(target - x) / speed, ease: "none" }, 0.2)
        .call(stopWalk);
    }

    function act() {
      const pick = Math.random();
      current = pick < 0.12 ? gsap.timeline().to({}, { duration: 0.5 }) : actions[Math.floor(Math.random() * actions.length)]();
      current.eventCallback("onComplete", () => { current = gsap.delayedCall(gsap.utils.random(0.4, 1.4), next); });
    }

    // Blinks on their own clock.
    let blinkCall: gsap.core.Tween;
    const blink = () => {
      gsap.to(eye, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1 });
      blinkCall = gsap.delayedCall(gsap.utils.random(2, 5), blink);
    };
    blinkCall = gsap.delayedCall(2, blink);

    // Desktop: wave at the mouse when it comes near (at most every 10s).
    let reacting = false, cooldownUntil = 0;
    const onMove = (e: PointerEvent) => {
      if (reacting || performance.now() < cooldownUntil) return;
      const r = el.getBoundingClientRect();
      if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) > 130) return;
      reacting = true;
      current?.kill();
      stopWalk();
      turn(e.clientX > r.left + r.width / 2 ? 1 : -1);
      current = actions[0]().eventCallback("onComplete", () => {
        reacting = false;
        cooldownUntil = performance.now() + 10_000;
        next();
      });
    };
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    next();
    return () => {
      window.removeEventListener("pointermove", onMove);
      current?.kill();
      blinkCall?.kill();
    };
  }, { scope: root });

  const skin = "#C68A62", skinShade = "#A86F4C", ink = "#2A1420";
  return (
    <div ref={root} aria-hidden className="walker">
      <div className="wk-face">
        <svg viewBox="0 0 80 96" className="block h-auto w-full overflow-visible">
          <ellipse className="wk-shadow" cx="40" cy="85" rx="24" ry="2.2" fill={ink} opacity="0.16" />

          {/* rolling suitcase, pulled behind */}
          <g>
            <line x1="20" y1="61" x2="24.5" y2="53" stroke="#8A8F98" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="6" y="60" width="20" height="22" rx="3.5" fill="#2E5E3E" />
            <rect x="6" y="66.5" width="20" height="2.6" fill="#F7C548" />
            <rect x="6" y="73" width="20" height="1.2" fill="#FFF8F0" opacity="0.35" />
            <rect x="9" y="61.5" width="3" height="19" rx="1.5" fill="#FFF8F0" opacity="0.12" />
            {[10, 22].map((cx) => (
              <g key={cx} className="wk-wheel" data-hub={`${cx} 83.5`}>
                <circle cx={cx} cy="83.5" r="2.4" fill={ink} />
                <line x1={cx - 1.6} y1="83.5" x2={cx + 1.6} y2="83.5" stroke="#FFF8F0" strokeWidth="0.7" />
              </g>
            ))}
          </g>

          <g className="wk-fig">
            {/* far arm, holding the handle */}
            <g className="wk-arm-b">
              <rect x="34" y="35" width="6" height="9" rx="3" fill="#C9437A" />
              <rect x="35" y="42" width="4.5" height="12" rx="2.2" fill={skinShade} />
              <circle cx="37.2" cy="55" r="2.6" fill={skinShade} />
            </g>
            {/* far leg */}
            <g className="wk-leg-b">
              <rect x="34.5" y="57" width="7" height="23" rx="3.5" fill="#3D1A2C" />
              <path d="M34 79h9q3 0 3 2.5v1.5h-12z" fill={ink} />
            </g>
            {/* near leg */}
            <g className="wk-leg-f">
              <rect x="41.5" y="57" width="7" height="23" rx="3.5" fill="#5B1A3A" />
              <path d="M41 79h9q3 0 3 2.5v1.5h-12z" fill={ink} />
              <path d="M41 82.2h12" stroke="#FFF8F0" strokeWidth="0.8" opacity="0.6" />
            </g>
            {/* body: shirt, collar, camera strap, belt and shorts */}
            <rect x="39.5" y="30" width="5" height="6" rx="1.5" fill={skinShade} />
            <path d="M33 37q0-4 4-4h10q4 0 4 4l1 18q0 4-4 4h-12q-4 0-4-4z" fill="#EC5B8C" />
            <path d="M38.5 33l3.5 4.5l3.5-4.5z" fill="#FFF8F0" />
            <path d="M35 35.5L49 55" stroke={ink} strokeWidth="1.1" opacity="0.45" />
            <circle cx="40" cy="44" r="0.9" fill="#FFF8F0" opacity="0.7" />
            <circle cx="40" cy="49" r="0.9" fill="#FFF8F0" opacity="0.7" />
            <rect x="33" y="55" width="19" height="7" rx="2.5" fill="#5B1A3A" />
            <rect x="33" y="55" width="19" height="1.6" fill="#3D1A2C" />

            <g className="wk-head">
              <circle cx="42" cy="24" r="9.5" fill={skin} />
              <path d="M33.2 21q-0.6 6.5 3.4 9.5l1.6-6.5z" fill={ink} />
              <circle cx="36.4" cy="25" r="2.1" fill={skinShade} />
              <path d="M44.6 19.6l3.4-0.5" stroke={ink} strokeWidth="0.9" strokeLinecap="round" />
              <ellipse className="wk-eye" cx="46" cy="23" rx="1.15" ry="1.6" fill={ink} />
              <path d="M50.4 23.2q1.8 1.4 0 2.8" stroke={skinShade} strokeWidth="0.9" fill="none" strokeLinecap="round" />
              <circle cx="47.6" cy="26.8" r="1.8" fill="#EC5B8C" opacity="0.4" />
              <path d="M45 28.4q2 1.6 4 0" stroke={ink} strokeWidth="0.9" fill="none" strokeLinecap="round" />
              {/* sun hat with a plumeria on the band */}
              <ellipse cx="42" cy="16.6" rx="13.5" ry="2.7" fill="#E9B43A" />
              <path d="M33 16.6q0-9.4 9-9.4t9 9.4z" fill="#F7C548" />
              <rect x="33.3" y="13" width="17.4" height="2.6" fill="#A8255A" />
              <g fill="#FFF8F0">
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle key={a} cx={37 + Math.sin((a * Math.PI) / 180) * 1.3} cy={14.3 - Math.cos((a * Math.PI) / 180) * 1.3} r="0.95" />
                ))}
              </g>
              <circle cx="37" cy="14.3" r="0.6" fill="#F7C548" />
            </g>

            {/* camera, shown only while taking a photo */}
            <g className="wk-cam">
              <rect x="56" y="23.5" width="10" height="7.5" rx="1.6" fill={ink} />
              <rect x="57.2" y="22" width="3" height="1.8" rx="0.5" fill={ink} />
              <circle cx="61" cy="27.3" r="2.5" fill="#55606E" />
              <circle cx="61.8" cy="26.5" r="0.7" fill="#FFF8F0" opacity="0.8" />
            </g>
            <circle className="wk-flash" cx="61" cy="27.5" r="2.5" fill="#FFF8F0" />

            {/* near arm */}
            <g className="wk-arm-f">
              <rect x="43" y="35" width="6" height="9" rx="3" fill="#EC5B8C" stroke="#C9437A" strokeWidth="0.6" />
              <rect x="44" y="42" width="4.5" height="12" rx="2.2" fill={skin} />
              <circle cx="46.2" cy="55" r="2.6" fill={skin} />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
