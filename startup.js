(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const intro = $('startupIntro');
  const nerdy = $('nerdyIntroStage');
  const splash = $('gameSplashStage');
  const forge = $('forgeIntroStage');
  const embark = $('embarkButton');

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
    nerdy.classList.add('exit');
    window.setTimeout(() => {
      setStage(splash);
      try { embark.focus({ preventScroll: true }); } catch (_) {}
    }, 410);
  }

  function finishIntro() {
    intro.classList.add('intro-finished');
    intro.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => intro.remove(), 760);
  }

  function runForgeReveal() {
    setStage(forge);
    window.setTimeout(() => forge.classList.add('hammer-ready'), 90);
    window.setTimeout(() => forge.classList.add('hammer-strike'), 790);
    window.setTimeout(() => forge.classList.add('impact'), 1010);
    window.setTimeout(() => {
      forge.classList.remove('impact');
      forge.classList.add('breathe');
    }, 1460);
    // 2.5 second breathing zoom before the menu is revealed.
    window.setTimeout(finishIntro, 3960);
  }

  function embarkGame() {
    if (hasEmbarked) return;
    hasEmbarked = true;
    embark.disabled = true;
    splash.classList.add('embarking');
    window.setTimeout(runForgeReveal, 500);
  }

  embark.addEventListener('click', embarkGame);
  window.setTimeout(showSplash, 1450);
})();
