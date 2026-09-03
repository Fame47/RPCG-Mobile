const fs = require('fs');
const path = require('path');
const vm = require('vm');

const project = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(project, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(project, 'styles.css'), 'utf8');
const source = fs.readFileSync(path.join(project, 'game.js'), 'utf8');

class ClassList {
  constructor(initial = '') { this.values = new Set(initial.split(/\s+/).filter(Boolean)); }
  add(...items) { items.forEach(item => this.values.add(item)); }
  remove(...items) { items.forEach(item => this.values.delete(item)); }
  contains(item) { return this.values.has(item); }
  toggle(item, force) {
    if (force === true) { this.values.add(item); return true; }
    if (force === false) { this.values.delete(item); return false; }
    if (this.values.has(item)) { this.values.delete(item); return false; }
    this.values.add(item); return true;
  }
}

class Element {
  constructor(id = '', classes = '') {
    this.id = id;
    this.classList = new ClassList(classes);
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.childrenBySelector = {};
    this.textContent = '';
    this.innerHTML = '';
    this.hidden = false;
    this.disabled = false;
    this.scrollTop = 0;
    this.scrollHeight = 100;
    this.offsetWidth = 100;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  click() {
    if (this.disabled) return false;
    const event = {
      target: this,
      currentTarget: this,
      preventDefault() {},
      stopPropagation() {}
    };
    if (typeof this.onclick === 'function') this.onclick(event);
    (this.listeners.click || []).forEach(handler => handler(event));
    return true;
  }
  querySelectorAll(selector) { return this.childrenBySelector[selector] || []; }
  querySelector() { return null; }
}

const elements = new Map();
for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
  const tag = match[0];
  const classes = (tag.match(/\bclass="([^"]*)"/) || [,''])[1];
  elements.set(match[1], new Element(match[1], classes));
}

const goElements = [...html.matchAll(/<button[^>]+data-go="([^"]+)"[^>]*>/g)].map(match => {
  const element = new Element();
  element.dataset.go = match[1];
  return element;
});
const heroElements = [...html.matchAll(/<button[^>]+data-hero-filter="([^"]+)"[^>]*>/g)].map(match => {
  const element = new Element();
  element.dataset.heroFilter = match[1];
  return element;
});
const phases = ['draw', 'tactics', 'attack', 'end'].map(phase => {
  const element = new Element();
  element.dataset.phase = phase;
  return element;
});
elements.get('phaseTabs').childrenBySelector['[data-phase]'] = phases;
elements.get('breakPips').childrenBySelector.i = Array.from({length: 4}, () => new Element());
elements.get('forgeSlots').childrenBySelector.div = Array.from({length: 3}, () => new Element());

const screenIds = ['menuScreen', 'battleScreen', 'merchantScreen', 'equipmentScreen', 'forgeScreen', 'healScreen'];
const screens = screenIds.map(id => elements.get(id));
const dynamicButtonSources = {
  '[data-shop-card]': { container: 'merchantStock', attribute: 'shop-card', dataset: 'shopCard' },
  '[data-sell-card]': { container: 'sellPickerGrid', attribute: 'sell-card', dataset: 'sellCard' },
  '[data-owned-card]': { container: 'ownedCards', attribute: 'owned-card', dataset: 'ownedCard' },
  '[data-forge-card]': { container: 'forgePickerGrid', attribute: 'forge-card', dataset: 'forgeCard' },
  '[data-battle-card]': { container: 'battleHand', attribute: 'battle-card', dataset: 'battleCard' },
  '[data-pack-reveal]': { container: 'packRevealCardSpread', attribute: 'pack-reveal', dataset: 'packReveal' }
};
const dynamicButtonCache = new Map();

function dynamicButtons(selector) {
  const sourceInfo = dynamicButtonSources[selector];
  if (!sourceInfo) return null;
  const markup = elements.get(sourceInfo.container).innerHTML;
  const cached = dynamicButtonCache.get(selector);
  if (cached?.markup === markup) return cached.buttons;
  const pattern = new RegExp(`<button([^>]*data-${sourceInfo.attribute}="([^"]+)"[^>]*)>`, 'g');
  const buttons = [...markup.matchAll(pattern)].map(match => {
    const classes = (match[1].match(/class="([^"]*)"/) || [,''])[1];
    const button = new Element('', classes);
    button.dataset[sourceInfo.dataset] = match[2];
    button.disabled = /(?:^|\s)disabled(?:\s|=|$)/.test(match[1]);
    return button;
  });
  dynamicButtonCache.set(selector, { markup, buttons });
  return buttons;
}

const document = {
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll(selector) {
    if (selector === '.screen') return screens;
    if (selector === '[data-go]' || selector === '#bottomNav [data-go]') return goElements;
    if (selector === '[data-hero-filter]') return heroElements;
    if (selector === '#phaseTabs [data-phase]') return phases;
    if (selector === '#breakPips i') return elements.get('breakPips').childrenBySelector.i;
    const dynamic = dynamicButtons(selector);
    if (dynamic) return dynamic;
    return [];
  },
  addEventListener() {}
};

const storage = new Map();
const windowObject = {
  innerWidth: 1920,
  innerHeight: 1080,
  __RPCG_ENABLE_TESTS__: true,
  addEventListener() {}
};
windowObject.window = windowObject;
windowObject.document = document;

const context = {
  window: windowObject,
  document,
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  console,
  Date,
  Math,
  JSON,
  setTimeout() { return 1; },
  clearTimeout() {},
  setInterval() { return 1; },
  clearInterval() {}
};

vm.createContext(context);
vm.runInContext(source, context, {filename: 'game.js'});

