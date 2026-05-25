/**
 * game.js — O Maestro do Caos Digital
 * 
 * Conecta a lógica do camarão ao HTML.
 * Tenta convencer o camarão de que ele existe, apesar de ser apenas bits.
 */

"use strict";

// ─── Constantes do Caos ────────────────────────────────────────────────────────

const SAVE_KEY      = "shrimp…save"; 
const TICK_INTERVAL = 10_000; 

// 🍤 SPRITE ENGINE V2 - Pixel Art Aprimorada
const SHRIMP_COLORS = {
  body: "#ff8a65",    // Laranja Camarão
  dark: "#d84315",   // Sombra
  light: "#ffab91",   // Brilho
  eye: "#212121",     // Olhinho
  white: "#ffffff",   // Branco
  pale: "#bcaaa4",    // Cor de camarão triste/morto
  crisis: "#c5cae9",  // Roxo existencial
};

function createShrimpSVG(state) {
  const c = SHRIMP_COLORS;
  let bodyColor = c.body;
  let expression = "";
  let rotation = "0deg";
  let scale = "1";
  let animationClass = "shrimp-idle";

  switch(state) {
    case "happy":
      expression = `<rect x="5" y="4" width="2" height="1" fill="${c.dark}" />`; 
      animationClass = "shrimp-bounce";
      break;
    case "neutral":
      expression = `<rect x="5" y="4" width="2" height="1" fill="${c.dark}" />`;
      break;
    case "hungry":
      expression = `<rect x="5" y="3" width="2" height="1" fill="${c.dark}" />`; 
      break;
    case "tired":
      expression = `<rect x="4" y="4" width="1" height="1" fill="${c.dark}" /><rect x="7" y="4" width="1" height="1" fill="${c.dark}" />`; 
      break;
    case "dirty":
      expression = `<rect x="6" y="3" width="1" height="1" fill="#5d4037" />`; 
      break;
    case "sick":
      bodyColor = c.light;
      expression = `<rect x="4" y="4" width="1" height="1" fill="${c.dark}" /><rect x="7" y="4" width="1" height="1" fill="${c.dark}" />`;
      animationClass = "shrimp-wobble";
      break;
    case "sleeping":
      bodyColor = c.light;
      expression = `<rect x="4" y="4" width="2" height="1" fill="${c.dark}" /><rect x="7" y="4" width="2" height="1" fill="${c.dark}" />`;
      animationClass = "shrimp-sleep";
      break;
    case "crisis":
      bodyColor = c.crisis;
      expression = `<rect x="4" y="3" width="1" height="1" fill="${c.dark}" /><rect x="7" y="3" width="1" height="1" fill="${c.dark}" />`;
      animationClass = "shrimp-crisis";
      break;
    case "dead":
      bodyColor = c.pale;
      rotation = "90deg";
      expression = `<rect x="4" y="3" width="1" height="1" fill="${c.dark}" /><rect x="7" y="3" width="1" height="1" fill="${c.dark}" />`;
      break;
  }

  return `
    <svg viewBox="0 0 12 12" width="60" height="60" class="${animationClass}" style="transform: rotate(${rotation}) scale(${scale})">
      <rect x="1" y="8" width="2" height="2" fill="${bodyColor}" />
      <rect x="3" y="7" width="2" height="2" fill="${bodyColor}" />
      <rect x="5" y="6" width="3" height="3" fill="${bodyColor}" />
      <rect x="7" y="5" width="3" height="3" fill="${bodyColor}" />
      <rect x="9" y="4" width="2" height="3" fill="${bodyColor}" />
      <rect x="10" y="3" width="1" height="1" fill="${bodyColor}" />
      <rect x="10" y="4" width="1" height="1" fill="${c.eye}" />
      ${expression}
      <rect x="10" y="2" width="1" height="1" fill="${bodyColor}" />
      <rect x="11" y="2" width="1" height="1" fill="${bodyColor}" />
    </svg>
  `;
}

