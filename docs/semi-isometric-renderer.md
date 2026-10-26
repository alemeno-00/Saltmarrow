# Semi-isometric renderer audit and integration

## Before

The browser game is one inline application in `index.html`, with accumulated drawing hooks. The simulation uses a 63 × 43 square grid, eight-way movement, and 32 world units per tile. `moveEnt`, `exploreStep`, `combatStep`, `paths`, `validTargets`, FOV, and damage operate on grid positions. Actors interpolate `rx`/`ry` for drawing. The previous renderer used rectangular floor cells, row-only sorting, a world-space camera, and direct rectangular mouse picking. Touch taps, long press, mouse hover, and right click share `tileFromEvent`. Combat effects store unprojected world pixels.

## Presentation contract

The new final drawing hook keeps the simulation, save format, keyboard/grid directions, monster AI, collision, damage, and turn economy intact. Existing sprites, object renderers, biome tile palettes, generated town art, title artwork, and animation hooks remain the source assets.

- Floor projection: `(x − y, (x + y) / 2)` in world pixels; inverse: `(y + x / 2, y − x / 2)`.
- `ISO.camera` stores projected logical pixels, independently of the old world camera. Camera follows the interpolated hero; touch pan operates in screen directions.
- Picking converts the canvas's CSS rectangle to logical viewport pixels and applies the exact inverse projection. Zoom and device DPR are accounted for once.
- Floors, item footprints, paths, range/area indicators, rings, bolts, stains, and existing animation hooks use `isoGround`. Upright sprites and objects use `isoUpright`, anchored at their ground contact. Boss/hulking size distinctions remain intentional; NPCs share the hero tile scale.
- Walls have two shaded vertical faces and a textured diamond cap. Nearby foreground walls fade to expose the hero. Standing objects, walls, NPCs, and monsters sort by interpolated `x + y`, with wall ties drawn first.
- Walkway edges adjacent to pits have shaded side faces. Cached native-pixel texture variants add stone seams, chips, wet glints, and salt specks without repainting textures every frame.
- Canvas smoothing is disabled. The backing buffer uses one native logical pixel per CSS pixel before zoom; CSS uses `image-rendering: pixelated`. Existing user zoom remains available.
- Local light uses discrete brightness bands on a four-pixel lattice, with teal crystal/fungal light and amber lantern/fire light. Screen atmosphere, reduced-motion handling, flashes, and dread effects remain active.

### Effects integration

Future effect modules should keep their event data in the existing **unprojected world-pixel** convention. Ground effects can draw inside `isoGround`; upright death sprites should use `isoUpright` or project their ground contact explicitly. `drawAnims()` is still called once per frame inside `isoGround`, so its existing wrappers continue to execute. No combat/death metadata was changed. `window.__iso` exposes pure projection/inverse functions and tile-center/picking helpers for inspection and tests.

## Reference boards and scope

Both uploaded boards were recovered from the referenced conversation and inspected: “Saltmarrow: Dark Roguelike Feature Board.png” and “Saltmarrow Deep: Reimagined Pixel Art.png”. They guide the angled masonry, upright sprite scale, dark teal atmosphere, and warm practical lights. This is an incremental functional renderer and environmental-detail pass, not a claim of pixel-for-pixel recreation of the boards or a complete replacement character atlas. The separately named `/mnt/data/image.png` was unavailable; the repository's exact existing title asset and title presentation are retained without modification.

## Validation

`npm test` validates projection round trips, picking at diamond boundaries throughout the map and across camera offsets, interpolated depth ordering, and syntax of every inline script. `npm run test:browser` serves the real application with a test-only fixture hook and checks desktop/mobile collision, actual movement, projected click/tap, zoom/pan picking, combat feedback, and town rendering, with runtime errors treated as failures. Set `CHROME_PATH` to use an installed Chrome, and `SCREENSHOT_DIR` to retain captures. Test-only hooks are injected by the test server and never shipped in the game.

CI runs both suites and uploads screenshots. Gameplay tests disable real-time exploration in their fixtures to prevent autonomous ticks and random hazards from changing test outcomes. The production real-time setting is unchanged.
