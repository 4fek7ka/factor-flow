import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Tabler
import "@tabler/core/dist/css/tabler.min.css";
import "@tabler/core/dist/js/tabler.min.js";

// 🎨 Наша тема (ОДИН РАЗ, ГЛОБАЛЬНО)
import "./theme/theme.css";

// Включаем тёмную тему Tabler
document.documentElement.setAttribute("data-bs-theme", "dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
