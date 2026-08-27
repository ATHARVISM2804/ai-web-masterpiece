import { useLayoutEffect, useRef, useState, type ReactNode, type ElementType } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  /** Direction the content travels in from. Defaults to "up". */
  from?: "up" | "left" | "right";
}

/**
 * Fades content up the first time it scrolls into view.
 *
 * Renders visible by default and only arms the hidden state once the observer
 * is attached, so content is never stranded invisible when JS or
 * IntersectionObserver is unavailable. Elements already in view on mount skip
 * the animation entirely.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as,
  from = "up",
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "shown">("idle");

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen — show it as-is rather than animating on load.
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    setState("armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const motion =
    state === "idle" ? "" : state === "armed" ? "reveal" : "reveal is-visible";

  return (
    <Tag
      ref={ref}
      className={`${motion} ${className}`}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-x": from === "left" ? "-44px" : from === "right" ? "44px" : "0px",
          "--reveal-y": from === "up" ? "24px" : "12px",
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
