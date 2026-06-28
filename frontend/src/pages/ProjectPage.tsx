import type { Portfolio } from "../types/portfolio";

type Project = Portfolio["projects"][number];

type Props = {
  project: Project;
  portfolio: Portfolio;
  onBack: () => void;
  onAdminClick: () => void;
};

export function ProjectPage({ project, portfolio, onBack, onAdminClick }: Props) {
  const { profile } = portfolio;

  return (
    <main className="site-shell article-shell">
      <header className="topbar">
        <button className="brand brand-button" onClick={onBack} aria-label="Go back to portfolio">
          <span className="brand-mark">DY</span>
          <span>{profile.name.split(" ")[0]}</span>
        </button>
        <nav className="nav" aria-label="Project navigation">
          <button onClick={onBack}>Portfolio</button>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.leetcode} target="_blank" rel="noreferrer">LeetCode</a>
        </nav>
        <div className="top-actions">
          <button className="admin-tab" onClick={onAdminClick}>Admin</button>
        </div>
      </header>

      <article className="article-page project-page">
        <button className="btn ghost" onClick={onBack}>Back to projects</button>
        {project.imageUrl && <img className="article-cover" src={project.imageUrl} alt="" />}
        <div className="article-kicker">{project.year}</div>
        <h1>{project.title}</h1>
        <p className="article-excerpt">{project.summary}</p>

        <div className="project-detail-grid">
          <section className="article-body">
            {formatBody(project.body || project.summary).map((paragraph, index) => (
              <p key={`${paragraph}-${index}`}>{paragraph}</p>
            ))}
          </section>
          <aside className="project-side">
            <h2>Stack</h2>
            <div className="chips">{project.stack.map((item) => <span className="chip" key={item}>{item}</span>)}</div>
            {(project.highlights || []).length > 0 && (
              <>
                <h2>Highlights</h2>
                <ul className="detail-list">{project.highlights?.map((item) => <li key={item}>{item}</li>)}</ul>
              </>
            )}
            {project.links.length > 0 && (
              <>
                <h2>Links</h2>
                <div className="card-actions">{project.links.map((link) => <a className="btn ghost" href={link.url} target="_blank" rel="noreferrer" key={link.label}>{link.label}</a>)}</div>
              </>
            )}
          </aside>
        </div>
      </article>
    </main>
  );
}

function formatBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
