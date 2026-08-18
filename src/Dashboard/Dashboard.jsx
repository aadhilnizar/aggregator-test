import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  Timer,
  Bike,
  ArrowUpRight,
  Star,
  MoreHorizontal,
  CalendarDays,
  Download,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/* Demo data                                                           */
/* ------------------------------------------------------------------ */

const stats = [
  {
    label: "Total revenue",
    value: "₹8,42,190",
    delta: "+12.5%",
    up: true,
    icon: IndianRupee,
    spark: [12, 18, 14, 22, 19, 28, 24, 33, 30, 38],
    foot: "vs. last week",
  },
  {
    label: "Orders",
    value: "3,248",
    delta: "+8.2%",
    up: true,
    icon: ShoppingBag,
    spark: [20, 22, 19, 26, 30, 27, 34, 31, 36, 40],
    foot: "1,204 delivered today",
  },
  {
    label: "Avg. delivery time",
    value: "28 min",
    delta: "-3.1%",
    up: true,
    icon: Timer,
    spark: [40, 38, 36, 34, 33, 31, 30, 29, 28, 28],
    foot: "under 30 min target",
  },
  {
    label: "Active couriers",
    value: "146",
    delta: "-2.4%",
    up: false,
    icon: Bike,
    spark: [30, 28, 32, 27, 25, 26, 24, 23, 22, 21],
    foot: "18 idle right now",
  },
];

const revenueSeries = [
  { d: "Mon", orders: 320, revenue: 62 },
  { d: "Tue", orders: 410, revenue: 78 },
  { d: "Wed", orders: 380, revenue: 71 },
  { d: "Thu", orders: 520, revenue: 96 },
  { d: "Fri", orders: 610, revenue: 118 },
  { d: "Sat", orders: 780, revenue: 152 },
  { d: "Sun", orders: 690, revenue: 134 },
];

const statusBreakdown = [
  { label: "Delivered", value: 1840, color: "var(--success)" },
  { label: "In transit", value: 612, color: "var(--info)" },
  { label: "Preparing", value: 486, color: "var(--warning)" },
  { label: "Cancelled", value: 118, color: "var(--destructive)" },
];

const recentOrders = [
  { id: "#ORD-7841", customer: "Aisha Khan", restaurant: "Spice Route", amount: "₹640", status: "Delivered", time: "2m ago" },
  { id: "#ORD-7840", customer: "Rohan Mehta", restaurant: "Burger Barn", amount: "₹420", status: "In transit", time: "6m ago" },
  { id: "#ORD-7839", customer: "Priya Nair", restaurant: "Sushi Zen", amount: "₹1,280", status: "Preparing", time: "11m ago" },
  { id: "#ORD-7838", customer: "Karan Patel", restaurant: "Taco Fiesta", amount: "₹510", status: "Delivered", time: "18m ago" },
  { id: "#ORD-7837", customer: "Sara Ali", restaurant: "Green Bowl", amount: "₹360", status: "Cancelled", time: "24m ago" },
];

const topRestaurants = [
  { name: "Spice Route", cuisine: "North Indian", orders: 482, rating: 4.8, trend: "+14%" },
  { name: "Burger Barn", cuisine: "American", orders: 391, rating: 4.6, trend: "+9%" },
  { name: "Sushi Zen", cuisine: "Japanese", orders: 288, rating: 4.9, trend: "+21%" },
  { name: "Green Bowl", cuisine: "Healthy", orders: 210, rating: 4.5, trend: "+4%" },
];

const activity = [
  { who: "Spice Route", what: "accepted order #ORD-7841", time: "2 min ago", tone: "success" },
  { who: "Courier Vikram", what: "picked up 3 orders in Andheri", time: "9 min ago", tone: "info" },
  { who: "Sushi Zen", what: "marked 2 items out of stock", time: "15 min ago", tone: "warning" },
  { who: "Refund", what: "₹360 issued for #ORD-7837", time: "24 min ago", tone: "destructive" },
  { who: "New partner", what: "Green Bowl went live in Bandra", time: "1 hr ago", tone: "success" },
];

const statusVariant = {
  Delivered: "success",
  "In transit": "info",
  Preparing: "warning",
  Cancelled: "destructive",
};

const toneDot = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

