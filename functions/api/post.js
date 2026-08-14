// Cloudflare Pages Function — /api/post
// Creates a new message (text or image)
// All messages stored in a single KV key for fast read/write
// Returns the full message list after write (avoids KV eventual consistency delay)

const MAX_MSGS = 200;
const MAX_TEXT = 10000;
const MAX_IMAGE = 500_000;

export async function onRequestPost({ request, env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { type, content } = body;
  if (!type || !content) return new Response('Missing fields', { status: 400 });
  if (type !== 'text' && type !== 'image') return new Response('Invalid type', { status: 400 });
  if (type === 'text' && content.length > MAX_TEXT) {
    return new Response('Text too long', { status: 400 });
  }
  if (type === 'image' && content.length > MAX_IMAGE) {
    return new Response('Image too large', { status: 400 });
  }

  const id = crypto.randomUUID();
  const msg = { id, type, content, ts: Date.now() };

  // Read-append-trim
  let raw;
  try {
    raw = await KV.get('messages', 'json');
  } catch {
    raw = null;
  }
  const msgs = Array.isArray(raw) ? raw : [];
  msgs.push(msg);
  if (msgs.length > MAX_MSGS) {
    msgs.splice(0, msgs.length - MAX_MSGS);
  }
  try {
    await KV.put('messages', JSON.stringify(msgs), { expirationTtl: 7 * 24 * 3600 });
  } catch {
    return new Response('KV write failed', { status: 500 });
  }

  // Return full message list so client can update immediately
  // without waiting for KV eventual consistency on the next poll
  return new Response(JSON.stringify({ msg, messages: msgs }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
