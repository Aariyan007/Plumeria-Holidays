export const vertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const fragment = /* glsl */ `
uniform sampler2D uFrom; uniform sampler2D uTo;
uniform float uMix; uniform float uTime; uniform float uWater;
uniform vec2 uRes; uniform vec2 uImgFrom; uniform vec2 uImgTo; uniform vec2 uMouse;
varying vec2 vUv;

vec2 cover(vec2 uv, vec2 img) {
  float rs = uRes.x / uRes.y, ri = img.x / img.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
float wave(vec2 p) { return sin(p.x * 10.0 + uTime) * sin(p.y * 12.0 + uTime * 1.3); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { return vnoise(p) * 0.5 + vnoise(p * 2.0) * 0.25 + vnoise(p * 4.0) * 0.125; }

void main() {
  // water ripple, stronger on lower half
  float w = uWater * smoothstep(0.55, 0.0, vUv.y) * 0.006;
  vec2 ripple = vec2(wave(vUv * 3.0), wave(vUv * 3.0 + 7.0)) * w;
  // mouse lens
  float d = distance(vUv, uMouse);
  vec2 lens = (vUv - uMouse) * 0.03 * smoothstep(0.25, 0.0, d);
  // displacement crossfade
  // rising wipe with a soft, organic (fbm) edge
  float edge = (1.0 - vUv.y) * 0.6 + fbm(vUv * 3.0 + uTime * 0.05) * 0.4;
  float m = smoothstep(edge - 0.08, edge + 0.08, uMix * 1.2 - 0.1);
  vec2 base = vUv + ripple + lens;
  vec4 a = texture2D(uFrom, cover(base + vec2(0.0, m * 0.08), uImgFrom));
  vec4 b = texture2D(uTo, cover(base - vec2(0.0, (1.0 - m) * 0.08), uImgTo));
  gl_FragColor = mix(a, b, m);
  #include <colorspace_fragment>
}`;
