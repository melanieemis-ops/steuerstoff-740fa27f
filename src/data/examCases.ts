export type ExamTask = {
  id: string;
  label: string;
  points?: number;
  text: string;
};

export type SolutionHint = {
  id: string;
  title: string;
  content: string;
};

export type ExamCase = {
  id: string;
  slug: string;
  title: string;
  subject: string;
  maximumPoints: number;
  durationMinutes?: number;
  difficulty: "Einsteiger" | "Fortgeschritten" | "Experte";
  source?: string;
  sourceYear?: number;
  sourceInstitution?: string;
  sourceLink?: string;
  rightsStatus: "geklärt" | "prüfen" | "nur verlinken";
  tags: string[];
  caseText: string;
  tasks: ExamTask[];
  solutionHints: SolutionHint[];
  resultSummary?: string;
  modelSolution?: string;
  deepDive?: string;
  legalBases: string[];
  commonMistakes: string[];
};

export const examCases: ExamCase[] = [
  {
    id: "ust-gesamtfall-massatelier-hartmann-2026",
    slug: "ust-gesamtfall-massatelier-hartmann-2026",
    title: "Umsatzsteuer-Gesamtfall: Maßatelier und gemischt genutztes Gebäude",
    subject: "Umsatzsteuer",
    maximumPoints: 30,
    durationMinutes: 45,
    difficulty: "Fortgeschritten",
    source:
      "Interne Steuerstoff-Akademie – eigenständig überarbeiteter und aktualisierter Übungsfall",
    rightsStatus: "prüfen",
    tags: [
      "Klausurfall",
      "Unternehmereigenschaft",
      "Sollbesteuerung",
      "Vorsteueraufteilung",
      "§ 9 UStG",
      "Innergemeinschaftliche Lieferung",
    ],
    caseText: `
⇨ Umsatzsteuer-Gesamtfall: Maßatelier Hartmann

► I. Sachverhalt

Lea Hartmann betreibt seit dem Jahr 2021 in Mainz ein selbstständiges Maßatelier.

Sie fertigt Maßanzüge, Kostüme und Mäntel an und führt außerdem Änderungen und Reparaturen an Kleidungsstücken ihrer Kunden durch.

Das Atelier befindet sich in einem Lea Hartmann gehörenden Gebäude. Das Gebäude besteht aus drei gleich großen Geschossen und wird gemischt genutzt.

Lea Hartmann führt ordnungsgemäße Bücher und ermittelt ihren Gewinn durch Betriebsvermögensvergleich.

Ihr Gesamtumsatz betrug im Kalenderjahr 2025 insgesamt 846.000 €.

Eine Gestattung der Berechnung der Umsatzsteuer nach vereinnahmten Entgelten durch das Finanzamt liegt nicht vor.

Die Umsatzsteuerzahllast des Jahres 2025 betrug 28.600 €.

Eine Dauerfristverlängerung wurde nicht beantragt.

Soweit nichts anderes angegeben ist, handelt es sich bei sämtlichen Beträgen um Nettobeträge.

Für den Monat August 2026 ergeben sich aus den Büchern und Belegen folgende Geschäftsvorfälle:

---

► 1. Leistungen im Inland

Lea Hartmann fertigte für verschiedene Privatkunden Maßanzüge und Kostüme an.

Die wesentlichen Stoffe und Zutaten stellte sie selbst zur Verfügung.

Hierfür berechnete sie insgesamt:

18.400 €

Außerdem führte sie Änderungen und Reparaturen an Kleidungsstücken durch, die ihr von den Kunden zur Bearbeitung übergeben worden waren.

Hierfür berechnete sie insgesamt:

7.600 €

---

► 2. Privater Maßanzug

Lea Hartmann ließ durch ihre Angestellten einen Maßanzug für ihren eigenen privaten Gebrauch herstellen.

Die verwendeten Stoffe und Zutaten stammten aus dem Unternehmen.

Die Selbstkosten des Anzugs betrugen im Zeitpunkt der Entnahme:

720 €

Die ursprünglich beim Erwerb der Stoffe angefallene Umsatzsteuer war vollständig als Vorsteuer abgezogen worden.

---

► 3. Lieferung nach Frankreich

Für den französischen Unternehmer Pierre Martin fertigte Lea Hartmann einen Mantel an.

Lea Hartmann beförderte den Mantel von Mainz nach Lyon.

Pierre Martin verwendete gegenüber Lea Hartmann eine gültige französische Umsatzsteuer-Identifikationsnummer.

Der Nettopreis des Mantels betrug:

950 €

Sämtliche Voraussetzungen und Nachweise für eine steuerfreie innergemeinschaftliche Lieferung liegen vor.

Die Lieferung wurde ordnungsgemäß und fristgerecht in der Zusammenfassenden Meldung angegeben.

---

► 4. Brandschaden

Durch einen technischen Defekt wurde ein Ballen hochwertigen Stoffes vollständig zerstört.

Die Versicherung zahlte Lea Hartmann hierfür:

2.000 €

Die Zahlung entsprach dem tatsächlich entstandenen Schaden.

---

► 5. Geschenk an die Tochter

Lea Hartmann schenkte ihrer volljährigen Tochter einen Ballen Anzugstoff aus dem Warenbestand.

Der Einkaufspreis eines gleichartigen Stoffes betrug im Zeitpunkt der Entnahme:

420 €

Der übliche Verkaufspreis hätte brutto 595 € betragen.

Beim ursprünglichen Einkauf des Stoffes war Lea Hartmann zum vollständigen Vorsteuerabzug berechtigt.

---

► 6. Geschäftstelefon

Die laufenden Grund- und Gesprächsgebühren des betrieblichen Telefonanschlusses betrugen im August 2026 netto:

200 €

Die darauf entfallende Umsatzsteuer betrug:

38 €

Der Telefonanschluss wurde nachweislich zu 75 % unternehmerisch und zu 25 % privat genutzt.

---

► 7. Gemischt genutztes Gebäude

Das Gebäude besteht aus drei gleich großen Geschossen.

Es wird wie folgt genutzt:

a) Erdgeschoss

Das Erdgeschoss ist an eine Unternehmensberatung vermietet.

Die Unternehmensberatung verwendet die Räume ausschließlich für Umsätze, die den Vorsteuerabzug nicht ausschließen.

Lea Hartmann hat wirksam auf die Steuerbefreiung der Grundstücksvermietung verzichtet.

Monatliche Nettomiete:

2.400 €

b) Erstes Obergeschoss

Im ersten Obergeschoss befindet sich das eigene Maßatelier von Lea Hartmann.

Die auf dieses Geschoss entfallenden laufenden Gebäudekosten betragen monatlich:

1.300 €

c) Zweites Obergeschoss

Das zweite Obergeschoss nutzt Lea Hartmann ausschließlich als private Wohnung.

Die auf dieses Geschoss entfallenden laufenden Gebäudekosten betragen monatlich:

900 €

---

► 8. Vorsteuerbeträge

Im August 2026 sind folgende ordnungsgemäß in Rechnung gestellten Vorsteuerbeträge angefallen:

a) Materialeinkäufe und laufende Kosten des Maßateliers, ohne Telefonkosten:

2.850 €

b) Renovierungsarbeiten, die ausschließlich das steuerpflichtig vermietete Erdgeschoss betreffen:

570 €

c) Reparatur des Daches, die dem gesamten Gebäude zugutekommt:

912 €

d) Umsatzsteuer aus den laufenden Telefongebühren:

38 €

Die gesetzlichen Voraussetzungen für den Vorsteuerabzug liegen vor, soweit die Leistungen für das Unternehmen bezogen wurden und keine Ausschlusstatbestände bestehen.
`,
    tasks: [
      {
        id: "aufgabe-1",
        label: "Aufgabe 1",
        points: 3,
        text: `Unternehmereigenschaft und Umfang des Unternehmens

Beurteilen Sie,

– ob Lea Hartmann Unternehmerin im Sinne des Umsatzsteuergesetzes ist und
– welche Tätigkeiten ihr Unternehmen umfasst.`,
      },
      {
        id: "aufgabe-2",
        label: "Aufgabe 2",
        points: 5,
        text: `Besteuerungsverfahren

Bestimmen Sie,

– ob die Umsatzsteuer nach vereinbarten oder vereinnahmten Entgelten berechnet wird,
– welcher Voranmeldungszeitraum gilt,
– bis zu welchem Tag die Umsatzsteuer-Voranmeldung für August 2026 abzugeben ist und
– wann die Umsatzsteuer-Vorauszahlung fällig wird.`,
      },
      {
        id: "aufgabe-3",
        label: "Aufgabe 3",
        points: 12,
        text: `Umsatzsteuerliche Beurteilung der Geschäftsvorfälle

Prüfen Sie für jeden Geschäftsvorfall:

– die Art des Umsatzes,
– die Steuerbarkeit,
– den Ort des Umsatzes,
– eine mögliche Steuerbefreiung,
– die Bemessungsgrundlage und
– die entstehende Umsatzsteuer.`,
      },
      {
        id: "aufgabe-4",
        label: "Aufgabe 4",
        points: 6,
        text: `Vorsteuerabzug

Ermitteln Sie die im August 2026 abziehbaren Vorsteuerbeträge.

Nehmen Sie erforderliche Vorsteueraufteilungen vor.`,
      },
      {
        id: "aufgabe-5",
        label: "Aufgabe 5",
        points: 4,
        text: `Zahllast

Berechnen Sie die Umsatzsteuerzahllast oder den Erstattungsanspruch für August 2026.

Runden Sie auf zwei Nachkommastellen.`,
      },
    ],
    solutionHints: [
      {
        id: "hinweis-1",
        title: "Hinweis 1 – Grundlagenprüfung",
        content: `Prüfen Sie zunächst Unternehmereigenschaft, Unternehmensumfang, Besteuerungsart und Voranmeldungszeitraum getrennt.

Beachten Sie insbesondere die Vorjahreswerte und die fehlende Gestattung nach § 20 UStG.`,
      },
      {
        id: "hinweis-2",
        title: "Hinweis 2 – Einzelprüfung je Geschäftsvorfall",
        content: `Arbeiten Sie die Geschäftsvorfälle nacheinander ab.

Prüfen Sie bei jedem Vorgang Leistungsart, Ort, Steuerbefreiung, Bemessungsgrundlage und Umsatzsteuer.

Achten Sie auf unentgeltliche Wertabgaben sowie echten Schadensersatz.`,
      },
      {
        id: "hinweis-3",
        title: "Hinweis 3 – Vorsteueraufteilung und Zahllast",
        content: `Trennen Sie direkt zuordenbare Vorsteuer von anteiligen Kosten.

Bei der Dachreparatur ist eine sachgerechte Aufteilung vorzunehmen.

Ermitteln Sie anschließend die Zahllast als Umsatzsteuer minus abziehbare Vorsteuer.`,
      },
    ],
    resultSummary: "Umsatzsteuerzahllast August 2026: 1.556,10 €",
    modelSolution: `
⇨ Musterlösung

► 1. Unternehmereigenschaft und Umfang des Unternehmens

Lea Hartmann ist Unternehmerin im Sinne des § 2 Abs. 1 UStG.

Sie übt mit dem Maßatelier selbstständig und nachhaltig eine gewerbliche Tätigkeit zur Erzielung von Einnahmen aus.

Auch die nachhaltige Vermietung des Erdgeschosses stellt eine unternehmerische Tätigkeit dar.

Das Unternehmen umfasst daher insbesondere:

– das Maßatelier,
– die Herstellung und Bearbeitung von Kleidungsstücken sowie
– die Vermietung des Erdgeschosses.

Es liegt nur ein umsatzsteuerliches Unternehmen vor.

Die ausschließlich privat genutzte Wohnung gehört nicht zur unternehmerischen Tätigkeit.

Ergebnis:

Lea Hartmann ist Unternehmerin nach § 2 Abs. 1 UStG.

---

► 2. Art der Besteuerung

Grundsätzlich wird die Umsatzsteuer nach vereinbarten Entgelten berechnet.

Eine Berechnung nach vereinnahmten Entgelten setzt eine Gestattung des Finanzamts nach § 20 UStG voraus.

Der Gesamtumsatz des Vorjahres beträgt 846.000 € und überschreitet damit die Grenze von 800.000 €.

Darüber hinaus liegt keine Gestattung der Istbesteuerung vor.

Lea Hartmann versteuert ihre Umsätze daher nach vereinbarten Entgelten.

Ergebnis:

Sollbesteuerung nach § 13 Abs. 1 Nr. 1 Buchst. a UStG.

---

► 3. Voranmeldungszeitraum

Voranmeldungszeitraum ist grundsätzlich das Kalendervierteljahr.

Betrug die Umsatzsteuer des vorangegangenen Kalenderjahres jedoch mehr als 9.000 €, ist der Kalendermonat Voranmeldungszeitraum.

Die Umsatzsteuerzahllast des Jahres 2025 betrug 28.600 €.

Damit ist im Jahr 2026 der Kalendermonat Voranmeldungszeitraum.

Ergebnis:

Monatliche Umsatzsteuer-Voranmeldungen.

---

► 4. Abgabe und Fälligkeit

Die Umsatzsteuer-Voranmeldung ist bis zum zehnten Tag nach Ablauf des Voranmeldungszeitraums elektronisch zu übermitteln.

Für August 2026 endet die Frist am:

10. September 2026.

Da keine Dauerfristverlängerung vorliegt, ist die Umsatzsteuer-Vorauszahlung ebenfalls am:

10. September 2026

fällig und zu entrichten.

Die dreitägige Zahlungsschonfrist des § 240 Abs. 3 AO verschiebt nicht den gesetzlichen Fälligkeitstag.

---

⇨ Umsatzsteuerliche Beurteilung der einzelnen Geschäftsvorfälle

► Geschäftsvorfall 1a: Herstellung von Maßanzügen und Kostümen

Lea Hartmann verwendet bei der Herstellung selbst beschaffte Hauptstoffe und Zutaten.

Es handelt sich um Werklieferungen im Sinne des § 3 Abs. 4 UStG.

Die Umsätze werden von einer Unternehmerin im Rahmen ihres Unternehmens gegen Entgelt im Inland ausgeführt.

Sie sind steuerbar und mangels Steuerbefreiung steuerpflichtig.

Bemessungsgrundlage:

18.400,00 €

Umsatzsteuer:

18.400,00 € × 19 % = 3.496,00 €

---

► Geschäftsvorfall 1b: Änderungen und Reparaturen

Die Kunden stellen die zu bearbeitenden Kleidungsstücke zur Verfügung.

Lea Hartmann erbringt daher Werkleistungen beziehungsweise sonstige Leistungen.

Die Leistungen werden gegen Entgelt im Inland ausgeführt.

Sie sind steuerbar und steuerpflichtig.

Bemessungsgrundlage:

7.600,00 €

Umsatzsteuer:

7.600,00 € × 19 % = 1.444,00 €

---

► Geschäftsvorfall 2: Privater Maßanzug

Der fertiggestellte Maßanzug wird für den privaten Bedarf von Lea Hartmann aus dem Unternehmen entnommen.

Die Entnahme wird nach § 3 Abs. 1b Satz 1 Nr. 1 UStG einer Lieferung gegen Entgelt gleichgestellt.

Voraussetzung ist, dass der Gegenstand oder seine Bestandteile zum vollständigen oder teilweisen Vorsteuerabzug berechtigt haben.

Diese Voraussetzung ist erfüllt.

Die Bemessungsgrundlage richtet sich nach § 10 Abs. 4 Satz 1 Nr. 1 UStG.

Da der Anzug im Unternehmen hergestellt wurde, sind die Selbstkosten im Zeitpunkt der Entnahme anzusetzen.

Bemessungsgrundlage:

720,00 €

Umsatzsteuer:

720,00 € × 19 % = 136,80 €

---

► Geschäftsvorfall 3: Mantel für den französischen Unternehmer

Die Lieferung ist grundsätzlich im Inland steuerbar, da die Beförderung in Deutschland beginnt.

Die Voraussetzungen einer innergemeinschaftlichen Lieferung nach § 6a UStG liegen vor.

Insbesondere:

– der Gegenstand gelangt von Deutschland nach Frankreich,
– der Abnehmer ist ein Unternehmer,
– der Erwerb unterliegt in Frankreich der Erwerbsbesteuerung,
– eine gültige ausländische Umsatzsteuer-Identifikationsnummer liegt vor und
– die erforderlichen Nachweise und Meldungen wurden erbracht.

Die Lieferung ist nach § 4 Nr. 1 Buchst. b in Verbindung mit § 6a UStG steuerfrei.

Steuerfreie innergemeinschaftliche Lieferung:

950,00 €

Umsatzsteuer:

0,00 €

Die Bemessungsgrundlage ist gesondert in der Umsatzsteuer-Voranmeldung und in der Zusammenfassenden Meldung anzugeben.

---

► Geschäftsvorfall 4: Versicherungsentschädigung

Die Versicherung zahlt den Betrag ausschließlich zum Ausgleich des entstandenen Schadens.

Zwischen Lea Hartmann und der Versicherung findet kein Leistungsaustausch statt.

Es handelt sich um echten Schadensersatz.

Der Betrag ist nicht steuerbar.

Nicht steuerbarer Schadensersatz:

2.000,00 €

Umsatzsteuer:

0,00 €

---

► Geschäftsvorfall 5: Geschenk an die Tochter

Die unentgeltliche Zuwendung des Stoffes an die Tochter wird nach § 3 Abs. 1b Satz 1 Nr. 3 UStG einer Lieferung gegen Entgelt gleichgestellt.

Die ursprüngliche Anschaffung hat zum Vorsteuerabzug berechtigt.

Es liegt kein Geschenk von geringem Wert und kein Warenmuster für Zwecke des Unternehmens vor.

Bemessungsgrundlage ist nach § 10 Abs. 4 Satz 1 Nr. 1 UStG der Einkaufspreis eines gleichartigen Gegenstands im Zeitpunkt der Entnahme.

Der mögliche Bruttoverkaufspreis von 595 € ist nicht maßgeblich.

Bemessungsgrundlage:

420,00 €

Umsatzsteuer:

420,00 € × 19 % = 79,80 €

---

► Geschäftsvorfall 6: Private Nutzung des Telefonanschlusses

Telefondienstleistungen werden nur in dem Umfang für das Unternehmen bezogen, in dem das Telefon unternehmerisch genutzt wird.

Die laufenden Grund- und Gesprächsgebühren werden deshalb unmittelbar aufgeteilt.

Unternehmerischer Anteil:

200,00 € × 75 % = 150,00 €

Privater Anteil:

200,00 € × 25 % = 50,00 €

Die private Mitbenutzung der laufenden Telefondienstleistungen führt nicht zu einer zusätzlichen unentgeltlichen Wertabgabe.

Stattdessen ist der Vorsteuerabzug aus den Telefongebühren auf den unternehmerischen Anteil begrenzt.

Steuerpflichtiger Ausgangsumsatz:

0,00 €

---

► Geschäftsvorfall 7a: Vermietung des Erdgeschosses

Die Vermietung eines Grundstücks ist grundsätzlich nach § 4 Nr. 12 Satz 1 Buchst. a UStG steuerfrei.

Lea Hartmann hat jedoch wirksam nach § 9 Abs. 1 und 2 UStG zur Steuerpflicht optiert.

Die Unternehmensberatung verwendet die Räume ausschließlich für Umsätze, die den Vorsteuerabzug nicht ausschließen.

Die Vermietung ist daher steuerpflichtig.

Bemessungsgrundlage:

2.400,00 €

Umsatzsteuer:

2.400,00 € × 19 % = 456,00 €

---

► Geschäftsvorfall 7b: Eigene Nutzung des ersten Obergeschosses

Die Nutzung des ersten Obergeschosses für das eigene Maßatelier ist eine unternehmensinterne Verwendung.

Es findet kein Leistungsaustausch mit einem anderen Rechtsträger statt.

Es liegt kein steuerbarer Ausgangsumsatz vor.

Die laufenden Gebäudekosten von 1.300 € stellen keine Bemessungsgrundlage für einen Umsatz dar.

Umsatzsteuer:

0,00 €

---

► Geschäftsvorfall 7c: Private Wohnung

Das zweite Obergeschoss wird ausschließlich privat genutzt.

Bei gemischt genutzten Grundstücken ist der Vorsteuerabzug nach § 15 Abs. 1b UStG ausgeschlossen, soweit das Grundstück für private Zwecke verwendet wird.

Da für den privaten Gebäudeteil kein Vorsteuerabzug möglich ist, entsteht hinsichtlich der Privatwohnung grundsätzlich keine steuerbare unentgeltliche Wertabgabe.

Die laufenden Kosten von 900 € sind keine Bemessungsgrundlage für einen Ausgangsumsatz.

Umsatzsteuer:

0,00 €

---

⇨ 5. Summe der steuerpflichtigen Umsätze

Werklieferungen:

18.400,00 €

Werkleistungen:

7.600,00 €

Privater Maßanzug:

720,00 €

Geschenk an die Tochter:

420,00 €

Steuerpflichtige Grundstücksvermietung:

2.400,00 €

Summe der steuerpflichtigen Umsätze:

29.540,00 €

Umsatzsteuer:

29.540,00 € × 19 % = 5.612,60 €

---

⇨ 6. Vorsteuerabzug

► a) Materialeinkäufe und laufende Atelierkosten

Die Leistungen werden vollständig für steuerpflichtige unternehmerische Umsätze verwendet.

Abziehbare Vorsteuer:

2.850,00 €

---

► b) Renovierung des Erdgeschosses

Die Renovierungsleistungen sind ausschließlich der steuerpflichtigen Vermietung des Erdgeschosses zuzuordnen.

Da wirksam nach § 9 UStG zur Steuerpflicht optiert wurde, ist die Vorsteuer vollständig abziehbar.

Abziehbare Vorsteuer:

570,00 €

---

► c) Dachreparatur

Die Dachreparatur betrifft das gesamte Gebäude.

Da alle drei Geschosse gleich groß sind, erfolgt die Aufteilung nach dem Verhältnis der genutzten Flächen.

Unternehmerisch genutzt werden:

– Erdgeschoss: steuerpflichtige Vermietung,
– erstes Obergeschoss: eigenes Maßatelier.

Privat genutzt wird:

– zweites Obergeschoss: eigene Wohnung.

Unternehmerischer Anteil:

2 von 3 Geschossen = 2/3

Abziehbare Vorsteuer:

912,00 € × 2/3 = 608,00 €

Nicht abziehbare Vorsteuer:

912,00 € × 1/3 = 304,00 €

---

► d) Telefongebühren

Die Telefondienstleistungen werden zu 75 % unternehmerisch genutzt.

Abziehbare Vorsteuer:

38,00 € × 75 % = 28,50 €

Nicht abziehbare Vorsteuer:

38,00 € × 25 % = 9,50 €

---

► Summe der abziehbaren Vorsteuer

Material und Atelierkosten:

2.850,00 €

Renovierung Erdgeschoss:

570,00 €

Dachreparatur:

608,00 €

Telefongebühren:

28,50 €

Summe der abziehbaren Vorsteuer:

4.056,50 €

---

⇨ 7. Ermittlung der Zahllast

Umsatzsteuer aus steuerpflichtigen Umsätzen:

5.612,60 €

abzüglich abziehbarer Vorsteuer:

4.056,50 €

Umsatzsteuerzahllast August 2026:

1.556,10 €

---

⇨ Endergebnis

Lea Hartmann muss für August 2026 eine Umsatzsteuer-Vorauszahlung in Höhe von:

1.556,10 €

an das Finanzamt entrichten.

Die Voranmeldung ist spätestens am 10. September 2026 abzugeben.

Die Vorauszahlung ist ebenfalls am 10. September 2026 fällig.
`,
    deepDive: `
► Punkteverteilung

1. Unternehmereigenschaft und Umfang des Unternehmens: 3 Punkte

2. Besteuerungsart, Voranmeldungszeitraum und Fristen: 5 Punkte

3. Umsatzsteuerliche Beurteilung der Ausgangsumsätze: 12 Punkte

4. Ermittlung und Aufteilung der Vorsteuer: 6 Punkte

5. Berechnung der Umsatzsteuerzahllast: 4 Punkte

Gesamtpunktzahl: 30 Punkte
`,
    legalBases: [
      "§ 1 Abs. 1 Nr. 1 UStG",
      "§ 2 Abs. 1 UStG",
      "§ 3 Abs. 1, Abs. 1b, Abs. 4, Abs. 6 und Abs. 9 UStG",
      "§ 4 Nr. 1 Buchst. b UStG",
      "§ 4 Nr. 12 Satz 1 Buchst. a UStG",
      "§ 6a UStG",
      "§ 9 Abs. 1 und 2 UStG",
      "§ 10 Abs. 1 und Abs. 4 UStG",
      "§ 12 Abs. 1 UStG",
      "§ 13 Abs. 1 Nr. 1 Buchst. a und Nr. 2 UStG",
      "§ 15 Abs. 1, Abs. 1b, Abs. 2 und Abs. 4 UStG",
      "§ 16 UStG",
      "§ 18 Abs. 1 und 2 UStG",
      "§ 18a UStG",
      "§ 20 UStG",
      "§ 240 Abs. 3 AO",
      "Abschnitt 1.3 UStAE",
      "Abschnitt 3.3 UStAE",
      "Abschnitt 3.4 UStAE",
      "Abschnitt 15.2c UStAE",
      "Abschnitt 15.6a UStAE",
    ],
    commonMistakes: [
      "Werklieferungen und Werkleistungen nicht sauber getrennt prüfen",
      "Geschenk/Entnahme mit dem möglichen Verkaufspreis statt mit dem richtigen Ansatz bewerten",
      "Echten Schadensersatz als steuerbaren Umsatz behandeln",
      "Vorsteuer aus Dachreparatur und Telefon nicht korrekt aufteilen",
      "Frist und Fälligkeit in der USt-Voranmeldung verwechseln",
    ],
  },
  {
    id: "ust-immobilienvermietung-001",
    slug: "immobilienvermietung-option-versicherungsmakler",
    title: "Immobilienvermietung und Option zur Umsatzsteuer",
    subject: "Umsatzsteuer",
    maximumPoints: 17.0,
    difficulty: "Fortgeschritten",
    rightsStatus: "prüfen",
    tags: [
      "Grundstücksvermietung",
      "§ 9 UStG",
      "Vorsteuerabzug",
      "§ 15a UStG",
      "Versicherungsmakler",
    ],
    caseText: `Die selbständige Immobilienmaklerin Clara Schneider interessierte sich für ein eigenes Anlageobjekt in Reutlingen. Das Gebäude wurde im Jahr 2000 erbaut.

Es besitzt drei identisch große Einheiten, von denen eine zum Kaufzeitpunkt stark renovierungsbedürftig war und leer stand. Die beiden anderen Einheiten wurden an ein Architekturbüro sowie an ein Ingenieurbüro für Bautechnik vermietet.

Clara Schneider erwarb das Objekt mit Kaufvertrag vom 01.07.2024 und vereinbarte den Übergang von Nutzen und Lasten zum 01.01.2025. Sie ließ sich im Kaufvertrag das Recht einräumen, die Renovierungsarbeiten für die leerstehende Einheit in der Zeit vom 01.07.2024 bis zum 31.12.2024 ausführen zu dürfen. Die Renovierungsarbeiten wurden im Laufe des Dezembers 2024 abgeschlossen.

Ihr Ziel war es, die renovierungsbedürftige Einheit instand zu setzen, um sie ab dem 01.01.2025 an einen Steuerberater für 10.000 € zuzüglich der gesetzlich geschuldeten Umsatzsteuer zu vermieten. Der Mietvertrag wurde bereits im Juli 2024 abgeschlossen.

Die Kosten für den Umbau beliefen sich auf 476.000 €. Darin war Umsatzsteuer in Höhe von 19 % enthalten.

Aufgrund eines akuten Burnouts Anfang Dezember 2024 nahm der Steuerberater ein vereinbartes Sonderkündigungsrecht für die nun renovierte Einheit wahr.

Clara Schneider hatte Mitte Dezember eine Anfrage eines Versicherungsmaklers für diese Einheit erhalten. Dieser konnte die Einheit anstelle des Steuerberaters ab dem 01.01.2025 übernehmen.

Clara Schneider führt die Mietverhältnisse mit dem Bauingenieur und dem Architekturbüro ab dem 01.01.2025 unverändert fort. Die Mieteinnahmen belaufen sich pro Monat auf jeweils 10.000 € zuzüglich der gesetzlich geschuldeten Umsatzsteuer.

Die Vermietung an den Versicherungsmakler erfolgt ab dem 01.01.2025 für monatlich 10.000 €.`,
    tasks: [
      {
        id: "aufgabe-a",
        label: "Aufgabe A",
        text: `Prüfen Sie die Ausgangsumsätze der Jahre 2024 und 2025 und machen Sie Angaben hinsichtlich Leistungsart, Leistungsort, Steuerbefreiung, Steuerpflicht und Steuersatz.

Soweit erforderlich, prüfen Sie die von Clara Schneider ausgeführten Umsätze getrennt nach Einheiten.`,
      },
    ],
    solutionHints: [
      {
        id: "hinweis-1",
        title: "Hinweis 1 – Grundprüfung",
        content: `Prüfe nicht sofort den Steuersatz. Beginne für jede Einheit mit:

1. Liegt eine sonstige Leistung vor?
2. Wo befindet sich das vermietete Grundstück?
3. Ist die Vermietung grundsätzlich steuerfrei?
4. Kann auf die Steuerbefreiung verzichtet werden?
5. Wofür verwendet der jeweilige Mieter die Räume?`,
      },
      {
        id: "hinweis-2",
        title: "Hinweis 2 – Trennung der Einheiten",
        content: `Die Möglichkeit zur Option ist für jeden selbständig nutzbaren Grundstücksteil gesondert zu prüfen.

Es genügt nicht, dass der Mieter Unternehmer ist. Entscheidend ist außerdem, ob der jeweilige Mieter die Räume für Umsätze verwendet, die den Vorsteuerabzug nicht ausschließen.`,
      },
      {
        id: "hinweis-3",
        title: "Hinweis 3 – Versicherungsmakler",
        content: `Die typische Vermittlungstätigkeit eines Versicherungsmaklers ist nach § 4 Nr. 11 UStG steuerfrei.

Verwendet der Versicherungsmakler die Einheit ausschließlich für solche steuerfreien Vermittlungsumsätze, ist der Verzicht auf die Steuerbefreiung der Grundstücksvermietung nach § 9 Abs. 2 UStG regelmäßig nicht zulässig.

Die Vermietung an den Versicherungsmakler bleibt deshalb grundsätzlich nach § 4 Nr. 12 Buchstabe a UStG steuerfrei.`,
      },
    ],
    resultSummary: `**Einheit 1 – Architekturbüro**

Die Vermietung ist grundsätzlich nach § 4 Nr. 12 Buchstabe a UStG steuerfrei. Bei einer typischen, zum Vorsteuerabzug berechtigenden Tätigkeit des Architekturbüros kann Clara nach § 9 Abs. 1 und Abs. 2 UStG wirksam optieren. Da die Miete zuzüglich Umsatzsteuer vereinbart und entsprechend behandelt wird, ist von einer Option auszugehen.

→ Ergebnis: steuerpflichtig mit 19 %

---

**Einheit 2 – Ingenieurbüro für Bautechnik**

Die Vermietung ist grundsätzlich nach § 4 Nr. 12 Buchstabe a UStG steuerfrei. Bei einer typischen, zum Vorsteuerabzug berechtigenden Tätigkeit des Ingenieurbüros kann Clara nach § 9 Abs. 1 und Abs. 2 UStG wirksam optieren.

→ Ergebnis: steuerpflichtig mit 19 %

---

**Einheit 3 – Versicherungsmakler**

Die Vermietung ist grundsätzlich nach § 4 Nr. 12 Buchstabe a UStG steuerfrei. Die typische Tätigkeit eines Versicherungsmaklers ist nach § 4 Nr. 11 UStG steuerfrei und schließt regelmäßig den Vorsteuerabzug aus. Die Voraussetzungen des § 9 Abs. 2 UStG sind daher regelmäßig nicht erfüllt.

→ Ergebnis: steuerfreie Grundstücksvermietung

---

**Hinweis:** Eine abweichende Beurteilung wäre möglich, wenn der Versicherungsmakler die Räume nachweislich für andere, zum Vorsteuerabzug berechtigende Umsätze verwendet oder die Verwaltungsregelung zur geringfügigen vorsteuerschädlichen Nutzung eingreift. Dafür enthält der Sachverhalt jedoch keine Anhaltspunkte.`,
    modelSolution: `**Jahr 2024 – Ausgangsumsätze**

Der Abschluss eines Mietvertrags im Juli 2024 führt für sich allein noch nicht zur Ausführung eines Vermietungsumsatzes.

Die Vermietungen beginnen nach dem Sachverhalt erst am 01.01.2025. Im Jahr 2024 liegen daher aus den genannten Vermietungen noch keine Ausgangsumsätze vor.

---

**Jahr 2025 – Ausgangsumsätze**

Einheit 1 – Architekturbüro (steuerpflichtig, 19 %)
- Monatliches Nettoentgelt: 10.000 €
- Jährliches Nettoentgelt: 120.000 €
- Umsatzsteuer 19 %: 22.800 €

Einheit 2 – Ingenieurbüro (steuerpflichtig, 19 %)
- Monatliches Nettoentgelt: 10.000 €
- Jährliches Nettoentgelt: 120.000 €
- Umsatzsteuer 19 %: 22.800 €

Einheiten 1 + 2 zusammen:
- Steuerpflichtige Vermietungsumsätze netto: 240.000 €
- Umsatzsteuer gesamt: 45.600 €

Einheit 3 – Versicherungsmakler (steuerfrei nach § 4 Nr. 12a UStG)
- Monatliches Entgelt: 10.000 €
- Jährliches steuerfreies Entgelt: 120.000 €
- Keine Umsatzsteuer (sofern keine unrichtige Steuer gesondert ausgewiesen wird)`,
    deepDive: `Dieser Abschnitt betrifft die Renovierungskosten und ist für weitere Teilaufgaben relevant, da Aufgabe A zunächst die Ausgangsumsätze betrifft.

**Berechnung der enthaltenen Umsatzsteuer**

| Posten | Betrag |
|---|---|
| Bruttokosten | 476.000 € |
| Nettokosten (476.000 € ÷ 1,19) | 400.000 € |
| Enthaltene Umsatzsteuer (19 %) | 76.000 € |

**Fachlicher Hinweis zu Vorsteuerabzug und § 15a UStG**

Für den Vorsteuerabzug ist die im Zeitpunkt des jeweiligen Leistungsbezugs objektiv belegte Verwendungsabsicht maßgebend.

Clara beabsichtigte zunächst eine steuerpflichtige Vermietung an einen Steuerberater. Diese Absicht kann durch den im Juli 2024 abgeschlossenen Mietvertrag dokumentiert sein.

Im Dezember 2024 änderte sich die geplante Nutzung durch die Vermietung an einen Versicherungsmakler.

Deshalb muss für die Renovierungsleistungen geprüft werden:

- wann die einzelnen Leistungen bezogen wurden,
- wann Clara ihre Verwendungsabsicht änderte,
- wann die Rechnungen vorlagen,
- ob und in welchem Umfang zunächst Vorsteuer abgezogen werden durfte,
- ob eine Vorsteuerberichtigung nach § 15a UStG erforderlich ist,
- wann die erstmalige tatsächliche Verwendung begann.

**Wichtig:** Die pauschale Aussage, dass die gesamten 76.000 € dauerhaft als Vorsteuer abziehbar sind, wäre ohne weitere Prüfung nicht ausreichend. Ein endgültiger Berichtigungsbetrag kann nicht ausgewiesen werden, solange die Zeitpunkte der einzelnen Leistungsbezüge und Rechnungen nicht bekannt sind.`,
    legalBases: [
      "§ 1 Abs. 1 Nr. 1 UStG",
      "§ 3 Abs. 9 UStG",
      "§ 3a Abs. 3 Nr. 1 UStG",
      "§ 4 Nr. 11 UStG",
      "§ 4 Nr. 12 Buchstabe a UStG",
      "§ 9 Abs. 1 und Abs. 2 UStG",
      "§ 12 Abs. 1 UStG",
      "§ 15 Abs. 2 UStG",
      "§ 15a UStG",
      "Abschnitt 9.2 UStAE",
      "Abschnitt 15a.3 UStAE",
    ],
    commonMistakes: [
      "Alle drei Einheiten ohne Einzelprüfung mit 19 % behandeln",
      "Nur prüfen, ob der Mieter Unternehmer ist",
      "§ 9 Abs. 2 UStG übersehen",
      "Die steuerfreien Umsätze des Versicherungsmaklers nicht erkennen",
      "Bereits den Abschluss des Mietvertrags als ausgeführten Umsatz behandeln",
      "Vorsteuerabzug und § 15a ohne zeitliche Prüfung pauschal beurteilen",
      "Den Bruttobetrag von 476.000 € fälschlich als Nettobetrag verwenden",
      "Keine Trennung zwischen Ausgangsumsätzen und Eingangsleistungen vornehmen",
    ],
  },

  {
    id: "einkommensteuer-anna-huebner-zve-2026",
    slug: "einkommensteuer-anna-huebner-zve-2026",
    title: "Übungsklausur 1: Zu versteuerndes Einkommen 2026 – Anna Hübner",
    subject: "Einkommensteuer",
    maximumPoints: 38,
    durationMinutes: 50,
    difficulty: "Fortgeschritten",
    source: "steuerstoff Akademie – eigenständig überarbeiteter und auf den VZ 2026 vereinheitlichter Übungsfall",
    sourceYear: 2026,
    rightsStatus: "geklärt",
    tags: ["§ 19 EStG", "Firmenwagen", "Werbungskosten", "Vorsorgeaufwendungen", "Außergewöhnliche Belastungen", "§ 33b EStG"],
    caseText: `
⇨ Übungsklausur 1 – Einkommensteuer

► Aufgabenstellung

Berechnen Sie für Ihre Mandantin Anna Hübner für den Veranlagungszeitraum 2026 das zu versteuernde Einkommen.

Die Höchstbetragsberechnungen für Vorsorgeaufwendungen nach § 10 Abs. 3 und 4 EStG sind darzustellen. Der Höchstbetrag für Altersvorsorgeaufwendungen beträgt 29.344 €. Es ist davon auszugehen, dass das ausgezahlte Kindergeld günstiger ist als die Freibeträge nach § 32 Abs. 6 EStG.

Stellen Sie Ihre Berechnung übersichtlich dar. Nichtansätze sind kurz zu begründen.

► Persönliche Verhältnisse

Anna Hübner, geboren am 21.05.2002, lebt mit ihrer dreijährigen Tochter Fiona und ihrer Mutter in Leverkusen in einem gemeinsamen Haushalt. Fiona ist chronisch krank. Der Grad der Behinderung beträgt 70; im Schwerbehindertenausweis ist das Merkzeichen H eingetragen. Anna pflegt ihre Tochter unentgeltlich. Zeitweise wird sie durch einen ambulanten Pflegedienst unterstützt. Pflegegeld wird nicht an Anna weitergeleitet.

► Arbeitsverhältnis

Anna schloss ihre Ausbildung zur Rechtsanwaltsfachangestellten bei Rechtsanwalt Dr. Juris in Düsseldorf im Mai 2026 mit der mündlichen Prüfung ab. Anschließend wurde das Ausbildungsverhältnis in ein unbefristetes Arbeitsverhältnis umgewandelt.

Von Januar bis Mai erhielt sie monatlich 1.300 € brutto Ausbildungsvergütung. Von Juni bis Dezember betrug ihr monatlicher Bruttoarbeitslohn 2.800 €. Zusätzlich erhielt sie 1.400 € Weihnachtsgeld.

Zur bestandenen Prüfung schenkte Dr. Juris ihr einen Blumenstrauß im Wert von 50 €.

Ab Juli 2026 stand Anna ein Firmenwagen mit Verbrennungsmotor zur privaten Nutzung und für Fahrten zwischen Wohnung und erster Tätigkeitsstätte zur Verfügung. Der inländische Bruttolistenpreis beträgt 34.198 €. Ein Fahrtenbuch wurde nicht geführt. Der Arbeitgeber wendet die Monatsmethode an und pauschaliert den Zuschlag für Fahrten zwischen Wohnung und erster Tätigkeitsstätte nicht. Die einfache Entfernung beträgt 43 km.

Das Sommerfest im August verursachte Aufwendungen von 100 € je teilnehmender Person. Eine weitere Betriebsveranstaltung fand 2026 nicht statt.

► Lohnsteuerbescheinigung 2026

- einbehaltene Lohnsteuer: 1.908,00 €
- Arbeitgeberanteil gesetzliche Rentenversicherung: 2.993,21 €
- Arbeitnehmeranteil gesetzliche Rentenversicherung: 2.993,21 €
- Arbeitnehmeranteil gesetzliche Krankenversicherung: 2.623,08 €
- Arbeitnehmeranteil gesetzliche Pflegeversicherung: 547,15 €
- Arbeitnehmeranteil Arbeitslosenversicherung: 418,40 €

► Beruflich veranlasste Aufwendungen 2026

1. Fahrten mit dem eigenen Pkw:
- 86 Tage zur ersten Tätigkeitsstätte, Entfernung 43 km
- 34 Tage zur Berufsschule, Entfernung 28 km
- 3 Tage zur Berufsschule für schriftliche und mündliche Prüfungen, Entfernung 28 km

An den 34 Berufsschultagen war Anna jeweils mehr als acht Stunden von Wohnung und erster Tätigkeitsstätte abwesend.

2. Fahrten mit dem Firmenwagen:
- 106 Tage zur ersten Tätigkeitsstätte, Entfernung 43 km

3. Prüfungsvorbereitung:
- Online-Vorbereitungslehrgang 495 €, vom Arbeitgeber bezahlt
- Online-Klausurenlehrgang 250 €, von Anna bezahlt

4. Für die mündliche Prüfung kaufte Anna einen modischen Hosenanzug für 295 €. Sie trug ihn tatsächlich nie privat.

5. Lehrbücher und Unterrichtsmaterial: 110 €.

6. Zweitägige Fortbildung zum Erb- und Familienrecht in Dortmund:
- 09.10.2026: Abfahrt 07:00 Uhr, Rückkehr 20:00 Uhr
- 10.10.2026: Abfahrt 08:30 Uhr, Rückkehr 16:00 Uhr
- Entfernung 85 km; Nutzung des Firmenwagens; keine Erstattungen

7. Kontoführungsgebühren: pauschal 16 €.

► Weitere Aufwendungen

Für die Kfz-Versicherung ihres eigenen Pkw zahlte Anna 500 €. Davon entfallen 214 € auf Vollkasko und 286 € auf Kfz-Haftpflicht.

Außerdem zahlte sie:
- ärztliche Behandlungen und verordnete Medikamente: 2.500 €
- medizinisch veranlasste Diätverpflegung: 3.500 €

Der eigene Pkw wurde im Juli 2026 mit einem Gewinn von 1.500 € verkauft. Anna hatte ihn im Oktober 2025 für private Zwecke erworben.
`,
    tasks: [
      { id: "aufgabe-1", label: "Aufgabe 1", points: 12, text: "Ermitteln Sie die steuerpflichtigen Einnahmen aus nichtselbstständiger Arbeit. Beurteilen Sie Blumenstrauß, Firmenwagen und Sommerfest." },
      { id: "aufgabe-2", label: "Aufgabe 2", points: 8, text: "Ermitteln Sie die abzugsfähigen Werbungskosten und die Einkünfte aus nichtselbstständiger Arbeit. Begründen Sie Nichtansätze." },
      { id: "aufgabe-3", label: "Aufgabe 3", points: 2, text: "Prüfen Sie den Pkw-Verkauf und den Entlastungsbetrag für Alleinerziehende." },
      { id: "aufgabe-4", label: "Aufgabe 4", points: 8, text: "Ermitteln Sie die abzugsfähigen Altersvorsorgeaufwendungen und sonstigen Vorsorgeaufwendungen einschließlich Höchstbetragsprüfung." },
      { id: "aufgabe-5", label: "Aufgabe 5", points: 8, text: "Ermitteln Sie außergewöhnliche Belastungen, Behinderten- und Pflege-Pauschbetrag sowie das zu versteuernde Einkommen." },
    ],
    solutionHints: [
      { id: "hinweis-1", title: "Hinweis 1 – Arbeitslohn und Firmenwagen", content: "Runden Sie den Bruttolistenpreis auf volle 100 € ab. Prüfen Sie die 1-%-Regelung für sechs Monate und den monatlichen Zuschlag von 0,03 % je Entfernungskilometer." },
      { id: "hinweis-2", title: "Hinweis 2 – Werbungskosten", content: "Trennen Sie Fahrten zur ersten Tätigkeitsstätte von Auswärtstätigkeiten. Berufsschule und Prüfungstage sind Reisekosten; bürgerliche Kleidung bleibt auch bei ausschließlicher beruflicher Nutzung nicht abziehbar." },
      { id: "hinweis-3", title: "Hinweis 3 – Sonderausgaben", content: "Bei der Basisversorgung werden Arbeitnehmer- und Arbeitgeberanteil zusammengerechnet und der steuerfreie Arbeitgeberanteil anschließend abgezogen. Bei Kranken- und Pflegeversicherung ist die Mindestabzugsregel zu beachten." },
      { id: "hinweis-4", title: "Hinweis 4 – Außergewöhnliche Belastungen", content: "Diätverpflegung ist ausgeschlossen. Wegen Merkzeichen H kommen die behinderungsbedingte Fahrtkostenpauschale, der erhöhte Behinderten-Pauschbetrag und der Pflege-Pauschbetrag in Betracht." },
    ],
    resultSummary: "Zu versteuerndes Einkommen 2026: 6.249 €",
    modelSolution: `
⇨ Musterlösung

► 1. Einkünfte aus nichtselbstständiger Arbeit

Ausbildungsvergütung: 1.300 € × 5 = 6.500 €

Arbeitslohn Juni bis Dezember: 2.800 € × 7 = 19.600 €

Weihnachtsgeld: 1.400 €

Der Blumenstrauß bleibt als Aufmerksamkeit aus persönlichem Anlass bis 60 € außer Ansatz.

Firmenwagen:
- abgerundeter Bruttolistenpreis: 34.100 €
- Privatnutzung: 34.100 € × 1 % × 6 Monate = 2.046 €
- Fahrten Wohnung – erste Tätigkeitsstätte: 34.100 € × 0,03 % × 43 km × 6 Monate = 2.639,34 €

Das Sommerfest bleibt als erste Betriebsveranstaltung mit 100 € je Teilnehmer unter dem Freibetrag von 110 € steuerfrei.

Steuerpflichtige Einnahmen, auf volle Euro abgerundet: 32.185 €

Werbungskosten:
- Entfernungspauschale für insgesamt 192 Fahrten: 1.152 € für die ersten 20 km und 1.679 € für die weiteren 23 km
- Berufsschule: 34 × 28 km × 2 × 0,30 € = 571,20 €, angesetzt 572 €
- Prüfungstage: 3 × 28 km × 2 × 0,30 € = 50,40 €, angesetzt 51 €
- Verpflegungsmehraufwand Berufsschule: 34 × 14 € = 476 €
- selbst bezahlter Klausurenlehrgang: 250 €
- Lehrbücher und Unterrichtsmaterial: 110 €
- Fortbildung: keine Kilometerkosten wegen Nutzung des Firmenwagens; für den ersten Tag 14 € Verpflegungspauschale, am zweiten Tag unter acht Stunden kein Ansatz
- Kontoführungsgebühren: 16 €

Kein Abzug für den vom Arbeitgeber bezahlten Lehrgang. Der modische Hosenanzug ist bürgerliche Kleidung und nicht abziehbar.

Summe Werbungskosten: 4.320 €

Einkünfte aus nichtselbstständiger Arbeit: 32.185 € − 4.320 € = 27.865 €

► 2. Weitere Einkünfte und Gesamtbetrag

Der Gewinn aus dem Verkauf des privat genutzten Pkw ist nicht steuerbar, weil es sich um einen Gegenstand des täglichen Gebrauchs handelt.

Ein Entlastungsbetrag für Alleinerziehende wird nicht angesetzt, weil Anna mit ihrer Mutter eine Haushaltsgemeinschaft mit einer weiteren volljährigen Person führt und keine gegenteiligen Tatsachen vorgegeben sind.

Gesamtbetrag der Einkünfte: 27.865 €

► 3. Sonderausgaben

Altersvorsorgeaufwendungen:
- Arbeitnehmeranteil RV: 2.994 €
- Arbeitgeberanteil RV: 2.994 €
- Summe: 5.988 €; damit unter dem Höchstbetrag von 29.344 €
- abzüglich steuerfreier Arbeitgeberanteil: 2.994 €

Abziehbar: 2.994 €

Sonstige Vorsorgeaufwendungen:
- Krankenversicherung: 2.624 €
- Pflegeversicherung: 548 €
- Arbeitslosenversicherung: 419 €
- Kfz-Haftpflicht: 286 €
- Vollkasko: nicht abziehbar

Summe: 3.877 €. Der allgemeine Höchstbetrag beträgt 1.900 €.

Die Basiskrankenversicherung wird mit 96 % angesetzt: 2.624 € × 96 % = 2.519,04 €, gerundet 2.520 €. Zusammen mit der Pflegeversicherung von 548 € sind mindestens 3.068 € abzuziehen.

Sonderausgaben-Pauschbetrag: 36 €

Einkommen vor außergewöhnlichen Belastungen:
27.865 € − 2.994 € − 3.068 € − 36 € = 21.767 €

► 4. Außergewöhnliche Belastungen

Nach § 33 EStG:
- behinderungsbedingte Fahrtkostenpauschale wegen Merkzeichen H: 4.500 €
- Krankheitskosten: 2.500 €
- Diätverpflegung: kein Ansatz nach § 33 Abs. 2 Satz 3 EStG

Belastungen: 7.000 €

Zumutbare Belastung:
- 15.340 € × 2 % = 306,80 €
- 12.525 € × 3 % = 375,75 €
- insgesamt 682,55 €

Abziehbar, aufgerundet: 6.318 €

Behinderten-Pauschbetrag für Fiona wegen Merkzeichen H: 7.400 €

Pflege-Pauschbetrag für Anna: 1.800 €. Die zeitweise Unterstützung durch einen ambulanten Pflegedienst ist unschädlich, da Anna die Pflege persönlich und unentgeltlich mitträgt.

► 5. Zu versteuerndes Einkommen

21.767 € − 6.318 € − 7.400 € − 1.800 € = 6.249 €

Ergebnis: Das zu versteuernde Einkommen 2026 beträgt 6.249 €.
`,
    deepDive: `Der Fall verbindet klassische Prüfungsschwerpunkte: Arbeitslohn, Firmenwagen, Entfernungspauschale, Reisekosten während der Ausbildung, Vorsorgeaufwendungen und außergewöhnliche Belastungen. Besonders klausurrelevant sind die strikte Trennung von Entfernungspauschale und Reisekosten, die Mindestabzugsregel für Basis-Kranken- und Pflegeversicherung sowie die Konkurrenz zwischen tatsächlichen behinderungsbedingten Aufwendungen und Pauschbeträgen.`,
    legalBases: ["§§ 8, 19 EStG", "§ 9 EStG", "§ 10 EStG", "§ 10c EStG", "§ 24b EStG", "§ 23 EStG", "§ 33 EStG", "§ 33b EStG", "R 19.6 LStR"],
    commonMistakes: [
      "Den Bruttolistenpreis nicht auf volle 100 € abzurunden",
      "Den Blumenstrauß oder das Sommerfest als steuerpflichtigen Arbeitslohn anzusetzen",
      "Für Fahrten mit dem Firmenwagen keine Entfernungspauschale abzuziehen",
      "Berufsschule fälschlich als erste Tätigkeitsstätte zu behandeln",
      "Den Hosenanzug als typische Berufskleidung abzuziehen",
      "Vollkaskobeiträge als Sonderausgaben anzusetzen",
      "Die Mindestabzugsregel für Basis-Kranken- und Pflegeversicherung zu übersehen",
      "Diätverpflegung als außergewöhnliche Belastung anzusetzen",
      "Behinderten- und Pflege-Pauschbetrag zu vergessen",
    ],
  },

];
