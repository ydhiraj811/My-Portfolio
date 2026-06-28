import type { Portfolio } from "../types/portfolio";

type Blog = Portfolio["blogs"][number];

type Props = {
  blog: Blog;
  portfolio: Portfolio;
  onBack: () => void;
  onAdminClick: () => void;
};

export function BlogPage({ blog, portfolio, onBack, onAdminClick }: Props) {
  const { profile } = portfolio;

  return (
    <main className="site-shell article-shell">
      <header className="topbar">
        <button className="brand brand-button" onClick={onBack} aria-label="Go back to portfolio">
          <span className="brand-mark">DY</span>
          <span>{profile.name.split(" ")[0]}</span>
        </button>
        <nav className="nav" aria-label="Article navigation">
          <button onClick={onBack}>Portfolio</button>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.leetcode} target="_blank" rel="noreferrer">LeetCode</a>
        </nav>
        <div className="top-actions">
          <button className="admin-tab" onClick={onAdminClick}>Admin</button>
        </div>
      </header>

      <article className="article-page">
        <button className="btn ghost" onClick={onBack}>Back to portfolio</button>
        {blog.coverImage && <img className="article-cover" src={blog.coverImage} alt="" />}
        <div className="article-kicker">{blog.date}</div>
        <h1>{blog.title}</h1>
        <p className="article-excerpt">{blog.excerpt}</p>
        <div className="article-body">
          {formatBody(blog.body || blog.excerpt).map((paragraph, index) => (
            <p key={`${paragraph}-${index}`}>{paragraph}</p>
          ))}
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
