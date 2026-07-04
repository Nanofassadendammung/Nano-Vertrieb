/**
 * Nano-Vertriebstool – Produkt-, Preis- und Textdaten.
 * Preise/IDs/Beschreibungen aus Export_Product.csv und Musterangebot Q-00017.
 * Wird als <script src="data.js"> vor app.js eingebunden (kein Modul-Loader nötig, offline-fähig).
 */

const PRODUCTS = {
  fassade: {
    key: 'fassade',
    id: '6a434e6aaf4affac4',
    name: 'NanoFASSADENdämmung 20m² pro Gebinde',
    description:
      'Beschichtungsmaterial für die Fassade und Unterseite von Balkonen, bestehend aus Grundierung: PSC 250 T Basic B, Funktionsmaterial: PSC 250 T BUILD und Abschlussschicht: PSC 250 T ECO Outside, inkl. Beschichtungsarbeiten, ohne Gerüst oder Steiger, ohne Baustelleneinrichtung sowie vor- oder nachbereitende Arbeiten. Aufbringung auf vorbereiteten, tragfähigen und gereinigten Untergrund. Alle weiteren Leistungen werden gesondert berechnet.',
    unit: 'Gebinde',
    preisNetto: 2519.4,
    m2ProGebinde: 20,
  },
  innen: {
    key: 'innen',
    id: '6a435d27217e08033',
    name: 'NanoINNENdämmung 20m² pro Gebinde',
    description:
      'Beschichtungsmaterial, bestehend aus Grundierung: PSC 250 T Basic A oder B, Funktionsmaterial: PSC 250 T Build Interior oder HP bzw. HP+ und Abschlussschicht: PSC 250 T ECI Interior, inkl. Beschichtungsarbeiten, ohne Gerüst oder Steiger, ohne Baustelleneinrichtung sowie vor- oder nachbereitende Arbeiten. Aufbringung auf vorbereiteten, tragfähigen und gereinigten Untergrund. Alle weiteren Leistungen werden gesondert berechnet.',
    unit: 'Gebinde',
    preisNetto: 2519.4,
    m2ProGebinde: 20,
  },
  dach: {
    key: 'dach',
    id: '6a435d322eef86138',
    name: 'NanoDACHdämmung 20m² pro Gebinde',
    description:
      'Beschichtungsmaterial, bestehend aus Grundierung: PSC 250 T Basic A, Funktionsmaterial: PSC 250 T HP oder HP+ und Abschlussschicht: PSC 250 T ECR Roof, inkl. Beschichtungsarbeiten, ohne Gerüst oder Steiger, ohne Baustelleneinrichtung sowie vor- oder nachbereitende Arbeiten. Aufbringung auf vorbereiteten, tragfähigen und gereinigten Untergrund. Alle weiteren Leistungen werden gesondert berechnet.',
    unit: 'Gebinde',
    preisNetto: 2519.4,
    m2ProGebinde: 20,
  },
  boden: {
    key: 'boden',
    id: '6a435d3a62a99f7cd',
    name: 'NanoBODENdämmung 20m² pro Gebinde',
    description:
      'Beschichtungsmaterial, bestehend aus Grundierung: PSC 250 T Basic A oder B, Funktionsmaterial: PSC 250 T BUILD Interior oder HP bzw. HP+ und Abschlussschicht: PSC 250 T ECF Floor, inkl. Beschichtungsarbeiten, ohne Gerüst oder Steiger, ohne Baustelleneinrichtung sowie vor- oder nachbereitende Arbeiten. Aufbringung auf vorbereiteten, tragfähigen und gereinigten Untergrund. Alle weiteren Leistungen werden gesondert berechnet.',
    unit: 'Gebinde',
    preisNetto: 2519.4,
    m2ProGebinde: 20,
  },
  industrie: {
    key: 'industrie',
    id: '6a435d4a59e0485fa',
    name: 'NanoINDUSTRIEdämmung 20m² pro Gebinde (1mm)',
    description:
      'Beschichtungsmaterial (Schichtdicke 1mm), bestehend aus Grundierung: PSC 250 T Basic A, Funktionsmaterial: PSC 250 T HP pder HP+ und Abschlussschicht: PSC 250 T EC oder EC+, inkl. Beschichtungsarbeiten, ohne Gerüst oder Steiger, ohne Baustelleneinrichtung sowie vor- oder nachbereitende Arbeiten. Aufbringung auf vorbereiteten, tragfähigen und gereinigten Untergrund. Alle weiteren Leistungen werden gesondert berechnet.',
    unit: 'Gebinde',
    preisNetto: 2519.4,
    m2ProGebinde: 20,
  },
  vorNach: {
    key: 'vorNach',
    id: '6a4379fd423d66343',
    name: 'Vor- und Nachbereitung Untergrund (pro m²)',
    description:
      'Vor- und Nachbereitungskosten für die Reinigung, Abdeckarbeiten und Tragfähikeitsherstellung. Ohne Steiger, Gerüst und die Beseitigung von Untergrundschäden.',
    unit: 'm²',
    preisNetto: 25.21,
  },
  geruest: {
    key: 'geruest',
    id: '6a437b6492744dc4b',
    name: 'Gerüst o. Steigerpauschale pro m²',
    description:
      'Die Pauschale fällt unabhängig vom gewählten System an. Sei es ein Rollgerüst, Standgerüst oder ein Steiger.',
    unit: 'm²',
    preisNetto: 8.4,
  },
  farbenSchaeden: {
    key: 'farbenSchaeden',
    id: '6a437dcf928e37a64',
    name: 'Farben/Kleinschädenpauschale (pro m²)',
    description:
      'Beschichtung mit bis zu 3 Farben und / oder der Behebung von Kleinschäden auf dem Untergrund. Im Rahmen der Untergrundvorbereitung werden kleinere, oberflächliche Beschädigungen (z. B. Bohrlöcher, Haarrisse, kleine Putzfehlstellen und Ausbrüche bis ca. 10 cm² je Schadstelle) fachgerecht verschlossen und egalisiert. Die Gesamtfläche der Kleinreparaturen ist bis zu 2 % der Gesamtfläche im Leistungsumfang enthalten.',
    unit: 'm²',
    preisNetto: 8.4,
  },
};

