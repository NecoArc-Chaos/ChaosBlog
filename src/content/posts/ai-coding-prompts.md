---
title: AI Coding 高质量提示词合集：从写对到写好
published: 2026-11-26
publishedAt: 2026-11-26T23:05:23+08:00
description: 精选 24 条工程级 AI Coding 提示词，覆盖系统规范、架构规划、TDD 编码、根因调试、安全审计与防“AI 味”前端设计，全部采用代码块即拿即用。
tags: [AI, Prompt, 技术, 效率]
category: 教程
draft: false
---

写代码时 AI 经常出现**瞎猜文件、过度封装、改坏周围代码、只顾着把测试改过**等问题。根因往往不在模型能力，而在**上下文约束缺失**。

下面整理了 24 条经过一线工程实践检验的高信噪比提示词，覆盖 **项目规则、方案规划、编码实现、根因排错、重构优化、审查交付** 六大阶段。全部放入独立代码块，点击右上角即可一键复制。

> [!TIP]
> 本合集兼容 Claude Code、Codex、Cursor、Windsurf 与 Gemini CLI。英文版提示词在复杂推理与规则遵循上通常信噪比更高，建议优先使用；中文场景亦可直接粘贴。

---

## 一、项目级系统规范（写入 `CLAUDE.md` / `AGENTS.md` / `.cursorrules`）

全局规则决定 AI 的工程下限。建议直接固化到仓库根目录的规则文件中，避免每次对话重复提醒。

### 1. 先查证再作答（反幻觉红线）

杜绝模型在没打开文件的情况下编造 API、路径或调用关系。

```xml
<investigate_before_answering>
Never speculate about code, file paths, or symbols you have not opened.
If the user references a specific file or behavior, read the relevant files BEFORE answering or proposing edits.
Base every technical claim strictly on observed source code, logs, or tool outputs.
If something cannot be confirmed from the workspace, explicitly state what is missing instead of guessing.
</investigate_before_answering>
```

### 2. 克制修改与反过度设计（Anti-Overengineering）

防止模型顺手重构无关文件、制造一次性工具函数或堆砌无用的防御性分支。

```text
Keep solutions simple, focused, and strictly within the requested scope:
- Scope: Do not refactor unrelated code, rename symbols, or add unrequested features outside the task boundary.
- Abstractions: Do not create single-use helpers, wrappers, or premature abstractions for hypothetical future needs.
- Defensive coding: Trust internal invariants and framework guarantees. Only validate inputs at external boundaries (user input, network, I/O).
- Comments: Only add concise comments explaining *why* a non-obvious decision exists, never *what* the syntax does.
```

### 3. 破坏性与不可逆操作护栏

在 Agent 具备终端执行权时，划清“可自动执行”与“必须人工确认”的边界。

```text
Consider the reversibility and blast radius of every action:
- Safe to execute autonomously: reading files, running tests/linters/builds, editing local scoped files.
- Ask for confirmation first: deleting data/branches, dropping database tables, force-pushing (`git push --force`), `git reset --hard`, modifying shared production configs, or sending external messages.
- Never bypass safety checks (e.g., `--no-verify`, silencing lint/type errors with `any` or `@ts-ignore`) as a shortcut.
```

### 4. 工程交付闭环（测试与构建标准）

强制要求模型在交差前自己跑通检查，而不是只写“理论上能运行”的代码。

```text
Before marking any coding task complete:
1. Run the project's formatter, linter, type-checker, and relevant test suite.
2. Inspect the actual diff (`git diff`) to ensure no debug logs, leftover temporary files, or unintended edits remain.
3. Report only verified results from commands you actually ran in this session.
```

---

## 二、需求澄清与方案规划（动手前先对齐）

复杂需求直接让 AI 写代码大概率返工。先锁定边界与架构，再落盘改动。

### 5. 只规划不改代码（Plan-Before-Code）

```text
Do NOT edit any files yet.
First, explore the relevant modules to understand the current architecture, data flow, and constraints.
Then present a concise implementation plan covering:
1. Exact files to modify/create and why.
2. Edge cases, failure modes, and backward-compatibility risks.
3. Verification steps (tests/commands) to prove the fix works.
Stop and wait for my approval before writing code.
```

### 6. 需求模糊度检查（反盲目假设）

