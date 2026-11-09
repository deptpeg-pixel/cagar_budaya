/* ================================================================
   LOGIKA APLIKASI CAGAR BUDAYA GPIB
   ================================================================ */

const STATUSES = ["Nasional", "Provinsi", "Kota", "Kabupaten"];
const ST_CHIP = {
  Nasional: "st-nas",
  Provinsi: "st-prov",
  Kota: "st-kota",
  Kabupaten: "st-kab"
};
const ST_FILL = {
  Nasional: "f-nas",
  Provinsi: "f-prov",
  Kota: "f-kota",
  Kabupaten: "f-kab"
};

const stColor = s => {
  const map = {
    Nasional: "--c-nas",
    Provinsi: "--c-prov",
    Kota: "--c-kota",
    Kabupaten: "--c-kab"
  };
  return getComputedStyle(document.documentElement).getPropertyValue(map[s] || "--c-nas").trim() || "#c8a24a";
};

/* Sumber data default dari window.CAGAR_BUDAYA_DATA */
const RAW_DEFAULTS = window.CAGAR_BUDAYA_DATA || [];
const DEFAULTS = RAW_DEFAULTS.map(e => ({
  id: "b" + e.no,
  alamat: "",
  narasi: "",
  fotos: [],
  mainIdx: 0,
  fit: "contain",
  ...e
}));

/* ---------- State Aplikasi ---------- */
const KEY = "gpib-cagar-budaya-v5";
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

let state = load();
let editing = false;
let idx = 0;
let scrambled = false;
let pendingImgId = null;
let saveTimer = null;

let map = null;
let markers = {};
let markerLayer = null;
let mapReady = false;
let tileFell = false;
let pendingFocus = null;
let pulseCircle = null;

let lbId = null;
let lbIdx = 0;
let lbEdited = false;
let sortState = { key: "no", dir: 1 };
let statFilter = null;

function restoreSavedAddresses(savedState) {
  return {
    ...savedState,
    entries: DEFAULTS.map((fallback, index) => {
      const entry = (savedState && Array.isArray(savedState.entries))
        ? (savedState.entries.find(e => e.id === fallback.id || e.no === fallback.no) || savedState.entries[index] || {})
        : {};
      return {
        ...fallback,
        ...entry,
        narasi: typeof entry.narasi === "string" && entry.narasi.trim()
          ? entry.narasi
          : (fallback.narasi || ""),
        alamat: typeof entry.alamat === "string" && entry.alamat.trim()
          ? entry.alamat
          : (fallback.alamat || ""),
        fotos: Array.isArray(entry.fotos) && entry.fotos.length > 0
          ? entry.fotos
          : (fallback.fotos || [])
      };
    })
  };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.entries) && s.entries.length === DEFAULTS.length) {
      return restoreSavedAddresses(s);
    }
  } catch (e) {}

  // Fallback migrasi jika ada data v4 sebelumnya
  try {
    const s = JSON.parse(localStorage.getItem("gpib-cagar-budaya-v4"));
    if (s && Array.isArray(s.entries) && s.entries.length === DEFAULTS.length) {
      return restoreSavedAddresses(s);
    }
  } catch (e) {}

  return { entries: JSON.parse(JSON.stringify(DEFAULTS)) };
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      alert("Penyimpanan peramban penuh — kurangi foto base64 atau gunakan path file di folder images/.");
    }
  }, 300);
}

function resetToDataFile() {
  if (confirm("Muat ulang seluruh data langsung dari file data/cagar_budaya_data.js? (Perubahan belum diekspor di browser akan direset)")) {
    localStorage.removeItem(KEY);
    localStorage.removeItem("gpib-cagar-budaya-v4");
    state = { entries: JSON.parse(JSON.stringify(DEFAULTS)) };
    build();
    go(0);
    alert("Data berhasil dimuat ulang dari data/cagar_budaya_data.js!");
  }
}

