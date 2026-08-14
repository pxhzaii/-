// Cloudflare Pages Function — /api/clear
// Deletes all messages

export async function onRequestPost({ env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const list = await KV.list({ prefix: 'msg:' });
  await Promise.all(list.keys.map(key => KV.delete(key.name)));

  return new Response(JSON.stringify({ ok: true, deleted: list.keys.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