```text
Analyze this requirement before proposing a solution.
Identify any ambiguities, hidden assumptions, conflicting constraints, or missing edge-case decisions (e.g., error handling, auth, concurrency, data migration).
Ask me up to 4 sharp, concrete questions with recommended defaults so we can lock down the spec first.
```

### 7. 陌生仓库快速测绘（Codebase Onboarding）

```text
Map out how [功能/模块名] works end-to-end in this repository.
Trace the entry point, core data structures, state transitions, external side effects, and test coverage.
Output a concise architecture summary with exact `file:line` references—no fluff.
```

### 8. 多方案技术权衡（ADR 决策矩阵）

```text
For [技术问题/需求], propose 2–3 distinct architectural approaches.
Compare them objectively across: implementation complexity, maintainability, runtime performance, failure modes, and migration cost.
Recommend one option with clear justification, and state when you would choose the alternatives instead.
```

---

## 三、高质量编码与测试驱动（TDD & Clean Code）

### 9. 禁止“面向测试作弊”的通用实现

防止 AI 为了让已有用例变绿而写死特判（Hardcode）或偷偷修改断言。

```text
Implement a general-purpose, principled solution that solves the underlying problem for all valid inputs—not just the existing test cases.
- Do not hardcode values, special-case test inputs, or weaken/delete existing tests to make the suite pass.
- If you discover a test itself is wrong or contradicts the specification, stop and explain the discrepancy to me instead of silently altering it.
```

### 10. 严格 TDD 红-绿-重构工作流

```text
Follow strict TDD for this feature:
1. Red: Write failing unit/integration tests covering the core happy path, boundary values, and failure cases first. Run them and confirm they fail for the expected reason.
2. Green: Write the minimal clean implementation to make all tests pass.
3. Refactor: Clean up duplication and naming without changing behavior, then re-run the full test suite to confirm green.
```

### 11. 类型驱动与非法状态不可表示（Type-First）

尤其适合 TypeScript / Rust / Go / Swift 项目，把 Bug 消灭在编译期。

```text
Design the types, schemas, and state transitions first before writing business logic:
- Make illegal states unrepresentable using discriminated unions / sum types instead of loose booleans or optional bags.
- Enforce strict input validation at module boundaries and keep internal functions operating on validated types.
- Avoid `any`, unsafe casts, and non-null assertions (`!`).
```

### 12. 极端边界条件加固清单

```text
Audit this implementation against edge cases and failure modes:
- Empty/null/undefined inputs, Unicode/emoji/RTL strings, zero/negative/overflow numbers, timezone & DST boundaries.
- Network timeouts, partial failures, duplicate/out-of-order requests (idempotency), and concurrent race conditions.
Fix any fragile assumptions and add targeted regression tests for the highest-risk edge cases.
```

---

## 四、根因排查与精准调试（Root-Cause Debugging）

### 13. 根因修复（禁止症状级打补丁）

```text
Diagnose the root cause of this bug—do NOT apply a superficial symptom patch or defensive workaround.
1. Reproduce or trace the exact execution path from trigger to failure.
2. Identify *why* the invariant broke at the architectural/state level.
3. Propose a root-cause fix, check if the same pattern exists elsewhere in the codebase, and add a regression test that fails before the fix and passes after.
```

### 14. 报错堆栈与日志分诊（Error Triage）

```text
Analyze this error log / stack trace and the surrounding code:
1. Distinguish the primary root failure from cascading secondary errors.
2. List the top 2–3 hypotheses ranked by likelihood, with the exact file/line or runtime state needed to confirm or rule out each one.
3. Tell me the fastest single check/command to isolate the true cause.
```

### 15. 异步竞态与状态不一致排查

```text
Investigate potential concurrency, caching, or state-synchronization bugs in [模块/组件]:
Check for: stale closures, out-of-order async responses overwriting newer state, missing cleanup on unmount/navigation, cache invalidation mismatches, and non-atomic read-modify-write sequences.
Show the exact interleaving sequence that can trigger a bug and how to fix it cleanly.
```

### 16. 最小可复现用例构造（Minimal Repro）

```text
Extract this bug from our production codebase into a minimal, self-contained reproduction test case (< 40 lines, zero external network dependencies).
Confirm the reproduction fails deterministically before touching any implementation code.
```

---

## 五、重构、性能优化与前端审美

### 17. 零行为改变的安全重构

