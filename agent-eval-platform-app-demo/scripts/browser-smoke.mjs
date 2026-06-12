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

  const lineage = await evaluate(client, `(() => {
    const click = (selector) => document.querySelector(selector)?.click();
    const field = (selector) => document.querySelector(selector)?.textContent.trim();
    click('[data-view="runs"]');
    click('#openRunTrace');
    const trace = {
      active: document.querySelector('.view.active')?.id,
      runId: field('#trace [data-field="runId"]'),
      target: field('#trace [data-field="targetVersion"]'),
      dataset: field('#trace [data-field="datasetVersion"]'),
      caseId: field('#trace [data-field="caseId"]'),
      trialId: field('#trace [data-field="trialId"]'),
      traceId: field('#trace [data-field="traceId"]'),
      entry: field('#trace [data-field="traceEntry"]'),
      evidence: field('#traceEvidence')
    };
    click('#openTraceReport');
    const report = {
      active: document.querySelector('.view.active')?.id,
      runId: field('#reports [data-field="runId"]'),
      reportId: field('#reports [data-field="reportId"]'),
      target: field('#reports [data-field="targetVersion"]'),
      dataset: field('#reports [data-field="datasetVersion"]')
    };
    click('#openReportTrace');
    const reportTrace = {
      active: document.querySelector('.view.active')?.id,
      entry: field('#trace [data-field="traceEntry"]'),
      runId: field('#trace [data-field="runId"]')
    };
    click('#openTraceDataLoop');
    const dataLoop = {
      active: document.querySelector('.view.active')?.id,
      traceId: field('#data-loop [data-field="traceId"]'),
      caseId: field('#data-loop [data-field="caseId"]'),
      cluster: field('#data-loop [data-field="failureCluster"]'),
      evidenceStep: field('#data-loop [data-field="evidenceStep"]')
    };
    click('#openDataLoopTrace');
    const backTrace = {
      active: document.querySelector('.view.active')?.id,
      entry: field('#trace [data-field="traceEntry"]'),
      traceId: field('#trace [data-field="traceId"]')
    };
    return { trace, report, reportTrace, dataLoop, backTrace };
  })()`);

  if (lineage.trace.active !== "trace") failures.push(`${label} run queue should open trace view`);
  if (lineage.trace.runId !== "run_20260611_1842") failures.push(`${label} trace run lineage mismatch: ${lineage.trace.runId}`);
  if (lineage.trace.target !== "support-agent_2026_06_11") failures.push(`${label} trace target lineage mismatch: ${lineage.trace.target}`);
  if (lineage.trace.dataset !== "customer_ops_regression_v43") failures.push(`${label} trace dataset lineage mismatch: ${lineage.trace.dataset}`);
  if (lineage.trace.caseId !== "coupon_conflict_0817") failures.push(`${label} trace case lineage mismatch: ${lineage.trace.caseId}`);
  if (lineage.trace.trialId !== "trial_002") failures.push(`${label} trace trial lineage mismatch: ${lineage.trace.trialId}`);
  if (lineage.trace.traceId !== "traj_refund_002") failures.push(`${label} trace id mismatch: ${lineage.trace.traceId}`);
  if (!lineage.trace.entry?.includes("运行队列")) failures.push(`${label} trace entry should mention run queue`);
  if (!lineage.trace.evidence?.includes("run_20260611_1842") || !lineage.trace.evidence?.includes("traj_refund_002")) {
    failures.push(`${label} trace evidence should include run and trajectory ids`);
  }
  if (lineage.report.active !== "reports") failures.push(`${label} trace should open report view`);
  if (lineage.report.runId !== lineage.trace.runId) failures.push(`${label} report run id should match trace`);
  if (lineage.report.reportId !== "report_gate_20260611_1842") failures.push(`${label} report id mismatch`);
  if (lineage.report.target !== lineage.trace.target) failures.push(`${label} report target should match trace`);
  if (lineage.report.dataset !== lineage.trace.dataset) failures.push(`${label} report dataset should match trace`);
  if (lineage.reportTrace.active !== "trace") failures.push(`${label} report representative case should return to trace`);
  if (!lineage.reportTrace.entry?.includes("报告")) failures.push(`${label} report-to-trace entry should mention report`);
  if (lineage.reportTrace.runId !== lineage.trace.runId) failures.push(`${label} report trace run should stay aligned`);
  if (lineage.dataLoop.active !== "data-loop") failures.push(`${label} trace should open data-loop view`);
  if (lineage.dataLoop.traceId !== "traj_refund_002") failures.push(`${label} data loop trace should match selected trajectory`);
  if (lineage.dataLoop.caseId !== "coupon_conflict_0817") failures.push(`${label} data loop case should match selected case`);
  if (lineage.dataLoop.cluster !== "政策冲突澄清") failures.push(`${label} data loop cluster mismatch`);
  if (!lineage.dataLoop.evidenceStep?.includes("refund.request")) failures.push(`${label} data loop evidence step missing`);
  if (lineage.backTrace.active !== "trace") failures.push(`${label} data loop evidence should return to trace`);
  if (!lineage.backTrace.entry?.includes("数据闭环")) failures.push(`${label} back trace entry should mention data loop`);
  if (lineage.backTrace.traceId !== "traj_refund_002") failures.push(`${label} back trace id should remain selected trajectory`);

  const workspaceSwitch = await evaluate(client, `(() => {
    const select = document.querySelector('#workspaceMode');
    const field = (selector) => document.querySelector(selector)?.textContent.trim();
    const setMode = (mode) => {
      select.value = mode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('[data-view="runs"]')?.click();
      document.querySelector('#openRunTrace')?.click();
      const snapshot = {
        mode,
        active: document.querySelector('.view.active')?.id,
        breadcrumb: field('#breadcrumb'),
        project: field('#homeProject'),
        task: field('#taskRow1'),
        target: field('#trace [data-field="targetVersion"]'),
        dataset: field('#trace [data-field="datasetVersion"]'),
        runId: field('#trace [data-field="runId"]'),
        traceId: field('#trace [data-field="traceId"]'),
        caseId: field('#trace [data-field="caseId"]'),
        entry: field('#trace [data-field="traceEntry"]'),
        timeline: field('#traceTimeline'),
        reportMetric: field('#reportSuccessMetric'),
        targetInput: document.querySelector('#targetNameInput')?.value,
        runQueue: field('#runQueueTable')
      };
      document.querySelector('[data-view="home"]')?.click();
      return snapshot;
    };
    return {
      finance: setMode('finance'),
      browser: setMode('browser')
    };
  })()`);

  if (workspaceSwitch.finance.active !== "trace") failures.push(`${label} finance switch should open trace from run queue`);
  if (!workspaceSwitch.finance.breadcrumb?.includes("财务智能体")) failures.push(`${label} finance breadcrumb not updated`);
  if (workspaceSwitch.finance.project !== "财务智能体") failures.push(`${label} finance home project not updated`);
  if (!workspaceSwitch.finance.task?.includes("供应商对账")) failures.push(`${label} finance tasks not updated`);
  if (workspaceSwitch.finance.target !== "finance-agent_2026_06_08") failures.push(`${label} finance target not updated: ${workspaceSwitch.finance.target}`);
  if (workspaceSwitch.finance.dataset !== "finance_reconciliation_v21") failures.push(`${label} finance dataset not updated`);
  if (workspaceSwitch.finance.runId !== "run_finance_20260612_0905") failures.push(`${label} finance run id not updated`);
  if (workspaceSwitch.finance.traceId !== "traj_invoice_tax_004") failures.push(`${label} finance trace id not updated`);
  if (workspaceSwitch.finance.caseId !== "invoice_tax_mismatch_0442") failures.push(`${label} finance case id not updated`);
  if (!workspaceSwitch.finance.timeline?.includes("erp.post_adjustment")) failures.push(`${label} finance trace timeline not updated`);
  if (workspaceSwitch.finance.targetInput !== "财务对账智能体") failures.push(`${label} finance target form not updated`);
  if (!workspaceSwitch.finance.runQueue?.includes("供应商对账月结门禁")) failures.push(`${label} finance run queue not updated`);

  if (workspaceSwitch.browser.active !== "trace") failures.push(`${label} browser switch should open trace from run queue`);
  if (!workspaceSwitch.browser.breadcrumb?.includes("浏览器操作实验室")) failures.push(`${label} browser breadcrumb not updated`);
  if (workspaceSwitch.browser.project !== "浏览器操作实验室") failures.push(`${label} browser home project not updated`);
  if (!workspaceSwitch.browser.task?.includes("阻断截图")) failures.push(`${label} browser tasks not updated`);
  if (workspaceSwitch.browser.target !== "browser-agent_2026_06_02") failures.push(`${label} browser target not updated`);
  if (workspaceSwitch.browser.dataset !== "browser_checkout_lab_v12") failures.push(`${label} browser dataset not updated`);
  if (workspaceSwitch.browser.runId !== "run_browser_20260612_1018") failures.push(`${label} browser run id not updated`);
  if (workspaceSwitch.browser.traceId !== "traj_checkout_006") failures.push(`${label} browser trace id not updated`);
  if (workspaceSwitch.browser.caseId !== "checkout_address_recovery_0209") failures.push(`${label} browser case id not updated`);
  if (!workspaceSwitch.browser.timeline?.includes("Playwright")) failures.push(`${label} browser trace timeline not updated`);
  if (workspaceSwitch.browser.targetInput !== "浏览器下单智能体") failures.push(`${label} browser target form not updated`);
  if (!workspaceSwitch.browser.runQueue?.includes("浏览器下单稳定性")) failures.push(`${label} browser run queue not updated`);

  const workspaceActions = await evaluate(client, `(() => {
    const select = document.querySelector('#workspaceMode');
    const setMode = (mode) => {
      select.value = mode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const field = (selector) => document.querySelector(selector)?.textContent.trim();
    setMode('finance');
    document.querySelector('[data-view="runs"]')?.click();
    document.querySelector('#startRun')?.click();
    const finance = {
      runId: field('#runs [data-field="runId"]'),
      target: field('#runs [data-field="targetVersion"]'),
      trace: field('#runs [data-field="traceId"]'),
      status: field('#runStatus')
    };
    setMode('browser');
    document.querySelector('[data-view="assets"]')?.click();
    const beforeAssets = field('#assetCount');
    document.querySelector('#createCase')?.click();
    document.querySelector('#cloneTemplate')?.click();
    const browserAssets = field('#assetCount');
    setMode('browser');
    document.querySelector('[data-view="online"]')?.click();
    const beforeOnline = field('#onlineQueue');
    document.querySelector('#ingestTrace')?.click();
    const afterOnline = field('#onlineQueue');
    document.querySelector('#openOnlineTrace')?.click();
    const traceId = field('#trace [data-field="traceId"]');
    return { finance, beforeAssets, browserAssets, beforeOnline, afterOnline, traceId };
  })()`);

  if (workspaceActions.finance.runId !== "run_finance_20260612_0905") failures.push(`${label} finance start run should keep finance run id`);
  if (workspaceActions.finance.target !== "finance-agent_2026_06_08") failures.push(`${label} finance start run should keep finance target`);
  if (workspaceActions.finance.trace !== "traj_invoice_tax_004") failures.push(`${label} finance start run should keep finance trace`);
  if (!workspaceActions.finance.status?.includes("运行中")) failures.push(`${label} finance start run status missing`);
  if (workspaceActions.beforeAssets !== "3,240") failures.push(`${label} browser asset count should reset to browser workspace before asset actions`);
  if (workspaceActions.browserAssets !== "3,242") failures.push(`${label} browser asset actions should increment from browser count, got ${workspaceActions.browserAssets}`);
  if (workspaceActions.beforeOnline !== "14") failures.push(`${label} browser online count should reset to browser workspace`);
  if (workspaceActions.afterOnline !== "19") failures.push(`${label} browser online ingest should add five, got ${workspaceActions.afterOnline}`);
  if (workspaceActions.traceId !== "prod_traj_browser_20260611_1718") failures.push(`${label} browser online trace id should be workspace-specific`);

  const flow = await evaluate(client, `(() => {
    const click = (selector) => document.querySelector(selector)?.click();
    const setMode = (mode) => {
      const select = document.querySelector('#workspaceMode');
      select.value = mode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setMode('support');
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
