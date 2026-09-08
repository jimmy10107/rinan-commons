import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function createWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function fetchRoute(worker, path) {
  return worker.fetch(
    new Request(`http://localhost${path}`, {
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

test("renders the main site and both independent content routes", async () => {
  const worker = await createWorker();

  const homeResponse = await fetchRoute(worker, "/");
  assert.equal(homeResponse.status, 200);
  assert.match(homeResponse.headers.get("content-type") ?? "", /^text\/html\b/i);
  const homeHtml = await homeResponse.text();
  assert.match(homeHtml, developmentPreviewMeta);
  assert.match(homeHtml, /從一粒米出發/);
  assert.match(homeHtml, /\/walk\/2026/);
  assert.match(homeHtml, /\/exhibition\/to-and-from/);
  assert.match(homeHtml, /\/partners\/rinan-commons\.jpg/);

  const eventResponse = await fetchRoute(worker, "/walk/2026");
  assert.equal(eventResponse.status, 200);
  const eventHtml = await eventResponse.text();
  assert.match(eventHtml, /在往返之間/);
  assert.match(eventHtml, /10\/24/);
  assert.match(eventHtml, /10\/25/);
  assert.match(eventHtml, /報名連結準備中/);

  const exhibitionResponse = await fetchRoute(worker, "/exhibition/to-and-from");
  assert.equal(exhibitionResponse.status, 200);
  const exhibitionHtml = await exhibitionResponse.text();
  for (const chapter of ["TO", "MOTION", "RETURN", "GROUND"]) {
    assert.match(exhibitionHtml, new RegExp(`>${chapter}<`));
  }
  assert.match(exhibitionHtml, /https:\/\/rinancommons\.s\.gy\/pdf/);

  const orderedOrganizations = [
    "國家發展委員會",
    "交通部觀光署",
    "文化部",
    "國立彰化生活美學館",
    "日南稻站",
    "松柏港產業觀光發展協會",
    "臺鐵公司 臺中運務段",
  ];
  const pageSource = await readFile(new URL("../app/walk/2026/page.tsx", import.meta.url), "utf8");
  const creditsSource = pageSource.slice(pageSource.indexOf("const guidanceOrganizations"));
  let previousIndex = -1;
  for (const organization of orderedOrganizations) {
    const currentIndex = creditsSource.indexOf(organization);
    assert.ok(currentIndex > previousIndex, `${organization} should appear in the specified order`);
    previousIndex = currentIndex;
  }
});
