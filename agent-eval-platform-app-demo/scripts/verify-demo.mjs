import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, "index.html"), "utf8");
const design = await readFile(join(root, "docs/final-requirements-design.md"), "utf8");
const technicalPlan = await readFile(join(root, "docs/agent-integration-runtime-technical-plan.md"), "utf8");
const architectureSvg = await readFile(join(root, "docs/figures/agent-eval-runtime-architecture.svg"), "utf8");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function collect(regex) {
  return Array.from(html.matchAll(regex), (match) => match[1]);
}

const viewIds = new Set(collect(/<section class="view(?: active)?" id="([^"]+)"/g));
const navTargets = collect(/data-view="([^"]+)"/g);
const requiredViews = [
  "home",
  "targets",
  "assets",
  "runs",
  "trace",
  "reports",
  "calibration",
  "online",
  "data-loop",
  "admin",
  "docs"
];

for (const view of requiredViews) {
  assert(viewIds.has(view), `Missing view: ${view}`);
  assert(navTargets.includes(view), `Missing nav target: ${view}`);
}

const requiredControls = [
  "addTarget",
  "uploadTrace",
  "createCase",
  "cloneTemplate",
  "startRun",
  "rerunUnstable",
  "markStep",
  "approveGate",
  "freezeJudge",
  "ingestTrace",
  "createWorkOrder",
  "runAudit"
];

for (const id of requiredControls) {
  assert(html.includes(`id="${id}"`), `Missing control: ${id}`);
}

const forbiddenCustomerCopy = [
  "FR-1",
  "FR-2",
  "FR-3",
  "FR-4",
  "FR-5",
  "FR-6",
  "FR-7",
  "FR-8",
  "FR-9",
  "面向 2028",
  "需求编号"
];

for (const text of forbiddenCustomerCopy) {
  assert(!html.includes(text), `Customer UI should not include: ${text}`);
}

const requiredProductTerms = [
  "被测对象",
  "评测资产",
  "评测运行",
  "轨迹复核",
  "报告",
  "裁判校准",
  "在线监控",
  "数据闭环",
  "管理",
  "pass@3",
  "pass^3",
  "置信区间",
  "OpenTelemetry",
  "沙箱",
  "金标准轨迹",
  "数据工单",
  "来源链路",
  "查看失败轨迹",
  "Trajectory",
  "Run Snapshot"
];

for (const term of requiredProductTerms) {
  assert(html.includes(term), `Missing product term: ${term}`);
}

const tipCount = collect(/data-tip="([^"]+)"/g).length;
assert(tipCount >= 20, `Expected at least 20 contextual tooltips, found ${tipCount}`);

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(Boolean(scriptMatch), "Missing inline script");
if (scriptMatch) {
  try {
    new vm.Script(scriptMatch[1], { filename: "app-demo-inline.js" });
  } catch (error) {
    failures.push(`Inline script parse failed: ${error.message}`);
  }
}

assert(design.includes("Final Information Architecture"), "Final requirements design missing IA section");
assert(design.includes("Core Product Workflows"), "Final requirements design missing workflows");
assert(design.includes("The product UI does not expose internal requirement numbers"), "Design must include no-number acceptance criterion");
assert(html.includes('id="docs"'), "Missing standalone docs entry");
assert(html.includes("平台介绍"), "Docs entry should hold platform introduction copy outside operations UI");
assert(html.includes("智能体接入与运行测评技术方案"), "Docs should include technical implementation plan entry");
assert(technicalPlan.includes("智能体接入与运行测评技术框架图"), "Technical plan missing architecture section");
assert(technicalPlan.includes("多次运行结果偏差处理"), "Technical plan missing repeated-run variance handling");
assert(technicalPlan.includes("客户价值与自建比较"), "Technical plan missing customer value section");
assert(architectureSvg.includes("<svg"), "Architecture figure should be rendered as SVG");

if (failures.length) {
  console.error("Verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verification passed: ${viewIds.size} views, ${navTargets.length} nav targets, ${tipCount} tooltips.`);
