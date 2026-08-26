interface LogoProps {
  /** Height of the mark in px. The wordmark scales with it. */
  size?: number;
  /** Mark only, no wordmark. */
  markOnly?: boolean;
  className?: string;
}

/** The Signal mark: a blade tapering to a point, bitten by a decaying step wave. */
export function LogoMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 212 196"
      height={size}
      width={(size * 212) / 196}
      fill="currentColor"
      role="img"
      aria-label="Atharv Golait"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8 8 L208 4 L77 188 L67 154 L67 144 L52 144 L52 130 L33 130 L33 113 L13 113 L13 96 Z M31 28 L176 22 L94 124 Z"
      />
      <path d="M34 38 L116 46 L76 62 Z" />
    </svg>
  );
}

export default function Logo({ size = 22, markOnly = false, className = "" }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />

      {!markOnly && (
        <span
          className="tracking-[-0.02em]"
          style={{ fontSize: size * 0.78 }}
          aria-hidden
        >
          <span className="font-semibold">Atharv</span>{" "}
          <span className="text-muted-foreground">Golait</span>
        </span>
      )}
    </span>
  );
}
