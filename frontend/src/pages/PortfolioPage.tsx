import type { ActivityResponse, Portfolio } from "../types/portfolio";
import { ActivityCalendar } from "../components/ActivityCalendar";
import {FaGithub} from "react-icons/fa"
import { SiLeetcode } from "react-icons/si";

type Props = {
  portfolio: Portfolio;
  activity?: ActivityResponse;
  onAdminClick: () => void;
};

export function PortfolioPage({ portfolio, activity, onAdminClick }: Props) {
  const { profile } = portfolio;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="" aria-label="Go to top">
          <span className="brand-mark">DY</span>
          <span>{profile.name.split(" ")[0]}</span>
        </a>
        <nav className="nav">
          <a href="/" onClick={(e) => {e.preventDefault(); scrollToSection("about");}}>About</a>

          <a href="/" onClick={(e) => {e.preventDefault(); scrollToSection("skills");}}>Skills</a>

          <a href="/" onClick={(e) => {e.preventDefault(); scrollToSection("consistency");}}>Consistency</a>

          <a href="/" onClick={(e) => {e.preventDefault(); scrollToSection("experience");}}>Experience</a>

          <a href="/" onClick={(e) => {e.preventDefault(); scrollToSection("projects");}}>Projects</a>

          <a href="/" onClick={(e) => {e.preventDefault(); scrollToSection("blog");}}>Blog</a>

          <a href="/" onClick={(e) => {e.preventDefault(); scrollToSection("contact");}}>Contact</a>
        </nav>
        <div className="top-actions">
          <a className="icon-btn" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={20}/></a>
          <a className="icon-btn" href={profile.leetcode} target="_blank" rel="noreferrer" aria-label="LeetCode"><SiLeetcode size={20}></SiLeetcode></a>
          <button className="admin-tab" onClick={onAdminClick}>Admin</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-content">
          <p className="eyebrow">{profile.role} </p>
          <h1>{profile.name}</h1>
          <p className="hero-lede">{profile.headline}</p>
          <div className="hero-links">
            <a className="btn primary" href="#projects">View projects</a>
            <a className="btn dark" href={`mailto:${profile.email}`}>Contact me</a>
            <a className="btn dark" href={profile.resumeUrl} target="_blank" rel="noreferrer">Resume</a>
          </div>
        </div>
      </section>

      <section className="section tight" id="about">
        <div className="section-head">
          <div><span className="section-label">About</span><h2>Engineer with production ownership.</h2></div>
          <p>{profile.summary}</p>
        </div>
        <div className="about-grid">
          <article className="panel">
            <p className="about-copy">{profile.about}</p>
            <div className="stats">
              {portfolio.stats.map((item) => <div className="stat" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
            </div>
          </article>
          <aside className="panel">
            <dl className="info-list">
              <div><dt>Email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${profile.phone}`}>{profile.phone}</a></dd></div>
              <div><dt>Location</dt><dd>{profile.location}</dd></div>
              <div><dt>GitHub</dt><dd><a href={profile.github} target="_blank" rel="noreferrer">{cleanUrl(profile.github)}</a></dd></div>
              <div><dt>LeetCode</dt><dd><a href={profile.leetcode} target="_blank" rel="noreferrer">{cleanUrl(profile.leetcode)}</a></dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="section" id="skills">
        <div className="section-head">
          <div><span className="section-label">Skills</span><h2>Built around backend, cloud, and product reliability.</h2></div>
          
        </div>
        <div className="skill-wrap">
          {portfolio.skills.map((group) => (
            <article className="skill-group" key={group.title}>
              <h3>{group.title}</h3>
              <div className="chips">{group.items.map((item) => <span className="chip" key={item}>{item}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="section consistency-band" id="consistency">
        <div className="section-head">
          <div><span className="section-label">Consistency</span></div>
        </div>
        <div className="activity-grid">
          {activity ? (
            <>
              <ActivityCalendar activity={activity.github} />
              <ActivityCalendar activity={activity.leetcode} />
            </>
          ) : (
            <p className="panel">Loading live activity...</p>
          )}
        </div>
      </section>

      <section className="section" id="experience">
        <div className="section-head">
          <div><span className="section-label">Experience</span><h2>Practical work in enterprise systems.</h2></div>
          <p>Recent work includes API design, production debugging, automation leadership, and monitoring visibility.</p>
        </div>
        <div className="timeline">
          {portfolio.experience.map((item) => (
            <article className="timeline-item" key={`${item.company}-${item.period}`}>
              <div className="timeline-meta">{item.period} · {item.location}</div>
              <h3 className="timeline-title">{item.role} | {item.company}</h3>
              <ul className="bullets">{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="projects">
        <div className="section-head">
          <div><span className="section-label">Projects</span><h2>Full-stack builds with real product surfaces.</h2></div>
          <p>Projects are stored in MongoDB and editable through the protected admin dashboard.</p>
        </div>
        <div className="project-grid">
          {portfolio.projects.map((project) => (
            <article className="project-card" key={project.title}>
              {project.imageUrl && <img className="card-image" src={project.imageUrl} alt="" />}
              <div className="project-top"><h3>{project.title}</h3><span className="project-year">{project.year}</span></div>
              <p>{project.summary}</p>
              <div className="chips">{project.stack.map((tech) => <span className="chip" key={tech}>{tech}</span>)}</div>
              <div className="card-actions">
                <a className="btn ghost" href={`/project/${getProjectSlug(project)}`}>View details</a>
                {project.links.map((link) => <a className="btn ghost" href={link.url} target="_blank" rel="noreferrer" key={link.label}>{link.label}</a>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="blog">
        <div className="section-head">
          <div><span className="section-label">Blog</span><h2>Writing shelf for engineering notes.</h2></div>
          <p>Posts are stored with the rest of the portfolio content and can be updated from admin.</p>
        </div>
        <div className="blog-grid">
          {portfolio.blogs.filter((blog) => blog.published !== false).map((blog) => (
            <a className="blog-card" href={`/blog/${getBlogSlug(blog)}`} key={blog.title}>
              {blog.coverImage && <img className="card-image" src={blog.coverImage} alt="" />}
              <div className="blog-date">{blog.date}</div>
              <h3>{blog.title}</h3>
              <p>{blog.excerpt}</p>
              <span className="read-more">Read article</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section dark" id="contact">
        <div className="section-head">
          <div><span className="section-label">Contact</span><h2>Let us build something reliable.</h2></div>
          <p>Open to backend, cloud, full-stack, and infrastructure-focused software engineering conversations.</p>
        </div>
        <div className="contact-grid">
          <p className="contact-note">{profile.summary}</p>
          <div className="social-grid">
            {[
              ["Email", profile.email, `mailto:${profile.email}`],
              ["LinkedIn", cleanUrl(profile.linkedin), profile.linkedin],
              ["GitHub", cleanUrl(profile.github), profile.github],
              ["LeetCode", cleanUrl(profile.leetcode), profile.leetcode],
            ].map(([label, text, url]) => (
              <a className="social-card" href={url} target="_blank" rel="noreferrer" key={label}><span>{label}</span><span>{text}</span></a>
            ))}
          </div>
        </div>
      </section>
      <footer className="footer"><div className="footer-inner"><span>Built for {profile.name}</span><span>MERN + TypeScript with MongoDB-managed content.</span></div></footer>
    </main>
  );
}

function cleanUrl(url = "") {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function getBlogSlug(blog: Portfolio["blogs"][number]) {
  return blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getProjectSlug(project: Portfolio["projects"][number]) {
  return project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
