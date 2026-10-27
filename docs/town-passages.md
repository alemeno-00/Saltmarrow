# Covered terrace passages (layout 7)

The town uses the approved version 6 artwork. Layout 7 closes the two long floor strips that crossed painted retaining walls between the lower and middle terraces. They now represent covered stairs with explicit paired landings:

| Route | Lower landing | Middle landing |
|---|---|---|
| West, beside the cottage stairs | 34,29 | 34,20 |
| East, beside the archive stairs | 45,29 | 45,20 |

Small brass stair arrows identify each landing, with a nearby destination label. Clicking the marker enters the covered stair. Walking to a destination on the other terrace routes through the paired landings automatically. On a landing, pressing up/down toward the covered stair also enters it. The hero disappears for the short crossing and arrives with logical and rendered coordinates aligned; no interpolation across a wall occurs. Camera tracking resets at arrival. Reduced motion uses the same stationary transition.

The covered strips (34–35,21–28 and 44–45,21–28) are solid walls. The old inspectable house at 34,23 moves to 57,29, with a lower-road approach, because its old approach was inside the covered stair. Building services, bridges and the town artwork remain intact.

Pathfinding and reachability include passage edges only on a town with passage data. Ordinary movement still rejects arbitrary moves longer than one tile. Version 6 saves regenerate their exterior registration using the existing migration, preserving player, equipment, quests, money and dropped items. Dungeon and interior saves are unaffected.

Validation: 107 unit tests, bidirectional pointer traversal of every landing in all four acts, actual click-to-walk between terraces, all seven service entrances/exits, both bridges, mobile/wide framing and cross-environment/save migration browser checks.
