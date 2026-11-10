/**
 * Photo mode's postcard: the frame you chose, a cream border, and a caption
 * strip along the bottom. Returned as a canvas; Life.tsx saves it as a PNG.
 */
export function postcard(shot: HTMLCanvasElement, caption: string, place: string) {
  const w = shot.width;
  const h = shot.height;
  const b = Math.round(w * 0.03);
  const strip = Math.round(w * 0.085);
  const out = document.createElement("canvas");
  out.width = w + b * 2;
  out.height = h + b + strip;
  const c = out.getContext("2d")!;
  c.fillStyle = "#fbf7ef";
  c.fillRect(0, 0, out.width, out.height);
  c.drawImage(shot, b, b);
  const mid = h + b + strip / 2;
  c.textBaseline = "middle";
  c.fillStyle = "#1d1b1a";
  c.font = `600 ${Math.round(strip * 0.3)}px Geist, ui-sans-serif, system-ui, sans-serif`;
  c.fillText(caption, b, mid);
  c.textAlign = "right";
  c.fillStyle = "#8a8178";
  c.font = `500 ${Math.round(strip * 0.22)}px Geist, ui-sans-serif, system-ui, sans-serif`;
  c.fillText(place, out.width - b, mid);
  return out;
}
