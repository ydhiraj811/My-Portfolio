type Sluggable = { title: string; slug?: string };

export function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function contentSlug(item: Sluggable) {
  const provided = item.slug?.trim().toLowerCase() || "";
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(provided) ? provided : slugify(item.title);
}
