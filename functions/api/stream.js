// Cloudflare Pages Function — /api/stream
// SSE real-time push: clients connect here, get live updates

export async function onRequestGet({ env }) {
  const KV = env.CLIPDROP_KV;
  if (!KV) return new Response('KV not bound', { status: 500 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const send = (event, data) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event:${event}\ndata:${JSON.stringify(data)}\n\n`));
        } catch (e) { closed = true; }
      };

      // Send initial snapshot
      const list = await KV.list({ prefix: 'msg:' });
      const items = [];
      for (const key of list.keys) {
        const val = await KV.get(key.name, 'json');
        if (val) items.push(val);
      }
      items.sort((a, b) => a.ts - b.ts);
      send('init', items);

      // Poll KV for changes every 1s
      let lastCount = items.length;
      while (!closed) {
        await sleep(1000);
        try {
          const newList = await KV.list({ prefix: 'msg:' });
          if (newList.keys.length !== lastCount) {
            lastCount = newList.keys.length;
            const refreshed = [];
            for (const key of newList.keys) {
              const val = await KV.get(key.name, 'json');
              if (val) refreshed.push(val);
            }
            refreshed.sort((a, b) => a.ts - b.ts);
            send('update', refreshed);
          }
        } catch (e) { closed = true; }
      }
    },
    cancel() { closed = true; }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