const api = windowObject.__RPCG_TEST__;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(api, 'Test API was not exposed.');
assert(api.getScreen() === 'menu', 'Initial screen is not Menu.');
assert(screens.length === 6, 'The build does not have the six portrait screens, including Healers.');
assert(elements.get('game').style.transform === 'scale(0.5625)', 'The 1080×1920 canvas is not fully fitted inside a 1920×1080 PC screen.');
assert(elements.get('game').style.left === '656.25px', 'The portrait canvas is not centered horizontally on a 1920×1080 PC screen.');
assert(/\.menu-status\s*\{[^}]*pointer-events:\s*none;/s.test(css), 'The transparent Menu HUD can intercept mouse clicks.');
assert(/\.menu-hero-panel\s*\{[^}]*pointer-events:\s*none;/s.test(css), 'The full-screen hero layer can intercept mouse clicks.');
assert(/\.change-deck-button\s*\{[^}]*pointer-events:\s*auto;/s.test(css), 'Change Deck was not restored as a mouse target.');
assert(/@media \(hover:\s*hover\) and \(pointer:\s*fine\)/.test(css), 'PC mouse hover feedback is missing.');
assert(/forge-fusion-overlay\.fusion-run/.test(css), 'Restored Forge fusion animation CSS is missing.');
assert(/pack-reveal-card\.revealed/.test(css), 'Restored booster flip reveal CSS is missing.');
assert((html.match(/data-go=/g) || []).length === goElements.length, 'A navigation target is not a real button.');

const clickGo = name => {
  const button = goElements.find(item => item.dataset.go === name);
  assert(button, `No mouse target exists for ${name}.`);
  button.click();
  assert(api.getScreen() === name, `Mouse click did not open ${name}.`);
};

clickGo('merchant');
assert((elements.get('merchantStock').innerHTML.match(/data-shop-card=/g) || []).length === 2, 'Merchant placement is not the intended two-card stock column.');
assert(elements.get('merchantStock').innerHTML.includes('power_strike'), 'Power Strike is not present in the first rotation.');
assert(elements.get('merchantStock').innerHTML.includes('elemental_storm'), 'Elemental Storm is not present in the first rotation.');
assert((elements.get('shopBooster3Hit').listeners.mouseenter || []).length === 1, '3-card shelf hover glow is not wired.');
assert((elements.get('shopBooster5Hit').listeners.mouseenter || []).length === 1, '5-card shelf hover glow is not wired.');
assert((elements.get('shopStarterHit').listeners.mouseenter || []).length === 1, 'Starter deck shelf hover glow is not wired.');
elements.get('shopStarterHit').click();
assert(elements.get('shopProductOverlay').classList.contains('show'), 'Clicking the starter deck shelf did not open the product overlay.');
assert((elements.get('shopProductBody').innerHTML.match(/data-starter-buy=/g) || []).length === 4, 'Starter deck overlay does not show all four deck choices.');
elements.get('shopProductClose').click();
elements.get('shopBooster3Hit').click();
assert(elements.get('shopProductOverlay').classList.contains('show'), 'Clicking the 3-card booster shelf did not open the product overlay.');
assert(elements.get('shopProductBody').innerHTML.includes('assets/products/booster_3card.png'), 'The supplied 3-card booster art is not used in the product overlay.');
elements.get('shopProductClose').click();
elements.get('shopBooster5Hit').click();
assert(elements.get('shopProductBody').innerHTML.includes('assets/products/booster_5card.png'), 'The supplied 5-card booster art is not used in the product overlay.');
elements.get('shopProductClose').click();
const powerStrikeShopButton = document.querySelectorAll('[data-shop-card]').find(button => button.dataset.shopCard === 'power_strike');
assert(powerStrikeShopButton, 'Power Strike is not exposed as a mouse-clickable Shop card.');
powerStrikeShopButton.click();
assert(elements.get('cardModal').classList.contains('show'), 'Clicking a Shop card did not open its card panel.');
elements.get('cardModalAction').click();
assert(api.getSave().bronze === 452, 'Purchase did not debit 50 Bronze.');
assert(api.getSave().owned['power_strike:bronze'] === 1, 'Purchase did not add Power Strike.');
elements.get('merchantSellSlot').click();
const powerStrikeSellButton = document.querySelectorAll('[data-sell-card]').find(button => button.dataset.sellCard === 'power_strike:bronze');
assert(powerStrikeSellButton, 'Power Strike is not exposed as a mouse-clickable sell card.');
powerStrikeSellButton.click();
elements.get('merchantSellConfirm').click();
assert(elements.get('confirmModal').classList.contains('show'), 'Sell click did not open confirmation.');
elements.get('confirmYes').click();
assert(api.getSave().bronze === 502, 'Selling did not award 50 Bronze.');
assert(api.getSave().owned['power_strike:bronze'] === 0, 'Selling did not consume one spare card.');

clickGo('forge');
elements.get('forgeSlotButton').click();
assert(elements.get('forgePicker').classList.contains('show'), 'Clicking the Forge slots did not open the card picker.');
const swordStrikeForgeButton = document.querySelectorAll('[data-forge-card]').find(button => button.dataset.forgeCard === 'sword_strike:bronze');
assert(swordStrikeForgeButton, 'Sword Strike is not exposed as a mouse-clickable Forge card.');
swordStrikeForgeButton.click();
elements.get('forgeButton').click();
assert(elements.get('confirmModal').classList.contains('show'), 'Merge click did not open confirmation.');
const bronzeBeforeSwordForge = api.getSave().bronze;
elements.get('confirmYes').click();
assert(api.getSave().bronze === bronzeBeforeSwordForge - 100, 'Bronze → Silver normal Forge did not charge 100 Bronze.');
assert(api.getSave().owned['sword_strike:bronze'] === 3, 'Forge did not consume three spare Bronze copies.');
assert(api.getSave().owned['sword_strike:silver'] === 1, 'Forge did not create one Silver copy.');
assert(api.getSave().heroDecks.knight['sword_strike:bronze'] === 3, 'Forge consumed an active-deck copy.');
assert(elements.get('forgeResult').classList.contains('fusion-run'), 'Forge merge did not launch the restored fusion animation.');
assert(elements.get('forgeSourceImg1').src, 'Forge fusion source card art was not assigned.');
elements.get('forgeResultClose').click();

