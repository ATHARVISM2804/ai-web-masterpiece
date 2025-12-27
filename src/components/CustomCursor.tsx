import { useEffect, useState, useCallback } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const updateCursor = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    
    const target = e.target as HTMLElement;
    const isClickable = 
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.closest("a") ||
      target.closest("button") ||
      window.getComputedStyle(target).cursor === "pointer";
    
    setIsPointer(!!isClickable);
  }, []);

  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);
  const handleMouseEnter = useCallback(() => setIsHidden(false), []);
  const handleMouseLeave = useCallback(() => setIsHidden(true), []);

  useEffect(() => {
    // Only show custom cursor on desktop
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    document.addEventListener("mousemove", updateCursor);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Hide default cursor
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.body.style.cursor = "auto";
    };
  }, [updateCursor, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: position.x,
          top: position.y,
          opacity: isHidden ? 0 : 1,
          transition: "opacity 0.3s ease, transform 0.15s ease",
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
        }}
      >
        <div
          className="rounded-full bg-foreground"
          style={{
            width: isPointer ? "8px" : "6px",
            height: isPointer ? "8px" : "6px",
            transition: "width 0.2s ease, height 0.2s ease",
          }}
        />
      </div>

      {/* Outer ring */}
      <div
        className="fixed pointer-events-none z-[9998] mix-blend-difference"
        style={{
          left: position.x,
          top: position.y,
          opacity: isHidden ? 0 : 1,
          transition: "opacity 0.3s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s ease, height 0.25s ease",
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.9 : 1})`,
        }}
      >
        <div
          className="rounded-full border border-foreground"
          style={{
            width: isPointer ? "48px" : "32px",
            height: isPointer ? "48px" : "32px",
            transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </>
  );
}
