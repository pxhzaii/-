// Cloudflare Pages Function — /api/clear
// Deletes all messages from D1, returns empty list

export async function onRequestPost({ env }) {
  const DB = env.DB;
  if (!DB) return new Response('D1 not bound', { status: 500 });

  await DB.prepare('DELETE FROM messages').run();

  return new Response(JSON.stringify({ ok: true, messages: [] }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
