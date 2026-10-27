# Replacement weapon art: source and generation prompt

Generated with the built-in image-generation tool on 2026-10-27. Style reference: `assets/flat/hero.webp`. Project source: `assets/flat/weapons-v2.png` (RGBA, 3 columns × 3 rows). No generated source pixels were repainted by the runtime: it extracts transparent cell bounds, makes native-size nearest-neighbour equipped sprites and separate 96px inventory sprites, and snaps transformations to the destination grid. Source alpha is retained; equipped silhouettes use hard alpha.

## Prompt

Create ONE production-ready WEAPON SPRITE ATLAS for Saltmarrow Deep, replacing crude procedural geometric weapons with beautifully authored detailed crisp flat 2D pixel art matching the miner reference image. Reference is STYLE/SCALE identity only; draw weapons only, NO characters or hands. Transparent background. Single square image with EXACTLY THREE COLUMNS and THREE ROWS, nine equal cells, one fully isolated weapon per cell with wide transparent margins. No text, no labels, no border, no floor, no shadows outside the objects. Render each weapon as a clean readable game sprite on a consistent logical pixel grid, deliberate clusters of pixels, restrained highlights and textured planes, dark crisp outline. Grounded dark coastal mining gothic fantasy, muted wrought steel, worn oak, brown leather, restrained old brass, bone ivory, tiny cyan or amber accents where relevant. Not cute, not shiny toy weapons, no 3D perspective render, no photorealism, no smooth painterly smears. Real material construction and asymmetry, strong silhouettes at small game size; avoid pixel confetti. All nine weapons point HORIZONTALLY RIGHT, butt/grip toward LEFT, working end toward RIGHT; no diagonal tilting. They must fit within each cell without touching the edges. Consistent view: flat side view, only a few pixels of thickness matching the reference's maul.

Row1 col1: HEAVY MINER'S MAUL: long worn wooden haft, leather lower grip, huge solid forged square steel hammer head with bevelled corners, inset dark steel face, iron rivets and brass retaining band, no holes or ornate spikes.

Row1 col2: CHAIN GAFF: short oak grip on left, substantial iron chain running horizontally into a large dangerous curved open fishing hook on right, thick forged hook with a clear inward barb and readable open negative space.

Row1 col3: MINING PICK: long oak haft horizontally, solid socket on right and a long asymmetrical double curved steel mining pick head crossing vertically at right, pointed upper beak and shorter lower chisel, worn edge.

Row2 col1: CUTPURSE KNIFE: brown leather wrapped grip at left, small brass guard, broad tapered steel blade pointing right, asymmetric sharpened edge and clear bright bevel; practical and lethal, no giant fantasy spikes.

Row2 col2: COMPACT CROSSBOW aimed right: wooden stock left, visible trigger, steel bolt rail pointing right, recurved limbs extending vertically, tight bowstring, clearly seated bolt and fletching, mechanically credible.

Row2 col3: LIGHTNING ROD: slim staff horizontal with dark wood grip left, copper wire coils and three dark iron conductor prongs at right surrounding a very small cyan glass core.

Row3 col1: CENSER FLAIL: leather bound handle left, articulated chain extending horizontally, weighted antique brass thurible at right, domed perforated cage with small orange embers visible through vents, very little glow.

Row3 col2: BARBED SCOURGE: substantial bound leather grip left, three distinct flexible iron wire tails running right in gently separated arcs, spaced sharp little barbs; clean strands, not a cloud of loose pixels.

Row3 col3: BONE FETISH: wrapped short grip left, bound carved ivory human skull effigy right with deep black sockets, small teeth, rib-like horn prongs, dark red cord knots and a tiny dull violet inset bead.

Cohesive finished game assets with significantly more craftsmanship and readable detail than generic icons. Each weapon occupies roughly 80% of its cell width. Genuine alpha transparency everywhere outside weapons.
