import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;

vec3 hash3(vec2 p) {
  vec3 q = vec3(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3)),
    dot(p, vec2(419.2, 371.9))
  );
  return fract(sin(q) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash3(i).xy - 0.5, f);
  float b = dot(hash3(i + vec2(1.0, 0.0)).xy - 0.5, f - vec2(1.0, 0.0));
  float c = dot(hash3(i + vec2(0.0, 1.0)).xy - 0.5, f - vec2(0.0, 1.0));
  float d = dot(hash3(i + vec2(1.0, 1.0)).xy - 0.5, f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) + 0.5;
}

float fbm(vec2 p, int octaves) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

float swellSteep(float x) {
  return sin(x) * 0.74 + sin(x * 2.0 + 1.7) * 0.22;
}

float oceanWaves(vec2 p, float t) {
  float h = 0.0;
  float spd = t * 0.30;

  vec2 w1 = vec2(0.91, 0.42);
  float d1 = dot(p, w1);
  h += swellSteep(d1 * 0.38 + spd * 0.72) * 0.40;
  h += swellSteep(d1 * 0.19 - spd * 0.45 + p.y * 0.11) * 0.27;

  vec2 w2 = vec2(-0.55, 0.84);
  float d2 = dot(p, w2);
  h += sin(d2 * 0.52 + spd * 0.88) * 0.24;
  h += sin(d2 * 1.05 - spd * 1.1 + p.x * 0.08) * 0.13;

  h += sin(p.x * 1.15 + p.y * 0.68 + spd * 1.25) * 0.108;
  h += sin(-p.x * 0.92 + p.y * 1.22 + spd * 1.05) * 0.098;
  h += sin(p.x * 2.1 - p.y * 1.55 + spd * 1.6) * 0.056;
  h += sin(p.x * 1.6 + p.y * 2.35 + spd * 1.95) * 0.045;

  h += fbm(p * 2.4 + spd * 0.35, 5) * 0.135;
  h += fbm(p * 5.2 + vec2(-spd * 0.2, spd * 0.15), 3) * 0.058;

  return h;
}

vec3 oceanNormal(vec2 p, float t) {
  float e = max(0.0045, 1.25 / u_resolution.y);
  float h  = oceanWaves(p, t);
  float hx = oceanWaves(p + vec2(e, 0.0), t);
  float hy = oceanWaves(p + vec2(0.0, e), t);
  return normalize(vec3(h - hx, e * 1.52, h - hy));
}

float softCausticLayer(vec2 p, float t, float scale) {
  vec2 q = p * scale;
  float a = sin(q.x * 1.05 + t * 0.55) * sin(q.y * 0.99 - t * 0.48);
  float b = sin(length(q * 0.52) * 2.75 + t * 0.85) * 0.5 + 0.5;
  float c = fbm(q * 0.42 + vec2(t * 0.035, -t * 0.03), 4);
  float v = a * 0.36 + b * 0.34 + c * 0.42;
  v = v * 0.5 + 0.5;
  return pow(clamp(v, 0.0, 1.0), 2.35);
}

