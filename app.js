/**
 * Nano-Vertriebstool – App-Logik.
 * Vanilla JS, kein Build-Schritt. Läuft offline per Doppelklick auf index.html.
 */

/* ============================================================
   Utils
   ============================================================ */

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatCurrency(n) {
  return (n || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function formatNumber(n, digits = 2) {
  return (n || 0).toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function todayISODate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function slugify(text) {
  return (text || 'kunde')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'kunde';
}

/* ============================================================
   Kalkulations-Engine (pure Funktionen, für Tests exponiert)
   ============================================================ */

function ceilTo20(m2) {
  const val = Number(m2) || 0;
  if (val <= 0) return 0;
  return Math.ceil(val / 20) * 20;
}

const SYSTEM_ORDER = ['fassade', 'innen', 'dach', 'boden', 'industrie'];

/**
 * Baut die Positionsliste aus dem State (Abschnitt 4 des Plans).
 * Reine Funktion: state -> { positionen, gesamtM2 }
 */
function buildPositionenFromState(state) {
  const positionen = [];
  let pos = 1;
  let gesamtM2 = 0;

  function addPos({ produktId, name, beschreibung, bemerkung, menge, einheit, einzelpreisNetto }) {
    const gesamtNetto = round2(menge * einzelpreisNetto);
    positionen.push({
      pos: pos++,
      produktId,
      name,
      beschreibung,
      bemerkung: bemerkung || '',
      menge: round2(menge),
      einheit,
      einzelpreisNetto: round2(einzelpreisNetto),
      rabattProzent: 0,
      gesamtNetto,
    });
    return gesamtNetto;
  }

  for (const key of SYSTEM_ORDER) {
    const sys = state.systeme[key];
    if (!sys || !sys.gewaehlt) continue;
    const m2Eingabe = Number(sys.m2Eingabe) || 0;
    if (m2Eingabe <= 0) continue;

    const m2Berechnet = ceilTo20(m2Eingabe);
    const gebinde = m2Berechnet / 20;
    const product = PRODUCTS[key];

    addPos({
      produktId: product.id,
      name: product.name,
      beschreibung: product.description,
      bemerkung: sys.hinweis || '',
      menge: gebinde,
      einheit: product.unit,
      einzelpreisNetto: product.preisNetto,
    });

    gesamtM2 += m2Berechnet;

    if (sys.vorNachbereitung) {
      addPos({
        produktId: PRODUCTS.vorNach.id,
        name: PRODUCTS.vorNach.name,
        beschreibung: PRODUCTS.vorNach.description,
        bemerkung: '',
        menge: m2Berechnet,
        einheit: PRODUCTS.vorNach.unit,
        einzelpreisNetto: PRODUCTS.vorNach.preisNetto,
      });
    }

    const geruest = sys.geruest;
    if (geruest && (geruest.art === 'Gerüst' || geruest.art === 'Steiger') && Number(geruest.m2) > 0) {
      addPos({
        produktId: PRODUCTS.geruest.id,
        name: PRODUCTS.geruest.name,
        beschreibung: PRODUCTS.geruest.description,
        bemerkung: '',
        menge: Number(geruest.m2),
        einheit: PRODUCTS.geruest.unit,
        einzelpreisNetto: PRODUCTS.geruest.preisNetto,
      });
    }

    // Farben-/Kleinschäden-Pauschale: NUR Fassade, auf die gesamte aufgerundete Fassadenfläche (§ 4 AGB).
    if (key === 'fassade') {
      const farbenJa = !!(sys.weitereFarben && sys.weitereFarben.ja);
      const schaedenJa = !!(sys.beschaedigungen && sys.beschaedigungen.ja);
      if (farbenJa || schaedenJa) {
        addPos({
          produktId: PRODUCTS.farbenSchaeden.id,
          name: PRODUCTS.farbenSchaeden.name,
          beschreibung: PRODUCTS.farbenSchaeden.description,
          bemerkung: '',
          menge: m2Berechnet,
          einheit: PRODUCTS.farbenSchaeden.unit,
          einzelpreisNetto: PRODUCTS.farbenSchaeden.preisNetto,
        });
      }
    }
  }

  // Mindermengenzuschlag: genau eine Position, Stufe = Gesamtfläche (immer Vielfaches von 20).
  let mindermengenzuschlag = null;
  if (gesamtM2 > 0 && gesamtM2 <= 140) {
    const stufe = MMZ_STAFFEL.find((s) => s.stufe === gesamtM2);
    if (stufe) {
      const gesamtNetto = addPos({
        produktId: stufe.id,
        name: `Mindermengenzuschlag ${gesamtM2} m²`,
        beschreibung: 'Zuschlag für Mehrkosten aufgrund eines geringen m² Aufkommens.',
        bemerkung: '',
        menge: 1,
        einheit: 'pauschal',
        einzelpreisNetto: stufe.betrag,
      });
      mindermengenzuschlag = { stufe: gesamtM2, betrag: stufe.betrag, gesamtNetto };
    }
  }

  return { positionen, gesamtM2, mindermengenzuschlag };
}

/**
 * Summenbildung (Abschnitt 4, "Summen"): reine Funktion auf einer Positionsliste.
 * Dient auch als direkter Kontrollrechnungs-Test gegen Q-00017.
 */
function calcSummen(positionen) {
  const zwischensummeNetto = round2(positionen.reduce((sum, p) => sum + p.gesamtNetto, 0));
  // MwSt. wird je Position berechnet, gerundet und aufsummiert (so auch im Musterangebot Q-00017;
  // weicht bei mehreren Positionen von "Summe * 19%" um Rundungscent ab).
  const mwst = round2(positionen.reduce((sum, p) => sum + round2(p.gesamtNetto * PRICES.mwstSatz), 0));
  const brutto = round2(zwischensummeNetto + mwst);
  const zahlungsplan = {
    anzahlung60: round2(brutto * PRICES.zahlungsplan.anzahlung),
    terminbestaetigung20: round2(brutto * PRICES.zahlungsplan.termin),
    abnahme20: round2(brutto * PRICES.zahlungsplan.abnahme),
  };
  return { zwischensummeNetto, mwstSatz: PRICES.mwstSatz, mwst, brutto, zahlungsplan };
}

function calcAngebot(state) {
  const { positionen, gesamtM2, mindermengenzuschlag } = buildPositionenFromState(state);
  const summen = calcSummen(positionen);
  summen.gesamtM2 = gesamtM2;
  summen.mindermengenzuschlag = mindermengenzuschlag;
  return { positionen, summen };
}

/* ============================================================
   State
   ============================================================ */

const STORAGE_KEY = 'nano-vertrieb-state';

function defaultSystemState(key) {
  const base = {
    gewaehlt: false,
    m2Eingabe: null,
    untergrund: (UNTERGRUND_OPTIONEN[key] || [])[0] || '',
    hinweis: '',
    vorNachbereitung: true,
  };
  if (key === 'fassade') {
    return Object.assign(base, {
      weitereFarben: { ja: false, anzahl: 1 },
      beschaedigungen: { ja: false, beschreibung: '' },
      geruest: { art: 'Nein', m2: null },
      zugangFrei: true,
      geschosse: '',
    });
  }
  if (key === 'innen') {
    return Object.assign(base, {
      bewohnt: true,
      zugaenglich: 'ja',
      decken: false,
      feuchte: { ja: false, beschreibung: '' },
      geruest: { art: 'Nein', m2: null },
    });
  }
  if (key === 'dach') {
    return Object.assign(base, {
      dachform: 'Flachdach',
      geruest: { art: 'Nein', m2: null },
      aufbauten: { frei: true, hinweis: '' },
    });
  }
  if (key === 'boden') {
    return Object.assign(base, {
      nutzung: 'Wohnen',
      geraeumtSperrung: true,
      feuchtigkeit: { ja: false, beschreibung: '' },
    });
  }
  if (key === 'industrie') {
    return Object.assign(base, {
      anwendung: 'Halle/Gebäudehülle',
      betriebstemperatur: { relevant: false, hinweis: '' },
      ausfuehrung: 'laufender Betrieb',
      geruest: { art: 'Nein', m2: null },
    });
  }
  return base;
}

function defaultState() {
  return {
    meta: {
      tool: 'nano-vertriebstool',
      version: '1.1',
      erstelltAm: new Date().toISOString(),
      gueltigTage: 14,
      ansprechpartner: 'Markus Schlegel',
    },
    kunde: {
      name: '',
      objekt: '',
      notizen: '',
      rechnungsadresse: { name: '', strasse: '', plz: '', ort: '', land: 'Deutschland' },
      lieferadresseWieRechnung: true,
      lieferadresse: { name: '', strasse: '', plz: '', ort: '', land: 'Deutschland' },
    },
    systeme: {
      fassade: defaultSystemState('fassade'),
      innen: defaultSystemState('innen'),
      dach: defaultSystemState('dach'),
      boden: defaultSystemState('boden'),
      industrie: defaultSystemState('industrie'),
    },
    ui: { currentSlide: 'titel', ablaufErledigt: [] },
  };
}

let state = defaultState();

function saveState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* sessionStorage kann in seltenen Fällen (privates Fenster, voller Speicher) fehlschlagen */
  }
}

function loadStateFromSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.meta && parsed.meta.tool === 'nano-vertriebstool') {
      state = parsed;
      return true;
    }
  } catch (e) {
    /* korrupter Session-State wird ignoriert, Default bleibt aktiv */
  }
  return false;
}

