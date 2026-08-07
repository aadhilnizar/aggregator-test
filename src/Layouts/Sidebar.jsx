import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  FiHome,
  FiShoppingBag,
  FiGrid,
  FiMenu,
  FiTruck,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiBell,
  FiSettings,
} from "react-icons/fi";

import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", icon: FiHome, path: "/" },
  { name: "Orders", icon: FiShoppingBag, path: "/orders"  },
  { name: "Restaurants", icon: FiGrid, path: "/restaurants" },
  { name: "Menu", icon: FiMenu, path: "/menu" },
  { name: "Delivery", icon: FiTruck, path: "/delivery" },
  { name: "Customers", icon: FiUsers, path: "/customers" },
  { name: "Payments", icon: FiCreditCard, path: "/payments" },
  { name: "Analytics", icon: FiBarChart2, path: "/analytics" },
  { name: "Notifications", icon: FiBell, path: "/notifications" },
  { name: "Settings", icon: FiSettings, path: "/settings" },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-blue-600">
          OrderHub
        </h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menu.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 text-sm text-muted-foreground">
        © 2026 OrderHub
      </SidebarFooter>
    </Sidebar>
  );
}