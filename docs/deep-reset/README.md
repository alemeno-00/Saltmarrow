# Approved biome rebuild

The four dungeons now use new room art derived from the approved coastal-town style: detailed pixel masonry, warm lamps against cold depth, quiet lighter paving, dark wall masses and separate distant backgrounds. The previous maze generator, biome atlases and dungeon focal atlas are retired. Shared actor, town and interior art remains available.

## Playable modular assembly

Each biome has four authored 24 × 16-cell room modules on the existing 32 × 32 gameplay grid. A fresh seed shuffles their positions, offsets, entrance room and connected spanning graph, with optional loops. Two-cell bridges join registered room ports. These connections sample the new room paving and add visible retaining edges. Enemies, loot, hazards, quests and bosses are populated by the existing gameplay systems.

This is a finite library of sixteen authored rooms, assembled differently each run. Individual paintings do not change randomly. It preserves the approved architecture and compositions while changing the route through them; expanding variety means authoring more compatible modules.

The room atlas contains architecture, cliffs and fixed environmental decoration. Independent transparent sprites supply mutable gameplay props. Stairs, opened containers, switches, traps, water, destruction and dropped loot render as separate layers. Newly collapsed floor exposes the distant background instead of leaving a painted walkway behind.

The seed, module choices, connection graph, collision mask, initial terrain and changed terrain are saved with the level. Continuing a current run restores the same arrangement. A save inside a retired dungeon regenerates that floor using the new system, retaining the delver and carried progress; town and interior saves keep their layouts.

## Readability and exploration

Walkable masks follow the registered paved platforms and passages. Blocking props are moved off bridge connections, port approaches and the central walking spine, retaining their state and identifiers. Foreground architecture has a different value range from the paving. Existing character sprites retain their own silhouettes and combat feedback.

Backgrounds remain visible beneath unexplored platforms. Discovering a room reveals its tall architecture without revealing unexplored walkable cells. This presentation mask is separate from gameplay visibility and never writes to the saved exploration map. Existing lighting remains interactive; ambient darkness is reduced because the room paintings already contain light and shadow.

## Town integration

Integrated main through the finished town rebuild, PR #36. Town generation, town-coast.js, all town-v6 art, service approaches and interiors are unchanged by this biome patch. The dungeon renderer activates only for L.deepLayout. Web cache and native bundle lists include both town and new dungeon assets.

## Evidence

The desktop/mobile images are actual browser captures with the normal game renderer. Room captures deliberately reveal the map to inspect art. The fog captures show normal exploration visibility. The whole-layout images export the renderer's static world canvas for two seeds; they are assembly inspections rather than gameplay screenshots. WebP copies preserve the full capture dimensions; original PNGs were retained in the workspace outputs.

| Biome | Before | In-game room | Mobile | Fog | Two generated layouts |
| --- | --- | --- | --- | --- | --- |
| Salt Pits | [Before](evidence/mine-before.webp) | [Room](evidence/mine-room-0.webp) | [Mobile](evidence/mine-390.webp) | [Fog](evidence/mine-fog.webp) | [A](evidence/mine-layout-a.webp), [B](evidence/mine-layout-b.webp) |
| Forgotten Catacombs | [Before](evidence/crypt-before.webp) | [Room](evidence/crypt-room-0.webp) | [Mobile](evidence/crypt-390.webp) | [Fog](evidence/crypt-fog.webp) | [A](evidence/crypt-layout-a.webp), [B](evidence/crypt-layout-b.webp) |
| Blooming Deep | [Before](evidence/fungal-before.webp) | [Room](evidence/fungal-room-0.webp) | [Mobile](evidence/fungal-390.webp) | [Fog](evidence/fungal-fog.webp) | [A](evidence/fungal-layout-a.webp), [B](evidence/fungal-layout-b.webp) |
| Rotwater Sewers | [Before](evidence/sewer-before.webp) | [Room](evidence/sewer-room-0.webp) | [Mobile](evidence/sewer-390.webp) | [Fog](evidence/sewer-fog.webp) | [A](evidence/sewer-layout-a.webp), [B](evidence/sewer-layout-b.webp) |

## Validation

- Unit suite: 109 passing, including 1,024 deterministic module assemblies, 192 populated floors across eight depths, objective/stair access, and town regression checks.
- deep-browser.cjs: all four biomes at desktop and mobile sizes; actual movement to every room, bridge traversal, two different seeds, save restoration, old dungeon migration, unchanged simulation/FOV during drawing, and a guard rejecting legacy environment art calls.
- gameplay.cjs: pointer and keyboard movement, wall collision, zoom/pan, targeting, combat and town entry on desktop/mobile.
- coast-browser.cjs, environment-browser.cjs and lighting-browser.cjs: finished town composition, service entrances, migration and presentation-only lighting.
- Offline and native bundle manifests checked by unit tests. Native APK/macOS installers were not built locally.

## Art provenance

See [generation prompts](generation-prompts.md). The source PNGs and approved mockups are retained under the workspace outputs/deep-reset/source and outputs/biome-reset-mockups directories. Production images are registered without smoothing by scripts/register-deep-assets.cjs; it accepts a source directory and emits the six runtime WebP atlases. No previous biome tile sheet is composited into these assets.
