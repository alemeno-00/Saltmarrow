# Equipped weapons

The flat renderer composes the equipped item over a cached body extracted from the existing artwork. Native source masks remove fixed props; atlas files and class identities are retained. The Saltbreaker uses the original directional idle/walk frames, while other classes retain their existing class bodies. `heroBody` deliberately avoids the hammer-specific attack column. If the atlas layout changes, update its masks and inspect the comparison gallery.

`SaltmarrowArt.weaponKind`, `weaponStyle`, `weaponPose`, `drawWeapon` and `weaponDeathKind` are presentation helpers. The nine current equipment bases are supported. Sword, axe, spear, dagger, bow, staff, shield and mace aliases are supported for future data definitions; this change does not introduce those as loot or change weapon rules.

Physical abilities use the held weapon's attack family. Spells, elemental effects and signature unarmed moves retain their ability effects. Attack state lives in a WeakMap rather than saved entities. A weapon swap invalidates the prior pose immediately. Crossbow recovery includes a visible reload gesture; it adds no action cost. North-facing weapons render before the body, other directions after it, with fingers covering the grip and a support hand on long weapons.

The existing attack wind-up plus 170 ms roll pause remains the source of impact timing, scaled by the existing pace setting. Free strikes use their existing 110 ms delay. The predicted clock holds the contact pose until the actual damage event, which releases recovery and impact feedback together even when browser timers are delayed. Presentation never spends an action or advances a turn. Reduced motion retains visible static equipment.

Run `npm test` and `npm run test:weapons`. Set `SCREENSHOT_DIR` to capture the desktop scene, all nine weapons in four directions and attack phases, and original/body comparisons. Browser coverage includes real equip/swap/unequip operations, all classes, normal/fast/instant impact clocks, free strikes, body size preservation and reduced motion. Pixel composition is snapped to native integer coordinates and uses nearest-neighbor rendering.

This branch is stacked on the tactical combat PR so its cache update and renderer CI steps can coexist. Both tactical and weapons browser suites are retained.
