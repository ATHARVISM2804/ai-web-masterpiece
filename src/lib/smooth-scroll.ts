import Lenis from "lenis";

/**
 * Site-wide smooth scrolling.
 *
 * Lenis takes over the wheel with a heavy easing curve so the page glides
 * rather than jumps. Touch is left native — inertial scrolling on phones
 * already feels right, and hijacking it makes the page feel laggy instead of
 * expensive. Disabled outright for anyone who asks for reduced motion.
 */

let lenis: Lenis | null = null;

/** Expo-out: fast departure, long soft landing. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Starts the scroll loop. Returns a cleanup function. */
export function startSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => undefined;

  lenis = new Lenis({
    lerp: 0.075,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.6,
    smoothWheel: true,
    syncTouch: false,
  });

  let frame = 0;
  const raf = (time: number) => {
    lenis?.raf(time);
    frame = requestAnimationFrame(raf);
  };
  frame = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

/** Eases to an in-page target, clearing the floating nav. */
export function scrollToTarget(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;

  if (!lenis) {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    return;
  }

  // Clearance under the floating nav comes from `section[id] { scroll-margin-top }`
  // in index.css, which Lenis honours — adding an offset here double-counts it.
  lenis.scrollTo(el as HTMLElement, { duration: 1.6, easing: easeOutExpo });
}

export function scrollToTop(immediate = false) {
  if (!lenis) {
    window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
    return;
  }
  lenis.scrollTo(0, { immediate, duration: 1.6, easing: easeOutExpo });
}

/** Freezes the page behind modals and the mobile menu. */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}
