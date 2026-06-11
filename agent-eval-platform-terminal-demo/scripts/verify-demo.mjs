import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, "index.html"), "utf8");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function collect(regex) {
  return Array.from(html.matchAll(regex), (match) => match[1]);
}

const views = new Set(collect(/<section class="view(?: active)?" id="([^"]+)"/g));
const navTargets = collect(/data-view="([^"]+)"/g);
const requiredViews = [
  "home",
  "targets",
  "datasets",
  "runs",
  "evaluators",
  "annotation",
  "reports",
  "online",
  "data-loop",
  "architecture",
  "roadmap",
  "governance"
];

for (const view of requiredViews) {
  assert(views.has(view), `Missing view: ${view}`);
  assert(navTargets.includes(view), `Missing nav target: ${view}`);
}

const requiredFr = [
  "FR-1.1",
  "FR-1.2",
  "FR-2.1",
  "FR-3.1",
  "FR-3.2",
  "FR-3.3",
  "FR-4.5",
  "FR-5.2",
  "FR-6.2",
  "FR-6.5",
  "FR-7.1",
  "FR-8.2",
  "FR-9.2"
];

for (const fr of requiredFr) {
  assert(html.includes(fr), `Missing requirement marker: ${fr}`);
}

const ids = [
  "connectTarget",
  "validateTrace",
  "createDatasetVersion",
  "startRun",
  "rerunFailures",
  "rejudgeRun",
  "freezeJudge",
  "completeAnnotation",
  "togglePassK",
  "compareRuns",
  "triggerGate",
  "ingestOnlineTrace",
  "createDataOrder",
  "runAudit"
];

for (const id of ids) {
  assert(html.includes(`id="${id}"`), `Missing interactive control: ${id}`);
}

const tooltipCount = collect(/data-tip="([^"]+)"/g).length;
assert(tooltipCount >= 25, `Expected at least 25 tooltips, found ${tooltipCount}`);

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(Boolean(scriptMatch), "Missing inline script");
if (scriptMatch) {
  try {
    new vm.Script(scriptMatch[1], { filename: "demo-inline-script.js" });
  } catch (error) {
    failures.push(`Inline script parse failed: ${error.message}`);
  }
}

const localLinks = collect(/href="([^"#][^"]*)"/g).filter((href) => !href.startsWith("http"));
for (const href of localLinks) {
  try {
    await access(join(root, href.split("#")[0]), constants.R_OK);
  } catch {
    failures.push(`Broken local link: ${href}`);
  }
}

assert(!html.includes("agent-eval-os-slack"), "Demo should not depend on prior demo folder");
assert(!html.includes("nolfacalatroni776-design.github.io/agent-arena-demo/\">"), "Demo should not overwrite deployed root URL");

if (failures.length) {
  console.error("Verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verification passed: ${views.size} views, ${navTargets.length} nav targets, ${tooltipCount} tooltips.`);
