# RPCG Portrait Foundation Asset Manifest

The build contains 56 runtime image assets plus four placement-guide JPGs.

## Portrait runtime backgrounds — 1080×1920

- `assets/backgrounds/menu_mobile.png`
- `assets/backgrounds/battle_mobile.png`
- `assets/backgrounds/shop_mobile.png`
- `assets/backgrounds/equipment_mobile.png`
- `assets/backgrounds/forge_mobile.png`

## Landscape crops used inside Menu destination buttons

- `assets/backgrounds/battle.jpg` — 1600×900
- `assets/backgrounds/equipment.webp` — 1920×1080
- `assets/backgrounds/forge.webp` — 1920×1080
- `assets/backgrounds/merchant.webp` — 1672×941
- `assets/backgrounds/menu.jpg` — 1600×900, retained as a source crop

## Shop product overlays — transparent 1080×1920 canvases

- `assets/overlays/booster_5card.png`
- `assets/overlays/starter_decks.png`
- `assets/overlays/booster_3card.png`

## Shop purchase art

- `assets/products/booster_3card.png`
- `assets/products/booster_5card.png`
- `assets/products/starter_mage.png`
- `assets/products/starter_knight.png`
- `assets/products/starter_healer.png`
- `assets/products/starter_warrior.png`

These are the supplied package PNGs shown after the player clicks the matching product display.

## Bronze cards — 45 runtime card images

- `assets/cards/bronze/adrenaline_rush.webp`
- `assets/cards/bronze/arcane_barrier.webp`
- `assets/cards/bronze/basic_teleport.webp`
- `assets/cards/bronze/blessed_shield.webp`
- `assets/cards/bronze/block.webp`
- `assets/cards/bronze/chain_lightning.webp`
- `assets/cards/bronze/charge.webp`
- `assets/cards/bronze/cleanse.webp`
- `assets/cards/bronze/divine_favor.webp`
- `assets/cards/bronze/double_strike.webp`
- `assets/cards/bronze/elemental_storm.webp`
- `assets/cards/bronze/executioners_swing.webp`
- `assets/cards/bronze/fireball.webp`
- `assets/cards/bronze/focus.webp`
- `assets/cards/bronze/guarding_prayer.webp`
- `assets/cards/bronze/heal_wounds.webp`
- `assets/cards/bronze/health_potion.webp`
- `assets/cards/bronze/ice_shards.webp`
- `assets/cards/bronze/iron_resolve.webp`
- `assets/cards/bronze/light_strike.webp`
- `assets/cards/bronze/magic_bolt.webp`
- `assets/cards/bronze/magic_shield.webp`
- `assets/cards/bronze/mana_drain.webp`
- `assets/cards/bronze/mana_potion.webp`
- `assets/cards/bronze/power_strike.webp`
- `assets/cards/bronze/prayer_focus.webp`
- `assets/cards/bronze/punch.webp`
- `assets/cards/bronze/radiant_bolt.webp`
- `assets/cards/bronze/radiant_light.webp`
- `assets/cards/bronze/remedy.webp`
- `assets/cards/bronze/rising_slash.webp`
- `assets/cards/bronze/sacred_flames.webp`
- `assets/cards/bronze/second_breath.webp`
- `assets/cards/bronze/second_wind.webp`
- `assets/cards/bronze/shield_bash.webp`
- `assets/cards/bronze/shield_block.webp`
- `assets/cards/bronze/shield_up.webp`
- `assets/cards/bronze/smash.webp`
- `assets/cards/bronze/steady_stance.webp`
- `assets/cards/bronze/sword_and_shield.webp`
- `assets/cards/bronze/sword_block.webp`
- `assets/cards/bronze/sword_combo.webp`
- `assets/cards/bronze/sword_strike.webp`
- `assets/cards/bronze/taunt.webp`
- `assets/cards/bronze/wild_swing.webp`

All Bronze cards are 1024×1536 except `radiant_bolt.webp` and `sword_block.webp`, which are 640×960 source cards. All 45 files have matching runtime gameplay definitions.

## Silver cards — 13 runtime card images