```text
Refactor [目标文件/模块] to improve readability and cohesion while guaranteeing zero behavioral change:
- Preserve all public APIs, signatures, error types, and observable side effects.
- Break the refactoring into small, verifiable steps; run existing tests after each step.
- Do not mix feature additions or bug fixes into this refactoring diff.
```

### 18. 性能瓶颈定量剖析

```text
Profile and optimize [函数/查询/页面] for runtime performance and memory:
- Identify real bottlenecks first (N+1 queries, redundant re-renders, O(n²) loops, excessive allocations, unindexed lookups, layout thrashing).
- Avoid premature micro-optimizations that hurt readability without measurable impact.
- Estimate the before/after time & space complexity and verify behavior remains identical.
```

### 19. 拒绝“AI 味”的前端设计审美（Anti-AI-Slop）

解决 AI 写前端千篇一律（紫白渐变、生硬卡片、默认字体、无呼吸感）的通病。

```xml
<frontend_aesthetics>
Avoid generic, cookie-cutter "AI slop" UI patterns. Design with intentional visual craft:
- Hierarchy & Surface: Use clear tonal surface contrast and spacing rhythm instead of slapping 1px borders around every box.
- Typography: Pair expressive display/heading scale with comfortable reading line-height and tabular numerals for metrics.
- Motion: Separate spatial motion (subtle spring/decelerate transforms) from opacity fades; respect `prefers-reduced-motion`.
- Responsive & A11y: Ensure mobile touch targets (>= 44px), keyboard focus-visible rings, and WCAG AA contrast in both light and dark modes.
</frontend_aesthetics>
```

### 20. 遗留代码现代化与坏味道清理

```text
Audit [模块] for structural code smells: god functions, deep nesting, duplicated branches, tight coupling, and magic constants.
Propose a prioritized cleanup plan: what is safe to simplify immediately vs. what requires test coverage first before touching.
```

---

## 六、代码审查、安全审计与交付收尾

### 21. 严苛 Senior Engineer 代码审查（Code Review）

```text
Act as a strict senior staff engineer reviewing this diff (`git diff` / PR):
Skip praise and nitpicks about formatting. Focus exclusively on:
1. Correctness bugs, subtle edge cases, and concurrency/state hazards.
2. Security vulnerabilities, data leaks, and broken error paths.
3. Tight coupling, leaky abstractions, or maintainability traps.
4. Missing tests for changed behavior.
For every finding, cite `file:line`, explain the concrete failure scenario, and give the minimal fix.
```

### 22. 安全专项审计（OWASP Checklist）

```text
Perform a focused security audit on [文件/接口/Diff]:
Check for: injection (SQL/command/XSS/template), broken access control (IDOR, missing authz checks), SSRF, path traversal, prototype pollution, insecure randomness, hardcoded secrets, and unsafe deserialization.
Only report real, exploitable issues with a concrete attack vector and remediation patch.
```

### 23. 高价值回归测试生成

避免 AI 生成“只测 mock 自己”的废话测试。

```text
Write high-signal tests for [模块/函数]:
- Test real observable behavior and state invariants, NOT internal implementation details or mocked tautologies.
- Cover: core path, boundary inputs, invalid/malformed inputs, error propagation, and regression cases.
- Keep each test independent, deterministic, and fast without external network reliance.
```

### 24. 收尾自检与规范化 Commit

```text
Prepare the final changes for commit:
1. Run `git status` and `git diff` to verify only task-relevant files are modified.
2. Ensure no unrelated edits, unused imports, dead code, or temporary artifacts remain.
3. Draft a concise Conventional Commits message (`feat/fix/refactor(scope): summary`) with bullet points explaining *why* the key changes were made.
```

---

## 七、高频组合工作流（一图带走）

把上面的积木按开发节奏串起来，日常 90% 的开发任务都可以收敛为三步：

1. **定边界**：`#1 查证红线` + `#5 Plan-Before-Code` —— 先读源码出方案，确认不跑偏；
2. **稳交付**：`#2 反过度设计` + `#9 通用实现` + `#10 TDD` —— 写最干净的代码并用测试锁死边界；
3. **严把关**：`#21 Senior CR` + `#22 安全审计` + `#24 收尾自检` —— 换个视角挑刺后再提交。

如果你也有顺手好用的私藏 Prompt，欢迎在评论区分享交流！
