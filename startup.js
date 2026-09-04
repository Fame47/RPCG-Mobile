(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const intro = $('startupIntro');
  const nerdy = $('nerdyIntroStage');
  const splash = $('gameSplashStage');
  const forge = $('forgeIntroStage');
  const embark = $('embarkButton');
  const pyro = $('forgeIntroPyro');

  if (!intro || !nerdy || !splash || !forge || !embark) return;

  let hasEmbarked = false;

  function setStage(stage) {
    [nerdy, splash, forge].forEach(el => {
      const active = el === stage;
      el.classList.toggle('active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
  }

  function showSplash() {
    nerdy.classList.add('tv-out');
    window.setTimeout(() => {
      setStage(splash);
      try { embark.focus({ preventScroll: true }); } catch (_) {}
    }, 660);
  }

  function finishIntro() {
    intro.classList.add('intro-finished');
    intro.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => intro.remove(), 760);
  }

  function getIntroSfxVolume() {
    try {
      const save = JSON.parse(localStorage.getItem('rpcgPortraitCardGameV3') || '{}');
      if (save?.audio?.muted) return 0;
      const value = Number(save?.audio?.sfx);
      return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .75;
    } catch (_) {
      return .75;
    }
  }

  let introSfxContext = null;
  function playForgeCling() {
    const volume = getIntroSfxVolume();
    if (volume <= 0) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!introSfxContext) introSfxContext = new AudioCtx();
      const ctx = introSfxContext;
      if (ctx.state === 'suspended') ctx.resume?.().catch?.(() => {});
      const now = ctx.currentTime;

      // Bright forged-metal CLING: a few inharmonic partials with fast attack
      // and staggered decay so it reads as a hammer striking metal.
      const partials = [1540, 2310, 3175, 4180];
      partials.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index % 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * .93, now + .32 + index * .04);
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime((.105 - index * .014) * volume, now + .004);
        gain.gain.exponentialRampToValueAtTime(.0001, now + .42 + index * .07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + .56 + index * .07);
      });

      // Tiny low metal body underneath the high ring.
      const body = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(310, now);
      body.frequency.exponentialRampToValueAtTime(190, now + .14);
      bodyGain.gain.setValueAtTime(.0001, now);
      bodyGain.gain.exponentialRampToValueAtTime(.11 * volume, now + .003);
      bodyGain.gain.exponentialRampToValueAtTime(.0001, now + .18);
      body.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      body.start(now);
      body.stop(now + .2);
    } catch (_) {}
  }

  function shakeThroughSettle() {
    if (!intro.animate) return;
    intro.animate([
      { transform:'translate(0,0) rotate(0deg)' },
      { transform:'translate(-18px,8px) rotate(-.35deg)' },
      { transform:'translate(16px,-10px) rotate(.32deg)' },
      { transform:'translate(-14px,7px) rotate(-.28deg)' },
      { transform:'translate(12px,-7px) rotate(.24deg)' },
      { transform:'translate(-10px,6px) rotate(-.20deg)' },
      { transform:'translate(9px,-5px) rotate(.17deg)' },
      { transform:'translate(-7px,4px) rotate(-.14deg)' },
      { transform:'translate(6px,-4px) rotate(.11deg)' },
      { transform:'translate(-5px,3px) rotate(-.09deg)' },
      { transform:'translate(4px,-2px) rotate(.07deg)' },
      { transform:'translate(-3px,2px) rotate(-.05deg)' },
      { transform:'translate(2px,-1px) rotate(.03deg)' },
      { transform:'translate(0,0) rotate(0deg)' }
    ], {
      duration: 930,
      easing: 'linear',
      fill: 'none'
    });
  }

  function burstPyro() {
    if (!pyro) return;
    pyro.replaceChildren();
    pyro.classList.add('bursting');

    const flash = document.createElement('b');
    flash.className = 'forge-pyro-flash';
    pyro.appendChild(flash);

    if (flash.animate) {
      flash.animate([
        { opacity:0, transform:'translate(-50%,-50%) scale(.12)' },
        { opacity:1, transform:'translate(-50%,-50%) scale(1.25)', offset:.12 },
        { opacity:.72, transform:'translate(-50%,-50%) scale(.9)', offset:.45 },
        { opacity:0, transform:'translate(-50%,-50%) scale(1.75)' }
      ], { duration:620, easing:'ease-out', fill:'forwards' });
    }

    const count = 54;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('i');
      particle.className = 'forge-pyro-particle';
      const angle = (360 / count) * i + (Math.random() * 12 - 6);
      const distance = 170 + Math.random() * 285;
      const length = 34 + Math.random() * 84;
      const width = 3 + Math.random() * 6;
      const delay = Math.random() * 55;
      particle.style.width = `${width}px`;
      particle.style.height = `${length}px`;
      particle.style.transform = `rotate(${angle}deg) translateY(-6px) scaleY(.22)`;
      pyro.appendChild(particle);

      if (particle.animate) {
        particle.animate([
          { opacity:0, transform:`rotate(${angle}deg) translateY(-6px) scaleY(.18)` },
          { opacity:1, transform:`rotate(${angle}deg) translateY(-20px) scaleY(.9)`, offset:.10 },
          { opacity:1, transform:`rotate(${angle}deg) translateY(${-distance * .74}px) scaleY(1.08)`, offset:.62 },
          { opacity:0, transform:`rotate(${angle}deg) translateY(${-distance}px) scaleY(.34)` }
        ], {
          duration: 620 + Math.random() * 260,
          delay,
          easing:'cubic-bezier(.12,.72,.18,1)',
          fill:'forwards'
        });
      }
    }

    window.setTimeout(() => {
      pyro.classList.remove('bursting');
      pyro.replaceChildren();
    }, 1050);
  }

  function runForgeReveal() {
    setStage(forge);
    forge.classList.remove('hammer-ready', 'hammer-strike', 'impact', 'swap-full', 'full-shown', 'breathe');

    window.setTimeout(() => forge.classList.add('hammer-ready'), 90);
    window.setTimeout(() => forge.classList.add('hammer-strike'), 790);

    // Impact: base reveal, visible pyro burst, and a shake that continues
    // through the full-logo handoff so the transition is hidden by motion.
    window.setTimeout(() => {
      forge.classList.add('impact');
      playForgeCling();
      shakeThroughSettle();
      burstPyro();
    }, 1010);

    // Bring in the finished logo BEFORE hiding the struck component layers.
    // That overlap removes the black gap that appeared in V30.
    window.setTimeout(() => {
      forge.classList.add('full-shown');
    }, 1360);

    window.setTimeout(() => {
      forge.classList.add('swap-full');
      forge.classList.remove('impact');
    }, 1510);

    // The shake finishes just before the slow 2.5 second breathing zoom.
    window.setTimeout(() => {
      forge.classList.add('breathe');
    }, 1840);

    window.setTimeout(finishIntro, 4340);
  }

  function embarkGame() {
    if (hasEmbarked) return;
    hasEmbarked = true;
    embark.disabled = true;
    splash.classList.add('embarking');
    window.setTimeout(runForgeReveal, 500);
  }

  embark.addEventListener('click', embarkGame);
  window.setTimeout(showSplash, 3000);
})();
