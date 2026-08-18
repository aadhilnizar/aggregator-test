import { useMemo, useState } from "react";
import {
  IndianRupee,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  CreditCard,
  Landmark,
  Smartphone,
  Banknote,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

const inr = (n) => "₹" + n.toLocaleString("en-IN");

const transactions = [
  { id: "TXN-99120", order: "ORD-7841", customer: "Aisha Khan", method: "UPI", amount: 640, fee: 12, type: "Payment", status: "Settled", date: "Aug 18, 10:24" },
  { id: "TXN-99119", order: "ORD-7840", customer: "Rohan Mehta", method: "Card", amount: 420, fee: 9, type: "Payment", status: "Settled", date: "Aug 18, 10:18" },
  { id: "TXN-99118", order: "ORD-7839", customer: "Priya Nair", method: "Wallet", amount: 1280, fee: 0, type: "Payment", status: "Pending", date: "Aug 18, 10:11" },
  { id: "TXN-99117", order: "ORD-7837", customer: "Sara Ali", method: "Card", amount: 360, fee: 0, type: "Refund", status: "Refunded", date: "Aug 18, 09:54" },
  { id: "TXN-99116", order: "ORD-7836", customer: "Devendra Rao", method: "UPI", amount: 1520, fee: 28, type: "Payment", status: "Settled", date: "Aug 18, 09:47" },
  { id: "TXN-99115", order: "ORD-7834", customer: "Imran Sheikh", method: "Card", amount: 540, fee: 11, type: "Payment", status: "Settled", date: "Aug 18, 09:31" },
  { id: "TXN-99114", order: "ORD-7832", customer: "Arjun Singh", method: "Cash", amount: 430, fee: 0, type: "Payment", status: "Failed", date: "Aug 18, 09:12" },
];

const methodIcon = { UPI: Smartphone, Card: CreditCard, Wallet: Wallet, Cash: Banknote, Bank: Landmark };
const statusVariant = { Settled: "success", Pending: "warning", Refunded: "info", Failed: "destructive" };

const methodSplit = [
  { label: "UPI", value: 58, icon: Smartphone },
  { label: "Card", value: 24, icon: CreditCard },
  { label: "Wallet", value: 12, icon: Wallet },
  { label: "Cash", value: 6, icon: Banknote },
];

export default function Payments() {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Payment", "Refund"];

  const filtered = useMemo(
    () => transactions.filter((t) => tab === "All" || t.type === tab),
    [tab]
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title="Payments" subtitle="Transactions, settlements and payouts across the platform.">
        <Button variant="outline" size="sm" className="rounded-full">
          <Download className="size-4" />
          Statement
        </Button>
        <Button size="sm" className="rounded-full">
          <Wallet className="size-4" />
          Withdraw payout
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Available balance", value: inr(284500), icon: Wallet, tone: "text-primary bg-primary/10", delta: null },
          { label: "Collected today", value: inr(84219), icon: ArrowDownLeft, tone: "text-success bg-success/10", delta: "+12.5%" },
          { label: "Refunds today", value: inr(3160), icon: ArrowUpRight, tone: "text-destructive bg-destructive/10", delta: "-4.1%" },
          { label: "Platform fees", value: inr(9840), icon: IndianRupee, tone: "text-muted-foreground bg-muted", delta: null },
        ].map((s) => (
          <Card key={s.label} className="gap-0">
            <CardContent className="py-5">
              <div className="mb-3 flex items-center justify-between">
                <span className={`flex size-9 items-center justify-center rounded-xl ${s.tone}`}>
                  <s.icon className="size-4.5" />
                </span>
                {s.delta && <Badge variant={s.delta.startsWith("-") ? "destructive" : "success"}>{s.delta}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Transactions */}
        <Card className="gap-0 overflow-hidden py-0 lg:col-span-2">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-heading font-semibold">Recent transactions</h3>
            <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    tab === t ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="overflow-x-auto scrollbar-slim">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Transaction</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="pr-6 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const Icon = methodIcon[t.method] ?? CreditCard;
                  const isRefund = t.type === "Refund";
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-medium">{t.id}</span>
                          <span className="text-xs text-muted-foreground">{t.customer} · #{t.order}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Icon className="size-3.5" />{t.method}
                        </span>
                      </TableCell>
                      <TableCell><Badge variant={statusVariant[t.status]}>{t.status}</Badge></TableCell>
                      <TableCell className={`text-right font-medium tabular-nums ${isRefund ? "text-destructive" : ""}`}>
                        {isRefund ? "−" : ""}{inr(t.amount)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap text-xs text-muted-foreground">{t.date}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Method split + payout */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment methods</CardTitle>
              <CardDescription>Share of volume this week</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {methodSplit.map((m) => (
                <div key={m.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><m.icon className="size-4" />{m.label}</span>
                    <span className="font-medium tabular-nums">{m.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-primary/10 to-transparent">
            <CardHeader>
              <CardTitle>Next payout</CardTitle>
              <CardDescription>Scheduled for Aug 21, 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">{inr(284500)}</p>
              <Button className="mt-4 w-full rounded-full">Withdraw now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
