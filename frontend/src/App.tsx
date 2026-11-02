import { lazy, Suspense, useEffect, useState } from "react";
import { ApiError, api } from "./api/client";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { ActivityResponse, Portfolio } from "./types/portfolio";
import { defaultContent } from "../../backend/src/utils/defaultContent";

const AdminPage = lazy(() => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const BlogPage = lazy(() => import("./pages/BlogPage").then((module) => ({ default: module.BlogPage })));
const ProjectPage = lazy(() => import("./pages/ProjectPage").then((module) => ({ default: module.ProjectPage })));
const PortfolioChat = lazy(() => import("./components/PortfolioChat").then((module) => ({ default: module.PortfolioChat })));
const PORTFOLIO_CACHE_KEY = "portfolio-content-v1";

export function App() {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => readCachedPortfolio() ?? (defaultContent as Portfolio));
  const [activity, setActivity] = useState<ActivityResponse>();
  const [page, setPage] = useState(getPageFromLocation());
  const [token, setToken] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    api
      .getPortfolio()
      .then((nextPortfolio) => {
        setPortfolio(nextPortfolio);
        cachePortfolio(nextPortfolio);
      })
      .catch(() => undefined);

    const loadActivity = () => {
      api.getActivity().then(setActivity).catch(() => undefined);
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
  }

  if (page === "admin") {
    updatePageMeta("Portfolio Admin | Dhiraj Kumar Yadav", "Protected admin dashboard for portfolio content.", false);
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
    const slug = page.replace("blog:", "");
    const blog = portfolio.blogs.find((item) => getBlogSlug(item) === slug && item.published !== false);

    if (blog) {
      updatePageMeta(blog.metaTitle || blog.title, blog.metaDescription || blog.excerpt);
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
  }

  if (page.startsWith("project:")) {
    const slug = page.replace("project:", "");
    const project = portfolio.projects.find((item) => getProjectSlug(item) === slug);

    if (project) {
      updatePageMeta(project.metaTitle || project.title, project.metaDescription || project.summary);
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
  }

  updatePageMeta(`${portfolio.profile.name} | ${portfolio.profile.role}`, portfolio.profile.summary);
  return (
    <>
      <PortfolioPage portfolio={portfolio} activity={activity} onAdminClick={() => { history.pushState(null, "", "/#admin"); setPage("admin"); }} />
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
  return "site";
}

function getBlogSlug(blog: Portfolio["blogs"][number]) {
  return blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getProjectSlug(project: Portfolio["projects"][number]) {
  return project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
