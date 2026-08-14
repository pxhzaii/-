// Cloudflare Pages Function — /api/stream
// SSE real-time push: single KV key poll, fast

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

      // Send initial snapshot — single KV read
      const init = await KV.get('messages', 'json') || [];
      send('init', init);

      // Poll single key for changes every 800ms
      let lastJson = JSON.stringify(init);
      while (!closed) {
        await sleep(800);
        try {
          const msgs = await KV.get('messages', 'json') || [];
          const json = JSON.stringify(msgs);
          if (json !== lastJson) {
            lastJson = json;
            send('update', msgs);
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
