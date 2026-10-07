#!/usr/bin/env node
// Compare two capture.mjs runs and print what changed, per route and width.
//
//   node compare.mjs tmp/design/base/layout.json tmp/design/head/layout.json
//
// Reports font changes, moves and resizes (grouped, since children move with their
// parent), lost centering, removed or added elements, and horizontal overflow. It lists
// differences only; deciding whether each one was requested is the reviewer's job.

import { readFileSync } from "node:fs";

const TOLERANCE_PX = 2;

const [basePath, headPath] = process.argv.slice(2);
if (!basePath || !headPath) {
  console.error("usage: compare.mjs BASE/layout.json HEAD/layout.json");
  process.exit(2);
}
const base = JSON.parse(readFileSync(basePath, "utf8"));
const head = JSON.parse(readFileSync(headPath, "utf8"));

const label = (el) => (el.text ? `"${el.text}"` : el.key.split(">").slice(-2).join(">"));
const near = (a, b) => Math.abs(a - b) <= TOLERANCE_PX;

let findings = 0;
const out = [];
const report = (line) => {
  findings++;
  out.push(`- ${line}`);
};

for (const after of head.captures) {
  const before = base.captures.find((c) => c.route === after.route && c.width === after.width);
  out.push(`\n## ${after.route} @ ${after.width}px  (${after.screenshot})`);
  const startCount = findings;

  if (after.viewport.width !== after.width) {
    report(`viewport is ${after.viewport.width}px, not ${after.width}px; this capture is not valid`);
  }
  // Base and head run on different ports, so compare errors without the origin.
  const baseErrors = new Set((before?.errors ?? []).map((e) => e.replaceAll(base.origin, "")));
  for (const error of after.errors ?? []) {
    const relative = error.replaceAll(head.origin, "");
    report(baseErrors.has(relative) ? `${relative} (already in base)` : relative);
  }
  if (after.scrollWidth > after.viewport.width) {
    const was = before && before.scrollWidth > before.viewport.width ? " (already overflowed before)" : "";
    report(`horizontal overflow: page is ${after.scrollWidth}px wide in a ${after.viewport.width}px viewport${was}`);
  }
  for (const el of after.elements) {
    const tag = el.key.split(">").pop().split(":")[0];
    if (/^(input|textarea|select)$/.test(tag) && el.font && parseFloat(el.font.size) < 16) {
      report(`form field ${label(el)} has ${el.font.size} text; iOS zooms in on fields under 16px`);
    }
  }

  if (!before) {
    out.push("- no base capture for this screen; review the screenshot by eye");
    continue;
  }

  const beforeByKey = new Map(before.elements.map((el) => [el.key, el]));
  const afterKeys = new Set(after.elements.map((el) => el.key));
  const moves = new Map();

  for (const el of after.elements) {
    const prev = beforeByKey.get(el.key);
    if (!prev) {
      report(`added: ${label(el)} at (${el.x}, ${el.y}) ${el.w}×${el.h}`);
      continue;
    }
    if (el.text !== prev.text) report(`text changed: "${prev.text}" → "${el.text}"`);
    if (el.font && prev.font) {
      for (const prop of Object.keys(el.font)) {
        if (el.font[prop] !== prev.font[prop]) {
          report(`font ${prop} changed on ${label(el)}: ${prev.font[prop]} → ${el.font[prop]}`);
        }
      }
    }
    const dx = el.x - prev.x;
    const dy = el.y - prev.y;
    if (!near(dx, 0) || !near(dy, 0)) {
      const k = `${dx},${dy}`;
      if (!moves.has(k)) moves.set(k, []);
      moves.get(k).push(el);
    }
    if (!near(el.w, prev.w) || !near(el.h, prev.h)) {
      report(`resized: ${label(el)} ${prev.w}×${prev.h} → ${el.w}×${el.h}`);
    }
    if (near(prev.centerOffset, 0) && !near(el.centerOffset, 0)) {
      report(`no longer centered: ${label(el)} is ${el.centerOffset}px off the viewport center`);
    }
  }
  for (const [k, els] of moves) {
    const [dx, dy] = k.split(",").map(Number);
    const dir = [dx && `${Math.abs(dx)}px ${dx > 0 ? "right" : "left"}`, dy && `${Math.abs(dy)}px ${dy > 0 ? "lower" : "higher"}`]
      .filter(Boolean)
      .join(", ");
    const sample = els.slice(0, 3).map(label).join(", ");
    report(`moved ${dir}: ${els.length} element${els.length > 1 ? "s" : ""} (${sample}${els.length > 3 ? ", …" : ""})`);
  }
  for (const prev of before.elements) {
    if (!afterKeys.has(prev.key)) report(`removed: ${label(prev)}`);
  }

  if (findings === startCount) out.push("- no differences");
}

console.log(`# Layout diff: ${findings} difference${findings === 1 ? "" : "s"}`);
console.log(out.join("\n"));
