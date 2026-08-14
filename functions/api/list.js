// Cloudflare Pages Function — /api/list
// Returns all messages from KV

export async function onRequestGet({ env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const list = await KV.list({ prefix: 'msg:' });
  const items = [];
  for (const key of list.keys) {
    const val = await KV.get(key.name, 'json');
    if (val) items.push(val);
  }
  // Sort by timestamp ascending
  items.sort((a, b) => a.ts - b.ts);
  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