/* ------------------------------------------------------------------ */
/* Tiny SVG charts (no dependencies)                                   */
/* ------------------------------------------------------------------ */

function Sparkline({ data, up }) {
  const w = 100;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const stroke = up ? "var(--success)" : "var(--destructive)";
  const id = `spark-${up ? "u" : "d"}-${data.join("")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RevenueChart({ series }) {
  const w = 640;
  const h = 240;
  const pad = { top: 16, right: 12, bottom: 28, left: 12 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;
  const max = Math.max(...series.map((s) => s.revenue)) * 1.15;

  const x = (i) => pad.left + (i / (series.length - 1)) * iw;
  const y = (v) => pad.top + ih - (v / max) * ih;

  const linePts = series.map((s, i) => [x(i), y(s.revenue)]);
  const line = linePts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1)},${pad.top + ih} L${x(0)},${pad.top + ih} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-60 w-full overflow-visible">
      <defs>
        <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((g, i) => (
        <line
          key={i}
          x1={pad.left}
          x2={w - pad.right}
          y1={pad.top + ih * g}
          y2={pad.top + ih * g}
          stroke="var(--border)"
          strokeDasharray="3 5"
          strokeWidth="1"
        />
      ))}

      <path d={area} fill="url(#rev-fill)" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {linePts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4.5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
          <text x={p[0]} y={h - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {series[i].d}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Precompute each segment's length and cumulative start offset (no
  // mutation during render — keeps the arcs stable across re-renders).
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
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeDasharray={`${d.len} ${c - d.len}`}
            strokeDashoffset={-d.start}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading text-2xl font-semibold tracking-tight">
          {total.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">total orders</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Good morning, Ravi — here's what's happening across your network today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <CalendarDays className="size-4" />
            Last 7 days
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-0 overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-4.5" />
                </span>
                <Badge variant={s.up ? "success" : "destructive"} className="gap-0.5">
                  {s.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {s.delta}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-0">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-heading text-2xl font-semibold tracking-tight">{s.value}</p>
            </CardContent>
            <div className="mt-2">
              <Sparkline data={s.spark} up={s.up} />
            </div>
            <CardContent className="pt-2">
              <p className="text-xs text-muted-foreground">{s.foot}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & orders</CardTitle>
            <CardDescription>Daily gross revenue for the current week</CardDescription>
            <CardAction>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full bg-primary" /> Revenue (₹k)
                </span>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RevenueChart series={revenueSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order status</CardTitle>
            <CardDescription>Distribution across today's orders</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <Donut data={statusBreakdown} />
            <div className="grid w-full grid-cols-2 gap-3">
              {statusBreakdown.map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                  <div className="flex flex-1 items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                    <span className="text-xs font-medium">{d.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Live feed of the latest activity</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                View all
                <ArrowUpRight className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-2">
            <div className="flex flex-col">
              {recentOrders.map((o, i) => (
                <div key={o.id}>
                  <div className="flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors hover:bg-muted/50">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{o.id}</span>
                        <span className="text-xs text-muted-foreground">· {o.time}</span>
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {o.customer} — {o.restaurant}
                      </span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{o.amount}</span>
                    <Badge variant={statusVariant[o.status]} className="w-24 justify-center">
                      {o.status}
                    </Badge>
                  </div>
                  {i < recentOrders.length - 1 && <Separator className="opacity-60" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Network events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex flex-col gap-5 pl-1">
              {activity.map((a, i) => (
                <div key={i} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`mt-1 size-2.5 shrink-0 rounded-full ${toneDot[a.tone]}`} />
                    {i < activity.length - 1 && <span className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="flex flex-col pb-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </p>
                    <span className="text-xs text-muted-foreground/70">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top restaurants */}
      <Card>
        <CardHeader>
          <CardTitle>Top performing restaurants</CardTitle>
          <CardDescription>Ranked by order volume this week</CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
              <MoreHorizontal className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {topRestaurants.map((r, i) => (
              <div
                key={r.name}
                className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 font-heading text-sm font-semibold text-primary">
                    #{i + 1}
                  </span>
                  <Badge variant="success" className="gap-0.5">
                    <TrendingUp className="size-3" />
                    {r.trend}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.cuisine}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium tabular-nums">{r.orders} orders</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Star className="size-3.5 fill-warning text-warning" />
                    {r.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
