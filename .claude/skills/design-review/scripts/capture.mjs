#!/usr/bin/env node
// Capture layout and typography for each route at each width, plus a screenshot.
//
//   node capture.mjs --origin http://localhost:3002 --routes /,/#open --out tmp/design/head
//
// Writes <out>/layout.json and <out>/<route>@<width>.png. Drives headless Chrome over the
// DevTools protocol with device emulation, because `--window-size` cannot go below 500px.
// Needs Node 22+ (global WebSocket) and Google Chrome (override with CHROME_PATH).

import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DEFAULT_WIDTHS = [360, 390, 430, 768, 1024, 1440];
const HEIGHT = 900;
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, "")] = argv[i + 1];
  if (!args.origin || !args.routes || !args.out) {
    console.error("usage: capture.mjs --origin URL --routes /,/a --out DIR [--widths 360,1440]");
    process.exit(2);
  }
  return {
    origin: args.origin.replace(/\/$/, ""),
    routes: args.routes.split(","),
    widths: args.widths ? args.widths.split(",").map(Number) : DEFAULT_WIDTHS,
    out: args.out,
  };
}

// Runs inside the page. Records every visible element that renders its own text, plus
// images, form controls, and buttons, keyed by a stable DOM path.
function measurePage() {
  const vw = window.innerWidth;
  const keyOf = (el) => {
    const parts = [];
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const same = [...(n.parentElement?.children ?? [])].filter((c) => c.tagName === n.tagName);
      parts.unshift(`${n.tagName.toLowerCase()}${same.length > 1 ? `:${same.indexOf(n) + 1}` : ""}`);
    }
    return parts.join(">");
  };
  const ownText = (el) =>
    [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
  const elements = [];
  for (const el of document.body.querySelectorAll("*")) {
    const text = ownText(el);
    const media = /^(IMG|SVG|INPUT|TEXTAREA|SELECT|BUTTON|VIDEO|CANVAS)$/i.test(el.tagName);
    const field = /^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName);
    if (!text && !media) continue;
    const style = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || style.visibility === "hidden" || style.opacity === "0") continue;
    if (el.closest("nextjs-portal")) continue;
    elements.push({
      key: keyOf(el),
      text: text.slice(0, 60),
      x: Math.round(r.left + scrollX),
      y: Math.round(r.top + scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
      centerOffset: Math.round(r.left + r.width / 2 - vw / 2),
      font:
        text || field
        ? {
            family: style.fontFamily,
            size: style.fontSize,
            weight: style.fontWeight,
            style: style.fontStyle,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            transform: style.textTransform,
            color: style.color,
            align: style.textAlign,
          }
        : null,
    });
  }
  return {
    viewport: { width: vw, height: window.innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    elements,
  };
}

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), "design-review-chrome-"));
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ]);
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = "";
    chrome.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) resolve(m[1]);
    });
    chrome.on("exit", (code) => reject(new Error(`Chrome exited (${code}) before it was ready`)));
  });
  const close = async () => {
    const exited = new Promise((resolve) => chrome.once("exit", resolve));
    chrome.kill("SIGKILL");
    await exited;
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  };
  return { wsUrl, close };
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else {
      for (const fn of listeners) fn(msg);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const once = (method, sessionId) =>
    new Promise((resolve) => {
      const fn = (msg) => {
        if (msg.method === method && msg.sessionId === sessionId) {
          listeners.delete(fn);
          resolve(msg.params);
        }
      };
      listeners.add(fn);
    });
  return new Promise((resolve) => {
    ws.onopen = () =>
      resolve({
        send,
        once,
        listen: (fn) => listeners.add(fn),
        unlisten: (fn) => listeners.delete(fn),
        close: () => ws.close(),
      });
  });
}

const fileName = (route, width) =>
  `${route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root"}@${width}.png`;

async function main() {
  const { origin, routes, widths, out } = parseArgs(process.argv.slice(2));
  mkdirSync(out, { recursive: true });
  const chrome = await launchChrome();
  const cdp = await connect(chrome.wsUrl);
  const result = { origin, captures: [] };
  try {
    for (const route of routes) {
      for (const width of widths) {
        // A fresh tab per capture so hash routes and client state never carry over.
        const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
        const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
        const send = (m, p) => cdp.send(m, p, sessionId);
        await send("Page.enable");
        await send("Runtime.enable");
        await send("Network.enable");
        const errors = [];
        const failed = new Map();
        const onEvent = (msg) => {
          if (msg.sessionId !== sessionId) return;
          if (msg.method === "Runtime.exceptionThrown") {
            errors.push(`exception: ${msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text}`);
          } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
            errors.push(`console.error: ${msg.params.args.map((a) => a.value ?? a.description).join(" ")}`);
          } else if (msg.method === "Network.requestWillBeSent") {
            failed.set(msg.params.requestId, msg.params.request.url);
          } else if (msg.method === "Network.responseReceived" && msg.params.response.status < 400) {
            failed.delete(msg.params.requestId);
          } else if (msg.method === "Network.responseReceived") {
            errors.push(`HTTP ${msg.params.response.status}: ${msg.params.response.url}`);
            failed.delete(msg.params.requestId);
          } else if (msg.method === "Network.loadingFailed" && !msg.params.canceled) {
            errors.push(`request failed (${msg.params.errorText}): ${failed.get(msg.params.requestId)}`);
          }
        };
        cdp.listen(onEvent);
        await send("Emulation.setDeviceMetricsOverride", {
          width,
          height: HEIGHT,
          deviceScaleFactor: 1,
          mobile: width < 768,
        });
        const loaded = cdp.once("Page.loadEventFired", sessionId);
        await send("Page.navigate", { url: origin + route });
        await loaded;
        // Settle: wait for fonts, jump finite animations to their end state, let layout flush.
        await send("Runtime.evaluate", {
          awaitPromise: true,
          expression: `(async () => {
            await document.fonts.ready;
            await new Promise((r) => setTimeout(r, 500));
            for (const a of document.getAnimations()) { try { a.finish(); } catch {} }
            document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          })()`,
        });
        const { result: measured } = await send("Runtime.evaluate", {
          expression: `(${measurePage.toString()})()`,
          returnByValue: true,
        });
        const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
        const png = fileName(route, width);
        writeFileSync(join(out, png), Buffer.from(shot.data, "base64"));
        cdp.unlisten(onEvent);
        result.captures.push({ route, width, screenshot: png, errors, ...measured.value });
        await cdp.send("Target.closeTarget", { targetId });
      }
    }
  } finally {
    cdp.close();
    await chrome.close();
  }
  writeFileSync(join(out, "layout.json"), JSON.stringify(result, null, 2));
  console.log(`captured ${result.captures.length} screens to ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
