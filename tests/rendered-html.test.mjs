import assert from "node:assert/strict";
import test from "node:test";
import { isMarketplaceVertical, normalizeSlug, parseOptionalId } from "../lib/marketplace.ts";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
      DB: {
        prepare() {
          throw new Error("mock database unavailable during static render");
        },
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Delhi Service Network homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Delhi Service Network \| Delhi NCR Doorstep Services<\/title>/i);
  assert.match(html, /Service chahiye\? Verified vendor jaldi connect hoga/);
  assert.match(html, /Book Service/);
  assert.match(html, /Shop, book services, discover local/);
  assert.match(html, /Join as Vendor/);
  assert.match(html, /Track your booking/);
  assert.match(html, /Accept and manage leads/);
  assert.match(html, /Support desk/);
  assert.match(html, /Launch rules/);
  assert.doesNotMatch(html, /Complete lead command center|Admin Login|Export CSV/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i);
});

test("server-renders the separate admin login page", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Private admin panel/);
  assert.match(html, /Admin Login/);
  assert.match(html, /Secure access/);
});

test("normalizes admin category input safely", () => {
  assert.equal(normalizeSlug("Home & Kitchen"), "home-kitchen");
  assert.equal(normalizeSlug("  AC Repair  "), "ac-repair");
  assert.equal(parseOptionalId("42"), 42);
  assert.equal(parseOptionalId("invalid"), null);
  assert.equal(isMarketplaceVertical("SHOP"), true);
  assert.equal(isMarketplaceVertical("RESTAURANT"), false);
});
