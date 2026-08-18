import { useMemo, useState } from "react";
import {
  Bike,
  MapPin,
  Navigation,
  Phone,
  Clock,
  CircleDot,
  PackageCheck,
  Search,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

const couriers = [
  { id: "C-01", name: "Vikram Rao", avatar: 11, order: "ORD-7840", restaurant: "Burger Barn", drop: "Bandra West", eta: 8, progress: 72, status: "On the way", vehicle: "Bike" },
  { id: "C-02", name: "Sunil Yadav", avatar: 13, order: "ORD-7836", restaurant: "Spice Route", drop: "Andheri East", eta: 14, progress: 45, status: "On the way", vehicle: "Bike" },
  { id: "C-03", name: "Rahul Nair", avatar: 14, order: "ORD-7833", restaurant: "Sushi Zen", drop: "Lower Parel", eta: 3, progress: 90, status: "Arriving", vehicle: "Scooter" },
  { id: "C-04", name: "Amit Shah", avatar: 15, order: "ORD-7842", restaurant: "Green Bowl", drop: "Juhu", eta: 22, progress: 20, status: "Picking up", vehicle: "Bike" },
  { id: "C-05", name: "Deepak Kumar", avatar: 33, order: null, restaurant: null, drop: null, eta: null, progress: 0, status: "Idle", vehicle: "Scooter" },
  { id: "C-06", name: "Farhan Ali", avatar: 51, order: "ORD-7830", restaurant: "Pasta Fresca", drop: "Colaba", eta: 11, progress: 55, status: "On the way", vehicle: "Bike" },
];

const statusVariant = {
  "On the way": "info",
  Arriving: "success",
  "Picking up": "warning",
  Idle: "muted",
};

export default function Delivery() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return couriers;
    return couriers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.order ?? "").toLowerCase().includes(q) || (c.drop ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  const active = couriers.filter((c) => c.status !== "Idle").length;
  const idle = couriers.length - active;
  const avgEta = Math.round(
    couriers.filter((c) => c.eta).reduce((s, c) => s + c.eta, 0) / couriers.filter((c) => c.eta).length
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title="Delivery" subtitle="Live fleet status and active deliveries in progress right now.">
        <Button variant="outline" size="sm" className="rounded-full">
          <Navigation className="size-4" />
          Live map
        </Button>
        <Button size="sm" className="rounded-full">
          <Bike className="size-4" />
          Assign courier
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Active deliveries", value: active, tone: "text-info", icon: PackageCheck },
          { label: "Idle couriers", value: idle, tone: "text-muted-foreground", icon: Bike },
          { label: "Avg. ETA", value: `${avgEta} min`, tone: "text-success", icon: Clock },
          { label: "On-time rate", value: "94%", tone: "text-success", icon: CircleDot },
        ].map((s) => (
          <Card key={s.label} className="gap-0">
            <CardContent className="flex items-center gap-3 py-4">
              <span className={`flex size-9 items-center justify-center rounded-xl bg-muted ${s.tone}`}>
                <s.icon className="size-4.5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-semibold tabular-nums">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Map placeholder */}
        <Card className="relative overflow-hidden lg:col-span-1">
          <div className="absolute inset-0 bg-app-grid opacity-70" />
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-info/5" />
          <CardHeader className="relative">
            <CardTitle>Live coverage</CardTitle>
            <CardDescription>Mumbai · western zone</CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-1 items-center justify-center py-10">
            <div className="relative flex size-40 items-center justify-center">
              <span className="absolute size-40 animate-ping rounded-full bg-primary/10" />
              <span className="absolute size-28 rounded-full bg-primary/10" />
              <span className="absolute size-16 rounded-full bg-primary/20" />
              <MapPin className="relative size-8 text-primary" />
            </div>
          </CardContent>
          <CardContent className="relative">
            <div className="flex items-center justify-between rounded-xl border bg-card/70 px-3 py-2 text-sm backdrop-blur">
              <span className="text-muted-foreground">{active} couriers moving</span>
              <Badge variant="info">Live</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Courier list */}
        <Card className="gap-0 py-0 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <h3 className="font-heading font-semibold">Fleet</h3>
              <p className="text-xs text-muted-foreground">{filtered.length} couriers</p>
            </div>
            <div className="relative w-48 sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courier…" className="h-9 rounded-full bg-muted/60 pl-9" />
            </div>
          </div>
          <Separator />
          <div className="flex flex-col">
            {filtered.map((c, i) => (
              <div key={c.id}>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="relative">
                      <img src={`https://i.pravatar.cc/64?img=${c.avatar}`} alt={c.name} className="size-10 rounded-full object-cover" />
                      <span className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-card ${c.status === "Idle" ? "bg-muted-foreground/40" : "bg-success"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{c.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Bike className="size-3" />{c.vehicle} · {c.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    {c.order ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">#{c.order}</span>
                          <span className="text-muted-foreground">{c.restaurant} → {c.drop}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No active order</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    {c.eta != null && <span className="w-14 text-right text-sm font-medium tabular-nums">{c.eta} min</span>}
                    <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
                      <Phone className="size-4" />
                    </Button>
                  </div>
                </div>
                {i < filtered.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
