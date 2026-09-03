# RPCG 1080×1920 Portrait Foundation V16

This is the card-only six-screen foundation. The authored game frame always remains **1080×1920 portrait**, including on a PC. A 1920×1080 monitor displays the complete portrait frame centered at 56.25% scale; the layout is never converted to landscape.

## Run

Keep `index.html`, `styles.css`, `game.js`, and `assets/` together. Open `index.html` in Chrome or Edge. No server or installation is required.

## Six user-facing screens

1. Menu
2. Battle
3. Card Shop
4. Equipment
5. Forge
6. Healers

Card previews, confirmations, card pickers, Battle results, and Forge results are overlays rather than additional screens.

## Foundation direction

- The clean portrait PNGs are the real screen backgrounds.
- The four grid JPGs are retained under `docs/placement_guides/` only as coordinate references. They are not rendered in the game.
- Menu, Shop, Equipment, and Forge follow the supplied placement examples.
- Mobile-specific controls and final UI polish are deliberately deferred until the placement foundation feels right.

## Battle preserved from the V4 direction

- Full 1080×1920 Battle background.
- V4 Knight pose and the original 1440×1920 Wolf Battle PNG.
- V4 portrait composition: enemy HUD at top, cinematic Knight/Wolf stage, five-card hand, player Health/Mana bars, and the bottom Escape / Skip Boost / Skip Skill / End Turn row.
- V4 turn sequence: one Boost phase followed by one Skill phase, with explicit skip controls and no Energy system.
- Twenty-card Knight starter deck using the V4 counts and core Bronze effects.
- Standard Battle enemies enter 1–3 levels above the player. Eligible enemies have a 5% Avenger roll at +10 levels. Knight Health/Mana and enemy combat stats scale with Hero Level; enemy type still determines its base toughness, damage, and special effects.

## Shop placement

The supplied product PNGs are full-canvas transparent overlays, so no cropping or guessed offsets are used:

- Gold 5-card booster display: `(296, 848)`
- Knight starter deck: `(628, 855)`
- 3-card booster display: `(745, 838)`

The first rotating stock contains Power Strike for 50 Bronze and Elemental Storm for 100 Bronze, matching the placement sheet.

## Shop interaction pass

- The 3-card booster chest, starter-deck display, and 5-card booster chest are real mouse targets at their authored shelf positions.
- Hover/focus brightens the matching shelf art instead of moving it.
- Clicking the 3-card or 5-card display opens the supplied package art in a purchase overlay.
- Clicking the starter display opens all four supplied Mage, Knight, Healer, and Warrior starter-deck packages at once.
- Starter decks remain available after purchase and can be bought repeatedly.
- Current economy hooks use the existing Bazaar values: 3-card pack = 250 Bronze, 5-card Gold pack = 1 Silver, starter deck = 10 Silver.
- 5-card packs guarantee one Silver; extra Silver pulls are ultra rare and Gold is 1% on each non-guaranteed pull. The 3-card pack has a 4% Silver chance per card and no guarantee.

## Current mechanics

- Purchases and spare-card selling.
- Active-deck copies protected from selling and forging.
- Equipment add/remove controls with a 20-card maximum.
- Forge converts three spare matching copies from Bronze → Silver → Gold.
- Battle supports Boost/Skill phases, Mana costs, Block, Shield Up, Stun, Bleed, Poison, Steady Stance, card draw, discard recycling, victory, and defeat.
- Progress is stored locally under the V3 save key.

## Controls

- Mouse click activates every destination tile, card, picker, Back button, and Battle control on PC.
- Hover/focus feedback highlights all interactive menu and card targets; hovering a Battle card enlarges it upward for PC reading.
- `Esc` closes the top overlay or returns to Menu.

## Restored reveal effects

- Forge now uses the earlier fusion sequence: three source cards flash, converge into a spinning gold energy orb, vanish, and the upgraded card flips into view before Continue unlocks.
- Booster purchases now leave the normal shop panel and enter a dedicated reveal stage. The pack shifts upward, mystery cards deal onto the screen, and each card must be clicked to flip and reveal its pull.
- The 3-card and 5-card versions use the same reveal behavior, with a portrait-friendly 3-card row / 5-card 3+2 layout.

The V10 interaction pass intentionally retains the V3 local-save key so existing portrait-foundation progress is not discarded.

See `LAYOUT_MAP.md` for the authored coordinates and `ASSET_MANIFEST.md` for the included visual inventory.


## V7 encounter rotation
- Normal battles randomize among 10 standard enemies.
- Goblin Coin Carrier has an 8% chance to replace a normal encounter.
- Every 5 normal-cycle wins forces the next battle to be either the Goblin King or one of the four rival hero encounters.
- Winning the Boss/Hero encounter resets the five-win cycle. Losing keeps the Boss/Hero encounter due until it is cleared.


