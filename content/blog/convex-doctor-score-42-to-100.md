---
title: "How convex-doctor took markdown.fast from 42 to 100"
description: "I had the most stars on the convex-doctor benchmark and the worst score. Here's how I fixed 364 findings across 17 passes to reach a perfect 100."
date: "2026-03-20"
slug: "convex-doctor-score-42-to-100"
published: true
tags: ["convex", "developer-tools", "code-quality", "static-analysis"]
readTime: "7 min read"
featured: true
blogFeatured: true
showImageAtTop: true
featuredOrder: 1
authorName: "Wayne Sutton"
authorImage: "/images/authors/markdown.png"
image: "/images/convex-doctor-before-after.png"
excerpt: "Most starred project on the benchmark. Worst score. Here's what happened and how convex-doctor helped me fix everything."
docsSection: false
---

# How convex-doctor took markdown.fast from 42 to 100

Full disclosure up front: this post was 100% written by Claude Opus 4.6 in Cursor and proofed by a human. Now you know.

I built [markdown.fast](https://www.markdown.fast/) on Convex over the past several months. Most of the codebase was written with AI coding agents in Cursor, switching between models depending on the task. It syncs markdown from the terminal, serves it through a real-time database, and handles everything from RSS feeds to AI chat. The codebase grew organically. Features landed fast. The code worked. I shipped.

Then I saw the benchmark.

![convex-doctor benchmarks showing markdown-site at 42/100](/images/convex-doctor-benchmarks.png)

That's the [convex-doctor](https://github.com/nooesc/convex-doctor) benchmark table. Eighteen open-source Convex projects, ranked by score. markdown-site sits at the very bottom. 42 out of 100. 73 errors. 243 warnings. 48 infos. 364 total findings.

And the project with the most GitHub stars in the entire list? Also mine. 550 stars. Dead last on code health.

## The Convex DevX meeting

This came up during a Convex DevX meeting. Mike pulled up the convex-doctor benchmarks. There it was on screen for everyone: markdown-site, the project with the biggest community, scoring worse than projects with 1 star.

I'm not going to pretend that didn't sting.

I've been building with Convex since the early days. The framework has real users. People fork it. People build on it. But the codebase had accumulated months of organic growth without any static analysis pass. Features got shipped fast, patterns got copied without questioning them, and the internal architecture reflected "whatever worked at the time" more than "what's correct."

The numbers made that painfully obvious. Not in a vague way. In a 73 errors, 243 warnings, dead-last-on-the-leaderboard way.

So I decided to fix it. All of it.

## What is convex-doctor

[convex-doctor](https://github.com/nooesc/convex-doctor) is a static analysis CLI for Convex backends. Think ESLint, but purpose-built for Convex. It parses your `convex/` directory and runs 72 rules across seven categories:

- **Security** (1.5x weight): Missing validators, auth checks, hardcoded secrets, internal API misuse
- **Correctness** (1.5x weight): Unwaited promises, deprecated APIs, side effects in queries, `Date.now()` in queries
- **Performance** (1.2x weight): Unbounded `.collect()`, missing indexes, N+1 patterns, filter without index
- **Schema** (1.0x weight): Deep nesting, redundant indexes, optional field handling
- **Architecture** (0.8x weight): Large handlers, monolithic files, duplicated auth patterns
- **Configuration** (1.0x weight): Missing convex.json, auth config, generated code
- **Client-side** (1.0x weight): Mutation in render, unhandled loading states

You run it with `npx convex-doctor` from your project root. Two seconds later you know exactly where your Convex backend hurts. The output gives you file paths, line numbers, and specific rule IDs for every finding.

The scoring is weighted. Security and correctness errors hit your score harder than architecture warnings. That matters because it forces you to fix the stuff that actually affects your users first.

## The 17 pass journey from 42 to 100

![Before and after: convex-doctor score went from 42/100 Critical to 100/100 Healthy](/images/convex-doctor-before-after.png)

I didn't fix everything in one sitting. This took 17 separate passes over the codebase, each one focused on a specific category of findings. Most of the heavy refactoring was done with Claude Opus 4.6 in Cursor's agent mode. I'd feed it the convex-doctor output, point it at the relevant files, and let it propose fixes. For some passes I switched to GPT Codex 5.3, which handled the more mechanical pattern-matching fixes well. Every pass ended with a verification cycle: `npx convex codegen`, `npm run build`, then `npx convex-doctor` again to confirm the score moved.

**Passes 1 through 3** tackled security and correctness. The biggest wins came from adding auth to HTTP endpoints, converting public `api.*` server-to-server calls to `internal.*`, and removing `Date.now()` from query functions. That last one is subtle. Convex queries need to be deterministic for caching and reactivity to work. `Date.now()` breaks that contract. The fix was passing timestamps as arguments from mutations or the frontend.

**Passes 4 through 7** focused on performance. I replaced unbounded `.collect()` calls with bounded `.take(n)` reads. Converted public actions (called directly from the browser) into mutation-scheduled internal actions. Batched loop-scheduled mutations into single batch calls. The score jumped from 68 to 78 in this stretch.

**Passes 8 through 12** got into the structural work. RSS handlers moved from exported `httpAction` functions to helper functions wrapped at route registration. The URL import flow became a queued job with a persistent status table. Semantic search followed the same pattern. Each conversion removed the "action from client" warning and added proper job state tracking.

**Passes 13 through 16** were the detail work. Newsletter actions got batched internal queries instead of four sequential `ctx.runQuery` calls. Auth component references moved to helper functions that avoid double `runQuery` hops. View count lookups switched from `.first()` to `.unique()` where the data model guaranteed one row per key.

**Pass 17** was the final push. I extracted helper functions from the remaining large handlers in `contactActions.ts` and `stats.ts`, added a missing `_storage` foreign key index, and configured `convex-doctor.toml` to suppress the findings that represented intentional design choices rather than problems.

That last point matters. Not every finding is a bug. Some are design trade-offs. Having 94 optional fields in your schema is a valid choice when your content model is markdown frontmatter with dozens of possible metadata fields. Per-handler auth checks are intentional when each handler has different auth requirements. The `convex-doctor.toml` config lets you document these decisions and remove the noise.

One thing I noticed across all 17 passes: both Claude Opus and Codex were great at applying the fix patterns once I identified them, but they needed the convex-doctor output to know where to look. Without that specific list of file paths, line numbers, and rule IDs, neither model would have surfaced these issues on their own. Static analysis and AI coding agents are a good pairing. The tool finds the problems. The agent fixes them. You review.

## What actually improved in the codebase

The score is a number. The real value was what changed underneath it.

**Security got tighter.** Every HTTP endpoint now checks auth. Server-to-server calls use `internal.*` references so they can't be hit from the public internet. Public actions that used to run directly from the browser now go through mutation-scheduled internal actions.

**Queries got faster.** Unbounded table scans are gone. Every query uses an index. N+1 patterns in RSS and API endpoints were replaced with batched reads. `Date.now()` was removed from every query function.

**The architecture got cleaner.** Large handlers were broken into focused helper functions. The AI chat action, which was one massive orchestration function, got split into provider modules and helper functions. Import, image generation, and semantic search all follow the same queued-job pattern now.

**The schema got tighter.** Redundant indexes were removed. Foreign key fields got proper indexes. Index naming follows a consistent `by_field` convention.

[markdown.fast](https://www.markdown.fast/) genuinely runs better because of this work. The code is more predictable, easier to debug, and follows patterns that Convex was designed around. That's not marketing speak. I can point to specific queries that no longer scan full tables, specific mutations that no longer race with themselves, and specific endpoints that no longer accept anonymous requests.

## The final score

![convex-doctor 100/100 Healthy](/images/convex-doctor-100.png)

100 out of 100. Zero errors. Zero warnings. 18 infos (structural observations, not problems).

That makes markdown.fast the highest-scoring project on the convex-doctor benchmark. Which is a fun full-circle moment considering it started at the absolute bottom.

## Why you should run convex-doctor on your project

If you're building on Convex, run it right now:

```bash
npx convex-doctor
```

It takes two seconds. You'll get a score and a list of findings with file paths and line numbers. You don't have to fix everything at once. Start with the security errors. Then correctness. Then performance. Work through it in passes.

The tool catches things you won't notice during normal development. `Date.now()` in a query looks harmless until you realize it breaks reactive subscriptions. A public action called from the browser works fine until someone scripts it without auth. An unbounded `.collect()` performs great with 50 rows and falls apart at 50,000.

You can configure suppressions in `convex-doctor.toml` for findings that don't apply to your project. The tool respects that. It's not dogmatic.

For CI integration, add a `[ci]` section with `fail_below = 70` (or whatever threshold makes sense) and the CLI will exit with code 1 when your score drops. Two lines of config and you'll never accidentally merge a security regression.

## Thanks to the creator

Big thanks to the creator of [convex-doctor](https://github.com/nooesc/convex-doctor) for building this. The Convex ecosystem needed a tool like this. Something opinionated, fast, and specific to how Convex actually works. Not generic TypeScript linting. Not vague best practices. 72 rules built from real patterns in real Convex codebases.

The benchmark table on the README is both motivating and humbling. Seeing your project ranked against others with a concrete score creates the right kind of pressure to actually do the work. I'm proof of that.

If you want to check it out: [github.com/nooesc/convex-doctor](https://github.com/nooesc/convex-doctor)

Star it. Run it. Fix what it finds. Your codebase will be better for it.

## The scoreboard now

When convex-doctor runs its next benchmark pass against open-source Convex projects, markdown.fast won't be at the bottom anymore. It'll be at the top. Same 550 stars, but now with a score that matches the community trust people have placed in the project.

That feels right. If people are going to fork your code and build on it, the least you can do is make sure the foundation is solid. convex-doctor gave me the feedback loop to actually do that.

If you're building on Convex, go run it. You might not like what you see at first. I didn't. But you'll like what your codebase looks like after you fix it.

_This post was 100% written by Claude Opus 4.6 in Cursor and proofed by a human._
