import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import fs from "fs/promises";

const BASE = "https://www.muscleandstrength.com";
const LIST_URL = `${BASE}/exercises`;
const OUT_FILE = "./seed-exercises.json";
const CONCURRENCY = 4;         // be polite
const REQUEST_DELAY_MS = 500;  // small delay between requests
const TIMEOUT_MS = 20000;
const MAX_PAGES = 999;         // safety cap

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
const uniq = (arr) => [...new Set((arr || []).filter(Boolean))];

async function fetchHTML(url) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LiftTrackerAI/1.0; +local-dev)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    timeout: TIMEOUT_MS,
  });
  await sleep(REQUEST_DELAY_MS);
  return res.data;
}

async function getAllExerciseLinks() {
  const links = new Set();

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = page === 0 ? LIST_URL : `${LIST_URL}?page=${page}`;
    console.log(`Listing page: ${url}`);
    let html;
    try {
      html = await fetchHTML(url);
    } catch (e) {
      console.warn(`Failed to fetch list page ${page}: ${e.message}`);
      break;
    }
    const $ = cheerio.load(html);
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (/^\/exercises\/[a-z0-9-]+/i.test(href)) links.add(BASE + href);
    });
    const hasNext = $('a[rel="next"], .pager__item--next a').length > 0;
    if (!hasNext) break;
  }

  return Array.from(links).filter(u => /\/exercises\/[a-z0-9-]+$/i.test(u));
}

// --- Lightweight rewriters ---
function rewriteText(raw) {
  const text = clean(raw);
  if (!text) return null;
  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z])/g).map(clean).filter(Boolean);
  const verbSwap = [
    [/lie down/i, "position yourself"],
    [/lay down/i, "position yourself"],
    [/grip/i, "hold"],
    [/pinch/i, "draw"],
    [/squeeze/i, "brace"],
    [/lower/i, "descend"],
    [/raise/i, "drive up"],
    [/press/i, "press up"],
    [/pull/i, "row or pull"],
    [/keep/i, "maintain"],
    [/stay/i, "remain"],
    [/ensure/i, "make sure to"],
    [/avoid/i, "try not to"],
    [/pause/i, "briefly pause"],
    [/contract/i, "engage"],
    [/retract/i, "pull back"],
    [/depress/i, "draw down"],
  ];
  const cueAdditions = [
    "Keep your core engaged and breathe with control.",
    "Move deliberately; control matters more than speed.",
    "Work within a pain-free range and prioritize form.",
    "Drive through the floor and keep your posture tall.",
    "Keep shoulder blades set for stability.",
  ];
  const rewritten = parts.map((s, i) => {
    let r = s
      .replace(/\bwhile\b/gi, "as you")
      .replace(/\bthen\b/gi, "next")
      .replace(/\bslowly\b/gi, "in a controlled tempo")
      .replace(/\bwith control\b/gi, "in a controlled manner");
    verbSwap.forEach(([re, rep]) => { r = r.replace(re, rep); });
    if (r.match(/^(lower|descend)/i)) r = "On each rep, " + r;
    if ((i === 0 || i === 1) && r.length > 40) r += " " + cueAdditions[i % cueAdditions.length];
    return r;
  });
  return clean(rewritten.join(" "));
}

function rewriteTips(raw) {
  const text = clean(raw);
  if (!text) return null;
  const items = text
    .split(/[\n•\-–]+/g)
    .map(clean)
    .filter(Boolean)
    .map(t => t
      .replace(/\bavoid\b/gi, "try to avoid")
      .replace(/\bkeep\b/gi, "maintain")
      .replace(/\bdon't\b/gi, "try not to")
      .replace(/\bstay\b/gi, "remain"));
  return items.slice(0, 6).join(" ");
}

function parseExercise($) {
  const name = clean($("h1").first().text());
  const breadcrumbCats = $("nav.breadcrumb a").map((_, el) => clean($(el).text())).get();
  let category = breadcrumbCats.filter(c => !/Home|Exercises/i.test(c)).pop();

  const meta = $(".node-exercise .field").map((_, el) => {
    const label = clean($(el).find(".field__label").text());
    const value = clean($(el).find(".field__items, .field__item").text());
    return { label, value };
  }).get();

  const getMeta = (key) => meta.find(m => m.label.toLowerCase().includes(key))?.value || "";
  const mainMuscles = getMeta("main muscle") || getMeta("primary muscle") || "";
  const otherMuscles = getMeta("other muscles") || "";
  const equipment = getMeta("equipment") || "";

  const muscles = uniq((mainMuscles + "," + otherMuscles)
    .split(/,|·|•/g).map(m => clean(m).toLowerCase()).filter(Boolean));

  const stepBlocks = $("ol li, .ex-instruction p, .node-exercise .field--name-body p")
    .map((_, el) => clean($(el).text())).get().filter(Boolean);
  const rawInstructions = stepBlocks.length ? stepBlocks.join(" ")
    : clean($(".node-exercise .field--name-body").text());

  const tipsCandidates = $(".node-exercise .field--name-body ul li, .node-exercise .field--name-body em, .node-exercise .field--name-body strong")
    .map((_, el) => clean($(el).text())).get().filter(Boolean);

  const revised = {
    name,
    category: clean(category || ""),
    muscleGroups: muscles,
    equipment: equipment || null,
    instructions: rewriteText(rawInstructions),
    tips: rewriteTips(tipsCandidates.join(" ")),
  };

  if (!revised.instructions && rawInstructions) revised.instructions = clean(rawInstructions);
  if (!revised.tips && tipsCandidates.length) revised.tips = tipsCandidates.slice(0, 5).join(" ");

  return revised;
}

async function scrapeOne(url, tries = 2) {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const data = parseExercise($);
    if (!data.name) throw new Error("No exercise name found");
