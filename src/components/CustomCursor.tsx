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
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: position.x,
          top: position.y,
          opacity: isHidden ? 0 : 1,
          transition: "opacity 0.3s ease, transform 0.15s ease",
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.7 : 1})`,
        }}
      >
        <div
          className="rounded-full bg-neutral-900 dark:bg-neutral-100"
          style={{
            width: isPointer ? "10px" : "8px",
            height: isPointer ? "10px" : "8px",
            transition: "width 0.2s ease, height 0.2s ease",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
          }}
        />
      </div>

      {/* Outer ring */}
      <div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: position.x,
          top: position.y,
          opacity: isHidden ? 0 : isPointer ? 0.9 : 0.6,
          transition: "opacity 0.3s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.85 : 1})`,
        }}
      >
        <div
          className="rounded-full border-[1.5px] border-neutral-800 dark:border-neutral-200"
          style={{
            width: isPointer ? "52px" : "36px",
            height: isPointer ? "52px" : "36px",
            transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            background: isPointer 
              ? "radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%)" 
              : "transparent",
          }}
        />
      </div>

      {/* Subtle trailing effect */}
      <div
        className="fixed pointer-events-none z-[9997]"
        style={{
          left: position.x,
          top: position.y,
          opacity: isHidden ? 0 : 0.15,
          transition: "opacity 0.3s ease, left 0.08s ease-out, top 0.08s ease-out, transform 0.3s ease",
          transform: `translate(-50%, -50%) scale(${isPointer ? 1.2 : 1})`,
        }}
      >
        <div
          className="rounded-full bg-neutral-700 dark:bg-neutral-300"
          style={{
            width: "4px",
            height: "4px",
          }}
        />
      </div>
    </>
  );
}