function exportDataFile() {
  const content = `/**
 * =========================================================================
 * DAFTAR STATUS BANGUNAN CAGAR BUDAYA GPIB (HASIL EKSPOR)
 * Diekspor pada: ${new Date().toLocaleString("id-ID")}
 * =========================================================================
 */

window.CAGAR_BUDAYA_DATA = ${JSON.stringify(state.entries, null, 2)};
`;
  const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cagar_budaya_data.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

const byId = id => state.entries.find(e => e.id === id);
const pad = n => String(n).padStart(2, "0");
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hasPin = e => e.lat !== "" && e.lat != null && e.lng !== "" && e.lng != null && !isNaN(+e.lat) && !isNaN(+e.lng);
const curFoto = e => e.fotos[e.mainIdx] || null;

/* ---------- Template HTML ---------- */
const deck = document.getElementById("deck");
let slideMeta = [];
const PH_SVG = `<svg width="100" height="100" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".85">
<path d="M20 100V58c0-22 17-38 40-38s40 16 40 38v42"/><path d="M42 100V72c0-11 8-19 18-19s18 8 18 19v28"/>
<path d="M60 20V8M52 14h16"/><path d="M10 100h100"/></svg>`;

function coverHTML() {
  const pinned = state.entries.filter(hasPin).length;
  return `<section class="slide" data-kind="cover">
  <div class="dust" id="dust"></div>
  <div class="c-wrap">
   <div>
    <p class="eyebrow rev" style="--d:80ms">Daftar Status Bangunan Cagar Budaya</p>
    <h1 class="c-title"><span class="scr" data-text="Cagar Budaya">Cagar Budaya</span><em class="scr" data-text="GPIB">GPIB</em></h1>
    <div class="c-div rev" style="--d:250ms">✦</div>
    <p class="c-sub rev" style="--d:330ms">Gereja Protestan di Indonesia bagian Barat — inventarisasi ${state.entries.length} bangunan cagar budaya beserta status penetapan, surat keputusan, narasi sejarah, galeri foto, dan peta sebarannya. Tersimpan terstruktur dengan direktori terpisah untuk data, CSS, JS, dan gambar.</p>
    <div class="c-meta rev" style="--d:420ms">
      <span>${pad(state.entries.length)} BANGUNAN TERDATA</span>
      <span>NASIONAL · PROVINSI · KOTA · KABUPATEN</span>
      <span>${pad(pinned)} TITIK DI PETA</span>
    </div>
    <p class="c-hint rev" style="--d:520ms">← → NAVIGASI · H SEMBUNYIKAN NAV · ⎋ RINGKASAN · E MODE EDIT · ⎙ CETAK PDF</p>
   </div>
   <div class="c-right">
    <svg class="arch-svg" viewBox="0 0 400 520" fill="none">
      <path class="draw" d="M60 500V240C60 120 140 40 200 40s140 80 140 200v260" stroke="var(--gold)" stroke-width="1.5" opacity=".9"/>
      <path class="draw d2" d="M100 500V250c0-100 55-166 100-166s100 66 100 166v250" stroke="var(--gold)" stroke-width="1.1" opacity=".55"/>
      <path class="draw d3" d="M150 500V320c0-60 22-96 50-96s50 36 50 96v180" stroke="var(--gold)" opacity=".45"/>
      <circle class="draw d3" cx="200" cy="150" r="22" stroke="var(--gold)" opacity=".5"/>
      <path class="draw d4" d="M200 8v30M186 21h28M20 500h360" stroke="var(--gold)" stroke-width="1.4" opacity=".8"/>
    </svg>
   </div>
  </div>
  <div class="glass">${"<span></span>".repeat(9)}</div>
 </section>`;
}

/* ---- Tabel & Sortir ---- */
function cmpVal(e, key) {
  switch (key) {
    case "no": return e.no;
    case "didirikan": {
      const m = String(e.didirikan || "").match(/\d{4}/);
      return m ? +m[0] : 99999;
    }
    case "status": return STATUSES.indexOf(e.status);
    case "tglSK": return parseDateID(e.tglSK);
    default: return String(e[key] || "").toLowerCase();
  }
}

function parseDateID(s) {
  const MO = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  };
  const m = String(s || "").match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) return new Date(+m[3], MO[m[2].toLowerCase()] ?? 0, +m[1]).getTime();
  const y = String(s || "").match(/\d{4}/);
  return y ? new Date(+y[0], 0, 1).getTime() : 0;
}

function sortedEntries() {
  const arr = [...state.entries], k = sortState.key, d = sortState.dir;
  arr.sort((a, b) => {
    const va = cmpVal(a, k), vb = cmpVal(b, k);
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * d;
    return String(va).localeCompare(String(vb), "id") * d;
  });
  return arr;
}

function rowsHTML(list) {
  return list.map((e, i) => `
   <tr data-go="${buildingIdx(e.id)}" style="--i:${Math.min(i, 20)}">
     <td class="ln">${pad(e.no)}</td>
     <td class="lname">${esc(e.nama)}</td>
     <td>${esc(e.didirikan) || "—"}</td>
     <td><span class="dot ${e.status}"></span>${esc(e.status)}</td>
     <td>${esc(e.sk) || "—"}</td>
     <td>${esc(e.tglSK) || "—"}</td>
     <td>${esc(e.ket) || "—"}${e.narasi ? ' <span style="color:var(--gold)">✎</span>' : ""}</td>
     <td>${e.alamat ? esc(e.alamat) : "—"} ${hasPin(e) ? '<span style="color:var(--gold)">●</span>' : ""}</td>
   </tr>`).join("");
}

function thHTML() {
  const cols = [
    ["no", "No"],
    ["nama", "Nama Jemaat"],
    ["didirikan", "Dibangun/Didirikan"],
    ["status", "Status"],
    ["sk", "Surat Keputusan / SK"],
    ["tglSK", "Tanggal SK"],
    ["ket", "Ket."],
    ["alamat", "Alamat"]
  ];
  return cols.map(([k, l]) => `<th data-sort="${k}">${l}<span class="si">${sortState.key === k ? (sortState.dir === 1 ? "▲" : "▼") : ""}</span></th>`).join("");
}

function ledgerHTML() {
  return `<section class="slide ledger-slide" data-kind="ledger">
    <p class="eyebrow rev">Daftar Isi</p>
    <h2 class="sec-title"><span class="maskline"><span class="ml-in">Daftar Status Bangunan Cagar Budaya</span></span></h2>
    <p class="sec-note rev" style="--d:180ms">${state.entries.length} bangunan terdata · klik header kolom untuk mengurutkan ▲▼ · klik baris untuk membuka slide bangunan.</p>
    <div class="ledger-wrap rev" style="--d:240ms">
      <table class="ledger">
        <thead><tr>${thHTML()}</tr></thead>
        <tbody id="ledgerBody">${rowsHTML(sortedEntries())}</tbody>
      </table>
    </div>
    <div class="folio">DAFTAR STATUS BANGUNAN CAGAR BUDAYA GPIB</div>
  </section>`;
}

function updateLedger() {
  const tb = document.getElementById("ledgerBody");
  if (tb) tb.innerHTML = rowsHTML(sortedEntries());
  deck.querySelectorAll("th[data-sort]").forEach(th => {
    th.querySelector(".si").textContent = sortState.key === th.dataset.sort ? (sortState.dir === 1 ? "▲" : "▼") : "";
  });
}

