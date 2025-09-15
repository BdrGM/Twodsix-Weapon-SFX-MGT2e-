Twodsix Weapon SFX (MGT2e)

Give your Travellers the bang they deserve. Map weapons to Single / Burst / Auto sounds and the module will listen to Twodsix attack chat cards and play the right SFX—no fallback noise, no spammy duplicates, clean volume boosts for quiet files, and a slick, collapsible groups manager.

<img width="1536" height="1024" alt="divide" src="https://github.com/user-attachments/assets/87e967a7-2a91-481b-bc1f-5503c0ddf18d" />
















Table of Contents

Features

Requirements

Installation

Quick Start

Configuration

Groups & Weapon Matching

Volumes with Headroom

How It Works

How to Inspect Flags

Troubleshooting

Credits

License

Links

Features

Per-weapon Groups
Map one or more weapon names to their own Single, Burst, and Auto sound files.

Smart mode detection (Twodsix)
Reads Twodsix flags on attack chat messages:

single

auto-burst → treated as Burst

auto-full → treated as Auto

No fallbacks by design
If a slot is empty, nothing plays. (You asked for silence, you get silence.)

Duplicate-playback protection
Debounces identical events so helper/extra chat cards don’t re-trigger audio.

Volumes with real headroom
UI shows 0–100%, but behind the scenes a gain stage allows clean boosts for quiet files—without touching Foundry’s global audio.

Clean UX
Collapsible groups (open-collapsed by default), file pickers to the right, compact toolbar, scrollbar on the manager, auto-save on close (plus a Save button).

Supported formats
.mp3, .ogg, .webm recommended (avoid .m4a).

Requirements

Foundry VTT v13

Twodsix system v6.6.2 or newer (hard requirement)

Installation

Manifest URL (Foundry → Add-on Modules → Install Module):

https://raw.githubusercontent.com/BdrGM/twodsix-mgt2e-weapon-sfx/main/module.json


Or download the ZIP from Releases
.

Enable the module (and Twodsix v6.6.2+) in your world.

Quick Start

Open Game Settings → Module Settings → Twodsix Weapon SFX (MGT2e).

Click Open Groups Manager.

Press Add to create a group.

Set a Group Name and list your Weapon Names (comma-separated, case-insensitive).

Choose audio for Single, Burst, Auto and set each Volume.

Press Save (or simply close; it auto-saves).

Tip: Keep your files inside the world or a public module folder for fast streaming.

Configuration
Groups & Weapon Matching

Each Group contains:

Group Name

Paths for Single, Burst, Auto

Weapon Names: comma-separated list of item names as they appear on the weapon sheet (case-insensitive)

When a shot happens, the module finds the first group whose list contains the weapon name and plays the sound for the detected mode. If that mode is blank, it plays nothing.

Volumes with Headroom

The slider shows 0–100% to match expectations.

Internally, a gain node can push above 100% to cleanly boost quiet assets.

These sliders only affect this module’s playback—they do not touch other Foundry audio.

How It Works

On attack chat cards, read Twodsix flags:

attackType: "single" | "auto-burst" | "auto-full"

Resolve the weapon name (from flags or posted item).

Match the first applicable group by weapon name.

Play the corresponding sound (with per-mode volume), once, with duplicate prevention.

How to Inspect Flags

If a mode sounds wrong, check the last chat message in the browser console:

const msg = game.messages.contents.at(-1);
console.log('twodsix flags:', msg?.flags?.twodsix);


You should see attackType equal to "single", "auto-burst", or "auto-full".

Troubleshooting

Burst/Auto plays the wrong clip

Verify the attackType flag using the snippet above.

Confirm weapon names match your Weapon Names list (case-insensitive, comma-separated).

Make sure Burst and Auto paths are set in the group (no path = silence).

No audio

Use .mp3, .ogg, or .webm.

Check browser autoplay/audio unlock (click once/play any sound in Foundry).

Ensure Twodsix is v6.6.2+ and the module is enabled.

Volume too low

Push the slider to 100%. If that’s still quiet, normalize the file (e.g., Audacity).
(The module already provides clean headroom, but a properly mastered asset always wins.)

Credits

Author: BdGM

Twodsix (MGT2e) system by the Twodsix team

Thanks to everyone who tested UI tweaks, collapse behaviors, and chat-flag edge cases

License

MIT © BdGM
Audio assets are not included—use your own licensed sounds.

Links

Repo: https://github.com/BdrGM/twodsix-mgt2e-weapon-sfx

Manifest: https://raw.githubusercontent.com/BdrGM/twodsix-mgt2e-weapon-sfx/main/module.json

Releases: https://github.com/BdrGM/twodsix-mgt2e-weapon-sfx/releases

Find me on Discord
