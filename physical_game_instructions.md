# Airlock: Physical Component Manufacturing Guide

This guide details the exact text, counts, engineering dimensions, and graphic design requirements needed to manufacture the physical board game product.

---

## 1. Physical Dimensions & Materials

**The Main Board:**
- **Material:** 2mm thick dense punchboard (chipboard) with a matte finish.
- **Dimensions:** Hexagonal shape, approximately 60cm (600mm) flat-to-flat. 
- **Hex Slots:** Each individual token slot on the board (Core, Zones) should be carved or printed as a hexagon measuring **40mm flat-to-flat**.
- **Filter Grooves:** Cut a 3mm wide, 3mm deep straight groove horizontally across the *center* of each Zone hex. The groove span should be exactly **36mm** wide to perfectly fit the filter cards. 

**The Tokens (Pollutants):**
- **Material:** 3mm thick laser-cut acrylic.
- **Dimensions:** Approximately **15mm** across their widest point, and **3mm** thick. 
- *Note on Text:* Text must be strictly 6 characters or fewer to remain legible on the small acrylic surface.

## 2. Pollutant Tokens Breakdown

Tokens are drawn blindly by shape to represent categories. Players feel for the shape, but visually read the specific name to learn the chemical/compound. 

**Yellow Circles (PM10 - Coarse Particles)** - Quantity: 36 Total
- *Shape:* Flat, round acrylic discs (15x3mm).
- 9x engraved with "Dust"
- 9x engraved with "Pollen" 
- 9x engraved with "Spores"
- 9x engraved with "Ash"

**Red Triangles (PM2.5 - Fine Particles)** - Quantity: 24 Total
- *Shape:* Equilateral acrylic triangles (15x3mm).
- 6x engraved with "Smoke"
- 6x engraved with "Soot"
- 6x engraved with "SO4"
- 6x engraved with "NO3"

**Purple Octagons (GAS - Toxic Fumes)** - Quantity: 20 Total
- *Shape:* 8-sided acrylic polygons (15x3mm).
- 5x engraved with "CO"
- 5x engraved with "SO2"
- 5x engraved with "NO2"
- 5x engraved with "CO2"

## 3. Designing the Filter Cards (36 Cards)

**Card Dimensions:** **35mm wide x 50mm tall (Custom Portrait miniature cards).**
*Why this size?* Because a 40mm hex flat-to-flat cannot fit a standard Euro card without clipping neighboring zones! To fix this clearance issue, the filters must be 35mm wide, slotting perfectly into the 36mm wide board grooves. The 50mm height gives you the lines needed for the educational text.

**Front Card Layout (No Images):**
Because the cards are extremely small to fit in the hexes, **we must remove all artwork** to maximize readability.
- **Top Center:** Bold text (e.g., **"MESH"**).
- **Top Left & Right:** "Cost: 4SC" and "Sell: 2SC".
- **Center (The "Catch" Icons):** Big simple icons displaying the exact shapes the filter catches (e.g., a large isolated Yellow Circle and Red Triangle).
- **Bottom Edge:** The full educational flavor text (takes up multiple lines, small crisp font).

**Back of Cards:**
A unified blueprint pattern so they can be shuffled face-down into a pile.

### Exact Filter Deck Content:

**10x MESH** (Cost: 4 SC | Sell Value: 2 SC)
- *Catches:* Yellow Circle Icon
- *Text:* "A basic mechanical wire matrix. Fine particles and gases pass right through the gaps."

**8x CARBON** (Cost: 6 SC | Sell Value: 3 SC)
- *Catches:* Purple Octagon Icon
- *Text:* "Activated carbon has millions of microscopic pores that trap toxic gas molecules via chemical adsorption."

**7x HEPA** (Cost: 9 SC | Sell Value: 4 SC)
- *Catches:* Yellow Circle Icon + Red Triangle Icon
- *Text:* "High-Efficiency Particulate Air. A dense mat of fibers designed to snag particles as tiny as 0.3 micrometers."

**6x ELECTROSTATIC** (Cost: 9 SC | Sell Value: 4 SC)
- *Catches:* Yellow Circle Icon + Red Triangle Icon
- *Text:* "Charges incoming particles with high voltage so they stick to oppositely-charged metal collection plates."

**5x SCRUBBER** (Cost: 10 SC | Sell Value: 5 SC)
- *Catches:* Yellow Circle Icon + Purple Octagon Icon
- *Text:* "Sprays a continuous wet mist of reactive chemicals to neutralize toxic exhaust acids and wash out heavy dust."