float caustics(vec2 uv, float t) {
  float c1 = softCausticLayer(uv, t, 5.2);
  float c2 = softCausticLayer(uv + vec2(19.1, 8.4), t * 1.12, 7.8);
  return c1 * 0.55 + c2 * 0.45;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float t = u_time;

  vec3 deepBlue    = vec3(0.02, 0.07, 0.20);
  vec3 midBlue     = vec3(0.05, 0.18, 0.36);
  vec3 turquoise   = vec3(0.12, 0.52, 0.62);
  vec3 turquoiseHi = vec3(0.18, 0.62, 0.72);
  vec3 sssTeal     = vec3(0.14, 0.48, 0.55);
  vec3 foamCol   = vec3(0.82, 0.88, 0.92);
  vec3 foamBlue  = vec3(0.62, 0.76, 0.86);
  vec3 skyZenith = vec3(0.34, 0.44, 0.58);
  vec3 skyHoriz  = vec3(0.55, 0.64, 0.76);

  vec2 wuv = vec2(uv.x * aspect, uv.y) * 6.8;

  float h = oceanWaves(wuv, t);
  vec3 norm = oceanNormal(wuv, t);

  vec3 viewDir = vec3(0.0, 1.0, 0.0);
  vec3 lightDir = normalize(vec3(0.22, 0.78, 0.32));

  float gy = uv.y;
  float horizon = smoothstep(0.38, 0.92, gy);

  vec3 water = mix(deepBlue, midBlue, smoothstep(0.0, 0.52, gy));
  water = mix(water, turquoise, smoothstep(0.22, 0.72, gy));
  water = mix(water, turquoiseHi, smoothstep(0.58, 1.0, gy) * 0.9);

  float depthField = pow(1.0 - uv.y, 0.82);
  float depth = clamp(depthField - h * 0.28 + norm.x * 0.04, 0.0, 1.0);
  water *= mix(vec3(0.9, 0.93, 0.96), vec3(1.0), 0.28 + depth * 0.38);

  float crestH = smoothstep(0.08, 0.58, h);
  float sss = crestH * (1.0 - depth * 0.75) * max(dot(norm, lightDir), 0.0);
  water = mix(water, sssTeal, sss * 0.12);

  float e2 = max(0.008, 2.2 / u_resolution.y);
  vec2 dh = vec2(
    oceanWaves(wuv + vec2(e2, 0.0), t) - oceanWaves(wuv - vec2(e2, 0.0), t),
    oceanWaves(wuv + vec2(0.0, e2), t) - oceanWaves(wuv - vec2(0.0, e2), t)
  );
  float slope = length(dh) / e2;
  float foamSlope = smoothstep(1.8, 4.2, slope) * (1.0 - depth * 0.9);
  float foamPeak = smoothstep(0.38, 0.72, h) * (1.0 - depth * 1.2);
  float foamN = fbm(wuv * 7.0 + t * 0.28, 4);
  float foam = clamp(
    (foamSlope * 0.65 + foamPeak * 0.5) * smoothstep(0.25, 0.62, foamN),
    0.0,
    1.0
  );
  water = mix(water, mix(foamBlue, foamCol, 0.55), foam * 0.48);

  float NdV = clamp(dot(norm, viewDir), 0.0, 1.0);
  float R0 = 0.025;
  float fresnel = R0 + (1.0 - R0) * pow(1.0 - NdV, 5.0);
  vec3 skyMix = mix(skyHoriz, skyZenith, gy);
  water = mix(water, skyMix, fresnel * 0.52 * (0.5 + 0.5 * horizon));

  vec3 H = normalize(viewDir + lightDir);
  float specW = pow(max(dot(norm, H), 0.0), 88.0) * 0.38;
  float specT = pow(max(dot(norm, H), 0.0), 420.0);
  float sparkle = fbm(wuv * 14.0 + t * 0.45, 2);
  specT *= smoothstep(0.5, 0.95, sparkle) * 0.65;
  float specAmt = (specW + specT) * (1.0 - depth * 0.6) * (0.65 + 0.35 * horizon);
  water += specAmt * vec3(0.88, 0.93, 0.98);

  vec2 cUV = wuv * 0.32 + norm.xz * 0.38 + vec2(t * 0.018, t * 0.014);
  float caust = caustics(cUV, t);
  float caustMask = smoothstep(0.05, 0.4, depth) * (1.0 - foam * 0.6);
  water += caust * caustMask * vec3(0.16, 0.38, 0.48) * 0.28;

  float micro = fbm(wuv * 5.8 + t * 0.22, 3);
  water += micro * 0.012 * vec3(0.28, 0.42, 0.52);

  water *= 0.84;

  float vig = 1.0 - 0.16 * length((uv - 0.5) * vec2(1.08, 1.02));
  water *= vig;

  gl_FragColor = vec4(clamp(water, 0.0, 1.0), 1.0);
}
`;

function initGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    premultipliedAlpha: false,
  });
  if (!gl) return null;

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
      console.error("Shader:", gl!.getShaderInfoLog(s));
    return s;
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    console.error("Link:", gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const a = gl.getAttribLocation(prog, "a_position");
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    uTime: gl.getUniformLocation(prog, "u_time"),
    uRes: gl.getUniformLocation(prog, "u_resolution"),
  };
}

export default function WaterCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = initGL(canvas);
    if (!ctx) return;
    const { gl, uTime, uRes } = ctx;
    let raf = 0;

    function resize() {
      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        3,
      );
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();
    function draw() {
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform2f(uRes, canvas!.width, canvas!.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="water-canvas" />;
}
