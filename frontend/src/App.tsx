import { useEffect, useState } from "react";
import { api } from "./api/client";
import { AdminPage } from "./pages/AdminPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { ActivityResponse, Portfolio } from "./types/portfolio";

export function App() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [activity, setActivity] = useState<ActivityResponse>();
  const [page, setPage] = useState(location.hash === "#admin" ? "admin" : "site");
  const [token, setToken] = useState(localStorage.getItem("portfolio-admin-token") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPortfolio().then(setPortfolio).catch((err) => setError(err.message));
    api.getActivity().then(setActivity).catch(() => undefined);
  }, []);

  useEffect(() => {
    const syncHash = () => setPage(location.hash === "#admin" ? "admin" : "site");
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  async function handleLogin(email: string, password: string) {
    const result = await api.login(email, password);
    localStorage.setItem("portfolio-admin-token", result.token);
    setToken(result.token);
  }

  async function handleSave(next: Portfolio) {
    const saved = await api.updatePortfolio(next, token);
    setPortfolio(saved);
  }

  if (error) {
    return <main className="loading">{error}</main>;
  }

  if (!portfolio) {
    return <main className="loading">Loading portfolio...</main>;
  }

  if (page === "admin") {
    return (
      <AdminPage
        portfolio={portfolio}
        token={token}
        onLogin={handleLogin}
        onSave={handleSave}
        onBack={() => {
          location.hash = "";
          setPage("site");
        }}
      />
    );
  }

  return <PortfolioPage portfolio={portfolio} activity={activity} onAdminClick={() => { location.hash = "admin"; setPage("admin"); }} />;
}