function isStateEmpty(s) {
  const k = s.kunde;
  const hasKunde = k.name || k.objekt || k.rechnungsadresse.name || k.rechnungsadresse.strasse;
  const hasSystem = SYSTEM_ORDER.some((key) => s.systeme[key].gewaehlt);
  return !hasKunde && !hasSystem;
}

/* ============================================================
   Slide-Engine
   ============================================================ */

const SLIDE_ORDER_A = ['titel', 'problem', 'loesung', 'uwert', 'systeme', 'ablauf'];
const SLIDE_ORDER_B = ['b-fassade', 'b-innen', 'b-dach', 'b-boden', 'b-industrie'];
const SLIDE_ORDER_C = ['angebot', 'abschluss'];
const SLIDE_TO_SYSTEM = { 'b-fassade': 'fassade', 'b-innen': 'innen', 'b-dach': 'dach', 'b-boden': 'boden', 'b-industrie': 'industrie' };

function getVisibleSlides() {
  const bSlides = SLIDE_ORDER_B.filter((id) => state.systeme[SLIDE_TO_SYSTEM[id]].gewaehlt);
  return [...SLIDE_ORDER_A, ...bSlides, ...SLIDE_ORDER_C];
}

function goToSlide(slideId) {
  const visible = getVisibleSlides();
  if (!visible.includes(slideId)) slideId = visible[0];
  state.ui.currentSlide = slideId;
  document.querySelectorAll('.slide').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.slideId === slideId);
  });
  renderSlideContent(slideId);
  renderNav();
  saveState();
  window.scrollTo(0, 0);
}

