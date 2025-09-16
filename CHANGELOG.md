# Changelog

All notable changes to the **Twodsix Weapon SFX** module are documented here.

## v0.1.2 — 2025-09-16

### Changed
- Removed wildcard / glob / folder path support in sound fields because these did not reliably play for non-GM players. Use exact file paths instead. Mappings that still contain wildcards will be ignored and a warning is shown.
- Updated the Groups UI placeholders to remove any suggestion of wildcard usage.


## v0.1.1 - 2025-09-16

### Added
- **Wildcard / folder support for sound paths**
  - You can now point a group to multiple files without listing them one by one.
  - Supported inputs:
    - **Folder random:** `path/to/folder/` or `path/to/folder/*` → picks a random file in that folder.
    - **Filename glob:** `path/to/folder/pistol*.wav`, `.../shot_??.wav` → matches files by pattern, then picks one at random.
    - **Explicit list:** `random(a.wav|b.wav|c.wav)` or `random(a.wav,b.wav)` → randomly selects from the list.
  - Examples (put in **Single/Burst/Auto** fields):
    - `sounds/ballistics/rifle/single_*.wav`
    - `sounds/pistols/modern/`
    - `random(sounds/energy/laser/single_01.wav|sounds/energy/laser/single_02.wav)`

### Fixed
- **Foundry v12+ deprecation**: Replaced global `AudioHelper` usage with `foundry.audio.AudioHelper` via a safe shim.
  - Resolves the “You are accessing the global `AudioHelper`…” warning.
  - No change required to your saved settings; behavior is unchanged aside from the warning disappearing.
