import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Crown,
  RefreshCw,
  AlertTriangle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { useFetch } from "@/hooks/use-fetch";
import { fetchCustomers } from "@/lib/api";

/* Deterministic pseudo-metrics derived from the user id so numbers are
   stable across renders (the demo API has no order history). */
const orderCount = (id) => 4 + ((id * 37) % 60);
const spend = (id) => 850 + ((id * 913) % 42000);
const segmentFor = (orders) =>
  orders > 45 ? "VIP" : orders > 25 ? "Regular" : orders > 12 ? "Active" : "New";

const segmentVariant = { VIP: "warning", Regular: "info", Active: "success", New: "muted" };
const inr = (n) => "₹" + n.toLocaleString("en-IN");

export default function Customers() {
  const { data, loading, error, refetch } = useFetch(() => fetchCustomers(20));
  const [query, setQuery] = useState("");

  const customers = useMemo(() => {
    const users = data?.users ?? [];
    return users.map((u) => {
      const orders = orderCount(u.id);
      return {
        ...u,
        orders,
        spent: spend(u.id),
        segment: segmentFor(orders),
        city: u.address?.city ?? "—",
      };
    });
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, query]);

  const totals = useMemo(() => {
    const vip = customers.filter((c) => c.segment === "VIP").length;
    const revenue = customers.reduce((s, c) => s + c.spent, 0);
    const orders = customers.reduce((s, c) => s + c.orders, 0);
    return { count: customers.length, vip, revenue, orders };
  }, [customers]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title="Customers" subtitle="People ordering across your network — synced live from the API.">
        <Button variant="outline" size="sm" className="rounded-full" onClick={refetch}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" className="rounded-full">
          <UserPlus className="size-4" />
          Add customer
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total customers", value: totals.count, sub: "loaded from API" },
          { label: "VIP members", value: totals.vip, sub: "> 45 orders" },
          { label: "Lifetime orders", value: totals.orders.toLocaleString(), sub: "all customers" },
          { label: "Lifetime revenue", value: inr(totals.revenue), sub: "gross" },
        ].map((s) => (
          <Card key={s.label} className="gap-0">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
                {loading ? <Skeleton className="h-7 w-20 rounded-md" /> : s.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or city…"
              className="h-9 rounded-full bg-muted/60 pl-9"
            />
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">
            {filtered.length} shown
          </span>
        </div>

        <Separator />

        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Couldn't load customers: {error.message}</p>
            <Button variant="outline" size="sm" className="rounded-full" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="pr-6 text-right">Lifetime spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <Skeleton className="h-4 w-28 rounded-md" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-40 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="mx-auto h-4 w-8 rounded-md" /></TableCell>
                        <TableCell className="pr-6"><Skeleton className="ml-auto h-4 w-20 rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  : filtered.map((c) => (
                      <TableRow key={c.id} className="group">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.image}
                              alt={c.firstName}
                              className="size-9 rounded-full bg-muted object-cover"
                            />
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1.5 font-medium">
                                {c.firstName} {c.lastName}
                                {c.segment === "VIP" && <Crown className="size-3.5 text-warning" />}
                              </span>
                              <span className="text-xs text-muted-foreground">{c.company?.title ?? "Customer"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Mail className="size-3" />{c.email}</span>
                            <span className="flex items-center gap-1.5"><Phone className="size-3" />{c.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" />{c.city}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={segmentVariant[c.segment]}>{c.segment}</Badge>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">{c.orders}</TableCell>
                        <TableCell className="pr-6 text-right font-medium tabular-nums">{inr(c.spent)}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
