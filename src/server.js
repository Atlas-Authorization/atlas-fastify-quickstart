// Atlas + Fastify quickstart.
//
// `atlasPlugin(options)` returns a Fastify plugin that verifies the session JWT
// LOCALLY (JWKS cached in-process) and decorates `request.atlas`. Read it with
// `getAuth(request)`; gate a route with `requireAuth(request, reply)` as a
// preHandler. No Atlas endpoint is called per request.
import Fastify from 'fastify';
import { atlasPlugin, getAuth, requireAuth } from '@atlasauth/fastify';

const { ATLAS_JWKS_URL, ATLAS_ISSUER, ATLAS_PUBLISHABLE_KEY, PORT = '3000' } = process.env;

if (!ATLAS_JWKS_URL || !ATLAS_ISSUER) {
  console.error('Missing ATLAS_JWKS_URL / ATLAS_ISSUER — copy .env.example and fill them in.');
  process.exit(1);
}

const app = Fastify({ logger: true });

await app.register(
  atlasPlugin({
    jwksUrl: ATLAS_JWKS_URL,
    issuer: ATLAS_ISSUER,
    publishableKey: ATLAS_PUBLISHABLE_KEY,
  }),
);

// Public — reports who you are, if anyone.
app.get('/api/me', (request) => {
  const { userId, sessionId, orgId, orgRole, isSignedIn } = getAuth(request);
  return { isSignedIn, userId, sessionId, orgId, orgRole };
});

// Protected — `requireAuth` sends 401 and short-circuits for a signed-out caller.
app.get('/api/protected', { preHandler: requireAuth }, (request) => {
  const { userId, has } = getAuth(request);
  return { message: `Hello, ${userId}.`, isAdmin: has({ role: 'admin' }) };
});

await app.listen({ port: Number(PORT) });
