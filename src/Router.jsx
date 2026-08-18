import { createBrowserRouter } from "react-router-dom";

import App from "./App";

import Login from "./auth/Login";
import { RequireAuth } from "./auth/RequireAuth";
import Dashboard from "./Dashboard/Dashboard";
import Orders from "./Orders/Orders";
import Delivery from "./Delivery/Delivery";
import Restaurants from "./Restaurants/Restaurants";
import Menu from "./Menu/Menu";
import Customers from "./Customers/Customers";
import Payments from "./Payments/Payments";
import Analytics from "./Analytics/Analytics";
import Notifications from "./Notifications/Notifications";
import Settings from "./Settings/Settings";
import Support from "./Support/Support";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "orders", element: <Orders /> },
      { path: "delivery", element: <Delivery /> },
      { path: "restaurants", element: <Restaurants /> },
      { path: "menu", element: <Menu /> },
      { path: "customers", element: <Customers /> },
      { path: "payments", element: <Payments /> },
      { path: "analytics", element: <Analytics /> },
      { path: "notifications", element: <Notifications /> },
      { path: "settings", element: <Settings /> },
      { path: "support", element: <Support /> },
    ],
  },
]);

export default router;
