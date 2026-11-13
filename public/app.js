// ---------- Data cleanup ----------
// The sheet is typed in by hand (via the iPhone automation), so dates come as
// "10/27/2022" or "11/13/26" and ratings as "3", "", or "1★". Normalize once here
// so the rest of the code can trust the data.

function parseDate(raw) {
  const [m, d, y] = raw.split("/").map(Number);
  if (!m || !d || !y) return null;
  const year = y < 100 ? 2000 + y : y;
  return new Date(year, m - 1, d);
}

function parseRating(raw) {
  const n = parseInt(raw, 10); // parseInt("1★") → 1
  return Number.isNaN(n) ? null : Math.min(Math.max(n, 0), 5);
}

function formatDate(date) {
  if (!date) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${String(date.getFullYear()).slice(2)}`;
}

// ---------- Stars ----------
// A 5-point star = 10 corners alternating between an outer radius R and an inner radius r,
// each 36° (π/5) apart, starting straight up (−90°). For a classic star r/R = sin18°/sin54° ≈ 0.382.
function starPoints(cx, cy, R) {
  const r = R * (Math.sin(Math.PI / 10) / Math.sin((3 * Math.PI) / 10));
  return Array.from({ length: 10 }, (_, k) => {
    const angle = -Math.PI / 2 + (k * Math.PI) / 5;
    const radius = k % 2 === 0 ? R : r;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

// Define the star shape once; every star on the page reuses it with <use>.
// (The `hidden` attribute doesn't work on <svg>, so size it to 0 instead.)
document.body.insertAdjacentHTML(
  "afterbegin",
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="star" viewBox="0 0 24 24"><polygon points="${starPoints(12, 13, 10)}"/></symbol></svg>`
);

function stars(rating) {
  if (rating === null) return `<span class="stars stars--none">—</span>`;
  const icons = Array.from(
    { length: 5 },
    (_, i) => `<svg class="star ${i < rating ? "star--on" : "star--off"}"><use href="#star"/></svg>`
  );
  return `<span class="stars" role="img" aria-label="${rating} out of 5 stars">${icons.join("")}</span>`;
}

// ---------- Load ----------
const raw = await fetch("jokes.json").then((r) => r.json());

// Oldest joke = #1.
const chronological = raw.map((j, i) => ({
  num: i + 1,
  joke: j.joke.trim(),
  response: j.response.trim(),
  rating: parseRating(j.rating),
  date: parseDate(j.date),
}));

// ---------- Repeat detection ----------
// Dad re-tells jokes, often reworded ("It'd" vs "It would"), so exact matching misses them.
// Instead compare word sets with the Jaccard index: shared words ÷ total distinct words.
// 1.0 = same words, 0 = nothing in common. Tested on the real sheet: every pair ≥ 0.6
// was a genuine repeat; the first false match ("What do you call a ___ with no ___") was 0.54.
const REPEAT_THRESHOLD = 0.6;

function wordSet(text) {
  return new Set(
    text.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean)
  );
}

function jaccard(a, b) {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared / (a.size + b.size - shared); // |A ∪ B| = |A| + |B| − |A ∩ B|
}

const sets = chronological.map((j) => wordSet(j.joke));
chronological.forEach((j, i) => {
  // Link each joke to the FIRST time he told it
  const first = sets.findIndex((s, k) => k < i && jaccard(s, sets[i]) >= REPEAT_THRESHOLD);
  j.repeatOf = first === -1 ? null : chronological[first];
});

// Display newest first
const jokes = [...chronological].reverse();

const digits = String(jokes.length).length;

// ---------- Render the index ----------
const tbody = document.querySelector("#jokes");
tbody.innerHTML = jokes
  .map(
    (j, i) => `
    <tr data-index="${i}">
      <td>${String(j.num).padStart(digits, "0")}</td>
      <td><button class="joke-btn" data-index="${i}">${escapeHtml(j.joke)}</button></td>
      <td>${stars(j.rating)}</td>
      <td>${formatDate(j.date)}</td>
    </tr>`
  )
  .join("");

const first = jokes.at(-1);
document.querySelector("#count").textContent =
  `${jokes.length} jokes since ${formatDate(first.date)}`;

// Clicking anywhere on a row opens it; the <button> inside makes it keyboard-accessible.
tbody.addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-index]");
  if (row) openJoke(Number(row.dataset.index));
});

// ---------- Joke window ----------
const dialog = document.querySelector("#joke-window");
let current = 0;

function openJoke(i) {
  current = i;
  const j = jokes[i];
  dialog.querySelector("#joke-title").textContent = `Joke #${j.num}`;
  dialog.querySelector("#joke-date").textContent = `Dad · ${formatDate(j.date)}`;
  dialog.querySelector("#joke-text").textContent = j.joke;
  dialog.querySelector("#joke-response").textContent = j.response;
  // No reply = left on read
  dialog.querySelector("#joke-read").hidden = Boolean(j.response);
  const repeat = dialog.querySelector("#joke-repeat");
  repeat.hidden = !j.repeatOf;
  if (j.repeatOf) {
    repeat.innerHTML = `Repeat — first told ${formatDate(j.repeatOf.date)}
      <button class="link" data-action="goto" data-num="${j.repeatOf.num}">#${j.repeatOf.num}</button>`;
  }
  dialog.querySelector("#joke-rating").innerHTML = stars(j.rating);
  // newest is index 0, so "older" = higher index
  dialog.querySelector('[data-action="prev"]').disabled = i === jokes.length - 1;
  dialog.querySelector('[data-action="next"]').disabled = i === 0;
  history.replaceState(null, "", `#${j.num}`); // shareable link to this joke
  if (!dialog.open) dialog.showModal();
}

dialog.addEventListener("close", () => history.replaceState(null, "", location.pathname));

// Opening the page at #123 opens joke 123
const linked = jokes.findIndex((j) => `#${j.num}` === location.hash);
if (linked !== -1) openJoke(linked);

dialog.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "close") dialog.close();
  if (action === "goto") {
    const num = Number(e.target.closest("[data-num]").dataset.num);
    openJoke(jokes.findIndex((j) => j.num === num));
  }
  if (action === "prev" && current < jokes.length - 1) openJoke(current + 1);
  if (action === "next" && current > 0) openJoke(current - 1);
});

document.addEventListener("keydown", (e) => {
  if (!dialog.open) return;
  if (e.key === "ArrowLeft" && current < jokes.length - 1) openJoke(current + 1);
  if (e.key === "ArrowRight" && current > 0) openJoke(current - 1);
});

// ---------- Drag the window by its title bar ----------
// Track how far the pointer has moved since pressing down, and shift the window
// by that much with a CSS transform (translate = add a vector to its position).
const handle = dialog.querySelector("[data-drag-handle]");
let offset = { x: 0, y: 0 };
let start = null;

handle.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button")) return;
  start = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  handle.setPointerCapture(e.pointerId);
});
handle.addEventListener("pointermove", (e) => {
  if (!start) return;
  offset = { x: e.clientX - start.x, y: e.clientY - start.y };
  dialog.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
});
handle.addEventListener("pointerup", () => (start = null));
handle.style.cursor = "grab";

// The jokes come from a spreadsheet, so treat them as untrusted text
// before putting them inside HTML.
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