/* ---- Peta ---- */
function mapHTML() {
  const missing = state.entries.filter(e => !hasPin(e)).length;
  return `<section class="slide mapslide" data-kind="map">
    <div class="map-head">
      <div>
        <p class="eyebrow rev">Peta Sebaran</p>
        <h2 class="sec-title" style="font-size:clamp(26px,3vw,40px)"><span class="maskline"><span class="ml-in">Peta Bangunan Cagar Budaya</span></span></h2>
      </div>
      <div class="map-ctrl rev" style="--d:200ms">
        <div class="legend">${STATUSES.map(s => `<span><span class="dot ${s}"></span>${s.toUpperCase()}</span>`).join("")}</div>
        <button class="mini gold" id="bBulk" type="button">⌖ Geokode ${missing} yang belum bertitik</button>
        <span id="bulkMsg"></span>
      </div>
    </div>
    <div id="mapCanvas" class="rev" style="--d:280ms"></div>
    <div class="map-hintline">PETA GRATIS: OPENSTREETMAP + LEAFLET · KLIK MARKER UNTUK DETAIL · MODE EDIT: ISI ALAMAT, GESER MARKER, ATAU CARI TITIK</div>
    <div class="folio">PETA · CAGAR BUDAYA GPIB</div>
  </section>`;
}

/* ---- Slide Bangunan ---- */
function buildingHTML(e) {
  const n = pad(e.no), f = curFoto(e);
  const chip = editing
    ? `<select class="stsel" data-id="${e.id}">${STATUSES.map(s => `<option ${s === e.status ? "selected" : ""}>${s}</option>`).join("")}</select>`
    : `<span class="chip ${ST_CHIP[e.status]}"><i></i>${esc(e.status)}</span>`;

  const tools = `<div class="arch-tools">
     <button class="mini gold" type="button" data-up="${e.id}">＋ Unggah Foto</button>
     <button class="mini" type="button" data-path="${e.id}">＋ Path Foto Lokal</button>
     ${f ? `<button class="mini" type="button" data-fit="${e.id}">${e.fit === "contain" ? "Penuhi Bingkai" : "Pas Bingkai"}</button>
          <button class="mini" type="button" data-fdel="${e.id}:${e.mainIdx}">Hapus Foto Ini</button>` : ""}
   </div>`;

  const film = e.fotos.length ? `<div class="filmstrip rev" style="--d:500ms">${e.fotos.map((p, i) => `
     <div class="fthumb ${i === e.mainIdx ? "cur" : ""}" data-thumb="${e.id}:${i}" title="${esc(p.cap) || "Foto " + (i + 1)}">
       <img src="${p.src}" alt="">
       ${editing ? `<button class="fx" type="button" data-fdel="${e.id}:${i}">✕</button>` : ""}
     </div>`).join("")}</div>` : "";

  const cap = (f && f.cap) ? `<div class="capline rev" style="--d:540ms">“${esc(f.cap)}”</div>`
    : (f && editing ? `<div class="capline"><input type="text" data-cap="${e.id}" placeholder="Tulis keterangan foto ini…" value=""></div>`
    : (f ? `<div class="capline"></div>` : ""));

  const narasi = `<div class="narasi-box rev" style="--d:260ms">
     <div class="d-lab">Narasi · Sejarah Berdirinya</div>
     ${editing
       ? `<div class="narasi-ed ed" contenteditable="true" data-id="${e.id}" data-field="narasi">${esc(e.narasi)}</div>`
       : (e.narasi ? `<div class="narasi-ed">${esc(e.narasi)}</div>`
       : `<div class="narasi-empty">Narasi belum diisi — aktifkan Mode Edit (tombol ✎) atau isi di file data/cagar_budaya_data.js.</div>`)}
   </div>`;

  return `<section class="slide" data-kind="building" data-id="${e.id}">
  <div class="ghost">${n}</div>
  <button class="b-del" type="button" data-del="${e.id}" title="Hapus bangunan ini">✕</button>
  <div class="b-grid">
    <div class="b-left">
      <div class="arch rev" style="--d:140ms">
        <div class="arch-in" data-imgfor="${e.id}" title="${f ? "Klik untuk pratinjau layar lebar" : ""}">
          ${f ? `<img class="kb ${e.fit === "cover" ? "fit-cover" : ""}" src="${f.src}" alt="${esc(e.nama)}">`
          : `<div class="ph">${PH_SVG}<small>FOTO BELUM TERSEDIA<br>Simpan foto di folder <b>images/</b> atau gunakan tombol "＋ Unggah Foto"</small></div>`}
          <div class="plaque">NO. ${n} · ${esc(e.status).toUpperCase()}</div>
        </div>
      </div>
      ${tools}${film}${cap}
    </div>
    <div class="b-right">
      <p class="eyebrow rev" style="--d:60ms">Inventaris No. ${n}</p>
      <h2 class="b-title"><span class="maskline"><span class="ml-in"><span class="ed" contenteditable="false" data-id="${e.id}" data-field="nama">${esc(e.nama)}</span></span></span></h2>
      <div class="rev" style="--d:200ms">${chip}</div>
      ${narasi}
      <div class="b-detail rev" style="--d:340ms">
        <div><div class="d-lab">Dibangun / Didirikan</div><div class="d-val ed" contenteditable="false" data-id="${e.id}" data-field="didirikan">${esc(e.didirikan) || "—"}</div></div>
        <div><div class="d-lab">Tanggal Surat Keputusan</div><div class="d-val ed" contenteditable="false" data-id="${e.id}" data-field="tglSK">${esc(e.tglSK) || "—"}</div></div>
        <div class="span2"><div class="d-lab">Surat Keputusan / SK</div><div class="d-val ed" contenteditable="false" data-id="${e.id}" data-field="sk">${esc(e.sk) || "—"}</div></div>
        <div class="span2"><div class="d-lab">Keterangan</div><div class="d-val ed" contenteditable="false" data-id="${e.id}" data-field="ket">${esc(e.ket) || "—"}</div></div>
      </div>
      <div class="addr-box rev" style="--d:420ms">
        <div class="d-lab">Alamat ${hasPin(e) ? '<span style="color:var(--gold)">· ● TITIK TERDAFTAR DI PETA</span>' : ""}</div>
        <div class="addr-row">
          ${editing
            ? `<input class="addr-in" type="text" data-id="${e.id}" data-field="alamat" value="${esc(e.alamat)}" placeholder="Isi alamat bangunan…">`
            : `<div class="addr-value">${esc(e.alamat) || "Alamat belum diisi"}</div>`}
        </div>
        <div class="addr-row">
          <input class="coord-in" type="text" inputmode="decimal" data-id="${e.id}" data-field="lat" value="${esc(e.lat)}" placeholder="lat" ${editing ? "" : "disabled"}>
          <input class="coord-in" type="text" inputmode="decimal" data-id="${e.id}" data-field="lng" value="${esc(e.lng)}" placeholder="lng" ${editing ? "" : "disabled"}>
          <button class="mini" type="button" data-geo="${e.id}">⌖ Cari Titik</button>
          <button class="mini gold" type="button" data-viewmap="${e.id}">🗺 Lihat di Peta</button>
        </div>
      </div>
    </div>
  </div>
  <div class="folio">${n} · ${esc(e.nama)}</div>
 </section>`;
}