function navigate(delta) {
  const visible = getVisibleSlides();
  const idx = visible.indexOf(state.ui.currentSlide);
  const nextIdx = Math.min(Math.max(idx + delta, 0), visible.length - 1);
  goToSlide(visible[nextIdx]);
}

function getStepMeta(slideId) {
  if (SLIDE_TO_SYSTEM[slideId]) {
    const sysKey = SLIDE_TO_SYSTEM[slideId];
    const meta = SYSTEME_META.find((m) => m.key === sysKey);
    return { label: meta.titel, icon: SYSTEM_ICONS[meta.icon] };
  }
  return NAV_STEPS[slideId] || { label: slideId, icon: '' };
}

function renderNav() {
  const visible = getVisibleSlides();
  const idx = visible.indexOf(state.ui.currentSlide);

  const timelineEl = document.getElementById('slide-dots');
  timelineEl.innerHTML = '';
  visible.forEach((id, i) => {
    if (i > 0) {
      const connector = document.createElement('span');
      connector.className = 'timeline-connector' + (i <= idx ? ' is-done' : '');
      timelineEl.appendChild(connector);
    }
    const { label, icon } = getStepMeta(id);
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'timeline-node' + (i === idx ? ' is-active' : i < idx ? ' is-done' : '');
    node.title = label;
    node.setAttribute('aria-label', `${label} (Slide ${i + 1} von ${visible.length})`);
    node.innerHTML = icon;
    node.addEventListener('click', () => goToSlide(id));
    timelineEl.appendChild(node);
  });

  const isFirst = idx <= 0;
  const isLast = idx >= visible.length - 1;
  document.getElementById('btn-zurueck').disabled = isFirst;
  document.getElementById('btn-weiter').disabled = isLast;
  document.getElementById('arrow-prev').disabled = isFirst;
  document.getElementById('arrow-next').disabled = isLast;
}

/* ============================================================
   Statische Inhalte rendern (einmalig)
   ============================================================ */

function renderStaticContent() {
  // Claim (Slide 1)
  document.getElementById('claim-headline').textContent = TEXTS.claimHeadline;
  document.getElementById('claim-subtitle').textContent = TEXTS.claimSubtitle;

  // Problem-Cards
  const problemEl = document.getElementById('problem-cards');
  problemEl.innerHTML = TEXTS.problem
    .map((p) => `<div class="card"><h3>${p.titel}</h3><p class="muted">${p.text}</p></div>`)
    .join('');

  // Kenndaten-Grid (Slide 3)
  const kd = KENNDATEN;
  document.getElementById('kenndaten-grid').innerHTML = `
    <div class="kv"><strong>${kd.lambda}</strong>Lambda-Wert λ</div>
    <div class="kv"><strong>${kd.rWert}</strong>R-Wert bei 1 mm</div>
    <div class="kv"><strong>${kd.systemwert}</strong>Systemwert U (Herstellerangabe)</div>
    <div class="kv"><strong>Klasse ${kd.brandklasse}</strong>Brandklasse</div>
    <div class="kv"><strong>${kd.bauaufsicht}</strong>Bauaufsichtliche Grundlage</div>
  `;

  // U-Wert-Balkendiagramm (Slide 4)
  const max = Math.max(...UWERT_VERGLEICH.map((d) => d.wert));
  document.getElementById('uwert-chart').innerHTML = UWERT_VERGLEICH.map((d) => {
    const pct = Math.max((d.wert / max) * 100, 3);
    return `<div class="uwert-row">
      <span>${d.label}</span>
      <span class="uwert-bar-track"><span class="uwert-bar${d.highlight ? ' highlight' : ''}" style="width:${pct}%"></span></span>
      <span class="uwert-value">${formatNumber(d.wert, 3).replace(/,?0+$/, '').replace(/,$/, '')}</span>
    </div>`;
  }).join('');
  document.getElementById('uwert-footnote').textContent = TEXTS.uwertHinweis;

  // System-Cards (Slide 5, Toggles)
  renderSystemCards();

  // Ablauf-Steps (Slide 6)
  renderAblaufSteps();

  // Untergrund-Dropdowns je System
  SYSTEM_ORDER.forEach((key) => {
    const select = document.getElementById(`${key}-untergrund`);
    if (!select) return;
    select.innerHTML = UNTERGRUND_OPTIONEN[key].map((o) => `<option value="${o}">${o}</option>`).join('');
  });
}

function renderSystemCards() {
  const el = document.getElementById('systeme-cards');
  el.innerHTML = SYSTEME_META.map((m) => {
    const selected = state.systeme[m.key].gewaehlt;
    return `<div class="card system-card${selected ? ' is-selected' : ''}" data-toggle-system="${m.key}">
      <div class="system-card__check">${selected ? '✓' : ''}</div>
      <div class="system-card__icon">${SYSTEM_ICONS[m.icon] || ''}</div>
      <h3>${m.titel}</h3>
      <p class="muted">${m.kurz}</p>
      <p class="muted" style="font-size:12px;">${m.aufbau}</p>
    </div>`;
  }).join('');

  el.querySelectorAll('[data-toggle-system]').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.toggleSystem;
      state.systeme[key].gewaehlt = !state.systeme[key].gewaehlt;
      renderSystemCards();
      renderNav();
      saveState();
    });
  });
}

