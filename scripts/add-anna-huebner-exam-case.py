from pathlib import Path

path = Path('src/data/examCases.ts')
text = path.read_text(encoding='utf-8')
slug = 'einkommensteuer-anna-huebner-zve-2026'
if slug in text:
    raise SystemExit('case already exists')

case = r'''
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
'''

marker = '\n];\n'
pos = text.rfind(marker)
if pos < 0:
    raise SystemExit('examCases array ending not found')
text = text[:pos] + '\n' + case + text[pos:]
path.write_text(text, encoding='utf-8')

Path('scripts/add-anna-huebner-exam-case.py').unlink(missing_ok=True)
Path('.github/workflows/add-anna-huebner-exam-case-once.yml').unlink(missing_ok=True)
