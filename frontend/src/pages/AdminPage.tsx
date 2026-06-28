import { FormEvent, ReactNode, useEffect, useState } from "react";
import type { Link, Portfolio } from "../types/portfolio";

type Props = {
  portfolio: Portfolio;
  token: string;
  authMessage: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onSave: (section: Section, portfolio: Portfolio) => Promise<void>;
  onLogout: () => void;
  onBack: () => void;
};

type Section = "profile" | "stats" | "stack" | "skills" | "experience" | "projects" | "education" | "blogs";
type Notify = (message: string, type?: "success" | "error") => void;

const sections: Section[] = ["profile", "stats", "stack", "skills", "experience", "projects", "education", "blogs"];
let notifyTimer: number | undefined;

export function AdminPage({ portfolio, token, authMessage, onLogin, onSave, onLogout, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState<Section>("profile");
  const [draft, setDraft] = useState<Portfolio>(portfolio);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setDraft(portfolio);
  }, [portfolio]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    try {
      await onLogin(email, password);
      setPassword("");
      notify("Logged in successfully.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Login failed.", "error");
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    try {
      await onSave(active, draft);
      notify(`${sectionTitle(active)} saved to MongoDB.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save changes.", "error");
    }
  }

  function updateProfile(key: keyof Portfolio["profile"], value: string) {
    setDraft((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  }

  function updateArray<K extends keyof Portfolio>(key: K, value: Portfolio[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function notify(nextMessage: string, type: "success" | "error" = "success") {
    setMessage(nextMessage);
    setMessageType(type);
    window.clearTimeout(notifyTimer);
    notifyTimer = window.setTimeout(() => setMessage(""), 3200);
  }

  if (!token) {
    return (
      <main className="admin-shell login-shell">
        <form className="login-card" onSubmit={handleLogin}>
          <span className="section-label">Admin</span>
          <h1>Sign in to edit portfolio</h1>
          {(authMessage || message) && <p className={`admin-alert ${messageType === "error" || authMessage ? "error" : "success"}`}>{authMessage || message}</p>}
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
          <p>Field-based dashboard. Saves update MongoDB through the protected API.</p>
        </div>
        <div className="admin-actions">
          <button className="btn" onClick={() => setPreviewOpen((value) => !value)}>{previewOpen ? "Hide preview" : "Preview"}</button>
          <button className="btn" onClick={onLogout}>Logout</button>
          <button className="btn" onClick={onBack}>View site</button>
        </div>
      </header>

      <section className="admin-grid">
        <nav className="admin-menu" aria-label="Admin sections">
          {sections.map((section) => (
            <button className={active === section ? "active" : ""} onClick={() => setActive(section)} key={section}>
              {titleCase(section)}
            </button>
          ))}
        </nav>

        <form className="editor-panel admin-form" onSubmit={handleSave}>
          {message && <div className={`admin-alert ${messageType}`}>{message}</div>}
          <div className="editor-title">
            <div>
              <span className="section-label">{titleCase(active)}</span>
              <h2>{sectionTitle(active)}</h2>
            </div>
            <button className="btn primary" type="submit">Save changes</button>
          </div>

          {active === "profile" && <ProfileEditor portfolio={draft} updateProfile={updateProfile} />}
          {active === "stats" && <StatsEditor portfolio={draft} notify={notify} onChange={(stats) => updateArray("stats", stats)} />}
          {active === "stack" && <StackEditor portfolio={draft} notify={notify} onChange={(stack) => updateArray("stack", stack)} />}
          {active === "skills" && <SkillsEditor portfolio={draft} notify={notify} onChange={(skills) => updateArray("skills", skills)} />}
          {active === "experience" && <ExperienceEditor portfolio={draft} notify={notify} onChange={(experience) => updateArray("experience", experience)} />}
          {active === "projects" && <ProjectsEditor portfolio={draft} notify={notify} onChange={(projects) => updateArray("projects", projects)} />}
          {active === "education" && <EducationEditor portfolio={draft} notify={notify} onChange={(education) => updateArray("education", education)} />}
          {active === "blogs" && <BlogsEditor portfolio={draft} notify={notify} onChange={(blogs) => updateArray("blogs", blogs)} />}

          {previewOpen && <PreviewPanel active={active} portfolio={draft} />}

          <div className="save-row">
            <span className={`status ${messageType}`}>{message || "Unsaved edits stay on this screen until you save."}</span>
            <button className="btn primary" type="submit">Save changes</button>
          </div>
        </form>
      </section>
    </main>
  );
}

function ProfileEditor({ portfolio, updateProfile }: { portfolio: Portfolio; updateProfile: (key: keyof Portfolio["profile"], value: string) => void }) {
  const inputFields: Array<[keyof Portfolio["profile"], string]> = [
    ["name", "Name"],
    ["role", "Role"],
    ["location", "Location"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["headline", "Headline"],
    ["resumeUrl", "Resume URL"],
    ["github", "GitHub URL"],
    ["linkedin", "LinkedIn URL"],
    ["leetcode", "LeetCode URL"],
  ];

  return (
    <div className="form-section">
      <div className="form-grid">
        {inputFields.map(([key, label]) => (
          <label className={key === "headline" ? "field full" : "field"} key={key}>
            {label}
            <input value={portfolio.profile[key]} onChange={(event) => updateProfile(key, event.target.value)} />
          </label>
        ))}
        <label className="field full">Professional summary<textarea value={portfolio.profile.summary} onChange={(event) => updateProfile("summary", event.target.value)} /></label>
        <label className="field full">About section<textarea value={portfolio.profile.about} onChange={(event) => updateProfile("about", event.target.value)} /></label>
      </div>
    </div>
  );
}

function StatsEditor({ portfolio, notify, onChange }: { portfolio: Portfolio; notify: Notify; onChange: (value: Portfolio["stats"]) => void }) {
  function addStat() {
    onChange([...portfolio.stats, { value: "", label: "" }]);
    notify("Stat section added.");
  }

  return (
    <RepeatableList
      addLabel="Add stat"
      onAdd={addStat}
      emptyText="No stats yet."
    >
      {portfolio.stats.map((stat, index) => (
        <EditorCard title={`Stat ${index + 1}`} onRemove={() => onChange(removeAt(portfolio.stats, index))} key={index}>
          <div className="mini-grid">
            <label className="field">Value<input value={stat.value} onChange={(event) => onChange(replaceAt(portfolio.stats, index, { ...stat, value: event.target.value }))} /></label>
            <label className="field">Label<input value={stat.label} onChange={(event) => onChange(replaceAt(portfolio.stats, index, { ...stat, label: event.target.value }))} /></label>
          </div>
        </EditorCard>
      ))}
    </RepeatableList>
  );
}

function StackEditor({ portfolio, notify, onChange }: { portfolio: Portfolio; notify: Notify; onChange: (value: string[]) => void }) {
  return <StringList title="Tech stack" items={portfolio.stack} onChange={onChange} notify={notify} addLabel="Add technology" addedMessage="Technology added." placeholder="TypeScript" />;
}

function SkillsEditor({ portfolio, notify, onChange }: { portfolio: Portfolio; notify: Notify; onChange: (value: Portfolio["skills"]) => void }) {
  function addSkillGroup() {
    onChange([...portfolio.skills, { title: "", items: [] }]);
    notify("Skill group added.");
  }

  return (
    <RepeatableList addLabel="Add skill group" onAdd={addSkillGroup} emptyText="No skills yet.">
      {portfolio.skills.map((group, index) => (
        <EditorCard title={group.title || `Skill group ${index + 1}`} onRemove={() => onChange(removeAt(portfolio.skills, index))} key={index}>
          <label className="field">Group title<input value={group.title} onChange={(event) => onChange(replaceAt(portfolio.skills, index, { ...group, title: event.target.value }))} /></label>
          <StringList
            title="Skills"
            items={group.items}
            addLabel="Add skill"
            addedMessage="Skill added."
            placeholder="React.js"
            notify={notify}
            onChange={(items) => onChange(replaceAt(portfolio.skills, index, { ...group, items }))}
          />
        </EditorCard>
      ))}
    </RepeatableList>
  );
}

function ExperienceEditor({ portfolio, notify, onChange }: { portfolio: Portfolio; notify: Notify; onChange: (value: Portfolio["experience"]) => void }) {
  function addExperience() {
    onChange([...portfolio.experience, { role: "", company: "", period: "", location: "", bullets: [] }]);
    notify("Experience section added.");
  }

  return (
    <RepeatableList addLabel="Add experience" onAdd={addExperience} emptyText="No experience yet.">
      {portfolio.experience.map((item, index) => (
        <EditorCard title={item.company || `Experience ${index + 1}`} onRemove={() => onChange(removeAt(portfolio.experience, index))} key={index}>
          <div className="mini-grid">
            <label className="field">Role<input value={item.role} onChange={(event) => onChange(replaceAt(portfolio.experience, index, { ...item, role: event.target.value }))} /></label>
            <label className="field">Company<input value={item.company} onChange={(event) => onChange(replaceAt(portfolio.experience, index, { ...item, company: event.target.value }))} /></label>
            <label className="field">Period<input value={item.period} onChange={(event) => onChange(replaceAt(portfolio.experience, index, { ...item, period: event.target.value }))} /></label>
            <label className="field">Location<input value={item.location} onChange={(event) => onChange(replaceAt(portfolio.experience, index, { ...item, location: event.target.value }))} /></label>
          </div>
          <StringList
            title="Bullets"
            items={item.bullets}
            addLabel="Add bullet"
            addedMessage="Experience bullet added."
            placeholder="Built and owned production APIs..."
            notify={notify}
            onChange={(bullets) => onChange(replaceAt(portfolio.experience, index, { ...item, bullets }))}
          />
        </EditorCard>
      ))}
    </RepeatableList>
  );
}

function ProjectsEditor({ portfolio, notify, onChange }: { portfolio: Portfolio; notify: Notify; onChange: (value: Portfolio["projects"]) => void }) {
  function addProject() {
    onChange([...portfolio.projects, { title: "", slug: "", year: "", summary: "", body: "", imageUrl: "", stack: [], highlights: [], links: [], metaTitle: "", metaDescription: "" }]);
    notify("Project section added.");
  }

  return (
    <RepeatableList addLabel="Add project" onAdd={addProject} emptyText="No projects yet.">
      {portfolio.projects.map((project, index) => (
        <EditorCard title={project.title || `Project ${index + 1}`} onRemove={() => onChange(removeAt(portfolio.projects, index))} key={index}>
          <div className="mini-grid">
            <label className="field">Title<input value={project.title} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, title: event.target.value }))} /></label>
            <label className="field">Slug<input value={project.slug || ""} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, slug: event.target.value }))} /></label>
            <label className="field">Year / type<input value={project.year} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, year: event.target.value }))} /></label>
            <label className="field">Image URL<input value={project.imageUrl || ""} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, imageUrl: event.target.value }))} /></label>
          </div>
          <label className="field">Summary<textarea value={project.summary} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, summary: event.target.value }))} /></label>
          <label className="field">Detail body<textarea value={project.body || ""} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, body: event.target.value }))} /></label>
          <div className="mini-grid">
            <label className="field">SEO title<input value={project.metaTitle || ""} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, metaTitle: event.target.value }))} /></label>
            <label className="field">SEO description<input value={project.metaDescription || ""} onChange={(event) => onChange(replaceAt(portfolio.projects, index, { ...project, metaDescription: event.target.value }))} /></label>
          </div>
          <StringList
            title="Stack"
            items={project.stack}
            addLabel="Add stack item"
            addedMessage="Project stack item added."
            placeholder="MongoDB"
            notify={notify}
            onChange={(stack) => onChange(replaceAt(portfolio.projects, index, { ...project, stack }))}
          />
          <StringList
            title="Highlights"
            items={project.highlights || []}
            addLabel="Add highlight"
            addedMessage="Project highlight added."
            placeholder="JWT-protected admin dashboard"
            notify={notify}
            onChange={(highlights) => onChange(replaceAt(portfolio.projects, index, { ...project, highlights }))}
          />
          <LinksEditor links={project.links} notify={notify} onChange={(links) => onChange(replaceAt(portfolio.projects, index, { ...project, links }))} />
        </EditorCard>
      ))}
    </RepeatableList>
  );
}

function EducationEditor({ portfolio, notify, onChange }: { portfolio: Portfolio; notify: Notify; onChange: (value: Portfolio["education"]) => void }) {
  function addEducation() {
    onChange([...portfolio.education, { title: "", institution: "", period: "", detail: "" }]);
    notify("Education section added.");
  }

  return (
    <RepeatableList addLabel="Add education" onAdd={addEducation} emptyText="No education yet.">
      {portfolio.education.map((item, index) => (
        <EditorCard title={item.title || `Education ${index + 1}`} onRemove={() => onChange(removeAt(portfolio.education, index))} key={index}>
          <div className="mini-grid">
            <label className="field">Title<input value={item.title} onChange={(event) => onChange(replaceAt(portfolio.education, index, { ...item, title: event.target.value }))} /></label>
            <label className="field">Institution<input value={item.institution} onChange={(event) => onChange(replaceAt(portfolio.education, index, { ...item, institution: event.target.value }))} /></label>
            <label className="field">Period<input value={item.period} onChange={(event) => onChange(replaceAt(portfolio.education, index, { ...item, period: event.target.value }))} /></label>
            <label className="field">Detail<input value={item.detail} onChange={(event) => onChange(replaceAt(portfolio.education, index, { ...item, detail: event.target.value }))} /></label>
          </div>
        </EditorCard>
      ))}
    </RepeatableList>
  );
}

function BlogsEditor({ portfolio, notify, onChange }: { portfolio: Portfolio; notify: Notify; onChange: (value: Portfolio["blogs"]) => void }) {
  function addBlog() {
    onChange([...portfolio.blogs, { title: "", date: "", excerpt: "", slug: "", body: "", coverImage: "", metaTitle: "", metaDescription: "", published: true }]);
    notify("Blog section added.");
  }

  return (
    <RepeatableList addLabel="Add blog" onAdd={addBlog} emptyText="No blogs yet.">
      {portfolio.blogs.map((blog, index) => (
        <EditorCard title={blog.title || `Blog ${index + 1}`} onRemove={() => onChange(removeAt(portfolio.blogs, index))} key={index}>
          <div className="mini-grid">
            <label className="field">Title<input value={blog.title} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, title: event.target.value }))} /></label>
            <label className="field">Date / category<input value={blog.date} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, date: event.target.value }))} /></label>
            <label className="field">Slug<input value={blog.slug || ""} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, slug: event.target.value }))} /></label>
            <label className="field">Cover image URL<input value={blog.coverImage || ""} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, coverImage: event.target.value }))} /></label>
            <label className="check-field"><input type="checkbox" checked={blog.published !== false} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, published: event.target.checked }))} /> Published</label>
          </div>
          <label className="field">Excerpt<textarea value={blog.excerpt} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, excerpt: event.target.value }))} /></label>
          <label className="field">Body<textarea value={blog.body || ""} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, body: event.target.value }))} /></label>
          <div className="mini-grid">
            <label className="field">SEO title<input value={blog.metaTitle || ""} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, metaTitle: event.target.value }))} /></label>
            <label className="field">SEO description<input value={blog.metaDescription || ""} onChange={(event) => onChange(replaceAt(portfolio.blogs, index, { ...blog, metaDescription: event.target.value }))} /></label>
          </div>
        </EditorCard>
      ))}
    </RepeatableList>
  );
}

function PreviewPanel({ active, portfolio }: { active: Section; portfolio: Portfolio }) {
  const previewItems = active === "projects"
    ? portfolio.projects.map((item) => ({ title: item.title, text: item.summary, image: item.imageUrl }))
    : active === "blogs"
      ? portfolio.blogs.map((item) => ({ title: item.title, text: item.excerpt, image: item.coverImage }))
      : [];

  return (
    <section className="preview-panel">
      <div className="subhead"><h3>Preview</h3></div>
      {active === "profile" && <p>{portfolio.profile.headline}</p>}
      {active === "stats" && <div className="stats">{portfolio.stats.map((item) => <div className="stat" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>}
      {active === "stack" && <div className="chips">{portfolio.stack.map((item) => <span className="chip" key={item}>{item}</span>)}</div>}
      {active === "skills" && <div className="chips">{portfolio.skills.flatMap((group) => group.items).slice(0, 18).map((item) => <span className="chip" key={item}>{item}</span>)}</div>}
      {active === "experience" && <p>{portfolio.experience[0]?.role || "No experience yet"} {portfolio.experience[0]?.company ? `at ${portfolio.experience[0].company}` : ""}</p>}
      {active === "education" && <p>{portfolio.education[0]?.title || "No education yet"}</p>}
      {(active === "projects" || active === "blogs") && (
        <div className="preview-grid">
          {previewItems.map((item) => (
            <article className="preview-card" key={item.title}>
              {item.image && <img src={item.image} alt="" />}
              <h4>{item.title || "Untitled"}</h4>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StringList({
  title,
  items,
  onChange,
  notify,
  addLabel,
  addedMessage,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  notify: Notify;
  addLabel: string;
  addedMessage: string;
  placeholder: string;
}) {
  function addItem() {
    onChange([...items, ""]);
    notify(addedMessage);
  }

  return (
    <div className="inline-list">
      <div className="subhead"><h3>{title}</h3><button className="btn ghost" type="button" onClick={addItem}>{addLabel}</button></div>
      {items.length === 0 && <p className="muted">Nothing added yet.</p>}
      {items.map((item, index) => (
        <div className="item-row" key={index}>
          <input value={item} placeholder={placeholder} onChange={(event) => onChange(replaceAt(items, index, event.target.value))} />
          <button className="btn danger" type="button" onClick={() => onChange(removeAt(items, index))}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function LinksEditor({ links, notify, onChange }: { links: Link[]; notify: Notify; onChange: (links: Link[]) => void }) {
  function addLink() {
    onChange([...links, { label: "", url: "" }]);
    notify("Project link added.");
  }

  return (
    <div className="inline-list">
      <div className="subhead"><h3>Links</h3><button className="btn ghost" type="button" onClick={addLink}>Add link</button></div>
      {links.length === 0 && <p className="muted">No project links yet.</p>}
      {links.map((link, index) => (
        <div className="item-row two" key={index}>
          <input value={link.label} placeholder="GitHub" onChange={(event) => onChange(replaceAt(links, index, { ...link, label: event.target.value }))} />
          <input value={link.url} placeholder="https://github.com/..." onChange={(event) => onChange(replaceAt(links, index, { ...link, url: event.target.value }))} />
          <button className="btn danger" type="button" onClick={() => onChange(removeAt(links, index))}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function RepeatableList({ children, addLabel, onAdd, emptyText }: { children: ReactNode; addLabel: string; onAdd: () => void; emptyText: string }) {
  return (
    <div className="repeatable-list">
      <div className="repeatable-top">
        <p className="muted">{emptyText}</p>
        <button className="btn primary" type="button" onClick={onAdd}>{addLabel}</button>
      </div>
      {children}
    </div>
  );
}

function EditorCard({ title, children, onRemove }: { title: string; children: ReactNode; onRemove: () => void }) {
  return (
    <article className="editor-card">
      <div className="card-toolbar">
        <h3>{title}</h3>
        <button className="btn danger" type="button" onClick={onRemove}>Remove</button>
      </div>
      {children}
    </article>
  );
}

function replaceAt<T>(items: T[], index: number, next: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? next : item));
}

function removeAt<T>(items: T[], index: number) {
  return items.filter((_item, itemIndex) => itemIndex !== index);
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sectionTitle(section: Section) {
  const titles: Record<Section, string> = {
    profile: "Profile details",
    stats: "Impact stats",
    stack: "Portfolio tech stack",
    skills: "Skill groups",
    experience: "Work experience",
    projects: "Projects",
    education: "Education and certifications",
    blogs: "Blog posts",
  };
  return titles[section];
}
