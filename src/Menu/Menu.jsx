import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Star,
  Clock,
  Flame,
  RefreshCw,
  AlertTriangle,
  UtensilsCrossed,
  Check,
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
import { useFetch } from "@/hooks/use-fetch";
import { fetchMenu } from "@/lib/api";

/* Stable synthetic price (₹) from the recipe id — the demo API has no price. */
const priceFor = (id) => 180 + ((id * 57) % 720);
const inr = (n) => "₹" + n.toLocaleString("en-IN");
// Roughly 1 in 6 API items marked sold out, deterministically.
const soldOut = (r) => !r.local && r.id % 6 === 0;

const STORAGE_KEY = "orderhub.menu.dishes";
const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `d-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
const emptyForm = { name: "", cuisine: "", price: "", prep: "15", calories: "", difficulty: "Easy", image: "" };

export default function Menu() {
  const { data, loading, error, refetch } = useFetch(() => fetchMenu(24));
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [addOpen, setAddOpen] = useState(false);

  // Locally-created dishes, persisted, shown alongside the fetched menu.
  const [local, setLocal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  }, [local]);

  const items = useMemo(() => [...local, ...(data?.recipes ?? [])], [local, data]);

  const cuisines = useMemo(() => {
    const set = new Set(items.map((r) => r.cuisine));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (r) =>
        (cuisine === "All" || r.cuisine === cuisine) &&
        (!q || r.name.toLowerCase().includes(q))
    );
  }, [items, cuisine, query]);

  const addDish = (form) => {
    setLocal((prev) => [
      {
        id: newId(),
        local: true,
        name: form.name.trim(),
        cuisine: form.cuisine.trim() || "Custom",
        price: Number(form.price) || 0,
        rating: 5.0,
        prepTimeMinutes: Number(form.prep) || 15,
        cookTimeMinutes: 0,
        caloriesPerServing: Number(form.calories) || 0,
        difficulty: form.difficulty,
        image: form.image.trim(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title="Menu" subtitle="Dishes across partner kitchens — live from the API, plus your own.">
        <Button variant="outline" size="sm" className="rounded-full" onClick={refetch}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" className="rounded-full" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add dish
        </Button>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-muted/60 p-1 scrollbar-slim">
          {(loading && !local.length ? ["All"] : cuisines).map((cz) => (
            <button
              key={cz}
              onClick={() => setCuisine(cz)}
              className={[
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                cuisine === cz ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {cz}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="h-9 rounded-full bg-muted/60 pl-9"
          />
        </div>
      </div>

      {error && !items.length ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Couldn't load the menu: {error.message}</p>
          <Button variant="outline" size="sm" className="rounded-full" onClick={refetch}>Try again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => {
            const out = soldOut(r);
            const price = r.price ?? priceFor(r.id);
            return (
              <Card key={r.id} className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                <div className="relative aspect-4/3 overflow-hidden bg-muted">
                  <MenuThumb src={r.image} alt={r.name} out={out} />
                  <Badge variant="secondary" className="absolute left-2.5 top-2.5 bg-background/85 backdrop-blur">
                    {r.cuisine}
                  </Badge>
                  {r.local && (
                    <Badge className="absolute left-2.5 top-9 backdrop-blur">Yours</Badge>
                  )}
                  {out && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <Badge variant="destructive">Sold out</Badge>
                    </div>
                  )}
                  <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-background/85 px-1.5 py-0.5 text-xs font-medium backdrop-blur">
                    <Star className="size-3 fill-warning text-warning" />
                    {r.rating}
                  </span>
                </div>
                <CardContent className="flex flex-col gap-2 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-medium">{r.name}</h3>
                    <span className="shrink-0 font-heading font-semibold text-primary">{inr(price)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="size-3" />{r.prepTimeMinutes + r.cookTimeMinutes}m</span>
                    <span className="flex items-center gap-1"><Flame className="size-3" />{r.caloriesPerServing} cal</span>
                    <span className="capitalize">{r.difficulty}</span>
                  </div>
                  <Button size="sm" variant={out ? "outline" : "default"} disabled={out} className="mt-1 w-full rounded-full">
                    {out ? "Unavailable" : "Add to order"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={`sk-${i}`} className="gap-0 overflow-hidden py-0">
                <Skeleton className="aspect-4/3 w-full rounded-none" />
                <CardContent className="flex flex-col gap-2 py-4">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <Skeleton className="h-6 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <AddDishSheet open={addOpen} onOpenChange={setAddOpen} onSubmit={addDish} />
    </div>
  );
}

/* Image with graceful fallback for dishes with no / broken image. */
function MenuThumb({ src, alt, out }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/15 to-muted">
        <UtensilsCrossed className="size-9 text-primary/40" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      className={[
        "size-full object-cover transition-transform duration-300 group-hover:scale-105",
        out ? "grayscale" : "",
      ].join(" ")}
    />
  );
}

/* ---------------------------------------------------------------- */
/* Add dish — working create form                                    */
/* ---------------------------------------------------------------- */
function AddDishSheet({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim().length > 1 && Number(form.price) > 0;

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit(form);
    setForm(emptyForm);
    setTouched(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add a dish</SheetTitle>
          <SheetDescription>Create a menu item. It appears instantly, tagged “Yours”.</SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
          <Field label="Dish name" required>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Paneer Tikka" className="rounded-lg bg-muted/50" autoFocus />
            {touched && form.name.trim().length <= 1 && <span className="text-xs text-destructive">Enter a dish name.</span>}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" required>
              <Input type="number" min="1" value={form.price} onChange={set("price")} placeholder="240" className="rounded-lg bg-muted/50" />
              {touched && !(Number(form.price) > 0) && <span className="text-xs text-destructive">Enter a price.</span>}
            </Field>
            <Field label="Cuisine"><Input value={form.cuisine} onChange={set("cuisine")} placeholder="Indian" className="rounded-lg bg-muted/50" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Prep (min)"><Input type="number" min="1" value={form.prep} onChange={set("prep")} className="rounded-lg bg-muted/50" /></Field>
            <Field label="Calories"><Input type="number" min="0" value={form.calories} onChange={set("calories")} placeholder="320" className="rounded-lg bg-muted/50" /></Field>
            <Field label="Difficulty">
              <select
                value={form.difficulty}
                onChange={set("difficulty")}
                className="h-9 w-full rounded-lg border border-transparent bg-muted/50 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </Field>
          </div>
          <Field label="Image URL" hint="Optional — a placeholder is shown if left blank.">
            <Input value={form.image} onChange={set("image")} placeholder="https://…" className="rounded-lg bg-muted/50" />
          </Field>
        </form>

        <SheetFooter className="flex-row justify-end gap-2">
          <SheetClose render={<Button variant="outline" className="rounded-full" />}>Cancel</SheetClose>
          <Button className="rounded-full" onClick={submit} disabled={!valid}>
            <Check className="size-4" />
            Add dish
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
