/**
 * Clear glass needs its text to follow what's behind it, as Apple's liquid
 * glass does: a few times a second, shrink the frame just drawn to a tiny
 * thumbnail, average the light under each glass panel, and mark the panel
 * `data-tone="dark"` (light text) or `"light"` (dark text). The two thresholds
 * keep a panel from flickering when the scene behind it is in between.
 * Call it straight after rendering, while the WebGL frame is still readable.
 */
const W = 64;
const H = 36;

export function createTone(src: HTMLCanvasElement, every = 300) {
  const thumb = document.createElement("canvas");
  thumb.width = W;
  thumb.height = H;
  const ctx = thumb.getContext("2d", { willReadFrequently: true });
  let next = 0;

  return (now: number) => {
    if (!ctx || now < next) return;
    next = now + every;
    ctx.drawImage(src, 0, 0, W, H);
    const px = ctx.getImageData(0, 0, W, H).data;
    const vw = innerWidth;
    const vh = innerHeight;
    document.querySelectorAll<HTMLElement>(".life .glass").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x0 = Math.max(0, Math.floor((r.left / vw) * W));
      const x1 = Math.min(W, Math.ceil((r.right / vw) * W));
      const y0 = Math.max(0, Math.floor((r.top / vh) * H));
      const y1 = Math.min(H, Math.ceil((r.bottom / vh) * H));
      let sum = 0;
      let n = 0;
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          sum += (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
          n++;
        }
      if (!n) return;
      const lum = sum / n;
      const was = el.dataset.tone;
      const tone = was === "dark" ? (lum > 0.56 ? "light" : "dark") : lum < 0.44 ? "dark" : "light";
      if (tone !== was) el.dataset.tone = tone;
    });
  };
}
