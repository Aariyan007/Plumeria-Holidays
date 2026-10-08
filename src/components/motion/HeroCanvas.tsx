"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { vertex, fragment } from "./heroShaders";

type Props = {
  images: string[];
  progress: React.RefObject<number>;
  container: React.RefObject<HTMLElement | null>;
  petals: number;
};

/** Pauses rendering while the hero is off-screen or the tab is hidden. */
function LoopControl({ container }: Pick<Props, "container">) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    let visible = true;
    const apply = () => setFrameloop(visible && !document.hidden ? "always" : "never");
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; apply(); });
    if (container.current) io.observe(container.current);
    document.addEventListener("visibilitychange", apply);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", apply); };
  }, [container, setFrameloop]);
  return null;
}

const imgSize = (t: THREE.Texture) => {
  const img = t.image as { width?: number; height?: number } | undefined;
  return img?.width && img.height ? new THREE.Vector2(img.width, img.height) : new THREE.Vector2(16, 9);
};

function ScenePlane({ images, progress }: Pick<Props, "images" | "progress">) {
  const textures = useTexture(images, (ts) => {
    (Array.isArray(ts) ? ts : [ts]).forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; });
  });
  const size = useThree((s) => s.size);
  const target = useMemo(() => new THREE.Vector2(0.5, 0.5), []);
  const uniforms = useMemo(() => ({
    uFrom: { value: textures[0] }, uTo: { value: textures[1] ?? textures[0] },
    uMix: { value: 0 }, uTime: { value: 0 }, uWater: { value: 1 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uImgFrom: { value: imgSize(textures[0]) }, uImgTo: { value: imgSize(textures[1] ?? textures[0]) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }), [textures]);

  const mat = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock, pointer }) => {
    if (!mat.current) return;
    const u = mat.current.uniforms as typeof uniforms;
    const p = Math.min(Math.max(progress.current ?? 0, 0), images.length - 1);
    const i = Math.min(Math.floor(p), images.length - 2);
    const from = textures[i], to = textures[i + 1] ?? from;
    u.uFrom.value = from; u.uTo.value = to;
    u.uImgFrom.value = imgSize(from); u.uImgTo.value = imgSize(to);
    u.uMix.value = p - i;
    u.uWater.value = i === 0 ? 1 - (p - i) : 0.15;
    u.uTime.value = clock.elapsedTime;
    u.uRes.value.set(size.width, size.height);
    target.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5);
    u.uMouse.value.lerp(target, 0.08);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/** Deterministic PRNG (mulberry32) so petal layout is pure and stable. */
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSeeds(count: number) {
  const r = rng(count * 7919);
  return Array.from({ length: count }, () => ({
    x: (r() - 0.5) * 12, y: r() * 10 - 5, z: r() * -4,
    speed: 0.15 + r() * 0.35, spin: r() * 2, phase: r() * 6.28, scale: 0.25 + r() * 0.35,
  }));
}

const PETAL_COLORS = ["#F9E27D", "#ffffff", "#F7A49B"];

function Petals({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.bezierCurveTo(-0.12, 0.2, -0.08, 0.42, 0.04, 0.44); s.bezierCurveTo(0.16, 0.44, 0.12, 0.2, 0, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  const seeds = useMemo(() => makeSeeds(count), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) mesh.current!.setColorAt(i, c.set(PETAL_COLORS[i % 3]));
    mesh.current!.instanceColor!.needsUpdate = true;
  }, [count]);

  useFrame(({ clock, pointer, viewport }, dt) => {
    const t = clock.elapsedTime;
    const mx = (pointer.x * viewport.width) / 2, my = (pointer.y * viewport.height) / 2;
    const step = Math.min(dt, 0.05);
    seeds.forEach((s, i) => {
      s.y -= s.speed * step;
      s.x += Math.sin(t * 0.6 + s.phase) * 0.004;
      const dx = mx - s.x, dy = my - s.y;
      if (dx * dx + dy * dy < 4) { s.x += dx * 0.01; s.y += dy * 0.01; }
      if (s.y < -6) { s.y = 6; s.x = ((i * 0.618 + t) % 1 - 0.5) * 12; }
      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(t * s.spin * 0.5, t * s.spin, s.phase);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]}>
      <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.9} />
    </instancedMesh>
  );
}

export default function HeroCanvas({ images, progress, container, petals }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      onCreated={({ gl }) => gl.setClearColor("#0F4C4A")}
      style={{ position: "absolute", inset: 0 }}
    >
      <LoopControl container={container} />
      <ScenePlane images={images} progress={progress} />
      {petals > 0 && <Petals count={petals} />}
    </Canvas>
  );
}
