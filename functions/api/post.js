// Cloudflare Pages Function — /api/post
// Creates a new message (text or image)
// All messages stored in a single KV key for fast read/write

const MAX_MSGS = 200;

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

  // Read current messages, append, trim
  const raw = await KV.get('messages', 'json');
  const msgs = Array.isArray(raw) ? raw : [];
  msgs.push(msg);
  // Keep only latest MAX_MSGS
  if (msgs.length > MAX_MSGS) {
    msgs.splice(0, msgs.length - MAX_MSGS);
  }

  await KV.put('messages', JSON.stringify(msgs), {
    expirationTtl: 7 * 24 * 3600
  });

  return new Response(JSON.stringify(msg), {
    headers: { 'Content-Type': 'application/json' }
  });
}
