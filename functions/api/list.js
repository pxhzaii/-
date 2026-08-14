// Cloudflare Pages Function — /api/list
// Returns all messages from single KV key
// Using POST to avoid Cloudflare CDN caching (GET responses are cached ~30s)

export async function onRequestPost({ env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const msgs = await KV.get('messages', 'json') || [];
  return new Response(JSON.stringify(msgs), {
    headers: { 'Content-Type': 'application/json' }
  });
}
