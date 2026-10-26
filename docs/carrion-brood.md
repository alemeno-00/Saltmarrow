# Carrion Brood

Directly authored pixel art: no image generation or concept-sheet crops. Source: `tools/draw-carrion.cjs` (requires Sharp to regenerate). Nine transparent PNG atlases contain 180 frames, each on an 80×80 cell with a fixed [40,70] foot anchor. Rows: idle, movement, attack, hurt, defeat; four frames per state. East/west facing uses horizontal mirroring in the shared semi-isometric actor pass. The fixed thirteen-color palette and binary alpha preserve hard edges. Boss phases have separate shell/crown art. Defeat dissolves into stylized shell fragments and spores; anatomical effects are bypassed for this faction.

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