// Mindermengenzuschlag-Staffel: Gesamtfläche (aufgerundet) -> Produkt-ID + Betrag (netto).
const MMZ_STAFFEL = [
  { stufe: 20, id: '6a435a6da6fa98096', betrag: 1400 },
  { stufe: 40, id: '6a435ba1bb7489179', betrag: 1200 },
  { stufe: 60, id: '6a435bfc7b09267ce', betrag: 1000 },
  { stufe: 80, id: '6a435c15752b5c6d7', betrag: 800 },
  { stufe: 100, id: '6a435c9d6bdae7d31', betrag: 600 },
  { stufe: 120, id: '6a435cce2030acc2b', betrag: 400 },
  { stufe: 140, id: '6a435cd9f3da88d90', betrag: 200 },
];

const PRICES = {
  mwstSatz: 0.19,
  zahlungsplan: { anzahlung: 0.6, termin: 0.2, abnahme: 0.2 },
};

// BAFA/BEG-Förderung (unverbindliche Berechnung, § 19 AGB Fördervorbehalt).
// Fördersatz auf die Nettosumme, gedeckelt auf die förderfähigen Höchstbeträge je Wohneinheit (WE):
// volle Deckelung für die selbstbewohnte WE, halbe Deckelung je fremdvermieteter WE.
const FOERDERUNG = {
  satzBasis: 0.15,
  satzISFP: 0.2,
  capSelbstbewohnt15: 30000,
  capSelbstbewohnt20: 60000,
  capFremdvermietet15: 15000,
  capFremdvermietet20: 30000,
};

