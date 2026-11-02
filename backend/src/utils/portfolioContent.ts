import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

function isSafeUrl(value: string, allowAssetPath = false) {
  if (!value) return true;
  if (allowAssetPath && value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function isHttpUrl(value: string) {
  if (!value) return true;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function safeExternalUrl(value: unknown) {
  return typeof value === "string" && isHttpUrl(value.trim()) ? value.trim() : "";
}

export function safeAssetUrl(value: unknown) {
  return typeof value === "string" && isSafeUrl(value.trim(), true) ? value.trim() : "";
}

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120),
  location: z.string().trim().max(160),
  phone: z.string().trim().max(80),
  email: z.string().trim().max(254).refine((value) => !value || z.string().email().safeParse(value).success, "Email must be valid"),
  headline: z.string().trim().max(500),
  summary: z.string().trim().max(5000),
  about: z.string().trim().max(15000),
  resumeUrl: z.string().trim().max(2048).refine((value) => isSafeUrl(value, true), "Resume URL must be a relative asset path or HTTP(S) URL"),
  github: z.string().trim().max(2048).refine(isHttpUrl, "GitHub URL must use HTTP(S)"),
  linkedin: z.string().trim().max(2048).refine(isHttpUrl, "LinkedIn URL must use HTTP(S)"),
  leetcode: z.string().trim().max(2048).refine(isHttpUrl, "LeetCode URL must use HTTP(S)"),
});

const projectSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: optionalText(160),
  year: z.string().trim().max(80).optional().default(""),
  summary: z.string().trim().min(1).max(5000),
  body: optionalText(30000),
  imageUrl: z.string().trim().max(2048).optional().default("").refine((value) => isSafeUrl(value, true), "Image URL must be a relative asset path or HTTP(S) URL"),
  stack: z.array(z.string().trim().min(1).max(80)).max(80).default([]),
  highlights: z.array(z.string().trim().min(1).max(500)).max(80).default([]),
  links: z.array(z.object({
    label: z.string().trim().min(1).max(80),
    url: z.string().trim().min(1).max(2048).refine((value) => isSafeUrl(value), "Project links must use HTTP(S)"),
  })).max(30).default([]),
  metaTitle: optionalText(200),
  metaDescription: optionalText(500),
});

const blogSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: z.string().trim().max(100).optional().default(""),
  excerpt: z.string().trim().min(1).max(3000),
  slug: optionalText(160),
  body: optionalText(40000),
  coverImage: z.string().trim().max(2048).optional().default("").refine((value) => isSafeUrl(value, true), "Cover image must be a relative asset path or HTTP(S) URL"),
  metaTitle: optionalText(200),
  metaDescription: optionalText(500),
  published: z.boolean().optional(),
});

export type ProjectContent = z.infer<typeof projectSchema>;
export type BlogContent = z.infer<typeof blogSchema>;

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

export function slugify(value = "") {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function contentSlug(item: { title?: string | null; slug?: string | null }) {
  const provided = typeof item.slug === "string" ? item.slug.trim().toLowerCase() : "";
  if (slugPattern.test(provided)) return provided;
  return slugify(item.title || "");
}

function parseOne<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
): z.infer<S> & { title: string; slug: string } {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new ContentValidationError(parsed.error.issues[0]?.message || "Invalid content.");

  const normalized = { ...parsed.data, slug: contentSlug(parsed.data) } as z.infer<S> & { title: string; slug: string };
  if (!slugPattern.test(normalized.slug)) {
    throw new ContentValidationError("Title must contain at least one English letter or number to create a URL slug.");
  }
  return normalized;
}

function parseList<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
  label: string,
): Array<z.infer<S> & { title: string; slug: string }> {
  if (!Array.isArray(value) || value.length > 100) {
    throw new ContentValidationError(`${label} must be an array with no more than 100 items.`);
  }

  const items = value.map((item) => parseOne(schema, item));
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) throw new ContentValidationError(`${label} must have unique URL slugs.`);
    seen.add(item.slug);
  }
  return items;
}

export function parseProject(value: unknown) {
  return parseOne(projectSchema, value);
}

export function parseProfile(value: unknown) {
  const parsed = profileSchema.safeParse(value);
  if (!parsed.success) throw new ContentValidationError(parsed.error.issues[0]?.message || "Invalid profile content.");
  return parsed.data;
}

export function parseProjects(value: unknown) {
  return parseList(projectSchema, value, "Projects");
}

export function parseBlog(value: unknown, missingPublishedDefault = false) {
  const blog = parseOne(blogSchema, value);
  return { ...blog, published: blog.published ?? missingPublishedDefault };
}

export function parseBlogs(value: unknown) {
  return parseList(blogSchema, value, "Blogs")
    .map((blog) => ({ ...blog, published: blog.published ?? true }));
}

export function withCanonicalSlug<T extends { title?: string | null; slug?: string | null }>(item: T) {
  const slug = contentSlug(item);
  return slug ? { ...item, slug } : item;
}

export function sanitizePublicProject<T extends Record<string, any>>(item: T) {
  const links = Array.isArray(item.links) ? item.links
    .filter((link: any) => link && typeof link.label === "string" && safeExternalUrl(link.url))
    .map((link: any) => ({ ...link, url: safeExternalUrl(link.url) })) : [];
  return { ...withCanonicalSlug(item), imageUrl: safeAssetUrl(item.imageUrl), links };
}

export function sanitizePublicBlog<T extends Record<string, any>>(item: T) {
  return { ...withCanonicalSlug(item), coverImage: safeAssetUrl(item.coverImage) };
}

export function sanitizePublicProfile<T extends Record<string, any>>(profile: T) {
  return {
    ...profile,
    resumeUrl: safeAssetUrl(profile.resumeUrl),
    github: safeExternalUrl(profile.github),
    linkedin: safeExternalUrl(profile.linkedin),
    leetcode: safeExternalUrl(profile.leetcode),
  };
}
