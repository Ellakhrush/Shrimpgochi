/**
 * pet.test.js — testes básicos da lógica do Pet
 *
 * Roda com Node puro, sem framework:
 *   node pet.test.js
 */

"use strict";

const { Pet, STATES } = require("./pet.js");

// ─── Mini test runner ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
    failed++;
  }
}

function assert(condition, msg = "assertion failed") {
  if (!condition) throw new Error(msg);
}

function assertEqual(a, b) {
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

// ─── Testes ───────────────────────────────────────────────────────────────────

console.log("\npet.js tests\n");

test("cria pet com estado inicial correto", () => {
  const p = new Pet("test");
  assertEqual(p.name, "test");
  assertEqual(p.state, STATES.HAPPY);
  assert(!p.sick);
  assert(!p.sleeping);
});

test("alimentar reduz fome", () => {
  const p = new Pet("test");
  p.stats.hunger = 60;
  p.feed();
  assert(p.stats.hunger < 60, "fome deveria cair");
});

test("brincar aumenta alegria", () => {
  const p = new Pet("test");
  const before = p.stats.happiness;
  p.play();
  assert(p.stats.happiness > before, "alegria deveria subir");
});

test("brincar não funciona sem energia", () => {
  const p = new Pet("test");
  p.stats.energy = 10;
  const result = p.play();
  assert(!result.ok, "não deveria poder brincar");
});

test("sleep toggle funciona", () => {
  const p = new Pet("test");
  p.sleep();
  assert(p.sleeping, "deveria estar dormindo");
  p.sleep();
  assert(!p.sleeping, "deveria ter acordado");
});

test("não pode agir enquanto dorme", () => {
  const p = new Pet("test");
  p.sleeping = true;
  const result = p.feed();
  assert(!result.ok, "não deveria poder comer dormindo");
});

test("medicar cura doença", () => {
  const p = new Pet("test");
  p.sick = true;
  p._updateState();
  p.medicine();
  assert(!p.sick, "deveria estar curado");
});

test("medicar sem doença retorna ok: false", () => {
  const p = new Pet("test");
  const result = p.medicine();
  assert(!result.ok);
});

test("tick avança age", () => {
  const p = new Pet("test");
  p.lastTick = Date.now() - 120_000; // 2 minutos atrás
  p.tick();
  assert(p.age > 1.9, `age deveria ser ~2, é ${p.age}`);
});

test("tick aumenta fome com o tempo", () => {
  const p = new Pet("test");
  const before = p.stats.hunger;
  p.lastTick = Date.now() - 600_000; // 10 min
  p.tick();
  assert(p.stats.hunger > before, "fome deveria ter subido");
});

test("serialização e desserialização preserva estado", () => {
  const p = new Pet("molly");
  p.stats.hunger = 55;
  p.sick = true;
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  const p2 = Pet.fromJSON(json);
  assertEqual(p2.name, "molly");
  assertEqual(p2.stats.hunger, 55);
  assert(p2.sick);
});

test("estado vai pra DEAD quando fome chega a 100", () => {
  const p = new Pet("test");
  p.stats.hunger = 100;
  p._updateState();
  assertEqual(p.state, STATES.DEAD);
});

test("estado vai pra DEAD quando energia chega a 0", () => {
  const p = new Pet("test");
  p.stats.energy = 0;
  p._updateState();
  assertEqual(p.state, STATES.DEAD);
});

// ─── Resultado ────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
