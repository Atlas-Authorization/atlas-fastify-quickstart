# atlas-fastify-quickstart

A minimal [Fastify](https://fastify.dev) API protected by
[Atlas](https://atlasauth.net) auth.

## What's wired

- **`src/server.ts`** — `atlasPlugin()` from `@atlasauth/fastify` verifies the
  session JWT **locally** against the instance JWKS and decorates
  `request.atlas`.
  - `GET /api/me` reads `getAuth(request)` — public.
  - `GET /api/protected` uses `requireAuth` as a `preHandler` — 401 when signed
    out.

## Run

```sh
npm install
cp .env.example .env     # fill in your Atlas instance values
npm run dev   # tsx watch --env-file=.env src/server.ts
npm run typecheck   # tsc --noEmit  (npm run build -> dist/)
```

```sh
curl http://localhost:3000/api/me          # { isSignedIn: false, ... }
curl http://localhost:3000/api/protected   # 401 UNAUTHENTICATED
# with a session:
curl -H "Authorization: Bearer <jwt>" http://localhost:3000/api/protected
```

## Packages

- `@atlasauth/fastify` — `atlasPlugin`, `getAuth`, `requireAuth`
