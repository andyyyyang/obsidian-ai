import { cn } from "@/lib/cn";

const palette = [
  "from-rose-400 to-pink-500",
  "from-orange-400 to-amber-500",
  "from-amber-400 to-yellow-500",
  "from-emerald-400 to-teal-500",
  "from-teal-400 to-cyan-500",
  "from-sky-400 to-blue-500",
  "from-indigo-400 to-violet-500",
  "from-violet-400 to-purple-500",
  "from-purple-400 to-fuchsia-500",
  "from-fuchsia-400 to-pink-500",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  if (!name) return "?";
  const trimmed = name.trim();
  const englishMatch = trimmed.split(/\s+/).filter(Boolean);
  if (englishMatch.length > 1 && /^[a-zA-Z]/.test(englishMatch[0])) {
    return (englishMatch[0][0] + (englishMatch[1][0] ?? "")).toUpperCase();
  }
  if (trimmed.length <= 2) return trimmed;
  return trimmed.slice(-2);
}

const sizeMap = {
  sm: { px: 28, font: "10px" },
  md: { px: 36, font: "12px" },
  lg: { px: 48, font: "16px" },
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const color = palette[hash(name) % palette.length];
  const { px, font } = sizeMap[size];
  // inline style 是 CSS 最高優先級，無視任何父層 flex / stretch 行為，100% 保證正圓
  const inlineStyle: React.CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    minWidth: `${px}px`,
    minHeight: `${px}px`,
    maxWidth: `${px}px`,
    maxHeight: `${px}px`,
    fontSize: font,
    flexShrink: 0,
    flexGrow: 0,
    aspectRatio: "1 / 1",
  };
  return (
    <span
      style={inlineStyle}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-2 ring-white/60 dark:ring-white/10",
        color,
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
