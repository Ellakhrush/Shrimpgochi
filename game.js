/**
 * game.js — O Maestro do Caos Digital
 * 
 * Conecta a lógica do camarão ao HTML.
 * Tenta convencer o camarão de que ele existe, apesar de ser apenas bits.
 */

"use strict";

// ─── Constantes do Caos ────────────────────────────────────────────────────────

const SAVE_KEY      = "shrimp_existential_save"; // Nova chave pra não conflitar com o antigo
const TICK_INTERVAL = 10_000; 

// Sprites: Expressões de um camarão em colapso
const SPRITE_MAP = {
  happy:    "🍤 ( ᵕ̈ )",
  neutral:  "🍤 ( ._. )",
  hungry:   "🍤 ( ´•ω•` )",
  tired:    "🍤 ( -_- )",
  dirty:    "🍤 ( ´-﹏-` )",
  sick:     "🍤 ( ×_× )",
  sleeping: "🍤 ( -ᴗ- ) zzz",
  dead:     "💀 ( T_T )",
};

// ─── O Mundo Digital ──────────────────────────────────────────────────────────

let pet  = null;
let loop = null;

function init() {
  const saved = localStorage.getItem(SAVE_KEY);

  if (saved) {
    try {
      pet = Pet.fromJSON(JSON.parse(saved));
      pet.tick(Date.now());
    } catch (e) {
      console.warn("O save do camarão derreteu. Resetando...", e);
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

// ─── O Loop da Vida (e do Tédio) ────────────────────────────────────────────────

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

// ─── Pintando o Camarão na Tela ────────────────────────────────────────────────

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

  document.getElementById("pet-sprite").textContent = SPRITE_MAP[pet.state] ?? "🍤 ( ._. )";
  document.getElementById("pet-sprite").dataset.state = pet.state;

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

// ─── Botões de Suporte Psicológico ──────────────────────────────────────────────

function bindButtons() {
  const actions = {
    "btn-feed":     () => pet.feed(),
    "btn-play":     () => pet.play(),
    "btn-sleep":    () => pet.sleep(),
    "btn-clean":    () => pet.clean(),
    "btn-medicine": () => pet.medicine(),
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
