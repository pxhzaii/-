// Cloudflare Pages Function — /api/post
// Creates a new message (text or image)
// All messages stored in a single KV key for fast read/write

const MAX_MSGS = 200;
const MAX_TEXT = 10000; // 10KB text limit
const MAX_IMAGE = 500_000; // ~300KB base64

export async function onRequestPost({ request, env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const body = await request.json();
  const { type, content } = body;

  if (!type || !content) return new Response('Missing fields', { status: 400 });
  if (type !== 'text' && type !== 'image') return new Response('Invalid type', { status: 400 });

  // Size limits
  if (type === 'text' && content.length > MAX_TEXT) {
    return new Response('Text too long (max 10000 chars)', { status: 400 });
  }
  if (type === 'image' && content.length > MAX_IMAGE) {
    return new Response('Image too large (max ~300KB after compression)', { status: 400 });
  }

  const id = crypto.randomUUID();
  const msg = { id, type, content, ts: Date.now() };

  // Read current messages, append, trim — retry on race condition
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await KV.get('messages', 'json');
    const msgs = Array.isArray(raw) ? raw : [];
    msgs.push(msg);
    if (msgs.length > MAX_MSGS) {
      msgs.splice(0, msgs.length - MAX_MSGS);
    }
    const json = JSON.stringify(msgs);
    // Check total size under KV 25MB limit
    if (json.length > 24_000_000) {
      // Too large, trim more aggressively
      msgs.splice(0, 50);
    }
    try {
      // KV.put is last-write-wins; retry loop reduces collision risk
      await KV.put('messages', json.length > 24_000_000 ? JSON.stringify(msgs) : json, {
        expirationTtl: 7 * 24 * 3600
      });
      break;
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }

  return new Response(JSON.stringify(msg), {
    headers: { 'Content-Type': 'application/json' }
  });
}