// Reihenfolge + Metadaten der fünf Systeme für Slide 5 (Toggles) und Teil B.
const SYSTEME_META = [
  {
    key: 'fassade',
    titel: 'NanoFASSADENdämmung',
    kurz: 'Fassade & Balkonunterseiten',
    aufbau: 'Basic B → BUILD → ECO Outside',
    icon: 'fassade',
  },
  {
    key: 'innen',
    titel: 'NanoINNENdämmung',
    kurz: 'Innenräume & Decken',
    aufbau: 'Basic A/B → Build Interior/HP → ECI Interior',
    icon: 'innen',
  },
  {
    key: 'dach',
    titel: 'NanoDACHdämmung',
    kurz: 'Flachdach & geneigtes Dach',
    aufbau: 'Basic A → HP/HP+ → ECR Roof',
    icon: 'dach',
  },
  {
    key: 'boden',
    titel: 'NanoBODENdämmung',
    kurz: 'Wohn-, Keller- & Gewerbeböden',
    aufbau: 'Basic A/B → BUILD Interior/HP → ECF Floor',
    icon: 'boden',
  },
  {
    key: 'industrie',
    titel: 'NanoINDUSTRIEdämmung',
    kurz: 'Industrie- & Anlagenflächen, Schichtdicke 1 mm',
    aufbau: 'Basic A → HP/HP+ → EC/EC+',
    icon: 'industrie',
  },
];

// Erklärende Icons je System (Slide 5, Cards + Timeline), referenziert über SYSTEME_META[].icon.
// Fertige, von ChatGPT erstellte Illustrationen (PNG, transparenter Hintergrund) unter assets/icons/.
const SYSTEM_ICONS = {
  fassade: '<img src="assets/icons/system-fassade.png" alt="NanoFASSADENdämmung" />',
  innen: '<img src="assets/icons/system-innen.png" alt="NanoINNENdämmung" />',
  dach: '<img src="assets/icons/system-dach.png" alt="NanoDACHdämmung" />',
  boden: '<img src="assets/icons/system-boden.png" alt="NanoBODENdämmung" />',
  industrie: '<img src="assets/icons/system-industrie.png" alt="NanoINDUSTRIEdämmung" />',
};

// Icons + Beschriftungen für die Timeline-Navigation (nicht-System-Slides).
// System-Slides (b-*) nutzen dieselben SYSTEM_ICONS wie Slide 5.
const NAV_STEPS = {
  titel: {
    label: 'Start',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/></svg>',
  },
  problem: {
    label: 'Problem',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 22 20H2z"/><line x1="12" y1="9" x2="12" y2="14"/><line x1="12" y1="17.2" x2="12" y2="17.3"/></svg>',
  },
  loesung: {
    label: 'Lösung',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>',
  },
  uwert: {
    label: 'U-Wert-Vergleich',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="4" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="20" y1="20" x2="20" y2="14"/></svg>',
  },
  vorteile: {
    label: 'Weitere Vorteile',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
  },
  qualitaet: {
    label: 'Qualität & Förderung',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M9 12.5 7 21l5-3 5 3-2-8.5"/></svg>',
  },
  systeme: {
    label: 'Systemauswahl',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>',
  },
  ablauf: {
    label: 'Ablauf & Förderung',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h7a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H7a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h10"/></svg>',
  },
  angebot: {
    label: 'Angebotsübersicht',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/><line x1="9" y1="13" x2="17" y2="13"/><line x1="9" y1="17" x2="17" y2="17"/></svg>',
  },
  abschluss: {
    label: 'Abschluss',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M5 4h13l-3 4 3 4H5"/></svg>',
  },
};

