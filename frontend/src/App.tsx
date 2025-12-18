import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-primary)",
      }}
    >
      <RouterProvider router={router} />
    </div>
  );
}
