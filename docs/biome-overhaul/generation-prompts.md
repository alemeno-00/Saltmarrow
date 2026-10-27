# Reference-led atlas generation prompts

Method: built-in ImageGen. The user's Rotwater sheet was supplied as the reference for the sewer atlas. The combined Blooming Deep / Forgotten Catacombs / Salt Pits sheet was supplied as the reference for each of those three atlases. The images are style references, not edit targets or source sheets to paste into gameplay. One subsequent edit corrected the catacomb alpha channel.

## Sewer prompt

Use case: stylized-concept. Production game sprite atlas for Rotwater Sewers, using attached image solely as art direction reference. Create a SQUARE atlas with EXACTLY FOUR EQUAL COLUMNS and FOUR EQUAL ROWS, 16 precisely aligned square cells, no gutters, no labels, no lettering, no decorative borders. Flat 2D orthographic roguelike art: top-down square floors and front-facing walls/props, NOT isometric. Detailed dark pixel art, chipped irregular stone, rusty iron rivets, wet teal water, moss and amber highlights as in reference. The atlas will be sliced by exact equal cell boundaries. Row 1 four full-bleed seamless opaque floor textures: wet irregular flagstones; cracked mossy stone; dark green sludge stone; rusty iron grate over dark water. Row 2 four full-bleed opaque front wall textures: sewer brick; mossy broken brick; dripping pipe masonry; barred arched wall niche. Row 3 four isolated props on TRANSPARENT background with 10% cell margins: horizontal rusty pipe with flange; large rusty valve wheel on a short pipe; broken wooden crate and barrel; hanging amber lantern with chain. Row 4 four isolated modular landmark PARTS on TRANSPARENT background with 8% cell margins: detailed industrial round pump machine; ruined gothic stone arch with broken lintel; large iron barred gate segment with rivets; hooded drowned saint statue on candlelit pedestal. Each object fits completely within its own cell. Individual reusable game assets, never full scenes or rooms. Rich hand-dithered material texture, crisp clustered pixel edges and deep shading, consistent light upper left. No characters, no floor behind isolated props, no text, no watermarks.

## Shared prefix for the other three prompts

Use case: stylized-concept. Production game sprite atlas using the attached sheet solely as style reference. SQUARE atlas EXACTLY FOUR EQUAL COLUMNS and FOUR EQUAL ROWS, 16 precisely aligned square cells, NO gutters, labels, lettering or decorative borders. Flat 2D orthographic roguelike, top-down square floor textures and front-facing wall/props, NOT isometric. Detailed dark pixel art, crisp clustered edges, richly shaded irregular textured materials, light upper left. Will be sliced by equal cell boundaries. Row 1: FOUR opaque full-bleed seamless floor textures. Row 2: FOUR opaque full-bleed front wall textures. Row 3: FOUR separate isolated props on genuine transparent background with 10% cell margins. Row 4: FOUR separate isolated reusable landmark PARTS on genuine transparent background with 8% cell margins. All assets must fit completely inside their cells. No rooms or scene illustrations, no characters or UI, no floor behind isolated props, no lettering or watermarks.

### Blooming Deep suffix

Palette and style: Blooming Deep reference, ancient masonry overtaken by sinuous roots, sinister turquoise teal bioluminescence, pale gold and restrained violet accents. Row 1 left to right: fungal soil with tiny purple growth; velvety green moss; brown root mesh over rock; sparse teal spore carpet. Row 2: fungal masonry; dense climbing root wall; mushroom shelf wall; organic gothic carved arch niche. Row 3: small luminous mushroom cluster; tall broad-capped turquoise mushroom; swollen violet spore pod; twisted root pillar. Row 4: gothic fungal cathedral arch section; exposed luminous mycelial heart with branching roots; enormous layered mushroom canopy on stalk; root-and-fungus throne. Keep textures and objects detailed as reference, not geometric symbols.

### Catacomb suffix

Palette and style: Forgotten Catacombs reference, worn grey and brown masonry, warm candlelight, old ivory bone and skulls, solemn detailed gothic carvings. Row 1 left to right: worn flagstones; cracked burial slabs; carved burial mosaic; dusty stone with subtle scattered bone grime. Row 2: crypt masonry; stacked skull ossuary wall; candlelit burial alcove; carved gothic tomb wall. Row 3: wooden coffin; carved stone sarcophagus; prayer bench; brass candle stand with wax drips. Row 4: ornate skull shrine with shelves; recumbent saint tomb on decorated plinth; gothic bone chapel arch with saint niche; monumental carved crypt door. Rich sculptural detail, solemn restrained amber lighting.

### Salt Pits suffix

Palette and style: Salt Pits reference, bleached grey stone and blue-white translucent salt crystals, deep cold shadows and sparse amber lanterns, weathered brown wood, white salt dust. Row 1 left to right: salt-crusted stone; cracked excavated rock; embedded white crystal seam in rock; dusty mine floor with wooden rail ties. Row 2: exposed salt-rock stratum; crystal-encrusted masonry; timber mine support embedded in rock; rough excavated wall. Row 3: ore cart loaded with salt; rope winch; pickaxe and shovel; sharp blue-white crystal cluster. Row 4: gothic crystal cathedral arch section; broken shaft timber frame; massive clustered salt pillar; buried saint statue coated in salt. Distinct mineral facets and crust textures, not simple geometric icons.

## Catacomb transparency correction

Use case: background-extraction. Correct ONLY the background in the bottom two rows of this 4 by 4 sprite atlas. Remove the painted grey-and-white checkerboard completely and replace with GENUINE alpha transparency around each of the eight objects in bottom half. Keep the objects, their shapes, positions, detail, colours and original cell boundaries exactly unchanged. Keep the top two rows fully opaque and exactly unchanged. Do not draw any checkerboard, white background, grey background, black rectangle or shadow plate. Preserve 4 equal columns and 4 equal rows, no gutters or text. Eight isolated objects in bottom rows must have true transparent margins. Preserve ornate pixel art.

## Production files

- `assets/biomes/sewer-v2.png`
- `assets/biomes/fungal-v2.png`
- `assets/biomes/crypt-v2.png`
- `assets/biomes/mine-v2.png`

Each is 256×256 RGBA, containing sixteen reusable 64px source cells. Runtime floor surfaces are 32×32; walls and props retain existing rendering footprints. All scaling disables smoothing. `scripts/pack-biome-atlases.cjs` preserves generated alpha, validates it, and packs the cells. `biome-art.js` assembles landmark modules and blends neighbouring floor materials.