// Untergrund-Optionen je System (Abschnitt 3, Teil B).
const UNTERGRUND_OPTIONEN = {
  fassade: ['Putz mineralisch', 'Putz kunstharz', 'Beton', 'Klinker', 'Altanstrich', 'Sonstiges'],
  innen: ['Putz', 'Gipskarton', 'Beton', 'Tapete entfernt', 'Sonstiges'],
  dach: ['Bitumen', 'Folie', 'Beton', 'Blech', 'Sonstiges'],
  boden: ['Estrich', 'Beton', 'Fliesen', 'Sonstiges'],
  industrie: ['Stahl', 'Edelstahl', 'Beton', 'Trapezblech', 'Sonstiges'],
};

// Kenndaten aus Q-00017, Seite 6 (Herstellerangaben lt. Techn. Datenblatt).
const KENNDATEN = {
  lambda: '0,00012 W/(mK)',
  rWert: '8,333 (m²K)/W',
  systemwert: '0,118 W/(m²K)',
  rohdichte: '505 kg/m³',
  waermekapazitaet: '0,7 J/(kgK)',
  emissionsgrad: '0,08',
  wasseraufnahme: '0,07 kg/m²h^0,5',
  bauaufsicht: 'EU-Verordnung Nr. 2024/3110 (BauPVO)',
  brandklasse: 'B1',
  garantieJahre: 25,
  gewaehrleistungJahre: 5,
};

// U-Wert-Vergleich, Q-00017 Seite 6.
const UWERT_VERGLEICH = [
  { label: 'Beton (20 cm)', wert: 2.5 },
  { label: 'Klinkerwand (24 cm)', wert: 0.9 },
  { label: 'Außenwand mit Dämmung ca. 1980', wert: 0.395 },
  { label: 'Passivhaus-Niveau (Außenwand)*', wert: 0.2 },
  { label: 'KfW 40-Niveau (Außenwand)*', wert: 0.14 },
  { label: 'Nano-Fassadendämmung (1 mm)**', wert: 0.118, highlight: true },
];

