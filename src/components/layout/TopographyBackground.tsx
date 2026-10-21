import { useEffect, useRef } from "react";
import "./TopoBackground.css";
import "./TopoBackground.css";

/* ---------- Tunables ---------- */
const FIELD_SCALE = 0.0038;
const ANIMATION_SPEED = 0.000055;
const LEVEL_START = 0.29;
const LEVEL_STEP = 0.105;
const LEVEL_COUNT = 5;
const MAX_DPR = 2;
const TARGET_FPS = 60;      // set 30 for a lighter, still smooth drift
const CELL_BUDGET = 70000;  // max field cells; larger screens get coarser cells
const MIN_CELL = 5;
const MAX_CELL = 10;
const FRAME_BUDGET_MS = 9;  // if avg work time exceeds this, quality steps down

/* ---------- Module-level, computed once ---------- */
const LAT = new Float32Array(65536);
(function seed(s) {
  for (let i = 0; i < LAT.length; i++) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    LAT[i] = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
})(20240607);

function noise(x: number, y: number) {
  const fx = Math.floor(x), fy = Math.floor(y);
  let tx = x - fx, ty = y - fy;
  tx = tx * tx * (3 - 2 * tx);
  ty = ty * ty * (3 - 2 * ty);
  const x0 = fx & 255, x1 = (x0 + 1) & 255;
  const y0 = (fy & 255) << 8, y1 = (((fy & 255) + 1) & 255) << 8;
  const a = LAT[y0 | x0], b = LAT[y0 | x1];
  const c = LAT[y1 | x0], d = LAT[y1 | x1];
  const top = a + (b - a) * tx;
  return top + (c + (d - c) * tx - top) * ty;
}

function fbm(x: number, y: number, octaves: number) {
  let sum = 0, amp = 0.58, total = 0, f = 1;
  for (let o = 0; o < octaves; o++) {
    sum += noise(x * f, y * f) * amp;
    total += amp;
    f *= 2.03;
    amp *= 0.5;
  }
  return sum / total;
}

// Corner bits: tl=8 tr=4 br=2 bl=1. Edges: 0 top, 1 right, 2 bottom, 3 left.
const SEG = new Int8Array([
  -1,-1,-1,-1,  3,2,-1,-1,  2,1,-1,-1,  3,1,-1,-1,
   0,1,-1,-1,  -1,-1,-1,-1, 0,2,-1,-1,  0,3,-1,-1,
   0,3,-1,-1,   0,2,-1,-1, -1,-1,-1,-1, 0,1,-1,-1,
   3,1,-1,-1,   2,1,-1,-1,  3,2,-1,-1, -1,-1,-1,-1,
]);
// Saddle cases (5, 10) are resolved with the cell centre value.
const SADDLE5_HIGH = [0, 3, 1, 2], SADDLE5_LOW = [0, 1, 2, 3];
const SADDLE10_HIGH = [0, 1, 2, 3], SADDLE10_LOW = [0, 3, 1, 2];

const LEVEL_ALPHA: number[] = [], LEVEL_WIDTH: number[] = [];
for (let i = 0; i < LEVEL_COUNT; i++) {
  LEVEL_ALPHA.push(0.3 + (i % 4) * 0.13);
  LEVEL_WIDTH.push(i % 3 === 0 ? 1.9 : 1.45);
}