/* ---- Rekapitulasi ---- */
function statsHTML() {
  const counts = Object.fromEntries(STATUSES.map(s => [s, 0]));
  state.entries.forEach(e => { if (counts[e.status] !== undefined) counts[e.status]++; });
  const total = state.entries.length || 1;
  const rows = STATUSES.map((s, k) => `
   <div class="srow rev" style="--d:${k * 110}ms" data-status="${s}" title="Klik untuk memfilter daftar bangunan">
     <div class="slab">${esc(s)}</div>
     <div class="sbar"><div class="sfill ${ST_FILL[s]}" data-w="${Math.round(counts[s] / total * 100)}"></div></div>
     <div class="snum" data-n="${counts[s]}">0</div>
   </div>`).join("");

  return `<section class="slide" data-kind="stats">
   <p class="eyebrow rev">Rekapitulasi</p>
   <h2 class="sec-title"><span class="maskline"><span class="ml-in">Status Cagar Budaya</span></span></h2>
   <p class="sec-note rev" style="--d:150ms">Klik salah satu bar untuk menampilkan daftar bangunan berfilter status tersebut.</p>
   <div class="stat-grid" style="margin-top:14px">
     <div>${rows}</div>
     <div>
       <div class="stotal rev" id="stotalBox" style="--d:300ms"><span class="tn">${pad(state.entries.length)}</span><span class="tl">Bangunan<br>Terdata dalam<br>Inventaris</span></div>
       <div class="slist" id="slist"></div>
     </div>
   </div>
   <div class="folio">REKAP · CAGAR BUDAYA GPIB</div>
 </section>`;
}

function setStatFilter(st) {
  statFilter = st;
  const list = document.getElementById("slist"), tot = document.getElementById("stotalBox");
  if (!list || !tot) return;
  deck.querySelectorAll(".srow").forEach(r => r.classList.toggle("sel", !!st && r.dataset.status === st));
  if (!st) { list.style.display = "none"; tot.style.display = ""; return; }
  const items = state.entries.filter(e => e.status === st);
  list.innerHTML = `<div class="slist-head"><span>${esc(st)} · ${items.length} bangunan</span>
    <button class="mini" id="sClear" type="button">✕ Semua</button></div>` +
    items.map(e => `<button class="fcard" type="button" data-go="${buildingIdx(e.id)}">
      <span class="ln">${pad(e.no)}</span>${esc(e.nama)}<em>${esc(e.didirikan) || "—"}</em></button>`).join("");
  list.style.display = "flex"; tot.style.display = "none";
}

function countUpAll() {
  deck.querySelectorAll(".snum").forEach(el => {
    const target = +el.dataset.n;
    if (RM) { el.textContent = target; return; }
    const s = performance.now(), d = 900;
    (function f(t) {
      const p = Math.min(1, (t - s) / d);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(f);
    })(s);
  });
}

function closingHTML() {
  return `<section class="slide closing" data-kind="closing">
   <div>
    <svg width="66" height="84" viewBox="0 0 120 150" fill="none" stroke="var(--gold)" stroke-width="2" class="rev">
      <path d="M20 145V62c0-30 24-48 40-48s40 18 40 48v83"/><path d="M45 145v-38c0-14 10-22 15-22s15 8 15 22v38"/>
    </svg>
    <p class="eyebrow rev" style="--d:120ms;justify-content:center">Gereja Protestan di Indonesia bagian Barat</p>
    <h2 class="rev" style="--d:200ms">Daftar Status <em>Cagar Budaya</em></h2>
    <p class="rev" style="--d:300ms">Dokumen ini tersusun rapi dengan pemisahan direktori: data dan narasi tersimpan di <code>data/cagar_budaya_data.js</code>, tampilan di <code>css/style.css</code>, logika di <code>js/app.js</code>, dan foto dapat disimpan secara terpisah di folder <code>images/</code>.</p>
    <div class="foot rev" style="--d:420ms">DAFTAR STATUS BANGUNAN CAGAR BUDAYA GPIB</div>
   </div>
 </section>`;
}