// V11 regression: level-scaled card values and Finisher forging must stay live.
assert(api.cardStats('sword_strike:bronze', 10).damage === 30, 'Bronze Sword Strike is not applying +2 damage per Hero Level.');
assert(api.cardStats('executioners_swing:bronze', 1).damage === 77, 'Bronze Executioner\'s Swing is not 75 +2 per Hero Level.');
assert(api.cardStats('executioners_swing:silver', 10).damage === 120, 'Silver Executioner\'s Swing is not 90 +3 per Hero Level.');
assert(api.cardStats('executioners_swing:gold', 50).damage === 310, 'Gold Executioner\'s Swing is not 110 +4 per Hero Level at Level 50.');
assert(api.getCardDefs().executioners_swing.forgeable === true, 'Executioner\'s Swing is still blocked from the Forge.');
assert(api.getCardDefs().executioners_swing.ranks.silver && api.getCardDefs().executioners_swing.ranks.gold, 'Executioner\'s Swing Silver/Gold rank definitions are missing.');
api.getSave().owned['executioners_swing:bronze'] = 4;
api.getSave().heroDecks.knight['executioners_swing:bronze'] = 1;
api.getSave().bronze = Math.max(api.getSave().bronze, 500);
const bronzeBeforeFinisherForge = api.getSave().bronze;
api.selectForgeCard('executioners_swing:bronze');
api.completeForge();
assert(api.getSave().bronze === bronzeBeforeFinisherForge - 150, 'Bronze Finisher → Silver Forge did not charge 150 Bronze.');
assert(api.getSave().owned['executioners_swing:bronze'] === 1, 'Finisher Forge consumed the protected active-deck copy.');
assert(api.getSave().owned['executioners_swing:silver'] === 1, 'Finisher Forge did not create Silver Executioner\'s Swing.');
assert(api.cardAsset('executioners_swing:silver').includes('/silver/executioners_swing.webp'), 'Supplied Silver Executioner art is not being used.');
elements.get('forgeResultClose').click();

// V12 regression: potion rank art/effects, Forge freedom, booster rarity, and clean Menu background.
assert(html.includes('assets/backgrounds/menu_mobile.png'), 'The clean Menu background is not wired into index.html.');
assert(!html.includes('menu_mobile_v10.jpg'), 'The old grid-backed Menu background is still referenced.');
assert(api.getCardDefs().health_potion.forgeable === true, 'Health Potion is not Forgeable.');
assert(api.getCardDefs().mana_potion.forgeable === true, 'Mana Potion is not Forgeable.');
assert(api.getCardDefs().remedy.forgeable === true, 'Remedy is not Forgeable.');
assert(api.cardStats('health_potion:bronze', 1).heal === 30, 'Bronze Health Potion is not 30 HP.');
assert(api.cardStats('health_potion:silver', 1).heal === 60, 'Silver Health Potion is not 60 HP.');
assert(api.cardStats('health_potion:gold', 1).heal === 100, 'Gold Health Potion is not 100 HP.');
assert(api.cardStats('mana_potion:bronze', 1).mana === 20, 'Bronze Mana Potion is not 20 MP.');
assert(api.cardStats('mana_potion:silver', 1).mana === 40 && api.cardStats('mana_potion:silver', 1).draw === 1, 'Silver Mana Potion is not 40 MP + draw 1.');
assert(api.cardStats('mana_potion:gold', 1).mana === 80 && api.cardStats('mana_potion:gold', 1).draw === 1, 'Gold Mana Potion is not 80 MP + draw 1.');
assert(api.cardStats('remedy:silver', 1).statusWardTurns === 1, 'Silver Remedy status protection is missing.');
assert(api.cardStats('remedy:gold', 1).heal === 50 && api.cardStats('remedy:gold', 1).statusWardTurns === 1, 'Gold Remedy is not Heal 50 + status protection.');
assert(api.cardAsset('health_potion:silver').includes('/silver/health_potion.webp'), 'Silver Health Potion art is not live.');
assert(api.cardAsset('mana_potion:gold').includes('/gold/mana_potion.webp'), 'Gold Mana Potion art is not live.');
assert(api.cardAsset('remedy:gold').includes('/gold/remedy.webp'), 'Gold Remedy art is not live.');
assert(fs.existsSync(path.join(project, 'assets/cards/silver/health_potion.webp')), 'Silver Health Potion file is missing.');
assert(fs.existsSync(path.join(project, 'assets/cards/gold/remedy.webp')), 'Gold Remedy file is missing.');
assert(fs.readdirSync(path.join(project, 'assets/cards/bronze')).filter(name => name.endsWith('.webp')).length >= 45, 'Not all supplied unique Bronze card art was ingested.');
assert(fs.statSync(path.join(project, 'assets/cards/bronze/sword_strike.webp')).size > 0, 'Bronze Sword Strike art is empty/broken.');
assert(!html.includes('class="menu-xp"'), 'XP is still displayed on the main Menu.');
assert(html.includes('<option value="gold">GOLD</option>'), 'Gold rank filter is missing from Equipment.');
assert(/equipmentSort[^]*MAGE[^]*KNIGHT[^]*WARRIOR[^]*HEALER/.test(html), 'Hero sort options are missing from Equipment.');
const starterDefs = api.getStarterDecks();
['mage','knight','warrior','healer'].forEach(hero => {
  assert(Object.values(starterDefs[hero].cards).reduce((a,b)=>a+b,0) === 20, `${hero} starter deck is not 20 cards.`);
  Object.keys(starterDefs[hero].cards).forEach(id => assert(api.getCardDefs()[id], `${hero} starter card ${id} has no gameplay definition.`));
});
assert(Object.keys(api.getCardDefs()).length === 45, 'The complete 45-card Bronze definition set is not loaded.');

// V15 regression: purchased starters become real playable Hero decks with independent Level/XP.
api.getSave().silver = 20;
api.buyStarterDeck('mage');
assert(api.getSave().starterDecks.mage >= 1, 'Mage starter purchase did not unlock Mage.');
assert((api.getSave().owned['magic_bolt:bronze'] || 0) >= 3, 'Mage starter cards were not added to the global collection.');
assert(Object.values(api.getSave().heroDecks.mage).reduce((a,b)=>a+b,0) === 20, 'Mage starter deck was not initialized as a 20-card active deck.');
api.switchActiveHero('mage');
assert(api.getSave().activeHero === 'mage', 'Equipment did not switch the active Hero to Mage.');
api.startBattle();
assert(api.getBattle().hero.id === 'mage', 'Starting Battle after switching decks still launched Knight instead of Mage.');
assert(api.getBattle().deck.length + api.getBattle().hand.length + api.getBattle().discard.length === 20, 'Mage battle did not use the purchased 20-card Mage starter deck.');
api.escapeBattle();
api.awardHeroXp(99);
assert(api.getSave().heroProgress.mage.xp === 99 && api.getSave().heroProgress.knight.xp === 0, 'Hero XP is not tracked independently.');
api.switchActiveHero('knight');

