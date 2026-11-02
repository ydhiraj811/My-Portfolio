import assert from "node:assert/strict";
import test from "node:test";
import {
  ContentValidationError,
  parseBlog,
  parseBlogs,
  parseProject,
  parseProfile,
  sanitizePublicProject,
} from "../dist/utils/portfolioContent.js";

test("new blogs default to unpublished and invalid custom slugs use the title", () => {
  const blog = parseBlog({
    title: "A Better API",
    slug: "https://example.com",
    excerpt: "A concise description.",
  });

  assert.equal(blog.slug, "a-better-api");
  assert.equal(blog.published, false);
});

test("profile links reject script URLs", () => {
  assert.throws(() => parseProfile({
    name: "Dhiraj",
    role: "Engineer",
    location: "New Delhi",
    phone: "",
    email: "contact@example.com",
    headline: "",
    summary: "",
    about: "",
    resumeUrl: "/assets/resume.pdf",
    github: "javascript:alert(1)",
    linkedin: "https://linkedin.com/in/example",
    leetcode: "https://leetcode.com/u/example/",
  }), ContentValidationError);
});

test("blog writes preserve an explicit published flag", () => {
  const [blog] = parseBlogs([{
    title: "Published note",
    excerpt: "A concise description.",
    published: true,
  }]);

  assert.equal(blog.published, true);
});

test("bulk blog updates preserve legacy posts as published while new blogs default to drafts", () => {
  const [legacyBlog] = parseBlogs([{
    title: "Legacy post",
    excerpt: "A post created before the publish flag existed.",
  }]);

  assert.equal(legacyBlog.published, true);
  assert.equal(parseBlog({
    title: "New post",
    excerpt: "A newly created post.",
  }).published, false);
});

test("content arrays reject duplicate slugs", () => {
  assert.throws(() => parseBlogs([
    { title: "Same title", excerpt: "First excerpt" },
    { title: "Same title", excerpt: "Second excerpt" },
  ]), ContentValidationError);
});

test("project content rejects unsafe image and link protocols", () => {
  assert.throws(() => parseProject({
    title: "Unsafe project",
    summary: "Project summary",
    imageUrl: "javascript:alert(1)",
  }), ContentValidationError);

  assert.throws(() => parseProject({
    title: "Unsafe project",
    summary: "Project summary",
    links: [{ label: "Open", url: "javascript:alert(1)" }],
  }), ContentValidationError);
});

test("public project projection removes unsafe legacy URLs and repairs its slug", () => {
  const project = sanitizePublicProject({
    title: "Portfolio project",
    slug: "https://example.com",
    imageUrl: "javascript:alert(1)",
    links: [{ label: "Unsafe", url: "javascript:alert(1)" }],
  });

  assert.equal(project.slug, "portfolio-project");
  assert.equal(project.imageUrl, "");
  assert.deepEqual(project.links, []);
});