function buildingIdx(id) { return 3 + state.entries.findIndex(e => e.id === id); }

function build() {
  deck.innerHTML = coverHTML() + ledgerHTML() + mapHTML() + state.entries.map(buildingHTML).join("") + statsHTML() + closingHTML();
  slideMeta = [...deck.querySelectorAll(".slide")].map(s => ({ kind: s.dataset.kind, id: s.dataset.id }));
  applyEditable();
  spawnDust();
  statFilter = null;
}

function applyEditable() {
  deck.querySelectorAll(".ed").forEach(el => {
    if (el.dataset.field !== "narasi") el.setAttribute("contenteditable", editing ? "true" : "false");
  });
  deck.querySelectorAll("input[data-field]").forEach(i => i.disabled = !editing);
}

function spawnDust() {
  const d = document.getElementById("dust");
  if (!d || RM) return;
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("span"), z = 2 + Math.random() * 3;
    s.style.cssText = `left:${Math.random() * 100}%;width:${z}px;height:${z}px;animation-duration:${8 + Math.random() * 9}s;animation-delay:${Math.random() * 9}s`;
    d.appendChild(s);
  }
}

/* ---------- Peta Interaktif ---------- */
function initMap() {
  if (typeof L === "undefined") {
    document.getElementById("mapCanvas").innerHTML = '<div class="ph" style="position:relative">Pustaka peta gagal dimuat — periksa koneksi internet lalu muat ulang halaman.</div>';
    return;
  }
  map = L.map("mapCanvas").setView([-4.5, 115], 5);
  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  osm.on("tileerror", () => {
    if (tileFell) return;
    tileFell = true;
    map.removeLayer(osm);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(map);
  });
  osm.addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  mapReady = true;
  refreshMarkers();
}

function refreshMarkers() {
  if (!mapReady) return;
  markerLayer.clearLayers();
  markers = {};
  state.entries.forEach(e => {
    if (!hasPin(e)) return;
    const m = L.circleMarker([+e.lat, +e.lng], {
      radius: 9,
      weight: 2,
      color: getComputedStyle(document.documentElement).getPropertyValue("--gold").trim(),
      fillColor: stColor(e.status),
      fillOpacity: .92,
      draggable: editing
    });
    m.bindPopup(popupEl(e), { maxWidth: 280 });
    if (editing) {
      m.on("dragend", () => {
        const p = m.getLatLng();
        e.lat = +p.lat.toFixed(6);
        e.lng = +p.lng.toFixed(6);
        save();
        syncInputs(e);
      });
    }
    m.addTo(markerLayer);
    markers[e.id] = m;
  });
}

function popupEl(e) {
  const d = document.createElement("div");
  d.className = "mp";
  d.innerHTML = `<div class="mp-no">NO. ${pad(e.no)} · ${esc(e.status).toUpperCase()}${e.fotos.length ? ` · ${e.fotos.length} FOTO` : ""}</div>
   <div class="mp-name">${esc(e.nama)}</div>
   <div class="mp-row"><b>Didirikan</b><span>${esc(e.didirikan) || "—"}</span></div>
   <div class="mp-row"><b>SK</b><span>${esc(e.sk) || "—"}</span></div>
   <div class="mp-row"><b>Tanggal</b><span>${esc(e.tglSK) || "—"}</span></div>
   <div class="mp-row"><b>Alamat</b><span>${esc(e.alamat) || "belum diisi"}</span></div>`;
  const b = document.createElement("button");
  b.className = "mp-open";
  b.textContent = "Buka Slide Bangunan ➜";
  b.onclick = () => { map.closePopup(); go(buildingIdx(e.id)); };
  d.appendChild(b);
  return d;
}

function syncInputs(e) {
  deck.querySelectorAll(`input[data-id="${e.id}"]`).forEach(i => {
    if (i.dataset.field === "lat") i.value = e.lat ?? "";
    if (i.dataset.field === "lng") i.value = e.lng ?? "";
    if (i.dataset.field === "alamat") i.value = e.alamat ?? "";
  });
}

function focusMap(id) {
  go(2);
  pendingFocus = id;
}

function activateMap() {
  if (!mapReady) initMap();
  setTimeout(() => {
    if (!map) return;
    map.invalidateSize();
    if (pendingFocus) {
      const e = byId(pendingFocus);
      pendingFocus = null;
      if (e) {
        if (hasPin(e)) {
          map.flyTo([+e.lat, +e.lng], 15, { duration: RM ? 0 : .9 });
          if (pulseCircle) { map.removeLayer(pulseCircle); pulseCircle = null; }
          pulseCircle = L.circle([+e.lat, +e.lng], {
            radius: 140,
            className: "pulse-ring",
            interactive: false,
            color: stColor(e.status),
            weight: 2,
            fill: false
          }).addTo(map);
          setTimeout(() => { if (pulseCircle) { map.removeLayer(pulseCircle); pulseCircle = null; } }, 5200);
          setTimeout(() => markers[e.id] && markers[e.id].openPopup(), 950);
        } else if (confirm(`${e.nama} belum memiliki titik. Cari otomatis dari nama/alamat?`)) {
          geocodeEntry(e.id, true);
        }
      }
    }
  }, 380);
}

