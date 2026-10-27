# Complete cohesive biome replacement

The final revision replaces the mixed environment rendering path with one new atlas per biome. It covers Rotwater Sewers (`sewer` / `drowned`), Blooming Deep (`fungal`), Forgotten Catacombs (`crypt`), and Salt Pits (`mine`), including the tutorial mine. Town, interiors, the separate abbey, characters, and character death art retain their own assets.

## What was inconsistent

The earlier implementation changed floor surfaces and rear-wall decoration, but still drew old wall caps, foreground cutaways, special terrain, decals, room-bank art, mine scenes and gameplay props. Multiple systems could draw different art on the same tile. The user rejected that mixture.

The final implementation has explicit environment ownership. No old environment image may be drawn in a target biome; there is no legacy fallback when a new asset has not loaded. Asset load failures are reported and fail browser validation. Shared old assets remain available only to unrelated locations and character systems. The four previous `*-v2.png` biome atlases and their obsolete packing script have been removed from the active repository.

## One complete kit per biome

Three NEW source sheets were generated as a matched art family: complete terrain, functional props, and modular landmark parts. The builder reads only those three new sheets. It does not import any previous atlas pixels. All forty cells in a biome are normalized to one 96-color palette and packed into a single 512×320 PNG. All runtime sampling disables smoothing.

| Layer | Complete replacement |
|---|---|
| Terrain | Plain/cracked/accent floors, shallow/deep water, pits, stairs, bridge decks, rubble, foliage, webs and bones |
| Architecture | Basic/worn walls, coping, closed/open doors, closed/raised gates, cracked walls, rear faces and low foreground cutaways |
| Functional objects | Closed/open chests and coffins, crates, barrels, lit/extinguished braziers, levers in both positions, bells, lanterns, supports and shaft hatches |
| Biome objects | Saints, arches, focal machinery/heart/tomb/pillar, structural decoration, mine carts, spore pods, crystals and mushrooms |
| Detail | New kit-based decals, wall details, contact shading, rails, clue markings and loose loot art |
| Landmarks | Twenty room compositions assembled entirely from the new kit's modules |

Most of each room uses one quiet floor material. Accents belong to room edges and room functions; random four-by-four material patches are gone. Floor texture samples are spatially aligned across adjacent tiles. Unexposed rock is quiet and dark, while exposed wall faces use the same masonry as doors and landmarks. Closed/open and active/inactive object states remain visibly distinct without changing their gameplay data.

## Integration and safety

`biome-art.js` owns the complete environment for the four target biome IDs. Small gated hooks in `index.html` route all terrain, wall dressing, objects and loose loot through that module. Legacy room-ground decoration, lighting-detail decals, and mine scene images are suppressed for these biomes. Their placement/navigation systems are retained. Tactical overlays, hazards, object positions, FOV, light simulation, combat and saves remain unchanged.

The town redesign chat was informed of the shared HTML hook boundaries. On integration, preserve both `town-coast.js` and `biome-art.js` in HTML, cache and packaging lists. The final service-worker cache is `sm-cohesive-biomes-v3-20261027`. Only the four small v3 production atlases ship; full-size source generations remain in the local workspace.

## Verification and review evidence

108 unit tests pass. The desktop/mobile browser suite uses the same seed, terrain, population, object data and camera before/after. It checks all fourteen terrain types, all four atlas loads, genuine transparency in all 96 isolated object cells, twenty distinct landmark compositions, no browser errors, disabled smoothing and unchanged simulation state across repeated rendering.

The browser suite also rejects every legacy tileset canvas, legacy environmental prop sprite and old mine-scene image at `drawImage`. It throws if `ART.tile` or the old props/terrain atlas lookup is reached. Character and corpse art remain intentionally outside that environment ban. These guards run during the eight complete desktop/mobile scene comparisons, not just on an isolated asset sheet.

| Region | Original scene | Complete replacement |
|---|---|---|
| Salt Pits | [Before](evidence/mine-before.png) | [After](evidence-v3/mine-after.png) |
| Catacombs | [Before](evidence/crypt-before.png) | [After](evidence-v3/crypt-after.png) |
| Blooming Deep | [Before](evidence/fungal-before.png) | [After](evidence-v3/fungal-after.png) |
| Sewers | [Before](evidence/drowned-before.png) | [After](evidence-v3/drowned-after.png) |

[New native-resolution kit and compositions](evidence-v3/biome-kit.png). Mobile after captures are also in `evidence-v3/`. Older evidence directories record rejected/superseded implementations and are not runtime assets.

Run `npm test`, `node tests/biomes-browser.cjs`, and `node tests/environment-browser.cjs`. The navigation suite verifies decorated-tile traversal, town service access and save migration. Set `SCREENSHOT_DIR` to capture evidence. Browser fixtures do not exhaust every procedural seed; native APK and macOS bundles have not been built locally. Keep the PR unmerged until art review and latest CI are satisfactory.

## Artwork sources and prompts

See [final generation prompts and production paths](cohesive-generation-prompts.md). Built-in ImageGen was used. The new source sheets are retained at `/Users/julian/Documents/ChatGPT/Game/outputs/biome-art-v3/source/`; `scripts/build-cohesive-biomes.cjs` accepts that directory. Both user reference sheets remain under `reference/` for art direction review.
