import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the current event guide and development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
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

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /在往返之間/);
  assert.match(html, /\/partners\/rinan-commons\.jpg/);
  assert.doesNotMatch(html, /brand-mark/);
  assert.doesNotMatch(html, /一粒米|在來回往返間/);

  const orderedOrganizations = [
    "國家發展委員會",
    "交通部觀光署",
    "文化部",
    "國立彰化生活美學館",
    "日南稻站",
    "松柏港產業觀光發展協會",
    "臺鐵公司 臺中運務段",
  ];
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const creditsSource = pageSource.slice(pageSource.indexOf("const guidanceOrganizations"));
  let previousIndex = -1;
  for (const organization of orderedOrganizations) {
    const currentIndex = creditsSource.indexOf(organization);
    assert.ok(currentIndex > previousIndex, `${organization} should appear in the specified order`);
    previousIndex = currentIndex;
  }
});
