# Search Appearance and Indexing

The homepage publishes a concise title, a preferred site name in `WebSite` JSON-LD and Open Graph metadata, Person structured data, canonical URLs, a crawlable sitemap, and PNG favicons. These signals help search engines identify the site; they do not guarantee a particular result title, favicon, or ranking.

## After Deployment

1. Add `dhiraj-yadav.in` as a Domain property in [Google Search Console](https://search.google.com/search-console/) and verify ownership using the DNS TXT record it provides.
2. Submit `https://dhiraj-yadav.in/sitemap.xml` in Search Console's Sitemaps report.
3. Use URL Inspection on `https://dhiraj-yadav.in/`, run the live test, and request indexing after the deployment is live.
4. Confirm the public homepage and favicon URLs load without authentication, and that the canonical URL uses HTTPS on the preferred domain.
5. Keep your public name and website link consistent on LinkedIn, GitHub, LeetCode, and other profiles you control. Publish original, useful engineering articles and link them naturally to relevant projects.

Google chooses site names, title links, favicons, and rankings automatically. Search Console requests do not guarantee inclusion or ranking, and changes can take days or weeks to appear. Queries such as `Dhiraj` are especially competitive and ambiguous; a first-place result cannot be promised. For guidance, see Google's [site-name documentation](https://developers.google.com/search/docs/appearance/site-names), [favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search), [title-link guidance](https://developers.google.com/search/docs/appearance/title-link), and [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
