import { Outlet } from "react-router-dom";
import { Search, Bell, Plus, HelpCircle, LogOut } from "lucide-react";

import Sidebar from "./Layouts/Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./auth/auth-context";

function App() {
  const { user, logout } = useAuth();
  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar />

      <SidebarInset className="min-w-0 bg-app-grid">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger className="text-muted-foreground" />
          <Separator orientation="vertical" className="mr-1 h-6" />

          <div className="relative hidden w-full max-w-sm md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders, restaurants, customers…"
              className="h-9 rounded-full bg-muted/60 pl-9"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground lg:inline-flex">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button size="sm" className="hidden rounded-full sm:inline-flex">
              <Plus className="size-4" />
              New order
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
              <HelpCircle className="size-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-muted-foreground"
            >
              <Bell className="size-4.5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <div className="flex items-center gap-2 rounded-full py-0.5 pr-1 pl-0.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                {initials}
              </span>
              <div className="hidden flex-col leading-tight lg:flex">
                <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                <span className="text-[11px] text-muted-foreground capitalize">{user?.role?.toLowerCase()}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
              onClick={logout}
              title="Sign out"
            >
              <LogOut className="size-4.5" />
            </Button>
          </div>
        </header>

        <main className="min-h-[calc(100svh-4rem)] w-full p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
