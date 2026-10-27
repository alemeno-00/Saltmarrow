# Hollow Faith

Hollow Faith is a side faction in the existing campaign. Penitents enter the depth-three and four encounter pools, witches depths four and five, keepers depths five and six, and cantors depths six and seven. The Saint Without a Face appears on reachable free floor at depth five. The existing Spore-Saint and Drowned Abbot are separate bosses; the Saint Without a Face does not replace the final encounter or trigger the ending.

## Combat

- **Ashen Penitent:** melee flail with bleeding on stronger rolls; gains a second attack at or below half stamina.
- **Censer Witch:** marks a 3×3 area at the hero's current position, then releases cursed smoke on its next turn. Leaving that area avoids the hit and curse. The smoke obstructs sight; the curse halves healing for two subsequent combat rounds. Combat exit clears it.
- **Reliquary Keeper:** grants six points of absorption to faithful within four tiles. Wards refresh, rather than accumulate, and expire when the keeper next acts or dies. Wards do not add permanent temporary stamina.
- **Hollow Cantor:** spends one turn chanting before summoning up to two penitents. Positive incoming damage, including damage absorbed by a ward, or daze interrupts the chant. Lost sight cancels it. At most four summoned faithful can live on the level across all cantors and Saints. Summons use unoccupied walkable cells and are active combat participants.
- **The Saint Without a Face:** False Sermon above two-thirds stamina uses the interruptible summon chant. Unmasking between two-thirds and one-third marks cursed smoke. Revelation at or below one-third marks a 5×5 eruption for ten damage. Phases never regress on healing. Each phase change cancels the previous phase's pending ritual. Marks resolve on the next monster turn, so the player can move. Distinct grounded marks remain visible under reduced motion.

These rules deliberately use ordinary enemy turns, not animation timing. Entity fields retain pending rituals when saving. Combat exit clears transient wards, curses and rituals. Death uses the ordinary reward/corpse pathway exactly once.

## Art pipeline

The user-attached approved sheet is a visual reference, not an atlas. New transparent 4×5 pose grids were generated with the built-in image tool. Seven atlases provide 140 frames, including dedicated Unmasking and Revelation variants. Each row contains four authored poses for idle, move, attack, hurt and death. The game consumes isolated 128×128 frames, packed at 512×640 with a fixed (64,110) foot anchor. Rendering uses nearest-neighbour scaling and binary alpha. The reference sheet's labels, backgrounds and example screenshots are never rendered in game.

`hollow-sprites.js` selects the animation from movement, attack/hit timestamps, pending rituals and death age. The current atlas view is three-quarter southeast, mirrored when facing west. North/south directional art is not included. Reduced motion uses static poses while preserving attack marks. The existing contextual gore system still runs alongside the authored death sequence.

`tools/pack-hollow-sprites.cjs` compiles new generated grids using Sharp, checks nonempty poses and frame padding, applies nearest-neighbour sampling and a compact RGB lattice, and emits per-frame bounds metadata. Source grids and prompts are recorded separately from the game atlas. To compile a new export, provide a JSON list of `{id, source}` files; Sharp is an authoring dependency, not a game/runtime dependency.

## Verification

Run `node --test tests/*.test.cjs` and `node tests/hollow-browser.cjs`. Browser tests run at desktop and mobile sizes with full and reduced motion, validate distinct pose pixels/alpha/frame padding, load the real sprite assets, exercise dodge/interruption/phase changes, and render the authored death sequence. `CHROME_PATH` can point to an installed Chromium binary; `SCREENSHOT_DIR` saves review images. The Hollow Faith GitHub workflow executes both suites and attaches screenshots.
