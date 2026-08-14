// Cloudflare Pages Function — /api/delete
// Deletes a single message by id from the messages array
// Returns updated message list to bypass KV consistency delay

export async function onRequestPost({ request, env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { id } = body;
  if (!id) return new Response('Missing id', { status: 400 });

  let raw;
  try {
    raw = await KV.get('messages', 'json');
  } catch {
    raw = null;
  }
  const msgs = Array.isArray(raw) ? raw : [];
  const filtered = msgs.filter(m => m.id !== id);

  if (filtered.length !== msgs.length) {
    await KV.put('messages', JSON.stringify(filtered), {
      expirationTtl: 7 * 24 * 3600
    });
  }

  return new Response(JSON.stringify({ ok: true, messages: filtered }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
