# ToolNova AI

A complete, production-ready tool site: 31 real browser-based and server-backed
tools for images, PDFs, text, files, AI and developers, built with Next.js 15,
TypeScript and Tailwind CSS.

Every control on every page is wired to real behaviour. There are no demo
buttons, no `alert("Coming soon")` placeholders and no invented results: when a
service is not configured the tool says so plainly.

## Highlights

- **31 tools**, each on its own SEO-optimised page (`/tools/image-compressor`,
  `/tools/word-counter`, `/tools/ai-text-generator`, …) with breadcrumbs,
  structured data, FAQ copy, “How to use”, related tools and internal links.
- **Local processing.** Images, PDFs, ZIPs, hashes, Base64, QR codes and all
  text/developer tools run in the browser — files never leave the device.
- **Honest AI.** `/api/ai` proxies a provider that is keyed by `AI_API_KEY` on
  the server only. Without a key every AI tool reports
  *“AI service is not configured yet.”* instead of faking output.
- **Honest contact form.** `/api/contact` validates server-side and reports
  *“Contact service is not configured.”* until `RESEND_API_KEY` (or a webhook)
  is set.
- **Design.** Black/white base with a red → purple gradient accent,
  glassmorphism cards, dark/light theme that is remembered, mobile bottom nav
  and a large-touch-target layout.
- **Monetisation ready.** Five labelled “Advertisement” slots and an
  `<AdManager />` insertion point — no fake ads, nothing overlaying a control.
- **SEO.** Per-page metadata, canonical URLs, Open Graph, `sitemap.xml`,
  `robots.txt`, blog with six articles on a reusable template.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

`predev`/`prebuild` copy the pdf.js worker and its font/cmap assets into
`public/`, so no CDN is involved.

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm test           # 100 tests: unit, pipeline, DOM and HTTP
```

## Environment variables

Copy `.env.example` to `.env.local`. Nothing secret is ever read in the browser.

| Variable | Where it is used | Required |
| --- | --- | --- |
| `AI_API_KEY` | `/api/ai` (server only) | for AI tools |
| `AI_API_BASE_URL` | any OpenAI-compatible endpoint (OpenAI, Groq, OpenRouter, Ollama, …) | no |
| `AI_API_MODEL` | model id passed to that endpoint | no |
| `AI_API_PROVIDER` | free-text label reported in server responses | no |
| `RESEND_API_KEY` | `/api/contact` (server only) | for email delivery |
| `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | `/api/contact` | with Resend |
| `CONTACT_WEBHOOK_URL` | `/api/contact` (alternative to email) | no |
| `DATABASE_URL` | reserved for the future admin layer | no |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap, OG tags | recommended |
| `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT` | ad slots | no |

Only `NEXT_PUBLIC_*` values reach the browser; `lib/server/*` is imported
exclusively by route handlers.

## Project structure

```
app/          routes, layouts, API handlers, sitemap & robots
components/   layout, ui, tools, forms, search, seo, content
lib/          site config, catalog, and the actual processing code
public/       static assets (pdf.js runtime is copied here on install)
tests/        unit, DOM, HTTP and source-hygiene tests
```

## Tests

`npm test` runs four layers:

- `tests/{text,image,pdf,hash}.test.mjs` — the real processing pipelines
  (canvas via `@napi-rs/canvas`, pdf.js, crypto) against known values.
- `tests/catalog.test.mjs` — the tool registry, blog and internal links stay
  consistent.
- `tests/routes.test.mjs` — HTTP checks against a running dev server: page
  metadata, SEO markup, sitemap, robots, 404s and the API contracts.
- `tests/dom*.test.mjs` — the real React components mounted in a DOM: uploads,
  processing, results, downloads, resets, theme switching, search, navigation,
  the mobile menu and form validation.
- `tests/audit.test.mjs` — no placeholder code, no hard-coded secrets, no
  server-only env reads in client code, every button has a handler.

The route tests talk to `http://localhost:3000` and skip themselves when no
server is running, so `npm test` works either way.

## Admin-ready architecture

Tool metadata lives in `lib/tools.ts`, categories in `lib/categories.ts`, blog
posts in `lib/blog.ts` and the site shell in `lib/site.ts`. Adding a tool means
adding one registry entry plus one component in `components/tools/impl/` and
registering it in `ToolRunner` — navigation, search, sitemap, breadcrumbs and
related-tool links all follow automatically. The same registries are the wiring
points for future tool/blog/account/statistics/API management screens.
