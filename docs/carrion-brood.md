# Carrion Brood

The user-approved generated character sheet is the visual reference. Seven individually generated animation atlases preserve those designs, including three separate Matriarch forms. `tools/pack-carrion.cjs` compiles the sources into nine transparent 512×640 PNG atlases: four columns, five state rows, 128×128 cells and a [64,112] foot anchor. The five main characters and extra boss forms have 140 separately generated poses. The egg and parasite cutouts come from the approved sheet and supply 40 derived auxiliary frames; they are not separately generated animation cycles.

Packing detects grid gutters, preserves a fixed scale per character across its poses, aligns feet, samples with nearest-neighbor filtering, quantizes colors gently, and thresholds faint alpha fringes to hard transparency. Packed frame bounds and source hashes are recorded in `assets/carrion-brood/manifest.json`. The game renders regular creatures at 80 pixels and the Matriarch at 128 pixels, using the shared semi-isometric actor pass and horizontal facing mirroring. Defeats use generated shell/spore poses and the existing non-graphic spore effect.

The raw generated source PNGs, full prompt manifest and approved reference are retained in the chat's `carrion-source-atlases` deliverable archive. To rebuild, extract that archive and run `NODE_PATH=<Sharp installation> node tools/pack-carrion.cjs <source-directory>/manifest.json`. The old `draw-carrion.cjs` procedural-art prototype has been retired; it cannot overwrite the approved assets.

| Creature | Mechanic and counterplay |
|---|---|
| Marrowgnaw | Pack AI; consumes an adjacent corpse for up to 8 stamina. Deny nearby remains. |
| Bloatcarrier | Marks a radius-one toxic burst, resolves next turn for 5 damage plus the existing weakened condition, and releases two small Brood Parasites. Leave the marked tiles or daze it. |
| Sinew Stalker | Moves along walls or climbs across one wall tile to a legal open landing; senses prey within four tiles. Warns of a leap at the player's old square. Dodge, break detection or daze. |
| Brood Shepherd | Heals nearby brood by up to 3 stamina per action and plants an attackable 6-stamina egg. Destroy the egg or parent before hatching. |
| Carrion Matriarch | Feeding Ground consumes remains and plants eggs/spore marks. At two-thirds stamina, Molting grants a one-time 12-point shell and marks radius-one leaps. Below one-third, Mother of Hunger plants eggs and marks radius-two spore bursts. Boss bursts deal 10 damage. Phase progression is irreversible. |

Living summoned brood are capped at six across all parents. Eggs and parasites have no random loot or corpse drops. Eggs vanish when interrupted, on parent defeat, and at combat end. Pending warnings persist in entity save data; losing detection consumes the warned action without a fallback attack. Specials run after the normal bleeding tick and finish with normal condition decay. Attack marks remain visible on discovered target tiles when the caster is hidden.

Regular encounters enter depths 3–7. One optional Matriarch is placed on reachable free floor at depth 6; the existing final encounter and depth-7 Drowned Admiral remain intact. The service worker precaches both factions.

## Verification

- `npm test`: Carrion rules, integrated level placement, Drowned, deaths and projection regressions.
- `npm run test:carrion`: desktop/mobile, normal/reduced motion; all 180 frames load with hard alpha; dodgeable warnings, destructible eggs, wall climb, phase changes and non-graphic defeat.
- `npm run test:drowned` and `npm run test:browser`: existing faction and input/combat regressions.
- CI: `.github/workflows/carrion.yml` uploads browser screenshots for review.

Hollow Faith was inspected in its separate local checkout. Its files are untouched and its module names are distinct. That work is not merged into main; a combined three-faction build still needs verification when it is ready. Balance values and the directly authored visual designs remain subject to review before merge.
