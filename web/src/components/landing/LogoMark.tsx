interface LogoMarkProps {
  size?: number;
}

/** PromptArena mark: a shield split red and blue (attack vs defend) with a prompt chevron. */
export function LogoMark({ size = 32 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="PromptArena"
    >
      <defs>
        <clipPath id="pa-logo-left">
          <rect x="0" y="0" width="16" height="32" />
        </clipPath>
        <clipPath id="pa-logo-right">
          <rect x="16" y="0" width="16" height="32" />
        </clipPath>
      </defs>
      <path
        clipPath="url(#pa-logo-left)"
        d="M16 2 28 7v9c0 7-6 12-12 14C10 28 4 23 4 16V7z"
        fill="#ff3158"
      />
      <path
        clipPath="url(#pa-logo-right)"
        d="M16 2 28 7v9c0 7-6 12-12 14C10 28 4 23 4 16V7z"
        fill="#3b82ff"
      />
      <path
        d="m11.5 12 5 4-5 4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.5 20.5h4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
