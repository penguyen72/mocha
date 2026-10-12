# Save the Date — record player

Status: approved by the couple on 2026-10-02.

## Goal

The opened date card gets a small vinyl record in its open top-right corner. Tapping it plays the
couple's song, **"Dream" by Suzy & Baekhyun** (2016), from an audio file served by the app. The
same pass lines the "Save / the Date" lockup up with the first date of the
week below it.

## Why a self-hosted file

The first version played the official YouTube video (`WfYgbFBFe1E`) in a visible mini player,
which YouTube's API policies require: they forbid playing from "a player that is not displayed in
the page", and require a player viewport of at least 200 x 200 px. On 2026-10-02 the couple
decided the popup got in the way of the card.

Hiding the YouTube player would have broken those policies, and it played unreliably on phones,
where browsers block sound that starts after the API loads. So the couple bought the song on the
iTunes Store, and the app serves that file itself from `public/dream.m4a`.

A store purchase is a personal-use licence. Serving the file on a public site is a copy the
licence does not cover; the couple accepted that risk for a small personal site. The file is
re-encoded before it is committed so that the purchaser details iTunes embeds in it are not
published.

## Behaviour

| Moment | Record |
| --- | --- |
| Card opened | Still, play icon, "tap to play" label; the song is not downloaded (`preload="none"`) |
| First tap | Song starts; the record spins and shows a pause icon, "tap to pause" |
| Tap while playing | Song pauses; the record holds its angle, play icon, "tap to play" |
| Tap while paused | Song resumes from where it stopped |
| Song ends | Loops from the top |
| Browser refuses playback | Record stays on its play icon; another tap tries again |

- The record is the only control. The `<audio>` element has no controls and is not visible.
- Playback is started directly in the tap handler, so it stays inside the user gesture browsers
  require for sound.
- Reduced motion: the record does not spin.

## Privacy and loading

- No third-party code or requests. The song is the only extra download, and only after a tap.

## Layout

- The record sits inside the date card's top-right corner, about 38 design units across, rotating
  with the card. It replaces no existing ornament.
- "Tap to play" / "Tap to pause" is set in small spaced capitals on an arc just outside the rim,
  centred on the record's south-east side, with a small gap between the letters and the vinyl.

## Accessibility

- The record is a real `<button>`, outside the card's `aria-hidden` typography, labelled "Play
  Dream by Suzy & Baekhyun" or "Pause Dream by Suzy & Baekhyun".
- The `<audio>` element has no controls, so it adds nothing to the tab order.
