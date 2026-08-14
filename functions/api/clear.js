// Cloudflare Pages Function — /api/clear
// Deletes all messages, returns empty list

export async function onRequestPost({ env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  await KV.put('messages', '[]');

  return new Response(JSON.stringify({ ok: true, messages: [] }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
