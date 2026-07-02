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
  claim: 'Dämmen in Millimetern – Nanobeschichtung für Fassade, Innenraum, Dach, Boden und Industrie.',
  problem: [
    {
      titel: 'Steigende Energiekosten',
      text: 'Schlecht gedämmte Gebäude verlieren spürbar Heizenergie – die Kosten steigen Jahr für Jahr.',
    },
    {
      titel: 'Sanierungsdruck durch das GEG',
      text: 'Das Gebäudeenergiegesetz erhöht die Anforderungen an den energetischen Zustand von Bestandsgebäuden.',
    },
    {
      titel: 'Klassische Dämmung: dick & teuer',
      text: 'Konventionelle Systeme brauchen viele Zentimeter Aufbau, hohe Materialkosten und aufwendige Befestigung.',
    },
    {
      titel: 'Wochenlange Baustelle',
      text: 'Gerüst, Trockenzeiten, Wohnraumverlust – klassische Sanierung bindet Zeit und Nerven.',
    },
  ],
  loesungIntro:
    'Die Nanobeschichtung PSCoat wird in nur drei dünnen Schichten aufgetragen und ersetzt klassische Dämmstärken durch physikalische Wirksamkeit im Millimeterbereich.',
  schichtaufbau: [
    { name: 'Grundierung', produkt: 'PSC 250 T Basic (A/B)' },
    { name: 'Funktionsschicht', produkt: 'PSC 250 T BUILD / HP' },
    { name: 'Abschlussschicht', produkt: 'PSC 250 T ECO / ECI / ECR / ECF' },
  ],
  uwertHinweis:
    'Herstellerangabe, Beschichtung allein bei 1 mm, ohne Bestandsbauteil. GEG-Niveaus = Grenzwerte, keine realen Bauteile.',
  ablauf: [
    'Aufmaß',
    'Angebot',
    'Auftrag',
    'Materiallieferung (4 Wochen nach Anzahlung)',
    'Ausführung',
    'Abnahme mit Fotodokumentation',
  ],
  foerderHinweis:
    'Die Beauftragung kann unter Fördervorbehalt (BEG, BAFA/KfW) erfolgen – siehe § 19 der AGB.',
};

// Standard-Beschichtungsfarbe lt. § 4 AGB.
const STANDARD_FARBE = '#FDFDFD';