function renderAblaufSteps() {
  const el = document.getElementById('ablauf-steps');
  const rowsPerColumn = Math.ceil(TEXTS.ablauf.length / 2);
  el.style.setProperty('--ablauf-rows', rowsPerColumn);

  el.innerHTML = TEXTS.ablauf
    .map((s, i) => {
      const done = state.ui.ablaufErledigt.includes(s.nr);
      const classes = ['ablauf-step'];
      if (done) classes.push('is-done');
      if (s.optional) classes.push('is-optional');
      if (/[a-z]$/i.test(s.nr) && s.nr.length > 1) classes.push('is-substep');
      if (i === rowsPerColumn - 1) classes.push('is-col-end');
      const badge = s.optional ? '<span class="ablauf-step__badge">Optional</span>' : '';
      return `<div class="${classes.join(' ')}" data-ablauf-nr="${s.nr}">
        <span class="ablauf-step__marker-wrap"><button type="button" class="ablauf-step__marker" aria-pressed="${done}">${s.nr}</button></span>
        <span class="ablauf-step__body"><span class="ablauf-step__text">${s.text}</span>${badge}</span>
      </div>`;
    })
    .join('');

  el.querySelectorAll('.ablauf-step__marker').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nr = btn.closest('.ablauf-step').dataset.ablaufNr;
      const idx = state.ui.ablaufErledigt.indexOf(nr);
      if (idx >= 0) state.ui.ablaufErledigt.splice(idx, 1);
      else state.ui.ablaufErledigt.push(nr);
      renderAblaufSteps();
      saveState();
    });
  });
}

/* ============================================================
   Adress-Bindung (Slide 1)
   ============================================================ */

function bindAddressFields() {
  const rechFields = ['name', 'strasse', 'plz', 'ort', 'land'];
  rechFields.forEach((f) => {
    document.getElementById(`rech-${f}`).addEventListener('input', (e) => {
      state.kunde.rechnungsadresse[f] = e.target.value;
      saveState();
    });
    document.getElementById(`liefer-${f}`).addEventListener('input', (e) => {
      state.kunde.lieferadresse[f] = e.target.value;
      saveState();
    });
  });

  document.getElementById('kunde-name').addEventListener('input', (e) => {
    state.kunde.name = e.target.value;
    saveState();
  });
  document.getElementById('kunde-objekt').addEventListener('input', (e) => {
    state.kunde.objekt = e.target.value;
    saveState();
  });

  const wieRechnungCb = document.getElementById('liefer-wie-rechnung');
  wieRechnungCb.addEventListener('change', (e) => {
    state.kunde.lieferadresseWieRechnung = e.target.checked;
    document.getElementById('liefer-adresse-felder').hidden = e.target.checked;
    saveState();
  });
}

function syncFormFromState() {
  document.getElementById('kunde-name').value = state.kunde.name;
  document.getElementById('kunde-objekt').value = state.kunde.objekt;
  ['name', 'strasse', 'plz', 'ort', 'land'].forEach((f) => {
    document.getElementById(`rech-${f}`).value = state.kunde.rechnungsadresse[f];
    document.getElementById(`liefer-${f}`).value = state.kunde.lieferadresse[f];
  });
  document.getElementById('liefer-wie-rechnung').checked = state.kunde.lieferadresseWieRechnung;
  document.getElementById('liefer-adresse-felder').hidden = state.kunde.lieferadresseWieRechnung;

  SYSTEM_ORDER.forEach((key) => syncSystemFormFromState(key));
  renderSystemCards();
}

/* ============================================================
   Kalkulationsslides (Teil B) – generisch je System
   ============================================================ */

