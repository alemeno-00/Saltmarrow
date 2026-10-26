# Contextual death effects

Combat passes a fourth, optional hit descriptor to `damage`: `kind`, `ability`, `crit`, `execution`, `dx`, `dy`. The damage function records actual damage after temporary stamina, overkill, and the source direction before calling the unchanged reward/corpse logic. The armour-feedback wrapper forwards this descriptor. Hidden killing blows from abilities with `hiddenDouble` get execution variants; excess damage of at least 4 or 35% of base stamina gets overkill variants. Other deaths use the normal variant. Death handling is idempotent.

`death-effects.js` is a cosmetic module with no gameplay random-number calls. All eight requested families are explicit: slash, piercing, fire, ice, lightning, water, spores, occult. Physical crushing is a ninth fallback for mauls, collisions and environmental damage. Frost maps to ice, void/holy to occult, geysers to water, and venom/spore abilities to spores. Fire and spore ticks, firepots and drowning carry explicit metadata; a nearby fire tile no longer overrides a slash killing blow.

Creature anatomy chooses skulls/ribs/bones, cultist heads/cloth/limbs, spider legs/carapace, drowned limbs/seaweed, armour plates/helmets/gauntlets, or eldritch eyes/tendrils. Unlisted creatures use flesh anatomy. Existing creature sprite death poses are retained, with sliced sprite separation for slash/piercing, crumble for ice and dissolution for occult. Overkill and execution increase the fragment count and directional force. These effects never remove interactive corpse objects or change loot, XP, AI, damage values, movement, or quest events.

Fragments travel in tile coordinates with a separate vertical height, gravity, damped bounce, spin and wall collisions. Piercing drives fragments along the incoming direction; occult fragments pull inward. Ash and ice use distinct silhouettes. Settled fragments remain for 90 seconds and stains for 180 seconds, with a short terminal fade. Oldest entries are evicted at 160 fragments / 96 stains. Floor changes clear the cosmetic store. Residue is transient visual state and is not saved across reloads. Labels coalesce at the same position and the float list is capped at 48; legacy death sprite poses are capped at 24.

Reduced motion immediately settles three fragments, suppresses killing-hit shake, hitstop, screen flash, knockback and sprite separation, and removes float rise/pop. Damage numbers and cause labels remain readable. Existing non-death spell effects retain their own motion behavior.

## Renderer contract

`create()` returns `emit(level, entity, hit, reduced)`, `update(level, dt, blocked, reduced)`, `draw(ctx, project, visible, layer)` and `sync(level)`. Project receives **tile coordinates** `(x,y,height)` and returns canvas world coordinates; layers are `floor` and `air`. Visibility is checked at every fragment location. Render floor residue below actors and airborne fragments above them. Integration into the concurrent isometric renderer must explicitly project tile coordinates; never apply projection twice.

## Validation

`node --test tests/deaths.test.cjs` covers syntax, classification, all anatomy/type combinations, caps, physics, collisions, execution, expiry, level cleanup, and headless gameplay rewards/corpse preservation. `node tests/deaths-browser.cjs` uses Playwright to exercise all 48 requested anatomy/element combinations in the real game, actual ability combat, runtime errors, level transitions and reduced motion. Set `CHROME_PATH` for a local Chrome and `SCREENSHOT_DIR` for visual captures. The test server injects private fixture hooks; production exposes none.

The final semi-isometric renderer draws floor residue once inside `isoGround` and projects airborne tile positions explicitly, subtracting height in screen pixels. The legacy dying-sprite layer cancels the ground transform and projects the sprite anchor once, retaining upright silhouettes. Reduced-motion labels stay fixed in both render paths. Renderer gameplay fixtures serve the external death module.