- `assets/cards/silver/executioners_swing.webp`
- `assets/cards/silver/health_potion.webp`
- `assets/cards/silver/iron_resolve.webp`
- `assets/cards/silver/mana_potion.webp`
- `assets/cards/silver/remedy.webp`
- `assets/cards/silver/rising_slash.webp`
- `assets/cards/silver/shield_bash.webp`
- `assets/cards/silver/shield_block.webp`
- `assets/cards/silver/shield_up.webp`
- `assets/cards/silver/steady_stance.webp`
- `assets/cards/silver/sword_and_shield.webp`
- `assets/cards/silver/sword_combo.webp`
- `assets/cards/silver/sword_strike.webp`

All Silver cards are 1024×1536.

## Gold cards — 13 runtime card images

- `assets/cards/gold/executioners_swing.webp`
- `assets/cards/gold/health_potion.webp`
- `assets/cards/gold/iron_resolve.webp`
- `assets/cards/gold/mana_potion.webp`
- `assets/cards/gold/remedy.webp`
- `assets/cards/gold/rising_slash.webp`
- `assets/cards/gold/shield_bash.webp`
- `assets/cards/gold/shield_block.webp`
- `assets/cards/gold/shield_up.webp`
- `assets/cards/gold/steady_stance.webp`
- `assets/cards/gold/sword_and_shield.webp`
- `assets/cards/gold/sword_combo.webp`
- `assets/cards/gold/sword_strike.webp`

All Gold cards are 1024×1536.

## Characters

- `assets/characters/knight.webp` — 675×900; byte-identical to the V4 Knight Battle pose
- `assets/characters/wolf_battle.png` — 1440×1920; original V4 Wolf Battle pose
- `assets/characters/knight_card.webp` — 640×960
- `assets/characters/knight_portrait.webp` — 675×900
- `assets/characters/wolf.webp` — 675×900, retained as an alternate crop
- `assets/characters/forge_master.webp` — 1920×1080, retained source art

## Hero cards — all 1024×1536

- `assets/heroes/mage_card.webp`
- `assets/heroes/knight_card.webp`
- `assets/heroes/healer_card.webp`
- `assets/heroes/warrior_card.webp`

## Placement guides — documentation only

- `docs/placement_guides/menu_placement.jpg`
- `docs/placement_guides/shop_placement.jpg`
- `docs/placement_guides/equipment_placement.jpg`
- `docs/placement_guides/forge_placement.jpg`

The placement guides are never loaded by `index.html`.


## V7 battle enemies
All supplied enemy battle art is stored in `assets/enemies/` and is selected at runtime.

- armored_goblin_battle.webp
- bandit_battle.webp
- bandit_outrider_battle.webp
- berserk_goblin_battle.webp
- boar_battle.webp
- goblin_coin_carrier_battle.webp
- goblin_king_battle.webp
- goblin_scout_battle.webp
- mirror_healer_battle.webp
- mirror_knight_battle.webp
- mirror_mage_battle.webp
- mirror_warrior_battle.webp
- owlbear_battle.webp
- spider_battle.webp
- traveling_mercenaries_battle.webp
- wolf_battle.webp

## Recovery additions
- `assets/backgrounds/menu_mobile.png` — clean runtime portrait Menu background with HEAL destination.
- `assets/backgrounds/menu_mobile_v10.jpg` — retained legacy/grid-backed reference only; not loaded by `index.html`.
- `assets/backgrounds/healers_mobile.jpg` — supplied Healers recovery room art.


## V16 identity/audio assets

- `assets/cards/rpcg_card_back.jpg` — supplied RPCG forged-logo card back used for booster mystery cards.
- `assets/ui/rpcg_forge_logo.png` — forged triangular RPCG emblem used on the Main Menu.
- `assets/audio/bazaar_market_loop.mp3` — persistent V16 game music loop.
- `assets/audio/battle_rhythm_encounter.mp3` — retained encounter-music asset for later routing.
- `assets/characters/mage.webp` — corrected player-facing Mage battle pose, 675×900 RGBA.
- `assets/characters/warrior.webp` — corrected player-facing Warrior battle pose, 675×900 RGBA.
- `assets/characters/healer.webp` — corrected player-facing Healer battle pose, 675×900 RGBA.
- `assets/heroes/mage_card.webp`, `knight_card.webp`, `warrior_card.webp`, `healer_card.webp` — current 1024×1536 deck-face Hero cards.
