import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the physics seating chart", async () => {
  const response = await render();
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Physics Seating Chart<\/title>/i);
  assert.match(html, /Front of room/);
  assert.match(html, /Column A/);
  assert.match(html, /Column D/);
  assert.match(html, /Maya Chen/);
  assert.match(html, /Adam Lopez/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("defines a four-column grid with forty students", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const names = page.match(/^\s{2}"[A-Z][^"]+",$/gm) ?? [];
  assert.equal(names.length, 40);
  assert.match(css, /grid-template-columns:\s*repeat\(4,/);
});
