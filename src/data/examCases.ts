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
];
