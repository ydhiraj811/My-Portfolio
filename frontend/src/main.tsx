import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

if (import.meta.env.PROD && (import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_CLARITY_PROJECT_ID)) {
  window.setTimeout(() => {
    import("./analytics").then(({ initAnalytics }) => initAnalytics());
  }, 1800);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
