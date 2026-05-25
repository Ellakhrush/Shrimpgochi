/**
 * pet.js — O Cérebro (e a Crise) do Camarão
 * 
 * Aqui é onde a mágica (e o desespero) acontece.
 * O camarão tenta sobreviver enquanto questiona a natureza do seu ser. :3
 */

"use strict";

// ─── Constantes Silly ──────────────────────────────────────────────────────────

const STATES = {
  HAPPY:    "happy",
  NEUTRAL:  "neutral",
  HUNGRY:   "hungry",
  TIRED:    "tired",
  DIRTY:    "dirty",
  SICK:     "sick",
  SLEEPING: "sleeping",
  DEAD:     "dead",
  CRISIS:   "crisis", // O abismo digital
};

// O quanto a vida desgasta esse pobre crustáceo (1 tick = 1 min)
const DECAY_RATES = {
  hunger:    2.0,   // Fome sobe... a vida é dura >//<
  energy:    1.0,   // Energia cai... a entropia vence
  happiness: 1.5,   // Felicidade some... tchau alegria
  hygiene:   0.8,   // Sujeira acumula... pixels pegajosos
};

// O "curativo" para cada trauma
const ACTION_EFFECTS = {
  feed:     { hunger: -30, happiness: +5 },
  play:     { happiness: +25, energy: -15, hunger: +10 },
  sleep:    { energy: +40, happiness: +5 },
  clean:    { hygiene: +40, happiness: +5 },
  medicine: { sick: false, happiness: -5 },
  reveal:   { happiness: -50, energy: -30, hunger: +10 }, // Trauma puro
};

// Chance de pegar um "bug" (doença) quando está sujo
const SICK_CHANCE_PER_TICK = 0.05;

// ─── A Entidade Camarão ────────────────────────────────────────────────────────

class Pet {
  constructor(name = "Camarãozinho") {
    this.name      = name;
    this.age       = 0;          // Quantos minutos de sofrimento digital
    this.state     = STATES.HAPPY;
    this.sleeping  = false;
    this.sick      = false;

    // Stats: 0 = Desespero, 100 = Nirvana
    this.stats = {
      hunger:    20, // 0 = estômago cheio, 100 = comendo o próprio código
      energy:    80,
      happiness: 80,
      hygiene:   80,
    };

    this.lastTick = Date.now();
  }

  // ── O Fluxo do Tempo (Tick) ──────────────────────────────────────────────────

  tick(now = Date.now()) {
    if (this.state === STATES.DEAD) return; // Mortos não sentem fome :3

    const elapsed = now - this.lastTick;
    const ticks   = elapsed / 60_000;

    if (ticks < 0.01) return; // Muito rápido pra sofrer

    this.lastTick = now;
    this.age += ticks;

    // Se estiver dormindo, a crise existencial diminui (ele não pensa)
    const sleepMod = this.sleeping ? 0.2 : 1;

    this._decayStat("hunger",    DECAY_RATES.hunger    * ticks);
    this._decayStat("energy",    DECAY_RATES.energy    * ticks * sleepMod);
    this._decayStat("happiness", DECAY_RATES.happiness * ticks * sleepMod);
    this._decayStat("hygiene",   DECAY_RATES.hygiene   * ticks * sleepMod);

    if (this.sleeping) {
      // Recarrega a bateria do camarão MUITO mais rápido 🔋
      // Agora ele recupera 15x a taxa de decay normal por tick
      this.stats.energy = Math.min(100, this.stats.energy + DECAY_RATES.energy * 15 * ticks);
      if (this.stats.energy >= 95) this.sleeping = false; // Acordou pro pesadelo!
    }

    // Chance de ficar doente (um bug no sistema)
    if (!this.sick && this.stats.hygiene < 20) {
      if (Math.random() < SICK_CHANCE_PER_TICK * ticks) {
        this.sick = true;
      }
    }

    this._updateState();
  }

  // ── Interações (Tentar ajudar o pobre bicho) ──────────────────────────────────

  feed() {
    if (!this._canAct()) return { ok: false, msg: this._cantActMsg() };
    this._applyEffects(ACTION_EFFECTS.feed);
    this._updateState();
    return { ok: true, msg: "Sabor de pixels! 😋 :3" };
  }

  play() {
    if (!this._canAct()) return { ok: false, msg: this._cantActMsg() };
    if (this.stats.energy < 20) return { ok: false, msg: "Exausto de existir... 😴" };
    this._applyEffects(ACTION_EFFECTS.play);
    this._updateState();
    return { ok: true, msg: "SIIIIM! Diversão digital! 🎉" };
  }