const TEXTS = {
  claimHeadline: 'Dämmen mit 1 mm – Nanofassadendämmung',
  claimSubtitle: 'Nanobeschichtung für Fassade, Innenraum, Dach, Boden und Industrie.',
  problem: [
    {
      titel: 'Steigende Energiekosten',
      text: 'Schlecht gedämmte Gebäude verlieren spürbar Heizenergie – die Kosten steigen Jahr für Jahr.',
      icon: 'assets/icons/problem-energiekosten.png',
    },
    {
      titel: 'Sanierungsdruck durch das GEG',
      text: 'Das Gebäudeenergiegesetz erhöht die Anforderungen an den energetischen Zustand von Bestandsgebäuden.',
      icon: 'assets/icons/problem-geg.png',
    },
    {
      titel: 'Klassische Dämmung: dick & teuer',
      text: 'Konventionelle Systeme brauchen viele Zentimeter Aufbau, hohe Materialkosten und aufwendige Befestigung.',
      icon: 'assets/icons/problem-daemmstaerke.png',
    },
    {
      titel: 'Wochenlange Baustelle',
      text: 'Gerüst, Trockenzeiten, Wohnraumverlust – klassische Sanierung bindet Zeit und Nerven.',
      icon: 'assets/icons/problem-baustelle.png',
    },
  ],
  loesungIntro:
    'Die Nanobeschichtung PSCoat wird in nur drei dünnen Schichten aufgetragen und ersetzt klassische Dämmstärken durch physikalische Wirksamkeit im Millimeterbereich.',
  uwertHinweis:
    'Herstellerangabe, Beschichtung allein bei 1 mm, ohne Bestandsbauteil. GEG-Niveaus = Grenzwerte, keine realen Bauteile.',
  vorteile: [
    {
      titel: 'CO₂ & Entsorgung',
      text: 'Nur ca. 8–12 % des CO₂-Fußabdrucks eines klassischen WDVS. Reste sind unbedenklich und können über den Hausmüll entsorgt werden.',
      icon: 'assets/icons/vorteile-co2.png',
    },
    {
      titel: 'Chemisch- & UV-beständig',
      text: 'Widersteht Witterung, UV-Strahlung und chemischen Einflüssen dauerhaft, ohne an Farbe oder Funktion zu verlieren.',
      icon: 'assets/icons/vorteile-chemisch-uv.png',
    },
    {
      titel: 'Weniger Schimmelrisiko',
      text: 'Bessere Feuchtigkeitsregulierung als klassische Dämmmethoden – im Prüfgutachten nachgewiesen.',
      icon: 'assets/icons/vorteile-schimmel.png',
    },
    {
      titel: 'Im Vergleich zu anderen Dämmverfahren',
      text: 'Meist ohne Gerüst und Baugenehmigung, kein Schießscharten-Effekt an Fenstern und Türen, Balkone bleiben in voller Größe erhalten.',
      icon: 'assets/icons/vorteile-vergleich.png',
    },
  ],
  qualitaet: [
    {
      titel: 'Farbliche Gestaltung',
      text: 'Erhältlich in allen hellen Farbtönen – ein nachträgliches Streichen der Fassade entfällt.',
      icon: 'assets/icons/qualitaet-farbe.png',
    },
    {
      titel: 'Förderung',
      text: 'Über unser Energieberater-Netzwerk ist eine Förderung von 15–20 % möglich (BAFA/BEG, individueller Sanierungsfahrplan).',
      accent: 'green',
      icon: 'assets/icons/qualitaet-foerderung.png',
    },
    {
      titel: 'CE-Kennzeichnung',
      text: 'EU-weite bauaufsichtliche Zulassung auf Basis der Europäischen Technischen Bewertung (ETA) – geht über die deutsche bauaufsichtliche Zulassung hinaus.',
      icon: 'assets/icons/qualitaet-ce.png',
    },
    {
      titel: 'Mögliche Untergründe',
      text: 'Holz, Klinker, Stein, Putz, Metall, viele Kunststoffe und Bitumen – nahezu jede Oberfläche lässt sich beschichten.',
      icon: 'assets/icons/qualitaet-untergrund.png',
    },
  ],
  // Prozessschritte für die Ablauf-Timeline (Slide 6). Jeder Kreis ist anklickbar und lässt
  // sich als erledigt (grün) markieren – der Status liegt in state.ui.ablaufErledigt, nicht hier.
  ablauf: [
    { nr: '1', text: 'Beratungsgespräch' },
    { nr: '2', text: 'Kostenvoranschlag' },
    { nr: '3', text: 'Weiteres Beratungsgespräch, falls gewünscht', optional: true },
    { nr: '4', text: 'Auftragserteilung' },
    { nr: '4a', text: 'Ggf. Förderantrag / Eingangsbestätigung / Förderzusage', optional: true },
    { nr: '5', text: 'Je nach Gebäude, ggf. Aufmaß und Besichtigung', optional: true },
    { nr: '6', text: 'Auftragsbestätigung' },
    { nr: '7', text: 'Anzahlungsrechnung / Zahlung der Anzahlung 60 %' },
    { nr: '8', text: 'Lieferung des Materials an die Baustelle' },
    { nr: '9', text: 'Terminabsprache für die Ausführung' },
    { nr: '10', text: 'Teilzahlungsrechnung / Zahlung 7 Tage vor der Ausführung 20 %' },
    { nr: '11', text: 'Ausführung' },
    { nr: '12', text: 'Abnahme' },
    { nr: '13', text: 'Abschlussrechnung' },
  ],
  foerderHinweis:
    'Die Beauftragung kann unter Fördervorbehalt (BEG, BAFA/KfW) erfolgen – siehe § 19 der AGB.',
};

// Standard-Beschichtungsfarbe lt. § 4 AGB.
const STANDARD_FARBE = '#FDFDFD';
