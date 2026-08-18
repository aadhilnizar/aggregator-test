import { useState } from "react";
import {
  User,
  Building2,
  Bell,
  CreditCard,
  Shield,
  Camera,
  Check,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

const sections = [
  { key: "profile", label: "Profile", icon: User },
  { key: "business", label: "Business", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "security", label: "Security", icon: Shield },
];

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/25",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState("profile");
  const [prefs, setPrefs] = useState({
    newOrders: true,
    delivery: true,
    payouts: true,
    marketing: false,
    weeklyDigest: true,
  });
  const setPref = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader title="Settings" subtitle="Manage your account, business profile and preferences.">
        <Button size="sm" className="rounded-full">
          <Check className="size-4" />
          Save changes
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Section nav */}
        <nav className="flex gap-1 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={[
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                tab === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <s.icon className="size-4" />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {tab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>How you appear across the dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src="https://i.pravatar.cc/96?img=68" alt="avatar" className="size-16 rounded-full object-cover" />
                    <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Camera className="size-3" />
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Ravi Kumar</p>
                    <p className="text-sm text-muted-foreground">Operations · Admin</p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name"><Input defaultValue="Ravi" className="rounded-lg bg-muted/50" /></Field>
                  <Field label="Last name"><Input defaultValue="Kumar" className="rounded-lg bg-muted/50" /></Field>
                  <Field label="Email"><Input defaultValue="ravi@orderhub.app" className="rounded-lg bg-muted/50" /></Field>
                  <Field label="Phone"><Input defaultValue="+91 98200 12345" className="rounded-lg bg-muted/50" /></Field>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "business" && (
            <Card>
              <CardHeader>
                <CardTitle>Business profile</CardTitle>
                <CardDescription>Details used on invoices and payouts.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Legal name"><Input defaultValue="OrderHub Technologies Pvt Ltd" className="rounded-lg bg-muted/50" /></Field>
                <Field label="GSTIN"><Input defaultValue="27ABCDE1234F1Z5" className="rounded-lg bg-muted/50" /></Field>
                <Field label="Support email"><Input defaultValue="support@orderhub.app" className="rounded-lg bg-muted/50" /></Field>
                <Field label="Operating city"><Input defaultValue="Mumbai" className="rounded-lg bg-muted/50" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Registered address" hint="Appears on all customer invoices.">
                    <Input defaultValue="4th Floor, Trade Tower, Bandra Kurla Complex, Mumbai 400051" className="rounded-lg bg-muted/50" />
                  </Field>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification preferences</CardTitle>
                <CardDescription>Choose what you get alerted about.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                <ToggleRow title="New orders" desc="Alert me whenever an order comes in." checked={prefs.newOrders} onChange={setPref("newOrders")} />
                <ToggleRow title="Delivery updates" desc="Courier assignment and arrival alerts." checked={prefs.delivery} onChange={setPref("delivery")} />
                <ToggleRow title="Payments & payouts" desc="Settlements, refunds and payout events." checked={prefs.payouts} onChange={setPref("payouts")} />
                <ToggleRow title="Weekly digest" desc="A summary of performance every Monday." checked={prefs.weeklyDigest} onChange={setPref("weeklyDigest")} />
                <ToggleRow title="Product & marketing" desc="Occasional news about new features." checked={prefs.marketing} onChange={setPref("marketing")} />
              </CardContent>
            </Card>
          )}

          {tab === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & plan</CardTitle>
                <CardDescription>Your subscription and payment method.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-xl border bg-linear-to-br from-primary/10 to-transparent p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-lg font-semibold">Growth</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">₹4,999 / month · renews Sep 1, 2026</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">Change plan</Button>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Visa ending 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 09/28</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full">Update</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your account.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Current password"><Input type="password" defaultValue="password" className="rounded-lg bg-muted/50" /></Field>
                  <div className="hidden sm:block" />
                  <Field label="New password"><Input type="password" placeholder="••••••••" className="rounded-lg bg-muted/50" /></Field>
                  <Field label="Confirm password"><Input type="password" placeholder="••••••••" className="rounded-lg bg-muted/50" /></Field>
                </div>
                <Separator />
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security at sign-in.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