// No potion Forge level gate yet: Level 1 may merge all the way upward if enough copies and currency exist.
api.getSave().heroProgress.knight.xp = 0;
api.getSave().bronze = 1200;
api.getSave().silver = 5;
api.getSave().owned['health_potion:bronze'] = 4;
api.getSave().heroDecks.knight['health_potion:bronze'] = 0;
const bronzeBeforePotionSilver = api.getSave().bronze;
api.selectForgeCard('health_potion:bronze');
api.completeForge();
assert(api.getSave().bronze === bronzeBeforePotionSilver - 100, 'Bronze Potion → Silver Forge did not charge 100 Bronze.');
assert(api.getSave().owned['health_potion:silver'] >= 1, 'Level 1 could not Forge Bronze Health Potions into Silver.');
elements.get('forgeResultClose').click();
api.getSave().owned['health_potion:silver'] = 3;
api.getSave().heroDecks.knight['health_potion:silver'] = 0;
const bronzeBeforePotionGold = api.getSave().bronze;
const silverBeforePotionGold = api.getSave().silver;
api.selectForgeCard('health_potion:silver');
api.completeForge();
assert(api.getSave().bronze === bronzeBeforePotionGold - 500 && api.getSave().silver === silverBeforePotionGold - 1, 'Silver → Gold Forge did not charge 500 Bronze + 1 Silver.');
assert(api.getSave().owned['health_potion:gold'] >= 1, 'Level 1 could not Forge Silver Health Potions into Gold. A Forge level gate was added by mistake.');
elements.get('forgeResultClose').click();
// Restore the starter deck potion copies after the isolated Forge test.
api.getSave().owned['health_potion:bronze'] = 2;
api.getSave().heroDecks.knight['health_potion:bronze'] = 2;

// Booster potion drops are 1/50 per eligible slot, with Silver at LV50 and Gold at LV100.
const originalRandom = context.Math.random;
let randomSequence = [];
context.Math.random = () => randomSequence.length ? randomSequence.shift() : 0.5;
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:1,xp:0}; // Level 1
randomSequence = [0.5, 0.0, 0.0]; // Bronze rank, potion hit, Health Potion
assert(api.drawPackCard('booster3', 0) === 'health_potion:bronze', 'Level 1 potion hit did not produce a Bronze potion.');
randomSequence = [0.0, 0.0]; // guaranteed Silver slot: potion roll + Health if allowed
assert(!api.drawPackCard('booster5', 0).includes('potion:silver'), 'Silver potion appeared before Hero Level 50.');
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:50,xp:0}; // Level 50
randomSequence = [0.0, 0.0];
assert(api.drawPackCard('booster5', 0) === 'health_potion:silver', 'Silver potion did not unlock at Hero Level 50.');
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:100,xp:0}; // Level 100
randomSequence = [0.005, 0.0, 0.0]; // Gold rank, potion hit, Health Potion
assert(api.drawPackCard('booster5', 1) === 'health_potion:gold', 'Gold potion did not unlock at Hero Level 100.');
context.Math.random = originalRandom;
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:1,xp:0};
assert(/Math\.random\(\) < \(1 \/ 50\)/.test(source), 'Potion booster odds are not explicitly 1 in 50.');

// V14 regression: enemy HP/Mana growth, Forge fees, and Bronze/Silver exchange.
assert(elements.get('shopExchangeBtn'), 'Shop Bronze/Silver Exchange button is missing.');
clickGo('merchant');
elements.get('shopExchangeBtn').click();
assert(elements.get('shopProductOverlay').classList.contains('show'), 'Exchange button did not open the Shop overlay.');
assert(elements.get('shopProductBody').innerHTML.includes('500 BRONZE → 1 SILVER'), 'Bronze → Silver exchange rate is not shown as 500:1.');
elements.get('shopProductClose').click();
api.getSave().bronze = 1000; api.getSave().silver = 2;
assert(api.exchangeBronzeForSilver() === true, '500 Bronze could not be converted into 1 Silver.');
assert(api.getSave().bronze === 500 && api.getSave().silver === 3, 'Bronze → Silver exchange changed the wrong balances.');
assert(api.exchangeSilverForBronze() === true, '1 Silver could not be converted back into Bronze.');
assert(api.getSave().bronze === 1000 && api.getSave().silver === 2, 'Silver → Bronze exchange changed the wrong balances.');
assert(api.forgeCostFor('sword_strike:bronze').bronze === 100, 'Normal Bronze → Silver Forge cost is not 100 Bronze.');
assert(api.forgeCostFor('executioners_swing:bronze').bronze === 150, 'Finisher Bronze → Silver Forge cost is not 150 Bronze.');
assert(api.forgeCostFor('sword_strike:silver').bronze === 500 && api.forgeCostFor('sword_strike:silver').silver === 1, 'Silver → Gold Forge cost is not 500 Bronze + 1 Silver.');
const level25Scout = api.scaleEncounterForLevel(api.getEncounterConfig().encounters.goblin_scout, 25);
assert(level25Scout.hp === 280 && level25Scout.mp === 52, `Level 25 Goblin Scout scaling is wrong: ${level25Scout.hp} HP / ${level25Scout.mp} MP.`);
Object.values(api.getEncounterConfig().encounters).forEach(encounter => {
  const scaled = api.scaleEncounterForLevel(encounter, 25);
  assert(scaled.hp > encounter.hp && scaled.mp > encounter.mp && scaled.damageMin > encounter.damageMin, `${encounter.name} is not scaling HP, Mana, and attack at Level 25.`);
});