## V8 level scaling + battle economy
- Every battle enemy is assigned the player's current Hero Level and the HUD displays the matching level.
- Knight battle Health scales from 120 at Level 1 by +12 Health per level. Mana starts at 50 and gains +1 per level.
- Enemy Health and damage scale with Hero Level while preserving creature identity. Bosses and rival heroes receive additional combat multipliers so a same-level boss still feels stronger than a same-level Wolf.
- Giant Spider Poison damage also scales with level; its status-effect threat is reflected in a higher Bronze reward band.
- Normal enemies pay Bronze only. Their Level 1 base reward bands are: Wolf 25–40, Goblin Scout 30–45, Bandit 35–55, Boar 40–65, Giant Spider 40–65, Bandit Outrider 50–75, Armored Goblin 55–85, Traveling Mercenaries 60–95, Berserk Goblin 65–105, Owlbear 75–120. Normal Bronze bands rise 1.5% per Hero Level after Level 1.
- Goblin Coin Carrier is an 8% special roll during the normal cycle and pays an exact jackpot of **200–600 Bronze + 2–3 Silver**.
- Goblin King and all four Rival Hero encounters guarantee **1–2 Silver** plus a level-scaled Bronze reward.
- The old automatic “1 Silver every third win” reward was removed so Silver now comes from the intended special/boss/hero encounters.


## V10 enemy battle AI + currency HUD

- Silver is now visible on the main menu directly beside Bronze.
- Coin Carrier special encounter chance reduced from 20% to **8%**.
- Coin Carrier victories do **not** advance the five-normal-win Boss/Hero counter.
- All 16 battle enemies now have their own Boost and Skill/Special move pools.
- Enemy Mana is spent on special attacks and regenerates during enemy turns.
- Enemy Boosts visibly power up, guard, heal, restore Mana, or prepare status attacks.
- Poison, Burn, Bleed, and Stagger can now be inflicted by appropriate enemy moves. Stagger skips the player's next Boost Phase.
- Rival Knight, Mage, Warrior, and Healer use recognizable class-style abilities rather than generic attacks.
- Goblin King has dedicated boss Boosts and multiple special attacks.


## V10 additions
- Persistent Knight Health/Mana between battles.
- Healers room with two recovery beds: 30s for one active deck, 60s when another deck is already healing.
- Five consecutive wins trigger the optional Cave prompt. Cave is four fights back-to-back with no escape; the final Goblin King is always player level +5.
- Normal enemies are player level +1 to +3. A 5% Avenger roll makes eligible enemies player level +10.
- Equipment and Forge inventory labels now show total copies owned.


## V11 card scaling + Finisher Forge repair

- Restored Hero-Level scaling directly into live card calculations, not just card text.
- Knight level-scaling rules now use the established Bronze / Silver / Gold progression: +2 / +3 / +4 per Hero Level where defined.
- Executioner’s Swing now ranks Bronze → Silver → Gold in the Forge and uses 75 +2/Lv, 90 +3/Lv, and 110 +4/Lv.
- Rising Slash, Shield Up, and Sword & Shield are also restored as rankable Knight cards because their Silver/Gold rules exist.
- Elemental Storm now has Bronze/Silver/Gold Finisher rules and level scaling.
- Card detail panels show the current calculated value, including the base + per-level formula.
- Finisher recoil is live: Executioner’s Swing can remove the player’s next Skill Phase at the proper 50% / 40% / 30% rank chances.
- Silver/Gold rules that do not yet have final portrait art use the Bronze image as a safe temporary visual fallback while retaining the correct rank badge, stats, inventory, and Forge behavior.
- DOM smoke tests now explicitly verify Level 50 Gold Executioner’s Swing = 310 damage and Finisher Bronze → Silver forging without consuming an equipped copy.


## V12 potion ranks + full supplied card art

- Replaced the grid-backed Menu image with the clean `assets/backgrounds/menu_mobile.png` runtime background.
- Ingested every unique supplied card image from `cards(1).zip` into the runtime card library.
- Health Potion ranks: Bronze 30 HP, Silver 60 HP, Gold 100 HP.
- Mana Potion ranks: Bronze 20 MP, Silver 40 MP + draw 1, Gold 80 MP + draw 1.
- Remedy ranks: Bronze clears status; Silver clears status and prevents new status until the next turn; Gold also heals 50 HP.
- All three potion families can Forge Bronze → Silver → Gold with the standard 3-spare-copy rule. No Forge level gate is active.
- Booster packs roll the potion family at 1 in 50 per eligible card slot. Silver potion drops require Hero Level 50; Gold potion drops require Hero Level 100.
- Potions are removed from the ordinary booster pool so the 1-in-50 rule is the only booster path for them.


## V13 combat strategy + progression polish