## 4. Climate Event Cards (5 Cards Total)
**Card Dimensions:** Standard poker size (63x88mm). Placed openly on the table when drawn on rounds 4, 9, and 14.
**Design:** Large, dramatic artwork covering the top 60% of the card, with the rule text below.

**Wildfire Surge**
- *Effect:* "When drawing emission this round, strictly draw 1 Red Triangle and 1 Yellow Circle and add them to the wave."
- *Flavor:* "Biomass combustion floods the city. While ash is visible, the invisible fine smoke is the true killer."

**Thermal Inversion**
- *Effect:* "The Deflect action cannot be used this round."
- *Flavor:* "A layer of warm air acts like a lid, trapping cold, smoggy air near the ground. Fans are useless against the pressure."

**High Humidity**
- *Effect:* "CARBON filters catch nothing this round."
- *Flavor:* "Water vapor floods the atmosphere, filling up the active carbon pores."

**Industrial Accident**
- *Effect:* "Immediately take 2 Purple Octagons from the supply. Put one in the Core of the windrose lane, and one in the Core of the lane clockwise to it."
- *Flavor:* "A ruptured pipeline releases a sudden, concentrated burst of toxic chemicals."

**Drizzle**
- *Effect:* "Immediately remove exactly 1 Yellow Circle from every District that has one. Return them to the supply box."
- *Flavor:* "Wet precipitation washes large, heavy particles out of the air—but it's not acidic enough to remove fine smog."

## 5. Printed Board & Miscellaneous Components

**The District Zone (Printed on Board)**
- "End Game Bonus: +5 VP if completely clean (0 tokens)."
- "End Game Bonus: +3 VP if somewhat clean (1 or 2 tokens)."
- "0 VP if 3 or more tokens!"

**Round Tracker Board (Printed on Side)**
- Three decks of **5 Emission Cards** placed on slots along the board.
- Space 1-5 (Green). Text: "Tier 1 Emission Deck".
- Space 6-10 (Yellow). Text: "Tier 2 Emission Deck".
- Space 11-15 (Red). Text: "Tier 3 Emission Deck".
- *Highlight or bold slots 4, 9, and 14 with a warning icon: "Draw Climate Event".*

## 6. Emission Deck Cards (15 Cards Total)
**Card Dimensions:** Mini-Euro size (44x68mm) or standard poker size.
**Front Layout:** A simple table indicating "2P Spawn" and "3P Spawn". Replace VOC with GAS (Purple Octagons) icon.

**Tier 1 Deck (5 Cards, Green Backs):**
- **1-1:** 2PM10 | 3PM10
- **1-2:** 2PM10, 1GAS | 3PM10, 1GAS
- **1-3:** 3PM10 | 3PM10, 1PM2.5
- **1-4:** 2PM10, 1GAS | 2PM10, 1GAS, 1PM2.5
- **1-5:** 2PM10, 1PM2.5 | 3PM10, 1PM2.5

**Tier 2 Deck (5 Cards, Yellow Backs):**
- **2-1:** 2PM10, 1GAS | 2PM10, 2GAS, 1PM2.5
- **2-2:** 1PM10, 2GAS | 2PM10, 2GAS, 1PM2.5
- **2-3:** 2PM10, 1GAS, 1PM2.5 | 3PM10, 1GAS, 2PM2.5
- **2-4:** 1PM10, 1GAS, 1PM2.5 | 2PM10, 2GAS, 1PM2.5
- **2-5:** 2PM10, 1GAS, 1PM2.5 | 2PM10, 2GAS, 2PM2.5

**Tier 3 Deck (5 Cards, Red Backs):**
- **3-1:** 1PM10, 1GAS, 2PM2.5 | 2PM10, 2GAS, 2PM2.5
- **3-2:** 2PM10, 1GAS, 2PM2.5 | 2PM10, 2GAS, 3PM2.5
- **3-3:** 1PM10, 2GAS, 2PM2.5 | 1PM10, 3GAS, 3PM2.5
- **3-4:** 1PM10, 1GAS, 3PM2.5 | 2PM10, 2GAS, 3PM2.5
- **3-5:** 2PM10, 2GAS, 2PM2.5 | 3PM10, 2GAS, 3PM2.5

## 7. Other Miscellaneous Components
- **65x SC Coins:** 40x "1-SC", 15x "3-SC", 10x "5-SC" (2mm punchboard rounds, 20mm diameter).
- **1x Purify Die:** A white 16mm D6 with custom faces printed: `1`, `1`, `1`, `2`, `2`, `3`. 
- **1x Windrose Spinner:** A punchboard arrow riveted to the center of the board.
- **VP Tracking:** Victory Points are tracked physically by players keeping the pollutant tokens they capture. No separate VP tokens are needed.
