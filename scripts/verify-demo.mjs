import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const indexPath = join(root, "index.html");
const html = await readFile(indexPath, "utf8");
const failures = [];

function collect(regex, source = html) {
  return Array.from(source.matchAll(regex), (match) => match[1]);
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const viewIds = new Set(collect(/<section\s+class="view(?:\s+active)?"\s+id="([^"]+)"/g));
const navViews = collect(/data-view="([^"]+)"/g);
const jumpTargets = collect(/data-jump="([^"]+)"/g);
const requiredViews = [
  "dashboard",
  "agents",
  "tasks",
  "studio",
  "arena",
  "trace",
  "scoring",
  "reports",
  "experts",
  "solutions",
  "datasets",
  "governance"
];

for (const view of requiredViews) {
  assert(viewIds.has(view), `Missing required view: ${view}`);
  assert(navViews.includes(view), `Missing nav entry for view: ${view}`);
}

for (const target of jumpTargets) {
  assert(viewIds.has(target), `data-jump target has no matching view: ${target}`);
}

const reportButtons = collect(/data-report="([^"]+)"/g);
for (const report of reportButtons) {
  assert(html.includes(`id="report-${report}"`), `Missing report panel: report-${report}`);
}

const localLinks = collect(/href="([^"#][^"]*)"/g).filter((href) => {
  return !href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:");
});

for (const href of localLinks) {
  const targetPath = join(root, href.split("#")[0]);
  try {
    await access(targetPath, constants.R_OK);
  } catch {
    failures.push(`Broken local href: ${href}`);
  }
}

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(Boolean(scriptMatch), "Missing inline script");
if (scriptMatch) {
  try {
    new vm.Script(scriptMatch[1], { filename: "index-inline-script.js" });
  } catch (error) {
    failures.push(`Inline script parse error: ${error.message}`);
  }
}

const interactiveIds = [
  "deployForm",
  "generateSpec",
  "taskForm",
  "compileDsl",
  "runArena",
  "replayTrace",
  "reportMenu",
  "shortlistFromReport",
  "refreshRecommendation",
  "runTrustAudit",
  "tourBtn"
];

for (const id of interactiveIds) {
  assert(html.includes(`id="${id}"`), `Missing interactive control: #${id}`);
}

const terminalConcepts = [
  "Agent Registry",
  "Environment Studio",
  "Trace Lake",
  "Scoring Engine",
  "Failure",
  "Expert",
  "Governance",
  "Data & Solution Market",
  "MCP",
  "Verifier",
  "Gold Trace"
];

for (const concept of terminalConcepts) {
  assert(html.includes(concept), `Missing terminal-state concept: ${concept}`);
}

if (failures.length > 0) {
  console.error("Demo verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Demo verification passed: ${viewIds.size} views, ${navViews.length} nav entries, ${jumpTargets.length} jumps, ${localLinks.length} local links.`);