async function geocode(q) {
  const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" + encodeURIComponent(q);
  const r = await fetch(url, { headers: { "Accept-Language": "id" } });
  const j = await r.json();
  return j[0] ? { lat: +j[0].lat, lng: +j[0].lon } : null;
}

async function geocodeEntry(id, fly) {
  const e = byId(id);
  if (!e) return false;
  const q = (e.nama + " " + (e.alamat || "")).replace(/\s+/g, " ").trim();
  const btn = deck.querySelector(`[data-geo="${id}"]`);
  if (btn) btn.textContent = "⌖ Mencari…";
  try {
    const r = await geocode(q);
    if (r) {
      e.lat = r.lat;
      e.lng = r.lng;
      save();
      syncInputs(e);
      refreshMarkers();
      if (fly && map) {
        map.flyTo([r.lat, r.lng], 15, { duration: .9 });
        setTimeout(() => markers[id] && markers[id].openPopup(), 950);
      }
      return true;
    } else {
      alert(`Titik untuk "${e.nama}" tidak ditemukan. Isi alamat lebih lengkap pada Mode Edit lalu coba lagi.`);
      return false;
    }
  } catch (err) {
    alert("Gagal menghubungi layanan geokode. Periksa koneksi internet.");
    return false;
  } finally {
    if (btn) btn.textContent = "⌖ Cari Titik";
  }
}

async function bulkGeocode() {
  const btn = document.getElementById("bBulk"), msg = document.getElementById("bulkMsg");
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  btn.style.opacity = .5;
  const missing = state.entries.filter(e => !hasPin(e));
  let ok = 0;
  for (let i = 0; i < missing.length; i++) {
    msg.textContent = `Mencari ${i + 1}/${missing.length}…`;
    if (await geocodeEntry(missing[i].id, false)) ok++;
    if (i < missing.length - 1) await new Promise(r => setTimeout(r, 1100));
  }
  msg.textContent = `Selesai: ${ok} titik ditemukan.`;
  btn.disabled = false;
  btn.style.opacity = 1;
  build();
  go(2);
}

/* ---------- Lightbox Modal ---------- */
const lb = document.getElementById("lightbox");

function openLb(id) {
  const e = byId(id);
  if (!e || !e.fotos.length) return;
  lbId = id;
  lbIdx = e.mainIdx;
  lbEdited = false;
  renderLb();
  lb.classList.add("open");
}

function renderLb() {
  const e = byId(lbId);
  if (!e) return;
  const f = e.fotos[lbIdx];
  if (!f) { closeLb(); return; }
  document.getElementById("lbImg").src = f.src;
  document.getElementById("lbMeta").textContent = `${e.nama} — Foto ${pad(lbIdx + 1)} / ${pad(e.fotos.length)}`;
  const cap = document.getElementById("lbCap");
  cap.textContent = f.cap || "";
  cap.setAttribute("contenteditable", editing ? "true" : "false");
  cap.dataset.placeholder = "1";
  const many = e.fotos.length > 1;
  document.getElementById("lbPrev").style.display = many ? "block" : "none";
  document.getElementById("lbNext").style.display = many ? "block" : "none";
}

document.getElementById("lbCap").addEventListener("input", ev => {
  const e = byId(lbId);
  if (!e) return;
  const f = e.fotos[lbIdx];
  if (!f) return;
  f.cap = ev.target.innerText.trim();
  lbEdited = true;
  save();
});

function closeLb() {
  lb.classList.remove("open");
  if (lbEdited && editing) {
    const keep = idx;
    build();
    go(keep);
  }
  lbId = null;
}

document.getElementById("lbClose").addEventListener("click", closeLb);
document.getElementById("lbPrev").addEventListener("click", () => {
  const e = byId(lbId);
  lbIdx = (lbIdx - 1 + e.fotos.length) % e.fotos.length;
  renderLb();
});
document.getElementById("lbNext").addEventListener("click", () => {
  const e = byId(lbId);
  lbIdx = (lbIdx + 1) % e.fotos.length;
  renderLb();
});
lb.addEventListener("click", ev => { if (ev.target === lb) closeLb(); });

/* ---------- Navigasi Slide ---------- */
const counter = document.getElementById("counter");
const progress = document.getElementById("progress");

function go(i) {
  const slides = [...deck.children];
  idx = Math.max(0, Math.min(i, slides.length - 1));
  slides.forEach((s, k) => s.classList.toggle("active", k === idx));
  counter.textContent = `${pad(idx + 1)} / ${pad(slides.length)}`;
  progress.style.width = (idx / (slides.length - 1) * 100) + "%";
  document.getElementById("bPrev").disabled = idx === 0;
  document.getElementById("bNext").disabled = idx === slides.length - 1;
  const m = slideMeta[idx];
  if (m.kind === "cover" && !scrambled && !RM) {
    scrambled = true;
    deck.querySelectorAll(".scr").forEach(scramble);
  }
  if (m.kind === "map") activateMap();
  if (m.kind === "stats") setTimeout(() => { fillBars(); countUpAll(); }, 150);
}

function fillBars() {
  deck.querySelectorAll(".sfill").forEach(f => f.style.width = f.dataset.w + "%");
}

const next = () => go(idx + 1);
const prev = () => go(idx - 1);

function scramble(el) {
  const final = el.dataset.text, chars = "ACDEGIMNOPRSTUV✦◆";
  if (RM) { el.textContent = final; return; }
  let frame = 0;
  const t = setInterval(() => {
    frame++;
    const reveal = Math.floor(frame / 2.2);
    let out = "";
    for (let i = 0; i < final.length; i++) {
      out += i < reveal ? final[i] : (final[i] === " " ? " " : chars[Math.floor(Math.random() * chars.length)]);
    }
    el.textContent = out;
    if (reveal >= final.length) { clearInterval(t); el.textContent = final; }
  }, 28);
}

