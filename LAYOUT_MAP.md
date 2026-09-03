# RPCG Portrait Placement Map

All coordinates use the fixed 1080×1920 authored canvas. They do not change when the complete frame is scaled for a PC monitor.

## Menu

| Element | X | Y | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| RPCG title zone | 198 | 172 | 330 | 126 |
| Knight status chip | 135 | 391 | 190 | 74 |
| Bronze balance | 764 | 392 | 214 | 70 |
| Active Knight card | 130 | 500 | 275 | 416 |
| Active Hero copy | 147 | 951 | 290 | 150 |
| Change Deck | 153 | 1178 | 233 | 76 |
| Destination column | 484 | 495 | 493 | 835 |
| Battle destination | 484 | 495 | 493 | 170 |
| Equip destination | 484 | 720 | 493 | 170 |
| Forge destination | 484 | 945 | 493 | 170 |
| Shop destination | 484 | 1160 | 493 | 170 |

## Card Shop

| Element | X | Y | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| Stock column | 80 | 266 | 230 | 810 |
| Bronze balance | 786 | 252 | 214 | 72 |
| Sell panel | 780 | 352 | 220 | 445 |
| Gold 5-card booster visible bounds | 296 | 848 | 332 | 186 |
| Starter deck visible bounds | 628 | 855 | 93 | 156 |
| 3-card booster visible bounds | 745 | 838 | 301 | 196 |
| Back button | centered | 1596 | 230 minimum | 78 |

The three products are stored as transparent 1080×1920 overlays. Their visible bounds above are measured from alpha, while each PNG itself remains pinned at `(0,0)`.

Mouse hit areas are slightly padded around those visible bounds for easier PC clicking. Hovering a hit area applies the glow to the original transparent shelf overlay, so the authored product placement does not shift.

## Equipment

| Element | X | Y | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| Hero card rail | 128 | 366 | 824 | 250 |
| Bronze balance | 433 | 266 | 214 | 72 |
| Owned-card board | 128 | 650 | 824 | 904 |
| Back button | centered | 1598 | 230 minimum | 78 |

## Forge

| Element | X | Y | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| Bronze balance | 800 | 118 | 214 | 72 |
| Three-card input row | 274 | 346 | 532 | 200 |
| Forged-card preview | 344 | 565 | 408 | 568 |
| Merge button | 438 | 1186 | 208 | 67 minimum |
| Back button | centered | 1597 | 230 minimum | 78 |

## Battle

| Element | X | Y | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| Enemy HUD | centered | 74 | 680 | automatic |
| Knight pose | 18 | 585 | automatic | 900 |
| Wolf pose | 650 | 600 | automatic | 565 |
| Five-card hand | centered | 1270 | 980 | 355 |
| Player Health/Mana bars | centered | 165 from bottom | 860 | 116 |
| Escape | 55 | 1796 | 220 | 74 |
| Skip Boost / Skip Skill row | 290 | 1796 | 510 | 74 |
| End Turn | 815 | 1796 | 210 | 74 |

## V10 Healers / Cave Flow
- Menu now has a fifth destination tile: HEAL.
- Healers screen uses two recovery stations. One active deck = 30 seconds; a second simultaneously active deck = 60 seconds.
- Battle Health/Mana persist between encounters.
- Five consecutive victories offer the optional four-fight Cave gauntlet.
- Cave fights 1–3 use the regular enemy pool; fight 4 is Goblin King at player level +5. Escape is disabled in the Cave.
- Standard enemy level = player +1 to +3. Eligible Avenger enemy = player +10 at a 5% roll.
