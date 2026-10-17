# IconLi roadmap: becoming a top-3 icon library

**Goal:** someone looking for any icon finds it on IconLi, in outline, solid and duotone, drawn to the Signature style.
For reference, Lucide has ~1,500 icons, Phosphor ~1,500 × 6 weights, Tabler ~5,900, and Material Symbols ~3,800.
We aim for **3,000+ families (9,000+ glyphs)**, plus the animated set that the others don't offer.

## Quality bar (every batch)
1. Drawn on the 24px grid with a 2px safe area, a 1.5px stroke and round caps and joins. Optical fit: glyphs ~12px, objects 19–20px.
2. Outline, solid and duotone from one drawing (`b` / `d` / `o` / `k`). Solids fill the main body and knock out details.
3. Checked visually next to the Signature set before release, plus the automated checks (no blank glyphs, inside the safe area, drawer and token tests).
4. Original drawings only, never traced or copied from other sets, so everything can ship free under CC BY 4.0.
5. Rich search tags (synonyms and use cases) on every icon.

## Where we are
**Library today: 593 families · 1,477 glyphs · 26 categories.**

| Status | Category | Families now | Target |
| --- | --- | ---: | ---: |
| ✅ | Animated (hover motion) | 35 | 150 |
| ✅ | Interface | 107 | 250 |
| ✅ | Arrows | 40 | 160 |
| ✅ | Communication | 24 | 90 |
| ✅ | Media | 37 | 120 |
| ✅ | Files | 22 | 90 |
| ✅ | Devices | 20 | 100 |
| ✅ | Connectivity | 15 | 50 |
| ✅ | Commerce & Finance | 28 | 120 |
| ✅ | Office & Business *(new, batch 1)* | 30 | 70 |
| ✅ | People | 27 | 80 |
| ✅ | Social & Emotions | 14 | 70 |
| ✅ | Security | 14 | 60 |
| ✅ | Weather & Nature | 20 | 90 |
| ✅ | Space & Galaxy | 14 | 40 |
| ✅ | Travel & Places | 18 | 90 |
| ✅ | Health | 9 | 100 |
| ✅ | Food & Drink | 9 | 100 |
| ✅ | Education & Science | 13 | 70 |
| ✅ | Design | 15 | 80 |
| ✅ | Text & Editor | 16 | 70 |
| ✅ | Development & AI | 12 | 120 |
| ✅ | Charts & Data | 10 | 60 |
| ✅ | Time | 12 | 40 |
| ✅ | Home & Lifestyle | 9 | 80 |
| ✅ | Sports & Games | 22 | 90 |

## New categories to add (gaps vs. the top libraries)
| Priority | Category | Examples | Target |
| --- | --- | --- | ---: |
| P1 | ~~Office & Business~~ (batch 1 shipped, 30) | briefcase, meeting, contract, stamp, handshake, org chart, invoice, KPI, presentation board | 70 |
| P1 | Vehicles & Transport | motorcycle, scooter, tram, helicopter, taxi, ambulance, tractor, ferry, EV charger | 70 |
| P1 | Buildings & Architecture | house types, skyscraper, factory, school, church, mosque, temple, hospital, bridge, tent | 60 |
| P1 | Currency & Crypto | dollar, euro, pound, yen, rupee, taka, bitcoin, ethereum, exchange, wallet types | 50 |
| P1 | Animals & Pets | cat, dog, bird, fish, horse, rabbit, turtle, butterfly, bug, paw variants | 70 |
| P1 | Tools & Construction | hammer, wrench, screwdriver, saw, drill, ruler, toolbox, helmet, cone, crane | 60 |
| P2 | Kitchen & Household | pan, pot, oven, fridge, washer, kettle, blender, broom, iron, laundry symbols | 70 |
| P2 | Fashion & Beauty | dress, shoe, heel, cap, lipstick, mirror, scissors, ring, necklace, handbag | 60 |
| P2 | Celebrations & Holidays | balloon, gift, fireworks, cake, party hat, confetti, candle, tree, lantern, crescent | 50 |
| P2 | Music & Instruments | guitar, piano, drum, violin, saxophone, microphone stand, headset, vinyl, metronome | 50 |
| P2 | Smart Home & IoT | thermostat, smart plug, bulb, camera, doorbell, sensor, router, hub, robot vacuum | 50 |
| P2 | Cloud & DevOps | server rack, container, pipeline, deploy, API, terminal variants, branch, webhook, CDN | 60 |
| P2 | Medical & Anatomy | heart organ, lungs, brain, tooth, bone, eye, ear, DNA, virus, bandage, wheelchair | 80 |
| P3 | Shapes & Geometry | polygons, stars, 3D solids, blobs, frames | 60 |
| P3 | Math, Numbers & Letters | 0–9, A–Z in circle and square, operators, functions, sigma, pi | 120 |
| P3 | Gestures & Hands | tap, swipe, pinch, point, ok, peace, wave, grab | 40 |
| P3 | Photography & Video | lens, tripod, flash, film roll, shutter, focus, exposure, RAW | 40 |
| P3 | Energy & Environment | solar, wind turbine, battery, plug, leaf, recycle, CO₂, water saving | 50 |
| P3 | Logistics & Delivery | warehouse, pallet, forklift, container, barcode, tracking, drone delivery | 40 |
| P3 | Legal & Government | scale of justice, gavel, document seal, ID, vote, passport | 30 |
| P3 | Agriculture | tractor, wheat, barn, watering can, seedling, greenhouse | 30 |
| P3 | Accessibility | wheelchair, sign language, braille, hearing aid, captions, low vision | 25 |

**Brand logos are intentionally excluded.** They're trademarks, and a CC BY library can't license them.

## Release rhythm
- One category batch at a time (40–70 families), each in its own file: `assets/js/icons-cat-<name>.js`.
- After every batch: run the visual review sheet, the automated checks and `node scripts/build.mjs`, then regenerate `icons-fit.js` (`IconLi.fitTable()`).
- The order follows the P1 → P3 list above, and existing thin categories (Health, Food, Home) get a deepening pass in between.
