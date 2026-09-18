# LoveToLive.com — Phase-wise Build Prompts

**Concept:** *"Find where you'll love to live — then live well there."*
A global platform for choosing a place to live, planning the move, and living well once you're there.
It is monetized through four streams stacked on the same traffic:

| Stream | Where it lives on the site | Why it pays |
|---|---|---|
| **Lead generation**: moving, real estate, mortgage, insurance, international relocation, corporate | `get-quotes.html`, calculator results, city pages, quiz results, sticky CTA | Relocation leads are among the highest-value leads online, typically about $20–$300+ each. |
| **Google AdSense** | Header, in-content, sidebar, footer and multiplex slots on every template | Mortgage, insurance and moving are top-CPC topics. |
| **YouTube**: "Moving to…", "Real Monthly Budgets" and "Neighbourhood Walks" | `videos.html`, a video block on every city page | An evergreen, high-search format that also earns sponsor integrations. |
| **Sponsorship, donations and memberships** | `support.html`, `advertise.html`, `contest.html` | Diversified revenue that funds operations, marketing, hiring and prizes. |

Every prompt below is written so you can paste it straight into an AI coding agent. Run the phases in order.

---

## Phase 0 — Strategy & research
> You are a senior growth strategist. For the domain **LoveToLive.com**, define a site that helps people *find where they'll love to live and live well there*. Audit 25+ leading sites in this space (Niche, AreaVibes, Livability, BestPlaces, Numbeo, Nomads.com, moveBuddha, Movers.com, Unpakt, NeighborhoodScout, Expatistan, NerdWallet, Bankrate and SmartAsset COL calculators, International Living, Money.com Best Places, Apartment List, Movoto, Redfin, Zillow, Trulia, Walk Score, HomeLight, Policygenius, Blue Zones, Monocle, Kiplinger). For each site, record its value proposition, tools, lead-capture mechanics and monetization. Produce a deduplicated master feature list in six groups: tools, content templates, lead-gen patterns, engagement, monetization placements, and UX/SEO. Output `docs/RESEARCH.md`.

## Phase 1 — Brand, design system & architecture
> Create a zero-dependency static site that GitHub Pages' free plan can host. Use:
> - **Brand:** "LoveToLive" wordmark, a heart-and-home SVG logo, a coral→orange→gold "love" gradient and a teal "live" accent. Fonts are Fraunces for display and Inter for body.
> - **Design tokens:** CSS custom properties with light and dark themes (respect `prefers-color-scheme` plus a manual toggle), 16px mobile gutters, and no horizontal scroll at 390px.
> - **Architecture:** a GitHub-Pages-native Jekyll site with no Actions, no npm and no runtime frameworks. `_layouts/default.html` holds the shared chrome, `_layouts/city.html` and `_layouts/guide.html` are page templates, `_includes/` holds reusable blocks, and `_data/cities.json` holds the data. Every link is relative (with `page.root`) so the site works under `/<repo>/` and on a custom domain.
> - **Single config file:** `assets/js/config.js` holds AdSense IDs, form endpoints, donation links, YouTube IDs, social links and partner affiliate URLs. Every feature degrades gracefully while its value is empty.

## Phase 2 — Data model & scoring
> Build `_data/cities.json` with 45+ cities worldwide. Fields: region, coordinates, population, cost index (New York = 100), 1-bed rent, net salary, internet Mbps, climate, and 0–100 scores for safety, healthcare, nature, culture, nightlife, family, jobs, walkability, air and English.
> - Derive **affordability** as 50% absolute cost and 50% local purchasing power.
> - Derive **internet** from log-scaled Mbps.
> - Compute a **LiveScore** from published weights, with A+–D grades.
> - Expose `data/cities.json` via Liquid `jsonify` for client tools.
> - Label all figures as indicative, and document how to replace them with licensed data (Numbeo API, national statistics, OECD, WHO) in `docs/DATA.md`.