function syncSystemFormFromState(key) {
  const sys = state.systeme[key];
  const flaeche = document.getElementById(`${key}-flaeche`);
  if (!flaeche) return;
  flaeche.value = sys.m2Eingabe || '';
  document.getElementById(`${key}-untergrund`).value = sys.untergrund;
  document.getElementById(`${key}-hinweis`).value = sys.hinweis;
  document.getElementById(`${key}-vornach`).checked = sys.vorNachbereitung;

  if (key === 'fassade') {
    setRadio('fassade-farben-ja', sys.weitereFarben.ja ? 'ja' : 'nein');
    document.getElementById('fassade-farben-anzahl-wrap').hidden = !sys.weitereFarben.ja;
    document.getElementById('fassade-farben-anzahl').value = sys.weitereFarben.anzahl;
    setRadio('fassade-schaeden-ja', sys.beschaedigungen.ja ? 'ja' : 'nein');
    document.getElementById('fassade-schaeden-desc-wrap').hidden = !sys.beschaedigungen.ja;
    document.getElementById('fassade-schaeden-desc').value = sys.beschaedigungen.beschreibung;
    setRadio('fassade-geruest-art', sys.geruest.art);
    document.getElementById('fassade-geruest-m2-wrap').hidden = sys.geruest.art === 'Nein';
    document.getElementById('fassade-geruest-m2').value = sys.geruest.m2 || '';
    document.getElementById('fassade-geschosse').value = sys.geschosse;
    document.getElementById('fassade-zugang-frei').checked = sys.zugangFrei;
  }
  if (key === 'innen') {
    setRadio('innen-bewohnt', sys.bewohnt ? 'ja' : 'nein');
    document.getElementById('innen-zugaenglich').value = sys.zugaenglich;
    document.getElementById('innen-decken').checked = sys.decken;
    setRadio('innen-feuchte-ja', sys.feuchte.ja ? 'ja' : 'nein');
    document.getElementById('innen-feuchte-desc-wrap').hidden = !sys.feuchte.ja;
    document.getElementById('innen-feuchte-desc').value = sys.feuchte.beschreibung;
    setRadio('innen-geruest-art', sys.geruest.art);
    document.getElementById('innen-geruest-m2-wrap').hidden = sys.geruest.art === 'Nein';
    document.getElementById('innen-geruest-m2').value = sys.geruest.m2 || '';
  }
  if (key === 'dach') {
    setRadio('dach-form', sys.dachform);
    setRadio('dach-zugang', sys.geruest.art);
    document.getElementById('dach-geruest-m2-wrap').hidden = !(sys.geruest.art === 'Gerüst' || sys.geruest.art === 'Steiger');
    document.getElementById('dach-geruest-m2').value = sys.geruest.m2 || '';
    document.getElementById('dach-psa-hinweis').hidden = sys.geruest.art !== 'PSA';
    setRadio('dach-aufbauten-frei', sys.aufbauten.frei ? 'ja' : 'nein');
    document.getElementById('dach-aufbauten-hinweis-wrap').hidden = sys.aufbauten.frei;
    document.getElementById('dach-aufbauten-hinweis').value = sys.aufbauten.hinweis;
  }
  if (key === 'boden') {
    document.getElementById('boden-nutzung').value = sys.nutzung;
    setRadio('boden-geraeumt', sys.geraeumtSperrung ? 'ja' : 'nein');
    setRadio('boden-feuchte-ja', sys.feuchtigkeit.ja ? 'ja' : 'nein');
  }
  if (key === 'industrie') {
    document.getElementById('industrie-anwendung').value = sys.anwendung;
    setRadio('industrie-temp-ja', sys.betriebstemperatur.relevant ? 'ja' : 'nein');
    document.getElementById('industrie-temp-desc-wrap').hidden = !sys.betriebstemperatur.relevant;
    document.getElementById('industrie-temp-desc').value = sys.betriebstemperatur.hinweis;
    document.getElementById('industrie-ausfuehrung').value = sys.ausfuehrung;
    setRadio('industrie-geruest-art', sys.geruest.art);
    document.getElementById('industrie-geruest-m2-wrap').hidden = sys.geruest.art === 'Nein';
    document.getElementById('industrie-geruest-m2').value = sys.geruest.m2 || '';
  }

  updateLiveCalc(key);
}

function setRadio(name, value) {
  const radios = document.getElementsByName(name);
  radios.forEach((r) => (r.checked = r.value === value));
}

function getRadioValue(name) {
  const radios = document.getElementsByName(name);
  for (const r of radios) if (r.checked) return r.value;
  return null;
}

function updateLiveCalc(key) {
  const el = document.getElementById(`${key}-live`);
  if (!el) return;
  const sys = state.systeme[key];
  const m2Eingabe = Number(sys.m2Eingabe) || 0;
  if (m2Eingabe <= 0) {
    el.textContent = 'Bitte Fläche eingeben.';
    return;
  }
  const m2Berechnet = ceilTo20(m2Eingabe);
  const gebinde = m2Berechnet / 20;
  const gesamt = gebinde * PRODUCTS[key].preisNetto;
  el.textContent = `${formatNumber(m2Eingabe, m2Eingabe % 1 === 0 ? 0 : 2)} m² → ${gebinde} Gebinde (${m2Berechnet} m²) = ${formatCurrency(gesamt)}`;
}

