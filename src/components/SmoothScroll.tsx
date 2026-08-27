import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { startSmoothScroll, scrollToTop } from "@/lib/smooth-scroll";

/** Mounts the smooth-scroll loop and resets position on route change. */
export default function SmoothScroll() {
  const { pathname } = useLocation();

  useEffect(() => startSmoothScroll(), []);
  useEffect(() => scrollToTop(true), [pathname]);

  return null;
}
