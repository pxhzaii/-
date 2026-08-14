// Cloudflare Pages Function — /api/list
// Returns all messages from D1 (strongly consistent, no KV eventual delay)

export async function onRequestPost({ env }) {
  const DB = env.DB;
  if (!DB) return new Response('D1 not bound', { status: 500 });

  const { results } = await DB.prepare(
    'SELECT id, type, content, ts FROM messages ORDER BY ts ASC LIMIT 200'
  ).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}