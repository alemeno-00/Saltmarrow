# Saltmarrow world art pass

This pass replaces the flattened town façades and the main world sprites with a coherent set of detailed gothic pixel assets. It follows the two supplied Saltmarrow boards: slate and teal architecture, upright human proportions, weathered stone/timber/iron, amber practical lighting and cold fungal/crystal accents. Title artwork is untouched.

## Assets

Five lossless WebP files live in `assets/art/`. They were generated for this project using the image-generation tool, then losslessly encoded for shipping. Transparency is retained. The runtime atlas manifest is in `isometric-art.js`:

- Eight complete buildings: smithy, chapel, hall, tavern, archive, cottage, apothecary and boarded house.
- A separate timber mine-lift structure with pulley, shaft, winch and loading platform.
- Forty-eight actor cells: five heroes, eleven townspeople, thirty-one existing creature/boss types, and a spare bone-witch sprite.
- Twenty-four prop states including open/closed chests and coffins, lit/unlit braziers, lever states, furniture, shrine, forge, bell, crystal and mushrooms.
- Eight material swatches: town cobbles, mine/crypt/fungal/drowned floors, timber boards, masonry and bridge planks.

These are real in-game assets, not concept illustrations shown in place of implementation. They are drawn with nearest-neighbor sampling and integer sprite dimensions. Characters use native 48px height, low creatures 25px and major horrors 64px before intentional game zoom and boss scaling. Existing movement interpolation, windup, lunge, recoil, body motion, hop, squash and hit flash continue to animate them. Portraits and default class previews derive from the new actor art. Explicit equipment/mark previews retain their specialized legacy renderer.

## Architecture and picking

Town buildings are single upright sprites associated with their existing grid footprints. Those footprints suppress the old façade tiles and wall caps; they do not modify the map, collision, doors, saves or town NPCs. Buildings join the standing draw queue. Nearby roofs fade when they would obscure a hero behind the building; approaching its entrance from the street keeps the façade visible.

Opaque actor pixels map to their actor's grid position. Opaque town façade pixels map to that building's existing entrance. Doorway grid cells take priority, so overlapping art cannot prevent entering. The hero's body does not intercept movement clicks. Hover, right click, taps and long press share the same picking path. Ground targeting and combat ranges still use the original inverse projection and simulation coordinates.

## Import and compatibility

The actor sheet has uneven gutters. The importer groups connected alpha silhouettes before trimming and nearest-neighbor scaling; this avoids clipped heads or pixels leaking from neighboring cells. It caches sprites, portraits, white flash masks, terrain variants and alpha hit masks. Unknown actor keys fall through to the existing sprite renderer. The five approved Drowned faction types explicitly retain their directional atlases, poses, visibility and combat behavior rather than being replaced by the general art atlas. Their opaque sprite pixels also participate in visual picking.

The service-worker cache and native app offline-copy steps include both runtime modules and the asset folder. Failed or missing atlas loads are recorded and keep the corresponding legacy rendering available. The title asset is not replaced.

## Validation

`npm test` covers projection, picking boundaries, interpolated depth, JavaScript syntax, atlas manifests, offline files and actor scale. `npm run test:art` loads and checks every atlas in a real browser and can save a complete actor contact sheet. `npm run test:browser` covers desktop/mobile wall collision, movement, zoom/pan, actual click/tap movement, upper-body actor picking, building façade picking, real doorway entry, melee feedback and interior rendering. Existing contextual-death tests also run against the new art and all artwork is served by their test server.

Set `SCREENSHOT_DIR` for screenshots. CI includes the atlas browser test and uploads its contact sheet alongside gameplay captures. This is a world art pass; inventory glyphs, ability icons and bespoke equipment previews remain functional and are not represented as a new animated atlas.
