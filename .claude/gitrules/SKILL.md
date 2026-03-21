---
name: gitrules
description: Critical Git safety rules to prevent destructive operations. Use whenever performing git operations, reverting changes, or managing commits. Prevents accidental loss of work.
---

## Critical Git Safety Protocol

NEVER USE `git checkout` TO REVERT CHANGES.

**MANDATORY GIT SAFETY RULES:**

- **NEVER run `git checkout -- <file>`** without first examining what you're about to destroy
- **ALWAYS use `git diff <file>`** to see exactly what changes will be lost
- **MANUALLY undo changes** by editing files to revert specific problematic sections
- **Preserve valuable work**: if user says changes are bad, ask which specific parts to revert
- **`git checkout` destroys ALL changes**: this can eliminate hours of valuable progress
- **When user asks to "undo" changes**: Read the current file, identify problematic sections, and manually edit to fix them

**Why this matters**: Using `git checkout` blindly can destroy sophisticated implementations, complex prompts, provider-specific logic, and other valuable work that took significant time to develop.

## Git Safety Rules

**NEVER run these commands without explicit user approval:**

- `git reset --hard`: Destroys uncommitted changes permanently
- `git checkout -- .`: Discards all working directory changes
- `git clean -fd`: Deletes untracked files permanently
- `git stash drop`: Deletes stashed changes

**ALWAYS before any git operation:**

1. Run `git status` first to check for uncommitted changes
2. If there are uncommitted changes, STOP and ASK the user before proceeding
3. Suggest `git stash` to preserve changes if needed
4. Never create a commit unless the user explicitly asked for one

**If user asks to "revert" something:**

1. First clarify: revert committed changes or uncommitted changes?
2. Show what will be affected before doing anything
3. Get explicit confirmation for destructive operations

This rule exists because careless git operations destroyed 2 days of work.
