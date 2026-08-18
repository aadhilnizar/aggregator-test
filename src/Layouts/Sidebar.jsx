import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Truck,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  LifeBuoy,
  Soup,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "@/auth/auth-context";

const nav = [
  {
    label: "Operations",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/" },
      { name: "Orders", icon: ShoppingBag, path: "/orders", badge: "24" },
      { name: "Delivery", icon: Truck, path: "/delivery", badge: "8" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { name: "Restaurants", icon: Store, path: "/restaurants" },
      { name: "Menu", icon: UtensilsCrossed, path: "/menu" },
    ],
  },
  {
    label: "Business",
    items: [
      { name: "Customers", icon: Users, path: "/customers" },
      { name: "Payments", icon: CreditCard, path: "/payments" },
      { name: "Analytics", icon: BarChart3, path: "/analytics" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Notifications", icon: Bell, path: "/notifications", badge: "5" },
      { name: "Settings", icon: Settings, path: "/settings" },
      { name: "Support", icon: LifeBuoy, path: "/support" },
    ],
  },
];

export default function AppSidebar() {
  const { user } = useAuth();
  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-3 py-4">
        <NavLink to="/" className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Soup className="size-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-base font-semibold tracking-tight">OrderHub</span>
            <span className="text-[11px] text-muted-foreground">Delivery aggregator</span>
          </span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="scrollbar-slim px-1">
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild tooltip={item.name}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          [
                            "group/nav relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={[
                                "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all",
                                isActive ? "opacity-100" : "opacity-0",
                              ].join(" ")}
                            />
                            <item.icon
                              className={[
                                "size-4.5 shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground",
                              ].join(" ")}
                            />
                            <span className="flex-1 truncate">{item.name}</span>
                            {item.badge ? (
                              <SidebarMenuBadge className="static ml-auto rounded-full bg-primary/12 px-1.5 text-[11px] font-semibold text-primary">
                                {item.badge}
                              </SidebarMenuBadge>
                            ) : (
                              <ChevronRight className="size-3.5 text-muted-foreground/0 transition-colors group-hover/nav:text-muted-foreground/60" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
            {initials}
          </span>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{user?.name ?? "User"}</span>
            <span className="truncate text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase() ?? "member"}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