## Phase 3 — Core pages & SEO templates
> Generate:
> - **Home:** hero with city autosuggest search, persona chips, top-5 card, 4-pillar value prop, top rankings, curated "best for…" collections, tools grid, inline lead-gen selector, video row, guides, contest and donation bands, FAQ, newsletter.
> - **Rankings (`places.html`):** search, region and tag filters, 11 sort keys, card/table toggle, URL-synced state.
> - **One page per city (`places/<slug>.html`):** hero, report card with animated bars, pros and cons, "best for", cost-of-living table, video, lead module, similar cities with compare links, FAQ, and a sticky sidebar with quote CTA, ad and quiz CTA.
> - **Guides index plus 9 long-form guides:** auto table of contents, bylines, in-content ad, related posts. The 90-day relocation checklist doubles as the lead magnet and is interactive and printable.
>
> Add canonical, Open Graph and Twitter tags, JSON-LD (Organization, WebSite+SearchAction, ItemList, City, FAQPage, Article, BreadcrumbList, JobPosting, Event, WebApplication), a Liquid `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, a depth-safe `404.html` (with `<base>`), and breadcrumbs everywhere.

## Phase 4 — Interactive tools
> Build vanilla-JS tools:
> 1. **City Match quiz:** 7 steps covering budget, climate, regions, 10 weighted priorities, household, city size and timeline. It returns a top 5 with match %, then an email capture for a "personalised relocation plan" routed as a lead. Include share and compare CTAs.
> 2. **Cost-of-living calculator:** salary equivalence from rent and cost indices, adjusted for household size.
> 3. **Moving cost estimator:** haversine distance between cities, local/long-distance/international models, full-service/container/DIY, peak season, packing, car and storage extras. Shows a range and a CTA to binding quotes.
> 4. **Mortgage and affordability:** P&I, tax, insurance, PMI, a 28/36 ratio flag and the maximum affordable price.
> 5. **Live-Well score:** 8 life pillars on sliders, with tips for the two weakest.
> 6. **City vs City compare:** 13 mirrored bars, cost delta, income equivalence, verdict, shareable URL.

## Phase 5 — Lead-generation engine (the profit centre)
> Build `get-quotes.html` as a 4-step form with a progress bar:
> 1. **Service:** movers, agent, mortgage, international, rentals, insurance, consult, corporate.
> 2. **Route and date.**
> 3. **Dynamic fields for the chosen service:** home size, services, vehicle, buy/sell, budget, pre-approval, credit band, first-time buyer, insurance type, employee volume.
> 4. **Contact:** name, email, optional phone, contact preference, explicit TCPA-style consent, newsletter opt-in.
>
> Requirements:
> - Prefill from URL parameters so every CTA site-wide (city pages, calculators, quiz, home selector, sticky bar) deep-links into the form.
> - Capture UTM, gclid, landing page and referrer. Add a honeypot.
> - POST to a configurable endpoint (Formspree, Web3Forms, Getform or a Google Apps Script → Sheets). Store locally if no endpoint is set.
> - The thank-you screen shows next steps plus an optional partner affiliate offer.
> - Show trust signals: vetted and licensed partners, privacy, free, speed.
> - Add a B2B "join our partner network" path on `advertise.html` so lead buyers can sign up.
> - Add an exit-intent and scroll-depth lead-magnet modal and a dismissible sticky mobile CTA.

## Phase 6 — Monetization layer
> - **AdSense:** Consent Mode v2 defaults (denied), then a cookie banner with "Accept all" or "Essential only" (the latter requests non-personalised ads). Slots are injected only when a slot ID exists; empty slots show "Advertise here" house ads linking to the media kit. Optional Auto ads. Ship `ads.txt`.
> - **YouTube:** privacy-enhanced lite embeds (thumbnail → iframe on click) from config IDs, falling back to "Watch on YouTube" search cards. Subscribe links read the channel ID.
> - **Affiliates:** partner URLs in config, `rel="sponsored"`, and a disclosure page.
> - **GA4 (optional):** events for `generate_lead`, `lead_step`, `quiz_complete`, `video_play` and `donate_click`.

## Phase 7 — Community: donations, contests, hiring, promotion
> - **`support.html`:** monthly/one-time toggle, amount chips with an impact line, a custom amount, and checkout routing to Stripe Payment Links, PayPal, Ko-fi, Buy Me a Coffee, GitHub Sponsors or Patreon (buttons auto-hide when unset). Also a goal meter, a fund-allocation breakdown (operations, creators/hiring, marketing, prizes, data), three membership tiers, other ways to help and a FAQ.
> - **`contest.html`:** Love Where You Live Awards with a live countdown, 4 categories, prize tiers, entry form (URL-based uploads), skill-based official rules summary, key dates, sponsor CTA and Event schema.
> - **`careers.html`:** 6 remote roles with JobPosting schema and an application form that preselects the role.
> - **`advertise.html`:** media kit, 6 partnership packages and an inquiry form that preselects the package.
> - **`videos.html`:** series, featured videos, subscribe, sponsor-a-video.

## Phase 8 — Legal, trust & accessibility
> Write About, Methodology (weights and data status), Affiliate Disclosure, Privacy (GDPR, CCPA, PIPEDA, Québec Law 25, cookie reset), Terms and Contact (topic prefill via URL). Meet WCAG 2.2 AA: skip link, focus rings, labelled inputs, ARIA live regions, reduced-motion support, keyboard-navigable autosuggest.

## Phase 9 — QA, deploy & launch
> 1. Render the Jekyll site locally (or with a Liquid emulator).
> 2. Crawl every internal link with Playwright, fail on 4xx or JS errors, test each tool and form, and check 390px for horizontal overflow.
> 3. Push to `github.com/WEBWORKSA1/love-to-live` and enable GitHub Pages (main branch, root folder).
> 4. Point LoveToLive.com at Pages (custom domain in Settings → Pages), set `site_url` in `_config.yml`, submit the sitemap to Google Search Console, and apply for AdSense.

## Phase 10 — Growth roadmap (expandable)
- **Programmatic SEO:** "X vs Y" static pages for the top 200 pairs, "Best places to live in <country>", "Moving from A to B" route pages, neighbourhood pages.
- **Data:** a monthly rent/cost report with CSV download for backlinks, embeddable city-score widgets for publishers.
- **Community:** resident reviews and polls, crowdsourced prices, a member map ("X people moving to Lisbon").
- **Revenue:** premium city reports (PDF), paid membership, sponsored city profiles for tourism boards, lead exclusivity by territory, a relocation-concierge service.
- **i18n:** Spanish, Portuguese, French and Hindi editions, plus a currency switcher.
