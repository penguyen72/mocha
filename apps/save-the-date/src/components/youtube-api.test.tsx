import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { YouTubeNamespace } from "./youtube-api";

const API_SRC = "https://www.youtube.com/iframe_api";

function apiScripts() {
  return document.querySelectorAll(`script[src="${API_SRC}"]`);
}

const fakeYT = { Player: vi.fn(), PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 } } as unknown as YouTubeNamespace;

/** The loader caches its promise per module, so each test gets a fresh copy. */
async function freshLoader() {
  vi.resetModules();
  return (await import("./youtube-api")).loadYouTubeApi;
}

describe("loadYouTubeApi", () => {
  beforeEach(() => {
    delete window.YT;
    delete window.onYouTubeIframeAPIReady;
  });

  afterEach(() => {
    for (const script of apiScripts()) script.remove();
  });

  it("injects the IFrame API script once and resolves when YouTube reports ready", async () => {
    const loadYouTubeApi = await freshLoader();

    const first = loadYouTubeApi();
    const second = loadYouTubeApi();
    expect(apiScripts()).toHaveLength(1);

    window.YT = fakeYT;
    window.onYouTubeIframeAPIReady?.();

    await expect(first).resolves.toBe(fakeYT);
    await expect(second).resolves.toBe(fakeYT);
  });

  it("resolves straight away when the API is already on the page", async () => {
    const loadYouTubeApi = await freshLoader();
    window.YT = fakeYT;

    await expect(loadYouTubeApi()).resolves.toBe(fakeYT);
    expect(apiScripts()).toHaveLength(0);
  });

  it("rejects when the script fails to load, and tries again on the next call", async () => {
    const loadYouTubeApi = await freshLoader();

    const failed = loadYouTubeApi();
    apiScripts()[0]?.dispatchEvent(new Event("error"));
    await expect(failed).rejects.toThrow();
    expect(apiScripts()).toHaveLength(0);

    void loadYouTubeApi();
    expect(apiScripts()).toHaveLength(1);
  });
});
