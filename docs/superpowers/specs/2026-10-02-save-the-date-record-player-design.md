# Save the Date — record player

Status: approved by the couple on 2026-10-02.

## Goal

The opened date card gets a small vinyl record in its open top-right corner. Tapping it plays the
couple's song, **"Dream" by Suzy & Baekhyun** (2016), from its official YouTube video
(`WfYgbFBFe1E`). The same pass lines the "Save / the Date" lockup up with the first date of the
week below it.

## Why a visible player

The couple chose the official YouTube video over self-hosting an audio file, so the site never
hosts a copy of the song. YouTube's API policies then set the shape of the feature:

- [Developer Policies](https://developers.google.com/youtube/terms/developer-policies) forbid
  separating a video's audio from its video and playing from "a player that is not displayed in
  the page".
- [Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)
  requires an embedded player viewport of at least 200 x 200 px with nothing drawn over it.

So the record is the control, and a visible mini player carries the video.

## Behaviour

| Moment | Record | Mini player |
| --- | --- | --- |
| Card opened | Still, play icon, "tap to play" label | Not rendered; nothing from YouTube is loaded |
| First tap | Spins once YouTube reports playback | Slides up in the bottom-left corner of the screen and starts the video |
| Tap while playing | Stops spinning, play icon, "tap to play" | Video pauses |
| Tap while paused | Spins, pause icon, "tap to pause" | Video resumes |
| Song ends | Keeps spinning | Video restarts from the top (loops) |
| Close (x) | Still, play icon | Player destroyed and removed |

- The record follows YouTube's own state events, so using the player's controls directly keeps
  the record in sync.
- Some browsers block playback started after the API finishes loading. The player is visible, so
  the guest can press play in it; the record then follows.
- Reduced motion: the record does not spin and the player does not slide.

## Privacy and loading

- The IFrame API script (`https://www.youtube.com/iframe_api`) is injected only on the first tap,
  once per page.
- The player uses `https://www.youtube-nocookie.com` as its host.
- No other third-party code is added.

## Layout

- The record sits inside the date card's top-right corner, about 38 design units across, rotating
  with the card. It replaces no existing ornament.
- "Tap to play" / "Tap to pause" is set in small spaced capitals on an arc just outside the rim,
  centred on the record's south-east side, with a small gap between the letters and the vinyl.
- The mini player is portaled to `<body>`. The date card and the stage frame are both transformed,
  and a transformed ancestor would otherwise trap a `position: fixed` element.
- The panel is ivory with a song title and a close button in a header above the video, never on
  top of it. The video is 200 px tall and at least 200 px wide.

## Accessibility

- The record is a real `<button>`, outside the card's `aria-hidden` typography, labelled "Play
  Dream by Suzy & Baekhyun" or "Pause Dream by Suzy & Baekhyun".
- The panel is a labelled `region`; its close button is labelled "Close the music player".
