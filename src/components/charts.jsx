/**
 * Dependency-free SVG charts shared across pages (Analytics, etc.).
 * All colors come from the theme's CSS custom properties.
 */

export function AreaChart({ series, valueKey = "value", height = 240, color = "var(--primary)" }) {
  const w = 640;
  const h = height;
  const pad = { top: 16, right: 12, bottom: 28, left: 12 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;
  const max = Math.max(...series.map((s) => s[valueKey])) * 1.15 || 1;

  const x = (i) => pad.left + (i / (series.length - 1)) * iw;
  const y = (v) => pad.top + ih - (v / max) * ih;

  const pts = series.map((s, i) => [x(i), y(s[valueKey])]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1)},${pad.top + ih} L${x(0)},${pad.top + ih} Z`;
  const grid = [0, 0.25, 0.5, 0.75, 1];
  const gid = `area-${color.replace(/[^a-z]/gi, "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((g, i) => (
        <line key={i} x1={pad.left} x2={w - pad.right} y1={pad.top + ih * g} y2={pad.top + ih * g}
          stroke="var(--border)" strokeDasharray="3 5" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4" fill="var(--card)" stroke={color} strokeWidth="2" />
          <text x={p[0]} y={h - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {series[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function BarChart({ series, valueKey = "value", height = 240, color = "var(--primary)" }) {
  const max = Math.max(...series.map((s) => s[valueKey])) || 1;
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {series.map((s, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(s[valueKey] / max) * 100}%`,
                background: `color-mix(in oklch, ${color}, transparent ${i % 2 ? 25 : 0}%)`,
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ data, size = 160, stroke = 22, centerLabel, centerSub }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const segments = data.reduce((acc, d) => {
    const len = (d.value / total) * c;
    const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].len : 0;
    acc.push({ ...d, len, start });
    return acc;
  }, []);
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        {segments.map((d, i) => (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color}
            strokeWidth={stroke} strokeDasharray={`${d.len} ${c - d.len}`} strokeDashoffset={-d.start}
            strokeLinecap="round" />
        ))}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute flex flex-col items-center">
          <span className="font-heading text-2xl font-semibold tracking-tight">{centerLabel}</span>
          <span className="text-xs text-muted-foreground">{centerSub}</span>
        </div>
      )}
    </div>
  );
}
