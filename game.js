(() => {
  'use strict';

  const SAVE_KEY = 'rpcgPortraitCardGameV3';
  const MERCHANT_ROTATION_MS = 5 * 60 * 1000;
  const RANKS = ['bronze', 'silver', 'gold'];
  const $ = id => document.getElementById(id);
  const screens = ['menu', 'battle', 'merchant', 'equipment', 'forge', 'heal'];

  const cardDefs = {
    // KNIGHT
    sword_strike: { name:'Sword Strike', hero:'knight', type:'skill', forgeable:true, ranks:{ bronze:{cost:0,damage:10,damagePerLevel:2}, silver:{cost:0,damage:15,damagePerLevel:3}, gold:{cost:0,damage:20,damagePerLevel:4} }, summary:'A dependable level-scaled sword attack.' },
    shield_block: { name:'Shield Block', hero:'knight', type:'skill', forgeable:true, ranks:{ bronze:{cost:0,blockNext:true,heal:10}, silver:{cost:10,blockNext:true,heal:15}, gold:{cost:12,blockNext:true,heal:25,healPerLevel:3} }, summary:'Block the next enemy attack and restore Health.' },
    shield_bash: { name:'Shield Bash', hero:'knight', type:'skill', forgeable:true, ranks:{ bronze:{cost:10,damage:10,damagePerLevel:2,stunChance:.25}, silver:{cost:12,damage:15,damagePerLevel:3,stunChance:.35}, gold:{cost:14,damage:25,damagePerLevel:4,stunChance:.5} }, summary:'Level-scaled damage with a chance to Stun.' },
    sword_combo: { name:'Sword Combo', hero:'knight', type:'skill', forgeable:true, ranks:{ bronze:{cost:15,damage:10,damagePerLevel:2,combo:true}, silver:{cost:16,damage:15,damagePerLevel:3,combo:true,drawCombo:true}, gold:{cost:18,damage:20,damagePerLevel:4,combo:true,drawCombo:true} }, summary:'Deal damage and empower the next Skill.' },
    iron_resolve: { name:'Iron Resolve', hero:'knight', type:'boost', forgeable:true, ranks:{ bronze:{cost:0,mana:10,cleanse:true}, silver:{cost:0,mana:15,cleanse:true,draw:1}, gold:{cost:0,mana:20,cleanse:true,draw:1} }, summary:'Clear status effects and restore Mana.' },
    steady_stance: { name:'Steady Stance', hero:'knight', type:'boost', forgeable:true, ranks:{ bronze:{cost:0,steady:true,mana:0}, silver:{cost:0,steady:true,mana:5,manaPerLevel:2}, gold:{cost:0,steady:true,mana:5,manaPerLevel:3} }, summary:'Put 2 cards on the bottom of your deck, then draw 3.' },
    rising_slash: { name:'Rising Slash', hero:'knight', type:'skill', forgeable:true, ranks:{ bronze:{cost:14,damage:15,damagePerLevel:2,bleedChance:.5,bleedTurns:3,bleedDamage:5}, silver:{cost:16,damage:25,damagePerLevel:3,bleedChance:.6,bleedTurns:3,bleedDamage:7}, gold:{cost:18,damage:35,damagePerLevel:4,bleedChance:.7,bleedTurns:3,bleedDamage:10} }, summary:'Level-scaled damage with a Bleed chance.' },
    executioners_swing: { name:"Executioner's Swing", hero:'knight', type:'skill', category:'finisher', forgeable:true, ranks:{ bronze:{cost:15,damage:75,damagePerLevel:2,finisher:true,skipSkillChance:.5}, silver:{cost:15,damage:90,damagePerLevel:3,finisher:true,skipSkillChance:.4}, gold:{cost:15,damage:110,damagePerLevel:4,finisher:true,skipSkillChance:.3} }, summary:'A devastating level-scaled Knight Finisher.' },
    shield_up: { name:'Shield Up', hero:'knight', type:'boost', forgeable:true, ranks:{ bronze:{cost:0,shieldTurns:1}, silver:{cost:0,shieldTurns:1,mana:5}, gold:{cost:0,shieldTurns:1,mana:15,draw:1} }, summary:'Take half damage from the next enemy turn.' },
    sword_and_shield: { name:'Sword & Shield', hero:'knight', type:'skill', forgeable:true, ranks:{ bronze:{cost:8,damage:10,damagePerLevel:2,shieldTurns:1}, silver:{cost:10,damage:15,damagePerLevel:3,shieldTurns:1,reflectPct:.5}, gold:{cost:12,damage:25,damagePerLevel:4,shieldTurns:1,reflectPct:1} }, summary:'Attack while preparing a defensive guard.' },

    // MAGE BRONZE STARTER SET
    magic_bolt: { name:'Magic Bolt', hero:'mage', type:'skill', forgeable:false, ranks:{ bronze:{cost:0,damage:10,damagePerLevel:2,spell:true} }, summary:'Deal 10 damage +2 per Mage Level.' },
    magic_shield: { name:'Magic Shield', hero:'mage', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,shieldTurns:1} }, summary:'Take half damage from the next enemy turn.' },
    fireball: { name:'Fireball', hero:'mage', type:'skill', forgeable:false, ranks:{ bronze:{cost:12,damage:15,damagePerLevel:2,burnChance:.25,burnDamage:5,burnTurns:2,spell:true} }, summary:'Level-scaled fire damage with a 25% Burn chance.' },
    ice_shards: { name:'Ice Shards', hero:'mage', type:'skill', forgeable:false, ranks:{ bronze:{cost:8,damage:10,damagePerLevel:2,stunChance:.25,spell:true} }, summary:'Level-scaled ice damage with a 25% Stun chance.' },
    chain_lightning: { name:'Chain Lightning', hero:'mage', type:'skill', forgeable:false, ranks:{ bronze:{cost:12,damage:8,chainLightning:true,spell:true} }, summary:'Repeated Chain Lightning plays stack 8 → 16 → 32 → 64 damage.' },
    focus: { name:'Focus', hero:'mage', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,doubleNextSkill:true} }, summary:'The next Skill deals double damage.' },
    arcane_barrier: { name:'Arcane Barrier', hero:'mage', type:'skill', forgeable:false, ranks:{ bronze:{cost:8,blockNext:true,heal:10} }, summary:'Block the next enemy attack and restore 10 Health.' },
    mana_drain: { name:'Mana Drain', hero:'mage', type:'skill', forgeable:false, ranks:{ bronze:{cost:0,manaSteal:5,manaStealPerLevel:2,spell:true} }, summary:'Steal 5 Mana +2 per Mage Level from the enemy.' },
    basic_teleport: { name:'Basic Teleport', hero:'mage', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,steady:true,mana:0} }, summary:'Put 2 cards on the bottom of your deck, then draw 3.' },
    elemental_storm: { name:'Elemental Storm', hero:'mage', type:'skill', category:'finisher', forgeable:true, ranks:{ bronze:{cost:15,damage:50,damagePerLevel:2,finisher:true,burnChance:.5,burnDamage:25,burnTurns:2,spell:true}, silver:{cost:15,damage:65,damagePerLevel:3,finisher:true,burnChance:.25,burnDamage:30,burnTurns:2,elementalStunChance:.25,spell:true}, gold:{cost:15,damage:80,damagePerLevel:4,finisher:true,burnChance:.35,burnDamage:35,burnTurns:2,elementalStunChance:.35,spell:true} }, summary:'A level-scaled elemental Finisher.' },

    // WARRIOR BRONZE STARTER SET
    punch: { name:'Punch', hero:'warrior', type:'skill', forgeable:false, ranks:{ bronze:{cost:0,damage:10,damagePerLevel:2} }, summary:'Deal 10 damage +2 per Warrior Level.' },
    block: { name:'Block', hero:'warrior', type:'skill', forgeable:false, ranks:{ bronze:{cost:5,blockNext:true,heal:10} }, summary:'Block the next attack and restore 10 Health.' },
    second_wind: { name:'Second Wind', hero:'warrior', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,heal:12,mana:8,draw:1} }, summary:'Restore 12 Health and 8 Mana, then draw 1 card.' },
    power_strike: { name:'Power Strike', hero:'warrior', type:'skill', forgeable:false, ranks:{ bronze:{cost:14,damage:10,powerStrike:true} }, summary:'Deal 10 damage. The next Skill gains +50% damage; stacks up to twice.' },
    smash: { name:'Smash', hero:'warrior', type:'skill', forgeable:false, ranks:{ bronze:{cost:15,damage:20,damagePerLevel:2} }, summary:'A heavy level-scaled strike.' },
    double_strike: { name:'Double Strike', hero:'warrior', type:'skill', forgeable:false, ranks:{ bronze:{cost:12,hitDamage:10,hits:2,stunChancePerHit:.15} }, summary:'Deal 10 damage twice. Each hit has a 15% Stun chance.' },
    charge: { name:'Charge', hero:'warrior', type:'skill', forgeable:false, ranks:{ bronze:{cost:12,damage:30,damagePerLevel:2,hitChance:.65,charge:true} }, summary:'65% chance to hit for level-scaled damage. Without Taunt this turn, skip your next Boost Phase.' },
    taunt: { name:'Taunt', hero:'warrior', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,enemyBoostLockTurns:1,taunt:true} }, summary:'Prevent the enemy from using a Boost on its next turn.' },
    adrenaline_rush: { name:'Adrenaline Rush', hero:'warrior', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,mana:8,selfDamage:10,doubleNextSkill:true} }, summary:'Restore 8 Mana, lose 10 Health, and double the next Skill.' },
    wild_swing: { name:'Wild Swing', hero:'warrior', type:'skill', category:'finisher', forgeable:false, ranks:{ bronze:{cost:15,damage:100,hitChance:.5,finisher:true} }, summary:'A 100-damage Finisher with a 50% miss chance.' },
    sword_block: { name:'Sword Block', hero:'warrior', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,shieldTurns:1} }, summary:'Halve all damage from the next enemy turn.' },

    // HEALER BRONZE STARTER SET
    light_strike: { name:'Light Strike', hero:'healer', type:'skill', forgeable:false, ranks:{ bronze:{cost:0,damage:10,damagePerLevel:2,holy:true} }, summary:'Deal 10 damage +2 per Healer Level.' },
    guarding_prayer: { name:'Guarding Prayer', hero:'healer', type:'skill', forgeable:false, ranks:{ bronze:{cost:0,heal:8,healPerLevel:2,mana:5,holy:true} }, summary:'Restore Health and Mana; healing scales with Healer Level.' },
    heal_wounds: { name:'Heal Wounds', hero:'healer', type:'skill', forgeable:false, ranks:{ bronze:{cost:8,heal:15,holy:true} }, summary:'Restore 15 Health.' },
    sacred_flames: { name:'Sacred Flames', hero:'healer', type:'skill', forgeable:false, ranks:{ bronze:{cost:12,damage:15,damagePerLevel:2,burnIfDivine:true,burnDamage:10,burnTurns:2,holy:true} }, summary:'Level-scaled holy damage. Divine Favor adds Burn.' },
    cleanse: { name:'Cleanse', hero:'healer', type:'skill', forgeable:false, ranks:{ bronze:{cost:8,enemyCleanse:true,enemyBoostLockTurns:1,holy:true} }, summary:'Remove the enemy status/Boost and prevent its next Boost.' },
    blessed_shield: { name:'Blessed Shield', hero:'healer', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,shieldTurns:1} }, summary:'Take half damage from the next enemy turn.' },
    prayer_focus: { name:'Prayer Focus', hero:'healer', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,mana:15,doubleNextHoly:true} }, summary:'Restore 15 Mana. The next healing or holy Skill is doubled.' },
    divine_favor: { name:'Divine Favor', hero:'healer', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,steady:true,mana:0,divineFavor:true} }, summary:'Put 2 cards on the bottom of the deck and draw 3.' },
    second_breath: { name:'Second Breath', hero:'healer', type:'boost', forgeable:false, ranks:{ bronze:{cost:0,regenHp:5,regenMp:5,regenTurns:5,secondBreath:true} }, summary:'Regenerate 5 Health and 5 Mana for 5 turns.' },
    radiant_light: { name:'Radiant Light', hero:'healer', type:'skill', category:'finisher', forgeable:false, ranks:{ bronze:{cost:15,damage:35,damagePerLevel:2,doubleIfSecondBreath:true,finisher:true,holy:true} }, summary:'A holy Finisher that doubles while Second Breath is active.' },
    radiant_bolt: { name:'Radiant Bolt', hero:'healer', type:'skill', forgeable:false, ranks:{ bronze:{cost:6,damage:12,damagePerLevel:2,holy:true} }, summary:'Deal 12 damage +2 per Healer Level.' },

    // UNIVERSAL BOOSTS
    health_potion: { name:'Health Potion', hero:'universal', type:'boost', forgeable:true, ranks:{ bronze:{cost:0,heal:30}, silver:{cost:0,heal:60}, gold:{cost:0,heal:100} }, summary:'Restore Health before entering the Skill phase.' },
    mana_potion: { name:'Mana Potion', hero:'universal', type:'boost', forgeable:true, ranks:{ bronze:{cost:0,mana:20}, silver:{cost:0,mana:40,draw:1}, gold:{cost:0,mana:80,draw:1} }, summary:'Restore Mana; higher ranks also draw a card.' },
    remedy: { name:'Remedy', hero:'universal', type:'boost', forgeable:true, ranks:{ bronze:{cost:0,cleanse:true}, silver:{cost:0,cleanse:true,statusWardTurns:1}, gold:{cost:0,cleanse:true,heal:50,statusWardTurns:1} }, summary:'Clear status effects. Higher ranks add temporary status immunity.' }
  };

  const merchantPrices = {
    remedy: 55,
    sword_strike: 65,
    shield_block: 75,
    shield_bash: 90,
    sword_combo: 95,
    iron_resolve: 85,
    steady_stance: 80,
    rising_slash: 90,
    executioners_swing: 100,
    shield_up: 65,
    sword_and_shield: 85,
    health_potion: 50,
    mana_potion: 50,
    power_strike: 50,
    elemental_storm: 100
  };

  const merchantRotations = [
    ['power_strike', 'elemental_storm'],
    ['remedy', 'shield_bash'],
    ['iron_resolve', 'rising_slash'],
    ['steady_stance', 'executioners_swing']
  ];

  const shopProductConfig = {
    booster3: { title: '3-Card Booster Pack', subtitle: 'Three random cards', cost: { bronze: 250 }, image: 'assets/products/booster_3card.png', size: 3 },
    booster5: { title: '5-Card Gold Booster Pack', subtitle: 'One Silver guaranteed', cost: { silver: 1 }, image: 'assets/products/booster_5card.png', size: 5 },
    starters: { title: 'Starter Decks', subtitle: 'Choose any 20-card hero deck', cost: { silver: 10 } },
    exchange: { title: 'Bronze & Silver Exchange', subtitle: 'Convert currency at a fixed 500 Bronze = 1 Silver rate.' }
  };
  const EXCHANGE_BRONZE_PER_SILVER = 500;

  const starterDecks = {
    mage: {
      name: 'Mage', image: 'assets/products/starter_mage.png',
      cards: { magic_bolt: 3, magic_shield: 2, fireball: 2, ice_shards: 2, chain_lightning: 1, focus: 2, arcane_barrier: 2, mana_drain: 1, basic_teleport: 1, elemental_storm: 1, health_potion: 1, mana_potion: 2 }
    },
    knight: {
      name: 'Knight', image: 'assets/products/starter_knight.png',
      cards: { sword_strike: 3, shield_block: 2, rising_slash: 2, sword_combo: 2, shield_bash: 2, shield_up: 2, steady_stance: 1, iron_resolve: 1, sword_and_shield: 1, executioners_swing: 1, health_potion: 2, mana_potion: 1 }
    },
    healer: {
      name: 'Healer', image: 'assets/products/starter_healer.png',
      cards: { light_strike: 3, guarding_prayer: 2, heal_wounds: 2, sacred_flames: 2, cleanse: 2, blessed_shield: 2, prayer_focus: 1, divine_favor: 1, second_breath: 1, radiant_light: 1, health_potion: 2, mana_potion: 1 }
    },
    warrior: {
      name: 'Warrior', image: 'assets/products/starter_warrior.png',
      cards: { punch: 4, block: 2, second_wind: 2, power_strike: 1, smash: 1, double_strike: 1, taunt: 2, charge: 1, adrenaline_rush: 2, health_potion: 2, mana_potion: 1, wild_swing: 1 }
    }
  };

  const premiumRankPool = ['sword_strike', 'shield_block', 'shield_bash', 'sword_combo', 'iron_resolve', 'steady_stance', 'rising_slash', 'shield_up', 'sword_and_shield', 'executioners_swing', 'elemental_storm'];
  const potionIds = ['health_potion', 'mana_potion', 'remedy'];

  const localMissions = {
    road_clear: {
      title: 'Clear the Road', copy: 'Win 1 forest battle.', stat: 'wins', goal: 1,
      rewardText: '120 Bronze', reward: { bronze: 120 }
    },
    boost_drill: {
      title: 'Tactics Practice', copy: 'Play 3 Boost Cards in battle.', stat: 'boostsPlayed', goal: 3,
      rewardText: '1 Remedy Card', reward: { card: 'remedy:bronze' }
    }
  };

  function keyFor(id, rank = 'bronze') { return `${id}:${rank}`; }
  function parseKey(key) {
    const [id, rank = 'bronze'] = key.split(':');
    return { id, rank, def: cardDefs[id] };
  }
  const rankedCardArt = new Set(['sword_strike', 'shield_block', 'shield_bash', 'sword_combo', 'iron_resolve', 'steady_stance', 'rising_slash', 'executioners_swing', 'shield_up', 'sword_and_shield', 'health_potion', 'mana_potion', 'remedy']);

  function cardAsset(key) {
    const { id, rank } = parseKey(key);
    // Use Bronze art only when a higher-rank portrait is still unavailable.
    const artRank = (rank !== 'bronze' && !rankedCardArt.has(id)) ? 'bronze' : rank;
    return `assets/cards/${artRank}/${id}.webp`;
  }
  function cardStats(key, level = null) {
    const { rank, def } = parseKey(key);
    const stats = { ...(def.ranks.bronze || {}), ...(def.ranks[rank] || {}) };
    const ownerHero = def?.hero && def.hero !== 'universal' ? def.hero : activeHero();
    const resolvedLevel = level == null ? heroLevel(ownerHero) : level;
    const safeLevel = Math.max(1, Number(resolvedLevel) || 1);
    if (stats.damagePerLevel) stats.damage = (stats.damage || 0) + (stats.damagePerLevel * safeLevel);
    if (stats.healPerLevel) stats.heal = (stats.heal || 0) + (stats.healPerLevel * safeLevel);
    if (stats.manaPerLevel) stats.mana = (stats.mana || 0) + (stats.manaPerLevel * safeLevel);
    if (stats.manaStealPerLevel) stats.manaSteal = (stats.manaSteal || 0) + (stats.manaStealPerLevel * safeLevel);
    stats.heroLevel = safeLevel;
    return stats;
  }

  function freshSave() {
    return {
      bronze: 502,
      silver: 0,
      audio: { music: .55, sfx: .75, muted: false },
      heroLevel: 1,
      heroXp: 0,
      activeHero: 'knight',
      heroProgress: { knight:{level:1,xp:0}, mage:{level:1,xp:0}, warrior:{level:1,xp:0}, healer:{level:1,xp:0} },
      merchantStartedAt: Date.now(),
      openedPacks: { booster3: 0, booster5: 0 },
      starterDecks: { mage: 0, knight: 1, healer: 0, warrior: 0 },
      heroCollections: { mage: {}, knight: {}, healer: {}, warrior: {} },
      owned: {
        'sword_strike:bronze': 6,
        'shield_block:bronze': 4,
        'rising_slash:bronze': 2,
        'shield_bash:bronze': 3,
        'sword_combo:bronze': 2,
        'shield_up:bronze': 2,
        'iron_resolve:bronze': 2,
        'steady_stance:bronze': 2,
        'sword_and_shield:bronze': 1,
        'executioners_swing:bronze': 1,
        'health_potion:bronze': 2,
        'mana_potion:bronze': 1,
        'remedy:bronze': 1
      },
      deck: {
        'sword_strike:bronze': 3,
        'shield_block:bronze': 2,
        'rising_slash:bronze': 2,
        'sword_combo:bronze': 2,
        'shield_bash:bronze': 2,
        'shield_up:bronze': 2,
        'steady_stance:bronze': 1,
        'iron_resolve:bronze': 1,
        'sword_and_shield:bronze': 1,
        'executioners_swing:bronze': 1,
        'health_potion:bronze': 2,
        'mana_potion:bronze': 1
      },
      heroDecks: { knight: {
        'sword_strike:bronze': 3,
        'shield_block:bronze': 2,
        'rising_slash:bronze': 2,
        'sword_combo:bronze': 2,
        'shield_bash:bronze': 2,
        'shield_up:bronze': 2,
        'steady_stance:bronze': 1,
        'iron_resolve:bronze': 1,
        'sword_and_shield:bronze': 1,
        'executioners_swing:bronze': 1,
        'health_potion:bronze': 2,
        'mana_potion:bronze': 1
      }, mage: {}, warrior: {}, healer: {} },
      heroVitals: { knight: { hp: 120, maxHp: 120, mp: 50, maxMp: 50 } },
      healingSlots: [null, null],
      cave: { active: false, fightIndex: 0 },
      stats: { wins: 0, boostsPlayed: 0, stuns: 0, normalWinsSinceBoss: 0, consecutiveWins: 0, caveOfferDue: false, lastEncounterId: '' },
      missions: {
        road_clear: { accepted: false, claimed: false, baseline: 0 },
        boost_drill: { accepted: false, claimed: false, baseline: 0 }
      }
    };
  }

  function loadSave() {
    const base = freshSave();
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return base;
      const data = JSON.parse(raw);
      // V13 migration: older portrait builds stored XP cumulatively at 100 XP per level.
      // Preserve the displayed level, then convert the old remainder into current-level XP.
      if (!Number.isFinite(Number(data.heroLevel))) {
        const legacyXp = Math.max(0, Number(data.heroXp) || 0);
        data.heroLevel = 1 + Math.floor(legacyXp / 100);
        data.heroXp = legacyXp % 100;
      }
      // V15 migration: each Hero now owns an independent deck, Level and XP bar.
      data.activeHero = ['knight','mage','warrior','healer'].includes(data.activeHero) ? data.activeHero : 'knight';
      data.heroProgress ||= { knight:{level:Number(data.heroLevel)||1,xp:Number(data.heroXp)||0}, mage:{level:1,xp:0}, warrior:{level:1,xp:0}, healer:{level:1,xp:0} };
      ['knight','mage','warrior','healer'].forEach(hero => { data.heroProgress[hero] ||= {level:1,xp:0}; });
      data.heroDecks ||= { knight:{...(data.deck||{})}, mage:{}, warrior:{}, healer:{} };
      if (!Object.keys(data.heroDecks.knight||{}).length) data.heroDecks.knight = {...(data.deck||base.deck)};
      // Older builds stored purchased non-Knight starter cards only inside heroCollections. Merge them once.
      if (!data.v15CollectionsMerged) {
        data.owned ||= {};
        ['mage','warrior','healer'].forEach(hero => {
          Object.entries(data.heroCollections?.[hero] || {}).forEach(([id,count]) => {
            if (cardDefs[id]) { const key=keyFor(id,'bronze'); data.owned[key]=(data.owned[key]||0)+Math.max(0,Number(count)||0); }
          });
        });
        data.v15CollectionsMerged = true;
      }
      // If a starter was already purchased before V15, give it a usable default deck.
      ['mage','warrior','healer'].forEach(hero => {
        if ((data.starterDecks?.[hero]||0)>0 && !Object.keys(data.heroDecks?.[hero]||{}).length) {
          data.heroDecks[hero] = Object.fromEntries(Object.entries(starterDecks[hero].cards).map(([id,count]) => [keyFor(id,'bronze'),count]));
        }
      });
      return {
        ...base,
        ...data,
        owned: { ...base.owned, ...(data.owned || {}) },
        deck: { ...base.deck, ...(data.deck || {}) },
        audio: { ...base.audio, ...(data.audio || {}) },
        openedPacks: { ...base.openedPacks, ...(data.openedPacks || {}) },
        starterDecks: { ...base.starterDecks, ...(data.starterDecks || {}) },
        heroCollections: {
          mage: { ...base.heroCollections.mage, ...(data.heroCollections?.mage || {}) },
          knight: { ...base.heroCollections.knight, ...(data.heroCollections?.knight || {}) },
          healer: { ...base.heroCollections.healer, ...(data.heroCollections?.healer || {}) },
          warrior: { ...base.heroCollections.warrior, ...(data.heroCollections?.warrior || {}) }
        },
        heroProgress: { ...base.heroProgress, ...(data.heroProgress || {}) },
        heroDecks: {
          knight: { ...base.heroDecks.knight, ...(data.heroDecks?.knight || {}) },
          mage: { ...(data.heroDecks?.mage || {}) }, warrior: { ...(data.heroDecks?.warrior || {}) }, healer: { ...(data.heroDecks?.healer || {}) }
        },
        v15CollectionsMerged: !!data.v15CollectionsMerged,
        heroVitals: { ...base.heroVitals, ...(data.heroVitals || {}) },
        healingSlots: Array.isArray(data.healingSlots) ? [data.healingSlots[0] || null, data.healingSlots[1] || null] : [...base.healingSlots],
        cave: { ...base.cave, ...(data.cave || {}) },
        stats: { ...base.stats, ...(data.stats || {}) },
        missions: {
          road_clear: { ...base.missions.road_clear, ...(data.missions?.road_clear || {}) },
          boost_drill: { ...base.missions.boost_drill, ...(data.missions?.boost_drill || {}) }
        }
      };
    } catch (error) {
      console.warn('RPCG save could not be loaded.', error);
      return base;
    }
  }

  let save = loadSave();
  let currentScreen = 'menu';
  let battle = null;
  let forgeSelection = null;
  let activePackRevealKind = null;
  let packRevealCount = 0;
  let selectedMerchantId = null;
  let selectedSellKey = null;
  let modalAction = null;
  let modalSecondaryAction = null;
  let confirmAction = null;
  let confirmCancelAction = null;
  let healingPickerSlot = null;
  let toastTimer = null;
  let merchantRotationSeen = -1;
  let activeShopProduct = null;
  let lastPackResults = [];
  let equipmentSort = 'name';
  let equipmentRankFilter = 'all';
  let equipmentTypeFilter = 'all';
  let forgeSort = 'name';
  let forgeRankFilter = 'all';
  let forgeTypeFilter = 'all';
  let audioUnlocked = false;
  let sfxContext = null;
  const musicFadeTimers = { market: null, battle: null };

  function clamp01(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }
  function syncAudioUI() {
    save.audio ||= { music:.55, sfx:.75, muted:false };
    if (typeof save.audio.muted !== 'boolean') save.audio.muted = false;
    const target = save.audio.muted ? 0 : clamp01(save.audio.music);
    const activeId = currentScreen === 'battle' ? 'battleRhythmAudio' : 'marketMusic';
    const inactiveId = activeId === 'marketMusic' ? 'battleRhythmAudio' : 'marketMusic';
    const active = $(activeId);
    const inactive = $(inactiveId);
    if (active && !musicFadeTimers[activeId === 'marketMusic' ? 'market' : 'battle']) active.volume = target;
    if (inactive && inactive.paused) inactive.volume = 0;
    const musicSlider = $('musicVolume');
    const sfxSlider = $('sfxVolume');
    const savedMusic = clamp01(save.audio.music);
    const savedSfx = clamp01(save.audio.sfx);
    if (musicSlider) musicSlider.value = String(Math.round(savedMusic * 100));
    if (sfxSlider) sfxSlider.value = String(Math.round(savedSfx * 100));
    if ($('musicVolumeValue')) $('musicVolumeValue').textContent = `${Math.round(savedMusic * 100)}%`;
    if ($('sfxVolumeValue')) $('sfxVolumeValue').textContent = `${Math.round(savedSfx * 100)}%`;
    const toggle = $('volumeToggleBtn');
    if (toggle) {
      toggle.textContent = save.audio.muted ? 'VOLUME: OFF' : 'VOLUME: ON';
      toggle.setAttribute('aria-pressed', save.audio.muted ? 'true' : 'false');
      toggle.classList.toggle('muted', save.audio.muted);
    }
  }

  function safePlay(audio) {
    if (!audio || typeof audio.play !== 'function') return;
    try { const promise = audio.play(); if (promise?.catch) promise.catch(() => {}); } catch (_) {}
  }

  function fadeMusicTrack(id, targetVolume, duration = 900, pauseWhenDone = false) {
    const audio = $(id);
    if (!audio) return;
    const key = id === 'marketMusic' ? 'market' : 'battle';
    if (musicFadeTimers[key]) clearInterval(musicFadeTimers[key]);
    const target = clamp01(targetVolume);
    if (target > 0) safePlay(audio);
    const start = clamp01(audio.volume);
    const steps = Math.max(1, Math.round(duration / 40));
    let step = 0;
    musicFadeTimers[key] = setInterval(() => {
      step += 1;
      const t = Math.min(1, step / steps);
      audio.volume = clamp01(start + ((target - start) * t));
      if (t >= 1) {
        clearInterval(musicFadeTimers[key]);
        musicFadeTimers[key] = null;
        audio.volume = target;
        if (pauseWhenDone && target <= 0 && typeof audio.pause === 'function') audio.pause();
      }
    }, 40);
  }

  function transitionScreenMusic(screenName = currentScreen, duration = 900) {
    if (!audioUnlocked) return;
    const volume = save.audio?.muted ? 0 : clamp01(save.audio?.music);
    const battleMode = screenName === 'battle';
    if (volume <= 0) {
      ['marketMusic','battleRhythmAudio'].forEach(id => { const a=$(id); if (a && typeof a.pause === 'function') a.pause(); });
      return;
    }
    if (battleMode) {
      fadeMusicTrack('marketMusic', 0, duration, true);
      fadeMusicTrack('battleRhythmAudio', volume, duration, false);
    } else {
      fadeMusicTrack('battleRhythmAudio', 0, duration, true);
      fadeMusicTrack('marketMusic', volume, duration, false);
    }
  }

  function ensureMusicPlaying() {
    if (save.audio?.muted || clamp01(save.audio?.music) <= 0) return;
    audioUnlocked = true;
    transitionScreenMusic(currentScreen, 500);
  }

  function setMusicVolume(value) {
    save.audio ||= { music:.55, sfx:.75, muted:false };
    save.audio.music = clamp01(Number(value) / 100);
    syncAudioUI(); persist();
    if (save.audio.music > 0) ensureMusicPlaying();
    else transitionScreenMusic(currentScreen, 250);
  }

  function setSfxVolume(value) {
    save.audio ||= { music:.55, sfx:.75, muted:false };
    save.audio.sfx = clamp01(Number(value) / 100);
    syncAudioUI(); persist();
  }

  function toggleMasterVolume() {
    save.audio ||= { music:.55, sfx:.75, muted:false };
    save.audio.muted = !save.audio.muted;
    if (save.audio.muted) {
      fadeMusicTrack('marketMusic', 0, 180, true);
      fadeMusicTrack('battleRhythmAudio', 0, 180, true);
    } else {
      audioUnlocked = true;
      transitionScreenMusic(currentScreen, 260);
    }
    syncAudioUI();
    persist();
  }

  function getSfxContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!sfxContext) sfxContext = new AudioCtx();
      if (sfxContext.state === 'suspended' && typeof sfxContext.resume === 'function') sfxContext.resume().catch?.(() => {});
      return sfxContext;
    } catch (_) { return null; }
  }

  function playSfx(kind = 'slash', intensity = 1) {
    const volume = (save.audio?.muted ? 0 : clamp01(save.audio?.sfx)) * Math.max(.15, Math.min(1.5, Number(intensity) || 1));
    if (volume <= 0) return;
    const ctx = getSfxContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(.0001, now);
      master.gain.exponentialRampToValueAtTime(Math.max(.0002, .16 * volume), now + .012);
      const duration = kind === 'finisher' ? .55 : kind === 'boom' ? .38 : kind === 'lightning' ? .34 : .22;
      master.gain.exponentialRampToValueAtTime(.0001, now + duration);
      master.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.connect(master);
      if (kind === 'slash') { osc.type='sawtooth'; osc.frequency.setValueAtTime(520,now); osc.frequency.exponentialRampToValueAtTime(95,now+.20); }
      else if (kind === 'fire') { osc.type='triangle'; osc.frequency.setValueAtTime(150,now); osc.frequency.exponentialRampToValueAtTime(54,now+.30); }
      else if (kind === 'ice') { osc.type='sine'; osc.frequency.setValueAtTime(1180,now); osc.frequency.exponentialRampToValueAtTime(420,now+.24); }
      else if (kind === 'lightning') { osc.type='square'; osc.frequency.setValueAtTime(780,now); osc.frequency.exponentialRampToValueAtTime(78,now+.30); }
      else if (kind === 'holy') { osc.type='sine'; osc.frequency.setValueAtTime(620,now); osc.frequency.exponentialRampToValueAtTime(980,now+.34); }
      else if (kind === 'boost') { osc.type='sine'; osc.frequency.setValueAtTime(260,now); osc.frequency.exponentialRampToValueAtTime(520,now+.28); }
      else { osc.type='sawtooth'; osc.frequency.setValueAtTime(kind==='finisher'?120:170,now); osc.frequency.exponentialRampToValueAtTime(42,now+duration); }
      osc.start(now); osc.stop(now + duration + .03);
      if (kind === 'finisher' || kind === 'boom' || kind === 'lightning') {
        const low = ctx.createOscillator();
        const lowGain = ctx.createGain();
        low.type='square'; low.frequency.setValueAtTime(kind==='lightning'?86:64,now); low.frequency.exponentialRampToValueAtTime(34,now+duration);
        lowGain.gain.setValueAtTime(.0001,now); lowGain.gain.exponentialRampToValueAtTime(.12*volume,now+.015); lowGain.gain.exponentialRampToValueAtTime(.0001,now+duration);
        low.connect(lowGain); lowGain.connect(ctx.destination); low.start(now); low.stop(now+duration+.04);
      }
    } catch (_) {}
  }
  let pendingLevelUp = null;

  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }
    catch (error) { console.warn('RPCG save could not be written.', error); }
  }

  function activeHero() { return ['knight','mage','warrior','healer'].includes(save.activeHero) ? save.activeHero : 'knight'; }
  function heroProgress(hero = activeHero()) {
    save.heroProgress ||= {};
    save.heroProgress[hero] ||= { level: 1, xp: 0 };
    return save.heroProgress[hero];
  }
  function heroLevel(hero = activeHero()) { return Math.max(1, Number(heroProgress(hero).level) || 1); }
  function heroXp(hero = activeHero()) { return Math.max(0, Number(heroProgress(hero).xp) || 0); }
  function xpNeededForLevel(level = heroLevel()) { return Math.max(100, Math.max(1, Number(level) || 1) * 100); }
  function xpProgressPct(hero = activeHero()) { return Math.max(0, Math.min(100, (heroXp(hero) / xpNeededForLevel(heroLevel(hero))) * 100)); }
  function activeDeckMap() {
    save.heroDecks ||= {};
    save.heroDecks[activeHero()] ||= {};
    return save.heroDecks[activeHero()];
  }
  function awardHeroXp(amount) {
    const hero = activeHero();
    const progress = heroProgress(hero);
    const gained = Math.max(0, Math.floor(Number(amount) || 0));
    const oldLevel = heroLevel(hero);
    const oldStats = heroStatsForLevel(hero, oldLevel);
    progress.xp += gained;
    if (progress.xp >= xpNeededForLevel(oldLevel)) { progress.level = oldLevel + 1; progress.xp = 0; }
    const newLevel = heroLevel(hero);
    if (newLevel > oldLevel) {
      const newStats = heroStatsForLevel(hero, newLevel);
      pendingLevelUp = { hero, oldLevel, newLevel, oldStats, newStats, xp: progress.xp, xpNeeded: xpNeededForLevel(newLevel) };
      ensureHeroVitals(hero);
    }
    return { hero, oldLevel, newLevel, leveled: newLevel > oldLevel, xp: progress.xp, needed: xpNeededForLevel(newLevel) };
  }
  function deckTotal() { return Object.values(activeDeckMap()).reduce((sum, count) => sum + Math.max(0, count || 0), 0); }
  function ownedTotal() { return Object.values(save.owned).reduce((sum, count) => sum + Math.max(0, count || 0), 0); }
  function reservedCount(key) { return Object.values(save.heroDecks || {}).reduce((sum, deck) => sum + Math.max(0, Number(deck?.[key]) || 0), 0); }
  function spareCount(key) { return Math.max(0, (save.owned[key] || 0) - reservedCount(key)); }

  function sortCardKeys(keys) {
    return [...keys].sort((a, b) => {
      const ca = parseKey(a), cb = parseKey(b);
      const rankDelta = RANKS.indexOf(ca.rank) - RANKS.indexOf(cb.rank);
      return rankDelta || ca.def.name.localeCompare(cb.def.name);
    });
  }

  function cardCategory(key) {
    const { def } = parseKey(key);
    return def.category === 'finisher' ? 'finisher' : def.type;
  }
  function sortInventoryKeys(keys, mode = 'rank') {
    return [...keys].sort((a, b) => {
      const ca = parseKey(a), cb = parseKey(b);
      if (mode === 'name') return ca.def.name.localeCompare(cb.def.name) || RANKS.indexOf(ca.rank) - RANKS.indexOf(cb.rank);
      if (mode === 'owned') return (save.owned[b] || 0) - (save.owned[a] || 0) || ca.def.name.localeCompare(cb.def.name);
      if (mode === 'spare') return spareCount(b) - spareCount(a) || ca.def.name.localeCompare(cb.def.name);
      if (mode === 'deck') return (activeDeckMap()[b] || 0) - (activeDeckMap()[a] || 0) || ca.def.name.localeCompare(cb.def.name);
      const rankDelta = RANKS.indexOf(ca.rank) - RANKS.indexOf(cb.rank);
      return rankDelta || ca.def.name.localeCompare(cb.def.name);
    });
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1900);
  }

  function setOverlay(id, show) {
    const overlay = $(id);
    overlay.classList.toggle('show', show);
    overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function closeCardModal() {
    modalAction = null;
    modalSecondaryAction = null;
    $('cardModalSecondary').hidden = true;
    setOverlay('cardModal', false);
  }

  function showConfirm(title, copy, action, cancelAction = null) {
    $('confirmTitle').textContent = title;
    $('confirmCopy').textContent = copy;
    confirmAction = action;
    confirmCancelAction = cancelAction;
    setOverlay('confirmModal', true);
  }

  function closeConfirm(runCancel = false) {
    const cancel = confirmCancelAction;
    confirmAction = null;
    confirmCancelAction = null;
    setOverlay('confirmModal', false);
    if (runCancel && cancel) cancel();
  }

  function scalingBreakdown(stats, field, label) {
    const perLevel = stats[`${field}PerLevel`] || 0;
    const total = stats[field] || 0;
    if (!perLevel) return `${total} ${label}`;
    const base = total - (perLevel * stats.heroLevel);
    return `${total} ${label} (${base} + ${perLevel} × LV ${stats.heroLevel})`;
  }

  function cardEffectText(key) {
    const { id, def } = parseKey(key);
    const stats = cardStats(key);
    if (id === 'sword_strike') return `Deal ${scalingBreakdown(stats, 'damage', 'damage')}. No Mana cost.`;
    if (id === 'shield_block') return `Take no damage from the next enemy attack and restore ${scalingBreakdown(stats, 'heal', 'Health')}.`;
    if (id === 'shield_bash') return `Deal ${scalingBreakdown(stats, 'damage', 'damage')}. ${Math.round(stats.stunChance * 100)}% chance to Stun the enemy.`;
    if (id === 'sword_combo') return `Deal ${scalingBreakdown(stats, 'damage', 'damage')}. Your next Skill deals double damage.${stats.drawCombo ? ' Draw another Sword Combo if one is available.' : ''}`;
    if (id === 'rising_slash') return `Deal ${scalingBreakdown(stats, 'damage', 'damage')}. ${Math.round(stats.bleedChance * 100)}% Bleed chance, ${stats.bleedDamage} damage for ${stats.bleedTurns} turns.`;
    if (id === 'sword_and_shield') return `Deal ${scalingBreakdown(stats, 'damage', 'damage')}. Take half damage from the next enemy turn${stats.reflectPct ? ` and reflect ${Math.round(stats.reflectPct * 100)}% of that damage` : ''}.`;
    if (id === 'executioners_swing') return `Deal ${scalingBreakdown(stats, 'damage', 'damage')}. ${Math.round(stats.skipSkillChance * 100)}% chance to lose your next Skill Phase.`;
    if (id === 'elemental_storm') return `Deal ${scalingBreakdown(stats, 'damage', 'damage')}. ${Math.round(stats.burnChance * 100)}% Burn chance${stats.elementalStunChance ? ` and ${Math.round(stats.elementalStunChance * 100)}% Stun chance` : ''}.`;
    if (id === 'iron_resolve') return `Clear all status effects and restore ${stats.mana} Mana.${stats.draw ? ` Draw ${stats.draw} card.` : ''}`;
    if (id === 'steady_stance') return `Put 2 cards on the bottom of your deck, then draw 3.${stats.mana ? ` Restore ${scalingBreakdown(stats, 'mana', 'Mana')}.` : ''}`;
    if (id === 'shield_up') return `Take half damage from the next enemy turn.${stats.mana ? ` Restore ${stats.mana} Mana.` : ''}${stats.draw ? ` Draw ${stats.draw} card.` : ''}`;
    if (id === 'health_potion') return `Restore ${stats.heal} Health.`;
    if (id === 'mana_potion') return `Restore ${stats.mana} Mana.${stats.draw ? ` Draw ${stats.draw} card.` : ''}`;
    if (id === 'remedy') return `Clear all status effects.${stats.heal ? ` Restore ${stats.heal} Health.` : ''}${stats.statusWardTurns ? ' Prevent any new status effects until your next turn.' : ''}`;
    return def.summary;
  }

  function openCardModal(key, context = {}) {
    const { rank, def } = parseKey(key);
    $('cardModalImg').src = cardAsset(key);
    $('cardModalImg').alt = `${rank} ${def.name}`;
    $('cardModalRank').textContent = rank.toUpperCase();
    $('cardModalRank').className = `rank-tag rank-${rank}`;
    $('cardModalName').textContent = def.name;
    const stats = cardStats(key);
    const displayType = def.category || def.type;
    const ownership = $('cardModalOwnership');
    if (ownership) {
      ownership.hidden = context.type !== 'equipment';
      ownership.textContent = `OWNED ×${save.owned[key] || 0}  •  IN DECK ${activeDeckMap()[key] || 0}`;
    }
    $('cardModalMeta').textContent = `${displayType} card • ${stats.cost} MP • ${def.type === 'boost' ? 'Boost' : 'Skill'} Phase`;
    $('cardModalText').textContent = cardEffectText(key);

    const actionButton = $('cardModalAction');
    const secondaryButton = $('cardModalSecondary');
    actionButton.disabled = false;
    secondaryButton.disabled = false;
    secondaryButton.hidden = true;
    modalAction = null;
    modalSecondaryAction = null;

    if (context.type === 'battle') {
      const playable = battleCardPlayable(key);
      actionButton.textContent = 'PLAY CARD';
      actionButton.disabled = !playable;
      modalAction = () => playBattleCard(context.index);
    } else if (context.type === 'merchant') {
      const price = merchantPrices[context.id];
      actionButton.textContent = `BUY • ${price} BRONZE`;
      actionButton.disabled = save.bronze < price;
      modalAction = () => buyMerchantCard(context.id);
    } else if (context.type === 'equipment') {
      const canAdd = cardVisibleForHero(key, activeHero()) && deckTotal() < 20 && spareCount(key) > 0;
      actionButton.textContent = canAdd ? 'ADD TO DECK' : 'NO SPARE COPY';
      actionButton.disabled = !canAdd;
      modalAction = () => changeDeck(key, 1);
      secondaryButton.hidden = false;
      secondaryButton.textContent = 'REMOVE FROM DECK';
      secondaryButton.disabled = (activeDeckMap()[key] || 0) <= 0 || deckTotal() <= 5;
      modalSecondaryAction = () => changeDeck(key, -1);
    } else {
      actionButton.textContent = 'CLOSE';
      modalAction = closeCardModal;
    }
    setOverlay('cardModal', true);
  }

  function syncGlobalUI() {
    const hero = activeHero();
    const level = heroLevel(hero);
    $('menuHeroLevel').textContent = level;
    const battleHeroLevel = $('battleHeroLevel');
    if (battleHeroLevel) battleHeroLevel.textContent = level;
    const heroName = heroDisplayName(hero).toUpperCase();
    const menuHeroPortrait=$('menuHeroPortrait'); if(menuHeroPortrait){ menuHeroPortrait.src=`assets/heroes/${hero}_card.webp`; menuHeroPortrait.alt=heroName; }
    const menuHeroName=$('menuHeroName'); if(menuHeroName) menuHeroName.textContent=heroName;
    const panelImg=document.getElementById('menuActiveHeroCard'); if(panelImg){ panelImg.src=`assets/heroes/${hero}_card.webp`; panelImg.alt=`${heroName} hero card`; }
    const panelName=document.getElementById('menuActiveHeroName'); if(panelName) panelName.innerHTML=`BRONZE<br>${heroName}`;
    $('menuBronze').textContent = save.bronze;
    $('menuSilver').textContent = save.silver;
    $('merchantBronze').textContent = save.bronze;
    $('merchantSilver').textContent = save.silver;
    $('equipmentBronze').textContent = save.bronze;
    $('forgeBronze').textContent = save.bronze;
    $('forgeSilver').textContent = save.silver;
    $('menuDeckCount').textContent = deckTotal();
    $('menuOwnedCount').textContent = ownedTotal();
    $('equipmentDeckCount').textContent = deckTotal();
  }

  function showScreen(name, options = {}) {
    if (!screens.includes(name)) return;
    if (name !== 'battle' && battle?.steady) cancelSteadyChoice();
    closeCardModal();
    closeConfirm();
    ['sellPicker', 'missionOverlay', 'forgePicker', 'shopProductOverlay', 'healPicker'].forEach(id => setOverlay(id, false));
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    $(`${name}Screen`).classList.add('active');
    currentScreen = name;
    $('game').dataset.screen = name;
    transitionScreenMusic(name, 900);
    document.querySelectorAll('#bottomNav [data-go]').forEach(button => button.classList.toggle('active', button.dataset.go === name));
    syncGlobalUI();

    if (name === 'battle') {
      if (!battle || battle.ended || options.newBattle) startBattle();
      else renderBattle();
    }
    if (name === 'merchant') renderMerchant();
    if (name === 'equipment') renderEquipment();
    if (name === 'forge') renderForge();
    if (name === 'heal') renderHealer();
    const scroll = $(`${name}Screen`).querySelector('.room-scroll');
    if (scroll) scroll.scrollTop = 0;
  }

  /* Merchant */
  function formatShopCost(cost) {
    const parts = [];
    if (cost?.bronze) parts.push(`${cost.bronze} BRONZE`);
    if (cost?.silver) parts.push(`${cost.silver} SILVER`);
    return parts.join(' + ') || 'FREE';
  }

  function canAffordShopCost(cost) {
    return (!cost?.bronze || save.bronze >= cost.bronze) && (!cost?.silver || save.silver >= cost.silver);
  }

  function spendShopCost(cost) {
    if (!canAffordShopCost(cost)) return false;
    if (cost?.bronze) save.bronze -= cost.bronze;
    if (cost?.silver) save.silver -= cost.silver;
    return true;
  }

  function syncShopProductBalance() {
    $('shopProductBronze').textContent = save.bronze;
    $('shopProductSilver').textContent = save.silver;
  }

  function setShopDisplayGlow(displayId, on) {
    const display = $(displayId);
    if (display) display.classList.toggle('glow', !!on);
  }

  function closeShopProductOverlay() {
    activeShopProduct = null;
    lastPackResults = [];
    setOverlay('shopProductOverlay', false);
    setShopDisplayGlow('shopBooster3Display', false);
    setShopDisplayGlow('shopBooster5Display', false);
    setShopDisplayGlow('shopStarterDisplay', false);
  }

  function renderPackProduct(kind) {
    const config = shopProductConfig[kind];
    const isGold = kind === 'booster5';
    $('shopProductTitle').textContent = config.title;
    $('shopProductSubtitle').textContent = config.subtitle;
    $('shopProductBody').innerHTML = `<div class="pack-option">
      <div class="pack-option-art"><img src="${config.image}" alt="${config.title}"></div>
      <div class="pack-option-copy">
        <h3>${config.title}</h3>
        <p>${isGold ? 'Open five cards. The first pull is always Silver, with a very rare chance for extra Silver cards and a 1% Gold chance on each remaining pull.' : 'Open three random cards from the current card pool. Silver cards are intentionally rare in this smaller pack.'}</p>
        <p class="pack-rate-note">${isGold ? '5-CARD RULE: 1 guaranteed Silver. Extra Silver is ultra rare. Gold chance: 1% on each of the other four cards.' : '3-CARD RULE: Bronze is the normal pull. Silver chance: 4% per card. No guaranteed Silver.'} • POTION RULE: every card slot has a 1 in 50 chance to roll a potion. Bronze potions can appear at any level, Silver potions begin appearing at Hero Level 50, and Gold potions begin appearing at Hero Level 100.</p>
        <div class="product-cost">${formatShopCost(config.cost)}</div>
        <button id="shopPackBuy" class="gold-button primary" type="button" ${canAffordShopCost(config.cost) ? '' : 'disabled'}>BUY PACK</button>
      </div>
    </div>`;
    const buy = $('shopPackBuy');
    if (buy) buy.addEventListener('click', () => requestPackPurchase(kind));
  }

  function renderStarterProducts() {
    const config = shopProductConfig.starters;
    $('shopProductTitle').textContent = config.title;
    $('shopProductSubtitle').textContent = config.subtitle;
    $('shopProductBody').innerHTML = `<p class="starter-options-note">All four starter decks are available here. Buying a deck never removes it from the shop, so any starter can be purchased again for more copies.</p>
      <div class="starter-options-grid">${Object.entries(starterDecks).map(([hero, deck]) => `
        <button class="starter-option" type="button" data-starter-buy="${hero}">
          <img src="${deck.image}" alt="${deck.name} Starter Deck">
          <h3>${deck.name}</h3>
          <span class="starter-cost">${formatShopCost(config.cost)}</span>
          <span class="starter-owned">STARTER COPIES OWNED: ${save.starterDecks[hero] || 0}</span>
        </button>`).join('')}
      </div>`;
    document.querySelectorAll('[data-starter-buy]').forEach(button => {
      button.onclick = () => requestStarterPurchase(button.dataset.starterBuy);
    });
  }

  function renderExchangeProduct() {
    const config = shopProductConfig.exchange;
    $('shopProductTitle').textContent = config.title;
    $('shopProductSubtitle').textContent = config.subtitle;
    $('shopProductBody').innerHTML = `<div class="exchange-grid">
      <section class="exchange-card"><span class="eyebrow">BUY SILVER</span><h3>500 BRONZE → 1 SILVER</h3><p>Convert Bronze into Silver for booster packs and Gold forging.</p><button id="exchangeBronzeToSilver" class="gold-button primary" type="button" ${save.bronze >= EXCHANGE_BRONZE_PER_SILVER ? '' : 'disabled'}>EXCHANGE</button></section>
      <section class="exchange-card"><span class="eyebrow">CASH OUT SILVER</span><h3>1 SILVER → 500 BRONZE</h3><p>Convert Silver back into Bronze for cards, Forge fees, and other purchases.</p><button id="exchangeSilverToBronze" class="gold-button primary" type="button" ${save.silver >= 1 ? '' : 'disabled'}>EXCHANGE</button></section>
    </div>`;
    const toSilver = $('exchangeBronzeToSilver');
    const toBronze = $('exchangeSilverToBronze');
    if (toSilver) toSilver.onclick = () => exchangeBronzeForSilver();
    if (toBronze) toBronze.onclick = () => exchangeSilverForBronze();
  }

  function exchangeBronzeForSilver() {
    if (save.bronze < EXCHANGE_BRONZE_PER_SILVER) return toast(`You need ${EXCHANGE_BRONZE_PER_SILVER} Bronze.`), false;
    save.bronze -= EXCHANGE_BRONZE_PER_SILVER;
    save.silver += 1;
    persist(); syncGlobalUI(); syncShopProductBalance(); renderExchangeProduct();
    toast(`Exchanged ${EXCHANGE_BRONZE_PER_SILVER} Bronze for 1 Silver.`);
    return true;
  }

  function exchangeSilverForBronze() {
    if (save.silver < 1) return toast('You need 1 Silver.'), false;
    save.silver -= 1;
    save.bronze += EXCHANGE_BRONZE_PER_SILVER;
    persist(); syncGlobalUI(); syncShopProductBalance(); renderExchangeProduct();
    toast(`Exchanged 1 Silver for ${EXCHANGE_BRONZE_PER_SILVER} Bronze.`);
    return true;
  }

  function openShopProduct(kind) {
    activeShopProduct = kind;
    lastPackResults = [];
    syncShopProductBalance();
    const productBox = $('shopProductOverlay')?.querySelector('.shop-product-box');
    if (productBox) productBox.classList.toggle('exchange-mode', kind === 'exchange');
    if (kind === 'starters') renderStarterProducts();
    else if (kind === 'exchange') renderExchangeProduct();
    else renderPackProduct(kind);
    setOverlay('shopProductOverlay', true);
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function rollPackRank(kind, index) {
    if (kind === 'booster5' && index === 0) return 'silver';
    const roll = Math.random();
    if (kind === 'booster5') {
      if (roll < .01) return 'gold';
      if (roll < .02) return 'silver';
      return 'bronze';
    }
    return roll < .04 ? 'silver' : 'bronze';
  }

  function allowedPotionRankForPack(rank) {
    const heroId = activeHero();
    const level = heroLevel(heroId);
    if (rank === 'gold') return level >= 100 ? 'gold' : null;
    if (rank === 'silver') return level >= 50 ? 'silver' : null;
    return 'bronze';
  }

  function drawPackCard(kind, index) {
    const rank = rollPackRank(kind, index);
    const potionRank = allowedPotionRankForPack(rank);
    if (potionRank && Math.random() < (1 / 50)) {
      const potionId = randomFrom(potionIds);
      return keyFor(potionId, potionRank);
    }
    const pool = rank === 'bronze'
      ? Object.keys(cardDefs).filter(id => !potionIds.includes(id))
      : premiumRankPool.filter(id => !potionIds.includes(id));
    const id = randomFrom(pool);
    return keyFor(id, rank);
  }

  function requestPackPurchase(kind) {
    const config = shopProductConfig[kind];
    if (!canAffordShopCost(config.cost)) return toast(`Not enough ${config.cost.silver ? 'Silver' : 'Bronze'}.`);
    showConfirm(`Buy ${config.title}?`, `Spend ${formatShopCost(config.cost)} and open ${config.size} cards now.`, () => buyPack(kind));
  }

  function buyPack(kind) {
    const config = shopProductConfig[kind];
    if (!spendShopCost(config.cost)) return toast(`Not enough ${config.cost.silver ? 'Silver' : 'Bronze'}.`);
    lastPackResults = Array.from({ length: config.size }, (_, index) => drawPackCard(kind, index));
    lastPackResults.forEach(key => { save.owned[key] = (save.owned[key] || 0) + 1; });
    save.openedPacks[kind] = (save.openedPacks[kind] || 0) + 1;
    persist();
    closeConfirm();
    syncGlobalUI();
    syncShopProductBalance();
    startPackReveal(kind);
  }

  function packRevealPositions(count) {
    if (count === 5) return [
      { x: -290, y: -205, r: -5 },
      { x: 0, y: -230, r: 0 },
      { x: 290, y: -205, r: 5 },
      { x: -150, y: 225, r: -3 },
      { x: 150, y: 225, r: 3 }
    ];
    return [
      { x: -286, y: 30, r: -5 },
      { x: 0, y: 0, r: 0 },
      { x: 286, y: 30, r: 5 }
    ];
  }

  function startPackReveal(kind) {
    const config = shopProductConfig[kind];
    const modal = $('packRevealModal');
    const positions = packRevealPositions(lastPackResults.length);
    activePackRevealKind = kind;
    packRevealCount = 0;
    $('packRevealTitle').textContent = `${config.size}-CARD BOOSTER REVEAL`;
    $('packRevealPackImg').src = config.image;
    $('packRevealPackImg').alt = config.title;
    $('packRevealHint').textContent = 'CLICK EACH MYSTERY CARD TO REVEAL IT';
    $('packRevealFinishBtn').disabled = true;
    $('packRevealBuyAnotherBtn').disabled = true;
    $('packRevealCardSpread').innerHTML = lastPackResults.map((key, index) => {
      const { rank, def } = parseKey(key);
      const pos = positions[index] || { x: 0, y: 0, r: 0 };
      return `<button class="pack-reveal-card rank-${rank}" type="button" data-pack-reveal="${index}" style="--x:${pos.x}px;--y:${pos.y}px;--r:${pos.r}deg;--delay:${(index * .08).toFixed(2)}s" aria-label="Reveal mystery card ${index + 1}">
        <span class="pack-card-inner">
          <span class="pack-card-face pack-card-back"></span>
          <span class="pack-card-face pack-card-front"><img src="${cardAsset(key)}" alt="${rank} ${def.name}"></span>
        </span>
      </button>`;
    }).join('');
    document.querySelectorAll('[data-pack-reveal]').forEach(button => {
      button.addEventListener('click', () => revealPackCard(button));
    });
    modal.classList.remove('dealing');
    setOverlay('packRevealModal', true);
    void modal.offsetWidth;
    modal.classList.add('dealing');
  }

  function revealPackCard(button) {
    if (!button || button.classList.contains('revealed')) return;
    button.classList.add('revealed');
    packRevealCount += 1;
    const flash = $('packRevealFlash');
    flash.classList.remove('burst');
    void flash.offsetWidth;
    flash.classList.add('burst');
    if (packRevealCount >= lastPackResults.length) {
      $('packRevealHint').textContent = 'ALL CARDS REVEALED';
      $('packRevealFinishBtn').disabled = false;
      $('packRevealBuyAnotherBtn').disabled = !canAffordShopCost(shopProductConfig[activePackRevealKind].cost);
    } else {
      $('packRevealHint').textContent = `${packRevealCount} / ${lastPackResults.length} REVEALED • CLICK THE NEXT CARD`;
    }
  }

  function closePackReveal(returnToShelf = true) {
    const modal = $('packRevealModal');
    modal.classList.remove('dealing');
    setOverlay('packRevealModal', false);
    if (returnToShelf) closeShopProductOverlay();
    activePackRevealKind = null;
    packRevealCount = 0;
  }

  function buyAnotherRevealedPack() {
    const kind = activePackRevealKind;
    if (!kind) return;
    const config = shopProductConfig[kind];
    if (!canAffordShopCost(config.cost)) return toast(`Not enough ${config.cost.silver ? 'Silver' : 'Bronze'}.`);
    buyPack(kind);
  }

  function renderPackResults(kind) {
    const config = shopProductConfig[kind];
    $('shopProductTitle').textContent = 'PACK OPENED';
    $('shopProductSubtitle').textContent = config.title;
    $('shopProductBody').innerHTML = `<h3 class="pack-results-title">YOUR ${lastPackResults.length} CARDS</h3>
      <div class="pack-results-grid">${lastPackResults.map(key => {
        const { rank, def } = parseKey(key);
        return `<div class="pack-result-card rank-${rank}"><img src="${cardAsset(key)}" alt="${rank} ${def.name}"><b>${def.name}</b><span>${rank}</span></div>`;
      }).join('')}</div>
      <div class="pack-result-actions">
        <button id="packResultBack" class="gold-button" type="button">SHOP SHELF</button>
        <button id="packBuyAgain" class="gold-button primary" type="button" ${canAffordShopCost(config.cost) ? '' : 'disabled'}>BUY AGAIN • ${formatShopCost(config.cost)}</button>
      </div>`;
    const back = $('packResultBack');
    const again = $('packBuyAgain');
    if (back) back.addEventListener('click', closeShopProductOverlay);
    if (again) again.addEventListener('click', () => requestPackPurchase(kind));
  }

  function requestStarterPurchase(hero) {
    const deck = starterDecks[hero];
    const cost = shopProductConfig.starters.cost;
    if (!deck) return;
    if (!canAffordShopCost(cost)) return toast('Not enough Silver.');
    const owned = save.starterDecks[hero] || 0;
    showConfirm(`Buy ${deck.name} Starter Deck?`, `Spend ${formatShopCost(cost)} for a full 20-card ${deck.name} starter deck.${owned ? ` You already own ${owned}; this adds another full copy.` : ''}`, () => buyStarterDeck(hero));
  }

  function buyStarterDeck(hero) {
    const deck = starterDecks[hero];
    const cost = shopProductConfig.starters.cost;
    if (!deck || !spendShopCost(cost)) return toast('Not enough Silver.');
    save.starterDecks[hero] = (save.starterDecks[hero] || 0) + 1;
    save.heroCollections[hero] ||= {};
    Object.entries(deck.cards).forEach(([id, count]) => {
      save.heroCollections[hero][id] = (save.heroCollections[hero][id] || 0) + count;
      if (cardDefs[id]) { const key = keyFor(id); save.owned[key] = (save.owned[key] || 0) + count; }
    });
    save.heroDecks ||= {};
    if (!Object.keys(save.heroDecks[hero] || {}).length) {
      save.heroDecks[hero] = Object.fromEntries(Object.entries(deck.cards).map(([id,count]) => [keyFor(id,'bronze'),count]));
    }
    persist();
    closeConfirm();
    syncGlobalUI();
    syncShopProductBalance();
    renderStarterProducts();
    toast(`${deck.name} starter deck purchased.`);
  }

  function merchantRotationIndex() {
    return Math.floor((Date.now() - save.merchantStartedAt) / MERCHANT_ROTATION_MS);
  }

  function merchantStock() {
    const index = merchantRotationIndex();
    return merchantRotations[((index % merchantRotations.length) + merchantRotations.length) % merchantRotations.length];
  }

  function renderMerchant() {
    syncGlobalUI();
    merchantRotationSeen = merchantRotationIndex();
    const stock = merchantStock();
    if (!selectedMerchantId || !stock.includes(selectedMerchantId)) selectedMerchantId = stock[0];
    $('merchantStock').innerHTML = stock.map(id => {
      const key = keyFor(id);
      return `<button class="shop-card ${selectedMerchantId === id ? 'selected' : ''}" type="button" data-shop-card="${id}">
        <span class="price-tag">${merchantPrices[id]} BRONZE</span>
        <img src="${cardAsset(key)}" alt="${cardDefs[id].name}">
        <b>${cardDefs[id].name}</b><small>${cardDefs[id].type.toUpperCase()} • Owned ${save.owned[key] || 0}</small>
      </button>`;
    }).join('');
    document.querySelectorAll('[data-shop-card]').forEach(button => {
      button.onclick = () => {
        selectedMerchantId = button.dataset.shopCard;
        renderMerchant();
        openCardModal(keyFor(selectedMerchantId), { type: 'merchant', id: selectedMerchantId });
      };
    });
    $('merchantBuySelected').disabled = !selectedMerchantId || save.bronze < merchantPrices[selectedMerchantId];
    $('merchantBuySelected').textContent = 'BUY';
    $('merchantBuySelected').setAttribute('aria-label', selectedMerchantId ? `Buy ${cardDefs[selectedMerchantId].name} for ${merchantPrices[selectedMerchantId]} Bronze` : 'Buy selected card');
    renderSellPanel();
    renderMissions();
    updateMerchantTimer();
  }

  function updateMerchantTimer() {
    const elapsed = Math.max(0, Date.now() - save.merchantStartedAt);
    const remaining = MERCHANT_ROTATION_MS - (elapsed % MERCHANT_ROTATION_MS);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    $('merchantTimer').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    if (currentScreen === 'merchant' && merchantRotationSeen !== merchantRotationIndex()) renderMerchant();
  }

  function buyMerchantCard(id) {
    const price = merchantPrices[id];
    if (save.bronze < price) return toast('Not enough Bronze.');
    save.bronze -= price;
    const key = keyFor(id);
    save.owned[key] = (save.owned[key] || 0) + 1;
    persist();
    closeCardModal();
    closeConfirm();
    renderMerchant();
    toast(`${cardDefs[id].name} added to your owned cards.`);
  }

  function renderSellPanel() {
    if (selectedSellKey && spareCount(selectedSellKey) < 1) selectedSellKey = null;
    const slot = $('merchantSellSlot');
    if (!selectedSellKey) {
      slot.innerHTML = '<span class="sell-placeholder">CHOOSE A CARD TO SELL</span><span class="sell-plus">＋</span><span class="sell-value">50 BRONZE</span>';
      $('merchantSellConfirm').disabled = true;
      $('merchantSellConfirm').textContent = 'SELL';
      return;
    }
    const { def } = parseKey(selectedSellKey);
    slot.innerHTML = `<img src="${cardAsset(selectedSellKey)}" alt="${def.name}"><span class="selling-name">${def.name} • +50 BRONZE</span>`;
    $('merchantSellConfirm').disabled = false;
    $('merchantSellConfirm').textContent = 'SELL +50 B';
  }

  function renderSellPicker() {
    const keys = sortCardKeys(Object.keys(save.owned).filter(key => (save.owned[key] || 0) > 0 && spareCount(key) > 0));
    $('sellPickerGrid').innerHTML = keys.length ? keys.map(key => {
      const { rank, def } = parseKey(key);
      return `<button class="picker-card" type="button" data-sell-card="${key}"><img src="${cardAsset(key)}" alt="${def.name}"><b>${def.name}</b><small>${rank.toUpperCase()} • SPARE ${spareCount(key)}</small></button>`;
    }).join('') : '<p>No spare cards are available. Remove a copy from the active deck first.</p>';
    document.querySelectorAll('[data-sell-card]').forEach(button => {
      button.onclick = () => selectSellCard(button.dataset.sellCard);
    });
  }

  function selectSellCard(key) {
    if (spareCount(key) < 1) return toast('That card has no spare copies.');
    selectedSellKey = key;
    setOverlay('sellPicker', false);
    renderSellPanel();
  }

  function requestSell() {
    if (!selectedSellKey || spareCount(selectedSellKey) < 1) return toast('Choose a spare card first.');
    const { def } = parseKey(selectedSellKey);
    showConfirm(`Sell ${def.name}?`, 'One spare copy will be sold for 50 Bronze. Active-deck copies remain protected.', completeSell);
  }

  function completeSell() {
    if (!selectedSellKey || spareCount(selectedSellKey) < 1) {
      closeConfirm();
      return toast('That spare copy is no longer available.');
    }
    const soldKey = selectedSellKey;
    const { def } = parseKey(soldKey);
    save.owned[soldKey] -= 1;
    save.bronze += 50;
    selectedSellKey = null;
    persist();
    closeConfirm();
    renderMerchant();
    toast(`${def.name} sold for 50 Bronze.`);
  }

  function missionProgress(id) {
    const def = localMissions[id];
    const state = save.missions[id];
    if (!state.accepted) return 0;
    return Math.min(def.goal, Math.max(0, (save.stats[def.stat] || 0) - (state.baseline || 0)));
  }

  function renderMissions() {
    $('missionList').innerHTML = Object.entries(localMissions).map(([id, def]) => {
      const state = save.missions[id];
      const progress = missionProgress(id);
      const complete = progress >= def.goal;
      let label = 'ACCEPT';
      let disabled = false;
      let css = '';
      if (state.claimed) { label = 'CLAIMED'; disabled = true; }
      else if (state.accepted && complete) { label = 'CLAIM'; css = 'claim'; }
      else if (state.accepted) { label = 'ACTIVE'; disabled = true; }
      return `<article class="mission-row">
        <div><h3>${def.title}</h3><p>${def.copy} Reward: ${def.rewardText}.</p><div class="mission-progress">PROGRESS ${progress} / ${def.goal}</div></div>
        <button class="${css}" type="button" data-mission="${id}" ${disabled ? 'disabled' : ''}>${label}</button>
      </article>`;
    }).join('');
    document.querySelectorAll('[data-mission]').forEach(button => button.onclick = () => handleMission(button.dataset.mission));
  }

  function handleMission(id) {
    const def = localMissions[id];
    const state = save.missions[id];
    if (!state.accepted) {
      state.accepted = true;
      state.baseline = save.stats[def.stat] || 0;
      persist();
      renderMissions();
      return toast(`${def.title} accepted.`);
    }
    if (!state.claimed && missionProgress(id) >= def.goal) {
      state.claimed = true;
      if (def.reward.bronze) save.bronze += def.reward.bronze;
      if (def.reward.card) save.owned[def.reward.card] = (save.owned[def.reward.card] || 0) + 1;
      persist();
      renderMerchant();
      toast(`${def.title} reward claimed.`);
    }
  }

  /* Equipment */
  function cardVisibleForHero(key, hero) {
    const {def}=parseKey(key);
    return def && (def.hero === hero || def.hero === 'universal');
  }
  function switchActiveHero(hero) {
    if (!['knight','mage','warrior','healer'].includes(hero)) return;
    if (hero !== 'knight' && (save.starterDecks?.[hero] || 0) <= 0) return toast(`${heroDisplayName(hero)} starter deck is not owned.`);
    save.activeHero = hero;
    equipmentSort = 'name';
    const equipmentSortSelect = $('equipmentSort');
    if (equipmentSortSelect) equipmentSortSelect.value = 'name';
    ensureHeroVitals(hero);
    persist();
    renderEquipment();
    syncGlobalUI();
    toast(`${heroDisplayName(hero)} is now the active Hero.`);
  }
  function renderEquipmentHeroRail() {
    document.querySelectorAll('[data-hero-filter]').forEach(button => {
      const hero=button.dataset.heroFilter;
      const owned=hero==='knight' || (save.starterDecks?.[hero]||0)>0;
      const p=heroProgress(hero), level=heroLevel(hero), need=xpNeededForLevel(level);
      button.classList.toggle('locked',!owned);
      button.classList.toggle('selected',hero===activeHero());
      button.disabled=!owned;
      const label=button.querySelector('.hero-progress-label') || button.querySelector('span');
      if(label){ label.className='hero-progress-label'; label.innerHTML=`<b>${heroDisplayName(hero).toUpperCase()} • LV ${level}</b><small>XP ${p.xp} / ${need}</small><i><em style="width:${xpProgressPct(hero)}%"></em></i>`; }
    });
  }
  function renderEquipment() {
    syncGlobalUI();
    renderEquipmentHeroRail();
    const hero=activeHero();
    const total=deckTotal();
    $('equipmentDeckCount').textContent=total;
    $('equipmentHeroName').textContent=`${heroDisplayName(hero).toUpperCase()} OWNED CARDS`;
    $('deckHealth').textContent=total<5?'NEEDS 5 CARDS':'READY';
    $('deckHealth').classList.toggle('warn',total<5);
    $('activeDeck').innerHTML='';
    const ownedKeys=sortInventoryKeys(Object.keys(save.owned).filter(key=>{
      if((save.owned[key]||0)<=0) return false;
      const {rank}=parseKey(key); const def=parseKey(key).def;
      if(!def) return false;
      if(equipmentSort!=='name' && ['mage','knight','warrior','healer'].includes(equipmentSort)) {
        if(!(def.hero===equipmentSort || def.hero==='universal')) return false;
      } else if(!cardVisibleForHero(key,hero)) return false;
      if(equipmentRankFilter!=='all' && rank!==equipmentRankFilter) return false;
      if(equipmentTypeFilter!=='all' && cardCategory(key)!==equipmentTypeFilter) return false;
      return true;
    }), equipmentSort==='name'?'name':'rank');
    $('ownedCards').innerHTML=ownedKeys.map(key=>{
      const {rank,def}=parseKey(key); const deckCount=activeDeckMap()[key]||0;
      return `<button class="owned-card ${deckCount?'in-deck':''}" type="button" data-owned-card="${key}"><span class="rank-label rank-${rank}">${rank}</span><span class="count-tag">OWNED ×${save.owned[key]}</span><img src="${cardAsset(key)}" alt="${rank} ${def.name}"><b>${def.name}</b><small>${def.hero==='universal'?'UNIVERSAL':def.hero.toUpperCase()} • OWNED ${save.owned[key]} • IN DECK ${deckCount} • SPARE ${spareCount(key)}</small></button>`;
    }).join('') || '<p class="inventory-empty">No cards match this filter.</p>';
    document.querySelectorAll('[data-owned-card]').forEach(button=>{ button.onclick=()=>openCardModal(button.dataset.ownedCard,{type:'equipment'}); });
  }

  function changeDeck(key, delta) {
    if (!cardVisibleForHero(key, activeHero())) return toast('That card belongs to another Hero.');
    const current = activeDeckMap()[key] || 0;
    if (delta > 0) {
      if (deckTotal() >= 20) return toast('The active deck is already at 20 cards.');
      if (spareCount(key) <= 0) return toast('No spare copy is available. Another Hero deck may already be using it.');
      activeDeckMap()[key] = current + 1;
    } else {
      if (deckTotal() <= 5) return toast('Keep at least 5 cards in the active deck.');
      if (current <= 0) return;
      activeDeckMap()[key] = current - 1;
    }
    persist();
    closeCardModal();
    renderEquipment();
  }

  /* Forge */
  function nextRank(rank) {
    const index = RANKS.indexOf(rank);
    return index >= 0 && index < RANKS.length - 1 ? RANKS[index + 1] : null;
  }

  function forgeCostFor(key) {
    const { rank, def } = parseKey(key);
    if (rank === 'silver') return { bronze: 500, silver: 1 };
    if (rank === 'bronze') return { bronze: def?.category === 'finisher' ? 150 : 100, silver: 0 };
    return { bronze: 0, silver: 0 };
  }

  function canAffordForgeCost(key) {
    const cost = forgeCostFor(key);
    return save.bronze >= cost.bronze && save.silver >= cost.silver;
  }

  function formatForgeCost(key) {
    const cost = forgeCostFor(key);
    const parts = [];
    if (cost.bronze) parts.push(`${cost.bronze} Bronze`);
    if (cost.silver) parts.push(`${cost.silver} Silver`);
    return parts.join(' + ') || 'FREE';
  }

  function renderForge() {
    syncGlobalUI();
    $('forgeInventory').innerHTML = '';
    renderForgePicker();
    renderForgeSelection();
  }

  function renderForgePicker() {
    const inventoryKeys = sortInventoryKeys(Object.keys(save.owned).filter(key => {
      const { rank, def } = parseKey(key);
      if (!((save.owned[key] || 0) > 0 && def?.forgeable && nextRank(rank))) return false;
      if (['mage','knight','warrior','healer'].includes(forgeSort) && !(def.hero === forgeSort || def.hero === 'universal')) return false;
      if (forgeRankFilter !== 'all' && rank !== forgeRankFilter) return false;
      if (forgeTypeFilter !== 'all' && cardCategory(key) !== forgeTypeFilter) return false;
      return true;
    }), forgeSort === 'name' ? 'name' : 'rank');
    $('forgePickerGrid').innerHTML = inventoryKeys.length ? inventoryKeys.map(key => {
      const { rank, def } = parseKey(key);
      const spare = spareCount(key);
      return `<button class="picker-card ${spare < 3 ? 'disabled' : ''}" type="button" data-forge-card="${key}" ${spare < 3 ? 'aria-disabled="true"' : ''}><img src="${cardAsset(key)}" alt="${rank} ${def.name}"><b>${def.name}</b><small>${rank.toUpperCase()} • OWNED ${save.owned[key] || 0} • SPARE ${spare} / 3</small></button>`;
    }).join('') : '<p>No forgeable owned cards are available.</p>';
    document.querySelectorAll('[data-forge-card]').forEach(button => button.onclick = () => selectForgeCard(button.dataset.forgeCard));
  }

  function selectForgeCard(key) {
    if (spareCount(key) < 3) return toast('You need 3 spare copies. Active-deck cards are protected.');
    forgeSelection = key;
    setOverlay('forgePicker', false);
    renderForge();
  }

  function renderForgeSelection() {
    const slots = $('forgeSlots').querySelectorAll('div');
    if (!forgeSelection || spareCount(forgeSelection) < 3) {
      forgeSelection = null;
      slots.forEach(slot => { slot.innerHTML = '＋'; });
      $('forgePreview').innerHTML = '<span>THE UPGRADED CARD<br>WILL APPEAR HERE</span>';
      $('forgeButton').disabled = true;
      $('forgeButton').textContent = 'MERGE';
      $('forgeHint').textContent = 'ACTIVE-DECK COPIES ARE PROTECTED';
      return;
    }
    const { id, rank, def } = parseKey(forgeSelection);
    slots.forEach(slot => { slot.innerHTML = `<img src="${cardAsset(forgeSelection)}" alt="${def.name}">`; });
    const resultKey = keyFor(id, nextRank(rank));
    $('forgePreview').innerHTML = `<img src="${cardAsset(resultKey)}" alt="Forged ${def.name}">`;
    $('forgeButton').disabled = !canAffordForgeCost(forgeSelection);
    $('forgeButton').textContent = canAffordForgeCost(forgeSelection) ? 'MERGE' : 'NEED FUNDS';
    $('forgeHint').textContent = `${def.name.toUpperCase()} • OWNED ${save.owned[forgeSelection] || 0} • SPARE ${spareCount(forgeSelection)} • ${rank.toUpperCase()} → ${nextRank(rank).toUpperCase()} • COST ${formatForgeCost(forgeSelection)}`;
  }

  function requestForge() {
    if (!forgeSelection || spareCount(forgeSelection) < 3) return toast('Select a card with 3 spare copies.');
    if (!canAffordForgeCost(forgeSelection)) return toast(`Forge cost: ${formatForgeCost(forgeSelection)}.`);
    const { rank, def } = parseKey(forgeSelection);
    const cost = forgeCostFor(forgeSelection);
    showConfirm(
      `Forge ${nextRank(rank)} ${def.name}?`,
      `Consume 3 spare copies. Forge cost: ${formatForgeCost(forgeSelection)}. Bronze ${save.bronze} → ${save.bronze - cost.bronze}. Silver ${save.silver} → ${save.silver - cost.silver}. Active-deck copies stay protected.`,
      completeForge
    );
  }

  function completeForge() {
    const sourceKey = forgeSelection;
    if (!sourceKey || spareCount(sourceKey) < 3) {
      closeConfirm();
      return toast('The selected copies are no longer available.');
    }
    const { id, rank, def } = parseKey(sourceKey);
    if (!canAffordForgeCost(sourceKey)) {
      closeConfirm();
      renderForge();
      return toast(`Forge cost: ${formatForgeCost(sourceKey)}.`);
    }
    const cost = forgeCostFor(sourceKey);
    const resultRank = nextRank(rank);
    const resultKey = keyFor(id, resultRank);
    const sourceImage = cardAsset(sourceKey);
    save.bronze -= cost.bronze;
    save.silver -= cost.silver;
    save.owned[sourceKey] -= 3;
    save.owned[resultKey] = (save.owned[resultKey] || 0) + 1;
    persist();
    closeConfirm();
    forgeSelection = null;
    renderForge();
    ['forgeSourceImg1','forgeSourceImg2','forgeSourceImg3'].forEach(id => {
      $(id).src = sourceImage;
      $(id).alt = `${rank} ${def.name}`;
    });
    $('forgeFusionTitle').textContent = `${rank.toUpperCase()} → ${resultRank.toUpperCase()}`;
    $('forgeResultImg').src = cardAsset(resultKey);
    $('forgeResultImg').alt = `${resultRank} ${def.name}`;
    $('forgeResultName').textContent = `${resultRank.toUpperCase()} ${def.name} CREATED`;
    const overlay = $('forgeResult');
    overlay.classList.remove('fusion-run');
    setOverlay('forgeResult', true);
    void overlay.offsetWidth;
    overlay.classList.add('fusion-run');
  }

  /* V10 persistent recovery room. Battle damage now carries between encounters. */
  function heroStatsForLevel(hero = activeHero(), level = heroLevel(hero)) {
    const safeLevel = Math.max(1, Number(level) || 1);
    if (hero === 'mage') return { level: safeLevel, hp: 92 + ((safeLevel - 1) * 9), mp: 72 + ((safeLevel - 1) * 2) };
    if (hero === 'healer') return { level: safeLevel, hp: 104 + ((safeLevel - 1) * 10), mp: 66 + ((safeLevel - 1) * 2) };
    if (hero === 'warrior') return { level: safeLevel, hp: 112 + ((safeLevel - 1) * 11), mp: 46 + (safeLevel - 1) };
    return knightStatsForLevel(safeLevel);
  }

  function ensureHeroVitals(hero = 'knight') {
    const max = heroStatsForLevel(hero);
    const existing = save.heroVitals?.[hero];
    if (!save.heroVitals) save.heroVitals = {};
    if (!existing) {
      save.heroVitals[hero] = { hp: max.hp, maxHp: max.hp, mp: max.mp, maxMp: max.mp };
      return save.heroVitals[hero];
    }
    const oldMaxHp = Math.max(1, existing.maxHp || max.hp);
    const oldMaxMp = Math.max(1, existing.maxMp || max.mp);
    const hpGain = Math.max(0, max.hp - oldMaxHp);
    const mpGain = Math.max(0, max.mp - oldMaxMp);
    existing.hp = Math.min(max.hp, Math.max(0, Number(existing.hp ?? oldMaxHp)) + hpGain);
    existing.mp = Math.min(max.mp, Math.max(0, Number(existing.mp ?? oldMaxMp)) + mpGain);
    existing.maxHp = max.hp;
    existing.maxMp = max.mp;
    return existing;
  }

  function saveBattleVitals() {
    if (!battle?.hero) return;
    const vitals = ensureHeroVitals(battle.hero.id || activeHero());
    vitals.hp = Math.max(0, Math.min(vitals.maxHp, battle.hero.hp));
    vitals.mp = Math.max(0, Math.min(vitals.maxMp, battle.hero.mp));
    persist();
  }

  function availableHealingHeroes() {
    return ['knight', 'mage', 'healer', 'warrior'].filter(hero => hero === 'knight' || (save.starterDecks?.[hero] || 0) > 0);
  }

  function heroDisplayName(hero) { return hero[0].toUpperCase() + hero.slice(1); }

  function activeHealingCount(now = Date.now()) {
    return (save.healingSlots || []).filter(slot => slot && !slot.complete && slot.endsAt > now).length;
  }

  function completeHealingJobs(now = Date.now()) {
    let changed = false;
    (save.healingSlots || []).forEach(slot => {
      if (!slot || slot.complete || now < slot.endsAt) return;
      const vitals = ensureHeroVitals(slot.hero);
      vitals.hp = vitals.maxHp;
      vitals.mp = vitals.maxMp;
      slot.complete = true;
      changed = true;
    });
    if (changed) persist();
    return changed;
  }

  function healTimeText(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `0:${String(seconds).padStart(2, '0')}`;
  }

  function renderHealer() {
    completeHealingJobs();
    const now = Date.now();
    $('healStations').innerHTML = [0, 1].map(index => {
      const slot = save.healingSlots[index];
      if (!slot) return `<article class="heal-station empty"><span class="heal-bed-number">BED ${index + 1}</span><div class="heal-plus">＋</div><b>PLACE DECK</b><small>CLICK TO CHOOSE</small><button type="button" data-heal-slot="${index}" aria-label="Choose deck for recovery bed ${index + 1}"></button></article>`;
      const vitals = ensureHeroVitals(slot.hero);
      const complete = !!slot.complete;
      const remaining = Math.max(0, slot.endsAt - now);
      const elapsedPct = complete ? 100 : Math.max(0, Math.min(100, ((slot.duration - remaining) / Math.max(1, slot.duration)) * 100));
      const speedClass = slot.duration >= 60000 ? 'slow' : 'fast';
      return `<article class="heal-station ${complete ? 'complete' : 'active'}">
        <span class="heal-bed-number">BED ${index + 1}</span>
        <img src="assets/heroes/${slot.hero}_card.webp" alt="${heroDisplayName(slot.hero)} deck">
        <h2>${heroDisplayName(slot.hero).toUpperCase()}</h2>
        <div class="heal-vital"><span>HEALTH</span><b>${vitals.hp} / ${vitals.maxHp}</b></div>
        <div class="heal-vital"><span>MANA</span><b>${vitals.mp} / ${vitals.maxMp}</b></div>
        <div class="heal-countdown ${speedClass} ${complete ? 'done' : ''}"><span class="heal-progress-fill" style="width:${elapsedPct}%"></span>${complete ? 'RECOVERED' : `HEALING • ${healTimeText(remaining)}`}</div>
        ${complete ? `<button class="heal-remove" type="button" data-heal-remove="${index}">REMOVE DECK</button>` : `<small class="heal-duration">${Math.round(slot.duration / 1000)} SECOND RECOVERY</small>`}
      </article>`;
    }).join('');
    document.querySelectorAll('[data-heal-slot]').forEach(button => button.onclick = () => openHealPicker(Number(button.dataset.healSlot)));
    document.querySelectorAll('[data-heal-remove]').forEach(button => button.onclick = () => removeHealingDeck(Number(button.dataset.healRemove)));
  }

  function openHealPicker(index) {
    healingPickerSlot = index;
    completeHealingJobs();
    const slotted = new Set((save.healingSlots || []).filter(Boolean).map(slot => slot.hero));
    const heroes = availableHealingHeroes();
    $('healPickerGrid').innerHTML = heroes.map(hero => {
      const vitals = ensureHeroVitals(hero);
      const full = vitals.hp >= vitals.maxHp && vitals.mp >= vitals.maxMp;
      const busy = slotted.has(hero);
      return `<button class="heal-choice ${full || busy ? 'disabled' : ''}" type="button" data-heal-hero="${hero}" ${full || busy ? 'disabled' : ''}>
        <img src="assets/heroes/${hero}_card.webp" alt="${heroDisplayName(hero)} deck"><b>${heroDisplayName(hero).toUpperCase()}</b>
        <small>HP ${vitals.hp}/${vitals.maxHp} • MP ${vitals.mp}/${vitals.maxMp}${busy ? ' • ALREADY IN RECOVERY' : full ? ' • FULLY RECOVERED' : ''}</small>
      </button>`;
    }).join('') || '<p>No hero decks are available.</p>';
    document.querySelectorAll('[data-heal-hero]').forEach(button => button.onclick = () => startHealing(healingPickerSlot, button.dataset.healHero));
    setOverlay('healPicker', true);
  }

  function startHealing(index, hero = 'knight') {
    completeHealingJobs();
    if (![0,1].includes(index)) return false;
    if (!availableHealingHeroes().includes(hero)) return false;
    if (save.healingSlots.some(slot => slot?.hero === hero)) return toast(`${heroDisplayName(hero)} is already in recovery.`), false;
    const vitals = ensureHeroVitals(hero);
    if (vitals.hp >= vitals.maxHp && vitals.mp >= vitals.maxMp) return toast(`${heroDisplayName(hero)} is already fully recovered.`), false;
    const duration = activeHealingCount() > 0 ? 60000 : 30000;
    save.healingSlots[index] = { hero, startedAt: Date.now(), endsAt: Date.now() + duration, duration, complete: false };
    persist();
    setOverlay('healPicker', false);
    renderHealer();
    toast(`${heroDisplayName(hero)} recovery started: ${duration / 1000} seconds.`);
    return true;
  }

  function removeHealingDeck(index) {
    const slot = save.healingSlots[index];
    if (!slot) return;
    if (!slot.complete && slot.endsAt > Date.now()) return toast('That deck is still healing.');
    save.healingSlots[index] = null;
    persist();
    renderHealer();
  }

  /* Battle encounter rotation + level-scaled economy
     - Standard enemies enter 1-3 levels above the player; rare Avengers enter 10 levels above.
     - Normal enemy stats and Bronze drops scale by level and creature difficulty.
     - Status-effect creatures receive a higher reward profile.
     - Goblin Coin Carrier has an 8% chance to replace a normal encounter.
     - After 5 normal-cycle wins, the next battle is a Boss or Hero encounter.
     - Boss/Hero wins guarantee 1-2 Silver. Coin Carrier wins guarantee 2-3 Silver + 200-600 Bronze. */
  const COIN_CARRIER_CHANCE = 0.08;
  const AVENGER_CHANCE = 0.05;
  const ENCOUNTERS = {
    wolf: { id: 'wolf', name: 'Wolf', kind: 'normal', image: 'assets/enemies/wolf_battle.webp', hp: 42, hpPerLevel: 11, mp: 12, mpPerLevel: 1.5, damageMin: 8, damageMax: 12, damagePerLevel: 0.75, poisonChance: 0, bronze: [25, 40] },
    boar: { id: 'boar', name: 'Boar', kind: 'normal', image: 'assets/enemies/boar_battle.webp', hp: 46, hpPerLevel: 13, mp: 10, mpPerLevel: 1.4, damageMin: 9, damageMax: 13, damagePerLevel: 0.85, poisonChance: 0, bronze: [40, 65] },
    spider: { id: 'spider', name: 'Giant Spider', kind: 'normal', image: 'assets/enemies/spider_battle.webp', hp: 38, hpPerLevel: 10, mp: 14, mpPerLevel: 2.0, damageMin: 7, damageMax: 11, damagePerLevel: 0.65, poisonChance: 0.22, bronze: [40, 65] },
    bandit: { id: 'bandit', name: 'Bandit', kind: 'normal', image: 'assets/enemies/bandit_battle.webp', hp: 44, hpPerLevel: 12, mp: 12, mpPerLevel: 1.7, damageMin: 8, damageMax: 12, damagePerLevel: 0.75, poisonChance: 0, bronze: [35, 55] },
    bandit_outrider: { id: 'bandit_outrider', name: 'Bandit Outrider', kind: 'normal', image: 'assets/enemies/bandit_outrider_battle.webp', hp: 48, hpPerLevel: 14, mp: 12, mpPerLevel: 1.7, damageMin: 9, damageMax: 13, damagePerLevel: 0.9, poisonChance: 0, bronze: [50, 75] },
    traveling_mercenaries: { id: 'traveling_mercenaries', name: 'Traveling Mercenaries', kind: 'normal', image: 'assets/enemies/traveling_mercenaries_battle.webp', hp: 50, hpPerLevel: 15, mp: 14, mpPerLevel: 2.0, damageMin: 9, damageMax: 14, damagePerLevel: 0.9, poisonChance: 0, bronze: [60, 95] },
    goblin_scout: { id: 'goblin_scout', name: 'Goblin Scout', kind: 'normal', image: 'assets/enemies/goblin_scout_battle.webp', hp: 40, hpPerLevel: 10, mp: 14, mpPerLevel: 1.6, damageMin: 7, damageMax: 11, damagePerLevel: 0.65, poisonChance: 0, bronze: [30, 45] },
    armored_goblin: { id: 'armored_goblin', name: 'Armored Goblin', kind: 'normal', image: 'assets/enemies/armored_goblin_battle.webp', hp: 52, hpPerLevel: 16, mp: 10, mpPerLevel: 1.5, damageMin: 8, damageMax: 12, damagePerLevel: 0.8, poisonChance: 0, bronze: [55, 85] },
    berserk_goblin: { id: 'berserk_goblin', name: 'Berserk Goblin', kind: 'normal', image: 'assets/enemies/berserk_goblin_battle.webp', hp: 48, hpPerLevel: 14, mp: 10, mpPerLevel: 1.6, damageMin: 11, damageMax: 15, damagePerLevel: 1.0, poisonChance: 0, bronze: [65, 105] },
    owlbear: { id: 'owlbear', name: 'Owlbear', kind: 'normal', image: 'assets/enemies/owlbear_battle.webp', hp: 58, hpPerLevel: 18, mp: 8, mpPerLevel: 1.4, damageMin: 11, damageMax: 16, damagePerLevel: 1.1, poisonChance: 0, bronze: [75, 120] },
    goblin_coin_carrier: { id: 'goblin_coin_carrier', name: 'Goblin Coin Carrier', kind: 'special', image: 'assets/enemies/goblin_coin_carrier_battle.webp', hp: 44, hpPerLevel: 11, mp: 12, mpPerLevel: 1.8, damageMin: 8, damageMax: 12, damagePerLevel: 0.75, poisonChance: 0, bronze: [200, 600], silver: [2, 3] },
    goblin_king: { id: 'goblin_king', name: 'Goblin King', kind: 'boss', image: 'assets/enemies/goblin_king_battle.webp', hp: 82, hpPerLevel: 22, mp: 18, mpPerLevel: 3.0, damageMin: 12, damageMax: 17, damagePerLevel: 1.15, poisonChance: 0, bronze: [140, 220], silver: [1, 2] },
    mirror_knight: { id: 'mirror_knight', name: 'Rival Knight', kind: 'hero', image: 'assets/enemies/mirror_knight_battle.webp', hp: 76, hpPerLevel: 18, mp: 22, mpPerLevel: 2.2, damageMin: 10, damageMax: 15, damagePerLevel: 1.0, poisonChance: 0, bronze: [110, 180], silver: [1, 2] },
    mirror_mage: { id: 'mirror_mage', name: 'Rival Mage', kind: 'hero', image: 'assets/enemies/mirror_mage_battle.webp', hp: 68, hpPerLevel: 16, mp: 30, mpPerLevel: 3.0, damageMin: 11, damageMax: 16, damagePerLevel: 1.05, poisonChance: 0, bronze: [105, 175], silver: [1, 2] },
    mirror_warrior: { id: 'mirror_warrior', name: 'Rival Warrior', kind: 'hero', image: 'assets/enemies/mirror_warrior_battle.webp', hp: 80, hpPerLevel: 20, mp: 18, mpPerLevel: 2.2, damageMin: 12, damageMax: 17, damagePerLevel: 1.15, poisonChance: 0, bronze: [120, 190], silver: [1, 2] },
    mirror_healer: { id: 'mirror_healer', name: 'Rival Healer', kind: 'hero', image: 'assets/enemies/mirror_healer_battle.webp', hp: 72, hpPerLevel: 17, mp: 28, mpPerLevel: 3.0, damageMin: 9, damageMax: 14, damagePerLevel: 0.85, poisonChance: 0, bronze: [100, 165], silver: [1, 2] }
  };
  const NORMAL_ENCOUNTER_IDS = ['wolf','boar','spider','bandit','bandit_outrider','traveling_mercenaries','goblin_scout','armored_goblin','berserk_goblin','owlbear'];
  const BOSS_HERO_ENCOUNTER_IDS = ['goblin_king','mirror_knight','mirror_mage','mirror_warrior','mirror_healer'];


  /* V9 enemy move sets.
     Every enemy now has a readable Boost pattern and a weighted Skill/Special pool.
     Specials spend enemy Mana; Mana regenerates each enemy turn so the blue bar matters. */
  const ENEMY_MOVESETS = {
    wolf: {
      boostChance: .28,
      boosts: [{ id:'predator_focus', name:"Predator's Focus", effect:'empower', value:1.30, className:'enemy-power' }],
      skills: [
        { id:'bite', name:'Bite', mult:1.00, weight:6 },
        { id:'savage_bite', name:'Savage Bite', mult:1.22, cost:7, weight:3, special:true, status:'bleed', statusChance:.32, statusTurns:2, statusDamage:3 }
      ]
    },
    boar: {
      boostChance: .30,
      boosts: [{ id:'brace', name:'Brace', effect:'guard', value:.32, className:'enemy-guard' }],
      skills: [
        { id:'tusk', name:'Tusk Strike', mult:1.00, weight:6 },
        { id:'gore', name:'Gore', mult:1.38, cost:7, weight:3, special:true, status:'stagger', statusChance:.26, statusTurns:1 }
      ]
    },
    spider: {
      boostChance: .34,
      boosts: [{ id:'venom_coat', name:'Venom Coat', effect:'statusFocus', status:'poison', value:.22, className:'enemy-power' }],
      skills: [
        { id:'fangs', name:'Fang Strike', mult:.92, weight:5, status:'poison', statusChance:.18, statusTurns:2, statusDamage:3 },
        { id:'venom_bite', name:'Venom Bite', mult:1.10, cost:8, weight:4, special:true, status:'poison', statusChance:.48, statusTurns:2, statusDamage:4 }
      ]
    },
    bandit: {
      boostChance: .28,
      boosts: [{ id:'dirty_feint', name:'Dirty Feint', effect:'empower', value:1.24, className:'enemy-power' }],
      skills: [
        { id:'slash', name:'Bandit Slash', mult:1.00, weight:6 },
        { id:'cheap_shot', name:'Cheap Shot', mult:1.20, cost:7, weight:3, special:true, status:'stagger', statusChance:.28, statusTurns:1 }
      ]
    },
    bandit_outrider: {
      boostChance: .32,
      boosts: [{ id:'ride_down', name:'Ride Down', effect:'empower', value:1.34, className:'enemy-power' }],
      skills: [
        { id:'cavalry_cut', name:'Cavalry Cut', mult:1.05, weight:5 },
        { id:'charging_lance', name:'Charging Strike', mult:1.48, cost:8, weight:4, special:true, status:'stagger', statusChance:.22, statusTurns:1 }
      ]
    },
    traveling_mercenaries: {
      boostChance: .34,
      boosts: [{ id:'formation', name:'Defensive Formation', effect:'guard', value:.28, className:'enemy-guard' }],
      skills: [
        { id:'mercenary_strike', name:'Mercenary Strike', mult:1.00, weight:5 },
        { id:'coordinated_assault', name:'Coordinated Assault', mult:.72, hits:2, cost:9, weight:4, special:true }
      ]
    },
    goblin_scout: {
      boostChance: .35,
      boosts: [{ id:'quickstep', name:'Quickstep', effect:'guard', value:.25, className:'enemy-guard' }],
      skills: [
        { id:'shiv', name:'Goblin Shiv', mult:.92, weight:6 },
        { id:'ambush', name:'Ambush', mult:1.18, cost:7, weight:3, special:true, status:'stagger', statusChance:.30, statusTurns:1 }
      ]
    },
    armored_goblin: {
      boostChance: .40,
      boosts: [{ id:'shield_wall', name:'Shield Wall', effect:'guard', value:.45, className:'enemy-guard' }],
      skills: [
        { id:'mace', name:'Armored Mace', mult:1.00, weight:5 },
        { id:'shield_slam', name:'Shield Slam', mult:1.18, cost:7, weight:4, special:true, status:'stagger', statusChance:.36, statusTurns:1 }
      ]
    },
    berserk_goblin: {
      boostChance: .40,
      boosts: [{ id:'blood_rage', name:'Blood Rage', effect:'rage', value:1.55, selfDamagePct:.07, mana:4, className:'enemy-power' }],
      skills: [
        { id:'cleaver', name:'Cleaver', mult:1.08, weight:5 },
        { id:'wild_cleave', name:'Wild Cleave', mult:1.48, cost:8, weight:4, special:true, status:'bleed', statusChance:.34, statusTurns:2, statusDamage:4 }
      ]
    },
    owlbear: {
      boostChance: .42,
      boosts: [{ id:'primal_roar', name:'Primal Roar', effect:'empower', value:1.38, className:'enemy-power' }],
      skills: [
        { id:'claw', name:'Claw Swipe', mult:1.05, weight:4 },
        { id:'maul', name:'Maul', mult:1.55, cost:8, weight:5, special:true, status:'bleed', statusChance:.42, statusTurns:2, statusDamage:5 }
      ]
    },
    goblin_coin_carrier: {
      boostChance: .38,
      boosts: [{ id:'panic_guard', name:'Panic Guard', effect:'guard', value:.34, className:'enemy-guard' }],
      skills: [
        { id:'coin_sack', name:'Coin Sack Swing', mult:.96, weight:6 },
        { id:'desperate_swing', name:'Desperate Swing', mult:1.28, cost:7, weight:3, special:true }
      ]
    },
    goblin_king: {
      boostChance: .58,
      boosts: [
        { id:'royal_command', name:'Royal Command', effect:'healEmpower', healPct:.09, value:1.34, className:'enemy-heal' },
        { id:'kings_guard', name:"King's Guard", effect:'guard', value:.42, className:'enemy-guard' }
      ],
      skills: [
        { id:'royal_cleave', name:'Royal Cleave', mult:1.18, weight:4 },
        { id:'kings_decree', name:"King's Decree", mult:1.58, cost:11, weight:4, special:true, status:'stagger', statusChance:.38, statusTurns:1 },
        { id:'tyrants_blade', name:"Tyrant's Blade", mult:1.42, cost:9, weight:3, special:true, status:'bleed', statusChance:.45, statusTurns:2, statusDamage:5 }
      ]
    },
    mirror_knight: {
      boostChance: .52,
      boosts: [{ id:'shield_up', name:'Shield Up', effect:'guardMana', value:.50, mana:6, className:'enemy-guard' }],
      skills: [
        { id:'sword_strike', name:'Sword Strike', mult:1.00, weight:5 },
        { id:'shield_bash', name:'Shield Bash', mult:1.22, cost:8, weight:4, special:true, status:'stagger', statusChance:.40, statusTurns:1 },
        { id:'executioner', name:"Executioner's Swing", mult:1.78, cost:15, weight:2, special:true }
      ]
    },
    mirror_mage: {
      boostChance: .54,
      boosts: [
        { id:'focus', name:'Focus', effect:'empower', value:1.62, className:'enemy-power' },
        { id:'magic_shield', name:'Magic Shield', effect:'guardMana', value:.42, mana:6, className:'enemy-guard' }
      ],
      skills: [
        { id:'magic_bolt', name:'Magic Bolt', mult:.98, weight:4 },
        { id:'fireball', name:'Fireball', mult:1.38, cost:10, weight:4, special:true, status:'burn', statusChance:.42, statusTurns:2, statusDamage:5 },
        { id:'ice_shards', name:'Ice Shards', mult:1.20, cost:8, weight:3, special:true, status:'stagger', statusChance:.34, statusTurns:1 },
        { id:'elemental_storm', name:'Elemental Storm', mult:1.72, cost:15, weight:2, special:true, status:'burn', statusChance:.30, statusTurns:2, statusDamage:6 }
      ]
    },
    mirror_warrior: {
      boostChance: .56,
      boosts: [
        { id:'second_wind', name:'Second Wind', effect:'healMana', healPct:.10, mana:8, className:'enemy-heal' },
        { id:'adrenaline', name:'Adrenaline Rush', effect:'rage', value:1.72, selfDamagePct:.08, mana:8, className:'enemy-power' }
      ],
      skills: [
        { id:'punch', name:'Punch', mult:1.00, weight:4 },
        { id:'double_strike', name:'Double Strike', mult:.78, hits:2, cost:10, weight:4, special:true },
        { id:'smash', name:'Smash', mult:1.46, cost:11, weight:3, special:true },
        { id:'wild_swing', name:'Wild Swing', mult:1.88, cost:15, weight:2, special:true }
      ]
    },
    mirror_healer: {
      boostChance: .60,
      boosts: [
        { id:'prayer_focus', name:'Prayer Focus', effect:'healEmpower', healPct:.10, value:1.38, className:'enemy-heal' },
        { id:'blessed_shield', name:'Blessed Shield', effect:'guardMana', value:.48, mana:8, className:'enemy-guard' }
      ],
      skills: [
        { id:'light_strike', name:'Light Strike', mult:.92, weight:4 },
        { id:'guarding_prayer', name:'Guarding Prayer', mult:.70, selfHealPct:.08, manaGain:5, weight:4 },
        { id:'sacred_flames', name:'Sacred Flames', mult:1.34, cost:10, weight:4, special:true, status:'burn', statusChance:.46, statusTurns:2, statusDamage:5 },
        { id:'radiant_light', name:'Radiant Light', mult:1.66, cost:15, weight:2, special:true }
      ]
    }
  };

  const GOBLIN_KING_FURY = {
    boosts: [{ id:'inventory', name:'Inventory', effect:'inventory', className:'enemy-inventory' }],
    skills: [{ id:'goblins_club', name:"Goblin's Club", mult:1.34, costPctMaxMana:.25, weight:5, special:true, status:'stun', statusChance:.60, statusTurns:1, growingClub:true }]
  };

  function enemyMoveCost(move, enemy = battle?.enemy) {
    if (!move) return 0;
    if (move.costPctMaxMana) return Math.max(1, Math.ceil((enemy?.maxMp || 1) * move.costPctMaxMana));
    return Math.max(0, Number(move.cost) || 0);
  }

  function weightedEnemyMoveForMp(moves, mp, enemy = battle?.enemy) {
    const available = moves.filter(move => enemyMoveCost(move, enemy) <= mp);
    const freeMoves = moves.filter(move => enemyMoveCost(move, enemy) <= 0);
    const pool = available.length ? available : (freeMoves.length ? freeMoves : moves);
    const total = pool.reduce((sum, move) => sum + (move.weight || 1), 0);
    let roll = Math.random() * Math.max(1, total);
    for (const move of pool) {
      roll -= (move.weight || 1);
      if (roll <= 0) return move;
    }
    return pool[pool.length - 1];
  }

  function weightedEnemyMove(moves) { return weightedEnemyMoveForMp(moves, battle.enemy.mp, battle.enemy); }

  function enemyMoveset() {
    const base = ENEMY_MOVESETS[battle?.enemy?.id] || { boostChance:0, boosts:[], skills:[{ id:'attack', name:'Attack', mult:1, weight:1 }] };
    if (battle?.enemy?.id === 'goblin_king' && battle.enemy.phase2) {
      return {
        ...base,
        boostChance: Math.max(.68, base.boostChance || 0),
        boosts: [...base.boosts, ...GOBLIN_KING_FURY.boosts],
        skills: [...base.skills, ...GOBLIN_KING_FURY.skills]
      };
    }
    return base;
  }

  function chooseGoblinInventorySkill(skills, mp = battle.enemy.mp) {
    const affordable = skills.filter(move => enemyMoveCost(move) <= mp);
    const pool = affordable.length ? affordable : skills;
    const warded = (battle.hero.statusWardTurns || 0) > 0;
    return [...pool].sort((a,b) => {
      const score = move => (move.mult || 1) * 100 + (move.special ? 18 : 0) + (!warded && move.status ? (move.statusChance || 0) * 35 : 0) + (move.growingClub ? 24 : 0);
      return score(b) - score(a);
    })[0];
  }

  function buildStudyPlan(count = 3) {
    const plans = [];
    const set = enemyMoveset();
    let simMp = battle.enemy.mp;
    let cooldown = battle.enemy.boostCooldown || 0;
    const regen = 4 + Math.floor((battle.enemy.level - 1) / 10);
    for (let i = 0; i < count; i += 1) {
      simMp = Math.min(battle.enemy.maxMp, simMp + regen);
      let boost = null;
      if (cooldown > 0) cooldown -= 1;
      else if (set.boosts.length && Math.random() < set.boostChance) {
        boost = set.boosts[Math.floor(Math.random() * set.boosts.length)];
        cooldown = 1;
      }
      if (boost?.effect === 'healMana' || boost?.effect === 'guardMana' || boost?.effect === 'rage') simMp = Math.min(battle.enemy.maxMp, simMp + (boost.mana || 0));
      let skill = boost?.effect === 'inventory' ? chooseGoblinInventorySkill(set.skills, simMp) : weightedEnemyMoveForMp(set.skills, simMp, battle.enemy);
      const cost = enemyMoveCost(skill, battle.enemy);
      if (cost > simMp) skill = weightedEnemyMoveForMp(set.skills, simMp, battle.enemy);
      simMp = Math.max(0, simMp - enemyMoveCost(skill, battle.enemy));
      plans.push({ boost, skill });
    }
    return plans;
  }

  function scaledStatusDamage(base = 3) {
    return Math.max(1, Math.round(base + ((battle.enemy.level - 1) * .10)));
  }

  function statusIcon(id) {
    return ({ poison:'☠', bleed:'🩸', burn:'🔥', stagger:'⚡', stun:'⚡', guard:'🛡', power:'▲', ward:'✦', skill_lock:'⛓' })[id] || '•';
  }

  function showDamageEffect(target, amount, type = 'damage') {
    const layer = $('battleEffectLayer');
    if (!layer || !amount) return;
    const side = target === 'battleEnemy' ? 'enemy' : 'hero';
    const cssType = ['poison','bleed','burn','stagger','stun'].includes(type) ? type : '';
    layer.innerHTML += `<span class="damage-popup ${side} ${cssType}">-${Math.max(0, Math.round(amount))}</span>`;
    const unit = $(target);
    if (unit) {
      unit.classList.remove('damage-flash'); void unit.offsetWidth; unit.classList.add('damage-flash');
      setTimeout(() => unit.classList.remove('damage-flash'), 560);
    }
    setTimeout(() => { if (layer) layer.innerHTML = ''; }, 980);
  }

  function showStatusBurst(target, type) {
    const layer = $('battleEffectLayer');
    if (!layer) return;
    const side = target === 'battleEnemy' ? 'enemy' : 'hero';
    layer.innerHTML += `<span class="status-burst ${side} ${type}"></span>`;
    setTimeout(() => { if (layer) layer.innerHTML = ''; }, 820);
  }

  function playBattleCardFx(key) {
    const fx = $('battleCardFx');
    if (!fx) return;
    const { def } = parseKey(key);
    $('battleCardFxImg').src = cardAsset(key);
    $('battleCardFxName').textContent = def.name;
    fx.className = `battle-card-fx ${def.type === 'boost' ? 'boost' : def.category === 'finisher' ? 'finisher' : 'skill'}`;
    void fx.offsetWidth;
    fx.classList.add('show');
    setTimeout(() => fx.classList.remove('show'), 650);
  }


  const KNIGHT_MOVE_ASSET_ROOT = 'assets/characters/knight_moves/';
  const KNIGHT_CINEMATIC_IDS = new Set([
    'sword_strike',
    'sword_combo',
    'rising_slash',
    'executioners_swing',
    'shield_bash',
    'shield_block',
    'sword_and_shield'
  ]);

  function isKnightCinematicSkill(key) {
    try {
      const { id, def } = parseKey(key);
      return def?.hero === 'knight' && def?.type === 'skill' && KNIGHT_CINEMATIC_IDS.has(id);
    } catch (_) {
      return false;
    }
  }

  function clearKnightCinematic() {
    const hero = $('battleHero');
    const sprite = $('knightActionSprite');
    const fx = $('knightImpactFx');
    const screen = $('battleScreen');
    if (hero) hero.style.visibility = '';
    if (sprite) {
      sprite.className = 'knight-action-sprite';
      sprite.src = '';
    }
    if (fx) {
      fx.className = 'knight-impact-fx';
      fx.src = '';
    }
    if (screen) screen.classList.remove('knight-special-thunder');
    if (battle) {
      battle.knightAnimationEndsAt = 0;
      if (battle.hero) {
        battle.hero.shieldBlockPoseActive = false;
        battle.hero.shieldBlockPoseUntilNextTurn = false;
      }
    }
  }

  function setBattleActionTextHidden(hidden) {
    // Kept as a compatibility no-op. The battle message element no longer exists.
    return;
  }

  function showKnightActionFrame(file) {
    const hero = $('battleHero');
    setBattleActionTextHidden(true);
    const sprite = $('knightActionSprite');
    if (!sprite) return;
    if (hero) hero.style.visibility = 'hidden';
    sprite.className = 'knight-action-sprite show frame-enter';
    sprite.src = `${KNIGHT_MOVE_ASSET_ROOT}${file}`;
    void sprite.offsetWidth;
    sprite.classList.remove('frame-enter');
    void sprite.offsetWidth;
    sprite.classList.add('frame-enter');
  }

  function flashKnightImpact(file, className = 'flash-once') {
    const fx = $('knightImpactFx');
    if (!fx) return;
    fx.className = 'knight-impact-fx';
    fx.src = `${KNIGHT_MOVE_ASSET_ROOT}${file}`;
    void fx.offsetWidth;
    fx.classList.add(className);
  }

  function thunderKnightSpecial() {
    const screen = $('battleScreen');
    if (!screen) return;
    screen.classList.remove('knight-special-thunder');
    void screen.offsetWidth;
    screen.classList.add('knight-special-thunder');
    setTimeout(() => screen?.classList.remove('knight-special-thunder'), 760);
  }

  function shakeKnightBlockPose() {
    const sprite = $('knightActionSprite');
    const hero = $('battleHero');
    const target = (battle?.hero?.shieldBlockPoseActive && sprite && sprite.src) ? sprite : hero;
    if (!target) return;
    target.classList.remove('block-hit', 'hit');
    void target.offsetWidth;
    target.classList.add(target === sprite ? 'block-hit' : 'hit');
    setTimeout(() => target.classList.remove('block-hit', 'hit'), 360);
  }


  function holdKnightShieldPoseUntilNextTurn() {
    if (!battle || battle.ended || battle.hero?.id !== 'knight') return false;
    const hero = $('battleHero');
    const sprite = $('knightActionSprite');
    const fx = $('knightImpactFx');
    if (!sprite) return false;
    if (fx) fx.className = 'knight-impact-fx';
    if (hero) hero.style.visibility = 'hidden';
    sprite.src = `${KNIGHT_MOVE_ASSET_ROOT}shield_block.png`;
    sprite.className = 'knight-action-sprite show';
    battle.hero.shieldBlockPoseActive = true;
    battle.hero.shieldBlockPoseUntilNextTurn = true;
    return true;
  }

  function playKnightSkillAnimation(key, onImpact) {
    if (!battle || !isKnightCinematicSkill(key) || battle.hero?.id !== 'knight') return false;
    const { id } = parseKey(key);
    const timers = [];
    let impactFired = false;
    const later = (fn, ms) => timers.push(setTimeout(() => {
      if (!battle || battle.ended) return;
      fn();
    }, ms));
    const hit = () => {
      if (impactFired) return;
      impactFired = true;
      onImpact?.();
    };
    const end = (totalMs, opts = {}) => later(() => {
      const hero = $('battleHero');
      const sprite = $('knightActionSprite');
      const fx = $('knightImpactFx');
      if (fx) fx.className = 'knight-impact-fx';
      setBattleActionTextHidden(false);
      const shouldHoldShield = !!(battle?.hero && (
        opts.persistShieldBlock ||
        (battle.hero.id === 'knight' && battle.hero.shieldTurns > 0 && battle.phase === 'end')
      ));
      if (shouldHoldShield) {
        holdKnightShieldPoseUntilNextTurn();
        return;
      }
      if (battle?.hero) {
        battle.hero.shieldBlockPoseActive = false;
        battle.hero.shieldBlockPoseUntilNextTurn = false;
      }
      if (sprite) sprite.className = 'knight-action-sprite';
      if (hero) hero.style.visibility = '';
    }, totalMs);

    showKnightActionFrame('setup.png');

    let total = 1600;
    switch (id) {
      case 'sword_strike':
        total = 1580;
        later(() => showKnightActionFrame('combo2.png'), 1000);
        later(hit, 1210);
        break;

      case 'sword_combo':
        total = 2520;
        later(() => showKnightActionFrame('combo1.png'), 1000);
        later(() => showKnightActionFrame('combo2.png'), 1350);
        later(() => showKnightActionFrame('combo3.png'), 1700);
        later(() => flashKnightImpact('combo_effect.png', 'flash-triple'), 1790);
        later(hit, 1840);
        break;

      case 'rising_slash':
        total = 1810;
        later(() => showKnightActionFrame('rising_slash.png'), 1000);
        later(() => flashKnightImpact('rising_slash_effect.png', 'flash-once'), 1170);
        later(hit, 1240);
        break;

      case 'executioners_swing':
        total = 1880;
        later(() => showKnightActionFrame('executioners_swing.png'), 1000);
        later(() => {
          flashKnightImpact('special_effect.png', 'flash-special');
          thunderKnightSpecial();
        }, 1120);
        later(hit, 1200);
        break;

      case 'shield_bash':
        total = 1660;
        later(() => showKnightActionFrame('shield_bash.png'), 1000);
        later(hit, 1260);
        break;

      case 'shield_block':
        total = 1760;
        later(() => showKnightActionFrame('shield_block.png'), 1000);
        later(hit, 1260);
        break;

      case 'sword_and_shield':
        total = 2180;
        later(() => showKnightActionFrame('combo3.png'), 1000);
        later(hit, 1260);
        later(() => showKnightActionFrame('shield_block.png'), 1420);
        break;

      default:
        return false;
    }

    battle.knightAnimationEndsAt = Date.now() + total;
    end(total, { persistShieldBlock: id === 'shield_block' || id === 'sword_and_shield' });
    return true;
  }

  function heroActionMarkup(key) {
    const { id, def } = parseKey(key);
    const hero = def.hero === 'universal' ? activeHero() : def.hero;
    const finisher = def.category === 'finisher';
    if (def.type === 'boost') return { type:'boost', html:'' };
    if (hero === 'mage') {
      if (id === 'fireball') return { type:'fire', html:'<span class="vfx-fireball"></span><span class="vfx-impact"></span>' };
      if (id === 'ice_shards') return { type:'ice', html:'<span class="vfx-ice-shards"><i></i><i></i><i></i><i></i><i></i></span><span class="vfx-impact"></span>' };
      if (id === 'chain_lightning') return { type:'lightning', html:'<span class="vfx-lightning"></span><span class="vfx-impact"></span>' };
      if (id === 'elemental_storm') return { type:'finisher', html:'<span class="vfx-lightning"></span><span class="vfx-fireball"></span><span class="vfx-ice-shards"><i></i><i></i><i></i><i></i><i></i></span><span class="vfx-boom"></span>' };
      return { type: finisher ? 'finisher' : 'arcane', html:`<span class="vfx-arcane"></span>${finisher?'<span class="vfx-boom"></span>':'<span class="vfx-impact"></span>'}` };
    }
    if (hero === 'healer') return { type: finisher ? 'finisher' : 'holy', html:`<span class="vfx-holy"></span>${finisher?'<span class="vfx-boom"></span>':''}` };
    return { type: finisher ? 'finisher' : 'slash', html:`<span class="vfx-slash-line"></span>${finisher?'<span class="vfx-slash-line second"></span><span class="vfx-slash-line third"></span><span class="vfx-boom"></span>':'<span class="vfx-impact"></span>'}` };
  }

  function playHeroActionVfx(key) {
    const layer = $('battleEffectLayer');
    if (!layer) return;
    const { def } = parseKey(key);
    const visual = heroActionMarkup(key);
    if (def.type === 'boost') { playSfx('boost', .72); return; }
    layer.innerHTML += `<span class="hero-action-vfx">${visual.html}</span>`;
    const screen = $('battleScreen');
    const finisher = def.category === 'finisher';
    if (screen) {
      const shakeClass = finisher ? 'finisher-mega-shake' : 'hero-impact-shake';
      screen.classList.remove(shakeClass); void screen.offsetWidth; screen.classList.add(shakeClass);
      setTimeout(() => screen.classList.remove(shakeClass), finisher ? 820 : 390);
    }
    playSfx(visual.type === 'arcane' ? 'holy' : visual.type, finisher ? 1.35 : 1);
    if (finisher) setTimeout(() => playSfx('boom', 1.4), 220);
    setTimeout(() => {
      if (!layer) return;
      layer.querySelectorAll?.('.hero-action-vfx').forEach?.(node => node.remove?.());
    }, 1050);
  }

  function playAvengerSting() {
    playSfx('finisher', 1.15);
    setTimeout(() => playSfx('lightning', .72), 140);
  }

  function showEncounterSplash(encounter) {
    const splash = $('encounterSplash');
    if (!splash || !encounter?.isAvenger) return;
    $('encounterSplashName').textContent = encounter.name.toUpperCase();
    $('encounterSplashLevel').textContent = `LV. ${encounter.level}`;
    splash.classList.remove('show'); void splash.offsetWidth; splash.classList.add('show');
    playAvengerSting();
    setTimeout(() => splash.classList.remove('show'), 1680);
  }

  function checkGoblinKingPhaseTwo() {
    if (!battle || battle.enemy.id !== 'goblin_king' || battle.enemy.phase2 || battle.enemy.hp <= 0) return false;
    if (battle.enemy.hp > Math.ceil(battle.enemy.maxHp * .5)) return false;
    battle.enemy.phase2 = true;
    battle.enemy.baseAttackBonus = 1.15;
    battle.enemy.goblinClubUses = 0;
    addBattleLog('ROYAL FURY! The Goblin King grows larger and unlocks Inventory and Goblin\'s Club.', 'bad');
    setBattleMessage('ROYAL FURY • GOBLIN KING PHASE 2');
    flashBattlePhase('ROYAL FURY');
    const unit = $('battleEnemy');
    if (unit) {
      unit.classList.add('royal-fury','royal-fury-shift');
      setTimeout(() => unit.classList.remove('royal-fury-shift'), 1300);
    }
    if (battle.study?.queue?.length) {
      battle.study.queue = buildStudyPlan(Math.max(1, battle.study.queue.length));
      addBattleLog('Royal Fury changed the King\'s battle plan. Study forecast updated.', 'system');
    }
    return true;
  }

  function applyHeroStatus(move) {
    if (!move.status || !move.statusChance) return false;
    if (move.status === 'stun' && hasPhaseLossGuard()) {
      battle.enemy.statusFocus = null;
      addBattleLog('Recovery protection prevented STUN from chaining into another lost turn.', 'good');
      return false;
    }
    const focus = battle.enemy.statusFocus?.status === move.status ? battle.enemy.statusFocus.bonus : 0;
    battle.enemy.statusFocus = null;
    if (Math.random() >= Math.min(.95, move.statusChance + focus)) return false;
    if (battle.hero.statusWardTurns > 0) {
      addBattleLog(`Remedy prevented ${move.status.toUpperCase()} from landing.`, 'good');
      return false;
    }
    const existing = battle.hero.statuses.find(status => status.id === move.status);
    const status = {
      id: move.status,
      turns: move.statusTurns || 1,
      damage: ['poison','burn','bleed'].includes(move.status) ? scaledStatusDamage(move.statusDamage || 3) : 0
    };
    if (existing) {
      existing.turns = Math.max(existing.turns, status.turns);
      existing.damage = Math.max(existing.damage || 0, status.damage || 0);
    } else battle.hero.statuses.push(status);
    const label = move.status.toUpperCase();
    addBattleLog(`${battle.enemy.name} applied ${label}${status.damage ? ` (${status.damage} damage)` : ''}.`, 'bad');
    showStatusBurst('battleHero', move.status);
    return true;
  }

  function applyDamageToEnemy(rawDamage, sourceName) {
    let damage = Math.max(0, Math.round(rawDamage || 0));
    if (damage <= 0) return 0;
    if (battle.enemy.guardPct > 0) {
      const before = damage;
      damage = Math.max(1, Math.ceil(damage * (1 - battle.enemy.guardPct)));
      addBattleLog(`${battle.enemy.name}'s guard reduced ${sourceName} from ${before} to ${damage}.`, 'system');
      battle.enemy.guardPct = 0;
    }
    battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
    showDamageEffect('battleEnemy', damage);
    checkGoblinKingPhaseTwo();
    return damage;
  }

  function resolveIncomingHeroDamage(rawDamage, moveName) {
    let damage = Math.max(0, Math.round(rawDamage || 0));
    if (battle.hero.blockNext) {
      battle.hero.blockNext = false;
      damage = 0;
      if (battle.hero.id === 'knight' && battle.hero.shieldBlockPoseActive) shakeKnightBlockPose();
      addBattleLog(`Shield Block stopped ${moveName}.`, 'good');
    } else if (battle.hero.shieldTurns > 0) {
      damage = Math.ceil(damage * .5);
      battle.hero.shieldTurns -= 1;
      addBattleLog(`Shield Up reduced ${moveName} to ${damage} damage.`, 'good');
    } else if (battle.hero.block > 0) {
      const absorbed = Math.min(battle.hero.block, damage);
      battle.hero.block -= absorbed;
      damage -= absorbed;
      addBattleLog(`Block absorbed ${absorbed} damage from ${moveName}.`, 'good');
    }
    if (damage > 0) { battle.hero.hp = Math.max(0, battle.hero.hp - damage); showDamageEffect('battleHero', damage); if(battle.hero.id==='warrior'){ battle.hero.warriorBonus=(battle.hero.warriorBonus||0)+3; addBattleLog('Warrior passive gained +3 damage after taking a hit.','good'); } }
    return damage;
  }

  function runEnemyBoost(move) {
    if (!move) return;
    setBattleActionTextHidden(true);
    battle.enemy.boostCooldown = 1;
    setBattleMessage('');
    flashBattlePhase('ENEMY BOOST');
    animateUnit('battleEnemy', move.className || 'enemy-power');
    if (move.effect === 'empower') battle.enemy.attackMultiplier = Math.max(battle.enemy.attackMultiplier, move.value || 1.25);
    if (move.effect === 'guard') battle.enemy.guardPct = Math.max(battle.enemy.guardPct, move.value || .25);
    if (move.effect === 'statusFocus') battle.enemy.statusFocus = { status: move.status, bonus: move.value || .20 };
    if (move.effect === 'rage') {
      const selfDamage = Math.max(1, Math.round(battle.enemy.maxHp * (move.selfDamagePct || .06)));
      battle.enemy.hp = Math.max(1, battle.enemy.hp - selfDamage);
      battle.enemy.attackMultiplier = Math.max(battle.enemy.attackMultiplier, move.value || 1.45);
      battle.enemy.mp = Math.min(battle.enemy.maxMp, battle.enemy.mp + (move.mana || 0));
      addBattleLog(`${battle.enemy.name} sacrificed ${selfDamage} HP to power up.`, 'bad');
    }
    if (['healEmpower','healMana'].includes(move.effect)) {
      const heal = Math.max(1, Math.round(battle.enemy.maxHp * (move.healPct || .08)));
      const old = battle.enemy.hp;
      battle.enemy.hp = Math.min(battle.enemy.maxHp, battle.enemy.hp + heal);
      addBattleLog(`${move.name} restored ${battle.enemy.hp - old} HP.`, 'bad');
      if (move.effect === 'healEmpower') battle.enemy.attackMultiplier = Math.max(battle.enemy.attackMultiplier, move.value || 1.25);
      if (move.effect === 'healMana') battle.enemy.mp = Math.min(battle.enemy.maxMp, battle.enemy.mp + (move.mana || 0));
    }
    if (move.effect === 'guardMana') {
      battle.enemy.guardPct = Math.max(battle.enemy.guardPct, move.value || .35);
      battle.enemy.mp = Math.min(battle.enemy.maxMp, battle.enemy.mp + (move.mana || 0));
    }
    if (move.effect === 'inventory') {
      const chosen = chooseGoblinInventorySkill(enemyMoveset().skills, battle.enemy.mp);
      battle.enemy.inventoryPickId = chosen?.id || '';
      addBattleLog(`Inventory searched the King\'s deck for ${chosen?.name || 'the best card'}.`, 'bad');
    }
    addBattleLog(`${battle.enemy.name} used Boost: ${move.name}.`, 'bad');
    renderBattle();
  }

  function runEnemySkill(move) {
    if (!battle || battle.ended || !move) return;
    setBattleActionTextHidden(true);
    const moveCost = enemyMoveCost(move);
    if (moveCost) battle.enemy.mp = Math.max(0, battle.enemy.mp - moveCost);
    setBattleMessage('');
    flashBattlePhase(move.special ? 'ENEMY SPECIAL' : 'ENEMY SKILL');
    animateUnit('battleEnemy', move.special ? 'enemy-special' : 'attack');

    const hits = Math.max(1, move.hits || 1);
    let totalRaw = 0;
    for (let i = 0; i < hits; i += 1) {
      const base = battle.enemy.damageMin + Math.floor(Math.random() * (battle.enemy.damageMax - battle.enemy.damageMin + 1));
      totalRaw += Math.max(1, Math.round(base * (move.mult || 1)));
    }
    if (move.growingClub) {
      const uses = battle.enemy.goblinClubUses || 0;
      totalRaw = Math.round(totalRaw * (1 + (uses * .20)));
      battle.enemy.goblinClubUses = uses + 1;
      addBattleLog(`Goblin's Club power is now +${battle.enemy.goblinClubUses * 20}% for its next use.`, 'bad');
    }
    totalRaw = Math.max(1, Math.round(totalRaw * (battle.enemy.attackMultiplier || 1) * (battle.enemy.baseAttackBonus || 1)));
    battle.enemy.attackMultiplier = 1;
    const damage = resolveIncomingHeroDamage(totalRaw, move.name);
    if (damage > 0) {
      animateUnit('battleHero', 'hit');
      addBattleLog(`${move.name} dealt ${damage} damage${hits > 1 ? ` across ${hits} hits` : ''}.`, 'bad');
      applyHeroStatus(move);
      if (battle.hero.reflectPct > 0) {
        const reflected = Math.max(1, Math.round(damage * battle.hero.reflectPct));
        battle.hero.reflectPct = 0;
        const reflectedDamage = applyDamageToEnemy(reflected, 'Sword & Shield reflection');
        animateUnit('battleEnemy', 'hit');
        addBattleLog(`Sword & Shield reflected ${reflectedDamage} damage.`, 'good');
      }
    } else addBattleLog(`${move.name} dealt no damage.`, 'good');

    if (battle.enemy.hp <= 0) {
      renderBattle();
      return finishBattle(true);
    }

    if (move.selfHealPct) {
      const heal = Math.max(1, Math.round(battle.enemy.maxHp * move.selfHealPct));
      const old = battle.enemy.hp;
      battle.enemy.hp = Math.min(battle.enemy.maxHp, battle.enemy.hp + heal);
      addBattleLog(`${move.name} restored ${battle.enemy.hp - old} HP to ${battle.enemy.name}.`, 'bad');
    }
    if (move.manaGain) battle.enemy.mp = Math.min(battle.enemy.maxMp, battle.enemy.mp + move.manaGain);
    if (move.manaDrain && damage > 0) {
      const drained = Math.min(battle.hero.mp, move.manaDrain);
      battle.hero.mp -= drained;
      battle.enemy.mp = Math.min(battle.enemy.maxMp, battle.enemy.mp + drained);
      addBattleLog(`${move.name} drained ${drained} Mana.`, 'bad');
    }
    renderBattle();
    if (battle.hero.hp <= 0) return finishBattle(false);
    battle.timer = setTimeout(nextTurn, 760);
  }

  function tickHeroStatuses() {
    let totalDamage = 0;
    battle.hero.statuses.forEach(status => {
      if (!['poison','burn','bleed'].includes(status.id) || status.turns <= 0) return;
      const damage = status.damage || 3;
      battle.hero.hp = Math.max(0, battle.hero.hp - damage);
      showStatusBurst('battleHero', status.id);
      showDamageEffect('battleHero', damage, status.id);
      status.turns -= 1;
      totalDamage += damage;
      addBattleLog(`${status.id.toUpperCase()} dealt ${damage} damage.`, 'bad');
    });
    battle.hero.statuses = battle.hero.statuses.filter(status => status.turns > 0 || ['stagger','skill_lock'].includes(status.id));
    return totalDamage;
  }

  function hasPhaseLossGuard() {
    return !!battle?.hero?.phaseLossGuard;
  }

  function grantPhaseLossGuard(reason = '') {
    if (!battle?.hero) return;
    battle.hero.phaseLossGuard = true;
    if (reason) addBattleLog(`${heroDisplayName(battle.hero.id)} gains recovery protection after ${reason}.`, 'system');
  }

  function consumeHeroStun() {
    const status = battle.hero.statuses.find(item => item.id === 'stun');
    if (!status) return false;
    if (hasPhaseLossGuard()) {
      battle.hero.statuses = battle.hero.statuses.filter(item => item !== status);
      addBattleLog('Recovery protection prevented another lost turn from STUN.', 'good');
      return false;
    }
    status.turns -= 1;
    if (status.turns <= 0) battle.hero.statuses = battle.hero.statuses.filter(item => item !== status);
    grantPhaseLossGuard('STUN');
    return true;
  }

  function consumeBoostLock() {
    const status = battle.hero.statuses.find(item => item.id === 'stagger');
    if (!status) return false;
    status.turns -= 1;
    if (status.turns <= 0) battle.hero.statuses = battle.hero.statuses.filter(item => item !== status);
    return true;
  }

  function addHeroSkillLock(chance) {
    if (!chance || Math.random() >= chance) return false;
    if (hasPhaseLossGuard()) {
      addBattleLog('Recovery protection prevented another Skill Phase loss.', 'good');
      return false;
    }
    const existing = battle.hero.statuses.find(item => item.id === 'skill_lock');
    if (existing) existing.turns = Math.max(existing.turns || 0, 1);
    else battle.hero.statuses.push({ id: 'skill_lock', turns: 1, damage: 0 });
    addBattleLog(`Finisher recoil will remove ${heroDisplayName(battle.hero.id)}'s next Skill Phase.`, 'bad');
    return true;
  }

  function consumeSkillLock() {
    const status = battle.hero.statuses.find(item => item.id === 'skill_lock');
    if (!status) return false;
    if (hasPhaseLossGuard()) {
      battle.hero.statuses = battle.hero.statuses.filter(item => item !== status);
      addBattleLog('Recovery protection prevented another lost Skill Phase.', 'good');
      return false;
    }
    status.turns -= 1;
    if (status.turns <= 0) battle.hero.statuses = battle.hero.statuses.filter(item => item !== status);
    grantPhaseLossGuard('a lost Skill Phase');
    return true;
  }

  function enterPlayerAttackPhase(message = 'Choose a Skill Card or Skip Phase.') {
    setBattleActionTextHidden(false);
    if (consumeSkillLock()) {
      battle.phase = 'end';
      battle.locked = true;
      addBattleLog(`Finisher recoil skipped ${heroDisplayName(battle.hero.id)}'s Skill Phase.`, 'bad');
      setBattleMessage('Finisher recoil: Skill Phase lost. Enemy turn.');
      flashBattlePhase('SKILL PHASE LOST');
      renderBattle();
      battle.timer = setTimeout(enemyTurn, 620);
      return false;
    }
    battle.phase = 'attack';
    battle.locked = false;
    setBattleMessage(message);
    flashBattlePhase('SKILL PHASE');
    renderBattle();
    if (battle.hero.phaseLossGuard) {
      battle.hero.phaseLossGuard = false;
      addBattleLog('Recovery protection expired after reaching a playable Skill Phase.', 'system');
    }
    return true;
  }

  function kindScale(kind) {
    if (kind === 'boss') return { hp: 1.35, damage: 1.18 };
    if (kind === 'hero') return { hp: 1.20, damage: 1.12 };
    if (kind === 'special') return { hp: 1.08, damage: 1.05 };
    return { hp: 1, damage: 1 };
  }

  function scaleEncounterForLevel(encounter, level = heroLevel()) {
    const safeLevel = Math.max(1, Number(level) || 1);
    const levelsGained = safeLevel - 1;
    // V14: explicit additive growth prevents low-base enemies from becoming one-shot targets.
    const hpPerLevel = Number(encounter.hpPerLevel ?? Math.max(8, encounter.hp * .22));
    const mpPerLevel = Number(encounter.mpPerLevel ?? 1.5);
    const damagePerLevel = Number(encounter.damagePerLevel ?? .75);
    return {
      ...encounter,
      level: safeLevel,
      hp: Math.max(1, Math.round(encounter.hp + (hpPerLevel * levelsGained))),
      mp: Math.max(1, Math.round(encounter.mp + (mpPerLevel * levelsGained))),
      damageMin: Math.max(1, Math.round(encounter.damageMin + (damagePerLevel * levelsGained))),
      damageMax: Math.max(1, Math.round(encounter.damageMax + (damagePerLevel * levelsGained))),
      poisonDamage: Math.max(3, Math.round(3 + (levelsGained * .16)))
    };
  }

  function knightStatsForLevel(level = heroLevel('knight')) {
    const safeLevel = Math.max(1, Number(level) || 1);
    return {
      level: safeLevel,
      hp: 120 + ((safeLevel - 1) * 12),
      mp: 50 + Math.floor((safeLevel - 1) * 1.0)
    };
  }

  function randomIntInclusive(min, max) {
    return min + Math.floor(Math.random() * ((max - min) + 1));
  }

  function rewardLevelMultiplier(level) {
    return 1 + ((Math.max(1, Number(level) || 1) - 1) * 0.015);
  }

  function rollBattleRewards(enemy) {
    const encounter = ENCOUNTERS[enemy.id] || enemy;
    const level = enemy.level || heroLevel();
    const bronzeRange = encounter.bronze || [25, 40];
    let bronzeMin = bronzeRange[0];
    let bronzeMax = bronzeRange[1];
    // Coin Carrier's 200-600 Bronze jackpot is intentionally exact at every level.
    if (enemy.kind !== 'special') {
      const mult = rewardLevelMultiplier(level);
      bronzeMin = Math.round(bronzeMin * mult);
      bronzeMax = Math.round(bronzeMax * mult);
    }
    let silverRange = [...(encounter.silver || [0, 0])];
    if (enemy.isAvenger) {
      bronzeMin = Math.round(bronzeMin * 1.75);
      bronzeMax = Math.round(bronzeMax * 1.75);
      silverRange = silverRange[1] > 0 ? [silverRange[0] + 1, silverRange[1] + 1] : [1, 1];
    }
    return {
      bronze: randomIntInclusive(bronzeMin, bronzeMax),
      silver: randomIntInclusive(silverRange[0], silverRange[1]),
      bronzeRange: [bronzeMin, bronzeMax],
      silverRange: [...silverRange]
    };
  }

  function randomEncounterFrom(ids) {
    let pool = ids;
    if (ids.length > 1 && save.stats.lastEncounterId) {
      const withoutLast = ids.filter(id => id !== save.stats.lastEncounterId);
      if (withoutLast.length) pool = withoutLast;
    }
    return ENCOUNTERS[pool[Math.floor(Math.random() * pool.length)]];
  }

  function canBeAvenger(encounter) {
    return encounter && !['goblin_king', 'goblin_coin_carrier'].includes(encounter.id);
  }

  function prepareEncounter(encounterBase, options = {}) {
    const playerLevel = heroLevel();
    const caveFinal = !!options.caveFinal;
    const forceNoAvenger = !!options.noAvenger;
    let isAvenger = false;
    let enemyLevel;
    if (caveFinal && encounterBase.id === 'goblin_king') enemyLevel = playerLevel + 5;
    else if (!forceNoAvenger && canBeAvenger(encounterBase) && Math.random() < AVENGER_CHANCE) {
      enemyLevel = playerLevel + 10;
      isAvenger = true;
    } else enemyLevel = playerLevel + randomIntInclusive(1, 3);
    const scaled = scaleEncounterForLevel(encounterBase, enemyLevel);
    return { ...scaled, isAvenger, name: isAvenger ? `Avenger ${encounterBase.name}` : encounterBase.name };
  }

  function selectCaveEncounter() {
    const fightIndex = Math.max(0, save.cave?.fightIndex || 0);
    if (fightIndex >= 3) return ENCOUNTERS.goblin_king;
    return randomEncounterFrom(NORMAL_ENCOUNTER_IDS);
  }

  function selectEncounterForBattle() {
    if ((save.stats.normalWinsSinceBoss || 0) >= 5) return randomEncounterFrom(BOSS_HERO_ENCOUNTER_IDS);
    if (Math.random() < COIN_CARRIER_CHANCE) return ENCOUNTERS.goblin_coin_carrier;
    return randomEncounterFrom(NORMAL_ENCOUNTER_IDS);
  }

  /* Battle */
  function shuffled(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function expandedActiveDeck() {
    const result = [];
    Object.entries(activeDeckMap()).forEach(([key, count]) => {
      for (let i = 0; i < Math.max(0, count || 0); i += 1) result.push(key);
    });
    return result;
  }

  function clearBattleTimer() {
    if (battle?.timer) clearTimeout(battle.timer);
    if (battle) battle.timer = null;
  }

  function startBattle() {
    clearBattleTimer();
    clearKnightCinematic();
    const activeCards = expandedActiveDeck();
    if (activeCards.length < 5) {
      showScreen('equipment');
      return toast('Equip at least 5 cards before battle.');
    }
    setOverlay('battleResult', false);
    setOverlay('steadyOverlay', false);
    const heroId=activeHero();
    const level=heroLevel(heroId);
    const caveActive = !!save.cave?.active;
    const encounterBase = caveActive ? selectCaveEncounter() : selectEncounterForBattle();
    const encounter = prepareEncounter(encounterBase, { caveFinal: caveActive && (save.cave.fightIndex || 0) >= 3 });
    const heroVitals = ensureHeroVitals(heroId);
    if (heroVitals.hp <= 0) {
      showScreen('heal');
      toast(`${heroDisplayName(heroId)} is down. Recover the deck before fighting again.`);
      return;
    }
    battle = {
      turn: 1,
      phase: 'draw',
      locked: false,
      ended: false,
      hero: { id:heroId, level, hp: heroVitals.hp, maxHp: heroVitals.maxHp, mp: heroVitals.mp, maxMp: heroVitals.maxMp, block: 0, blockNext: false, shieldTurns: 0, statusWardTurns: 0, statuses: [], chainCount:0, powerStacks:0, tauntPlayedThisTurn:false, skipBoostTurns:0, doubleNextHoly:false, divineFavorThisTurn:false, secondBreathTurns:0, regenHp:0, regenMp:0, warriorBonus:0, phaseLossGuard:false },
      enemy: {
        id: encounter.id, name: encounter.name, kind: encounter.kind, image: encounter.image, level: encounter.level, isAvenger: !!encounter.isAvenger,
        hp: encounter.hp, maxHp: encounter.hp, mp: encounter.mp, maxMp: encounter.mp,
        damageMin: encounter.damageMin, damageMax: encounter.damageMax, poisonChance: encounter.poisonChance || 0, poisonDamage: encounter.poisonDamage || 3,
        stunned: false, status: null, bleedTurns: 0, bleedDamage: 0, attackMultiplier: 1, baseAttackBonus: 1, guardPct: 0,
        boostCooldown: 0, boostLockedTurns:0, statusFocus: null, lastMoveId: '', phase2: false, goblinClubUses: 0, inventoryPickId: ''
      },
      study: { used: false, queue: [] },
      caveActive,
      caveFightIndex: caveActive ? (save.cave.fightIndex || 0) : -1,
      break: 0,
      doubleNext: false,
      steady: null,
      deck: shuffled(activeCards),
      hand: [],
      discard: [],
      log: []
    };
    drawCards(5);
    balanceOpeningHand();
    battle.phase = 'tactics';
    save.stats.lastEncounterId = encounter.id;
    persist();
    if (encounter.isAvenger) addBattleLog(`${encounter.name.toUpperCase()} has appeared at Level ${encounter.level}!`, 'bad');
    if (caveActive) addBattleLog(`CAVE FIGHT ${(save.cave.fightIndex || 0) + 1} / 4. There is no escape.`, 'bad');
    if (encounter.kind === 'boss') addBattleLog(`${encounter.name} enters the field. BOSS ENCOUNTER.`, 'bad');
    else if (encounter.kind === 'hero') addBattleLog(`${encounter.name} challenges you. HERO ENCOUNTER.`, 'bad');
    else if (encounter.kind === 'special') addBattleLog(`${encounter.name} crossed your path. SPECIAL ENCOUNTER.`, 'good');
    else addBattleLog(`${encounter.name} blocks the road.`, 'system');
    addBattleLog(`Turn 1 begins for ${heroDisplayName(heroId)}. Choose a Boost Card.`, 'good');
    renderBattle();
    if (encounter.isAvenger) showEncounterSplash(encounter);
    flashBattlePhase('BOOST PHASE');
  }

  function drawCards(count) {
    for (let i = 0; i < count && battle.hand.length < 5; i += 1) {
      if (!battle.deck.length && battle.discard.length) {
        battle.deck = shuffled(battle.discard);
        battle.discard = [];
        addBattleLog('The discard pile was shuffled into the draw pile.', 'system');
      }
      if (!battle.deck.length) break;
      battle.hand.push(battle.deck.shift());
    }
  }

  function balanceOpeningHand() {
    ['boost', 'skill'].forEach(type => {
      if (battle.hand.some(key => parseKey(key).def.type === type)) return;
      const deckIndex = battle.deck.findIndex(key => parseKey(key).def.type === type);
      if (deckIndex < 0 || !battle.hand.length) return;
      const replacement = battle.deck.splice(deckIndex, 1)[0];
      battle.deck.push(battle.hand[0]);
      battle.hand[0] = replacement;
    });
    battle.deck = shuffled(battle.deck);
  }

  function addBattleLog(message, style = '') {
    if (!battle) return;
    battle.log.push({ message, style });
    if (battle.log.length > 40) battle.log.shift();
  }

  function battleCardPlayable(key) {
    if (!battle || battle.ended || battle.locked) return false;
    const { def } = parseKey(key);
    const stats = cardStats(key);
    const phaseMatches = (def.type === 'boost' && battle.phase === 'tactics') || (def.type === 'skill' && battle.phase === 'attack');
    const hasSteadyChoices = !stats.steady || battle.hand.length >= 3;
    return phaseMatches && hasSteadyChoices && battle.hero.mp >= stats.cost;
  }

  function setBattleMessage(message) {
    // Battle action text is intentionally disabled. Combat reads through animation, cards, meters and phase UI.
    return;
  }

  function flashBattlePhase(message) {
    const splash = $('battlePhaseSplash');
    if (!splash) return;
    splash.textContent = message;
    splash.classList.remove('show');
    void splash.offsetWidth;
    splash.classList.add('show');
    setTimeout(() => splash.classList.remove('show'), 1150);
  }

  function animateUnit(id, className) {
    const unit = $(id);
    unit.classList.remove(className);
    void unit.offsetWidth;
    unit.classList.add(className);
    const duration = ['finisher-attack','enemy-power','enemy-guard','enemy-heal','enemy-inventory'].includes(className) ? 780 : 560;
    setTimeout(() => unit.classList.remove(className), duration);
  }

  function playBattleCard(index) {
    if (!battle || !battle.hand[index]) return closeCardModal();
    const key = battle.hand[index];
    if (!battleCardPlayable(key)) return toast('That card cannot be played in this phase.');
    const { id, def } = parseKey(key);
    const stats = cardStats(key);
    closeCardModal();
    battle.hand.splice(index, 1);
    battle.discard.push(key);
    battle.hero.mp -= stats.cost;
    playBattleCardFx(key);

    const resolveCard = (afterKnightCinematic = false) => {
      if (!battle || battle.ended) return;
      const fastTests = typeof window !== 'undefined' && window.__RPCG_ENABLE_TESTS__ && window.__RPCG_FAST_TESTS__ !== false;
      const knightCinematic = !fastTests && isKnightCinematicSkill(key) && battle.hero?.id === 'knight';
      if (knightCinematic && !afterKnightCinematic) {
        battle.locked = true;
        renderBattle();
        playKnightSkillAnimation(key, () => resolveCard(true));
        return;
      }
      if (!knightCinematic) playHeroActionVfx(key);

    if (def.type === 'boost') {
      if (stats.steady) {
        battle.phase = 'attack';
        battle.locked = true;
        battle.steady = { key, index, selected: [], mana: stats.mana || 0, divineFavor:!!stats.divineFavor };
        addBattleLog('Steady Stance is waiting for 2 card choices.', 'system');
        openSteadyChoice();
        renderBattle();
        return;
      }
      save.stats.boostsPlayed += 1;
      animateUnit('battleHero', 'hero-boost');
      if (stats.cleanse) battle.hero.statuses = [];
      if (stats.statusWardTurns) {
        battle.hero.statusWardTurns = Math.max(battle.hero.statusWardTurns || 0, stats.statusWardTurns);
        addBattleLog(`${def.name} will prevent status effects until your next turn.`, 'good');
      }
      if (stats.heal) {
        battle.hero.hp = Math.min(battle.hero.maxHp, battle.hero.hp + stats.heal);
        addBattleLog(`${def.name} restored ${stats.heal} Health.`, 'good');
      }
      if (stats.mana) battle.hero.mp = Math.min(battle.hero.maxMp, battle.hero.mp + stats.mana);
      if (stats.blockNext) {
        battle.hero.blockNext = true;
        addBattleLog(`${def.name} will block the next enemy attack.`, 'good');
      }
      if (stats.shieldTurns) {
        battle.hero.shieldTurns = Math.max(battle.hero.shieldTurns, stats.shieldTurns);
        addBattleLog(`${def.name} will halve damage from the next enemy turn.`, 'good');
      }
      if (stats.draw) drawCards(stats.draw);
      if (stats.selfDamage) { battle.hero.hp=Math.max(1,battle.hero.hp-stats.selfDamage); showDamageEffect('battleHero',stats.selfDamage); }
      if (stats.doubleNextSkill) { battle.doubleNext=true; addBattleLog(`${def.name} will double the next Skill.`, 'good'); }
      if (stats.doubleNextHoly) { battle.hero.doubleNextHoly=true; addBattleLog('The next healing or holy Skill will be doubled.', 'good'); }
      if (stats.enemyBoostLockTurns) { battle.enemy.boostLockedTurns=Math.max(battle.enemy.boostLockedTurns||0,stats.enemyBoostLockTurns); }
      if (stats.taunt) battle.hero.tauntPlayedThisTurn=true;
      if (stats.divineFavor) battle.hero.divineFavorThisTurn=true;
      if (stats.secondBreath) { battle.hero.secondBreathTurns=stats.regenTurns||5; battle.hero.regenHp=stats.regenHp||0; battle.hero.regenMp=stats.regenMp||0; }
      // Healer passive: every Boost restores 5 HP.
      if (battle.hero.id==='healer') battle.hero.hp=Math.min(battle.hero.maxHp,battle.hero.hp+5);
      addBattleLog(`${def.name} prepared ${heroDisplayName(battle.hero.id)} for the attack phase.`, 'good');
      persist();
      enterPlayerAttackPhase(`${def.name} active. Choose a Skill Card or Skip Phase.`);
      return;
    }

    let damage = stats.damage || 0;
    // Hero-specific Bronze card mechanics.
    if (stats.chainLightning) { const seq=[8,16,32,64]; damage=seq[Math.min(battle.hero.chainCount||0,3)]; battle.hero.chainCount=Math.min(3,(battle.hero.chainCount||0)+1); }
    if (stats.hitChance != null && Math.random() > stats.hitChance) { damage=0; addBattleLog(`${def.name} missed!`, 'bad'); }
    if (stats.doubleIfSecondBreath && (battle.hero.secondBreathTurns||0)>0) damage*=2;
    if (battle.hero.id==='mage' && stats.spell && damage>0) damage+=2;
    if (battle.hero.id==='warrior' && damage>0 && (battle.hero.warriorBonus||0)>0) damage+=battle.hero.warriorBonus;
    if (stats.hits && stats.hitDamage) damage=stats.hitDamage*stats.hits;
    if (stats.powerStrike) { battle.hero.powerStacks=Math.min(2,(battle.hero.powerStacks||0)+1); }
    if (battle.hero.powerStacks>0 && !stats.powerStrike && damage>0) { damage=Math.round(damage*(1+(.5*battle.hero.powerStacks))); addBattleLog(`Power Strike boosted the Skill by ${battle.hero.powerStacks*50}%.`,'good'); battle.hero.powerStacks=0; }
    if (battle.hero.doubleNextHoly && (stats.holy || stats.heal)) { if(damage>0) damage*=2; if(stats.heal) stats.heal*=2; battle.hero.doubleNextHoly=false; }
    if (battle.doubleNext && damage > 0) {
      damage *= 2;
      battle.doubleNext = false;
      addBattleLog('Sword Combo doubled the attack!', 'good');
    } else if (battle.doubleNext) {
      battle.doubleNext = false;
      addBattleLog('The pending Sword Combo faded on a defensive Skill.', 'system');
    }
    if (damage > 0) {
      damage = applyDamageToEnemy(damage, def.name);
      if (!(isKnightCinematicSkill(key) && battle.hero?.id === 'knight')) {
        animateUnit('battleHero', def.category === 'finisher' ? 'finisher-attack' : 'attack');
      }
      animateUnit('battleEnemy', 'hit');
      addBattleLog(`${def.name} dealt ${damage} damage.`, 'good');
    }
    if (stats.manaSteal) { const stolen=Math.min(battle.enemy.mp,Math.max(0,Math.round(stats.manaSteal))); battle.enemy.mp-=stolen; battle.hero.mp=Math.min(battle.hero.maxMp,battle.hero.mp+stolen); addBattleLog(`${def.name} stole ${stolen} Mana.`,'good'); }
    if (stats.enemyCleanse) { battle.enemy.guardPct=0; battle.enemy.attackMultiplier=1; battle.enemy.statusFocus=null; battle.enemy.status=null; battle.enemy.bleedTurns=0; battle.enemy.bleedDamage=0; }
    if (stats.enemyBoostLockTurns) battle.enemy.boostLockedTurns=Math.max(battle.enemy.boostLockedTurns||0,stats.enemyBoostLockTurns);
    if (stats.charge && !battle.hero.tauntPlayedThisTurn) battle.hero.skipBoostTurns=Math.max(1,battle.hero.skipBoostTurns||0);
    if (stats.burnIfDivine && battle.hero.divineFavorThisTurn && damage>0) { battle.enemy.bleedTurns=Math.max(battle.enemy.bleedTurns||0,stats.burnTurns||2); battle.enemy.bleedDamage=Math.max(battle.enemy.bleedDamage||0,stats.burnDamage||10); battle.enemy.status='BURN'; showStatusBurst('battleEnemy','burn'); }
    if (stats.stunChancePerHit && stats.hits) { let stunned=false; for(let i=0;i<stats.hits;i++) if(Math.random()<stats.stunChancePerHit) stunned=true; if(stunned){ battle.enemy.stunned=true; battle.enemy.status='STUN'; showStatusBurst('battleEnemy','stun'); save.stats.stuns+=1; } }
    if (stats.skipSkillChance) addHeroSkillLock(stats.skipSkillChance);
    if (stats.burnChance && damage > 0) {
      const roll = Math.random();
      if (roll < stats.burnChance) {
        battle.enemy.bleedTurns = Math.max(battle.enemy.bleedTurns || 0, stats.burnTurns || 2);
        battle.enemy.bleedDamage = Math.max(battle.enemy.bleedDamage || 0, stats.burnDamage || 25);
        battle.enemy.status = 'BURN';
        showStatusBurst('battleEnemy', 'burn');
        addBattleLog(`${battle.enemy.name} is Burning for ${stats.burnDamage || 25} damage over ${stats.burnTurns || 2} turns.`, 'good');
      } else if (stats.elementalStunChance && roll < stats.burnChance + stats.elementalStunChance) {
        battle.enemy.stunned = true;
        battle.enemy.status = 'STUN';
        showStatusBurst('battleEnemy', 'stun');
        addBattleLog(`${battle.enemy.name} was Stunned by Elemental Storm.`, 'good');
      }
    }
    if (stats.heal) {
      battle.hero.hp = Math.min(battle.hero.maxHp, battle.hero.hp + stats.heal);
      addBattleLog(`${def.name} restored ${stats.heal} Health.`, 'good');
    }
    if (stats.mana) {
      const beforeMana = battle.hero.mp;
      battle.hero.mp = Math.min(battle.hero.maxMp, battle.hero.mp + stats.mana);
      const restoredMana = battle.hero.mp - beforeMana;
      if (restoredMana > 0) addBattleLog(`${def.name} restored ${restoredMana} Mana.`, 'good');
    }
    if (stats.blockNext) {
      battle.hero.blockNext = true;
      addBattleLog('The next enemy attack will deal no damage.', 'good');
    }
    if (stats.shieldTurns) {
      battle.hero.shieldTurns = Math.max(battle.hero.shieldTurns, stats.shieldTurns);
      addBattleLog('Shield Up will halve damage from the next enemy turn.', 'good');
    }
    if (stats.reflectPct) {
      battle.hero.reflectPct = Math.max(battle.hero.reflectPct || 0, stats.reflectPct);
      addBattleLog(`Sword & Shield will reflect ${Math.round(stats.reflectPct * 100)}% of the damage received.`, 'good');
    }
    if (stats.bleedChance && Math.random() < stats.bleedChance) {
      battle.enemy.bleedTurns = stats.bleedTurns || 3;
      battle.enemy.bleedDamage = stats.bleedDamage || 5;
      battle.enemy.status = 'BLEED';
      showStatusBurst('battleEnemy', 'bleed');
      addBattleLog(`${battle.enemy.name} is Bleeding for ${battle.enemy.bleedTurns} turns.`, 'good');
    }
    if (stats.drawCombo && drawAnotherSwordCombo()) addBattleLog('Another Sword Combo was drawn.', 'good');
    if (stats.combo) battle.doubleNext = true;
    if (battle.hero.id==='knight') { battle.hero.block=(battle.hero.block||0)+5; addBattleLog('Knight passive gained 5 Block.','good'); }
    if (stats.stunChance && Math.random() < stats.stunChance) {
      battle.enemy.stunned = true;
      battle.enemy.status = 'STUN';
      showStatusBurst('battleEnemy', 'stun');
      battle.break = Math.min(4, battle.break + 1);
      save.stats.stuns += 1;
      addBattleLog(`${battle.enemy.name} was Stunned.`, 'good');
      persist();
    }
    battle.phase = 'end';
    battle.locked = true;
    if (battle.hero.id === 'knight' && battle.hero.shieldTurns > 0 && !knightCinematic) {
      holdKnightShieldPoseUntilNextTurn();
    }
    renderBattle();
    if (battle.enemy.hp <= 0) {
      const cinematicWait = Math.max(0, (battle.knightAnimationEndsAt || 0) - Date.now());
      if (cinematicWait > 0) {
        battle.timer = setTimeout(() => finishBattle(true), cinematicWait + 70);
        return;
      }
      return finishBattle(true);
    }
    const cinematicWait = Math.max(0, (battle.knightAnimationEndsAt || 0) - Date.now());
    const normalWait = def.category === 'finisher' ? 1120 : 860;
    battle.timer = setTimeout(enemyTurn, Math.max(normalWait, cinematicWait + 120));
    };

    if (typeof window !== 'undefined' && window.__RPCG_ENABLE_TESTS__ && window.__RPCG_FAST_TESTS__ !== false) resolveCard();
    else {
      battle.locked = true;
      renderBattle();
      battle.timer = setTimeout(resolveCard, 660);
    }
  }

  function drawAnotherSwordCombo() {
    if (battle.hand.length >= 5) return false;
    const deckIndex = battle.deck.findIndex(key => parseKey(key).id === 'sword_combo');
    if (deckIndex >= 0) {
      battle.hand.push(battle.deck.splice(deckIndex, 1)[0]);
      return true;
    }
    const discardIndex = battle.discard.slice(0, -1).findIndex(key => parseKey(key).id === 'sword_combo');
    if (discardIndex >= 0) {
      battle.hand.push(battle.discard.splice(discardIndex, 1)[0]);
      return true;
    }
    return false;
  }

  function openSteadyChoice() {
    if (!battle?.steady) return;
    $('steadyChoices').innerHTML = battle.hand.map((key, index) => {
      const { def } = parseKey(key);
      return `<button class="steady-choice" type="button" data-steady-card="${index}" aria-label="Choose ${def.name}"><img src="${cardAsset(key)}" alt="${def.name}"></button>`;
    }).join('');
    document.querySelectorAll('[data-steady-card]').forEach(button => {
      button.onclick = () => toggleSteadyCard(Number(button.dataset.steadyCard));
    });
    updateSteadyChoiceUI();
    setOverlay('steadyOverlay', true);
  }

  function toggleSteadyCard(index) {
    if (!battle?.steady) return;
    const selected = battle.steady.selected;
    const found = selected.indexOf(index);
    if (found >= 0) selected.splice(found, 1);
    else if (selected.length < 2) selected.push(index);
    updateSteadyChoiceUI();
  }

  function updateSteadyChoiceUI() {
    if (!battle?.steady) return;
    document.querySelectorAll('[data-steady-card]').forEach(button => {
      button.classList.toggle('selected', battle.steady.selected.includes(Number(button.dataset.steadyCard)));
    });
    $('steadyConfirm').disabled = battle.steady.selected.length !== 2;
    $('steadyConfirm').textContent = `CONFIRM ${battle.steady.selected.length} / 2`;
  }

  function cancelSteadyChoice() {
    if (!battle?.steady) return;
    const pending = battle.steady;
    const discardIndex = battle.discard.lastIndexOf(pending.key);
    if (discardIndex >= 0) battle.discard.splice(discardIndex, 1);
    battle.hand.splice(Math.min(pending.index, battle.hand.length), 0, pending.key);
    battle.hero.mp = Math.min(battle.hero.maxMp, battle.hero.mp + cardStats(pending.key).cost);
    battle.steady = null;
    battle.phase = 'tactics';
    battle.locked = false;
    setOverlay('steadyOverlay', false);
    setBattleMessage('Steady Stance cancelled. Choose a Boost Card or Skip Phase.');
    flashBattlePhase('BOOST PHASE');
    renderBattle();
  }

  function confirmSteadyChoice() {
    if (!battle?.steady || battle.steady.selected.length !== 2) return;
    const pending = battle.steady;
    [...pending.selected].sort((a, b) => b - a).forEach(index => {
      const [card] = battle.hand.splice(index, 1);
      if (card) battle.deck.push(card);
    });
    drawCards(3);
    if (pending.mana) battle.hero.mp = Math.min(battle.hero.maxMp, battle.hero.mp + pending.mana);
    if (pending.divineFavor) battle.hero.divineFavorThisTurn = true;
    if (battle.hero.id === 'healer') battle.hero.hp = Math.min(battle.hero.maxHp, battle.hero.hp + 5);
    save.stats.boostsPlayed += 1;
    persist();
    battle.steady = null;
    setOverlay('steadyOverlay', false);
    addBattleLog(`Steady Stance returned 2 cards, drew 3${pending.mana ? `, and restored ${pending.mana} Mana` : ''}.`, 'good');
    enterPlayerAttackPhase('Steady Stance resolved. Choose a Skill Card or Skip Phase.');
  }

  function renderStudyForecast() {
    const box = $('studyForecast');
    if (!box || !battle) return;
    const queue = battle.study?.queue || [];
    if (!queue.length) { box.classList.remove('show'); box.innerHTML = ''; return; }
    box.innerHTML = queue.map((plan,index) => `<div><b>TURN +${index + 1}</b> ${plan.boost ? `<span class="forecast-boost">${plan.boost.name}</span> → ` : ''}<span class="forecast-skill">${plan.skill?.name || 'Attack'}</span></div>`).join('');
    box.classList.add('show');
  }

  function studyEnemy() {
    if (!battle || battle.ended || battle.locked || battle.phase !== 'attack') return toast('Study can only replace your Skill action.');
    if (battle.study?.used) return toast('You already studied this enemy.');
    battle.study.used = true;
    battle.study.queue = buildStudyPlan(3);
    addBattleLog(`${heroDisplayName(battle.hero.id)} studied ${battle.enemy.name}. The next 3 enemy turns are revealed.`, 'good');
    setBattleMessage(`STUDY COMPLETE • ${battle.enemy.name}'s next 3 turns revealed.`);
    flashBattlePhase('STUDY ENEMY');
    battle.phase = 'end';
    battle.locked = true;
    renderBattle();
    battle.timer = setTimeout(enemyTurn, 620);
  }

  function skipBoostPhase() {
    if (!battle || battle.ended || battle.locked || battle.phase !== 'tactics') return;
    addBattleLog('Boost phase skipped.', 'system');
    enterPlayerAttackPhase('Boost skipped. Choose a Skill Card or Skip Phase.');
  }

  function skipSkillPhase() {
    if (!battle || battle.ended || battle.locked) return;
    if (battle.phase !== 'attack' && battle.phase !== 'tactics') return;
    addBattleLog(battle.phase === 'tactics' ? 'Boost and Skill phases skipped.' : 'Skill phase skipped.', 'system');
    endTurnEarly();
  }

  function endTurnEarly() {
    if (!battle || battle.ended || battle.locked) return;
    battle.phase = 'end';
    battle.locked = true;
    const beforeMp = battle.hero.mp;
    battle.hero.mp = Math.min(battle.hero.maxMp, battle.hero.mp + 10);
    if (battle.hero.mp > beforeMp) addBattleLog(`${heroDisplayName(battle.hero.id)} caught their breath and restored ${battle.hero.mp - beforeMp} Mana.`, 'good');
    addBattleLog(`${heroDisplayName(battle.hero.id)} ended the turn.`, 'system');
    if (battle.hero.id === 'knight' && (battle.hero.shieldTurns > 0 || battle.hero.shieldBlockPoseActive)) {
      holdKnightShieldPoseUntilNextTurn();
    }
    setBattleMessage('Enemy turn.');
    flashBattlePhase('ENEMY TURN');
    renderBattle();
    battle.timer = setTimeout(enemyTurn, 450);
  }

  function enemyTurn() {
    if (!battle || battle.ended) return;
    // Shield Up is a defensive enemy-turn stance: once the Knight's turn is over,
    // hold the Shield Block artwork through the full enemy turn, then clear it
    // at the start of the player's next turn.
    if (battle.hero?.id === 'knight' && battle.hero.shieldTurns > 0 && !battle.hero.shieldBlockPoseActive) {
      holdKnightShieldPoseUntilNextTurn();
      renderBattle();
    }
    if (battle.enemy.stunned) {
      battle.enemy.stunned = false;
      battle.enemy.status = null;
      addBattleLog(`Stun prevented ${battle.enemy.name} from acting.`, 'good');
      setBattleMessage(`${battle.enemy.name} is Stunned. Your turn returns.`);
      renderBattle();
      battle.timer = setTimeout(nextTurn, 620);
      return;
    }

    const regen = 4 + Math.floor((battle.enemy.level - 1) / 10);
    battle.enemy.mp = Math.min(battle.enemy.maxMp, battle.enemy.mp + regen);
    const set = enemyMoveset();
    if ((battle.enemy.boostLockedTurns||0)>0) { battle.enemy.boostLockedTurns-=1; set.boosts=[]; set.boostChance=0; addBattleLog(`${battle.enemy.name} cannot Boost this turn.`,'good'); }
    let boost = null;
    let skill = null;
    if (battle.study?.queue?.length) {
      const plan = battle.study.queue.shift();
      boost = plan?.boost || null;
      skill = plan?.skill || null;
      if (skill && enemyMoveCost(skill) > battle.enemy.mp) skill = weightedEnemyMove(set.skills);
    } else {
      if (battle.enemy.boostCooldown > 0) battle.enemy.boostCooldown -= 1;
      else if (set.boosts.length && Math.random() < set.boostChance) boost = set.boosts[Math.floor(Math.random() * set.boosts.length)];
      skill = boost?.effect === 'inventory' ? chooseGoblinInventorySkill(set.skills, battle.enemy.mp) : weightedEnemyMove(set.skills);
    }
    if (boost?.effect === 'inventory') skill = chooseGoblinInventorySkill(set.skills, battle.enemy.mp);
    skill = skill || weightedEnemyMove(set.skills);
    battle.enemy.lastMoveId = skill?.id || '';
    renderStudyForecast();

    if (boost) {
      runEnemyBoost(boost);
      battle.timer = setTimeout(() => runEnemySkill(skill), 720);
    } else {
      setBattleMessage('');
      flashBattlePhase('ENEMY SKILL');
      renderBattle();
      battle.timer = setTimeout(() => runEnemySkill(skill), 360);
    }
  }

  function nextTurn() {
    if (!battle || battle.ended) return;
    if (battle.hero?.shieldBlockPoseActive || battle.hero?.shieldBlockPoseUntilNextTurn) {
      clearKnightCinematic();
    }
    setBattleActionTextHidden(false);
    if ((battle.hero.secondBreathTurns||0)>0) {
      battle.hero.hp=Math.min(battle.hero.maxHp,battle.hero.hp+(battle.hero.regenHp||0));
      battle.hero.mp=Math.min(battle.hero.maxMp,battle.hero.mp+(battle.hero.regenMp||0));
      battle.hero.secondBreathTurns-=1;
      addBattleLog(`Second Breath restored ${battle.hero.regenHp||0} HP and ${battle.hero.regenMp||0} Mana.`,'good');
    }
    battle.hero.tauntPlayedThisTurn=false; battle.hero.divineFavorThisTurn=false;
    if (battle.hero.statusWardTurns > 0) battle.hero.statusWardTurns -= 1;
    battle.turn += 1;
    if (battle.enemy.bleedTurns > 0) {
      battle.enemy.hp = Math.max(0, battle.enemy.hp - battle.enemy.bleedDamage);
      battle.enemy.bleedTurns -= 1;
      const dotLabel = battle.enemy.status === 'BURN' ? 'Burn' : 'Bleed';
      const dotType = dotLabel.toLowerCase();
      showStatusBurst('battleEnemy', dotType);
      showDamageEffect('battleEnemy', battle.enemy.bleedDamage, dotType);
      checkGoblinKingPhaseTwo();
      addBattleLog(`${dotLabel} dealt ${battle.enemy.bleedDamage} damage to ${battle.enemy.name}.`, 'good');
      if (battle.enemy.bleedTurns <= 0 && ['BURN','BLEED'].includes(battle.enemy.status)) battle.enemy.status = null;
      if (battle.enemy.hp <= 0) {
        renderBattle();
        return finishBattle(true);
      }
    }
    tickHeroStatuses();
    if (battle.hero.hp <= 0) {
      renderBattle();
      return finishBattle(false);
    }
    if (consumeHeroStun()) {
      battle.phase = 'end';
      battle.locked = true;
      addBattleLog(`STUN consumed ${heroDisplayName(battle.hero.id)}'s entire turn.`, 'bad');
      setBattleMessage('STUNNED • YOUR TURN IS LOST');
      flashBattlePhase('STUNNED');
      showStatusBurst('battleHero', 'stun');
      renderBattle();
      battle.timer = setTimeout(enemyTurn, 760);
      return;
    }
    battle.phase = 'draw';
    battle.locked = true;
    drawCards(1);
    addBattleLog(`Turn ${battle.turn}: drew 1 card.`, 'system');
    setBattleMessage(`Turn ${battle.turn}: Draw Phase`);
    flashBattlePhase('DRAW PHASE');
    renderBattle();
    battle.timer = setTimeout(() => {
      if (!battle || battle.ended) return;
      if (consumeBoostLock()) {
        addBattleLog(`STAGGER skipped ${heroDisplayName(battle.hero.id)}'s Boost Phase.`, 'bad');
        if (consumeSkillLock()) {
          battle.phase = 'end';
          battle.locked = true;
          addBattleLog(`Finisher recoil also skipped ${heroDisplayName(battle.hero.id)}'s Skill Phase.`, 'bad');
          setBattleMessage('Boost and Skill phases lost. Enemy turn.');
          flashBattlePhase('TURN LOCKED');
          renderBattle();
          battle.timer = setTimeout(enemyTurn, 620);
          return;
        }
        battle.phase = 'attack';
        battle.locked = false;
        setBattleMessage('Staggered. Boost Phase skipped. Choose a Skill Card or Skip Phase.');
        flashBattlePhase('BOOST LOCKED');
      } else {
        const forcedSkip = (battle.hero.skipBoostTurns || 0) > 0;
        battle.phase = forcedSkip ? 'attack' : 'tactics';
        if (forcedSkip) {
          battle.hero.skipBoostTurns -= 1;
          battle.locked = false;
          setBattleMessage('Charge recoil skipped the Boost Phase. Choose a Skill Card or Skip Phase.');
          flashBattlePhase('BOOST SKIPPED');
        } else {
          battle.locked = false;
          setBattleMessage('Choose a Boost Card or Skip Phase.');
          flashBattlePhase('BOOST PHASE');
        }
      }
      renderBattle();
    }, 430);
  }

  function renderBattle() {
    if (!battle) return;
    const heroId = battle.hero?.id || activeHero();
    const heroArt = $('battleHero');
    if (heroArt) {
      heroArt.src = heroId === 'knight' ? 'assets/characters/knight.webp' : `assets/characters/${heroId}.webp`;
      heroArt.alt = heroDisplayName(heroId);
      heroArt.dataset.hero = heroId;
    }
    const heroLevelBox = $('battleHeroLevelBox');
    if (heroLevelBox) heroLevelBox.innerHTML = `${heroDisplayName(heroId).toUpperCase()} LV. <i id="battleHeroLevel">${battle.hero.level}</i>`;
    const heroHpPct = 100 * battle.hero.hp / battle.hero.maxHp;
    const heroMpPct = 100 * battle.hero.mp / battle.hero.maxMp;
    const enemyHpPct = 100 * battle.enemy.hp / battle.enemy.maxHp;
    $('enemyName').textContent = `${battle.enemy.name.toUpperCase()} LV. ${battle.enemy.level}`;
    $('battleEnemy').src = battle.enemy.image;
    $('battleEnemy').alt = battle.enemy.name;
    $('battleEnemy').dataset.kind = battle.enemy.kind;
    $('battleEnemy').classList.toggle('avenger', !!battle.enemy.isAvenger);
    $('battleEnemy').classList.toggle('royal-fury', !!battle.enemy.phase2);
    $('battleMenuBtn').hidden = !!battle.caveActive;
    $('battleMenuBtn').disabled = !!battle.caveActive;
    $('heroHpFill').style.width = `${heroHpPct}%`;
    $('heroMpFill').style.width = `${heroMpPct}%`;
    $('enemyHpFill').style.width = `${enemyHpPct}%`;
    $('heroHpText').textContent = `${battle.hero.hp} / ${battle.hero.maxHp}`;
    $('heroMpText').textContent = `${battle.hero.mp} / ${battle.hero.maxMp}`;
    $('enemyHpText').textContent = `${battle.enemy.hp} / ${battle.enemy.maxHp}`;
    $('enemyMpFill').style.width = `${100 * battle.enemy.mp / battle.enemy.maxMp}%`;
    $('enemyMpText').textContent = `${battle.enemy.mp} / ${battle.enemy.maxMp}`;
    $('turnNumber').textContent = battle.turn;
    $('drawCount').textContent = battle.deck.length;
    $('discardCount').textContent = battle.discard.length;
    const enemyStatuses = [];
    if (battle.enemy.status) enemyStatuses.push({ id:battle.enemy.status.toLowerCase(), label:`${battle.enemy.status}${battle.enemy.bleedTurns > 0 ? ` ${battle.enemy.bleedTurns}` : ''}` });
    else if (battle.enemy.bleedTurns > 0) enemyStatuses.push({ id:'bleed', label:`BLEED ${battle.enemy.bleedTurns}` });
    if (battle.enemy.guardPct > 0) enemyStatuses.push({ id:'guard', label:'GUARD' });
    if (battle.enemy.attackMultiplier > 1 || battle.enemy.baseAttackBonus > 1) enemyStatuses.push({ id:'power', label:battle.enemy.phase2 ? 'ROYAL FURY' : 'POWER UP' });
    $('enemyStatusText').innerHTML = enemyStatuses.length ? enemyStatuses.map(status => `<span class="status-chip ${status.id}">${statusIcon(status.id)} ${status.label}</span>`).join('') : 'NO STATUS';
    const heroStatuses = battle.hero.statuses.map(status => ({ id:status.id, label:`${status.id.toUpperCase()}${status.turns > 1 ? ` ${status.turns}` : ''}` }));
    if (battle.hero.statusWardTurns > 0) heroStatuses.unshift({ id:'ward', label:'STATUS WARD' });
    if (battle.hero.shieldTurns > 0 || battle.hero.blockNext) heroStatuses.unshift({ id:'guard', label:battle.hero.blockNext ? 'FULL BLOCK' : 'SHIELD' });
    $('heroStatusText').innerHTML = heroStatuses.length ? heroStatuses.map(status => `<span class="status-chip ${status.id}">${statusIcon(status.id)} ${status.label}</span>`).join('') : 'NO STATUS';
    $('handHint').textContent = battle.phase === 'tactics' ? 'Play a Boost Card or Skip Phase' : battle.phase === 'attack' ? 'Play a Skill Card, Study, or Skip Phase' : battle.phase === 'end' ? 'Enemy turn' : 'Drawing';
    const studyBtn = $('studyEnemyBtn');
    if (studyBtn) {
      studyBtn.disabled = battle.locked || battle.ended || battle.phase !== 'attack' || !!battle.study?.used;
      studyBtn.textContent = battle.study?.used ? 'STUDIED' : 'STUDY ENEMY';
    }
    if ($('battleProgress')) {
      $('battleProgress').textContent = battle.caveActive
        ? `CAVE ${Math.min(4, (battle.caveFightIndex || 0) + 1)} / 4 • NO ESCAPE`
        : `CAVE STREAK ${Math.min(5, save.stats.consecutiveWins || 0)} / 5 • BOSS ${Math.min(5, save.stats.normalWinsSinceBoss || 0)} / 5`;
    }
    renderStudyForecast();
    $('endTurnBtn').disabled = battle.locked || battle.ended;
    $('skipBoostBtn').disabled = battle.locked || battle.ended || battle.phase !== 'tactics';
    $('skipAttackBtn').disabled = battle.locked || battle.ended || !['tactics', 'attack'].includes(battle.phase);

    $('breakPips').querySelectorAll('i').forEach((pip, index) => pip.classList.toggle('on', index < battle.break));
    const phaseOrder = ['draw', 'tactics', 'attack', 'end'];
    const currentIndex = phaseOrder.indexOf(battle.phase);
    document.querySelectorAll('#phaseTabs [data-phase]').forEach(tab => {
      const index = phaseOrder.indexOf(tab.dataset.phase);
      tab.classList.toggle('active', tab.dataset.phase === battle.phase);
      tab.classList.toggle('complete', index < currentIndex);
    });

    $('battleHand').innerHTML = battle.hand.map((key, index) => {
      const { rank, def } = parseKey(key);
      const disabled = !battleCardPlayable(key);
      return `<div class="hand-card-slot ${disabled ? 'disabled' : ''}">
        <button class="hand-card ${disabled ? 'disabled' : ''}" type="button" data-battle-card="${index}" aria-label="${rank} ${def.name}">
          <span class="rank-dot rank-${rank}">${rank[0]}</span><img src="${cardAsset(key)}" alt="${def.name}">
        </button>
      </div>`;
    }).join('');
    document.querySelectorAll('[data-battle-card]').forEach(button => {
      button.onclick = () => {
        const index = Number(button.dataset.battleCard);
        openCardModal(battle.hand[index], { type: 'battle', index });
      };
    });

    $('battleLog').innerHTML = battle.log.map(entry => `<p class="${entry.style}">${entry.message}</p>`).join('');
    $('battleLog').scrollTop = $('battleLog').scrollHeight;
  }

  function animateLevelStat(id, from, to, duration = 850) {
    const el = $(id);
    if (!el) return;
    const start = Date.now();
    const tick = () => {
      const pct = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      const value = Math.round(from + ((to - from) * eased));
      el.textContent = `${from} → ${value}`;
      if (pct < 1) setTimeout(tick, 32);
    };
    tick();
  }

  function showLevelUpCelebration() {
    if (!pendingLevelUp) return;
    const data = pendingLevelUp;
    $('levelUpLevel').textContent = `${heroDisplayName(data.hero).toUpperCase()} • ${data.newLevel}`;
    $('levelUpHp').textContent = `${data.oldStats.hp} → ${data.oldStats.hp}`;
    $('levelUpMp').textContent = `${data.oldStats.mp} → ${data.oldStats.mp}`;
    animateLevelStat('levelUpHp', data.oldStats.hp, data.newStats.hp);
    animateLevelStat('levelUpMp', data.oldStats.mp, data.newStats.mp);
    $('levelUpXp').textContent = `${data.xp} / ${data.xpNeeded}`;
    $('levelUpXpFill').style.width = '0%';
    $('levelUpOverlay').classList.add('show');
    $('levelUpOverlay').setAttribute('aria-hidden','false');
    void $('levelUpOverlay').offsetWidth;
    setTimeout(() => { $('levelUpXpFill').style.width = `${Math.max(0, Math.min(100, (data.xp / data.xpNeeded) * 100))}%`; }, 180);
  }

  function closeLevelUpCelebration() {
    $('levelUpOverlay').classList.remove('show');
    $('levelUpOverlay').setAttribute('aria-hidden','true');
    pendingLevelUp = null;
    syncGlobalUI();
    if (save.stats.caveOfferDue && !save.cave.active) setTimeout(promptCaveOffer, 180);
  }

  function clearCaveOffer() {
    save.stats.caveOfferDue = false;
    save.stats.consecutiveWins = 0;
    persist();
  }

  function beginCave() {
    clearCaveOffer();
    save.cave.active = true;
    save.cave.fightIndex = 0;
    persist();
    setOverlay('battleResult', false);
    startBattle();
  }

  function declineCave() {
    clearCaveOffer();
    toast('Cave declined. Win 5 fights in a row to earn another chance.');
  }

  function promptCaveOffer() {
    if (!save.stats.caveOfferDue || save.cave.active) return;
    showConfirm(
      'Do you want to Enter the Cave?',
      'The cave is 4 fights back to back with NO ESCAPE. The fourth fight is the Goblin King, always 5 levels above you. Your current Health and Mana carry through the entire run.',
      () => { closeConfirm(); beginCave(); },
      declineCave
    );
  }

  function escapeBattle() {
    if (!battle || battle.ended) return showScreen('menu');
    clearKnightCinematic();
    if (battle.caveActive) return toast('There is no escape from the Cave.');
    saveBattleVitals();
    save.stats.consecutiveWins = 0;
    persist();
    clearBattleTimer();
    battle = null;
    showScreen('menu');
  }

  function finishBattle(win) {
    clearBattleTimer();
    clearKnightCinematic();
    battle.ended = true;
    battle.locked = true;
    battle.phase = 'end';
    let bronzeReward = 0;
    let xpReward = 0;
    let silverReward = 0;
    const wasCave = !!battle.caveActive;
    const caveFightIndex = battle.caveFightIndex;

    saveBattleVitals();

    if (win) {
      const rewards = rollBattleRewards(battle.enemy);
      bronzeReward = rewards.bronze;
      silverReward = rewards.silver;
      xpReward = 30;
      save.stats.wins += 1;
      save.bronze += bronzeReward;
      save.silver += silverReward;
      const xpResult = awardHeroXp(xpReward);

      if (wasCave) {
        if (caveFightIndex >= 3) {
          save.cave.active = false;
          save.cave.fightIndex = 0;
          save.stats.normalWinsSinceBoss = 0;
          save.stats.consecutiveWins = 0;
          battle.caveComplete = true;
        } else {
          save.cave.fightIndex = caveFightIndex + 1;
          battle.caveContinue = true;
        }
      } else {
        if (battle.enemy.kind === 'boss' || battle.enemy.kind === 'hero') save.stats.normalWinsSinceBoss = 0;
        else if (battle.enemy.kind === 'normal') save.stats.normalWinsSinceBoss = (save.stats.normalWinsSinceBoss || 0) + 1;
        // Coin Carrier is a special replacement encounter and does not advance the five-normal-win boss counter.
        save.stats.consecutiveWins = (save.stats.consecutiveWins || 0) + 1;
        if (save.stats.consecutiveWins >= 5) save.stats.caveOfferDue = true;
      }
      // Level-up gains increase both max and current vitals after the battle damage is recorded.
      ensureHeroVitals(activeHero());
      persist();
    } else {
      save.stats.consecutiveWins = 0;
      if (wasCave) {
        save.cave.active = false;
        save.cave.fightIndex = 0;
      }
      persist();
    }

    $('resultTitle').textContent = win ? 'VICTORY' : 'DEFEAT';
    if (win && wasCave && caveFightIndex < 3) $('resultCopy').textContent = `Cave fight ${caveFightIndex + 1} of 4 cleared. Your current Health and Mana carry into the next fight.`;
    else if (win && wasCave && caveFightIndex >= 3) $('resultCopy').textContent = `The Level ${battle.enemy.level} Goblin King has fallen. You escaped the Cave.`;
    else $('resultCopy').textContent = win ? `Level ${battle.enemy.level} ${battle.enemy.name} is defeated. Your remaining Health and Mana carry forward.` : `${heroDisplayName(activeHero())} was defeated by Level ${battle.enemy.level} ${battle.enemy.name}. Visit the Healers to recover.`;
    $('resultRewards').innerHTML = win
      ? `<span>BRONZE<b>+${bronzeReward}</b></span><span>HERO XP<b>+${xpReward}</b></span>${silverReward ? `<span>SILVER<b>+${silverReward}</b></span>` : ''}`
      : '<span>REWARD<b>NONE</b></span>';

    $('resultMenuBtn').hidden = !!(win && wasCave && caveFightIndex < 3);
    $('fightAgainBtn').textContent = win && wasCave && caveFightIndex < 3 ? 'CONTINUE CAVE' : 'FIGHT AGAIN';
    syncGlobalUI();
    renderBattle();
    setOverlay('battleResult', true);
    if (win && pendingLevelUp) setTimeout(showLevelUpCelebration, 420);
    else if (win && !wasCave && save.stats.caveOfferDue) setTimeout(promptCaveOffer, 260);
  }

  /* Wiring */
  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => showScreen(button.dataset.go, { newBattle: button.dataset.go === 'battle' && (!battle || battle.ended) }));
  });
  $('battleMenuBtn').addEventListener('click', escapeBattle);
  $('skipBoostBtn').addEventListener('click', skipBoostPhase);
  $('skipAttackBtn').addEventListener('click', skipSkillPhase);
  $('endTurnBtn').addEventListener('click', endTurnEarly);
  $('clearLogBtn').addEventListener('click', () => { if (battle) { battle.log = []; renderBattle(); } });
  $('cardModalClose').addEventListener('click', closeCardModal);
  $('cardModalAction').addEventListener('click', () => { if (modalAction) modalAction(); });
  $('cardModalSecondary').addEventListener('click', () => { if (modalSecondaryAction) modalSecondaryAction(); });
  $('cardModal').addEventListener('click', event => { if (event.target === $('cardModal')) closeCardModal(); });
  $('confirmNo').addEventListener('click', () => closeConfirm(true));
  $('confirmYes').addEventListener('click', () => { if (confirmAction) confirmAction(); });
  $('confirmModal').addEventListener('click', event => { if (event.target === $('confirmModal')) closeConfirm(true); });
  $('steadyCancel').addEventListener('click', cancelSteadyChoice);
  $('steadyConfirm').addEventListener('click', confirmSteadyChoice);
  $('healPickerClose').addEventListener('click', () => setOverlay('healPicker', false));
  $('healPicker').addEventListener('click', event => { if (event.target === $('healPicker')) setOverlay('healPicker', false); });
  $('merchantBuySelected').addEventListener('click', () => {
    if (!selectedMerchantId) return;
    const price = merchantPrices[selectedMerchantId];
    if (save.bronze < price) return toast('Not enough Bronze.');
    showConfirm(`Buy ${cardDefs[selectedMerchantId].name}?`, `Spend ${price} Bronze for one Bronze copy.`, () => buyMerchantCard(selectedMerchantId));
  });
  const shopShelfTargets = [
    ['shopBooster5Hit', 'shopBooster5Display', 'booster5'],
    ['shopStarterHit', 'shopStarterDisplay', 'starters'],
    ['shopBooster3Hit', 'shopBooster3Display', 'booster3']
  ];
  shopShelfTargets.forEach(([hitId, displayId, kind]) => {
    const hit = $(hitId);
    hit.addEventListener('mouseenter', () => setShopDisplayGlow(displayId, true));
    hit.addEventListener('mouseleave', () => setShopDisplayGlow(displayId, false));
    hit.addEventListener('focus', () => setShopDisplayGlow(displayId, true));
    hit.addEventListener('blur', () => setShopDisplayGlow(displayId, false));
    hit.addEventListener('click', () => openShopProduct(kind));
  });
  $('shopExchangeBtn').addEventListener('click', () => openShopProduct('exchange'));
  $('shopProductClose').addEventListener('click', closeShopProductOverlay);
  $('shopProductOverlay').addEventListener('click', event => { if (event.target === $('shopProductOverlay')) closeShopProductOverlay(); });
  $('packRevealFinishBtn').addEventListener('click', () => closePackReveal(true));
  $('packRevealBuyAnotherBtn').addEventListener('click', buyAnotherRevealedPack);
  $('merchantSellSlot').addEventListener('click', () => { renderSellPicker(); setOverlay('sellPicker', true); });
  $('merchantSellConfirm').addEventListener('click', requestSell);
  $('sellPickerClose').addEventListener('click', () => setOverlay('sellPicker', false));
  $('sellPicker').addEventListener('click', event => { if (event.target === $('sellPicker')) setOverlay('sellPicker', false); });
  $('missionChest').addEventListener('click', () => { renderMissions(); setOverlay('missionOverlay', true); });
  $('missionOverlayClose').addEventListener('click', () => setOverlay('missionOverlay', false));
  $('missionOverlay').addEventListener('click', event => { if (event.target === $('missionOverlay')) setOverlay('missionOverlay', false); });
  document.querySelectorAll('[data-hero-filter]').forEach(button => { button.addEventListener('click', () => switchActiveHero(button.dataset.heroFilter)); });
  $('forgeSlotButton').addEventListener('click', () => { renderForgePicker(); setOverlay('forgePicker', true); });
  $('forgePickerClose').addEventListener('click', () => setOverlay('forgePicker', false));
  $('forgePicker').addEventListener('click', event => { if (event.target === $('forgePicker')) setOverlay('forgePicker', false); });
  $('forgeButton').addEventListener('click', requestForge);
  $('forgeResultClose').addEventListener('click', () => { $('forgeResult').classList.remove('fusion-run'); setOverlay('forgeResult', false); });
  $('studyEnemyBtn').addEventListener('click', studyEnemy);
  $('levelUpContinue').addEventListener('click', closeLevelUpCelebration);
  $('equipmentSort').addEventListener('change', event => { equipmentSort = event.target.value; renderEquipment(); });
  $('equipmentRankFilter').addEventListener('change', event => { equipmentRankFilter = event.target.value; renderEquipment(); });
  $('equipmentTypeFilter').addEventListener('change', event => { equipmentTypeFilter = event.target.value; renderEquipment(); });
  $('forgeSort').addEventListener('change', event => { forgeSort = event.target.value; renderForgePicker(); });
  $('forgeRankFilter').addEventListener('change', event => { forgeRankFilter = event.target.value; renderForgePicker(); });
  $('forgeTypeFilter').addEventListener('change', event => { forgeTypeFilter = event.target.value; renderForgePicker(); });
  if ($('musicVolume')) $('musicVolume').addEventListener('input', event => setMusicVolume(event.target.value));
  if ($('sfxVolume')) $('sfxVolume').addEventListener('input', event => setSfxVolume(event.target.value));
  if ($('volumeToggleBtn')) $('volumeToggleBtn').addEventListener('click', toggleMasterVolume);
  document.addEventListener('pointerdown', ensureMusicPlaying, { once:true });
  document.addEventListener('click', () => { if (!audioUnlocked) ensureMusicPlaying(); });
  $('resultMenuBtn').addEventListener('click', () => { setOverlay('battleResult', false); showScreen('menu'); });
  $('fightAgainBtn').addEventListener('click', () => { setOverlay('battleResult', false); startBattle(); });
  $('resetDemoBtn').addEventListener('click', () => {
    showConfirm('Reset portrait demo?', 'This clears purchases, deck changes, missions, and forge progress stored by this build.', () => {
      save = freshSave();
      battle = null;
      forgeSelection = null;
      selectedMerchantId = null;
      selectedSellKey = null;
      persist();
      closeConfirm();
      showScreen('menu');
      toast('Portrait demo reset.');
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if ($('packRevealModal').classList.contains('show')) closePackReveal(true);
    else if ($('cardModal').classList.contains('show')) closeCardModal();
    else if ($('confirmModal').classList.contains('show')) closeConfirm();
    else if ($('shopProductOverlay').classList.contains('show')) closeShopProductOverlay();
    else if ($('sellPicker').classList.contains('show')) setOverlay('sellPicker', false);
    else if ($('missionOverlay').classList.contains('show')) setOverlay('missionOverlay', false);
    else if ($('forgePicker').classList.contains('show')) setOverlay('forgePicker', false);
    else if ($('healPicker').classList.contains('show')) setOverlay('healPicker', false);
    else if ($('steadyOverlay').classList.contains('show')) cancelSteadyChoice();
    else if ($('forgeResult').classList.contains('show')) setOverlay('forgeResult', false);
    else if ($('battleResult').classList.contains('show')) {
      if (battle?.caveActive && battle?.caveContinue) toast('There is no escape from the Cave.');
      else { setOverlay('battleResult', false); showScreen('menu'); }
    }
    else if (currentScreen === 'battle') escapeBattle();
    else if (currentScreen !== 'menu') showScreen('menu');
  });

  function fitGame() {
    const width = window.innerWidth || 1080;
    const height = window.innerHeight || 1920;
    const scale = Math.min(width / 1080, height / 1920);
    const left = Math.max(0, (width - 1080 * scale) / 2);
    const top = Math.max(0, (height - 1920 * scale) / 2);
    $('game').style.left = `${left}px`;
    $('game').style.top = `${top}px`;
    $('game').style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', fitGame);
  window.addEventListener('orientationchange', fitGame);
  setInterval(updateMerchantTimer, 1000);
  setInterval(() => { if (currentScreen === 'heal') renderHealer(); else completeHealingJobs(); }, 1000);
  fitGame();
  syncAudioUI();
  syncGlobalUI();
  showScreen('menu');

  if (typeof window !== 'undefined' && window.__RPCG_ENABLE_TESTS__) {
    window.__RPCG_TEST__ = {
      showScreen,
      renderMerchant,
      openShopProduct,
      buyPack,
      revealPackCard,
      closePackReveal,
      buyStarterDeck,
      exchangeBronzeForSilver,
      exchangeSilverForBronze,
      forgeCostFor,
      canAffordForgeCost,
      buyMerchantCard,
      selectSellCard,
      completeSell,
      changeDeck,
      switchActiveHero,
      activeDeckMap,
      heroLevel,
      heroXp,
      selectForgeCard,
      completeForge,
      startBattle,
      playBattleCard,
      previewKnightMove: (id) => playKnightSkillAnimation(`${id}:bronze`, () => {}),
      skipBoostPhase,
      skipSkillPhase,
      confirmSteadyChoice,
      cancelSteadyChoice,
      selectEncounterForBattle,
      scaleEncounterForLevel,
      knightStatsForLevel,
      rollBattleRewards,
      prepareEncounter,
      renderHealer,
      startHealing,
      completeHealingJobs,
      ensureHeroVitals,
      beginCave,
      declineCave,
      promptCaveOffer,
      finishBattle,
      escapeBattle,
      enemyTurn,
      runEnemyBoost,
      runEnemySkill,
      studyEnemy,
      buildStudyPlan,
      checkGoblinKingPhaseTwo,
      awardHeroXp,
      xpNeededForLevel,
      getEnemyMovesets: () => ENEMY_MOVESETS,
      getGoblinKingFury: () => GOBLIN_KING_FURY,
      getCardDefs: () => cardDefs,
      getStarterDecks: () => starterDecks,
      cardStats,
      cardAsset,
      drawPackCard,
      allowedPotionRankForPack,
      getEncounterConfig: () => ({ coinCarrierChance: COIN_CARRIER_CHANCE, avengerChance: AVENGER_CHANCE, normal: [...NORMAL_ENCOUNTER_IDS], bossHero: [...BOSS_HERO_ENCOUNTER_IDS], encounters: ENCOUNTERS }),
      getSave: () => save,
      getBattle: () => battle,
      getScreen: () => currentScreen,
      setMusicVolume,
      setSfxVolume,
      heroActionMarkup
    };
  }
})();
