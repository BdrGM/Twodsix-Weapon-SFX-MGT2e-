# Twodsix Weapon SFX (MGT2e)

Give your Travellers the **bang** they deserve. Map weapons to **Single / Burst / Auto** sounds and the module listens to Twodsix attack chat cards and plays the **right SFX**—no fallback noise, no duplicates, clean volume boosts for quiet files, and a slick, collapsible Groups Manager.

<p align="center">
  <img alt="hero" src="https://github.com/user-attachments/assets/87e967a7-2a91-481b-bc1f-5503c0ddf18d" width="820">
</p>

<p align="center">
  <a href="https://github.com/BdGM/twodsix_mgt2e_weapon_sfx/releases">
    <img alt="release" src="https://img.shields.io/github/v/release/BdGM/twodsix_mgt2e_weapon_sfx?style=flat-square&display_name=tag&sort=semver">
  </a>
  <img alt="foundry" src="https://img.shields.io/badge/Foundry-v13-orange?style=flat-square">
  <img alt="license" src="https://img.shields.io/badge/License-MIT-green?style=flat-square">
  <a href="https://github.com/BdGM/twodsix_mgt2e_weapon_sfx/releases">
    <img alt="downloads" src="https://img.shields.io/github/downloads/BdGM/twodsix_mgt2e_weapon_sfx/total?style=flat-square&label=downloads">
  </a>
  <img alt="requires" src="https://img.shields.io/badge/Requires-Twodsix%20v6.6.2%2B-blue?style=flat-square">
  <a href="https://github.com/BdGM/twodsix_mgt2e_weapon_sfx/stargazers">
    <img alt="stars" src="https://img.shields.io/github/stars/BdGM/twodsix_mgt2e_weapon_sfx?style=flat-square">
  </a>
  <a href="https://github.com/BdGM/twodsix_mgt2e_weapon_sfx/issues">
    <img alt="issues" src="https://img.shields.io/github/issues/BdGM/twodsix_mgt2e_weapon_sfx?style=flat-square">
  </a>
  <a href="https://github.com/BdGM/twodsix_mgt2e_weapon_sfx/commits/main">
    <img alt="last-commit" src="https://img.shields.io/github/last-commit/BdGM/twodsix_mgt2e_weapon_sfx?style=flat-square">
  </a>
</p>

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Groups & Weapon Matching](#groups--weapon-matching)
  - [Volumes with Headroom](#volumes-with-headroom)
- [How It Works](#how-it-works)
- [How to Inspect Flags](#how-to-inspect-flags)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)
- [License](#license)
- [Links](#links)

---

## Features

- **Per-weapon Groups**  
  Map one or more weapon names to their own **Single**, **Burst**, and **Auto** sound files.

- **Smart mode detection (Twodsix)**  
  Reads Twodsix flags on attack chat messages:
  - `single`
  - `auto-burst` → plays **Burst**
  - `auto-full` → plays **Auto**

- **No fallbacks by design**  
  If a slot is empty, nothing plays. (Silence means silence.)

- **Duplicate-playback protection**  
  Debounces identical events so helper/secondary chat cards don’t retrigger audio.

- **Volumes with real headroom**  
  UI shows **0–100%**, but behind the scenes a gain stage allows clean boosts for quiet files—without touching Foundry’s global audio.

- **Clean UX**  
  Collapsible groups (open **collapsed** by default), file pickers on the right, compact toolbar, scrollbar on the manager, and **auto-save on close** (with a Save button if you want it).

- **Supported formats**  
  `.mp3`, `.ogg`, `.webm` recommended (avoid `.m4a`).

---

## Requirements

- **Foundry VTT v13**
- **Twodsix system v6.6.2 or newer** ✅ _(hard requirement)_

---

## Installation

**Manifest URL** (Foundry → _Add-on Modules_ → _Install Module_):

```
https://raw.githubusercontent.com/BdGM/twodsix_mgt2e_weapon_sfx/main/module.json
```

Or download the ZIP from **Releases**.

Enable the module (and Twodsix v6.6.2+) in your world.

---

## Quick Start

1. Open **Game Settings → Module Settings → Twodsix Weapon SFX (MGT2e)**.  
2. Click **Open Groups Manager**.  
3. Press **Add** to create a group.  
4. Set a **Group Name** and list your **Weapon Names** (comma-separated, case-insensitive).  
5. Choose audio for **Single**, **Burst**, **Auto** and set each **Volume**.  
6. Press **Save** (or simply **close**; it auto-saves).

> **Tip:** Keep files in your world or a public module folder for fast streaming.

---

## Configuration

### Groups & Weapon Matching

Each **Group** contains:

- **Group Name**  
- Paths for **Single**, **Burst**, **Auto** (with file picker buttons on the right)  
- **Weapon Names**: comma-separated list of item names as they appear on the weapon sheet (case-insensitive)

When a shot happens, the module finds the **first** group whose list contains the weapon name and plays the sound for the detected mode.  
If that mode’s path is blank, it plays **nothing**.

### Volumes with Headroom

- The slider shows **0–100%** to match expectations.  
- Internally, a gain node can push above 100% to **cleanly boost** quiet assets.  
- These sliders **only** affect this module’s playback—**not** other Foundry audio.

---

## How It Works

1. On **attack** chat cards, read Twodsix flags:  
   - `attackType: "single" | "auto-burst" | "auto-full"`
2. Resolve the weapon name (from flags or posted item).
3. Match the first applicable group by weapon name.
4. Play the corresponding sound (with per-mode volume), **once**, with duplicate prevention.

---

## How to Inspect Flags

If a mode sounds wrong, check the last chat message in the browser console:

```js
const msg = game.messages.contents.at(-1);
console.log('twodsix flags:', msg?.flags?.twodsix);
```

You should see `attackType` equal to `"single"`, `"auto-burst"`, or `"auto-full"`.

---

## Troubleshooting

**Burst/Auto plays the wrong clip**  
- Verify the **attackType** flag using the snippet above.  
- Confirm weapon names match your **Weapon Names** list (case-insensitive, comma-separated).  
- Make sure **Burst** and **Auto** paths are set in the group (no path = silence).

**No audio**  
- Use `.mp3`, `.ogg`, or `.webm`.  
- Check browser autoplay/audio unlock (click once/play any sound in Foundry).  
- Ensure **Twodsix v6.6.2+** and this module are enabled.

**Volume too low**  
- Push the slider to 100%. If that’s still quiet, normalize the file (e.g., Audacity).  
  *(The module already provides clean headroom, but a properly mastered asset always wins.)*

---

## Credits

- **Author:** BdGM  
- **Twodsix (MGT2e)** system by the Twodsix team  
- Thanks to everyone who tested UI tweaks, collapse behaviors, and chat-flag edge cases

---

## License

**MIT** © BdGM  
Audio assets are **not** included—use your own licensed sounds.

---

## Links

- **Repo:** <https://github.com/BdGM/twodsix_mgt2e_weapon_sfx>  
- **Manifest:** <https://raw.githubusercontent.com/BdGM/twodsix_mgt2e_weapon_sfx/main/module.json>  
- **Releases:** <https://github.com/BdGM/twodsix_mgt2e_weapon_sfx/releases>

## Find me on Discord

[![Discord Banner](https://github.com/user-attachments/assets/33a873fb-e502-4d80-a906-354334b5e704)](https://discord.gg/yRFSj7t9hk)