function wireSystemSlides() {
  SYSTEM_ORDER.forEach((key) => {
    const flaeche = document.getElementById(`${key}-flaeche`);
    if (!flaeche) return;
    const sys = () => state.systeme[key];

    flaeche.addEventListener('input', (e) => {
      sys().m2Eingabe = e.target.value === '' ? null : Number(e.target.value);
      updateLiveCalc(key);
      saveState();
    });
    document.getElementById(`${key}-untergrund`).addEventListener('change', (e) => {
      sys().untergrund = e.target.value;
      saveState();
    });
    document.getElementById(`${key}-hinweis`).addEventListener('input', (e) => {
      sys().hinweis = e.target.value;
      saveState();
    });
    document.getElementById(`${key}-vornach`).addEventListener('change', (e) => {
      sys().vorNachbereitung = e.target.checked;
      saveState();
    });
  });

  // Fassade-spezifisch
  document.getElementsByName('fassade-farben-ja').forEach((r) =>
    r.addEventListener('change', () => {
      const ja = getRadioValue('fassade-farben-ja') === 'ja';
      state.systeme.fassade.weitereFarben.ja = ja;
      document.getElementById('fassade-farben-anzahl-wrap').hidden = !ja;
      saveState();
    })
  );
  document.getElementById('fassade-farben-anzahl').addEventListener('input', (e) => {
    state.systeme.fassade.weitereFarben.anzahl = Number(e.target.value) || 1;
    saveState();
  });
  document.getElementsByName('fassade-schaeden-ja').forEach((r) =>
    r.addEventListener('change', () => {
      const ja = getRadioValue('fassade-schaeden-ja') === 'ja';
      state.systeme.fassade.beschaedigungen.ja = ja;
      document.getElementById('fassade-schaeden-desc-wrap').hidden = !ja;
      saveState();
    })
  );
  document.getElementById('fassade-schaeden-desc').addEventListener('input', (e) => {
    state.systeme.fassade.beschaedigungen.beschreibung = e.target.value;
    saveState();
  });
  document.getElementsByName('fassade-geruest-art').forEach((r) =>
    r.addEventListener('change', () => {
      const art = getRadioValue('fassade-geruest-art');
      state.systeme.fassade.geruest.art = art;
      document.getElementById('fassade-geruest-m2-wrap').hidden = art === 'Nein';
      saveState();
    })
  );
  document.getElementById('fassade-geruest-m2').addEventListener('input', (e) => {
    state.systeme.fassade.geruest.m2 = e.target.value === '' ? null : Number(e.target.value);
    saveState();
  });
  document.getElementById('fassade-geschosse').addEventListener('input', (e) => {
    state.systeme.fassade.geschosse = e.target.value;
    saveState();
  });
  document.getElementById('fassade-zugang-frei').addEventListener('change', (e) => {
    state.systeme.fassade.zugangFrei = e.target.checked;
    saveState();
  });

  // Innen-spezifisch
  document.getElementsByName('innen-bewohnt').forEach((r) =>
    r.addEventListener('change', () => {
      state.systeme.innen.bewohnt = getRadioValue('innen-bewohnt') === 'ja';
      saveState();
    })
  );
  document.getElementById('innen-zugaenglich').addEventListener('change', (e) => {
    state.systeme.innen.zugaenglich = e.target.value;
    saveState();
  });
  document.getElementById('innen-decken').addEventListener('change', (e) => {
    state.systeme.innen.decken = e.target.checked;
    saveState();
  });
  document.getElementsByName('innen-feuchte-ja').forEach((r) =>
    r.addEventListener('change', () => {
      const ja = getRadioValue('innen-feuchte-ja') === 'ja';
      state.systeme.innen.feuchte.ja = ja;
      document.getElementById('innen-feuchte-desc-wrap').hidden = !ja;
      saveState();
    })
  );
  document.getElementById('innen-feuchte-desc').addEventListener('input', (e) => {
    state.systeme.innen.feuchte.beschreibung = e.target.value;
    saveState();
  });
  document.getElementsByName('innen-geruest-art').forEach((r) =>
    r.addEventListener('change', () => {
      const art = getRadioValue('innen-geruest-art');
      state.systeme.innen.geruest.art = art;
      document.getElementById('innen-geruest-m2-wrap').hidden = art === 'Nein';
      saveState();
    })
  );
  document.getElementById('innen-geruest-m2').addEventListener('input', (e) => {
    state.systeme.innen.geruest.m2 = e.target.value === '' ? null : Number(e.target.value);
    saveState();
  });

  // Dach-spezifisch
  document.getElementsByName('dach-form').forEach((r) =>
    r.addEventListener('change', () => {
      state.systeme.dach.dachform = getRadioValue('dach-form');
      saveState();
    })
  );
  document.getElementsByName('dach-zugang').forEach((r) =>
    r.addEventListener('change', () => {
      const art = getRadioValue('dach-zugang');
      state.systeme.dach.geruest.art = art;
      document.getElementById('dach-geruest-m2-wrap').hidden = !(art === 'Gerüst' || art === 'Steiger');
      document.getElementById('dach-psa-hinweis').hidden = art !== 'PSA';
      saveState();
    })
  );
  document.getElementById('dach-geruest-m2').addEventListener('input', (e) => {
    state.systeme.dach.geruest.m2 = e.target.value === '' ? null : Number(e.target.value);
    saveState();
  });
  document.getElementsByName('dach-aufbauten-frei').forEach((r) =>
    r.addEventListener('change', () => {
      const frei = getRadioValue('dach-aufbauten-frei') === 'ja';
      state.systeme.dach.aufbauten.frei = frei;
      document.getElementById('dach-aufbauten-hinweis-wrap').hidden = frei;
      saveState();
    })
  );
  document.getElementById('dach-aufbauten-hinweis').addEventListener('input', (e) => {
    state.systeme.dach.aufbauten.hinweis = e.target.value;
    saveState();
  });

  // Boden-spezifisch
  document.getElementById('boden-nutzung').addEventListener('change', (e) => {
    state.systeme.boden.nutzung = e.target.value;
    saveState();
  });
  document.getElementsByName('boden-geraeumt').forEach((r) =>
    r.addEventListener('change', () => {
      state.systeme.boden.geraeumtSperrung = getRadioValue('boden-geraeumt') === 'ja';
      saveState();
    })
  );
  document.getElementsByName('boden-feuchte-ja').forEach((r) =>
    r.addEventListener('change', () => {
      state.systeme.boden.feuchtigkeit.ja = getRadioValue('boden-feuchte-ja') === 'ja';
      saveState();
    })
  );

  // Industrie-spezifisch
  document.getElementById('industrie-anwendung').addEventListener('change', (e) => {
    state.systeme.industrie.anwendung = e.target.value;
    saveState();
  });
  document.getElementsByName('industrie-temp-ja').forEach((r) =>
    r.addEventListener('change', () => {
      const ja = getRadioValue('industrie-temp-ja') === 'ja';
      state.systeme.industrie.betriebstemperatur.relevant = ja;
      document.getElementById('industrie-temp-desc-wrap').hidden = !ja;
      saveState();
    })
  );
  document.getElementById('industrie-temp-desc').addEventListener('input', (e) => {
    state.systeme.industrie.betriebstemperatur.hinweis = e.target.value;
    saveState();
  });
  document.getElementById('industrie-ausfuehrung').addEventListener('change', (e) => {
    state.systeme.industrie.ausfuehrung = e.target.value;
    saveState();
  });
  document.getElementsByName('industrie-geruest-art').forEach((r) =>
    r.addEventListener('change', () => {
      const art = getRadioValue('industrie-geruest-art');
      state.systeme.industrie.geruest.art = art;
      document.getElementById('industrie-geruest-m2-wrap').hidden = art === 'Nein';
      saveState();
    })
  );
  document.getElementById('industrie-geruest-m2').addEventListener('input', (e) => {
    state.systeme.industrie.geruest.m2 = e.target.value === '' ? null : Number(e.target.value);
    saveState();
  });
}

