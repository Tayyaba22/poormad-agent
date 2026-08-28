---
name: poormad-market-scan
description: "Competitor + pricing monitor for SaaS products, cited digests."
version: 0.1.0
author: PoorMad
license: MIT
platforms: [linux, macos, windows]
metadata:
  poormad:
    tags: [Market, Competitors, Pricing, SaaS, Monitoring]
    related_skills: [competitor-news-monitor, product-price-monitor, grounded-citations]
---

# PoorMad Market Scan

Track competitors, pricing pages, and product launches for a SaaS niche,
and produce a cited digest you can act on. Pairs with cron for continuous
monitoring (see `poormad swarm schedule` / `cronjob`).

## When to Use

- "What are our competitors doing this week?"
- "Has anyone changed pricing recently?"
- "New entrants in our category?"
- Ongoing: schedule a weekly scan digest.

## Workflow

1. **Define the set** — name 3-8 competitors, their pricing URLs, changelog
   feeds, and social accounts. Store in `~/.poormad/scans/<niche>/targets.json`.
2. **Collect** — fetch each target: pricing pages (web_extract), changelog
   RSS/Atom (blogwatcher), and news (web_search with site: filters).
3. **Extract signals** — price deltas, new tiers, feature launches, hiring
   signals, funding news, positioning shifts.
4. **Cite everything** — every claim carries its source URL. No citation,
   no claim (see grounded-citations).
5. **Digest** — one page: What changed / What it means for us / Suggested
   moves. Deliver as markdown.

## Output Format

```
# <Niche> Market Scan — <date>
## Moves this week
- <competitor>: <change> (source: <url>)
## Pricing watch
- <competitor>: <old> → <new> (source: <url>)
## Suggested moves
- <action> based on <evidence>
```

## Pitfalls

- Pricing pages are often JS-rendered — use browser_extract fallback.
- Cache pages between runs to diff price changes reliably.
- Distinguish real price changes from promo/regional variance.
