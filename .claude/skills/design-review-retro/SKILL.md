---
name: design-review-retro
description: Use when a session that changed or reviewed the save the date site is wrapping up, or when the user asks to update, improve, or teach the design-review skill, or to record a design constraint or lesson for future sessions.
---

# Design review retro

Turn what this session learned into edits to `.claude/skills/design-review/`, so the next review catches it. The output is a small, evidenced diff to that skill, or a plain statement that nothing qualified.

## 1. Collect candidates from this session only

Look back over the conversation and the session's diff for:

- **Design rules the user stated or corrected**: "keep X", "never Y", "that looks wrong because…".
- **Issues found in the app**: what a `design-review` run, a screenshot, or the user caught that the checklist did not already cover.
- **Checks that are wrong or stale**: routes, copy, labels, or reference screenshots that no longer match the app.
- **Verification gotchas**: a tool or technique that gave a misleading result, and what worked instead.

Each candidate needs a source you can point to: the user's words, or something observed in the running app or the code. Leave out anything you would have to guess.

## 2. Keep only what will recur

A candidate becomes an edit when all of these hold:

- It applies to future changes, not only to this one.
- It can be checked as pass or fail.
- The checklist does not already say it, and tests or types do not already enforce it.

## 3. Write the edit

- Put each rule in the matching section of `design-review/SKILL.md` as one checkable bullet, written like the bullets around it.
- Rewrite an existing bullet when the rule refines it. Delete a bullet the session proved wrong.
- Replace a file in `references/` only when the user approved a change to that settled screen. Take the screenshot from a production build, at the same viewport as the image it replaces.
- Keep `design-review/SKILL.md` under about 120 lines. If an edit would push it over, merge overlapping bullets first.

## 4. Get approval, then land it

Show the user the proposed diff. Under it, list each changed bullet with its source from step 1. Apply only what they approve.

Changes land through a pull request, per `AGENTS.md`:

- If the session is already on a branch for the change that taught the lesson, commit there as a separate commit.
- Otherwise, start a new branch and open a PR.

## Report

Give one line per edit with its source, then the commit or PR link. If nothing qualified, say so and change nothing.
