(() => {
  'use strict';

  const ADVENTURE_KEY = 'rpcgAdventureModeV3';
  const CORE_SAVE_KEY = 'rpcgPortraitCardGameV3';
  const DEFAULT_BATTLE_BG = 'assets/backgrounds/battle_mobile.png';
  const CAVE_BG = 'assets/adventure/cave_bg.png';
  const DUNGEON_BG = 'assets/adventure/dungeon_bg.png';

  const game = document.getElementById('game');
  if (!game) return;

  let api = null;
  let adventureBattle = null;
  let resultObserver = null;
  let campPoll = null;
  let navBypass = false;

  const NODE_META = {
    enemy:    { icon: '⚔', label: 'ENEMY' },
    strong:   { icon: '⚔', label: 'ENEMY' },
    elite:    { icon: '☠', label: 'ELITE' },
    camp:     { icon: '⛺', label: 'CAMP' },
    treasure: { icon: '◆', label: 'TREASURE' },
    choice:   { icon: '◇', label: 'REST OR TREASURE' },
    cave:     { icon: '◉', label: 'CAVE' },
    dungeon:  { icon: '▣', label: 'DUNGEON' },
    boss:     { icon: '♛', label: 'AREA BOSS' }
  };

  const ROUTE_POSITIONS = [
    [50,89],[30,82],[63,77],[77,70],[48,65],[24,59],
    [43,53],[72,48],[79,41],[55,35],[30,30],[22,23],
    [47,18],[73,13],[56,7]
  ];

  const ADVENTURE_AREA_CONFIGS = [
    {
      zone: 1,
      area: 1,
      mapAsset: 'assets/adventure/zone1_area1.png',
      boss: { enemyId: 'owlbear', displayName: 'Owlbear', levelDelta: 0 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'enemy', 'elite', 'choice', 'cave', 'boss'],
      pools: {
        normal: ['wolf', 'boar', 'spider', 'goblin_scout', 'bandit'],
        strong: ['boar', 'spider', 'bandit', 'armored_goblin'],
        elite: ['owlbear', 'berserk_goblin'],
        cave: ['wolf', 'spider', 'goblin_scout']
      }
    },
    {
      zone: 1,
      area: 2,
      mapAsset: 'assets/adventure/zone1_area2.png',
      boss: { enemyId: 'berserk_goblin', displayName: 'Berserk Goblin', levelDelta: 0 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'elite', 'choice', 'dungeon', 'boss'],
      pools: {
        normal: ['wolf', 'boar', 'spider', 'goblin_scout', 'bandit'],
        strong: ['bandit', 'armored_goblin', 'berserk_goblin'],
        elite: ['owlbear', 'berserk_goblin'],
        dungeon: ['bandit', 'armored_goblin', 'goblin_scout', 'wolf']
      }
    },
    {
      zone: 1,
      area: 3,
      mapAsset: 'assets/adventure/zone1_area3.png',
      boss: { enemyId: 'mirror_healer', displayName: 'Healer', levelDelta: 5 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'elite', 'choice', 'dungeon', 'boss'],
      pools: {
        normal: ['boar', 'spider', 'bandit', 'goblin_scout', 'armored_goblin'],
        strong: ['bandit', 'armored_goblin', 'berserk_goblin'],
        elite: ['owlbear', 'berserk_goblin'],
        dungeon: ['bandit', 'armored_goblin', 'berserk_goblin', 'goblin_scout']
      }
    },
    {
      zone: 2,
      area: 1,
      mapAsset: 'assets/adventure/zone2_area1.png',
      boss: { enemyId: 'wolf', displayName: 'Elite Wolf', levelDelta: 3 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'enemy', 'elite', 'choice', 'cave', 'boss'],
      pools: {
        normal: ['boar', 'spider', 'bandit', 'bandit_outrider', 'goblin_scout'],
        strong: ['bandit_outrider', 'traveling_mercenaries', 'armored_goblin'],
        elite: ['owlbear', 'berserk_goblin'],
        cave: ['wolf', 'spider', 'armored_goblin', 'bandit_outrider']
      }
    },
    {
      zone: 2,
      area: 2,
      mapAsset: 'assets/adventure/zone2_area2.png',
      boss: { enemyId: 'armored_goblin', displayName: 'Armored Goblin', levelDelta: 0 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'elite', 'choice', 'dungeon', 'boss'],
      pools: {
        normal: ['bandit', 'bandit_outrider', 'goblin_scout', 'armored_goblin', 'spider'],
        strong: ['bandit_outrider', 'traveling_mercenaries', 'armored_goblin', 'berserk_goblin'],
        elite: ['owlbear', 'berserk_goblin'],
        dungeon: ['armored_goblin', 'bandit_outrider', 'traveling_mercenaries', 'spider']
      }
    },
    {
      zone: 2,
      area: 3,
      mapAsset: 'assets/adventure/zone2_area3.png',
      boss: { enemyId: 'mirror_warrior', displayName: 'Warrior', levelDelta: 5 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'elite', 'choice', 'dungeon', 'boss'],
      pools: {
        normal: ['bandit_outrider', 'traveling_mercenaries', 'armored_goblin', 'berserk_goblin'],
        strong: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear'],
        elite: ['owlbear', 'berserk_goblin'],
        dungeon: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'bandit_outrider']
      }
    },
    {
      zone: 3,
      area: 1,
      mapAsset: 'assets/adventure/zone3_area1.png',
      boss: { enemyId: 'berserk_goblin', displayName: 'Elite Berserk Goblin', levelDelta: 3 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'enemy', 'elite', 'choice', 'cave', 'boss'],
      pools: {
        normal: ['bandit_outrider', 'traveling_mercenaries', 'armored_goblin', 'berserk_goblin'],
        strong: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear'],
        elite: ['owlbear', 'berserk_goblin'],
        cave: ['berserk_goblin', 'armored_goblin', 'traveling_mercenaries', 'bandit_outrider']
      }
    },
    {
      zone: 3,
      area: 2,
      mapAsset: 'assets/adventure/zone3_area2.png',
      boss: { enemyId: 'goblin_king', displayName: 'Elite Goblin King', levelDelta: 3 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'elite', 'choice', 'dungeon', 'boss'],
      pools: {
        normal: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear'],
        strong: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear'],
        elite: ['owlbear', 'berserk_goblin', 'goblin_king'],
        dungeon: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear']
      }
    },
    {
      zone: 3,
      area: 3,
      mapAsset: 'assets/adventure/zone3_area3.png',
      boss: { enemyId: 'mirror_mage', displayName: 'Wizard', levelDelta: 5 },
      nodes: ['enemy', 'enemy', 'enemy', 'choice', 'enemy', 'enemy', 'elite', 'choice', 'dungeon', 'boss'],
      pools: {
        normal: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear'],
        strong: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear'],
        elite: ['owlbear', 'berserk_goblin', 'goblin_king'],
        dungeon: ['traveling_mercenaries', 'armored_goblin', 'berserk_goblin', 'owlbear']
      }
    }
  ];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function coreSave() {
    try {
      if (api?.getSave) return api.getSave();
      return JSON.parse(localStorage.getItem(CORE_SAVE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function persistCoreSave() {
    try { localStorage.setItem(CORE_SAVE_KEY, JSON.stringify(coreSave())); }
    catch (_) {}
  }

  function loadAdventure() {
    try {
      const raw = localStorage.getItem(ADVENTURE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.version === 3 ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function saveAdventure(state) {
    localStorage.setItem(ADVENTURE_KEY, JSON.stringify(state));
  }

  function buildAreaState(config) {
    return {
      zone: config.zone,
      area: config.area,
      mapAsset: config.mapAsset,
      boss: { ...config.boss },
      pools: JSON.parse(JSON.stringify(config.pools || {})),
      nodes: config.nodes.map((type, index) => ({
        id: `z${config.zone}a${config.area}n${index + 1}`,
        type,
        enemyId: type === 'boss' ? config.boss.enemyId : ['enemy', 'strong', 'elite'].includes(type) ? pick((config.pools?.[type] || config.pools?.normal || ['wolf'])) : null,
        complete: false,
        visited: false,
        rewardTaken: false
      }))
    };
  }

  function createAdventure() {
    const state = {
      version: 3,
      active: true,
      completed: false,
      area: 0,
      node: 0,
      startedAt: Date.now(),
      areas: ADVENTURE_AREA_CONFIGS.map(buildAreaState)
    };
    saveAdventure(state);
    return state;
  }

  function currentArea(state) {
    return state?.areas?.[state.area] || null;
  }

  function currentNode(state) {
    return currentArea(state)?.nodes?.[state.node] || null;
  }

  function areaLabel(areaState) {
    return `ZONE ${areaState.zone} • AREA ${areaState.area}`;
  }

  function completeCurrentNode(state) {
    const areaState = currentArea(state);
    const node = currentNode(state);
    if (!areaState || !node || node.complete) return;
    node.complete = true;

    if (state.node >= areaState.nodes.length - 1) {
      if (state.area >= state.areas.length - 1) {
        state.active = false;
        state.completed = true;
      } else {
        state.area += 1;
        state.node = 0;
      }
    } else {
      state.node += 1;
    }
    saveAdventure(state);
  }

  function injectUI() {
    if (document.getElementById('battleModeOverlay')) return;

    const mode = document.createElement('div');
    mode.id = 'battleModeOverlay';
    mode.className = 'adventure-overlay';
    mode.innerHTML = `
      <div class="battle-mode-box" role="dialog" aria-modal="true" aria-label="Choose Battle Mode">
        <span class="adventure-kicker">BATTLE</span>
        <h1>CHOOSE MODE</h1>
        <button id="adventureModeChoice" class="battle-mode-choice adventure-choice" type="button">
          <span>ADVENTURE MODE</span><small>Travel across 3 Zones with 9 total Areas.</small><b id="adventureModeProgress"></b>
        </button>
        <button id="endlessModeChoice" class="battle-mode-choice endless-choice" type="button">
          <span>ENDLESS WAR</span><small>The original endless battle mode.</small>
        </button>
        <button id="battleModeBack" class="adventure-back" type="button">← BACK</button>
      </div>`;
    game.appendChild(mode);

    const screen = document.createElement('section');
    screen.id = 'adventureScreen';
    screen.className = 'adventure-screen';
    screen.innerHTML = `
      <div class="adventure-map-art" aria-hidden="true"></div>
      <div class="adventure-map-shade"></div>
      <header class="adventure-map-header">
        <span class="adventure-kicker">ADVENTURE MODE</span>
        <h1 id="adventureAreaTitle">ZONE 1 • AREA 1</h1>
        <div id="adventureProgressText">NODE 1</div>
      </header>
      <div id="adventureRoute" class="adventure-route"></div>
      <div id="adventureNodeInfo" class="adventure-node-info"></div>
      <button id="adventureLeave" class="adventure-leave" type="button">← MAIN MENU</button>
      <div class="adventure-test-note">TEST BUILD • SIMULATE VICTORY IS AVAILABLE IN ADVENTURE FIGHTS</div>
    `;
    game.appendChild(screen);

    const treasure = document.createElement('div');
    treasure.id = 'adventureTreasureOverlay';
    treasure.className = 'adventure-overlay';
    treasure.innerHTML = `
      <div class="adventure-room-box treasure-box" role="dialog" aria-modal="true">
        <span class="adventure-kicker">TREASURE ROOM</span>
        <h2>CHOOSE ONE</h2>
        <div id="treasureChoiceArea" class="treasure-choice-area">
          <button id="takeBronzeTreasure" class="treasure-choice" type="button"><span>BRONZE CHEST</span><b>75–250 BRONZE</b><small>Take a random Bronze payout.</small></button>
          <button id="takeSilverTreasure" class="treasure-choice silver" type="button"><span>MYSTERY CARD</span><b>GUARANTEED SILVER</b><small>The Silver card is revealed after you choose it.</small></button>
        </div>
        <div id="treasureReveal" class="treasure-reveal"></div>
      </div>`;
    game.appendChild(treasure);

    const routeChoice = document.createElement('div');
    routeChoice.id = 'adventureChoiceOverlay';
    routeChoice.className = 'adventure-overlay';
    routeChoice.innerHTML = `
      <div class="adventure-room-box adventure-choice-box" role="dialog" aria-modal="true">
        <span class="adventure-kicker">PATH CHOICE</span>
        <h2>CHOOSE YOUR STOP</h2>
        <p>Take time to recover, or gamble on treasure and keep moving.</p>
        <div class="adventure-path-choice-grid">
          <button id="adventureChooseCamp" class="adventure-path-choice camp" type="button">
            <span>⛺</span><b>CAMP</b><small>Use the Healer recovery room and wait time.</small>
          </button>
          <button id="adventureChooseTreasure" class="adventure-path-choice treasure" type="button">
            <span>◆</span><b>TREASURE ROOM</b><small>Choose Bronze or a mystery Silver card.</small>
          </button>
        </div>
      </div>`;
    game.appendChild(routeChoice);

    const bossRecovery = document.createElement('div');
    bossRecovery.id = 'adventureBossRecoveryOverlay';
    bossRecovery.className = 'adventure-overlay';
    bossRecovery.innerHTML = `
      <div class="adventure-room-box boss-recovery-box" role="dialog" aria-modal="true">
        <span class="adventure-kicker">FINAL FIGHT</span>
        <h2>FULLY RESTORED</h2>
        <p>Your deck's Health and Mana have been completely restored for the Area Boss.</p>
        <div class="boss-recovery-vitals"><span>HEALTH<b>FULL</b></span><span>MANA<b>FULL</b></span></div>
        <button id="adventureBossRecoveryContinue" class="adventure-continue" type="button">CONTINUE</button>
      </div>`;
    game.appendChild(bossRecovery);

    const complete = document.createElement('div');
    complete.id = 'adventureCompleteOverlay';
    complete.className = 'adventure-overlay';
    complete.innerHTML = `
      <div class="adventure-room-box complete-box">
        <span class="adventure-kicker">RUN COMPLETE</span>
        <h2>ADVENTURE COMPLETE</h2>
        <p>You cleared all 3 Zones and all 9 Areas.</p>
        <button id="adventureCompleteContinue" class="adventure-continue" type="button">CONTINUE</button>
      </div>`;
    game.appendChild(complete);

    const badge = document.createElement('div');
    badge.id = 'adventureBattleBadge';
    badge.className = 'adventure-battle-badge';
    badge.hidden = true;
    badge.innerHTML = '<b>ADVENTURE</b><span id="adventureBattleBadgeText"></span>';
    document.getElementById('battleScreen')?.appendChild(badge);

    const sim = document.createElement('button');
    sim.id = 'adventureSimWin';
    sim.className = 'adventure-sim-win';
    sim.hidden = true;
    sim.textContent = 'SIMULATE VICTORY';
    document.getElementById('battleScreen')?.appendChild(sim);
  }

  function isChainNodeType(type) {
    return type === 'cave' || type === 'dungeon';
  }

  function fightsForNode(type) {
    if (type === 'cave') return 2;
    if (type === 'dungeon') return 3;
    return 1;
  }

  function showModeSelect() {
    if (!api) return;
    const state = loadAdventure();
    const choice = document.getElementById('adventureModeChoice');
    const progress = document.getElementById('adventureModeProgress');
    const core = coreSave();

    if (state?.active && !state.completed) {
      const areaState = currentArea(state);
      const nodeCount = areaState?.nodes?.length || 0;
      choice.querySelector('span').textContent = 'CONTINUE ADVENTURE';
      progress.textContent = `${areaLabel(areaState)} • NODE ${state.node + 1}/${nodeCount}`;
    } else {
      choice.querySelector('span').textContent = 'ADVENTURE MODE';
      progress.textContent = state?.completed ? 'START A NEW 9-AREA RUN' : 'NEW 9-AREA RUN';
    }

    const blocked = !!core?.cave?.active;
    choice.disabled = blocked;
    if (blocked) progress.textContent = 'FINISH YOUR ENDLESS WAR CAVE FIRST';

    document.getElementById('battleModeOverlay').classList.add('show');
  }

  function hideModeSelect() {
    document.getElementById('battleModeOverlay')?.classList.remove('show');
  }

  function prepareAreaBossRecovery(state = loadAdventure()) {
    if (!state || state.completed) return false;
    const node = currentNode(state);
    if (!node || node.type !== 'boss' || node.preBossHealApplied) return false;

    const core = coreSave();
    const hero = core.activeHero || 'knight';
    const vitals = api.ensureHeroVitals?.(hero);
    if (vitals) {
      vitals.hp = vitals.maxHp;
      vitals.mp = vitals.maxMp;
    }
    if (Array.isArray(core.healingSlots)) {
      core.healingSlots = core.healingSlots.map(slot => slot?.hero === hero ? null : slot);
    }
    node.preBossHealApplied = true;
    saveAdventure(state);
    persistCoreSave();
    return true;
  }

  function showAdventureMap() {
    if (!api) return;
    hideModeSelect();
    api.stopAdventureBossMusic?.(700, false);
    restoreAdventureBattlePresentation();

    const state = loadAdventure() || createAdventure();
    if (state.completed) {
      document.getElementById('adventureCompleteOverlay').classList.add('show');
      return;
    }

    api.completeHealingJobs?.();
    resolveCampIfReady(state);
    const bossRecoveryApplied = prepareAreaBossRecovery(state);

    navBypass = true;
    try { api.showScreen('menu'); } finally { navBypass = false; }
    document.getElementById('adventureScreen').classList.add('show');
    renderAdventureMap();
    if (bossRecoveryApplied) document.getElementById('adventureBossRecoveryOverlay')?.classList.add('show');
  }

  function hideAdventureMap() {
    document.getElementById('adventureScreen')?.classList.remove('show');
  }

  function renderAdventureMap() {
    const state = loadAdventure();
    const areaState = currentArea(state);
    if (!state || state.completed || !areaState) return;
    const nodes = areaState.nodes;
    const route = document.getElementById('adventureRoute');
    const mapArt = document.querySelector('.adventure-map-art');

    document.getElementById('adventureAreaTitle').textContent = areaLabel(areaState);
    document.getElementById('adventureProgressText').textContent = `NODE ${state.node + 1} / ${nodes.length}`;
    mapArt.style.backgroundImage = `url('${areaState.mapAsset}')`;
    mapArt.dataset.area = `${areaState.zone}-${areaState.area}`;

    const visibleNodes = nodes.map((node, index) => {
      if (index > state.node) return '';
      const meta = NODE_META[node.type];
      const pos = ROUTE_POSITIONS[Math.min(index, ROUTE_POSITIONS.length - 1)];
      const isCurrent = index === state.node;
      const cls = isCurrent ? 'current' : 'complete';
      return `<button class="adventure-node ${cls} type-${node.type}" type="button" data-adventure-node="${index}" style="left:${pos[0]}%;top:${pos[1]}%" ${isCurrent ? '' : 'disabled'}>
        <i>${isCurrent ? meta.icon : '✓'}</i><span>${isCurrent ? meta.label : ''}</span>
      </button>`;
    }).join('');
    route.innerHTML = visibleNodes;

    route.querySelectorAll('[data-adventure-node]').forEach(btn => {
      if (!btn.disabled) btn.addEventListener('click', () => activateCurrentNode());
    });

    const node = currentNode(state);
    const info = document.getElementById('adventureNodeInfo');
    if (node) {
      const meta = NODE_META[node.type];
      let detail = 'Tap the unlocked node to continue.';
      if (node.type === 'treasure') detail = 'Choose Bronze or one mystery Silver card.';
      if (node.type === 'choice') detail = 'Choose CAMP to recover or TREASURE ROOM to keep pushing for rewards.';
      if (node.type === 'camp') detail = node.visited ? 'Recovery is in progress. Return to Camp to check the timer.' : 'Camp uses the same Healer recovery room and wait times.';
      if (node.type === 'cave') detail = 'A Cave is 2 fights back to back. Rewards are collected after fight 2 or on defeat.';
      if (node.type === 'dungeon') detail = 'A Dungeon is 3 fights back to back. Rewards are collected after fight 3 or on defeat.';
      if (node.type === 'boss') detail = areaState.area === 3 ? 'Zone Boss battle. This enemy is always 5 levels above your current deck.' : 'Area Boss battle. Elite bosses are up to 3 levels above your current deck.';
      info.innerHTML = `<b>${meta.label}</b><span>${detail}</span>`;
    }
  }

  function activateCurrentNode() {
    const state = loadAdventure();
    const node = currentNode(state);
    if (!state || !node) return;

    if (node.type === 'choice') return openAdventureChoice();
    if (node.type === 'treasure') return openTreasure();
    if (node.type === 'camp') return enterCamp(state, node);
    return startAdventureBattle(state, node);
  }

  function openAdventureChoice() {
    document.getElementById('adventureChoiceOverlay')?.classList.add('show');
  }

  function chooseAdventureStop(type) {
    const state = loadAdventure();
    const node = currentNode(state);
    if (!state || !node || node.type !== 'choice') return;
    node.type = type;
    node.visited = false;
    node.rewardTaken = false;
    saveAdventure(state);
    document.getElementById('adventureChoiceOverlay')?.classList.remove('show');
    if (type === 'camp') enterCamp(state, node);
    else openTreasure();
  }

  function enterCamp(state, node) {
    node.visited = true;
    const core = coreSave();
    const hero = core.activeHero || 'knight';
    node.healingHero = hero;
    saveAdventure(state);

    const vitals = api.ensureHeroVitals?.(hero);
    if (vitals && vitals.hp >= vitals.maxHp && vitals.mp >= vitals.maxMp) {
      completeCurrentNode(state);
      renderAdventureMap();
      flashMapMessage('CAMP CLEARED • HERO ALREADY FULLY RECOVERED');
      return;
    }

    const healingSlots = core.healingSlots || [];
    const alreadyHealing = healingSlots.some(slot => slot?.hero === hero);
    if (!alreadyHealing) {
      const empty = [0, 1].find(index => !healingSlots[index]);
      if (empty !== undefined) api.startHealing?.(empty, hero);
    }

    hideAdventureMap();
    navBypass = true;
    try { api.showScreen('heal'); } finally { navBypass = false; }
    const back = document.querySelector('#healScreen .heal-back');
    if (back) back.textContent = '← ADVENTURE MAP';
  }

  function resolveCampIfReady(state = loadAdventure()) {
    if (!state || state.completed) return false;
    const node = currentNode(state);
    if (!node || node.type !== 'camp' || !node.visited) return false;

    const hero = node.healingHero || coreSave().activeHero || 'knight';
    api.completeHealingJobs?.();
    const vitals = api.ensureHeroVitals?.(hero);
    if (!vitals) return false;
    if (vitals.hp >= vitals.maxHp && vitals.mp >= vitals.maxMp) {
      completeCurrentNode(state);
      return true;
    }
    return false;
  }

  function openTreasure() {
    const reveal = document.getElementById('treasureReveal');
    const choices = document.getElementById('treasureChoiceArea');
    reveal.innerHTML = '';
    reveal.classList.remove('show');
    choices.hidden = false;
    document.getElementById('adventureTreasureOverlay').classList.add('show');
  }

  function silverPool() {
    const defs = api.getCardDefs?.() || {};
    return Object.keys(defs).filter(id => defs[id]?.ranks?.silver);
  }

  function treasureReward(kind) {
    const state = loadAdventure();
    const node = currentNode(state);
    if (!state || !node || node.type !== 'treasure' || node.rewardTaken) return;

    const core = coreSave();
    const reveal = document.getElementById('treasureReveal');
    document.getElementById('treasureChoiceArea').hidden = true;
    node.rewardTaken = true;

    if (kind === 'bronze') {
      const amount = randInt(75, 250);
      core.bronze = (Number(core.bronze) || 0) + amount;
      reveal.innerHTML = `<div class="treasure-bronze-reveal"><span>BRONZE FOUND</span><b>+${amount}</b></div><button id="treasureContinue" class="adventure-continue" type="button">CONTINUE</button>`;
    } else {
      const pool = silverPool();
      const id = pool.length ? pick(pool) : 'sword_strike';
      const key = `${id}:silver`;
      core.owned ||= {};
      core.owned[key] = (core.owned[key] || 0) + 1;
      const def = api.getCardDefs?.()[id];
      const art = api.cardAsset?.(key) || '';
      reveal.innerHTML = `<div class="treasure-card-reveal"><span>SILVER CARD</span>${art ? `<img src="${art}" alt="${def?.name || id}">` : ''}<b>${def?.name || id}</b></div><button id="treasureContinue" class="adventure-continue" type="button">CONTINUE</button>`;
    }

    persistCoreSave();
    saveAdventure(state);
    reveal.classList.add('show');
    document.getElementById('treasureContinue').addEventListener('click', () => {
      document.getElementById('adventureTreasureOverlay').classList.remove('show');
      const fresh = loadAdventure();
      completeCurrentNode(fresh);
      renderAdventureMap();
    });
  }

  function heroLevelNow() {
    return Math.max(1, Number(api.heroLevel?.() || api.getBattle?.()?.hero?.level || 1) || 1);
  }

  function encounterLevelFor(node, areaState, encounterId) {
    const heroLevel = heroLevelNow();
    if (node.type === 'boss') return Math.max(1, heroLevel + (Number(areaState.boss?.levelDelta) || 0));
    if (node.type === 'elite') return heroLevel + 3;
    return Math.max(1, heroLevel - randInt(0, 1));
  }

  function snapshotEndlessState() {
    const core = coreSave();
    return {
      cave: JSON.parse(JSON.stringify(core.cave || { active:false, fightIndex:0 })),
      counters: {
        normalWinsSinceBoss: core.stats?.normalWinsSinceBoss || 0,
        consecutiveWins: core.stats?.consecutiveWins || 0,
        caveOfferDue: !!core.stats?.caveOfferDue,
        lastEncounterId: core.stats?.lastEncounterId || ''
      }
    };
  }

  function restoreEndlessState(snapshot) {
    if (!snapshot) return;
    const core = coreSave();
    core.cave = JSON.parse(JSON.stringify(snapshot.cave));
    core.stats ||= {};
    Object.assign(core.stats, snapshot.counters);
    persistCoreSave();
  }

  function buildEncounterQueue(areaState, type) {
    const count = fightsForNode(type);
    const pool = [...(areaState.pools?.[type] || areaState.pools?.strong || areaState.pools?.normal || ['wolf'])];
    if (!pool.length) return ['wolf'];
    const source = pool.length >= count ? shuffle(pool).slice(0, count) : Array.from({ length: count }, (_, i) => pool[i % pool.length]);
    return source;
  }

  function startAdventureBattle(state, node) {
    const core = coreSave();
    if (core?.cave?.active) {
      flashMapMessage('FINISH THE ACTIVE ENDLESS WAR CAVE FIRST');
      return;
    }

    const areaState = currentArea(state);
    const snapshot = snapshotEndlessState();
    core.cave ||= { active:false, fightIndex:0 };
    core.cave.active = false;
    core.cave.fightIndex = 0;
    persistCoreSave();

    const chain = isChainNodeType(node.type);
    const queue = chain ? buildEncounterQueue(areaState, node.type) : [node.enemyId];
    adventureBattle = {
      area: state.area,
      node: state.node,
      zone: areaState.zone,
      zoneArea: areaState.area,
      type: node.type,
      enemyId: queue[0],
      queue,
      chain,
      chainIndex: 0,
      totalFights: queue.length,
      rewardBank: { bronze: 0, silver: 0, xp: 0, wins: 0 },
      snapshot,
      won: false,
      resolved: false,
      nextAction: 'map',
      rewardsGranted: false
    };

    launchAdventureEncounter(state, node, queue[0], 0, false);
  }

  function launchAdventureEncounter(state, node, encounterId, fightIndex = 0, reuseBattleScreen = false) {
    hideAdventureMap();
    navBypass = true;
    try {
      if (reuseBattleScreen) api.startBattle?.();
      else api.showScreen('battle', { newBattle: true });
    } finally {
      navBypass = false;
    }

    const battle = api.getBattle?.();
    if (!battle) {
      restoreEndlessState(adventureBattle?.snapshot);
      adventureBattle = null;
      showAdventureMap();
      return;
    }

    const cfg = api.getEncounterConfig?.();
    const base = cfg?.encounters?.[encounterId];
    const areaState = currentArea(state);
    if (base) {
      const level = encounterLevelFor(node, areaState, encounterId);
      const scaled = api.scaleEncounterForLevel?.(base, level) || base;
      const displayName = node.type === 'boss'
        ? (areaState.boss?.displayName || base.name)
        : node.type === 'elite'
          ? `Elite ${base.name}`
          : base.name;

      Object.assign(battle.enemy, {
        id: base.id,
        name: displayName,
        kind: base.kind,
        image: base.image,
        level,
        isAvenger: false,
        hp: scaled.hp,
        maxHp: scaled.hp,
        mp: scaled.mp,
        maxMp: scaled.mp,
        damageMin: scaled.damageMin,
        damageMax: scaled.damageMax,
        poisonChance: scaled.poisonChance || 0,
        poisonDamage: scaled.poisonDamage || 3,
        stunned: false,
        status: null,
        bleedTurns: 0,
        bleedDamage: 0,
        attackMultiplier: 1,
        baseAttackBonus: 1,
        guardPct: 0,
        boostCooldown: 0,
        boostLockedTurns: 0,
        statusFocus: null,
        lastMoveId: '',
        phase2: false,
        goblinClubUses: 0,
        inventoryPickId: ''
      });
      battle.caveActive = false;
      battle.caveFightIndex = -1;
      battle.adventureBattle = true;
      battle.deferAdventureRewards = !!adventureBattle?.chain;
      battle.adventureChainIndex = fightIndex;
      battle.adventureChainTotal = adventureBattle?.totalFights || 1;
      battle.adventureNodeType = node.type;
      battle.pendingAdventureReward = null;
      syncForcedEnemyUI(battle, node, state, fightIndex);
    }

    setAdventureBattlePresentation(node, state, fightIndex);
    if (node.type === 'boss') api.startAdventureBossMusic?.(1100);
  }

  function progressLabelForBattle(node, areaState, fightIndex = 0) {
    const prefix = areaLabel(areaState);
    if (node.type === 'cave') return `${prefix} • CAVE ${fightIndex + 1} / ${fightsForNode('cave')}`;
    if (node.type === 'dungeon') return `${prefix} • DUNGEON ${fightIndex + 1} / ${fightsForNode('dungeon')}`;
    if (node.type === 'boss') return `${prefix} • AREA BOSS`;
    return `${prefix} • ${NODE_META[node.type].label}`;
  }

  function syncForcedEnemyUI(battle, node, state, fightIndex = 0) {
    const enemy = battle.enemy;
    const enemyName = document.getElementById('enemyName');
    const hpText = document.getElementById('enemyHpText');
    const mpText = document.getElementById('enemyMpText');
    const hpFill = document.getElementById('enemyHpFill');
    const mpFill = document.getElementById('enemyMpFill');
    const img = document.getElementById('battleEnemy');
    const progress = document.getElementById('battleProgress');
    const splash = document.getElementById('encounterSplash');
    const areaState = currentArea(state);

    if (enemyName) enemyName.textContent = `${enemy.name.toUpperCase()} LV. ${enemy.level}`;
    if (hpText) hpText.textContent = `${enemy.hp} / ${enemy.maxHp}`;
    if (mpText) mpText.textContent = `${enemy.mp} / ${enemy.maxMp}`;
    if (hpFill) hpFill.style.width = '100%';
    if (mpFill) mpFill.style.width = '100%';
    if (img) {
      img.src = enemy.image;
      img.alt = enemy.name;
      img.dataset.kind = enemy.kind;
    }
    if (progress) progress.textContent = progressLabelForBattle(node, areaState, fightIndex);
    splash?.classList.remove('show');
  }

  function setAdventureBattlePresentation(node, state, fightIndex = 0) {
    const bg = document.querySelector('#battleScreen .battle-bg');
    if (bg) {
      if (node.type === 'cave') bg.src = CAVE_BG;
      else if (node.type === 'dungeon' || node.type === 'boss') bg.src = DUNGEON_BG;
      else bg.src = DEFAULT_BATTLE_BG;
    }

    const badge = document.getElementById('adventureBattleBadge');
    const badgeText = document.getElementById('adventureBattleBadgeText');
    if (badge && badgeText) {
      badge.hidden = false;
      badgeText.textContent = progressLabelForBattle(node, currentArea(state), fightIndex);
    }

    const sim = document.getElementById('adventureSimWin');
    if (sim) sim.hidden = false;
    const escape = document.getElementById('battleMenuBtn');
    if (escape) {
      if (adventureBattle?.chain) {
        escape.textContent = 'NO ESCAPE';
        escape.disabled = true;
      } else {
        escape.textContent = 'WORLD MAP';
        escape.disabled = false;
      }
    }
  }

  function restoreAdventureBattlePresentation() {
    const bg = document.querySelector('#battleScreen .battle-bg');
    if (bg) bg.src = DEFAULT_BATTLE_BG;
    const badge = document.getElementById('adventureBattleBadge');
    if (badge) badge.hidden = true;
    const sim = document.getElementById('adventureSimWin');
    if (sim) sim.hidden = true;
    const escape = document.getElementById('battleMenuBtn');
    if (escape) {
      escape.textContent = 'ESCAPE';
      escape.disabled = false;
    }
    const result = document.querySelector('#battleResult .result-card');
    result?.classList.remove('adventure-result-card');
  }

  function addRewardToBank(bank, reward) {
    bank.bronze += Number(reward?.bronze || 0);
    bank.silver += Number(reward?.silver || 0);
    bank.xp += Number(reward?.xp || 0);
    bank.wins += 1;
  }

  function grantRewardBank(bank) {
    const core = coreSave();
    core.bronze = (Number(core.bronze) || 0) + (Number(bank?.bronze) || 0);
    core.silver = (Number(core.silver) || 0) + (Number(bank?.silver) || 0);
    persistCoreSave();
    let xpResult = null;
    if (Number(bank?.xp) > 0) xpResult = api.awardHeroXp?.(Number(bank.xp));
    persistCoreSave();
    return xpResult;
  }

  function setResultOverlayText(copy, rewardBank, heading = 'BANKED REWARDS') {
    const resultCopy = document.getElementById('resultCopy');
    const resultRewards = document.getElementById('resultRewards');
    if (resultCopy) resultCopy.textContent = copy;
    if (resultRewards) {
      resultRewards.innerHTML = `<span>${heading}<b>${rewardBank?.bronze || 0} BRONZE</b></span><span>HERO XP<b>+${rewardBank?.xp || 0}</b></span>${rewardBank?.silver ? `<span>SILVER<b>+${rewardBank.silver}</b></span>` : ''}`;
    }
  }

  function handleAdventureBattleResult() {
    if (!adventureBattle || adventureBattle.resolved) return;
    const resultOverlay = document.getElementById('battleResult');
    if (!resultOverlay?.classList.contains('show')) return;

    adventureBattle.resolved = true;
    adventureBattle.won = document.getElementById('resultTitle')?.textContent?.trim().toUpperCase() === 'VICTORY';
    if (adventureBattle.type === 'boss') api.stopAdventureBossMusic?.(1100, false);
    restoreEndlessState(adventureBattle.snapshot);

    const menuBtn = document.getElementById('resultMenuBtn');
    const continueBtn = document.getElementById('fightAgainBtn');
    const liveBattle = api.getBattle?.();
    const resultCard = document.querySelector('#battleResult .result-card');

    if (menuBtn) menuBtn.hidden = true;
    if (continueBtn) continueBtn.textContent = 'CONTINUE';
    resultCard?.classList.add('adventure-result-card');

    if (adventureBattle.chain) {
      const reward = liveBattle?.pendingAdventureReward;
      if (adventureBattle.won && reward) addRewardToBank(adventureBattle.rewardBank, reward);

      const finalFight = adventureBattle.chainIndex >= adventureBattle.totalFights - 1;
      const nodeName = adventureBattle.type === 'cave' ? 'Cave' : 'Dungeon';

      if (adventureBattle.won && !finalFight) {
        adventureBattle.nextAction = 'chain';
        if (continueBtn) continueBtn.textContent = 'NEXT FIGHT';
        setResultOverlayText(
          `${nodeName} fight ${adventureBattle.chainIndex + 1} of ${adventureBattle.totalFights} cleared. Rewards stay banked until the final fight or defeat.`,
          adventureBattle.rewardBank,
          'BANKED'
        );
      } else {
        if (!adventureBattle.rewardsGranted) {
          const xpResult = grantRewardBank(adventureBattle.rewardBank);
          adventureBattle.rewardsGranted = true;
          if (xpResult?.leveled) {
            const copy = document.getElementById('resultCopy');
            if (copy) copy.textContent += ` ${xpResult.hero.toUpperCase()} reached Level ${xpResult.newLevel}.`;
          }
        }
        adventureBattle.nextAction = 'map';
        if (adventureBattle.won) {
          const doneCopy = `${nodeName} cleared. You collected rewards from all ${adventureBattle.totalFights} fights.`;
          setResultOverlayText(doneCopy, adventureBattle.rewardBank, 'TOTAL');
        } else {
          const fightsCleared = adventureBattle.rewardBank.wins || 0;
          const defeatCopy = fightsCleared
            ? `Defeat. You still collected the banked rewards from ${fightsCleared} cleared ${fightsCleared === 1 ? 'fight' : 'fights'}.`
            : 'Defeat. No earlier fights were cleared, so no rewards were banked.';
          setResultOverlayText(defeatCopy, adventureBattle.rewardBank, fightsCleared ? 'COLLECTED' : 'REWARD');
          if (!fightsCleared) {
            const rewards = document.getElementById('resultRewards');
            if (rewards) rewards.innerHTML = '<span>REWARD<b>NONE</b></span>';
          }
        }
      }
      return;
    }

    adventureBattle.nextAction = 'map';
  }

  function leaveAdventureBattleToMap(advanceIfWon) {
    if (!adventureBattle) return;
    const outcome = { ...adventureBattle };
    restoreEndlessState(outcome.snapshot);
    adventureBattle = null;
    const overlay = document.getElementById('battleResult');
    overlay?.classList.remove('show');
    overlay?.setAttribute('aria-hidden', 'true');
    restoreAdventureBattlePresentation();

    if (advanceIfWon && outcome.won) {
      const state = loadAdventure();
      completeCurrentNode(state);
      if (state.completed) {
        document.getElementById('adventureCompleteOverlay').classList.add('show');
        return;
      }
    }
    showAdventureMap();
  }

  function continueAdventureChain() {
    if (!adventureBattle?.chain) return;
    const overlay = document.getElementById('battleResult');
    overlay?.classList.remove('show');
    overlay?.setAttribute('aria-hidden', 'true');

    const state = loadAdventure();
    const node = currentNode(state);
    if (!state || !node) {
      adventureBattle = null;
      showAdventureMap();
      return;
    }

    adventureBattle.chainIndex += 1;
    adventureBattle.resolved = false;
    adventureBattle.won = false;
    const nextEncounter = adventureBattle.queue[adventureBattle.chainIndex];
    launchAdventureEncounter(state, node, nextEncounter, adventureBattle.chainIndex, true);
  }

  function startEndlessWar() {
    hideModeSelect();
    hideAdventureMap();
    api.stopAdventureBossMusic?.(700, false);
    adventureBattle = null;
    restoreAdventureBattlePresentation();
    navBypass = true;
    try { api.showScreen('battle', { newBattle: true }); } finally { navBypass = false; }
  }

  function flashMapMessage(text) {
    const info = document.getElementById('adventureNodeInfo');
    if (!info) return;
    const previous = info.innerHTML;
    info.innerHTML = `<b>${text}</b>`;
    setTimeout(() => {
      if (document.getElementById('adventureScreen')?.classList.contains('show')) renderAdventureMap();
      else info.innerHTML = previous;
    }, 1700);
  }

  function wireUI() {
    document.getElementById('adventureModeChoice').addEventListener('click', () => {
      let state = loadAdventure();
      if (!state || state.completed || !state.active) state = createAdventure();
      hideModeSelect();
      showAdventureMap();
    });
    document.getElementById('endlessModeChoice').addEventListener('click', startEndlessWar);
    document.getElementById('battleModeBack').addEventListener('click', hideModeSelect);
    document.getElementById('adventureLeave').addEventListener('click', () => {
      hideAdventureMap();
      navBypass = true;
      try { api.showScreen('menu'); } finally { navBypass = false; }
    });
    document.getElementById('adventureChooseCamp').addEventListener('click', () => chooseAdventureStop('camp'));
    document.getElementById('adventureChooseTreasure').addEventListener('click', () => chooseAdventureStop('treasure'));
    document.getElementById('adventureBossRecoveryContinue').addEventListener('click', () => {
      document.getElementById('adventureBossRecoveryOverlay')?.classList.remove('show');
    });
    document.getElementById('takeBronzeTreasure').addEventListener('click', () => treasureReward('bronze'));
    document.getElementById('takeSilverTreasure').addEventListener('click', () => treasureReward('silver'));
    document.getElementById('adventureCompleteContinue').addEventListener('click', () => {
      document.getElementById('adventureCompleteOverlay').classList.remove('show');
      hideAdventureMap();
      navBypass = true;
      try { api.showScreen('menu'); } finally { navBypass = false; }
    });
    document.getElementById('adventureSimWin').addEventListener('click', () => {
      if (adventureBattle && !api.getBattle?.()?.ended) api.finishBattle?.(true);
    });

    document.addEventListener('click', event => {
      if (navBypass) return;
      const battleNav = event.target.closest?.('[data-go="battle"]');
      if (battleNav) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showModeSelect();
        return;
      }

      const healBack = event.target.closest?.('#healScreen .heal-back');
      if (healBack) {
        const state = loadAdventure();
        const node = currentNode(state);
        if (state?.active && node?.type === 'camp' && node.visited) {
          event.preventDefault();
          event.stopImmediatePropagation();
          resolveCampIfReady(state);
          showAdventureMap();
          return;
        }
      }

      if (adventureBattle) {
        const resultContinue = event.target.closest?.('#fightAgainBtn');
        if (resultContinue && document.getElementById('battleResult')?.classList.contains('show')) {
          event.preventDefault();
          event.stopImmediatePropagation();
          handleAdventureBattleResult();
          if (adventureBattle?.chain && adventureBattle?.nextAction === 'chain') continueAdventureChain();
          else leaveAdventureBattleToMap(!!adventureBattle?.won);
          return;
        }

        const escape = event.target.closest?.('#battleMenuBtn');
        if (escape) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (adventureBattle.chain) {
            flashMapMessage('NO ESCAPE DURING A CAVE OR DUNGEON RUN');
            return;
          }
          restoreEndlessState(adventureBattle.snapshot);
          if (adventureBattle.type === 'boss') api.stopAdventureBossMusic?.(900, false);
          api.escapeBattle?.();
          adventureBattle = null;
          restoreAdventureBattlePresentation();
          showAdventureMap();
          return;
        }
      }
    }, true);

    resultObserver = new MutationObserver(() => handleAdventureBattleResult());
    const result = document.getElementById('battleResult');
    if (result) resultObserver.observe(result, { attributes:true, attributeFilter:['class'] });

    campPoll = setInterval(() => {
      const state = loadAdventure();
      if (!state?.active || state.completed) return;
      const node = currentNode(state);
      if (node?.type !== 'camp' || !node.visited) return;
      if (resolveCampIfReady(state)) {
        if (document.getElementById('adventureScreen')?.classList.contains('show')) {
          renderAdventureMap();
          flashMapMessage('CAMP RECOVERY COMPLETE');
        }
      }
    }, 1000);
  }

  function waitForApi() {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window.__RPCG_TEST__) {
        clearInterval(timer);
        api = window.__RPCG_TEST__;
        injectUI();
        wireUI();
      } else if (tries > 80) {
        clearInterval(timer);
        console.error('RPCG Adventure Mode could not connect. Enable window.__RPCG_ENABLE_TESTS__ before game.js.');
      }
    }, 50);
  }

  waitForApi();
})();
