import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const targetUrl = process.env.DEMO_URL || "http://localhost:4173/";
const port = Number(process.env.CDP_PORT || 9227);
const userDataDir = await mkdtemp(join(tmpdir(), "agent-eval-os-chrome-"));
const failures = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJsonEndpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      await wait(100);
    }
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

function connect(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (!payload.id) return;
    const callbacks = pending.get(payload.id);
    if (!callbacks) return;
    pending.delete(payload.id);
    if (payload.error) {
      callbacks.reject(new Error(payload.error.message));
      return;
    }
    callbacks.resolve(payload.result);
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          id += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((innerResolve, innerReject) => {
            pending.set(id, { resolve: innerResolve, reject: innerReject });
          });
        },
        close() {
          socket.close();
        }
      });
    });
    socket.addEventListener("error", reject);
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result.value;
}

async function runViewport(client, width, height, label) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 760
  });
  await client.send("Page.navigate", { url: targetUrl });
  await wait(800);

  const metrics = await evaluate(client, `(() => ({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    viewCount: document.querySelectorAll(".view").length,
    navCount: document.querySelectorAll(".nav [data-view]").length,
    activeView: document.querySelector(".view.active")?.id,
    h1: document.querySelector(".topbar h1")?.textContent.trim()
  }))()`);

  if (metrics.scrollWidth > width + 2 || metrics.bodyScrollWidth > width + 2) {
    failures.push(`${label} horizontal overflow: viewport=${width}, document=${metrics.scrollWidth}, body=${metrics.bodyScrollWidth}`);
  }
  if (metrics.viewCount !== 12) failures.push(`${label} expected 12 views, found ${metrics.viewCount}`);
  if (metrics.navCount !== 12) failures.push(`${label} expected 12 nav entries, found ${metrics.navCount}`);
  if (metrics.activeView !== "dashboard") failures.push(`${label} initial active view should be dashboard`);
  if (!metrics.h1?.includes("Agent Eval OS")) failures.push(`${label} topbar title missing`);

  const flow = await evaluate(client, `(() => {
    const click = (selector) => document.querySelector(selector)?.click();
    click('[data-view="studio"]');
    const studioActive = document.querySelector('#studio')?.classList.contains('active');
    click('#compileDsl');
    const envCount = document.querySelector('#envCount')?.textContent;
    click('[data-view="arena"]');
    click('#runArena');
    click('[data-view="trace"]');
    click('#replayTrace');
    click('[data-view="scoring"]');
    const slider = document.querySelector('#weightSuccess');
    slider.value = 35;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    click('[data-view="governance"]');
    click('#runTrustAudit');
    return {
      studioActive,
      envCount,
      traceRows: document.querySelectorAll('#eventStream .event-row').length,
      score: document.querySelector('#compositeScore')?.textContent,
      readiness: document.querySelector('#trustReadiness')?.textContent,
      toast: document.querySelector('#toast')?.textContent
    };
  })()`);

  if (!flow.studioActive) failures.push(`${label} studio view did not activate`);
  if (flow.envCount !== "43") failures.push(`${label} compile DSL did not increment env count`);
  if (flow.traceRows < 7) failures.push(`${label} trace replay did not append events`);
  if (!flow.score || Number(flow.score) <= 90) failures.push(`${label} scoring slider did not refresh score`);
  if (flow.readiness !== "92%") failures.push(`${label} trust audit did not refresh readiness`);
}

const chrome = spawn(chromePath, [
  "--headless",
  "--disable-gpu",
  "--no-sandbox",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  "about:blank"
], { stdio: "ignore" });

try {
  await waitForJsonEndpoint();
  const tabsResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(targetUrl)}`, { method: "PUT" });
  const tab = await tabsResponse.json();
  const client = await connect(tab.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await runViewport(client, 1440, 1100, "desktop");
  await runViewport(client, 390, 1400, "mobile");
  client.close();
} finally {
  chrome.kill("SIGTERM");
  await wait(250);
  await rm(userDataDir, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("Browser smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Browser smoke passed: desktop/mobile layout and key interactions verified.");
