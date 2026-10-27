# Saltmarrow Deep biome environment kit

This branch replaces dungeon floor surfaces, rear wall relief, background prop clusters and room focal art with a native 32 px kit. It builds on the existing room-bank and clear-aisle composition system. No concept sheet is rendered as a background image.

## Audit and scope

The base revision (696eb52) uses shared terrain/prop atlases, five broad floor materials and one focal image per room family. Mine walls already have custom strata, while the other dungeon families reuse much of the same masonry. The existing `room-composition.js` safely banks gameplay objects and locates three-tile wall slots. The new `biome-art.js` retains that placement and replaces its focal rendering with twenty authored compositions.

The retrieved ChatGPT conversation provided textual prompts but no accessible generated reference images. These assets follow the text specification; exact matching to those unavailable sheets still needs user review.

| Biome / runtime ID | Five material fields | Wall/prop kit | Five focal compositions |
|---|---|---|---|
| Rotwater Sewers / drowned, sewer | Wet brick, fractured brick, slime, flood silt, rust grate | Rust pipes, couplings, drainage bars, valves, slime runs, workshop debris | Pumping station, collapsed tunnel, drowned workshop, drainage gate, flooded shrine |
| Blooming Deep / fungal | Fungal soil, moss bed, roots, spores, colonised rock | Root tendrils, luminous shelves, sprouts, pods, fungal stalks | Fungal cathedral, mycelial heart, mushroom forest, spore lake, fungal throne |
| Forgotten Catacombs / crypt | Worn flagstones, cracked tomb floor, burial slabs, dust, wax | Burial niches, skull shelves, coffins, benches, carved crosses | Ossuary, saint tomb, bone chapel, skull wall, funeral hall |
| Salt Pits / mine | Salt crust, excavated stone, crystal seams, dust, track | Salt shards, supports, tools, mine carts | Crystal cathedral, collapsed shaft, salt pillar, workers camp, buried saint |

## Art and placement

- Each material has four deterministic wear variants and sixteen stepped transition masks. Materials form coherent four-by-four-tile patches rather than independent random coloured squares.
- Surfaces are cached 32×32 canvases; focal compositions use the existing 96×48 wall footprint. The kit is executable, reusable pixel-art source. `surface()` and `focal()` can export individual assets without resampling.
- Existing eligible room wall slots cycle through the five landmarks per biome. Small rooms, protected rooms, secret faces and missing wall slots retain the existing eligibility rules. A generated floor is not guaranteed to contain all five landmarks.
- Rear-wall props stay within the rear half of a tile. Actors, objects, items, traps, authored decals and live effects suppress decorative clusters. Landmark art is withheld when an actor overlaps its footprint.
- Low-opacity spore motes, wet highlights and mineral flecks add a separate ground layer. Reduced motion freezes their phase. Existing biome lighting remains responsible for world illumination; art does not create gameplay light or concealment.
- Town, interiors, tutorials, and the separate abbey biome retain their previous rendering. This kit does not change map generation, collision, RNG, saves, loot, combat or object placement.

## Town coordination

Work is isolated in `feat/four-biome-art` in a separate checkout. The ongoing town chat was sent the integration boundaries. Shared-file integration must retain both `town-coast.js` and `biome-art.js` in the HTML, service-worker cache and desktop/mobile packaging copy lists. The biome script must load after surfaces, environment art and room composition. It strictly excludes town rendering.

## Review evidence

`evidence/biome-kit.png` shows all twenty floor materials and twenty landmarks at native resolution. The before/after scenes use seed 73819, the same room, population, objects, lighting and camera. The baseline omits only the new module; it retains the prior environment overhaul. FOV is fully revealed for inspection. The files prefixed `mobile-` use a 390×844 viewport; desktop uses 1440×1000.

| Region | Before | After |
|---|---|---|
| Salt Pits | [Before](evidence/mine-before.png) | [After](evidence/mine-after.png) |
| Catacombs | [Before](evidence/crypt-before.png) | [After](evidence/crypt-after.png) |
| Blooming Deep | [Before](evidence/fungal-before.png) | [After](evidence/fungal-after.png) |
| Sewers | [Before](evidence/drowned-before.png) | [After](evidence/drowned-after.png) |

Run `npm test`, `node tests/biomes-browser.cjs`, and `node tests/environment-browser.cjs`. Set `SCREENSHOT_DIR` to capture evidence. Browser comparisons assert distinct output, twenty distinct landmark images, identical seeded terrain/population/objects, stable simulation state across repeated rendering, no browser errors, and disabled smoothing. The existing environment browser suite traverses decorated tiles and verifies town service entry/exit and save migration.

Browser evidence covers deterministic fixtures, not every procedural seed. Native mobile APK and macOS packaging are updated but were not built locally. Review the art direction and CI before merging.