/* ---------- Interaksi Deck ---------- */
deck.addEventListener("click", ev => {
  const g = ev.target.closest("[data-go]");
  if (g) { go(+g.dataset.go); return; }

  const th = ev.target.closest("th[data-sort]");
  if (th) {
    const k = th.dataset.sort;
    if (sortState.key === k) sortState.dir *= -1;
    else { sortState.key = k; sortState.dir = 1; }
    updateLedger();
    return;
  }

  const srow = ev.target.closest(".srow");
  if (srow) {
    const st = srow.dataset.status;
    setStatFilter(statFilter === st ? null : st);
    return;
  }

  if (ev.target.closest("#sClear")) { setStatFilter(null); return; }

  const fd = ev.target.closest("[data-fdel]");
  if (fd) {
    const [id, i] = fd.dataset.fdel.split(":");
    const e = byId(id);
    if (e) {
      e.fotos.splice(+i, 1);
      e.mainIdx = Math.min(e.mainIdx, Math.max(0, e.fotos.length - 1));
      save();
      const keep = idx;
      build();
      go(keep);
    }
    return;
  }

  const thb = ev.target.closest("[data-thumb]");
  if (thb) {
    const [id, i] = thb.dataset.thumb.split(":");
    const e = byId(id);
    if (e) {
      e.mainIdx = +i;
      save();
      const keep = idx;
      build();
      go(keep);
    }
    return;
  }

  const geo = ev.target.closest("[data-geo]");
  if (geo) { geocodeEntry(geo.dataset.geo, false); return; }

  const vm = ev.target.closest("[data-viewmap]");
  if (vm) { focusMap(vm.dataset.viewmap); return; }

  const ft = ev.target.closest("[data-fit]");
  if (ft) {
    const e = byId(ft.dataset.fit);
    if (e) {
      e.fit = e.fit === "contain" ? "cover" : "contain";
      save();
      const keep = idx;
      build();
      go(keep);
    }
    return;
  }

  const del = ev.target.closest("[data-del]");
  if (del) {
    if (confirm("Hapus bangunan ini dari daftar?")) {
      state.entries = state.entries.filter(e => e.id !== del.dataset.del);
      state.entries.forEach((e, i) => e.no = i + 1);
      save();
      build();
      go(Math.min(idx, deck.children.length - 1));
    }
    return;
  }

  const up = ev.target.closest("[data-up]");
  if (up) { openFile(up.dataset.up); return; }

  const addPath = ev.target.closest("[data-path]");
  if (addPath) {
    const id = addPath.dataset.path;
    const e = byId(id);
    if (e) {
      const p = prompt("Masukkan path relatif foto (contoh: images/b01/depan.jpg):");
      if (p && p.trim()) {
        const cap = prompt("Keterangan foto (opsional):", "") || "";
        e.fotos.push({ src: p.trim(), cap: cap.trim() });
        e.mainIdx = e.fotos.length - 1;
        save();
        const keep = idx;
        build();
        go(keep);
      }
    }
    return;
  }

  const ain = ev.target.closest(".arch-in");
  if (ain) {
    const e = byId(ain.dataset.imgfor);
    if (e) {
      if (e.fotos.length) openLb(e.id);
      else if (editing) openFile(e.id);
    }
    return;
  }
});

deck.addEventListener("input", ev => {
  const t = ev.target.closest(".ed");
  if (!t) return;
  const en = byId(t.dataset.id);
  if (!en) return;
  en[t.dataset.field] = t.innerText.replace(/\n{3,}/g, "\n\n").trim();
  save();
});

deck.addEventListener("change", ev => {
  const cap = ev.target.closest("[data-cap]");
  if (cap) {
    const e = byId(cap.dataset.cap);
    const f = curFoto(e);
    if (e && f) { f.cap = cap.value.trim(); save(); }
    return;
  }
  const inp = ev.target.closest("input[data-field]");
  if (inp) {
    const en = byId(inp.dataset.id);
    if (en) {
      en[inp.dataset.field] = inp.value.trim();
      save();
      if (inp.dataset.field === "lat" || inp.dataset.field === "lng") refreshMarkers();
    }
    return;
  }
  const sel = ev.target.closest(".stsel");
  if (sel) {
    const en = byId(sel.dataset.id);
    if (en) {
      en.status = sel.value;
      save();
      refreshMarkers();
      const keep = idx;
      build();
      go(keep);
    }
  }
});

/* ---------- Unggah Foto File ---------- */
const fileInput = document.getElementById("fileInput");

function openFile(id) {
  pendingImgId = id;
  fileInput.value = "";
  fileInput.click();
}

function downscale(file) {
  return new Promise(res => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1100, k = Math.min(1, MAX / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#1e1813";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", .82));
    };
    img.onerror = () => res(null);
    img.src = url;
  });
}

fileInput.addEventListener("change", async () => {
  const files = [...fileInput.files];
  if (!files.length || !pendingImgId) return;
  const e = byId(pendingImgId);
  if (!e) return;
  for (const f of files) {
    const src = await downscale(f);
    if (src) e.fotos.push({ src, cap: "" });
  }
  e.mainIdx = e.fotos.length - 1;
  save();
  const keep = idx;
  build();
  go(keep);
});

/* ---------- Mode Edit & Ekspor ---------- */
const bEdit = document.getElementById("bEdit");
const bExport = document.getElementById("bExport");
const bReset = document.getElementById("bReset");