/* ============================================================
   Angebotsübersicht (Slide 7) + Abschluss (Slide 8)
   ============================================================ */

function renderAddressBlock(addr) {
  return `<p>${addr.name || '–'}<br>${addr.strasse || ''}<br>${addr.plz || ''} ${addr.ort || ''}<br>${addr.land || ''}</p>`;
}

function renderAngebot() {
  const { positionen, summen } = calcAngebot(state);

  document.getElementById('angebot-rech-adresse').innerHTML = renderAddressBlock(state.kunde.rechnungsadresse);
  const lieferAddr = state.kunde.lieferadresseWieRechnung ? state.kunde.rechnungsadresse : state.kunde.lieferadresse;
  document.getElementById('angebot-liefer-adresse').innerHTML = renderAddressBlock(lieferAddr);

  document.getElementById('angebot-positionen').innerHTML = positionen
    .map(
      (p) => `<tr>
      <td>${p.pos}</td>
      <td>
        <div class="pos-name">${p.name}</div>
        <div class="pos-desc">${p.beschreibung}</div>
        ${p.bemerkung ? `<div class="pos-note">${p.bemerkung}</div>` : ''}
      </td>
      <td class="num">${formatNumber(p.menge, p.menge % 1 === 0 ? 0 : 2)} ${p.einheit}</td>
      <td class="num">${formatCurrency(p.einzelpreisNetto)}</td>
      <td class="num">${formatCurrency(p.gesamtNetto)}</td>
    </tr>`
    )
    .join('') || '<tr><td colspan="5" class="muted">Noch keine Positionen – bitte in Teil B mindestens ein System mit Fläche erfassen.</td></tr>';

  document.getElementById('angebot-summen').innerHTML = `
    <div class="row"><span>Zwischensumme (netto)</span><span>${formatCurrency(summen.zwischensummeNetto)}</span></div>
    <div class="row"><span>zzgl. ${(summen.mwstSatz * 100).toFixed(0)} % MwSt.</span><span>${formatCurrency(summen.mwst)}</span></div>
    <div class="row total"><span>Gesamtbetrag (brutto)</span><span>${formatCurrency(summen.brutto)}</span></div>
  `;

  document.getElementById('angebot-zahlungsplan').innerHTML = `
    <div class="card"><h3>60 %</h3><p class="muted">Anzahlung Material</p><div class="amount">${formatCurrency(summen.zahlungsplan.anzahlung60)}</div></div>
    <div class="card"><h3>20 %</h3><p class="muted">Terminbestätigung</p><div class="amount">${formatCurrency(summen.zahlungsplan.terminbestaetigung20)}</div></div>
    <div class="card"><h3>20 %</h3><p class="muted">nach Abnahme</p><div class="amount">${formatCurrency(summen.zahlungsplan.abnahme20)}</div></div>
  `;

  const banner = document.getElementById('import-banner');
  if (state.ui.importHinweis) {
    banner.hidden = false;
    banner.textContent = state.ui.importHinweis;
  } else {
    banner.hidden = true;
  }
}

function renderAbschluss() {
  const { summen } = calcAngebot(state);
  const gewaehlteSysteme = SYSTEME_META.filter((m) => state.systeme[m.key].gewaehlt).map((m) => m.titel);
  document.getElementById('abschluss-summary').innerHTML = `
    <div class="card"><h3>Kunde</h3><p class="muted">${state.kunde.name || '–'}</p></div>
    <div class="card"><h3>Objekt</h3><p class="muted">${state.kunde.objekt || '–'}</p></div>
    <div class="card"><h3>Datum</h3><p class="muted">${new Date().toLocaleDateString('de-DE')}</p></div>
    <div class="card"><h3>Systeme</h3><p class="muted">${gewaehlteSysteme.join(', ') || '–'}</p></div>
    <div class="card"><h3>Gesamtfläche</h3><p class="muted">${formatNumber(summen.gesamtM2, 0)} m²</p></div>
    <div class="card"><h3>Gesamtbetrag</h3><p class="muted">${formatCurrency(summen.brutto)}</p></div>
  `;
}

function renderSlideContent(slideId) {
  if (slideId === 'titel') syncFormFromState();
  if (slideId.startsWith('b-')) syncSystemFormFromState(SLIDE_TO_SYSTEM[slideId]);
  if (slideId === 'ablauf') renderAblaufSteps();
  if (slideId === 'angebot') renderAngebot();
  if (slideId === 'abschluss') renderAbschluss();
}

/* ============================================================
   JSON-Export
   ============================================================ */

function buildExportJSON() {
  const { positionen, summen } = calcAngebot(state);
  return {
    meta: Object.assign({}, state.meta, { erstelltAm: new Date().toISOString() }),
    kunde: state.kunde,
    systeme: state.systeme,
    positionen,
    summen,
  };
}

