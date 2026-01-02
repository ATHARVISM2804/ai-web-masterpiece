import { useState, useEffect } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const words = ["Create", "Design", "Develop", "Innovate"];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    // Word cycling animation
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 800);

    // Progress animation - slower
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Slower easing function
        const increment = Math.max(0.5, (100 - prev) / 15);
        return Math.min(100, prev + increment);
      });
    }, 60);

    return () => {
      clearInterval(wordInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 1000);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-all duration-1000 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated gradient orb that follows mouse */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03] blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: "radial-gradient(circle, hsl(var(--foreground)) 0%, transparent 70%)",
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Morphing blob background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] -top-48 -left-48 rounded-full bg-foreground/[0.02] blur-3xl"
          style={{ animation: "morph 15s ease-in-out infinite" }}
        />
        <div
          className="absolute w-[400px] h-[400px] -bottom-32 -right-32 rounded-full bg-foreground/[0.02] blur-3xl"
          style={{ animation: "morph 12s ease-in-out infinite reverse" }}
        />
      </div>

      {/* Animated line patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
        {[...Array(8)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-foreground to-transparent"
            style={{
              top: `${12 + i * 12}%`,
              left: 0,
              right: 0,
              animation: `lineSlide ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute border border-foreground/10"
            style={{
              width: `${20 + i * 15}px`,
              height: `${20 + i * 15}px`,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              transform: `rotate(${45 + i * 15}deg)`,
              animation: `floatRotate ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        {/* Circles */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full border border-foreground/10"
            style={{
              width: `${30 + i * 20}px`,
              height: `${30 + i * 20}px`,
              right: `${10 + i * 12}%`,
              bottom: `${15 + i * 15}%`,
              animation: `floatUp ${6 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo container with multiple orbital rings */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-10">
          {/* Outermost dashed ring */}
          <div
            className="absolute -inset-4 rounded-full border border-dashed border-foreground/10"
            style={{ animation: "spin 20s linear infinite" }}
          />

          {/* Outer rotating ring with gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent, hsl(var(--foreground) / 0.1), transparent)",
              animation: "spin 10s linear infinite",
            }}
          />
          <div
            className="absolute inset-0 rounded-full border border-foreground/20"
            style={{ animation: "spin 10s linear infinite" }}
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground shadow-lg" />
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground/50" />
          </div>

          {/* Middle pulsing ring */}
          <div
            className="absolute inset-6 rounded-full border border-foreground/15"
            style={{ animation: "pulse 3s ease-in-out infinite" }}
          />

          {/* Inner rotating ring (opposite direction) */}
          <div
            className="absolute inset-12 rounded-full border border-foreground/25"
            style={{ animation: "spin 6s linear infinite reverse" }}
          >
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/70" />
          </div>

          {/* Innermost static ring */}
          <div className="absolute inset-[4.5rem] rounded-full border border-foreground/10" />

          {/* Center logo with glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{ animation: "fadeInScale 1s ease-out forwards" }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl opacity-20">
                <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
                  <polygon points="50,10 85,30 50,50 15,30" fill="currentColor" className="text-foreground" />
                  <polygon points="15,30 50,50 50,90 15,70" fill="currentColor" className="text-foreground" />
                  <polygon points="85,30 50,50 50,90 85,70" fill="currentColor" className="text-foreground" />
                </svg>
              </div>
              {/* Main logo */}
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 relative">
                {/* Animated stroke drawing */}
                <polygon
                  points="50,10 85,30 50,50 15,30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                  style={{
                    strokeDasharray: 200,
                    strokeDashoffset: 200,
                    animation: "drawStroke 1.5s ease-out forwards",
                  }}
                />
                <polygon
                  points="15,30 50,50 50,90 15,70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                  style={{
                    strokeDasharray: 200,
                    strokeDashoffset: 200,
                    animation: "drawStroke 1.5s ease-out 0.3s forwards",
                  }}
                />
                <polygon
                  points="85,30 50,50 50,90 85,70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                  style={{
                    strokeDasharray: 200,
                    strokeDashoffset: 200,
                    animation: "drawStroke 1.5s ease-out 0.6s forwards",
                  }}
                />
                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="90"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-foreground"
                  style={{
                    strokeDasharray: 40,
                    strokeDashoffset: 40,
                    animation: "drawStroke 0.8s ease-out 0.9s forwards",
                  }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Name with letter animation */}
        <div
          className="overflow-hidden mb-4"
          style={{ animation: "fadeIn 1s ease-out 0.5s forwards", opacity: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-light tracking-wider text-foreground flex">
            {"Atharv Golait".split("").map((letter, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  animation: `letterSlide 0.5s ease-out ${0.8 + i * 0.05}s forwards`,
                  opacity: 0,
                  transform: "translateY(20px)",
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Subtitle line */}
        <div
          className="w-12 h-px bg-foreground/30 mb-4"
          style={{ animation: "expandWidth 0.8s ease-out 1.5s forwards", width: 0 }}
        />

        {/* Animated word with blur effect */}
        <div className="h-8 overflow-hidden mb-8">
          <div
            className="transition-all duration-500 ease-out"
            style={{ transform: `translateY(-${currentWord * 32}px)` }}
          >
            {words.map((word) => (
              <div key={word} className="h-8 flex items-center justify-center">
                <span className="text-sm font-body font-light tracking-[0.3em] uppercase text-muted-foreground">
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced progress bar */}
        <div className="relative w-56 sm:w-72">
          {/* Background track */}
          <div className="h-[2px] bg-foreground/10 rounded-full overflow-hidden">
            {/* Progress fill with gradient */}
            <div
              className="h-full bg-gradient-to-r from-foreground/50 via-foreground to-foreground/50 transition-all duration-150 ease-out rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rounded-full shadow-[0_0_10px_hsl(var(--foreground))]" />
            </div>
          </div>
          
          {/* Progress markers */}
          <div className="absolute inset-x-0 top-0 flex justify-between -translate-y-3">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div
                key={mark}
                className={`w-px h-2 transition-colors duration-300 ${
                  progress >= mark ? "bg-foreground" : "bg-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progress info */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-foreground"
              style={{ animation: "blink 1s ease-in-out infinite" }}
            />
            <span className="text-xs font-body text-muted-foreground tracking-[0.2em] uppercase">
              Loading Experience
            </span>
          </div>
          <span className="text-lg font-display text-foreground tabular-nums font-light">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Enhanced corner decorations */}
      <div className="absolute top-8 left-8 w-20 h-20">
        <div
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-foreground/40 to-transparent"
          style={{ animation: "expandWidth 1.2s ease-out 0.2s forwards", width: 0 }}
        />
        <div
          className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-foreground/40 to-transparent"
          style={{ animation: "expandHeight 1.2s ease-out 0.2s forwards", height: 0 }}
        />
        <div
          className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-foreground/30"
          style={{ animation: "fadeIn 0.5s ease-out 1s forwards", opacity: 0 }}
        />
      </div>
      <div className="absolute top-8 right-8 w-20 h-20">
        <div
          className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-foreground/40 to-transparent"
          style={{ animation: "expandWidth 1.2s ease-out 0.3s forwards", width: 0 }}
        />
        <div
          className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-foreground/40 to-transparent"
          style={{ animation: "expandHeight 1.2s ease-out 0.3s forwards", height: 0 }}
        />
        <div
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground/30"
          style={{ animation: "fadeIn 0.5s ease-out 1.1s forwards", opacity: 0 }}
        />
      </div>
      <div className="absolute bottom-8 left-8 w-20 h-20">
        <div
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-foreground/40 to-transparent"
          style={{ animation: "expandWidth 1.2s ease-out 0.4s forwards", width: 0 }}
        />
        <div
          className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-foreground/40 to-transparent"
          style={{ animation: "expandHeight 1.2s ease-out 0.4s forwards", height: 0 }}
        />
        <div
          className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-foreground/30"
          style={{ animation: "fadeIn 0.5s ease-out 1.2s forwards", opacity: 0 }}
        />
      </div>
      <div className="absolute bottom-8 right-8 w-20 h-20">
        <div
          className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-foreground/40 to-transparent"
          style={{ animation: "expandWidth 1.2s ease-out 0.5s forwards", width: 0 }}
        />
        <div
          className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-foreground/40 to-transparent"
          style={{ animation: "expandHeight 1.2s ease-out 0.5s forwards", height: 0 }}
        />
        <div
          className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground/30"
          style={{ animation: "fadeIn 0.5s ease-out 1.3s forwards", opacity: 0 }}
        />
      </div>

      {/* Side text with enhanced styling */}
      <div className="absolute left-8 bottom-1/4 hidden sm:flex items-center gap-3">
        <div
          className="w-8 h-px bg-foreground/20"
          style={{ animation: "expandWidth 0.8s ease-out 0.8s forwards", width: 0 }}
        />
        <span
          className="vertical-text text-[10px] tracking-[0.4em] text-muted-foreground uppercase font-body"
          style={{ animation: "fadeIn 1s ease-out 1s forwards", opacity: 0 }}
        >
          Portfolio 2026
        </span>
      </div>
      <div className="absolute right-8 top-1/4 hidden sm:flex items-center gap-3">
        <span
          className="vertical-text text-[10px] tracking-[0.4em] text-muted-foreground uppercase font-body"
          style={{ animation: "fadeIn 1s ease-out 1.2s forwards", opacity: 0 }}
        >
          Full Stack Developer
        </span>
        <div
          className="w-8 h-px bg-foreground/20"
          style={{ animation: "expandWidth 0.8s ease-out 1s forwards", width: 0 }}
        />
      </div>

      {/* Bottom center text */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] text-muted-foreground/50 uppercase font-body hidden sm:block"
        style={{ animation: "fadeIn 1s ease-out 1.5s forwards", opacity: 0 }}
      >
        Crafting Digital Experiences
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.08); opacity: 0.3; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }
        @keyframes letterSlide {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandWidth {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes expandHeight {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg); }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(180deg); }
        }
        @keyframes lineSlide {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(0); opacity: 1; }
        }
        @keyframes floatRotate {
          0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.1; }
          50% { transform: rotate(90deg) translateY(-30px); opacity: 0.2; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); opacity: 0.1; }
          50% { transform: translateY(-20px); opacity: 0.15; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
