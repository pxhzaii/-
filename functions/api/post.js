// Cloudflare Pages Function — /api/post
// Creates a new message (text or image) in D1
// Returns the full message list after write

const MAX_TEXT = 10000;
const MAX_IMAGE = 500_000;

export async function onRequestPost({ request, env }) {
  const DB = env.DB;
  if (!DB) return new Response('D1 not bound', { status: 500 });

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
  const ts = Date.now();

  await DB.prepare(
    'INSERT INTO messages (id, type, content, ts) VALUES (?, ?, ?, ?)'
  ).bind(id, type, content, ts).run();

  // Auto-cleanup: keep only latest 200 messages
  await DB.prepare(
    'DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY ts DESC LIMIT 200)'
  ).run();

  // Return full message list
  const { results } = await DB.prepare(
    'SELECT id, type, content, ts FROM messages ORDER BY ts ASC'
  ).all();

  const msg = { id, type, content, ts };
  return new Response(JSON.stringify({ msg, messages: results }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
