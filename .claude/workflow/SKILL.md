---
name: workflow
description: Project workflow for PRDs, task tracking, changelog sync, and documentation updates. Use for any non-trivial task that spans multiple steps, touches several files, changes architecture, or needs project tracking updates. Also activates with @update to sync task.md, changelog.md, and files.md after completing work.
---

# Project Workflow Skill

Use this skill for any non trivial task that spans multiple steps, touches several files, changes architecture, or needs project tracking updates.

Activate with: `@update` (for docs sync only)

## Triage first

Before changing code:

1. Identify what is missing, broken, or incomplete.
2. Theorize a few likely causes or approaches.
3. Narrow to the most likely plan.
4. Ask if anything important is still unclear.

Skip the long process only for obvious one file fixes like typos or tiny copy changes.

## PRD rules

Create a PRD before non trivial work.

- Path: `prds/<feature-or-problem-slug>.md`
- Extension: `.md`
- Include:
  - problem
  - root cause for bugs
  - proposed solution
  - files to change
  - edge cases
  - verification steps
  - task completion log

Add metadata at the top:

- `Created: YYYY-MM-DD HH:mm UTC`
- `Last Updated: YYYY-MM-DD HH:mm UTC`
- `Status: Draft | In Progress | Done`

## Task tracking

Update `task.md` as the work moves forward.

- Put new work under `## to do`
- Move finished work to `## completed`
- Add timestamps in `YYYY-MM-DD HH:mm UTC`
- Do not mark a task done until it has been verified
- Keep task notes short but specific enough for the next session

When useful, include:

- the PRD path
- the files touched
- the verification command or outcome

## Docs sync after changes

After each feature or fix, sync the project docs:

- `task.md`
- `changelog.md`
- `files.md`

For `changelog.md`:

- use Keep a Changelog structure
- get real dates from `git log --date=short -n 10`
- add timestamps when helpful

For `files.md`:

- add new files
- update descriptions that changed
- keep descriptions brief and concrete

## Execution style

- Use subagents for research or parallel analysis when the task is large enough to benefit.
- Use one focused subagent per task.
- Stop and re plan if the work stops making sense.
- Keep the change set tight.
- Ask whether a staff engineer would approve the result before calling it done.

## Learning loop

If the user corrects a repeated pattern, record the lesson in `prds/lessons.md` so the mistake does not come back.
