import { createBrowserRouter } from "react-router-dom";

import App from "./App";

// import Dashboard from "./pages/Dashboard";
import Orders from "./Orders/Orders"
// import Restaurants from "./pages/Restaurants";
// import Menu from "./pages/Menu";
// import Delivery from "./pages/Delivery";
// import Customers from "./pages/Customers";
// import Payments from "./pages/Payments";
// import Analytics from "./pages/Analytics";
// import Notifications from "./pages/Notifications";
// import Settings from "./pages/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // {
      //   index: true,
      //   element: <Dashboard />,
      // },
      {
        path: "orders",
        element: <Orders />,
      },
      // {
      //   path: "restaurants",
      //   element: <Restaurants />,
      // },
      // {
      //   path: "menu",
      //   element: <Menu />,
      // },
      // {
      //   path: "delivery",
      //   element: <Delivery />,
      // },
      // {
      //   path: "customers",
      //   element: <Customers />,
      // },
      // {
      //   path: "payments",
      //   element: <Payments />,
      // },
      // {
      //   path: "analytics",
      //   element: <Analytics />,
      // },
      // {
      //   path: "notifications",
      //   element: <Notifications />,
      // },
      // {
      //   path: "settings",
      //   element: <Settings />,
      // },
    ],
  },
]);

export default router;