import { useEffect, useState } from "react";
import { ApiError, api } from "./api/client";
import { AdminPage } from "./pages/AdminPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { ActivityResponse, Portfolio } from "./types/portfolio";

export function App() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [activity, setActivity] = useState<ActivityResponse>();
  const [page, setPage] = useState(location.hash === "#admin" ? "admin" : "site");
  const [token, setToken] = useState("");
  const [authMessage, setAuthMessage] = useState("");
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
    setToken(result.token);
    setAuthMessage("");
  }

  async function handleSave(next: Portfolio) {
    try {
      const saved = await api.updatePortfolio(next, token);
      setPortfolio(saved);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken("");
        setAuthMessage("Your admin session expired. Please login again.");
      }
      throw err;
    }
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
        authMessage={authMessage}
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
