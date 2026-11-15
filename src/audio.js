const toggles = document.querySelectorAll('.sound-toggle');
const music = document.querySelector('#studio-music');
const musicCredit = document.querySelector('#music-credit');
const rain = document.querySelector('#studio-rain');
const computer = document.querySelector('#computer');
const ambience = [music, rain];
// Click recording by Darklanlan, CC0 1.0, from Wikimedia Commons (Computer mouse single click.ogg).
const footsteps = ['footstep-1', 'footstep-2', 'footstep-3', 'footstep-4'];
const samples = ['click-desk', ...footsteps, 'chair-sit', 'chair-stand', 'coffee-brew'];
const effects = new Map();
const activeEffects = new Set();

let enabled = false;
let playbackAttempt = 0;
let context;
let previousStep = -1;

function updateToggles(tooltip) {
  musicCredit.hidden = !enabled;
  for (const toggle of toggles) {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = tooltip;
  }
}

function playEffect(name, volume, rate = 1) {
  if (!enabled || context?.state !== 'running' || !effects.has(name)) return;
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = effects.get(name);
  source.playbackRate.value = rate;
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  activeEffects.add(source);
  source.addEventListener('ended', () => {
    activeEffects.delete(source);
    source.disconnect();
    gain.disconnect();
  }, { once: true });
  source.start();
}

export function playFootstep(onRug) {
  const choices = footsteps.length - 1;
  previousStep = (previousStep + 1 + Math.floor(Math.random() * choices)) % footsteps.length;
  playEffect(footsteps[previousStep], onRug ? 0.25 : 0.53, 0.97 + Math.random() * 0.06);
}

export function playChair(standing) {
  playEffect(standing ? 'chair-stand' : 'chair-sit', 0.72);
}

export function playCoffeeBrew() {
  playEffect('coffee-brew', 0.3);
}

async function prepareEffects() {
  if (!context) {
    context = new AudioContext();
    for (const [track, level] of [[music, 0.23], [rain, 0.028]]) {
      const gain = context.createGain();
      gain.gain.value = level;
      context.createMediaElementSource(track).connect(gain).connect(context.destination);
    }
  }
  await context.resume();
  await Promise.all(samples.map(async name => {
    if (effects.has(name)) return;
    const response = await fetch(import.meta.env.BASE_URL + 'studio-' + name + '.mp3');
    if (!response.ok) throw new Error('Studio sound could not load');
    effects.set(name, await context.decodeAudioData(await response.arrayBuffer()));
  }));
}

function stopSound() {
  for (const audio of ambience) audio.pause();
  for (const source of activeEffects) source.stop();
  activeEffects.clear();
}

async function toggleSound() {
  enabled = !enabled;
  const attempt = ++playbackAttempt;
  updateToggles(enabled ? 'Mute sound' : 'Turn sound on');

  if (!enabled) {
    stopSound();
    return;
  }

  try {
    await Promise.all([...ambience.map(audio => audio.play()), prepareEffects()]);
  } catch {
    if (attempt !== playbackAttempt) return;
    enabled = false;
    stopSound();
    updateToggles('Retry sound');
  }
}

for (const toggle of toggles) toggle.addEventListener('click', toggleSound);

computer.addEventListener('click', event => {
  const button = event.target.closest('button, a[href]');
  if (button && !button.classList.contains('sound-toggle')) playEffect('click-desk', 0.55);
});
