import type { ReactNode } from "react";

// The line icons of the A1v2 mocks (a1v2.html, a1v2-sections.html), drawn once. Decorative: aria-hidden.

function Svg({ size, width = 2, children }: { size?: number; width?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

export const Mic = ({ size = 20 }: P) => (
  <Svg size={size}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Svg>
);
export const Arrow = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);
export const Check = ({ size, width = 2 }: P & { width?: number }) => (
  <Svg size={size} width={width}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);
export const Clock = ({ size }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const Sound = ({ size }: P) => (
  <Svg size={size}>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </Svg>
);
export const Menu = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const Close = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const Plus = ({ size = 14 }: P) => (
  <Svg size={size} width={2.4}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const Doc = ({ size, width = 2 }: P & { width?: number }) => (
  <Svg size={size} width={width}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </Svg>
);
export const Briefcase = ({ size }: P) => (
  <Svg size={size} width={2.2}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </Svg>
);
export const Mail = ({ size }: P) => (
  <Svg size={size} width={2.2}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
export const DocLines = ({ size }: P) => (
  <Svg size={size}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8" />
  </Svg>
);
export const Target = ({ size }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </Svg>
);
export const Send = ({ size }: P) => (
  <Svg size={size}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </Svg>
);
export const Chat = ({ size }: P) => (
  <Svg size={size}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </Svg>
);
export const Question = ({ size }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
  </Svg>
);
export const Pin = ({ size }: P) => (
  <Svg size={size}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);
export const Money = ({ size }: P) => (
  <Svg size={size}>
    <rect x="2" y="6" width="20" height="13" rx="2" />
    <circle cx="12" cy="12.5" r="2.5" />
    <path d="M6 12.5h.01M18 12.5h.01" />
  </Svg>
);
export const Ban = ({ size }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="m5.7 5.7 12.6 12.6" />
  </Svg>
);
export const Pencil = ({ size, width = 2 }: P & { width?: number }) => (
  <Svg size={size} width={width}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </Svg>
);
export const Building = ({ size }: P) => (
  <Svg size={size}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
  </Svg>
);
export const Board = ({ size }: P) => (
  <Svg size={size}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 4v5" />
  </Svg>
);
export const Book = ({ size }: P) => (
  <Svg size={size}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Svg>
);
export const Refresh = ({ size }: P) => (
  <Svg size={size}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </Svg>
);
export const Globe = ({ size }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
  </Svg>
);
export const Chart = ({ size }: P) => (
  <Svg size={size}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9M13 17V5M8 17v-3" />
  </Svg>
);
