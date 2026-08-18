import { useMemo, useState } from "react";
import {
  ShoppingBag,
  Truck,
  Star,
  AlertTriangle,
  CreditCard,
  Store,
  CheckCheck,
  Settings2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

const seed = [
  { id: 1, type: "order", title: "New order received", body: "Aisha Khan placed order #ORD-7841 from Spice Route.", time: "2 min ago", read: false },
  { id: 2, type: "delivery", title: "Courier arriving", body: "Rahul Nair is 3 min from the drop for #ORD-7833.", time: "9 min ago", read: false },
  { id: 3, type: "alert", title: "Item out of stock", body: "Sushi Zen marked 2 menu items unavailable.", time: "15 min ago", read: false },
  { id: 4, type: "payment", title: "Refund issued", body: "₹360 refunded to Sara Ali for #ORD-7837.", time: "24 min ago", read: true },
  { id: 5, type: "review", title: "New 5★ review", body: "Priya Nair rated Sushi Zen 5 stars.", time: "38 min ago", read: true },
  { id: 6, type: "restaurant", title: "New partner live", body: "Green Bowl is now accepting orders in Bandra.", time: "1 hr ago", read: true },
  { id: 7, type: "alert", title: "SLA breach warning", body: "Avg. delivery time in Powai crossed 35 min.", time: "2 hr ago", read: true },
  { id: 8, type: "payment", title: "Payout scheduled", body: "₹2,84,500 payout scheduled for Aug 21.", time: "5 hr ago", read: true },
];

const typeMeta = {
  order: { icon: ShoppingBag, tone: "text-primary bg-primary/10", label: "Orders" },
  delivery: { icon: Truck, tone: "text-info bg-info/10", label: "Delivery" },
  alert: { icon: AlertTriangle, tone: "text-destructive bg-destructive/10", label: "Alerts" },
  payment: { icon: CreditCard, tone: "text-success bg-success/10", label: "Payments" },
  review: { icon: Star, tone: "text-warning bg-warning/10", label: "Reviews" },
  restaurant: { icon: Store, tone: "text-foreground bg-muted", label: "Partners" },
};

const filters = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "order", label: "Orders" },
  { key: "delivery", label: "Delivery" },
  { key: "alert", label: "Alerts" },
  { key: "payment", label: "Payments" },
];

export default function Notifications() {
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState("all");

  const unread = items.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggle = (id) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Notifications"
        subtitle={unread ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.` : "You're all caught up."}
      >
        <Button variant="outline" size="sm" className="rounded-full" onClick={markAll} disabled={!unread}>
          <CheckCheck className="size-4" />
          Mark all read
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
          <Settings2 className="size-4" />
        </Button>
      </PageHeader>

      <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-muted/60 p-1 scrollbar-slim">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.key ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {f.label}
            {f.key === "unread" && unread > 0 && (
              <span className="rounded-full bg-primary/12 px-1.5 text-[11px] text-primary">{unread}</span>
            )}
          </button>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Nothing here.</div>
        ) : (
          filtered.map((n, i) => {
            const meta = typeMeta[n.type];
            const Icon = meta.icon;
            return (
              <div key={n.id}>
                <button
                  onClick={() => toggle(n.id)}
                  className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                    <Icon className="size-4.5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{n.title}</span>
                      {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm text-muted-foreground">{n.body}</span>
                    <span className="mt-1 text-xs text-muted-foreground/70">{n.time}</span>
                  </div>
                  <Badge variant="muted" className="hidden shrink-0 sm:inline-flex">{meta.label}</Badge>
                </button>
                {i < filtered.length - 1 && <Separator />}
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
