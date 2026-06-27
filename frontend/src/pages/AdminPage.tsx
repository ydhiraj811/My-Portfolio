import { FormEvent, useState } from "react";
import type { Portfolio } from "../types/portfolio";

type Props = {
  portfolio: Portfolio;
  token: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onSave: (portfolio: Portfolio) => Promise<void>;
  onBack: () => void;
};

const sections = ["profile", "stats", "stack", "skills", "experience", "projects", "education", "blogs"] as const;

export function AdminPage({ portfolio, token, onLogin, onSave, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState<(typeof sections)[number]>("profile");
  const [draft, setDraft] = useState(JSON.stringify(portfolio, null, 2));
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    await onLogin(email, password);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    const parsed = JSON.parse(draft) as Portfolio;
    await onSave(parsed);
    setMessage("Saved to MongoDB through the protected API.");
    window.setTimeout(() => setMessage(""), 2600);
  }

  function focusSection(section: (typeof sections)[number]) {
    setActive(section);
    setDraft(JSON.stringify({ ...portfolio, [section]: portfolio[section] }, null, 2));
  }

  if (!token) {
    return (
      <main className="admin-shell login-shell">
        <form className="login-card" onSubmit={handleLogin}>
          <span className="section-label">Admin</span>
          <h1>Sign in to edit portfolio</h1>
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="btn primary" type="submit">Login</button>
          <button className="btn" type="button" onClick={onBack}>Back to site</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Portfolio admin</h1>
        </div>
        <div className="admin-actions">
          <button className="btn" onClick={onBack}>View site</button>
        </div>
      </header>
      <section className="admin-grid">
        <nav className="admin-menu" aria-label="Admin sections">
          {sections.map((section) => <button className={active === section ? "active" : ""} onClick={() => focusSection(section)} key={section}>{titleCase(section)}</button>)}
        </nav>
        <form className="editor-panel array-editor" onSubmit={handleSave}>
          <h2>{titleCase(active)}</h2>
          <p className="muted">Edit JSON and save. The complete document is persisted in MongoDB.</p>
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
          <div className="save-row"><span className="status">{message}</span><button className="btn primary" type="submit">Save to MongoDB</button></div>
        </form>
      </section>
    </main>
  );
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
