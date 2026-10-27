# Smithy street and mine benchmark

This expands the environment pass using two references as design principles: Core Keeper's distinct underground materials/ecosystems and Stoneshard's inhabited work areas and readable tactical spaces. The assets are original. Saltmarrow retains its flat square projection, existing pixel-art buildings and actors, turn-based combat and desktop keyboard/mouse controls.

## What changed

The town now separates worn cobbled streets, paved entrances, cinder-stained smithy frontage, damp verge drainage, packed-earth yards and grass margins. Wheel wear follows two continuous world-space tracks, rather than repeating within every tile. Stepped boundaries break up material transitions. The smithy has a roofed coal store and a quenching trough with a tool rack, positioned inside its existing blocked facade cells and away from its doorway.

Mine floors distinguish compacted earth, exposed bedrock, working bays and scree along room rims. Solid surrounding rock is deliberately darker and quieter than exposed wall faces. Irregular wall fractures and spaced timber supports replace the uniform masonry finish; cracked walls retain their gameplay cues. Procedural rooms with suitable rear walls receive a survey/tool station or a winch for rail/storage rooms. A restrained lantern pool grounds the survey station.

## Placement and rendering

- Material fields are cached per level, with a bounded native tile cache shared between levels; no gameplay random numbers or map writes.
- New fixtures occupy only existing wall/building cells. Mine stations require an intact three-cell rear wall facing an existing floor, clear of authored wall decals and nearby objects. No new colliders, rewards, hazards or fake interactables are added.
- Sprite widths are 64 or 96 native pixels; height is capped at 48 pixels. Their upper edge stays at or below the feet of an actor in the north-adjacent tile. They enter the existing row sort after their wall/building and before actors in the room below.
- Runtime guards suppress an entire fixture if a footprint wall is broken, receives a clue, or any required footprint/floor cell has not been seen. Station light uses the same guards and only emits from a currently visible floor cell.
- Floor replacement and ground art remain beneath existing decals, telegraphs, loot and actors. Existing visibility dimming/cutaways and turn timing remain intact. All scaling uses native integer canvases and nearest-neighbor sampling.
- Existing crypt/fungal/drowned art remains supported; this benchmark concentrates its new material kit on town and mines.

## Validation

On current animation/weapon main `9bf5a8a`:

- `npm test`: **71 passing**. Includes 80 seeded dungeon placement runs and 60 additional seeded mine landmark runs, immutable simulation data/RNG, entrance clearance, wall-bound placement, broken-wall/clue/fog suppression and material classification.
- `node tests/environment-browser.cjs`: desktop town/mine/crypt/fungal/drowned generation; four workyard sprites load with bounded native sizes; matched frozen before/after renders differ; actual movement through decorated tiles succeeds; map data stays unchanged; no page errors; smoothing disabled.
- `node tests/tactics-browser.cjs`, `node tests/weapons-browser.cjs`, `node tests/animation-browser.cjs`, `node tests/flat-browser.cjs`, `node tests/art-browser.cjs`: pass locally.
- Local 1440×1000 Chromium full-scene draws averaged approximately **6–14 ms** over 30 warm draws per scene. This is a diagnostic, not a physical GPU or Safari performance guarantee.
- The environment workflow runs both placement suites, renders desktop comparisons and uploads the PNGs.

The comparison gallery in [environment-art.md](environment-art.md#matched-screenshots) is refreshed from these benchmark cameras. Before disables all new environment, material, fixture and fixture-light hooks on the same map, with frozen animation and revealed visibility. No claim of merge or deployment is made.

## Assets

`assets/flat/workyards.webp` is the project-bound four-sprite atlas. It was generated with the built-in ImageGen tool, using `assets/flat/buildings.webp` as a style reference, then losslessly encoded as WebP. Runtime crop rectangles and native sizing are declared in `environment-scenes.js`. The transparent source was preserved; no copied commercial game sprites were used.

Final generation prompt:

> Use case: stylized-concept. Asset type: production sprite atlas for Saltmarrow's flat 2D pixel-art desktop tactical roguelike. The input image is STYLE REFERENCE ONLY: match its weathered dark timber, blue-grey iron and slate, warm highlights, richly detailed crisp pixel clusters and upright frontal slightly overhead camera. Generate one transparent atlas arranged as EXACTLY 2 columns by 2 rows with wide empty transparent gutters between four isolated props, each entirely contained in its quadrant, no background, no labels. Top left: low roofed coal bunker attached to a blacksmith frontage, weathered wooden framing, uneven slate awning, coal pile, tongs and a few scrap iron bars, broad low silhouette about 2:1 width:height. Top right: broad low iron quenching trough with dark still water, a timber tool rack behind it with three tongs and hammer, no flames or smoke, 2:1 width:height. Bottom left: wide shallow abandoned mine work station mounted against a wall, scarred timber shelf, hanging pickaxes, rope coils, battered survey board with abstract marks not readable text, no wall/background outside object, 2:1 width:height. Bottom right: broad shallow timber-framed hand winch and thick cable spool with a snapped rope draped along the bottom, rusty hardware, a small crate, 2:1 width:height. All four assets must share the same scale, perspective and coherent detailed pixel-art style as the supplied buildings. Flat axis-aligned 2D game sprites, NOT isometric or diamond view; no floor platforms, no diorama scene, no characters, no text, no fog, no bloom, no smoothing. These are original functional medieval mining-town props, no copied game assets. Transparent background including gutters.

Reference pages: [Core Keeper](https://store.steampowered.com/app/1621690/Core_Keeper/), [Stoneshard](https://store.steampowered.com/app/625960/Stoneshard/).
