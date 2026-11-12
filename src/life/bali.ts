/**
 * The real Bali, right now: the hour in Canggu (UTC+8, no daylight saving)
 * and the weather there from Open-Meteo (free, no key). Live it draws its
 * sky from these, so a visitor sees the villa as it is at this moment.
 */

export const baliHour = (d: Date) => (d.getUTCHours() + 8 + d.getUTCMinutes() / 60) % 24;

/** The sky's keys start at 5 am; before that is still the night, not a dawn. */
export const skyHour = (h: number) => (h < 5 ? 23 : h);

export interface Weather {
  kind: "clear" | "cloudy" | "rain" | "storm";
  /** 0..1 */
  cloud: number;
  /** 0..1 */
  rain: number;
  /** °C, rounded; null when unknown. */
  temp: number | null;
}

/** Open-Meteo's WMO code and temperature, as the world draws them. */
export function weatherFrom(code: number, temp: number | undefined): Weather {
  const t = typeof temp === "number" && Number.isFinite(temp) ? Math.round(temp) : null;
  const w = (kind: Weather["kind"], cloud: number, rain: number): Weather => ({ kind, cloud, rain, temp: t });
  if (code >= 95) return w("storm", 1, 1);
  if (code >= 80) return w("rain", 0.9, code >= 82 ? 1 : 0.7);
  if (code >= 61) return w("rain", 0.9, code >= 65 ? 0.9 : code >= 63 ? 0.65 : 0.45);
  if (code >= 51) return w("rain", 0.8, 0.25);
  if (code >= 45) return w("cloudy", 0.85, 0);
  if (code === 3) return w("cloudy", 0.8, 0);
  if (code === 2) return w("cloudy", 0.45, 0);
  if (code === 1) return w("clear", 0.2, 0);
  return w("clear", 0, 0);
}

const URL_NOW =
  "https://api.open-meteo.com/v1/forecast?latitude=-8.65&longitude=115.13&current=weather_code,temperature_2m&timezone=Asia%2FMakassar";

/** Canggu's weather now; null when offline or the service is down. */
export async function fetchBali(): Promise<Weather | null> {
  try {
    const r = await fetch(URL_NOW);
    if (!r.ok) return null;
    const j = await r.json();
    return weatherFrom(Number(j?.current?.weather_code), j?.current?.temperature_2m);
  } catch {
    return null;
  }
}

export const WEATHER_ICON: Record<Weather["kind"], string> = { clear: "☀", cloudy: "☁", rain: "🌧", storm: "⛈" };