const SPRITE_MAP = {
  happy:    () => createShrimpSVG("happy"),
  neutral:  () => createShrimpSVG("neutral"),
  hungry:   () => createShrimpSVG("hungry"),
  tired:    () => createShrimpSVG("tired"),
  dirty:    () => createShrimpSVG("dirty"),
  sick:     () => createShrimpSVG("sick"),
  sleeping: () => createShrimpSVG("sleeping"),
  dead:     () => createShrimpSVG("dead"),
  crisis:   () => createShrimpSVG("crisis"),
};

let pet  = null;
let loop = null;

function init() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      pet = Pet.fromJSON(JSON.parse(saved));
      pet.tick(Date.now());
    } catch (e) {
      pet = createNewPet();
    }
  } else {
    pet = createNewPet();
  }
  bindButtons();
  startLoop();
  render();
}

function createNewPet() {
  const name = prompt("Dê um nome para seu Camarão Existencial:", "Shrimpy :3") || "Shrimpy :3";
  return new Pet(name);
}

function startLoop() {
  if (loop) clearInterval(loop);
  loop = setInterval(() => {
    if (pet.state !== "dead") {
      pet.tick(Date.now());
      save();
    }
    render();
  }, TICK_INTERVAL);
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(pet.toJSON()));
}

function render() {
  const isDead = pet.state === "dead";
  document.getElementById("death-screen").classList.toggle("hidden", !isDead);
  document.getElementById("scene").classList.toggle("hidden", isDead);
  document.getElementById("stats").classList.toggle("hidden", isDead);
  document.getElementById("buttons").classList.toggle("hidden", isDead);

  if (isDead) {
    document.getElementById("death-message").textContent =
      `${pet.name} desistiu da simulação após ${Math.floor(pet.age)} minutos... 💔`;
    return;
  }

  document.getElementById("pet-name").textContent = pet.name;
  document.getElementById("pet-age").textContent  = `${Math.floor(pet.age)}min de crise`;

  const spriteContainer = document.getElementById("pet-sprite");
  spriteContainer.innerHTML = SPRITE_MAP[pet.state] ? SPRITE_MAP[pet.state]() : createShrimpSVG("neutral");
  spriteContainer.dataset.state = pet.state;

  setBar("hunger",    100 - pet.stats.hunger);
  setBar("energy",    pet.stats.energy);
  setBar("happiness", pet.stats.happiness);
  setBar("hygiene",   pet.stats.hygiene);
}

function setBar(id, value) {
  const fill = document.getElementById(`bar-${id}`);
  if (!fill) return;
  const pct = Math.max(0, Math.min(100, value));
  fill.style.width = `${pct}%`;
  fill.className = "fill";
  if (pct < 25)      fill.classList.add("critical");
  else if (pct < 50) fill.classList.add("warning");
}

function bindButtons() {
  const actions = {
    "btn-feed":     () => pet.feed(),
    "btn-play":     () => pet.play(),
    "btn-sleep":    () => pet.sleep(),
    "btn-clean":    () => pet.clean(),
    "btn-medicine": () => pet.medicine(),
    "btn-reveal":   () => pet.revealTruth(),
  };

  for (const [id, fn] of Object.entries(actions)) {
    document.getElementById(id)?.addEventListener("click", () => {
      const result = fn();
      showSpeech(result.msg);
      save();
      render();
    });
  }

  document.getElementById("btn-revive")?.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    pet = createNewPet();
    save();
    startLoop();
    render();
  });
}

function showSpeech(msg) {
  const bubble = document.getElementById("speech-bubble");
  bubble.textContent = msg;
  bubble.classList.remove("hidden");
  clearTimeout(bubble._timeout);
  bubble._timeout = setTimeout(() => bubble.classList.add("hidden"), 2500);
}

document.addEventListener("DOMContentLoaded", init);
