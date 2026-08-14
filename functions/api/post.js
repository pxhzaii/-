// Cloudflare Pages Function — /api/post
// Creates a new message (text or image)

export async function onRequestPost({ request, env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const body = await request.json();
  const { type, content } = body;

  if (!type || !content) return new Response('Missing fields', { status: 400 });
  if (type !== 'text' && type !== 'image') return new Response('Invalid type', { status: 400 });

  // Limit image size (after compression ~300KB base64 ≈ 400KB)
  if (type === 'image' && content.length > 500_000) {
    return new Response('Image too large (max ~300KB after compression)', { status: 400 });
  }

  const id = crypto.randomUUID();
  const msg = { id, type, content, ts: Date.now() };

  await KV.put(`msg:${id}`, JSON.stringify(msg), {
    expirationTtl: 7 * 24 * 3600 // Auto-delete after 7 days
  });

  // Cleanup: keep only latest 200 messages
  const list = await KV.list({ prefix: 'msg:' });
  if (list.keys.length > 200) {
    const all = [];
    for (const key of list.keys) {
      const val = await KV.get(key.name, 'json');
      if (val) all.push({ key: key.name, ts: val.ts || 0 });
    }
    all.sort((a, b) => a.ts - b.ts);
    const toDelete = all.slice(0, all.length - 200);
    await Promise.all(toDelete.map(item => KV.delete(item.key)));
  }

  return new Response(JSON.stringify(msg), {
    headers: { 'Content-Type': 'application/json' }
  });
}
