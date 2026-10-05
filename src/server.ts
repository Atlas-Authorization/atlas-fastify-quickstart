// Atlas + Fastify quickstart.
//
// `atlasPlugin(options)` returns a Fastify plugin that verifies the session JWT
// LOCALLY (JWKS cached in-process) and decorates `request.atlas`. Read it with
// `getAuth(request)`; gate a route with `requireAuth(request, reply)` as a
// preHandler. No Atlas endpoint is called per request.
import Fastify, { type FastifyPluginCallback, type FastifyReply, type FastifyRequest } from 'fastify';
import {
  atlasPlugin,
  getAuth as getAtlasAuth,
  requireAuth as requireAtlasAuth,
  type AtlasAuth,
  type AtlasFastifyReply,
  type AtlasFastifyRequest,
} from '@atlasauth/fastify';

// @atlasauth/fastify types Fastify structurally (it doesn't import `fastify`),
// and those minimal shapes don't line up with Fastify's real generics. These
// three thin adapters are the only casts; they are runtime no-ops.
const getAuth = (request: FastifyRequest): AtlasAuth =>
  getAtlasAuth(request as unknown as AtlasFastifyRequest);
const requireAuth = (request: FastifyRequest, reply: FastifyReply): void => {
  requireAtlasAuth(request as unknown as AtlasFastifyRequest, reply as unknown as AtlasFastifyReply);
};
const atlas = (options: Parameters<typeof atlasPlugin>[0]): FastifyPluginCallback =>
  atlasPlugin(options) as unknown as FastifyPluginCallback;

const { ATLAS_JWKS_URL, ATLAS_ISSUER, ATLAS_PUBLISHABLE_KEY, PORT = '3000' } = process.env;

if (!ATLAS_JWKS_URL || !ATLAS_ISSUER) {
  console.error('Missing ATLAS_JWKS_URL / ATLAS_ISSUER — copy .env.example and fill them in.');
  process.exit(1);
}

const app = Fastify({ logger: true });

await app.register(
  atlas({
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