// V13 regression: escalating per-level XP, Study, sorting UI and combat presentation hooks.
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:1,xp:0};
assert(api.xpNeededForLevel(1) === 100 && api.xpNeededForLevel(2) === 200 && api.xpNeededForLevel(3) === 300, 'XP requirement is not 100/200/300 by level.');
api.awardHeroXp(100);
assert(api.getSave().heroProgress.knight.level === 2 && api.getSave().heroProgress.knight.xp === 0, 'Level 1 did not reset XP to 0 after reaching 100 XP.');
api.awardHeroXp(199);
assert(api.getSave().heroProgress.knight.level === 2 && api.getSave().heroProgress.knight.xp === 199, 'Level 2 XP progress is not stored within the current level.');
api.awardHeroXp(1);
assert(api.getSave().heroProgress.knight.level === 3 && api.getSave().heroProgress.knight.xp === 0, 'Level 2 did not reset XP to 0 after reaching 200 XP.');
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:1,xp:90};
api.awardHeroXp(30);
assert(api.getSave().heroProgress.knight.level === 2 && api.getSave().heroProgress.knight.xp === 0, 'Excess XP carried into the next level instead of resetting to 0.');
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:1,xp:0};
assert(elements.get('studyEnemyBtn'), 'Study Enemy skill button is missing near the enemy meters.');
assert(elements.get('equipmentSort') && elements.get('forgeSort'), 'Equipment/Forge sort controls are missing.');
assert(elements.get('levelUpOverlay'), 'Animated Level Up overlay is missing.');
assert(/status-burst\.poison/.test(css) && /status-burst\.bleed/.test(css) && /status-burst\.stagger/.test(css), 'Status continuation animations are missing.');
assert(/battle-card-fx/.test(css) && /finisher-shake/.test(css), 'Battle card/Finisher presentation effects are missing.');
assert(/heal-progress-fill/.test(css), 'Healer countdown color progress bar CSS is missing.');

// Study sacrifices the Skill action and reveals exactly three planned enemy turns once per battle.
api.startBattle();
api.skipBoostPhase();
assert(api.getBattle().phase === 'attack', 'Study setup did not reach the Skill phase.');
api.studyEnemy();
assert(api.getBattle().study.used === true && api.getBattle().study.queue.length === 3, 'Study did not reveal three planned enemy turns.');
assert(api.getBattle().phase === 'end' && api.getBattle().locked, 'Study did not consume the Skill action.');

// Goblin King Royal Fury at half HP: +35% art state, +15% attack baseline, Inventory and scaling Club.
let furyBattle = api.getBattle();
furyBattle.enemy.id = 'goblin_king'; furyBattle.enemy.name = 'Goblin King'; furyBattle.enemy.maxHp = 100; furyBattle.enemy.hp = 50; furyBattle.enemy.maxMp = 40; furyBattle.enemy.mp = 40; furyBattle.enemy.phase2 = false; furyBattle.enemy.baseAttackBonus = 1; furyBattle.study.queue = [];
assert(api.checkGoblinKingPhaseTwo() === true, 'Goblin King did not enter Royal Fury at 50% HP.');
assert(furyBattle.enemy.phase2 && furyBattle.enemy.baseAttackBonus === 1.15, 'Royal Fury attack boost is not 15%.');
assert(elements.get('battleEnemy').classList.contains('royal-fury'), 'Royal Fury did not apply the enlarged Goblin King state.');
const fury = api.getGoblinKingFury();
assert(fury.boosts.some(move => move.name === 'Inventory'), 'Goblin King phase 2 is missing Inventory.');
const club = fury.skills.find(move => move.name === "Goblin's Club");
assert(club && club.status === 'stun' && club.statusChance === .60 && club.costPctMaxMana === .25, 'Goblin Club rules are not 60% Stun and 25% max Mana.');
const clubMpBefore = furyBattle.enemy.mp;
api.runEnemySkill(club);
assert(furyBattle.enemy.mp === clubMpBefore - 10, 'Goblin Club did not spend 25% of a 40-Mana pool.');
assert(furyBattle.enemy.goblinClubUses === 1, 'Goblin Club did not begin its +20% per-use scaling counter.');

const baseWolfReward = api.rollBattleRewards({ ...api.getEncounterConfig().encounters.wolf, level: 10, isAvenger:false });
const avengerWolfReward = api.rollBattleRewards({ ...api.getEncounterConfig().encounters.wolf, level: 10, isAvenger:true });
assert(avengerWolfReward.silver >= 1, 'Avenger victory is not guaranteeing bonus Silver.');
assert(avengerWolfReward.bronzeRange[0] > baseWolfReward.bronzeRange[0], 'Avenger Bronze rewards are not boosted.');

clickGo('equipment');
let swordStrikeOwnedButton = document.querySelectorAll('[data-owned-card]').find(button => button.dataset.ownedCard === 'sword_strike:bronze');
assert(swordStrikeOwnedButton, 'Sword Strike is not exposed as a mouse-clickable Equipment card.');
swordStrikeOwnedButton.click();
elements.get('cardModalSecondary').click();
assert(api.getSave().heroDecks.knight['sword_strike:bronze'] === 2, 'Equipment did not remove one deck copy.');
swordStrikeOwnedButton = document.querySelectorAll('[data-owned-card]').find(button => button.dataset.ownedCard === 'sword_strike:bronze');
swordStrikeOwnedButton.click();
elements.get('cardModalAction').click();
assert(api.getSave().heroDecks.knight['sword_strike:bronze'] === 3, 'Equipment did not add one deck copy.');