function setEdit(on) {
  editing = on;
  document.body.classList.toggle("editing", on);
  bEdit.classList.toggle("on", on);
  bEdit.textContent = on ? "✓ Selesai Edit" : "✎ Mode Edit";
  if (bExport) bExport.style.display = on ? "inline-block" : "none";
  if (bReset) bReset.style.display = on ? "inline-block" : "none";
  const keep = idx;
  build();
  go(keep);
  refreshMarkers();
}

bEdit.addEventListener("click", () => setEdit(!editing));
if (bExport) bExport.addEventListener("click", exportDataFile);
if (bReset) bReset.addEventListener("click", resetToDataFile);

/* ---------- Tema & Navigasi ---------- */
const bTheme = document.getElementById("bTheme"), bNav = document.getElementById("bNav");

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  bTheme.textContent = t === "dark" ? "☀ Terang" : "☾ Gelap";
  try { localStorage.setItem("gpib-theme", t); } catch (e) {}
  refreshMarkers();
}

bTheme.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

function setNav(hide) {
  document.body.classList.toggle("hide-nav", hide);
  bNav.classList.toggle("on", hide);
  try { localStorage.setItem("gpib-nav-hidden", hide ? "1" : "0"); } catch (e) {}
}

bNav.addEventListener("click", () => setNav(!document.body.classList.contains("hide-nav")));
try { if (localStorage.getItem("gpib-theme")) setTheme(localStorage.getItem("gpib-theme")); } catch (e) {}
try { if (localStorage.getItem("gpib-nav-hidden") === "1") setNav(true); } catch (e) {}

/* ---------- Overview Navigasi Cepat ---------- */
const overview = document.getElementById("overview");

function openOv() {
  document.getElementById("ovGrid").innerHTML = slideMeta.map((m, i) => {
    let label = m.kind === "cover" ? "Sampul"
      : m.kind === "ledger" ? "Daftar Status Bangunan"
      : m.kind === "map" ? "Peta Sebaran"
      : m.kind === "stats" ? "Rekapitulasi Status"
      : m.kind === "closing" ? "Penutup"
      : (byId(m.id)?.nama || "—");
    return `<button class="ov-card" type="button" data-go="${i}" ${i === idx ? 'style="border-color:var(--gold)"' : ""}>
      <div class="tnum">SLIDE ${pad(i + 1)}</div>
      <div class="tname">${esc(label)}</div>
      <div class="tcity">${m.kind === "building" ? "BANGUNAN" : m.kind.toUpperCase()}</div>
    </button>`;
  }).join("");
  overview.classList.add("open");
}

function closeOv() { overview.classList.remove("open"); }

document.getElementById("bRingkas").addEventListener("click", () => overview.classList.contains("open") ? closeOv() : openOv());
document.getElementById("bCloseOv").addEventListener("click", closeOv);
overview.addEventListener("click", ev => {
  const g = ev.target.closest("[data-go]");
  if (g) { go(+g.dataset.go); closeOv(); }
});

/* ---------- Tombol & Keyboard Shortcuts ---------- */
document.getElementById("bPrint").addEventListener("click", () => {
  if (map) map.invalidateSize();
  window.print();
});

document.getElementById("bFull").addEventListener("click", () => {
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
});

document.getElementById("bPrev").addEventListener("click", prev);
document.getElementById("bNext").addEventListener("click", next);
document.addEventListener("click", ev => { if (ev.target.closest("#bBulk")) bulkGeocode(); }, true);

document.addEventListener("keydown", ev => {
  if (lb.classList.contains("open")) {
    const t = ev.target;
    if (t.isContentEditable) { if (ev.key === "Escape") t.blur(); return; }
    const e = byId(lbId);
    if (ev.key === "Escape") closeLb();
    else if (e && e.fotos.length > 1) {
      if (ev.key === "ArrowRight") { lbIdx = (lbIdx + 1) % e.fotos.length; renderLb(); }
      else if (ev.key === "ArrowLeft") { lbIdx = (lbIdx - 1 + e.fotos.length) % e.fotos.length; renderLb(); }
    }
    return;
  }
  const t = ev.target;
  if (t.isContentEditable || ["SELECT", "INPUT", "TEXTAREA"].includes(t.tagName)) {
    if (ev.key === "Escape") t.blur();
    return;
  }
  if (ev.key === "ArrowRight" || ev.key === "PageDown" || ev.key === " ") {
    ev.preventDefault(); next();
  } else if (ev.key === "ArrowLeft" || ev.key === "PageUp") {
    ev.preventDefault(); prev();
  } else if (ev.key === "Home") {
    go(0);
  } else if (ev.key === "End") {
    go(deck.children.length - 1);
  } else if (ev.key === "Escape") {
    overview.classList.contains("open") ? closeOv() : openOv();
  } else if (ev.key.toLowerCase() === "e") {
    setEdit(!editing);
  } else if (ev.key.toLowerCase() === "h") {
    setNav(!document.body.classList.contains("hide-nav"));
  }
});

let tx = 0, ty = 0;
document.addEventListener("touchstart", e => {
  tx = e.touches[0].clientX;
  ty = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", e => {
  if (e.target.closest && e.target.closest("#mapCanvas")) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    dx < 0 ? next() : prev();
  }
}, { passive: true });

window.addEventListener("beforeprint", () => {
  fillBars();
  if (map) map.invalidateSize();
});

window.addEventListener("resize", () => {
  if (map && slideMeta[idx]?.kind === "map") map.invalidateSize();
});

/* Inisialisasi awal */
build();
go(0);
