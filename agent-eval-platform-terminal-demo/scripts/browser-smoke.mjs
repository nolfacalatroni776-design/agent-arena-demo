import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const chromePath = "/Applications/Google Chrome.app/Contents/MOS/Google Chrome";
const fallbackChromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const targetUrl = process.env.DEMO_URL || "http://localhost:4175/";
const port = Number(process.env.CDP_PORT || 9231);
const userDataDir = await mkdtemp(join(tmpdir(), "agent-eval-terminal-chrome-"));
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
    if (payload.error) callbacks.reject(new Error(payload.error.message));
    else callbacks.resolve(payload.result);
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
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    viewCount: document.querySelectorAll('.view').length,
    navCount: document.querySelectorAll('[data-view]').length,
    activeView: document.querySelector('.view.active')?.id,
    title: document.querySelector('.workspace-title h1')?.textContent.trim(),
    tipCount: document.querySelectorAll('[data-tip]').length,
    firstPanel: document.querySelector('.kpi strong')?.textContent.trim()
  }))()`);

  if (metrics.scrollWidth > width + 2 || metrics.bodyScrollWidth > width + 2) {
    failures.push(`${label} horizontal overflow: viewport=${width}, doc=${metrics.scrollWidth}, body=${metrics.bodyScrollWidth}`);
  }
  if (metrics.viewCount !== 12) failures.push(`${label} expected 12 views, found ${metrics.viewCount}`);
  if (metrics.navCount < 12) failures.push(`${label} expected nav entries, found ${metrics.navCount}`);
  if (metrics.activeView !== "home") failures.push(`${label} initial active view should be home`);
  if (!metrics.title?.includes("Agent Evaluation Control Plane")) failures.push(`${label} title missing`);
  if (metrics.tipCount < 25) failures.push(`${label} expected contextual tooltips, found ${metrics.tipCount}`);
  if (!metrics.firstPanel) failures.push(`${label} KPI panel missing`);

  const flow = await evaluate(client, `(() => {
    const click = (selector) => document.querySelector(selector)?.click();
    click('[data-view="targets"]');
    click('#connectTarget');
    click('#validateTrace');
    click('[data-view="datasets"]');
    click('#createDatasetVersion');
    click('[data-view="runs"]');
    click('#startRun');
    click('#rerunFailures');
    click('[data-view="evaluators"]');
    click('#freezeJudge');
    click('[data-view="annotation"]');
    click('#completeAnnotation');
    click('[data-view="reports"]');
    click('#togglePassK');
    click('#compareRuns');
    click('#triggerGate');
    click('[data-view="online"]');
    click('#ingestOnlineTrace');
    click('[data-view="data-loop"]');
    click('#createDataOrder');
    click('[data-view="governance"]');
    click('#runAudit');
    return {
      active: document.querySelector('.view.active')?.id,
      targetStatus: document.querySelector('#targetStatus')?.textContent,
      runState: document.querySelector('#runState')?.textContent,
      judgeHealth: document.querySelector('#judgeHealth')?.textContent,
      annotationSla: document.querySelector('#annotationSla')?.textContent,
      gateState: document.querySelector('#gateState')?.textContent,
      onlineQueue: document.querySelector('#onlineQueue')?.textContent,
      dataOrders: document.querySelector('#dataOrders')?.textContent,
      auditState: document.querySelector('#auditState')?.textContent,
      toast: document.querySelector('#toast')?.textContent
    };
  })()`);

  if (flow.active !== "governance") failures.push(`${label} final view should be governance`);
  if (!flow.targetStatus?.includes("已接入")) failures.push(`${label} target connect failed`);
  if (!flow.runState?.includes("部分完成")) failures.push(`${label} run controls failed`);
  if (!flow.judgeHealth?.includes("冻结")) failures.push(`${label} judge governance failed`);
  if (!flow.annotationSla?.includes("4.1")) failures.push(`${label} annotation action failed`);
  if (!flow.gateState?.includes("通过")) failures.push(`${label} gate action failed`);
  if (flow.onlineQueue !== "29") failures.push(`${label} online ingestion failed`);
  if (flow.dataOrders !== "12") failures.push(`${label} data order action failed`);
  if (!flow.auditState?.includes("合格")) failures.push(`${label} audit action failed`);
}

async function cleanup() {
  await rm(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

const chrome = spawn(fallbackChromePath || chromePath, [
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
  await runViewport(client, 390, 1500, "mobile");
  client.close();
} finally {
  chrome.kill("SIGTERM");
  await wait(600);
  await cleanup();
}

if (failures.length) {
  console.error("Browser smoke failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Browser smoke passed: desktop/mobile layout and core interactions verified.");
