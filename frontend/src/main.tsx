import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

if (import.meta.env.PROD) {
  window.setTimeout(() => {
    import("./analytics").then(({ initAnalytics }) => initAnalytics());
  }, 1800);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
