import { useMemo, useState } from "react";
import {
  LifeBuoy,
  Search,
  Plus,
  MessageSquare,
  BookOpen,
  Truck,
  CreditCard,
  Store,
  ChevronRight,
  Clock,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

const tickets = [
  { id: "TKT-1042", subject: "Payout not received for last cycle", category: "Payments", priority: "High", status: "Open", updated: "12 min ago" },
  { id: "TKT-1041", subject: "Courier app crashing on assignment", category: "Delivery", priority: "High", status: "In progress", updated: "1 hr ago" },
  { id: "TKT-1039", subject: "How to update restaurant timings?", category: "Restaurants", priority: "Low", status: "Open", updated: "3 hr ago" },
  { id: "TKT-1036", subject: "Refund taking longer than usual", category: "Payments", priority: "Medium", status: "Resolved", updated: "1 day ago" },
  { id: "TKT-1030", subject: "Menu images not showing", category: "Menu", priority: "Medium", status: "Resolved", updated: "2 days ago" },
];

const priorityVariant = { High: "destructive", Medium: "warning", Low: "muted" };
const statusVariant = { Open: "info", "In progress": "warning", Resolved: "success" };

const topics = [
  { icon: Truck, title: "Delivery & couriers", desc: "Assignment, tracking, SLAs", count: 24 },
  { icon: CreditCard, title: "Payments & payouts", desc: "Settlements, refunds, fees", count: 31 },
  { icon: Store, title: "Restaurant onboarding", desc: "Setup, menu, commission", count: 18 },
  { icon: BookOpen, title: "Getting started", desc: "Basics of the dashboard", count: 12 },
];

export default function Support() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Open", "In progress", "Resolved"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter(
      (t) => (tab === "All" || t.status === tab) && (!q || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    );
  }, [query, tab]);

  const open = tickets.filter((t) => t.status !== "Resolved").length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader title="Support" subtitle="Get help, browse guides and track your support tickets.">
        <Button size="sm" className="rounded-full">
          <Plus className="size-4" />
          New ticket
        </Button>
      </PageHeader>

      {/* Hero help card */}
      <Card className="overflow-hidden bg-linear-to-br from-primary/10 via-transparent to-transparent">
        <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <LifeBuoy className="size-6" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-semibold">How can we help?</h2>
              <p className="text-sm text-muted-foreground">Search our knowledge base or reach the team directly.</p>
            </div>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search help articles…" className="h-11 rounded-full bg-background pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Help topics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((t) => (
          <Card key={t.title} className="group cursor-pointer gap-0 transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3 py-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                <t.icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                {t.count} articles <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tickets */}
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading font-semibold">Your tickets</h3>
            <p className="text-xs text-muted-foreground">{open} open · {tickets.length} total</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    tab === t ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative hidden w-44 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-9 rounded-full bg-muted/60 pl-9" />
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col">
          {filtered.map((t, i) => (
            <div key={t.id}>
              <div className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <MessageSquare className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{t.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{t.id}</span>·<span>{t.category}</span>·
                    <span className="flex items-center gap-1"><Clock className="size-3" />{t.updated}</span>
                  </div>
                </div>
                <Badge variant={priorityVariant[t.priority]} className="hidden sm:inline-flex">{t.priority}</Badge>
                <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
              </div>
              {i < filtered.length - 1 && <Separator />}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">No tickets match.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