export default function TopoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const context = canvasElement.getContext("2d", { desynchronized: true });
    if (!context) return;
    const canvas: HTMLCanvasElement = canvasElement;
    const ctx: CanvasRenderingContext2D = context;

    /* ---------- Per-instance state ---------- */
    let width = 0, height = 0, dpr = 1;
    let cell = MIN_CELL, minCell = MIN_CELL;
    let fw = 0, fh = 0, ww = 0, wh = 0;
    let field = new Float32Array(0);
    let warpX = new Float32Array(0), warpY = new Float32Array(0);
    let gradient: CanvasGradient;
    let raf = 0, resizeRaf = 0, last = 0, simTime = 0;
    let workSum = 0, workCount = 0;
    let disposed = false;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    /* ---------- Field ---------- */
    // Warp is low frequency: sampled every 4th cell and bilinearly interpolated.
    function buildField(drift: number) {
      const S = FIELD_SCALE, c = cell;

      for (let j = 0; j < wh; j++) {
        const ny = (j << 2) * c * S;
        for (let i = 0; i < ww; i++) {
          const nx = (i << 2) * c * S;
          const k = j * ww + i;
          warpX[k] = fbm(nx * 0.72 + 7.1 + drift * 0.5, ny * 0.72 + 3.8, 3) - 0.5;
          warpY[k] = fbm(nx * 0.72 + 1.9, ny * 0.72 + 8.2 - drift * 0.4, 3) - 0.5;
        }
      }

      for (let gy = 0; gy < fh; gy++) {
        const ny = gy * c * S;
        const j = gy >> 2, fy = (gy & 3) * 0.25;
        const r0 = j * ww, r1 = r0 + ww;
        const rowBase = gy * fw;

        for (let gx = 0; gx < fw; gx++) {
          const nx = gx * c * S;
          const i = gx >> 2, fx = (gx & 3) * 0.25;
          const a = r0 + i, b = r1 + i;

          const tX = warpX[a] + (warpX[a + 1] - warpX[a]) * fx;
          const bX = warpX[b] + (warpX[b + 1] - warpX[b]) * fx;
          const tY = warpY[a] + (warpY[a + 1] - warpY[a]) * fx;
          const bY = warpY[b] + (warpY[b + 1] - warpY[b]) * fx;
          const wx = tX + (bX - tX) * fy;
          const wy = tY + (bY - tY) * fy;

          const sx = nx + wx * 1.45 + drift;
          const sy = ny + wy * 1.45 - drift * 0.62;

          const broad = fbm(sx * 1.12 + 2.4, sy * 1.12 + 5.7, 3);
          const detail = fbm(sx * 2.1 + 11.0, sy * 2.1 + 1.3, 2);
          field[rowBase + gx] = broad * 0.78 + detail * 0.22;
        }
      }
    }

    /* ---------- Marching squares (allocation-free hot loop) ---------- */
    let ex = 0, ey = 0;
    function edgePoint(e: number, lv: number, x: number, y: number, v0: number, v1: number, v2: number, v3: number) {
      const c = cell;
      if (e === 0)      { ex = x + (c * (lv - v0)) / (v1 - v0); ey = y; }
      else if (e === 1) { ex = x + c; ey = y + (c * (lv - v1)) / (v2 - v1); }
      else if (e === 2) { ex = x + (c * (lv - v3)) / (v2 - v3); ey = y + c; }
      else              { ex = x; ey = y + (c * (lv - v0)) / (v3 - v0); }
    }

    function addSegment(path: Path2D, e0: number, e1: number, lv: number, x: number, y: number, v0: number, v1: number, v2: number, v3: number) {
      edgePoint(e0, lv, x, y, v0, v1, v2, v3);
      const ax = ex, ay = ey;
      edgePoint(e1, lv, x, y, v0, v1, v2, v3);
      path.moveTo(ax, ay);
      path.lineTo(ex, ey);
    }

    function drawContours() {
      const paths = [];
      for (let i = 0; i < LEVEL_COUNT; i++) paths.push(new Path2D());

      for (let gy = 0; gy < fh - 1; gy++) {
        const y = gy * cell;
        const row = gy * fw;
        for (let gx = 0; gx < fw - 1; gx++) {
          const i = row + gx;
          const v0 = field[i], v1 = field[i + 1];
          const v2 = field[i + fw + 1], v3 = field[i + fw];

          let mn = v0, mx = v0;
          if (v1 < mn) mn = v1; else if (v1 > mx) mx = v1;
          if (v2 < mn) mn = v2; else if (v2 > mx) mx = v2;
          if (v3 < mn) mn = v3; else if (v3 > mx) mx = v3;

          let k0 = Math.ceil((mn - LEVEL_START) / LEVEL_STEP);
          let k1 = Math.floor((mx - LEVEL_START) / LEVEL_STEP);
          if (k0 < 0) k0 = 0;
          if (k1 > LEVEL_COUNT - 1) k1 = LEVEL_COUNT - 1;
          if (k0 > k1) continue;

          const x = gx * cell;
          for (let k = k0; k <= k1; k++) {
            const lv = LEVEL_START + k * LEVEL_STEP;
            const code =
              (v0 >= lv ? 8 : 0) | (v1 >= lv ? 4 : 0) | (v2 >= lv ? 2 : 0) | (v3 >= lv ? 1 : 0);
            if (code === 0 || code === 15) continue;
            const path = paths[k];

            if (code === 5 || code === 10) {
              const high = (v0 + v1 + v2 + v3) * 0.25 >= lv;
              const s =
                code === 5
                  ? high ? SADDLE5_HIGH : SADDLE5_LOW
                  : high ? SADDLE10_HIGH : SADDLE10_LOW;
              addSegment(path, s[0], s[1], lv, x, y, v0, v1, v2, v3);
              addSegment(path, s[2], s[3], lv, x, y, v0, v1, v2, v3);
            } else {
              const o = code << 2;
              addSegment(path, SEG[o], SEG[o + 1], lv, x, y, v0, v1, v2, v3);
            }
          }
        }
      }

      ctx.strokeStyle = gradient;
      for (let k = 0; k < LEVEL_COUNT; k++) {
        ctx.globalAlpha = LEVEL_ALPHA[k];
        ctx.lineWidth = LEVEL_WIDTH[k];
        ctx.stroke(paths[k]);
      }
      ctx.globalAlpha = 1;
    }

    function draw() {
      buildField(simTime * ANIMATION_SPEED);
      ctx.clearRect(0, 0, width, height);
      drawContours();
    }

    /* ---------- Sizing ---------- */
    function resize() {
      resizeRaf = 0;
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      const bw = Math.round(width * dpr), bh = Math.round(height * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const auto = Math.ceil(Math.sqrt((width * height) / CELL_BUDGET));
      cell = Math.min(MAX_CELL, Math.max(MIN_CELL, minCell, auto));

      fw = Math.ceil(width / cell) + 2;
      fh = Math.ceil(height / cell) + 2;
      ww = (fw >> 2) + 2;
      wh = (fh >> 2) + 2;
      field = new Float32Array(fw * fh);
      warpX = new Float32Array(ww * wh);
      warpY = new Float32Array(ww * wh);

      gradient = ctx.createLinearGradient(0, 0, width * 0.08, height);
      gradient.addColorStop(0, "#FF173D");
      gradient.addColorStop(0.48, "#CC0033");
      gradient.addColorStop(1, "#D80073");

      workSum = 0;
      workCount = 0;
      draw();
    }

    function onResize() {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(resize);
    }

    /* ---------- Loop ---------- */
    const minFrameMs = 1000 / TARGET_FPS;

    function frame(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      const dt = now - last;
      if (dt < minFrameMs - 1.5) return;
      last = now;

      simTime += Math.min(dt, 50); // no time jumps after tab switches

      const t0 = performance.now();
      draw();
      workSum += performance.now() - t0;

      // Adaptive quality: if drawing stays slow, use coarser cells.
      if (++workCount === 90) {
        const avg = workSum / workCount;
        workSum = 0;
        workCount = 0;
        if (avg > FRAME_BUDGET_MS && cell < MAX_CELL) {
          minCell = cell + 1;
          resize();
        }
      }
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reducedMotion || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    }

    function onMotion(e: MediaQueryListEvent) {
      reducedMotion = e.matches;
      if (reducedMotion) draw();
      start();
    }

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotion);

    resize();
    start();

    // Cleanup keeps React StrictMode and hot reload from stacking loops/listeners.
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div className="topo-bg" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
