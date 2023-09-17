import { Suspense } from "react";
import { AppProps, getReactRequestHandler } from "@srvr-rndr/react";

function sleep(ms: number) {
  return new Promise((r) => {
    setTimeout(r, ms);
  });
}

async function HeavyComponent({ url }: AppProps) {
  await sleep(1500);

  return <p>Request from: {url}</p>;
}

function App({ url }: AppProps) {
  return (
    <div>
      <Suspense fallback="Loading...">
        {/* @ts-expect-error - async components */}
        <HeavyComponent url={url} />
      </Suspense>
    </div>
  );
}

function Fallback() {
  return <p>Error!</p>;
}

Bun.serve({
  async fetch(request: Request) {
    if (request.url.endsWith("/favicon.ico")) {
      return new Response("not found", { status: 404 });
    }

    return getReactRequestHandler({ App, Fallback })(request);
  },
  port: 3000,
});
