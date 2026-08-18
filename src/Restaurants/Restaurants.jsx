import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Star,
  MapPin,
  Store,
  Clock,
  TrendingUp,
  Download,
  Check,
  Loader2,
  Link2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { PageHeader } from "@/components/page-header";
import { Field } from "@/components/form-field";
import { RestaurantsApi } from "@/lib/restaurants";
import { PROVIDERS, isConfigured, importStores } from "@/lib/integrations";

const statusVariant = { OPEN: "success", BUSY: "warning", CLOSED: "muted" };
const statusLabel = { OPEN: "Open", BUSY: "Busy", CLOSED: "Closed" };
const emptyForm = { name: "", cuisine: "", area: "", prepTime: "20", commission: "18" };

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await RestaurantsApi.list({ pageSize: 100 });
      setRestaurants(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    load();
  }, [load]);

  const filters = ["All", "OPEN", "BUSY", "CLOSED"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter(
      (r) =>
        (filter === "All" || r.status === filter) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q))
    );
  }, [restaurants, query, filter]);

  const stats = useMemo(() => {
    const live = restaurants.filter((r) => r.status !== "CLOSED").length;
    const orders = restaurants.reduce((s, r) => s + (r._count?.orders ?? 0), 0);
    const avg = restaurants.length
      ? (restaurants.reduce((s, r) => s + r.rating, 0) / restaurants.length).toFixed(1)
      : "0.0";
    return { count: restaurants.length, live, orders, avg };
  }, [restaurants]);

  const addRestaurant = async (data) => {
    const created = await RestaurantsApi.create({
      name: data.name.trim(),
      cuisine: data.cuisine.trim() || "Mixed",
      area: data.area.trim() || "—",
      prepTime: Number(data.prepTime) || 20,
      commission: Number(data.commission) || 18,
    });
    setRestaurants((prev) => [created, ...prev]);
  };

  const importFrom = async (providerId, stores) => {
    const source = providerId.toUpperCase();
    const created = [];
    for (const s of stores) {
      const rec = await RestaurantsApi.create({
        name: s.name,
        cuisine: s.cuisine,
        area: s.area,
        prepTime: s.prep,
        commission: s.commission,
        source,
      });
      created.push(rec);
    }
    setRestaurants((prev) => [...created, ...prev]);
    return created.length;
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title="Restaurants" subtitle="Partner kitchens on the platform — synced live from your database.">
        <Button variant="outline" size="sm" className="rounded-full" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setImportOpen(true)}>
          <Download className="size-4" />
          Import from platform
        </Button>
        <Button size="sm" className="rounded-full" onClick={() => setOnboardOpen(true)}>
          <Plus className="size-4" />
          Onboard restaurant
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Partners", value: stats.count, icon: Store },
          { label: "Live now", value: stats.live, icon: Clock },
          { label: "Avg. rating", value: stats.avg, icon: Star },
          { label: "Total orders", value: stats.orders.toLocaleString(), icon: TrendingUp },
        ].map((s) => (
          <Card key={s.label} className="gap-0">
            <CardContent className="flex items-center gap-3 py-4">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-4.5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-semibold tabular-nums">
                  {loading ? <Skeleton className="h-6 w-10 rounded-md" /> : s.value}
                </span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {f === "All" ? "All" : statusLabel[f]}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search restaurants…" className="h-9 rounded-full bg-muted/60 pl-9" />
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Couldn't load restaurants: {error}</p>
          <p className="text-xs text-muted-foreground/70">Is the API running on {import.meta.env.VITE_API_URL || "http://localhost:4000/api"}?</p>
          <Button variant="outline" size="sm" className="rounded-full" onClick={load}>Try again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="gap-0 py-0">
                  <CardContent className="flex flex-col gap-4 py-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-xl" />
                      <div className="flex flex-col gap-1.5"><Skeleton className="h-4 w-28 rounded-md" /><Skeleton className="h-3 w-16 rounded-md" /></div>
                    </div>
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </CardContent>
                </Card>
              ))
            : filtered.map((r) => (
                <Card key={r.id} className="gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-4 py-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 font-heading text-lg font-semibold text-primary">
                          {r.name[0]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{r.name}</h3>
                            {r.source && r.source !== "DIRECT" && (
                              <Badge variant="info" className="gap-1"><Link2 className="size-3" />{r.source}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{r.cuisine}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="size-3.5 fill-warning text-warning" />{r.rating.toFixed(1)} <span className="text-muted-foreground/60">({r.reviewCount})</span></span>
                      <span className="flex items-center gap-1"><MapPin className="size-3.5" />{r.area}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
                      <div><p className="font-heading text-base font-semibold tabular-nums">{r._count?.orders ?? 0}</p><p className="text-[11px] text-muted-foreground">orders</p></div>
                      <div><p className="font-heading text-base font-semibold tabular-nums">{r.prepTime}m</p><p className="text-[11px] text-muted-foreground">avg prep</p></div>
                      <div><p className="font-heading text-base font-semibold tabular-nums">{r.commission}%</p><p className="text-[11px] text-muted-foreground">commission</p></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{r._count?.menuItems ?? 0} menu items</span>
                      <Button variant="outline" size="sm" className="rounded-full">Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              No restaurants match your filters.
            </div>
          )}
        </div>
      )}

      <OnboardSheet open={onboardOpen} onOpenChange={setOnboardOpen} onSubmit={addRestaurant} />
      <ImportSheet open={importOpen} onOpenChange={setImportOpen} onImport={importFrom} />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Onboard restaurant — writes to the API                            */
/* ---------------------------------------------------------------- */
function OnboardSheet({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim().length > 1;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(form);
      setForm(emptyForm);
      setTouched(false);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Onboard a restaurant</SheetTitle>
          <SheetDescription>Add a partner kitchen. It's saved to your database and goes live immediately.</SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
          <Field label="Restaurant name" required>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Spice Route" className="rounded-lg bg-muted/50" autoFocus />
            {touched && !valid && <span className="text-xs text-destructive">Please enter a name.</span>}
          </Field>
          <Field label="Cuisine"><Input value={form.cuisine} onChange={set("cuisine")} placeholder="e.g. North Indian" className="rounded-lg bg-muted/50" /></Field>
          <Field label="Area / location"><Input value={form.area} onChange={set("area")} placeholder="e.g. Bandra West" className="rounded-lg bg-muted/50" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Avg. prep (min)"><Input type="number" min="1" value={form.prepTime} onChange={set("prepTime")} className="rounded-lg bg-muted/50" /></Field>
            <Field label="Commission (%)"><Input type="number" min="0" max="40" value={form.commission} onChange={set("commission")} className="rounded-lg bg-muted/50" /></Field>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" />{error}
            </div>
          )}
        </form>

        <SheetFooter className="flex-row justify-end gap-2">
          <SheetClose render={<Button variant="outline" className="rounded-full" />}>Cancel</SheetClose>
          <Button className="rounded-full" onClick={submit} disabled={!valid || busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {busy ? "Saving…" : "Add restaurant"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- */
/* Import from Swiggy / Zomato / UrbanPiper → persists via the API   */
/* ---------------------------------------------------------------- */
function ImportSheet({ open, onOpenChange, onImport }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  const run = async (providerId) => {
    setBusy(providerId);
    setError(null);
    setDone(null);
    try {
      const stores = await importStores(providerId);
      const count = await onImport(providerId, stores);
      setDone({ provider: PROVIDERS[providerId].name, count });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Import from a platform</SheetTitle>
          <SheetDescription>
            Pull stores you manage on a delivery platform into your database. Add credentials in the
            server's <code className="mx-1 rounded bg-muted px-1 text-xs">.env</code> to go live —
            otherwise sample data is imported for demo.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6">
          {Object.values(PROVIDERS).map((p) => {
            const configured = isConfigured(p.id);
            return (
              <div key={p.id} className="flex items-start gap-3 rounded-xl border p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted font-heading font-semibold">
                  {p.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={configured ? "success" : "muted"}>{configured ? "Connected" : "Demo mode"}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.note}</p>
                  <Button size="sm" variant="outline" className="mt-3 rounded-full" disabled={busy != null} onClick={() => run(p.id)}>
                    {busy === p.id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    {busy === p.id ? "Importing…" : "Import stores"}
                  </Button>
                </div>
              </div>
            );
          })}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" />{error}
            </div>
          )}
          {done && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-[color-mix(in_oklch,var(--success),var(--foreground)_20%)]">
              <Check className="size-4 shrink-0" />
              Imported {done.count} store{done.count === 1 ? "" : "s"} from {done.provider}.
            </div>
          )}
        </div>

        <SheetFooter>
          <SheetClose render={<Button variant="outline" className="w-full rounded-full" />}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
