# Docker and VM deployment

## Generated tenant

```bash
TENANT_API_URL=https://tenant.example.com/api/v1 \
TENANT_SITE_URL=https://www.tenant.example.com \
FRONTEND_PORT=3000 \
docker compose up -d --build

curl -fsS http://127.0.0.1:3000/api/health
```

Put TLS and the public hostname in Coolify, Dokploy, or a reverse proxy. The API URL must resolve from inside the frontend container and must be scoped to the same tenant.

## Generator host

Run the onboarding studio on a separate protected host/port with `ENABLE_ONBOARDING_STUDIO=true` and `ONBOARDING_STANDALONE=true`. Install Pi globally, clone this repository, store `RISSETS_API_KEY` outside Git, and run generation/refinement in a per-tenant work directory.

Use `scripts/vm-generate.sh` for a deterministic generated repository and all quality gates. Use `scripts/vm-refine.sh` to load the protected environment and start Pi with the tenant brief. Both commands accept absolute tenant work paths and never copy the router key into generated code.

## Release gates

- `npm run check`
- immutable Docker build and healthy `/api/health`
- every required public API route returns 200 for the intended tenant
- Indonesian and English route checks
- desktop and narrow-viewport visual checks
- zero browser console errors
- chat renders one iframe or WhatsApp renders one link
- human approval before production activation
