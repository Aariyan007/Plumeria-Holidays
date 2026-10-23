"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, useGSAP);
// Scroll reveals: play on enter, and if a fast flick / scroll restore jumps straight past a trigger
// (which fires onLeave, not onEnter), finish the reveal instead of leaving text stuck half-hidden.
ScrollTrigger.defaults({ toggleActions: "play complete none none" });

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip, useGSAP };
