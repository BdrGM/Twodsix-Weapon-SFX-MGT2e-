# Twodsix Weapon SFX (MGT2e)

Give your Travellers the bang they deserve. Map weapons to **Single / Burst / Auto** sounds and the module will listen to Twodsix attack chat cards and play the **right SFX**—no fallback noise, no spammy duplicates, clean volume boosts for quiet files, and a slick, collapsible Groups Manager.

<p align="center">
  <img src="https://github.com/user-attachments/assets/18b74c21-c503-44da-8dc6-17853b6c72bb" alt="Hero" width="820">
</p>

[![release](https://img.shields.io/github/v/release/BdrGM/twodsix_mgt2e_weapon_sfx?style=flat-square&display_name=tag&sort=semver)](https://github.com/BdrGM/twodsix_mgt2e_weapon_sfx/releases)
![Foundry](https://img.shields.io/badge/Foundry-v13-orange?style=flat-square)
[![License](https://img.shields.io/github/license/BdrGM/twodsix_mgt2e_weapon_sfx?style=flat-square)](./LICENSE)
[![Downloads](https://img.shields.io/github/downloads/BdrGM/twodsix_mgt2e_weapon_sfx/total?style=flat-square&label=downloads)](https://github.com/BdrGM/twodsix_mgt2e_weapon_sfx/releases)
![Requires](https://img.shields.io/badge/Requires-Twodsix%20v6.6.2%2B-blue?style=flat-square)
[![Stars](https://img.shields.io/github/stars/BdrGM/twodsix_mgt2e_weapon_sfx?style=flat-square)](https://github.com/BdrGM/twodsix_mgt2e_weapon_sfx/stargazers)
[![Issues](https://img.shields.io/github/issues/BdrGM/twodsix_mgt2e_weapon_sfx?style=flat-square)](https://github.com/BdrGM/twodsix_mgt2e_weapon_sfx/issues)
[![Last commit](https://img.shields.io/github/last-commit/BdrGM/twodsix_mgt2e_weapon_sfx?style=flat-square)](https://github.com/BdrGM/twodsix_mgt2e_weapon_sfx/commits/main)

> 

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Groups \& Weapon Matching](#groups--weapon-matching)
  - [Volume with Headroom](#volume-with-headroom)
- [How It Works](#how-it-works)
- [How to Inspect Flags](#how-to-inspect-flags)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)
- [License](#license)
- [Links](#links)

---

## Features

- **Per‑weapon sounds** for **Single**, **Burst**, and **Auto** fire
- **No duplicate playback** when chat cards produce multiple events
- **No global fallbacks** – if a sound isn’t set, **silence** is respected
- **Collapsible group editor** (add/delete groups, rename, pick files, confirm deletes)
- **Window resizing + scrolling** for large collections
- **Saved automatically** on close; optional **Save** button remains
- **Volume slider with headroom** (UI says 0–100%, internally lets you boost quiet files beyond 100% without affecting other Foundry audio)
- **Even works for ship weapons
---

## Requirements

- **Foundry VTT v13+**
- **Twodsix System v6.6.2+** (required)
- Audio files in **.mp3** or **.ogg** (Foundry can’t play **.m4a**)

---

## Installation

**Manifest URL** (Foundry → _Add‑on Modules_ → _Install Module_):

```text
https://raw.githubusercontent.com/BdrGM/twodsix_mgt2e_weapon_sfx/main/module.json
```

Or download a version from **[Releases]** and install manually.

---

## Quick Start

1. Open **Game Settings → Configure Settings → Twodsix Weapon SFX (MGT2e)**.
2. Click **Open Groups Manager**.
3. **Add** a group, give it a **Group Name** (e.g., “Laser Rifles”).
4. Pick **Single / Burst / Auto** sound files.
5. In **Weapon Names**, enter comma‑separated weapon names as they appear on attack cards (e.g., `Axe, Test, Laser Rifle`).
6. Close the window (auto‑saves) or click **Save**.
7. Make an attack in Twodsix—sound plays based on the chat card’s **flags.twodsix.attackType**.

---

## Configuration

### Groups & Weapon Matching

Each group contains:
- **Group Name** — purely for your organization.
- **Single / Burst / Auto** — audio file paths for that firing mode.
- **Weapon Names** — comma‑separated, matched against the Twodsix item name in the chat message.

> The module listens to chat cards and reads `flags.twodsix`:
> - `attackType`: `"single"`, `"auto-burst"`, `"auto-full"`
> - `itemUUID` / `itemName`: used to match your group’s weapon names.

If an attack has no configured sound for its mode, **nothing plays** (by design).

### Volume with Headroom

Each mode has its **own volume slider**. The UI shows **0–100%**, but under the hood it can exceed 100% to help with **quiet recordings**. This **does not** change other Foundry audio or global volume—only the module’s playback gain for that sound.

---

## How It Works

- Hooks **Twodsix** chat messages and inspects `flags.twodsix`.
- Normalizes Twodsix firing modes to:
  - `"single"` → **Single**
  - `"auto-burst"` → **Burst**
  - `"auto-full"` → **Auto**
- Looks up the **weapon name** in your groups and chooses the correct sound for the firing mode.
- Uses a **debounce** so the same card doesn’t trigger overlapping SFX (prevents the “single+burst together” problem).
- Plays once per attack with your chosen **per‑mode volume**.

---

## How to Inspect Flags

Open **F12 → Console**, click the chat card, and run:

```js
const last = game.messages.contents.at(-1);
console.log("twodsix flags:", foundry.utils.getProperty(last, "flags.twodsix"));
```

Look for `attackType` and the item name/UUID to help you match your groups.

---

## Troubleshooting

**It plays the wrong sound**  
Double‑check `attackType` values (`single`, `auto-burst`, `auto-full`) and ensure the weapon name in your group **matches exactly** the name on the attack card.

**Burst/Auto also plays Single**  
The module includes a **debounce** to suppress duplicates; if you still hear overlaps, verify there’s only one active copy of the module and you’re not triggering a separate macro that plays audio.

**The first group didn’t save**  
This was fixed in the UI—close the window or hit **Save**; values persist in world settings.

**Volume seems capped**  
The slider reads as **0–100%**, but internally you have **extra headroom** for quiet files. If it’s still too low, normalize your audio in an editor.

**.m4a files don’t play**  
Convert to **.mp3** or **.ogg**.

---

## Credits

- **Author:** BdGM  
- **System:** [Twodsix (Cepheus/Traveller)](https://github.com/xdy/twodsix-foundryvtt)
- **Foundry VTT** by Atropos

---

## License

**MIT** © BdGM

---

## Links

- **Repo:** <https://github.com/BdrGM/twodsix_mgt2e_weapon_sfx>  
- **Manifest:** <https://raw.githubusercontent.com/BdrGM/twodsix_mgt2e_weapon_sfx/main/module.json>  
- **Releases:** <https://github.com/BdrGM/twodsix_mgt2e_weapon_sfx/releases>
