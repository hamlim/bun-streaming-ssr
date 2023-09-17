import { Suspense } from "react";
import { renderToReadableStream, renderToString } from "react-dom/server";

function sleep(ms: number) {
  return new Promise((r) => {
    setTimeout(r, ms);
  });
}

async function HeavyComponent({ request }: { request: Request }) {
  await sleep(1500);
  console.log(request);

  return <p>Request from: {request.url}</p>;
}

function App({ request }: { request: Request }) {
  return (
    <div>
      <Suspense fallback="Loading...">
        {/* @ts-expect-error - async components */}
        <HeavyComponent request={request} />
      </Suspense>
    </div>
  );
}

Bun.serve({
  async fetch(request: Request) {
    if (request.url.endsWith("/favicon.ico")) {
      return new Response("not found", { status: 404 });
    }

    try {
      let stream = await renderToReadableStream(<App request={request} />, {
        onError(error: unknown, errorInfo: unknown) {
          console.error(error, errorInfo);
        },
      });

      return new Response(stream, {
        status: 200,
      });
    } catch (e) {
      return new Response(renderToString(<div>Failed to render</div>), {
        status: 500,
      });
    }
  },
  port: 3000,
});
