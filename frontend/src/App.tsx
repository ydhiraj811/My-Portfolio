import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ApiError, api } from "./api/client";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { ActivityResponse, Portfolio } from "./types/portfolio";
import { defaultContent } from "../../backend/src/utils/defaultContent";
import { contentSlug } from "./utils/contentSlug";

const AdminPage = lazy(() => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const BlogPage = lazy(() => import("./pages/BlogPage").then((module) => ({ default: module.BlogPage })));
const ProjectPage = lazy(() => import("./pages/ProjectPage").then((module) => ({ default: module.ProjectPage })));
const PortfolioChat = lazy(() => import("./components/PortfolioChat").then((module) => ({ default: module.PortfolioChat })));
const PORTFOLIO_CACHE_KEY = "portfolio-content-v2";

export function App() {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => readCachedPortfolio() ?? (defaultContent as Portfolio));
  const [activity, setActivity] = useState<ActivityResponse>();
  const [page, setPage] = useState(getPageFromLocation());
  const [token, setToken] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [activityError, setActivityError] = useState("");
  const contentRequestVersion = useRef(0);

  useEffect(() => {
    const requestVersion = contentRequestVersion.current;
    api
      .getPortfolio()
      .then((nextPortfolio) => {
        if (requestVersion !== contentRequestVersion.current) return;
        setPortfolio(nextPortfolio);
        cachePortfolio(nextPortfolio);
      })
      .catch(() => undefined);

    const loadActivity = () => {
      api.getActivity().then((nextActivity) => {
        setActivity(nextActivity);
        setActivityError("");
      }).catch((error: unknown) => {
        setActivityError(error instanceof Error ? error.message : "Live activity is temporarily unavailable.");
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadActivity, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = globalThis.setTimeout(loadActivity, 1200);
    return () => globalThis.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    const syncHash = () => setPage(getPageFromLocation());
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  useEffect(() => {
    updateStructuredData(page, portfolio);

    if (page === "admin") {
      updatePageMeta("Portfolio Admin | Dhiraj Kumar Yadav", "Protected admin dashboard for portfolio content.", false);
      return;
    }

    if (page.startsWith("blog:")) {
      const slug = page.slice("blog:".length);
      const blog = portfolio.blogs.find((item) => contentSlug(item) === slug && item.published !== false);
      if (blog) {
        updatePageMeta(blog.metaTitle || blog.title, blog.metaDescription || blog.excerpt);
        return;
      }
    }

    if (page.startsWith("project:")) {
      const slug = page.slice("project:".length);
      const project = portfolio.projects.find((item) => contentSlug(item) === slug);
      if (project) {
        updatePageMeta(project.metaTitle || project.title, project.metaDescription || project.summary);
        return;
      }
    }

    if (page === "not-found" || page.startsWith("blog:") || page.startsWith("project:")) {
      updatePageMeta("Page not found | Dhiraj Kumar Yadav", "The requested portfolio page could not be found.", false);
      return;
    }

    updatePageMeta(`${portfolio.profile.name} | ${portfolio.profile.role}`, portfolio.profile.summary);
  }, [page, portfolio]);

  async function handleLogin(email: string, password: string) {
    const result = await api.login(email, password);
    const adminPortfolio = await api.getAdminPortfolio(result.token);
    contentRequestVersion.current += 1;
    setPortfolio(adminPortfolio);
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

  async function handleSectionSave(section: string, next: Portfolio) {
    try {
      if (section === "projects") {
        const saved = await api.updateProjects(next.projects, token);
        setPortfolio(saved);
        return;
      }

      if (section === "blogs") {
        const saved = await api.updateBlogs(next.blogs, token);
        setPortfolio(saved);
        return;
      }

      await handleSave(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken("");
        setAuthMessage("Your admin session expired. Please login again.");
      }
      throw err;
    }
  }

  function handleLogout() {
    setToken("");
    setAuthMessage("Logged out. Please login again to edit.");
    const requestVersion = ++contentRequestVersion.current;
    api.getPortfolio().then((publicPortfolio) => {
      if (requestVersion !== contentRequestVersion.current) return;
      setPortfolio(publicPortfolio);
      cachePortfolio(publicPortfolio);
    }).catch(() => undefined);
  }

  if (page === "admin") {
    return (
      <Suspense fallback={<main className="loading">Loading admin...</main>}>
        <AdminPage
          portfolio={portfolio}
          token={token}
          authMessage={authMessage}
          onLogin={handleLogin}
          onSave={handleSectionSave}
          onLogout={handleLogout}
          onBack={() => {
            history.pushState(null, "", "/");
            setPage("site");
          }}
        />
      </Suspense>
    );
  }

  if (page.startsWith("blog:")) {
    const slug = page.slice("blog:".length);
    const blog = portfolio.blogs.find((item) => contentSlug(item) === slug && item.published !== false);

    if (blog) {
      return (
        <Suspense fallback={<main className="loading">Loading article...</main>}>
          <BlogPage
            blog={blog}
            portfolio={portfolio}
            onBack={() => {
              history.pushState(null, "", "/#blog");
              setPage("site");
              window.setTimeout(() => document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" }), 0);
            }}
            onAdminClick={() => {
              history.pushState(null, "", "/#admin");
              setPage("admin");
            }}
          />
        </Suspense>
      );
    }
    return <NotFoundPage onBack={() => { history.pushState(null, "", "/"); setPage("site"); }} />;
  }

  if (page.startsWith("project:")) {
    const slug = page.slice("project:".length);
    const project = portfolio.projects.find((item) => contentSlug(item) === slug);

    if (project) {
      return (
        <Suspense fallback={<main className="loading">Loading project...</main>}>
          <ProjectPage
            project={project}
            portfolio={portfolio}
            onBack={() => {
              history.pushState(null, "", "/#projects");
              setPage("site");
              window.setTimeout(() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }), 0);
            }}
            onAdminClick={() => {
              history.pushState(null, "", "/#admin");
              setPage("admin");
            }}
          />
        </Suspense>
      );
    }
    return <NotFoundPage onBack={() => { history.pushState(null, "", "/"); setPage("site"); }} />;
  }

  if (page === "not-found") {
    return <NotFoundPage onBack={() => { history.pushState(null, "", "/"); setPage("site"); }} />;
  }

  return (
    <>
      <PortfolioPage portfolio={portfolio} activity={activity} activityError={activityError} onAdminClick={() => { history.pushState(null, "", "/#admin"); setPage("admin"); }} />
      <Suspense fallback={null}><PortfolioChat /></Suspense>
    </>
  );
}

function getPageFromLocation() {
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  if (path.startsWith("blog/")) return `blog:${path.replace("blog/", "")}`;
  if (path.startsWith("project/")) return `project:${path.replace("project/", "")}`;

  const hash = location.hash.replace(/^#/, "");
  if (hash === "admin") return "admin";
  if (hash.startsWith("blog/")) return `blog:${hash.replace("blog/", "")}`;
  if (hash.startsWith("project/")) return `project:${hash.replace("project/", "")}`;
  if (path) return "not-found";
  return "site";
}

function NotFoundPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="site-shell article-shell">
      <section className="article-page">
        <span className="section-label">404</span>
        <h1>Page not found</h1>
        <p className="article-excerpt">This page may have moved or is no longer available.</p>
        <button className="btn primary" onClick={onBack}>Back to portfolio</button>
      </section>
    </main>
  );
}

function updatePageMeta(title: string, description: string, indexable = true) {
  document.title = title;
  let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!descriptionTag) {
    descriptionTag = document.createElement("meta");
    descriptionTag.name = "description";
    document.head.appendChild(descriptionTag);
  }
  descriptionTag.content = description;

  let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robotsTag) {
    robotsTag = document.createElement("meta");
    robotsTag.name = "robots";
    document.head.appendChild(robotsTag);
  }
  robotsTag.content = indexable ? "index, follow, max-image-preview:large" : "noindex, nofollow";

  const canonicalUrl = `https://dhiraj-yadav.in${location.pathname === "/" ? "/" : location.pathname}`;
  let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement("link");
    canonicalTag.rel = "canonical";
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.href = indexable ? canonicalUrl : "https://dhiraj-yadav.in/";

  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:url", canonicalTag.href);
  setMetaName("twitter:title", title);
  setMetaName("twitter:description", description);
}

function updateStructuredData(page: string, portfolio: Portfolio) {
  const scriptId = "homepage-structured-data";
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (page !== "site") {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  const siteUrl = "https://dhiraj-yadav.in/";
  const personId = `${siteUrl}#person`;
  const websiteId = `${siteUrl}#website`;
  const skills = [...new Set([...portfolio.stack, ...portfolio.skills.flatMap((group) => group.items)])];
  const person = {
    "@type": "Person",
    "@id": personId,
    name: portfolio.profile.name,
    alternateName: ["Dhiraj Yadav", "ydhiraj811"],
    url: siteUrl,
    image: `${siteUrl}assets/hero-workspace.jpg`,
    jobTitle: portfolio.profile.role,
    description: portfolio.profile.summary,
    email: portfolio.profile.email ? `mailto:${portfolio.profile.email}` : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: portfolio.profile.location || "New Delhi",
      addressCountry: "IN",
    },
    sameAs: [portfolio.profile.github, portfolio.profile.linkedin, portfolio.profile.leetcode].filter(Boolean),
    knowsAbout: skills,
    hasOccupation: {
      "@type": "Occupation",
      name: portfolio.profile.role,
      skills: skills.join(", "),
    },
  };

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: portfolio.profile.name,
        alternateName: "Dhiraj Yadav",
        publisher: { "@id": personId },
        inLanguage: "en",
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}#profile`,
        url: siteUrl,
        name: `${portfolio.profile.name} - ${portfolio.profile.role} Portfolio`,
        about: { "@id": personId },
        mainEntity: person,
        isPartOf: { "@id": websiteId },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}#projects`,
        name: `${portfolio.profile.name} Projects`,
        itemListElement: portfolio.projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: project.title,
          url: `${siteUrl}project/${contentSlug(project)}`,
        })),
      },
    ],
  });
}

function setMetaProperty(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setMetaName(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function readCachedPortfolio() {
  try {
    const cached = localStorage.getItem(PORTFOLIO_CACHE_KEY);
    return cached ? (JSON.parse(cached) as Portfolio) : null;
  } catch {
    return null;
  }
}

function cachePortfolio(portfolio: Portfolio) {
  try {
    localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(portfolio));
  } catch {
    // Storage can be unavailable in private browsing or constrained devices.
  }
}
