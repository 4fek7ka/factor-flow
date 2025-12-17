// src/router.tsx

import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";

import { PortfolioPage } from "./pages/PortfolioPage";
import { AssetsPage } from "./pages/AssetsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SimulationPage } from "./pages/SimulationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <PortfolioPage /> },
      { path: "assets", element: <AssetsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "simulation", element: <SimulationPage /> },
    ],
  },
]);
