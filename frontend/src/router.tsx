import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "./layout/AppLayout";

import { PortfolioPage } from "./pages/PortfolioPage";
import { PricesPage } from "./pages/PricesPage";
import { AssetsPage } from "./pages/AssetsPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <PortfolioPage />,
      },
      {
        path: "prices",
        element: <PricesPage />,
      },
      {
        path: "assets",
        element: <AssetsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
