// Cloudflare Pages Function — /api/delete
// Deletes a single message by id from the messages array

export async function onRequestGet({ request, env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  const raw = await KV.get('messages', 'json');
  const msgs = Array.isArray(raw) ? raw : [];
  const filtered = msgs.filter(m => m.id !== id);

  if (filtered.length !== msgs.length) {
    await KV.put('messages', JSON.stringify(filtered), {
      expirationTtl: 7 * 24 * 3600
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
