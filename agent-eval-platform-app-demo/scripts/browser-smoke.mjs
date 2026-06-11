import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const targetUrl = process.env.DEMO_URL || "http://localhost:4177/";
const port = Number(process.env.CDP_PORT || 9237);
const userDataDir = await mkdtemp(join(tmpdir(), "agent-eval-app-demo-"));
const failures = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJsonEndpoint() {
  for (let i = 0; i < 80; i += 1) {
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
    payload.error ? callbacks.reject(new Error(payload.error.message)) : callbacks.resolve(payload.result);
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
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
  await wait(900);

  const metrics = await evaluate(client, `(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    viewCount: document.querySelectorAll('.view').length,
    navCount: document.querySelectorAll('[data-view]').length,
    activeView: document.querySelector('.view.active')?.id,
    title: document.querySelector('.page-title h1')?.textContent.trim(),
    forbiddenFr: /FR-[1-9]/.test(document.body.textContent),
    tipCount: document.querySelectorAll('[data-tip]').length
  }))()`);

  if (metrics.scrollWidth > width + 2 || metrics.bodyScrollWidth > width + 2) {
    failures.push(`${label} horizontal overflow: viewport=${width}, document=${metrics.scrollWidth}, body=${metrics.bodyScrollWidth}`);
  }
  if (metrics.viewCount !== 11) failures.push(`${label} expected 11 views, found ${metrics.viewCount}`);
  if (metrics.navCount < 11) failures.push(`${label} expected at least 11 nav targets, found ${metrics.navCount}`);
  if (metrics.activeView !== "home") failures.push(`${label} initial active view should be home`);
  if (!metrics.title?.includes("评测工作区")) failures.push(`${label} title missing`);
  if (metrics.forbiddenFr) failures.push(`${label} UI exposes FR requirement numbers`);
  if (metrics.tipCount < 20) failures.push(`${label} expected contextual tooltips, found ${metrics.tipCount}`);

  const tooltip = await evaluate(client, `new Promise((resolve) => {
    const finish = () => {
      const tip = document.querySelector('#floatingTip');
      if (!tip) {
        resolve({ missing: true });
        return;
      }
      const rect = tip.getBoundingClientRect();
      resolve({
        missing: false,
        hidden: tip.getAttribute('aria-hidden'),
        text: tip.textContent.trim(),
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      });
    };
    const fallback = setTimeout(finish, 1200);
    document.querySelector('[data-view="targets"]')?.click();
    setTimeout(() => {
      const trigger = document.querySelector('#targets .side-panel .help[data-tip]');
      if (!trigger) {
        clearTimeout(fallback);
        resolve({ missing: true });
        return;
      }
      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      trigger.focus();
      setTimeout(() => {
        clearTimeout(fallback);
        finish();
      }, 120);
    }, 520);
  })`);

  if (tooltip.missing) failures.push(`${label} tooltip trigger or floating layer missing`);
  if (tooltip.hidden !== "false") failures.push(`${label} tooltip should be visible during hover/focus`);
  if (!tooltip.text?.includes("接入配置可选择")) failures.push(`${label} tooltip text missing`);
  if (tooltip.left < -1 || tooltip.right > tooltip.viewportWidth + 1) {
    failures.push(`${label} tooltip horizontal overflow: left=${tooltip.left}, right=${tooltip.right}, viewport=${tooltip.viewportWidth}`);
  }
  if (tooltip.top < -1 || tooltip.bottom > tooltip.viewportHeight + 1) {
    failures.push(`${label} tooltip vertical overflow: top=${tooltip.top}, bottom=${tooltip.bottom}, viewport=${tooltip.viewportHeight}`);
  }
  await evaluate(client, `document.querySelector('#targets .side-panel .help[data-tip]')?.dispatchEvent(new MouseEvent('mouseleave'))`);

  const flow = await evaluate(client, `(() => {
    const click = (selector) => document.querySelector(selector)?.click();
    click('[data-view="targets"]');
    click('#addTarget');
    click('#uploadTrace');
    click('[data-view="assets"]');
    click('#createCase');
    click('#cloneTemplate');
    click('[data-view="runs"]');
    click('#startRun');
    click('#rerunUnstable');
    click('[data-view="trace"]');
    click('#markStep');
    click('[data-view="reports"]');
    click('#approveGate');
    click('[data-view="calibration"]');
    click('#freezeJudge');
    click('[data-view="online"]');
    click('#ingestTrace');
    click('[data-view="data-loop"]');
    click('#createWorkOrder');
    click('[data-view="admin"]');
    click('#runAudit');
    return {
      active: document.querySelector('.view.active')?.id,
      targetCount: document.querySelector('#targetCount')?.textContent,
      traceStatus: document.querySelector('#traceStatus')?.textContent,
      assetCount: document.querySelector('#assetCount')?.textContent,
      runStatus: document.querySelector('#runStatus')?.textContent,
      selectedStep: document.querySelector('#selectedStep')?.textContent,
      gateStatus: document.querySelector('#gateStatus')?.textContent,
      judgeStatus: document.querySelector('#judgeStatus')?.textContent,
      onlineQueue: document.querySelector('#onlineQueue')?.textContent,
      workOrders: document.querySelector('#workOrders')?.textContent,
      auditStatus: document.querySelector('#auditStatus')?.textContent
    };
  })()`);

  if (flow.active !== "admin") failures.push(`${label} final view should be admin`);
  if (flow.targetCount !== "19") failures.push(`${label} add target failed`);
  if (!flow.traceStatus?.includes("已校验")) failures.push(`${label} trace upload failed`);
  if (flow.assetCount !== "9,422") failures.push(`${label} asset actions failed`);
  if (!flow.runStatus?.includes("运行中")) failures.push(`${label} run start failed`);
  if (!flow.selectedStep?.includes("工具参数错误")) failures.push(`${label} step marking failed`);
  if (!flow.gateStatus?.includes("已批准")) failures.push(`${label} gate action failed`);
  if (!flow.judgeStatus?.includes("已从门禁排除")) failures.push(`${label} judge action failed`);
  if (flow.onlineQueue !== "31") failures.push(`${label} online ingestion failed`);
  if (flow.workOrders !== "13") failures.push(`${label} data loop failed`);
  if (!flow.auditStatus?.includes("就绪")) failures.push(`${label} audit action failed`);
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
  const tabResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(targetUrl)}`, { method: "PUT" });
  const tab = await tabResponse.json();
  const client = await connect(tab.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await runViewport(client, 1440, 1100, "desktop");
  await runViewport(client, 390, 1500, "mobile");
  client.close();
} finally {
  chrome.kill("SIGTERM");
  await wait(600);
  await rm(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

if (failures.length) {
  console.error("Browser smoke failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Browser smoke passed: desktop/mobile layout and core product flows verified.");
