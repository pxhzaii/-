// Cloudflare Pages Function — /api/delete
// Deletes a single message by id from D1
// Returns updated message list

export async function onRequestPost({ request, env }) {
  const DB = env.DB;
  if (!DB) return new Response('D1 not bound', { status: 500 });

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { id } = body;
  if (!id) return new Response('Missing id', { status: 400 });

  await DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();

  const { results } = await DB.prepare(
    'SELECT id, type, content, ts FROM messages ORDER BY ts ASC'
  ).all();

  return new Response(JSON.stringify({ ok: true, messages: results }), {
    headers: { 'Content-Type': 'application/json' }
  });
}