# Digi OS tenant frontend template

Production-oriented Next.js App Router boilerplate for one public tenant website. Business facts, translations, navigation, branding, pages, collections, media, forms, locations, SEO, and the active support channel remain owned by the tenant-scoped Django public API. Onboarding and the coding agent control the visual system and React composition.

## What is included

- Tailwind CSS v4 utilities and typography; `app/tenant.css` is intentionally empty.
- Four navigation, hero, section-rhythm, gallery, footer, and chat-launcher compositions.
- Renderers for every CMS block plus blog, portfolio, product, project, career, FAQ, gallery, legal, media, search, contact, locations, map, footer, sitemap, redirects, and detail pages.
- Indonesian and English content/UI selected through `?locale=id|en` and the tenant API.
- Motion component registry inspired by Motion Primitives and a Watermelon-compatible UI adapter registry. The catalogs are onboarding data, so the AI can select and recompose them without changing the content contract.
- A single active support surface: either the live-chat iframe or WhatsApp, never both.
- Deterministic generation, a tenant-specific AI brief, Docker runtime, health route, tests, and a standalone onboarding studio.

## Quick start

```bash
cp .env.example .env.local
npm ci
npm run check
npm run dev
```

`TENANT_API_URL` must point to the public API hostname of exactly one tenant.

## Capture and generate

```bash
npm run tenant:capture -- \
  --api http://acme.localhost:8010/api/v1 \
  --key acme \
  --site-url http://acme.localhost:3100 \
  --output ../onboarding/acme.json

npm run tenant:generate -- \
  --manifest ../onboarding/acme.json \
  --output ../generated/acme
```

The generated repository contains `tenant-onboarding.json` and `TENANT_AGENT_BRIEF.md`. The brief explicitly authorizes the coding agent to change layout, type scale, responsive order, component composition, media treatment, animation, and interaction while prohibiting invented business content.

## Refine with Pi

Install Pi using its official package, export the router key only in the shell or secret manager, then run:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
export RISSETS_API_KEY='set-this-outside-git'
npm run agent:refine -- --model opencode-go/gpt-5.6-luna
```

Provider metadata is stored in `.pi/agent/models.json`; no API key is committed. Other allowed models can be selected with `--model`.

## Standalone onboarding studio

```bash
ENABLE_ONBOARDING_STUDIO=true \
ONBOARDING_STANDALONE=true \
TENANT_API_URL=http://127.0.0.1:9/api/v1 \
TENANT_SITE_URL=http://localhost:3400 \
FRONTEND_PORT=3400 \
docker compose up -d --build
```

Open `http://localhost:3400/onboarding`. This mode does not contact a tenant API and is intended for a protected generator host. Generated public tenant sites leave both onboarding flags disabled.

## Documentation

- [Architecture and API boundary](docs/ARCHITECTURE.md)
- [Onboarding and AI generation](docs/GENERATION.md)
- [Docker and VM deployment](docs/DEPLOYMENT.md)

Primary references: [Next.js CSS and Tailwind](https://nextjs.org/docs/app/getting-started/css), [Motion Primitives](https://motion-primitives.com/), [Watermelon UI](https://ui.watermelon.sh/home), and [Pi documentation](https://pi.dev/docs/latest).
