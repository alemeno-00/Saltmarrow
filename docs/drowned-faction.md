# The Drowned

Implemented from `assets/drowned/approved-concept.png`, the exact user-supplied concept sheet. The approved roles are preserved: burrowing aquatic hunter, mid-range hook and pull, summoning support, teleporting assassin, and the three-phase naval boss. Existing Saltleecher and Bellbound entries keep their save-compatible identifiers.

| Creature | Behavior and counterplay |
| --- | --- |
| Saltleecher | Marks a square, burrows locally and emerges on its next turn. A bite restores half of actual stamina damage, capped at its maximum. Move off the ripple, break sight or daze it. |
| Drowned Mariner | Keeps mid-range, hooks and pulls 1–3 squares, reduced by the hero’s existing stability. Uses a cutlass in close quarters. Break line of sight or close in. |
| Bellbound | Summons a Saltleecher every fourth turn, up to two living owned minions. Alternates a ward (up to four temporary stamina) for nearby Drowned with ranged hexes. Daze interrupts the toll. |
| Brine Wraith | Marks the hero’s square, then teleports to a legal adjacent square and slashes on the following turn. Moving away or dazing it defeats the ambush. |
| Drowned Admiral | A new non-final boss near the depth-7 descent. Commands Marines, floods the ground at two-thirds stamina, and uses the Last Bell below one-third. Tide and bell attacks are marked one turn ahead; move or daze to interrupt. The Abbot and ending are preserved. |

All four ordinary faction types join the depth-7/8 pools; the existing early Saltleecher and Bellbound appearances remain. Admiral phases progress monotonically and do not reset on healing. Flooding protects objects, walls, stairs and pits. Summoning works in water and respects occupancy, terrain, an owner cap of four (two for Bellbound) and eight living summoned faction creatures across the level. Frenzied mutations retain movement benefits but cannot bypass custom attack warnings. Marks clear when combat ends or sight is lost. New per-monster fields are ordinary serializable save data; older saves default them lazily. An already generated seventh floor gains its Admiral on a subsequent new floor generation, not during load.

## Sprites

The built-in image generator produced five separate directional atlases using the exact supplied image as reference. Final prompt set: `docs/drowned-sprite-prompts.json`. No CLI image service was used. Source output was compiled with nearest-neighbor sampling, binary alpha and a 128-color palette for crisp game-scale pixels. No generated labels or concept-board scenery are in the runtime sprites.

Final assets: `assets/drowned/{saltleecher,mariner,bellbound,brinewraith,admiral}.png`. Regular sprites are 48 native pixels per cell; the Admiral is 72. Each atlas has four rows (SE, NE, NW, SW) and four columns (idle, walk A, walk B, attack/ability), giving 80 direction/pose frames. Hurt flashes use a cached tint of the selected frame; emergence and teleport use the attack pose plus splash feedback. Contextual deaths animate the selected directional frame through the shared death system rather than requiring separate death atlases. Reduced motion holds the idle pose and suppresses lunges and hurt flashes.

`drowned-sprites.js` exposes a small atlas selector independent of simulation. Sprites use whole native pixels, integer screen placement and no smoothing, scaling distortion or mirrored weapons. Fallback sprites remain available while atlases load. The service worker preloads all runtime assets.

## Renderer and deaths integration

Built on the merged semi-isometric renderer and contextual death work. Actors remain in `isoUpright`; warning squares render once through `isoGround`. No projection equations change. New species anatomy includes leecher maws/segments, Mariner seaweed/limbs, Bellbound brass bells/chains/cloth, Wraith skulls/spectral brine and Admiral crowns/plates/tridents. Killing-blow element, direction, execution and overkill still drive the shared bounded fragment physics and persistent aftermath. Rewards, corpse interactions and the duplicate-kill guard are preserved. Tide attacks explicitly carry water damage metadata and never ignite tiles.

## Verification

`npm test` covers existing renderer/death checks and faction simulation: spawn pools and repeated reachable Admiral generation, dodgeable and interruptible ambushes, bounded healing and summons, flooded spawning, protected exits, monotonic phases, warning cleanup, sprite dimensions/selection, rewards and anatomy. `npm run test:drowned` exercises the real browser in desktop/mobile and normal/reduced-motion combinations, including all 80 frames, actual hook movement, marked attacks, summon/daze, phases and species deaths. Existing desktop/mobile gameplay and all elemental-death browser regressions remain applicable. Browser fixtures are injected only by tests; production adds no new debug controls. CI saves screenshot artifacts.
