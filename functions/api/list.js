// Cloudflare Pages Function — /api/list
// Returns all messages from single KV key

export async function onRequestGet({ env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const msgs = await KV.get('messages', 'json') || [];
  return new Response(JSON.stringify(msgs), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'CDN-Cache-Control': 'no-store',
      'Cloudflare-CDN-Cache-Control': 'no-store',
    }
  });
}