clickGo('battle');
let battle = api.getBattle();
assert(battle && battle.hand.length === 5, 'Battle did not draw a five-card opening hand.');
assert(battle.deck.length + battle.hand.length + battle.discard.length === 20, 'Battle did not use the V4 twenty-card Knight starter deck.');
assert(['normal','special'].includes(battle.enemy.kind), 'A fresh battle should start in the normal encounter cycle.');
assert(elements.get('battleEnemy').src.includes('assets/enemies/'), 'Random battle enemy art was not applied.');
assert(api.getEncounterConfig().coinCarrierChance === 0.08, 'Coin Carrier special encounter chance is not 8%.');
assert(api.getEncounterConfig().normal.length === 10, 'Normal encounter pool should contain 10 enemies.');
assert(api.getEncounterConfig().avengerChance === 0.05, 'Avenger encounter chance is not 5%.');
for (let i = 0; i < 300; i += 1) {
  const rolled = api.prepareEncounter(api.getEncounterConfig().encounters.wolf);
  const delta = rolled.level - api.getBattle().hero.level;
  assert((delta >= 1 && delta <= 3) || (rolled.isAvenger && delta === 10), 'Prepared enemy level is outside the +1 to +3 / +10 Avenger rule.');
}
assert(/OWNED \${save\.owned\[key\]/.test(source) || /OWNED \${save\.owned/.test(source), 'Owned copy counts are not rendered in the card lists.');

clickGo('heal');
assert(api.getScreen() === 'heal', 'Heal menu tile did not open the Healers room.');
let knightVitals = api.ensureHeroVitals('knight');
knightVitals.hp = Math.max(1, knightVitals.maxHp - 40);
knightVitals.mp = Math.max(0, knightVitals.maxMp - 20);
assert(api.startHealing(0, 'knight') === true, 'Knight did not enter recovery bed 1.');
assert(api.getSave().healingSlots[0].duration === 30000, 'First active healing deck is not using a 30-second timer.');
api.getSave().starterDecks.mage = 1;
let mageVitals = api.ensureHeroVitals('mage');
mageVitals.hp = Math.max(1, mageVitals.maxHp - 20);
mageVitals.mp = Math.max(0, mageVitals.maxMp - 10);
assert(api.startHealing(1, 'mage') === true, 'Second deck did not enter recovery bed 2.');
assert(api.getSave().healingSlots[1].duration === 60000, 'Second simultaneously healing deck is not using a 60-second timer.');
api.completeHealingJobs(Date.now() + 70000);
assert(api.ensureHeroVitals('knight').hp === api.ensureHeroVitals('knight').maxHp, 'Healers did not restore Knight Health to full.');
assert(api.ensureHeroVitals('knight').mp === api.ensureHeroVitals('knight').maxMp, 'Healers did not restore Knight Mana to full.');
api.getSave().starterDecks.mage = 0;
clickGo('menu');

assert(elements.get('menuSilver'), 'Silver is not visible in the Menu header next to Bronze.');
assert(/\.menu-silver\s*\{[^}]*left:\s*764px;/s.test(css), 'Silver currency box is not positioned beside Bronze on the Menu.');
const enemyMovesets = api.getEnemyMovesets();
assert(Object.keys(enemyMovesets).length === 16, 'Every supplied enemy does not have an enemy move set.');
assert(enemyMovesets.spider.boosts.some(move => move.name === 'Venom Coat'), 'Spider is missing its Venom Coat boost.');
assert(enemyMovesets.spider.skills.some(move => move.status === 'poison'), 'Spider is missing Poison special attacks.');
assert(enemyMovesets.owlbear.skills.some(move => move.special && move.name === 'Maul'), 'Owlbear is missing its Maul special attack.');
assert(enemyMovesets.goblin_king.boostChance >= .5 && enemyMovesets.goblin_king.skills.some(move => move.special), 'Goblin King is missing boss boost/special behavior.');
assert(enemyMovesets.mirror_knight.skills.some(move => move.name === "Executioner's Swing"), 'Rival Knight is missing its hero finisher.');
assert(enemyMovesets.mirror_mage.skills.some(move => move.name === 'Fireball'), 'Rival Mage is missing Fireball.');
assert(enemyMovesets.mirror_warrior.boosts.some(move => move.name === 'Adrenaline Rush'), 'Rival Warrior is missing Adrenaline Rush.');
assert(enemyMovesets.mirror_healer.boosts.some(move => move.name === 'Prayer Focus'), 'Rival Healer is missing Prayer Focus.');
assert(/ENEMY BOOST/.test(source) && /ENEMY SPECIAL/.test(source), 'Enemy Boost/Special phase feedback is missing.');

api.startBattle();
let aiBattle = api.getBattle();
const rageMove = enemyMovesets.mirror_warrior.boosts.find(move => move.name === 'Adrenaline Rush');
aiBattle.enemy.id = 'mirror_warrior';
const enemyHpBeforeRage = aiBattle.enemy.hp;
api.runEnemyBoost(rageMove);
assert(aiBattle.enemy.attackMultiplier > 1, 'Enemy Boost did not power up the next attack.');
assert(aiBattle.enemy.hp < enemyHpBeforeRage, 'Adrenaline Rush did not pay its HP cost.');
const doubleStrike = enemyMovesets.mirror_warrior.skills.find(move => move.name === 'Double Strike');
aiBattle.enemy.mp = aiBattle.enemy.maxMp = 30;
const heroHpBeforeEnemySkill = aiBattle.hero.hp;
api.runEnemySkill(doubleStrike);
assert(aiBattle.hero.hp < heroHpBeforeEnemySkill, 'Enemy Skill/Special did not damage the hero.');
assert(aiBattle.enemy.mp === 20, 'Enemy special attack did not spend Mana.');
assert((battle.enemy.level >= 2 && battle.enemy.level <= 4) || (battle.enemy.isAvenger && battle.enemy.level === 11), 'Level 1 player did not receive a +1 to +3 enemy or +10 Avenger.');
assert(api.getEncounterConfig().encounters.goblin_coin_carrier.bronze[0] === 200 && api.getEncounterConfig().encounters.goblin_coin_carrier.bronze[1] === 600, 'Coin Carrier Bronze jackpot is not 200-600.');
assert(api.getEncounterConfig().encounters.goblin_coin_carrier.silver[0] === 2 && api.getEncounterConfig().encounters.goblin_coin_carrier.silver[1] === 3, 'Coin Carrier Silver drop is not 2-3.');
assert(/else if \(battle\.enemy\.kind === 'normal'\) save\.stats\.normalWinsSinceBoss/.test(source), 'Special Coin Carrier wins incorrectly advance the five-normal-win boss counter.');
assert(api.getEncounterConfig().encounters.goblin_king.silver[0] === 1 && api.getEncounterConfig().encounters.goblin_king.silver[1] === 2, 'Boss Silver drop is not 1-2.');
assert(api.getEncounterConfig().encounters.mirror_knight.silver[0] === 1 && api.getEncounterConfig().encounters.mirror_knight.silver[1] === 2, 'Hero Silver drop is not 1-2.');
assert(api.getEncounterConfig().encounters.owlbear.bronze[0] > api.getEncounterConfig().encounters.wolf.bronze[0], 'Owlbear should pay more Bronze than Wolf.');
assert(api.getEncounterConfig().encounters.spider.bronze[0] > api.getEncounterConfig().encounters.goblin_scout.bronze[0], 'Spider status-effect difficulty is not reflected in Bronze rewards.');
const level10Wolf = api.scaleEncounterForLevel(api.getEncounterConfig().encounters.wolf, 10);
assert(level10Wolf.level === 10 && level10Wolf.hp > api.getEncounterConfig().encounters.wolf.hp, 'Enemy stats do not scale upward with player level.');
const level10Knight = api.knightStatsForLevel(10);
assert(level10Knight.hp > 120 && level10Knight.mp > 50, 'Knight battle stats do not scale with Hero Level.');
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:10,xp:0};
api.startBattle();
assert(api.getBattle().hero.level === 10, 'Hero Level did not update to 10.');
assert((api.getBattle().enemy.level >= 11 && api.getBattle().enemy.level <= 13) || (api.getBattle().enemy.isAvenger && api.getBattle().enemy.level === 20), 'Level 10 player did not receive a +1 to +3 enemy or +10 Avenger.');
assert(elements.get('enemyName').textContent.includes(`LV. ${api.getBattle().enemy.level}`), 'Battle UI is not displaying the scaled enemy level.');
api.getSave().activeHero = 'knight'; api.getSave().heroProgress.knight = {level:1,xp:0};
api.getSave().stats.normalWinsSinceBoss = 5;
api.startBattle();
assert(['boss','hero'].includes(api.getBattle().enemy.kind), 'Five normal-cycle wins did not force a Boss/Hero encounter.');
api.getSave().stats.normalWinsSinceBoss = 0;
api.startBattle();
battle = api.getBattle();
const boostIndex = battle.hand.findIndex(key => /iron_resolve|steady_stance|shield_up|health_potion|mana_potion|remedy/.test(key));
const skillIndex = battle.hand.findIndex(key => !/iron_resolve|steady_stance|shield_up|health_potion|mana_potion|remedy/.test(key));
assert(boostIndex >= 0 && skillIndex >= 0, 'Opening hand lacks a Boost or Skill card.');
const boostCardButton = document.querySelectorAll('[data-battle-card]').find(button => Number(button.dataset.battleCard) === boostIndex);
assert(boostCardButton, 'The playable Boost is not exposed as a mouse-clickable Battle card.');
boostCardButton.click();
assert(elements.get('cardModal').classList.contains('show'), 'Clicking a Battle card did not open its card panel.');
elements.get('cardModalAction').click();
assert(api.getBattle().phase === 'attack', 'Playing a Boost did not advance to the Skill phase.');

api.startBattle();
elements.get('skipBoostBtn').click();
assert(api.getBattle().phase === 'attack', 'Skip Boost did not advance to the Skill phase.');
elements.get('skipAttackBtn').click();
assert(api.getBattle().phase === 'end' && api.getBattle().locked, 'Skip Skill did not hand the turn to the enemy.');
elements.get('battleMenuBtn').click();
assert(api.getScreen() === 'menu', 'Escape did not return to Menu through its mouse click handler.');

api.startBattle();
api.getBattle().hero.hp = Math.max(1, api.getBattle().hero.maxHp - 33);
const persistedHp = api.getBattle().hero.hp;
api.escapeBattle();
assert(api.ensureHeroVitals('knight').hp === persistedHp, 'Battle damage did not persist after leaving an encounter.');
api.startBattle();
assert(api.getBattle().hero.hp === persistedHp, "The next battle did not start with the Knight's carried-over Health.");
api.escapeBattle();

api.getSave().stats.consecutiveWins = 4;
api.startBattle();
api.finishBattle(true);
assert(api.getSave().stats.caveOfferDue === true, 'Five successful fights in a row did not make the Cave offer due.');
api.promptCaveOffer();
assert(elements.get('confirmModal').classList.contains('show'), 'The Cave offer did not open a confirmation prompt.');
assert(elements.get('confirmTitle').textContent === 'Do you want to Enter the Cave?', 'The Cave prompt wording is incorrect.');
elements.get('confirmNo').click();
assert(api.getSave().stats.consecutiveWins === 0 && !api.getSave().stats.caveOfferDue, 'Declining the Cave did not reset the five-win offer streak.');

api.getSave().stats.caveOfferDue = true;
api.beginCave();
assert(api.getSave().cave.active && api.getBattle().caveActive, 'Accepting the Cave did not begin the four-fight gauntlet.');
assert(elements.get('battleMenuBtn').hidden === true, 'Escape is still visible during a Cave run.');
api.getSave().cave.fightIndex = 3;
api.startBattle();
assert(api.getBattle().enemy.id === 'goblin_king', 'The fourth Cave fight is not the Goblin King.');
assert(api.getBattle().enemy.level === api.getBattle().hero.level + 5, 'Cave Goblin King is not exactly five levels above the player.');
api.finishBattle(true);
assert(!api.getSave().cave.active, 'Defeating the Cave Goblin King did not complete the Cave run.');

const bronzeBeforePack = api.getSave().bronze;
const ownedBeforePack = Object.values(api.getSave().owned).reduce((sum, count) => sum + (count || 0), 0);
api.buyPack('booster3');
const ownedAfterPack = Object.values(api.getSave().owned).reduce((sum, count) => sum + (count || 0), 0);
assert(api.getSave().bronze === bronzeBeforePack - 250, '3-card booster did not debit 250 Bronze.');
assert(ownedAfterPack === ownedBeforePack + 3, '3-card booster did not add exactly three cards.');
assert(api.getSave().openedPacks.booster3 === 1, '3-card booster purchase count did not persist in save state.');
assert(elements.get('packRevealModal').classList.contains('show'), '3-card booster did not launch the card reveal effect.');
assert((elements.get('packRevealCardSpread').innerHTML.match(/data-pack-reveal=/g) || []).length === 3, '3-card booster reveal does not deal exactly three mystery cards.');
document.querySelectorAll('[data-pack-reveal]').forEach(button => button.click());
assert(!elements.get('packRevealFinishBtn').disabled, 'Reveal finish button did not unlock after all 3 cards were flipped.');
api.closePackReveal(false);

api.getSave().silver = 11;
const silverCardsBefore = Object.entries(api.getSave().owned).filter(([key]) => key.endsWith(':silver')).reduce((sum, [,count]) => sum + (count || 0), 0);
api.buyPack('booster5');
const silverCardsAfter = Object.entries(api.getSave().owned).filter(([key]) => key.endsWith(':silver')).reduce((sum, [,count]) => sum + (count || 0), 0);
assert(api.getSave().silver === 10, '5-card booster did not debit 1 Silver.');
assert(silverCardsAfter >= silverCardsBefore + 1, '5-card booster did not guarantee at least one Silver card.');
assert(api.getSave().openedPacks.booster5 === 1, '5-card booster purchase count did not persist in save state.');
assert((elements.get('packRevealCardSpread').innerHTML.match(/data-pack-reveal=/g) || []).length === 5, '5-card booster reveal does not deal exactly five mystery cards.');
api.closePackReveal(false);

const mageCopiesBeforeRepeat = api.getSave().starterDecks.mage || 0;
const mageBoltsBeforeRepeat = api.getSave().heroCollections.mage.magic_bolt || 0;
api.getSave().silver = 20;
api.buyStarterDeck('mage');
assert(api.getSave().starterDecks.mage === mageCopiesBeforeRepeat + 1, 'Mage starter deck purchase was not recorded.');
assert(api.getSave().heroCollections.mage.magic_bolt === mageBoltsBeforeRepeat + 3, 'Mage starter contents were not stored.');
api.getSave().silver = 10;
api.buyStarterDeck('mage');
assert(api.getSave().starterDecks.mage === mageCopiesBeforeRepeat + 2, 'Starter decks cannot be purchased repeatedly.');
assert(api.getSave().heroCollections.mage.magic_bolt === mageBoltsBeforeRepeat + 6, 'Repeated starter purchase did not add another full deck copy.');

// V16 identity / audio / battle-presentation regression checks.
assert(html.includes('id="menuForgeLogo"') && !html.includes('<div class="menu-brand"><h1>RPCG</h1>'), 'Main menu did not replace the old RPCG text with the forged logo.');
assert(html.includes('id="musicVolume"') && html.includes('id="sfxVolume"'), 'Main-menu Music/Sound sliders are missing.');
assert(css.includes("assets/cards/rpcg_card_back.jpg"), 'Booster mystery cards are not using the new RPCG card back.');
[
  'assets/cards/rpcg_card_back.jpg',
  'assets/ui/rpcg_forge_logo.png',
  'assets/audio/bazaar_market_loop.mp3',
  'assets/characters/mage.webp',
  'assets/characters/warrior.webp',
  'assets/characters/healer.webp',
  'assets/heroes/mage_card.webp',
  'assets/heroes/knight_card.webp',
  'assets/heroes/warrior_card.webp',
  'assets/heroes/healer_card.webp'
].forEach(rel => {
  const full = path.join(project, rel);
  assert(fs.existsSync(full) && fs.statSync(full).size > 0, `V16 asset is missing or empty: ${rel}`);
});
assert(api.heroActionMarkup('fireball:bronze').type === 'fire', 'Fireball is not mapped to fire projectile VFX.');
assert(api.heroActionMarkup('ice_shards:bronze').type === 'ice', 'Ice Shards are not mapped to ice shard VFX.');
assert(api.heroActionMarkup('chain_lightning:bronze').type === 'lightning', 'Chain Lightning is not mapped to lightning VFX.');
assert(api.heroActionMarkup('light_strike:bronze').type === 'holy', 'Healer attacks are not mapped to holy-light VFX.');
assert(api.heroActionMarkup('sword_strike:bronze').type === 'slash', 'Knight attacks are not mapped to slash VFX.');
assert(api.heroActionMarkup('executioners_swing:bronze').type === 'finisher', 'Knight Finisher is not mapped to heavy finisher VFX.');
api.setMusicVolume(33);
api.setSfxVolume(61);
assert(Math.abs(api.getSave().audio.music - .33) < .001 && Math.abs(api.getSave().audio.sfx - .61) < .001, 'Audio slider values did not persist into save data.');

console.log('RPCG 1080×1920 portrait DOM and mouse interaction smoke test passed.');

// V18 regression: stable Battle hover, cleaner Battle HUD/prompts, visible Study, larger exchange.
assert(!html.includes('id="battleHeroLevelBox"'), 'Redundant Hero level badge is still present on Battle.');
assert(html.includes('Choose a Boost Card or Skip Phase.'), 'Boost Phase helper does not tell the player they can skip.');
assert(source.includes("Choose a Skill Card or Skip Phase."), 'Skill Phase helper does not tell the player they can skip.');
assert(/\.battle-screen \.hand-card-slot\s*\{/.test(css), 'Stable Battle hand-card hover slot CSS is missing.');
assert(/hand-card-slot:not\(\.disabled\):hover \.hand-card/.test(css), 'Battle card enlargement is not driven by the stable hover slot.');
assert(/#studyEnemyBtn\s*\{[\s\S]*?#78ff83/.test(css), 'Study Enemy is not using the neon-green treatment.');
assert(/\.shop-exchange-button\s*\{[\s\S]*?bottom:\s*520px\s*!important;[\s\S]*?width:\s*390px\s*!important;/m.test(css), 'Shop exchange was not moved higher and enlarged.');
console.log('RPCG V18 polish regression checks passed.');