- Added **Study Enemy** beside the enemy Health/Mana HUD. It replaces the player's Skill action, can be used once per encounter, and reveals the enemy's next **3 actual planned turns**. The AI follows the revealed plan unless a move becomes impossible.
- Battle HUD now shows both **Cave streak progress (0/5)** and **Boss/Hero progress (0/5)**. During a Cave run it changes to **CAVE 1/4 … 4/4 • NO ESCAPE**.
- Avengers now receive a full-screen **AVENGER ENCOUNTER** entrance, stronger visual aura, optional synthesized audio sting where browser audio is allowed, **+75% Bronze**, and bonus Silver.
- Hero leveling now uses current-level XP rather than cumulative XP: Level 1 requires **100 XP**, Level 2 requires **200 XP**, Level 3 requires **300 XP**, and so on. On level-up the XP bar always resets to **0** with no overflow carry.
- Added an animated Level Up overlay that visibly counts Max Health and Max Mana upward and confirms that card level-scaling bonuses increased.
- Poison, Bleed, Burn, Stagger, and Stun now have distinct colored bursts, damage-number popups, red damage flashes, and visible status chips while active.
- Battle card play now has a dedicated card flash. Boosts power up the hero visually, and Finishers use a stronger lunge, red slash, and screen impact.
- Goblin King enters **Royal Fury at 50% HP**: art grows 35%, permanent attack output gains 15%, and two phase-two moves unlock. **Inventory** chooses the best available card from his move pool; **Goblin's Club** costs 25% of max Mana, has a 60% full-turn Stun chance, and gains +20% damage every time it is used.
- Healers recovery timers now fill with a colored progress bar: green for the 30-second solo recovery and amber for the 60-second second-deck recovery.
- Equipment keeps a clean Name sort plus Mage / Knight / Warrior / Healer class filters, with separate Bronze / Silver / Gold Rank and Boost / Skill / Finisher Type filters. Forge uses the same class filtering while only listing ranks that can still be merged.

## V14 economy + enemy scaling update

- Every enemy now uses explicit per-level Health, Mana, and attack growth instead of the old low percentage multiplier.
- Example: Goblin Scout at Level 25 is 280 HP / 52 Mana before encounter-specific actions.
- Forge fees: normal Bronze→Silver 100 Bronze; Finisher Bronze→Silver 150 Bronze; all Silver→Gold 500 Bronze + 1 Silver.
- Shop currency exchange: 500 Bronze ↔ 1 Silver.
- Forge confirmation previews the post-transaction Bronze/Silver balances.


## V15 multi-Hero deck + Equipment repair

- Purchased Mage, Warrior, and Healer starter decks now become real selectable 20-card decks instead of collection-only purchases. Existing pre-V15 starter purchases migrate automatically on load.
- Knight, Mage, Warrior, and Healer now keep independent **Level, XP, active deck, Health, and Mana** state. Battle launches the Hero selected from Equipment.
- The Equipment Hero rail replaces the old simple rank caption with each Hero's **Level, current XP / next-level XP, and animated XP progress bar**. Locked Heroes remain visible but cannot be selected until their starter deck is owned.
- XP is no longer shown on the main Menu.
- Equipment SORT now contains **Name / Mage / Knight / Warrior / Healer**. Rank remains a separate **All / Bronze / Silver / Gold** filter, and Type remains **All / Boost / Skill / Finisher**.
- Forge uses the same Hero filtering and preserves cross-deck reservations so a merge cannot consume copies equipped by another Hero.
- All four supplied Bronze starter sets now have runtime card definitions and battle hooks. The full Bronze runtime library contains **45 card images/definitions**, including the extra Sword Block and Radiant Bolt cards plus the three universal potion cards.
- Repaired the zero-byte Bronze Sword Strike runtime asset. Gold Remedy was also found empty during validation and repaired from the supplied card archive. Runtime validation now reports no zero-byte card assets.


## V16 identity + battle VFX + audio pass

- Replaced the old plain RPCG Menu wordmark with the forged triangular RPCG emblem centered above the HUD.
- Added Music and Sound FX sliders directly below Change Deck. Settings persist locally.
- `bazaar_market_loop.mp3` is the persistent background loop across Menu, Battle, Shop, Equipment, Forge, and Healers after the browser receives its first user interaction.
- Added the supplied `battle_rhythm_encounter.mp3` to the audio library for later encounter-specific use; the active V16 music direction intentionally keeps the Bazaar loop running everywhere.
- Replaced the old generated mystery-card pattern with the supplied RPCG card back for every face-down booster card.
- Battle card presentation now clears before the attack VFX begins: card confirm → card exits → action effect → damage/status feedback.
- Knight and Warrior Skills use screen-slash / impact effects. Finishers add triple slashes, a larger boom, stronger shake, and heavier synthesized impact audio.
- Mage Fireball fires a visible projectile, Ice Shards launch blue crystal shards, Chain Lightning calls a lightning strike, and Elemental Storm layers multiple elemental effects.
- Healer offensive Skills use white/gold radiant light effects.
- Updated player-facing Mage, Warrior, and Healer Battle sprites from the supplied corrected poses.
- Replaced all four Equipment/Menu Hero cards with the supplied current 1024×1536 Hero Card art.

## V18 polish
- Stabilized Battle card hover with stationary card slots.
- Removed the redundant Hero-level badge from Battle.
- Boost and Skill prompts now explicitly say that the phase can be skipped.
- Study Enemy is neon green with a pulse while available.
- Shop currency exchange moved higher and enlarged.
