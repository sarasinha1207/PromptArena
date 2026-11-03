import { useId, type ReactNode } from "react";

interface ProgressRingProps {
  /** Fill from 0 to 1. */
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  /** Gradient end colours. */
  from?: string;
  to?: string;
}

/** Circular gauge. Pass only real ratios: it never invents progress. */
export function ProgressRing({
  value,
  size = 84,
  stroke = 8,
  children,
  from = "#3b82ff",
  to = "#22d3ee",
}: ProgressRingProps) {
  const gradientId = useId();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(238,241,251,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: "0.82rem",
          fontWeight: 800,
        }}
      >
        {children}
      </div>
    </div>
  );
}