function downloadJSON() {
  const data = buildExportJSON();
  const filename = `angebot_nano_${slugify(state.kunde.name)}_${todayISODate()}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return filename;
}

/* ============================================================
   JSON-Import (Round-Trip, Abschnitt 5a)
   ============================================================ */

function mergeWithDefaults(imported) {
  const fresh = defaultState();
  const merged = fresh;
  merged.meta = Object.assign({}, fresh.meta, imported.meta || {});
  merged.kunde = Object.assign({}, fresh.kunde, imported.kunde || {}, {
    rechnungsadresse: Object.assign({}, fresh.kunde.rechnungsadresse, (imported.kunde || {}).rechnungsadresse || {}),
    lieferadresse: Object.assign({}, fresh.kunde.lieferadresse, (imported.kunde || {}).lieferadresse || {}),
  });
  SYSTEM_ORDER.forEach((key) => {
    merged.systeme[key] = Object.assign({}, defaultSystemState(key), (imported.systeme || {})[key] || {});
  });
  return merged;
}

function importJSONFile(file) {
  if (!isStateEmpty(state)) {
    const ok = window.confirm('Es liegen bereits Eingaben vor. Sollen diese durch das geladene Angebot ersetzt werden?');
    if (!ok) return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (e) {
      window.alert('Diese Datei ist kein gültiges JSON und konnte nicht geladen werden.');
      return;
    }
    if (!parsed || !parsed.meta || parsed.meta.tool !== 'nano-vertriebstool') {
      window.alert('Diese Datei stammt nicht aus dem Nano-Vertriebstool und wurde nicht geladen.');
      return;
    }
    state = mergeWithDefaults(parsed);
    const erstelltAm = parsed.meta.erstelltAm ? new Date(parsed.meta.erstelltAm).toLocaleDateString('de-DE') : 'unbekannt';
    state.ui = { currentSlide: 'angebot', ablaufErledigt: [], importHinweis: `Angebot vom ${erstelltAm} geladen – Preise ggf. neu berechnet.` };
    saveState();
    syncFormFromState();
    goToSlide('angebot');
  };
  reader.readAsText(file);
}

/* ============================================================
   Sonstiges: Neu starten, Drucken, Tastatur/Touch
   ============================================================ */

function neuStarten() {
  const ok = window.confirm('Wirklich einen neuen Termin starten? Alle Eingaben gehen verloren (JSON vorher herunterladen empfohlen).');
  if (!ok) return;
  state = defaultState();
  saveState();
  syncFormFromState();
  goToSlide('titel');
}

function wireGlobalControls() {
  document.getElementById('btn-zurueck').addEventListener('click', () => navigate(-1));
  document.getElementById('btn-weiter').addEventListener('click', () => navigate(1));
  document.getElementById('arrow-prev').addEventListener('click', () => navigate(-1));
  document.getElementById('arrow-next').addEventListener('click', () => navigate(1));
  document.getElementById('btn-cta-kalkulieren').addEventListener('click', () => navigate(1));

  document.getElementById('save-icon').addEventListener('click', downloadJSON);
  document.getElementById('btn-json-download').addEventListener('click', downloadJSON);
  document.getElementById('btn-neu-starten').addEventListener('click', neuStarten);
  document.getElementById('btn-print').addEventListener('click', () => window.print());

  const fileInput = document.getElementById('json-upload-input');
  document.getElementById('btn-angebot-laden').addEventListener('click', () => fileInput.click());
  document.getElementById('btn-json-upload-abschluss').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importJSONFile(e.target.files[0]);
    fileInput.value = '';
  });

  const dropzone = document.getElementById('dropzone-titel');
  ['dragover', 'dragenter'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    })
  );
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) importJSONFile(file);
  });

  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'ArrowLeft') navigate(-1);
  });

  let touchStartX = null;
  const container = document.getElementById('slides-container');
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });
  container.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) navigate(dx < 0 ? 1 : -1);
    touchStartX = null;
  });

  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.slide').forEach((el) => el.classList.remove('print-active'));
    const active = document.querySelector(`.slide[data-slide-id="${state.ui.currentSlide}"]`);
    const printTarget = state.ui.currentSlide === 'abschluss' ? document.getElementById('slide-angebot') : active;
    if (printTarget) printTarget.classList.add('print-active');
    document.getElementById('slide-angebot').classList.add('print-active');
  });
  window.addEventListener('afterprint', () => {
    document.querySelectorAll('.slide').forEach((el) => el.classList.remove('print-active'));
  });
}

/* ============================================================
   Boot
   ============================================================ */

function boot() {
  loadStateFromSession();
  if (!state.ui) state.ui = { currentSlide: 'titel' };
  if (!state.ui.ablaufErledigt) state.ui.ablaufErledigt = [];
  renderStaticContent();
  bindAddressFields();
  wireSystemSlides();
  wireGlobalControls();
  syncFormFromState();
  goToSlide(state.ui.currentSlide || 'titel');
}

document.addEventListener('DOMContentLoaded', boot);

// Für Tests (Kontrollrechnung etc.) im Browser-Kontext exponiert.
window.NanoCalc = { round2, ceilTo20, buildPositionenFromState, calcSummen, calcAngebot, formatCurrency };
window.NanoState = {
  get: () => state,
  set: (s) => {
    state = s;
  },
  defaultState,
};
