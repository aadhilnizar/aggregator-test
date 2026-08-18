import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Truck,
  ChefHat,
  XCircle,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const orders = [
  { id: "ORD-7841", customer: "Aisha Khan", avatar: 5, restaurant: "Spice Route", items: 3, amount: 640, method: "UPI", status: "Delivered", placed: "10:24 AM" },
  { id: "ORD-7840", customer: "Rohan Mehta", avatar: 12, restaurant: "Burger Barn", items: 2, amount: 420, method: "Card", status: "In transit", placed: "10:18 AM" },
  { id: "ORD-7839", customer: "Priya Nair", avatar: 20, restaurant: "Sushi Zen", items: 5, amount: 1280, method: "Wallet", status: "Preparing", placed: "10:11 AM" },
  { id: "ORD-7838", customer: "Karan Patel", avatar: 33, restaurant: "Taco Fiesta", items: 4, amount: 510, method: "UPI", status: "Delivered", placed: "10:02 AM" },
  { id: "ORD-7837", customer: "Sara Ali", avatar: 45, restaurant: "Green Bowl", items: 1, amount: 360, method: "Card", status: "Cancelled", placed: "9:54 AM" },
  { id: "ORD-7836", customer: "Devendra Rao", avatar: 51, restaurant: "Spice Route", items: 6, amount: 1520, method: "UPI", status: "In transit", placed: "9:47 AM" },
  { id: "ORD-7835", customer: "Meera Joshi", avatar: 47, restaurant: "Pasta Fresca", items: 2, amount: 680, method: "Wallet", status: "Preparing", placed: "9:39 AM" },
  { id: "ORD-7834", customer: "Imran Sheikh", avatar: 60, restaurant: "Burger Barn", items: 3, amount: 540, method: "Card", status: "Delivered", placed: "9:31 AM" },
  { id: "ORD-7833", customer: "Neha Kapoor", avatar: 32, restaurant: "Sushi Zen", items: 4, amount: 990, method: "UPI", status: "Delivered", placed: "9:20 AM" },
  { id: "ORD-7832", customer: "Arjun Singh", avatar: 15, restaurant: "Taco Fiesta", items: 2, amount: 430, method: "Cash", status: "Cancelled", placed: "9:12 AM" },
];

const statusMeta = {
  Delivered: { variant: "success", icon: CheckCircle2 },
  "In transit": { variant: "info", icon: Truck },
  Preparing: { variant: "warning", icon: ChefHat },
  Cancelled: { variant: "destructive", icon: XCircle },
};

const tabs = [
  { key: "all", label: "All orders" },
  { key: "Preparing", label: "Preparing" },
  { key: "In transit", label: "In transit" },
  { key: "Delivered", label: "Delivered" },
  { key: "Cancelled", label: "Cancelled" },
];

const inr = (n) => "₹" + n.toLocaleString("en-IN");

export default function Orders() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchTab = tab === "all" || o.status === tab;
      const matchQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.restaurant.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [tab, query]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track, filter and manage every order across your restaurant network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button size="sm" className="rounded-full">
            <Clock className="size-4" />
            Live view
          </Button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Preparing", value: counts.Preparing || 0, color: "var(--warning)" },
          { label: "In transit", value: counts["In transit"] || 0, color: "var(--info)" },
          { label: "Delivered", value: counts.Delivered || 0, color: "var(--success)" },
          { label: "Cancelled", value: counts.Cancelled || 0, color: "var(--destructive)" },
        ].map((s) => (
          <Card key={s.label} className="gap-0">
            <CardContent className="flex items-center gap-3 py-4">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              <div className="flex flex-col">
                <span className="font-heading text-xl font-semibold tabular-nums">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-muted/60 p-1 scrollbar-slim">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {t.label}
                <span
                  className={[
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    tab === t.key ? "bg-primary/12 text-primary" : "bg-foreground/5 text-muted-foreground",
                  ].join(" ")}
                >
                  {counts[t.key] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders…"
                className="h-9 rounded-full bg-muted/60 pl-9"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Table */}
        <div className="overflow-x-auto scrollbar-slim">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="pr-6 text-right">Placed</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => {
                const meta = statusMeta[o.status];
                const Icon = meta.icon;
                return (
                  <TableRow key={o.id} className="group">
                    <TableCell className="pl-6 font-medium">#{o.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://i.pravatar.cc/64?img=${o.avatar}`}
                          alt={o.customer}
                          className="size-8 rounded-full object-cover"
                        />
                        <span className="whitespace-nowrap">{o.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.restaurant}</TableCell>
                    <TableCell className="text-center tabular-nums text-muted-foreground">{o.items}</TableCell>
                    <TableCell>
                      <Badge variant="muted">{o.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant} className="gap-1">
                        <Icon className="size-3" />
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{inr(o.amount)}</TableCell>
                    <TableCell className="pr-6 text-right whitespace-nowrap text-muted-foreground">{o.placed}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                    No orders match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Separator />

        {/* Footer / pagination */}
        <div className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
            <span className="font-medium text-foreground">{orders.length}</span> orders
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="rounded-full" disabled>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full bg-primary/10 text-primary">
              1
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
              2
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
              3
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
