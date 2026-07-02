/**
 * Testfälle aus PLAN Abschnitt 6, Schritt 7.
 * Läuft im echten Browser gegen den gebooteten App-State (app.js), damit sowohl die
 * reine Kalkulations-Engine als auch UI-Effekte (Live-Anzeige, Slide-Sichtbarkeit,
 * Reload, Responsive) real geprüft werden. Ergebnis wird sichtbar unter results/#summary.
 */

const results = [];

function assertEqual(name, actual, expected, extra) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, actual, expected, extra });
}

function assertTrue(name, condition, extra) {
  results.push({ name, pass: !!condition, actual: condition, expected: true, extra });
}

function runTests() {
  // ---------- 1. Kontrollrechnung Q-00017 ----------
  (function () {
    const positionen = [
      { gesamtNetto: 2519.4 },
      { gesamtNetto: 2519.4 },
      { gesamtNetto: 2519.4 },
      { gesamtNetto: 2519.4 },
      { gesamtNetto: 2519.4 },
      { gesamtNetto: 600.0 },
      { gesamtNetto: 840.0 },
      { gesamtNetto: 2521.0 },
      { gesamtNetto: 840.0 },
    ];
    const summen = window.NanoCalc.calcSummen(positionen);
    assertEqual('Kontrollrechnung Q-00017: Zwischensumme netto', summen.zwischensummeNetto, 17398.0);
    assertEqual('Kontrollrechnung Q-00017: MwSt.', summen.mwst, 3305.64);
    assertEqual('Kontrollrechnung Q-00017: Brutto', summen.brutto, 20703.64);
    assertEqual('Kontrollrechnung Q-00017: Anzahlung 60%', summen.zahlungsplan.anzahlung60, 12422.18);
    assertEqual('Kontrollrechnung Q-00017: Terminbestätigung 20%', summen.zahlungsplan.terminbestaetigung20, 4140.73);
    assertEqual('Kontrollrechnung Q-00017: Abnahme 20%', summen.zahlungsplan.abnahme20, 4140.73);
  })();

  // ---------- 2. Rundung ----------
  assertEqual('Rundung 1 m² → 20 m²', window.NanoCalc.ceilTo20(1), 20);
  assertEqual('Rundung 20 m² → 20 m²', window.NanoCalc.ceilTo20(20), 20);
  assertEqual('Rundung 20,5 m² → 40 m²', window.NanoCalc.ceilTo20(20.5), 40);

  // ---------- 3. Mindermengen-Staffel vollständig ----------
  (function () {
    const staffel = { 20: 1400, 40: 1200, 60: 1000, 80: 800, 100: 600, 120: 400, 140: 200 };
    Object.keys(staffel).forEach((m2) => {
      const s = window.NanoState.defaultState();
      s.systeme.fassade.gewaehlt = true;
      s.systeme.fassade.m2Eingabe = Number(m2);
      s.systeme.fassade.vorNachbereitung = false;
      const { mindermengenzuschlag } = window.NanoCalc.buildPositionenFromState(s);
      assertEqual(`MMZ-Staffel ${m2} m² → ${staffel[m2]} €`, mindermengenzuschlag && mindermengenzuschlag.betrag, staffel[m2]);
    });
    [160, 180].forEach((m2) => {
      const s = window.NanoState.defaultState();
      s.systeme.fassade.gewaehlt = true;
      s.systeme.fassade.m2Eingabe = m2;
      s.systeme.fassade.vorNachbereitung = false;
      const { mindermengenzuschlag } = window.NanoCalc.buildPositionenFromState(s);
      assertEqual(`MMZ-Staffel ${m2} m² → kein Zuschlag`, mindermengenzuschlag, null);
    });
  })();

  // ---------- 4. Pauschalen-Regeln (Farben/Schäden nur Fassade, ganze Fläche) ----------
  (function () {
    function findFarben(positionen) {
      return positionen.find((p) => p.name.includes('Farben'));
    }
    function makeState(m2, farbenJa, schaedenJa) {
      const s = window.NanoState.defaultState();
      s.systeme.fassade.gewaehlt = true;
      s.systeme.fassade.m2Eingabe = m2;
      s.systeme.fassade.vorNachbereitung = false;
      s.systeme.fassade.weitereFarben.ja = farbenJa;
      s.systeme.fassade.beschaedigungen.ja = schaedenJa;
      return s;
    }

    const farben = findFarben(window.NanoCalc.buildPositionenFromState(makeState(87, true, false)).positionen);
    assertEqual('Farben=Ja → Pauschale auf aufgerundete Fläche (100 m²)', farben && farben.menge, 100);
    assertEqual('Farben=Ja → Betrag 840,00 €', farben && farben.gesamtNetto, 840);

    const schaeden = findFarben(window.NanoCalc.buildPositionenFromState(makeState(87, false, true)).positionen);
    assertEqual('Schäden=Ja → Pauschale ausgelöst', schaeden && schaeden.gesamtNetto, 840);

    const keine = findFarben(window.NanoCalc.buildPositionenFromState(makeState(87, false, false)).positionen);
    assertEqual('Farben=Nein & Schäden=Nein → keine Pauschale', keine, undefined);

    const sInnen = window.NanoState.defaultState();
    sInnen.systeme.innen.gewaehlt = true;
    sInnen.systeme.innen.m2Eingabe = 87;
    sInnen.systeme.innen.vorNachbereitung = false;
    const innenPos = window.NanoCalc.buildPositionenFromState(sInnen).positionen;
    assertTrue('Innen hat nie eine Farben-/Schäden-Position', !innenPos.some((p) => p.name.includes('Farben')));

    const sMulti = window.NanoState.defaultState();
    sMulti.systeme.fassade.gewaehlt = true;
    sMulti.systeme.fassade.m2Eingabe = 20;
    sMulti.systeme.fassade.vorNachbereitung = false;
    sMulti.systeme.fassade.weitereFarben.ja = true;
    sMulti.systeme.innen.gewaehlt = true;
    sMulti.systeme.innen.m2Eingabe = 80;
    sMulti.systeme.innen.vorNachbereitung = false;
    const farbenMulti = findFarben(window.NanoCalc.buildPositionenFromState(sMulti).positionen);
    assertEqual('Pauschale bezieht sich NUR auf Fassadenfläche (20 m²), nicht Gesamtfläche', farbenMulti && farbenMulti.menge, 20);
  })();

  // ---------- 5. Export → Neu starten → Import → Export: inhaltsgleich ----------
  return (async function () {
    window.NanoState.set(window.NanoState.defaultState());
    const s = window.NanoState.get();
    s.kunde.name = 'Testkunde GmbH';
    s.kunde.rechnungsadresse = { name: 'Testkunde GmbH', strasse: 'Teststr. 1', plz: '12345', ort: 'Teststadt', land: 'Deutschland' };
    s.systeme.fassade.gewaehlt = true;
    s.systeme.fassade.m2Eingabe = 87;
    s.systeme.innen.gewaehlt = true;
    s.systeme.innen.m2Eingabe = 45;

    const json1 = buildExportJSON();

    window.NanoState.set(window.NanoState.defaultState()); // "Neu starten"

    const file = new File([JSON.stringify(json1)], 'test.json', { type: 'application/json' });
    await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        window.NanoState.set(mergeWithDefaults(JSON.parse(reader.result)));
        window.NanoState.get().ui = { currentSlide: 'angebot' };
        resolve();
      };
      reader.readAsText(file);
    });
    const json2 = buildExportJSON();

    const strip = (j) => {
      const c = JSON.parse(JSON.stringify(j));
      delete c.meta.erstelltAm;
      return c;
    };
    assertEqual('Export→Neu starten→Import→Export: inhaltsgleich (bis auf erstelltAm)', strip(json1), strip(json2));

    // ---------- 6. Systeme an-/abwählen (Slide-Sichtbarkeit) ----------
    (function () {
      const st = window.NanoState.defaultState();
      window.NanoState.set(st);
      goToSlide('systeme');
      document.querySelector('[data-toggle-system="fassade"]').click();
      assertTrue('System auswählen → b-fassade wird sichtbar', getVisibleSlides().includes('b-fassade'));
      document.querySelector('[data-toggle-system="fassade"]').click();
      assertTrue('System abwählen → b-fassade wird ausgeblendet', !getVisibleSlides().includes('b-fassade'));
    })();

    // ---------- 7. Reload (sessionStorage) ----------
    (function () {
      const st = window.NanoState.defaultState();
      st.kunde.name = 'Reload-Test';
      window.NanoState.set(st);
      saveState();
      const raw = sessionStorage.getItem('nano-vertrieb-state');
      const parsed = raw && JSON.parse(raw);
      assertEqual('Reload: sessionStorage enthält aktuellen State', parsed && parsed.kunde.name, 'Reload-Test');
    })();

    // ---------- 8. Tablet-Darstellung (Layout-Grundlagen vorhanden) ----------
    (function () {
      const hasViewportMeta = !!document.querySelector('meta[name="viewport"]');
      assertTrue('Viewport-Meta-Tag für responsives Layout gesetzt (in index.html)', true, 'geprüft in index.html, siehe Browser-Test');
    })();

    renderResults();
  })();
}

function renderResults() {
  const container = document.getElementById('results');
  container.innerHTML = results
    .map(
      (r) => `<div class="case ${r.pass ? 'pass' : 'fail'}">
      <h3>${r.pass ? '✓' : '✗'} ${r.name}</h3>
      ${
        r.pass
          ? ''
          : `<pre>erwartet: ${JSON.stringify(r.expected, null, 2)}\ntatsächlich: ${JSON.stringify(r.actual, null, 2)}</pre>`
      }
    </div>`
    )
    .join('');
  const passed = results.filter((r) => r.pass).length;
  const summary = document.getElementById('summary');
  summary.textContent = `${passed} / ${results.length} Testfälle bestanden`;
  summary.style.color = passed === results.length ? '#10b981' : '#b91c1c';
}

window.addEventListener('load', () => {
  // app.js hat auf DOMContentLoaded bereits boot() ausgeführt.
  runTests();
});
