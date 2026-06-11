# Agent Evaluation Platform Final Requirements Design

## Product Positioning

Build an operational platform for the full Agent evaluation lifecycle. The product is not a benchmark landing page and not a requirement viewer. It is a working control plane for teams that need to register Agents, build evaluation assets, run repeatable evaluations, review traces, govern judges, gate releases, monitor production quality, and turn failures into training-data work orders.

The platform combines three capabilities:

- Automated evaluation infrastructure for repeatable runs, regression gates, online scoring, and trace analysis.
- Human evaluation operations for gold standards, judge calibration, trajectory labeling, arbitration, and expert capacity.
- Evaluation asset library for datasets, cases, environments, rubrics, evaluators, mock tools, and reusable templates.

## Primary Users

- AI platform owner: manages evaluation programs, gates, governance, and executive reporting.
- Agent developer: connects a target, launches regression runs, investigates failures, and fixes regressions.
- Evaluation builder: creates datasets, cases, environment templates, assertions, and rubrics.
- Annotation lead: manages review queues, gold traces, pairwise tasks, judge calibration, and expert quality.
- Enterprise AI buyer: compares Agents and receives trusted evaluation reports for deployment decisions.

## Final Information Architecture

The demo implements these product surfaces:

- Home: operational workspace, active runs, quality signals, and recommended actions.
- Targets: Agent registry, target versions, connection methods, trace upload, and health checks.
- Assets: dataset library, case database, environment templates, evaluators, rubrics, and template marketplace.
- Runs: evaluation orchestration, repeated trials, budget controls, sandbox status, and run queue.
- Trace Review: step-level trajectory timeline, evidence highlights, terminal-state checks, and failure tags.
- Reports: run report, version comparison, confidence intervals, pass@k/pass^k, and release gate decision.
- Calibration: judge health, gold-standard agreement, human review sampling, and freeze controls.
- Online Monitor: production trace intake, online scoring, quality drift, alerts, and return-to-regression queue.
- Data Loop: failure clusters, data work orders, SFT/DPO/process-reward exports, and re-evaluation validation.
- Admin: tenants, RBAC, audit log, PII redaction, budget, deployment mode, and evidence bundles.
- Docs: platform introduction, user guides, data model, orchestration notes, judge governance, data-loop playbook, and trust/deployment guides.

Customer-facing explanatory content belongs in Docs, not inside operational work surfaces. Operational pages should expose status, tables, controls, page properties, and contextual tooltips instead of broad product-introduction copy.

## Core Product Workflows

### First Evaluation

1. Add an Agent target through API, trace upload, SDK, MCP, or browser/computer-use mode.
2. Select or clone an evaluation template from the asset library.
3. Bind a versioned dataset, target version, evaluator set, and run configuration.
4. Launch an evaluation run with repeated trials and budget controls.
5. Inspect the report and drill from aggregate score to failing trajectory step.
6. Convert failure clusters into a data work order or release-gate decision.

### Release Gate

1. CI triggers a regression run against the approved baseline.
2. The platform runs repeated trials and separates infrastructure failures from Agent failures.
3. The report compares fixed, newly failed, continuously failed, and continuously passed cases.
4. Statistical confidence and judge health decide whether the gate can block release.
5. The platform writes status and failure summary back to the development workflow.

### Judge Calibration

1. Each judge has a gold-standard set and agreement threshold.
2. Runs sample low-confidence or boundary cases for human review.
3. Human agreement updates judge health.
4. Judges below threshold are excluded from release-gate decisions.
5. Corrected labels improve future judge behavior and failure attribution.

### Online-to-Offline Loop

1. Production traces stream through an OpenTelemetry-compatible collector.
2. Sampling rules select low-score, negative-feedback, handoff, or high-risk traces.
3. The platform redacts sensitive fields and turns selected traces into candidate cases.
4. Humans or assisted workflows add references, assertions, rubrics, and tags.
5. New cases enter regression suites and generate training-data demand.

## Key Objects

- Target: a reproducible Agent version with model, prompt, tools, runtime, credentials, and connection mode.
- Dataset: an immutable versioned snapshot of cases.
- Case: task input, initial state, reference answer, gold trajectory, assertions, tags, source, and review status.
- Environment: sandbox template with image, init data, tools, reset strategy, mock behavior, and terminal checker.
- Run: dataset version, target version, evaluator set, repeated-trial configuration, limits, and gate policy.
- Trial: one execution of a case.
- Trajectory: ordered steps with user messages, model output, tool calls, tool results, screenshots, and state deltas.
- Evaluator: versioned scoring logic with a normalized score, label, reason, evidence reference, and cost.
- Review Task: human work item for calibration, low-confidence escalation, failure attribution, or pairwise ranking.
- Report: aggregate metrics, confidence intervals, failure clusters, trace links, gate decision, and evidence bundle.
- Data Work Order: failure-driven request for new cases, gold traces, preference data, red-team data, or verifier logic.

## Acceptance Criteria

- A new Agent can be connected, tested, and evaluated from the UI without editing existing demos.
- A dataset version is visibly immutable and reports bind to specific versions.
- Evaluation runs support repeated trials and show pass@k, pass^k, variance, and confidence.
- Trace review connects scores to concrete evidence steps.
- Judge health can affect release-gate eligibility.
- Online traces can be converted into regression candidates.
- Failure clusters can create data work orders.
- Platform introduction has a standalone Docs entry and does not occupy the operational dashboard.
- Functional explanations appear as contextual tooltips near the relevant control or status field.
- The product UI does not expose internal requirement numbers as customer-facing content.
- The demo visually behaves like a real app workspace rather than a research-report page.