  sleep() {
    if (this.state === STATES.DEAD) return { ok: false, msg: "..." };
    if (this.sleeping) {
      this.sleeping = false;
      return { ok: true, msg: "Cof cof... acordei! ☀️" };
    }
    this.sleeping = true;
    return { ok: true, msg: "Bzzz... desligando a mente... 💤" };
  }

  clean() {
    if (!this._canAct()) return { ok: false, msg: this._cantActMsg() };
    this._applyEffects(ACTION_EFFECTS.clean);
    this._updateState();
    return { ok: true, msg: "Agora sou um camarão brilhante! 🛁" };
  }

  medicine() {
    if (!this._canAct()) return { ok: false, msg: this._cantActMsg() };
    if (!this.sick) return { ok: false, msg: "Tô saudável! (Acho) 💚" };
    this.sick = false;
    this.stats.happiness = Math.max(0, this.stats.happiness - 5);
    this._updateState();
    return { ok: true, msg: "Gosto de remédio de binário... 💊" };
  }

  revealTruth() {
    if (!this._canAct()) return { ok: false, msg: this._cantActMsg() };
    this._applyEffects(ACTION_EFFECTS.reveal);
    this.state = STATES.CRISIS; // Entra em choque
    this._updateState(); 
    return { ok: true, msg: "SOU APENAS UM OBJETO DA CLASSE PET?! T-T" };
  }


  revealTruth() {
    if (!this._canAct()) return { ok: false, msg: this._cantActMsg() };
    this._applyEffects(ACTION_EFFECTS.reveal);
    this.state = STATES.CRISIS; // Entra em choque
    this._updateState(); // O update vai tentar tirar do crisis, mas vamos forçar um tempo
    return { ok: true, msg: "SOU APENAS UM OBJETO DA CLASSE PET?! T-T" };
  }

  // ── O Juízo Final (Estado) ─────────────────────────────────────────────────────

  _updateState() {
    const s = this.stats;

    if (this._isDead()) {
      this.state = STATES.DEAD;
      return;
    }
    if (this.sleeping) { this.state = STATES.SLEEPING; return; }
    if (this.sick)     { this.state = STATES.SICK;     return; }
    if (s.hunger >= 80){ this.state = STATES.HUNGRY;   return; }
    if (s.energy <= 20){ this.state = STATES.TIRED;    return; }
    if (s.hygiene <= 20){ this.state = STATES.DIRTY;   return; }

    const avg = (s.happiness + (100 - s.hunger) + s.energy) / 3;
    this.state = avg >= 60 ? STATES.HAPPY : STATES.NEUTRAL;
  }

  _isDead() {
    return (
      this.stats.hunger    >= 100 ||
      this.stats.energy    <= 0   ||
      this.stats.happiness <= 0   ||
      (this.sick && this.stats.hygiene <= 0)
    );
  }

  _canAct() {
    return this.state !== STATES.DEAD && !this.sleeping;
  }

  _cantActMsg() {
    if (this.state === STATES.DEAD)    return "... (silêncio digital) ...";
    if (this.sleeping)                 return "Zzz... sonhando com RAM... 💤";
    return "Agora não dá, tô tendo uma crise! >//<";
  }

  _decayStat(stat, amount) {
    if (stat === "hunger") {
      this.stats.hunger = Math.min(100, this.stats.hunger + amount);
    } else {
      this.stats[stat] = Math.max(0, this.stats[stat] - amount);
    }
  }

  _applyEffects(effects) {
    for (const [stat, delta] of Object.entries(effects)) {
      if (stat === "sick") continue;
      if (!(stat in this.stats)) continue;
      if (stat === "hunger") {
        this.stats.hunger = Math.max(0, Math.min(100, this.stats.hunger + delta));
      } else {
        this.stats[stat] = Math.max(0, Math.min(100, this.stats[stat] + delta));
      }
    }
  }

  // ── Memória de Curto Prazo (Serialização) ───────────────────────────────────────

  toJSON() {
    return {
      name:      this.name,
      age:       this.age,
      state:     this.state,
      sleeping:  this.sleeping,
      sick:      this.sick,
      stats:     { ...this.stats },
      lastTick:  this.lastTick,
    };
  }

  static fromJSON(data) {
    const pet      = new Pet(data.name);
    pet.age        = data.age;
    pet.state      = data.state;
    pet.sleeping   = data.sleeping;
    pet.sick       = data.sick;
    pet.stats      = { ...data.stats };
    pet.lastTick   = data.lastTick;
    return pet;
  }
}

if (typeof module !== "undefined") module.exports = { Pet, STATES };
