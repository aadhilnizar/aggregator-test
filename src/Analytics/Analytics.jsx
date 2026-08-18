import { useState } from "react";
import { TrendingUp, TrendingDown, Download, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { AreaChart, BarChart, Donut } from "@/components/charts";

const kpis = [
  { label: "Gross merchandise value", value: "₹42.8L", delta: "+18.2%", up: true },
  { label: "Avg. order value", value: "₹512", delta: "+4.6%", up: true },
  { label: "Repeat order rate", value: "63%", delta: "+2.1%", up: true },
  { label: "Cancellation rate", value: "3.6%", delta: "-0.8%", up: true },
];

const revenueTrend = [
  { label: "Wk 1", value: 62 },
  { label: "Wk 2", value: 74 },
  { label: "Wk 3", value: 69 },
  { label: "Wk 4", value: 88 },
  { label: "Wk 5", value: 96 },
  { label: "Wk 6", value: 112 },
  { label: "Wk 7", value: 128 },
  { label: "Wk 8", value: 121 },
];

const ordersByHour = [
  { label: "9a", value: 32 }, { label: "11a", value: 58 }, { label: "1p", value: 96 },
  { label: "3p", value: 44 }, { label: "5p", value: 61 }, { label: "7p", value: 108 },
  { label: "9p", value: 87 }, { label: "11p", value: 39 },
];

const cuisineSplit = [
  { label: "North Indian", value: 34, color: "var(--chart-1)" },
  { label: "Chinese", value: 22, color: "var(--chart-2)" },
  { label: "Italian", value: 18, color: "var(--chart-3)" },
  { label: "Japanese", value: 14, color: "var(--chart-4)" },
  { label: "Other", value: 12, color: "var(--chart-5)" },
];

const topZones = [
  { zone: "Bandra West", orders: 1842, share: 92 },
  { zone: "Andheri East", orders: 1560, share: 78 },
  { zone: "Lower Parel", orders: 1204, share: 60 },
  { zone: "Juhu", orders: 980, share: 49 },
  { zone: "Powai", orders: 742, share: 37 },
];

export default function Analytics() {
  const [range, setRange] = useState("8 weeks");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title="Analytics" subtitle="Trends, demand patterns and performance across the network.">
        <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1">
          {["4 weeks", "8 weeks", "Quarter"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={[
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                range === r ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {r}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="rounded-full">
          <Download className="size-4" />
          Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="gap-0">
            <CardContent className="py-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">{k.value}</p>
                <Badge variant={k.up ? "success" : "destructive"} className="gap-0.5">
                  {k.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}{k.delta}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Weekly gross revenue (₹ lakh) · {range}</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                <CalendarDays className="size-4" />{range}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <AreaChart series={revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuisine mix</CardTitle>
            <CardDescription>Share of orders</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <Donut data={cuisineSplit} centerLabel="100%" centerSub="of orders" />
            <div className="flex w-full flex-col gap-2">
              {cuisineSplit.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 text-muted-foreground">{c.label}</span>
                  <span className="font-medium tabular-nums">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders by hour</CardTitle>
            <CardDescription>Peak demand windows across the day</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart series={ordersByHour} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top delivery zones</CardTitle>
            <CardDescription>By order volume</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {topZones.map((z) => (
              <div key={z.zone} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{z.zone}</span>
                  <span className="font-medium tabular-nums text-muted-foreground">{z.orders.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${z.share}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
