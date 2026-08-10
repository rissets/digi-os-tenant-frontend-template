# Onboarding and AI generation

## Required manifest decisions

The schema captures identity, business goals, audience, brand personality, typography, motifs, structural experience, page priorities, deployment, governance, and AI model policy. Structural choices cover navigation, hero, section rhythm, gallery, footer, and chat launcher rather than only colors.

Both component catalogs are embedded in onboarding:

- Motion: animated background/group/number, border trail, carousel, cursor, dock, glow, in-view, magnetic, marquee, morphing dialog/popover, progressive blur, scroll progress, sliding number, spotlight, text effects/morph/roll/scramble, tilt, toolbar, and transition panel.
- UI adapters: accordion, alert/dialog/dropdown, avatar/badge/button/card, bento, breadcrumbs, calendar/carousel/chart, checkbox/combobox/command, context menu, data table/date picker/drawer, form/hover card/input/label, menubar/navigation/pagination/popover/progress, radio/resizable/scroll/select/separator/sheet/sidebar/skeleton/slider/sonner/switch/table/tabs/textarea/toggle/tooltip.

These are provider registries and reusable adapters, not copied third-party source code.

## Commands

```bash
npm run tenant:capture -- --api <tenant-api> --key <key> --site-url <url> --output onboarding.json
npm run tenant:generate -- --manifest onboarding.json --output ../generated/<key>
cd ../generated/<key>
npm ci
npm run check
npm run agent:refine -- --model opencode-go/gpt-5.6-luna
```

The agent may replace components and restructure every page. It must preserve all API contracts, both locales, accessibility, tenant isolation, form security, active-channel exclusivity, and quality gates.

## Model policy

The checked-in provider file references `$RISSETS_API_KEY`. Keep the real key in a secret manager or mode-600 environment file. The command validates the selected model against the onboarding allow-list before Pi starts.
