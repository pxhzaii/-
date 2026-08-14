// Cloudflare Pages Function — /api/delete
// Deletes a single message by id

export async function onRequestGet({ request, env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  await KV.delete(`msg:${id}`);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
