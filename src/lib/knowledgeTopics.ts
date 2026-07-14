// Zentrale Wissensthemen für die Hero-Chips. Bottom-Sheet liest aus dieser
// Datei. Eigene Handouts kommen per localStorage dazu (siehe handoutsStore).

export type TopicId = "ust" | "npo" | "skr42" | "datev" | "rueckfragen" | "review";

export interface QuickAction {
  label: string;
  to: string;
}

export interface KnowledgeTopic {
  id: TopicId;
  /** Wird im Chip angezeigt */
  chip: string;
  title: string;
  subtitle: string;
  summary: string;
  checklist: string[];
  quickActions: QuickAction[];
  /** Verweis auf Modul-Routen */
  module: { label: string; to: string } | null;
  /** Filter für Handouts (Kategorie-Werte) */
  handoutCategory: HandoutCategory;
  /** Optionale Beispiel-Handouts (read-only) */
  builtInHandouts?: { title: string; desc: string; tags?: string[] }[];
}

export type HandoutCategory =
  | "USt"
  | "NPO"
  | "SKR42"
  | "DATEV"
  | "Rückfragen"
  | "Review"
  | "Mittelverwendung"
  | "Sonstiges";

export const HANDOUT_CATEGORIES: HandoutCategory[] = [
  "USt",
  "NPO",
  "SKR42",
  "DATEV",
  "Rückfragen",
  "Review",
  "Mittelverwendung",
  "Sonstiges",
];

// Achtung: Diese Liste enthält historisch auch Knowledge-Base-Artikel ohne
// chip-Feld. Für UI-Chips ausschließlich VALID_KNOWLEDGE_TOPICS verwenden.
export const KNOWLEDGE_TOPICS: Array<KnowledgeTopic | Record<string, unknown>> = [
  {
    id: "ust",
    chip: "USt",
    title: "Umsatzsteuer",
    subtitle: "Steuerbarkeit, Befreiung, Satz, Vorsteuer",
    summary:
      "Steuerbarkeit, Steuerbefreiung, Steuersatz, Vorsteuerabzug und Sonderfälle strukturiert prüfen.",
    checklist: [
      "Steuerbarer Umsatz?",
      "Steuerfrei oder steuerpflichtig?",
      "7 % oder 19 %?",
      "Reverse Charge?",
      "Innergemeinschaftlicher Erwerb?",
      "Vorsteuerabzug möglich?",
      "Ordnungsgemäße Rechnung vorhanden?",
    ],
    quickActions: [
      { label: "USt-Fall prüfen", to: "/neue-anfrage" },
      { label: "Rückfrage formulieren", to: "/chat" },
      { label: "Buchungsvorschlag erstellen", to: "/neue-anfrage" },
    ],
    module: { label: "Neue Anfrage starten", to: "/neue-anfrage" },
    handoutCategory: "USt",
  },
{
  id: "umsatzsteuer-elektrizitaet-reverse-charge-13b-nr-5",
  title: "Elektrizitätslieferungen: Reverse Charge nach § 13b Abs. 2 Nr. 5 UStG",
  short:
    "Steuerschuldnerschaft des Leistungsempfängers bei Lieferungen von Elektrizität, Wiederverkäufereigenschaft, Rechnung und Vorsteuerabzug.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Elektrizitätslieferungen",
  keywords:
    "elektrizität|stromlieferung|§ 13b abs. 2 nr. 5 ustg|reverse charge|wiederverkäufer|§ 3g ustg|leistungsort|steuerschuldnerschaft|vorsteuerabzug|rechnung ohne umsatzsteuer|ust 1 th",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3g UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13b Abs. 2 Nr. 5 UStG",
    "§ 13b Abs. 5 UStG",
    "§ 14a Abs. 5 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "§ 15 Abs. 2 UStG",
    "Abschn. 13b.3a UStAE"
  ],
  body: `
# Elektrizitätslieferungen und Reverse Charge

## 1. Grundsatz

Bei bestimmten Lieferungen von Elektrizität schuldet nicht der liefernde Unternehmer, sondern der Leistungsempfänger die Umsatzsteuer.

Rechtsgrundlage:

§ 13b Abs. 2 Nr. 5 UStG in Verbindung mit § 13b Abs. 5 UStG.

Die Voraussetzungen hängen insbesondere davon ab,

- ob der Lieferer im Inland oder Ausland ansässig ist,
- ob der Leistungsempfänger Unternehmer ist,
- und ob Lieferer und Leistungsempfänger Wiederverkäufer von Elektrizität sind.

---

## 2. Lieferung von Elektrizität

Elektrizität ist umsatzsteuerlich ein Liefergegenstand.

Es liegt eine Lieferung nach § 3 Abs. 1 UStG vor.

## Ort der Lieferung

Bei Lieferungen an einen Wiederverkäufer bestimmt sich der Lieferort nach § 3g UStG.

Der Ort liegt grundsätzlich dort,

wo der Wiederverkäufer sein Unternehmen oder eine Betriebsstätte betreibt,

für die die Elektrizität geliefert wird.

Beispiel:

Der Wiederverkäufer hat seinen Sitz in Mecklenburg-Vorpommern.

Ort der Lieferung:

Mecklenburg-Vorpommern und damit Inland.

---

## 3. Steuerbarkeit und Steuerpflicht

Die Lieferung wird im Inland gegen Entgelt im Rahmen eines Unternehmens ausgeführt.

Sie ist nach § 1 Abs. 1 Nr. 1 UStG steuerbar.

Mangels Steuerbefreiung ist sie grundsätzlich mit 19 % steuerpflichtig.

---

## 4. Wiederverkäufer

Wiederverkäufer ist ein Unternehmer,

dessen Haupttätigkeit im Erwerb von Elektrizität und deren Weiterlieferung besteht

und dessen eigener Verbrauch von untergeordneter Bedeutung ist.

Die Wiederverkäufereigenschaft sollte durch eine gültige Bescheinigung der Finanzverwaltung nachgewiesen werden.

---

## 5. Steuerschuldnerschaft des Leistungsempfängers

Bei den gesetzlich erfassten Elektrizitätslieferungen schuldet der Leistungsempfänger die Umsatzsteuer.

Bei Lieferungen eines im Inland ansässigen Unternehmers ist insbesondere zu prüfen,

ob sowohl

- der liefernde Unternehmer als auch
- der Leistungsempfänger

Wiederverkäufer von Elektrizität sind.

Bei Lieferungen eines im Ausland ansässigen Unternehmers gelten die besonderen Voraussetzungen des § 13b UStG für ausländische Unternehmer.

---

## 6. Zahlenbeispiel

Nettoentgelt:

1.000.000 €

Umsatzsteuer:

1.000.000 € × 19 %

= 190.000 €

Der Leistungsempfänger meldet die Umsatzsteuer von 190.000 € als Steuerschuldner an.

---

## 7. Rechnung

Der Lieferer stellt eine Nettorechnung aus.

Die Umsatzsteuer darf nicht offen ausgewiesen werden.

Die Rechnung muss den Hinweis enthalten:

"Steuerschuldnerschaft des Leistungsempfängers"

Rechtsgrundlage:

§ 14a Abs. 5 UStG.

---

## 8. Vorsteuerabzug

Der Leistungsempfänger kann die nach § 13b UStG geschuldete Steuer nach

§ 15 Abs. 1 Satz 1 Nr. 4 UStG

als Vorsteuer abziehen,

wenn

- die Elektrizität für sein Unternehmen bezogen wird
- und keine Ausschlussgründe nach § 15 Abs. 2 UStG bestehen.

Beispiel:

Umsatzsteuer:

190.000 €

Vorsteuer:

190.000 €

Die Beträge sind grundsätzlich betragsidentisch und zeitgleich zu erfassen.

---

# Prüfungsschema

1. Liegt eine Lieferung von Elektrizität vor?

2. Wer ist Lieferer?

3. Ist der Lieferer im Inland oder Ausland ansässig?

4. Wo liegt der Lieferort nach § 3g UStG?

5. Ist der Leistungsempfänger Wiederverkäufer?

6. Ist gegebenenfalls auch der Lieferer Wiederverkäufer?

7. Greift § 13b Abs. 2 Nr. 5 UStG?

8. Bemessungsgrundlage und Steuer berechnen.

9. Rechnung ohne Umsatzsteuer prüfen.

10. Vorsteuerabzug gesondert prüfen.

---

# Typische Klausurfallen

## Fehler 1: Jede Stromlieferung unterliegt Reverse Charge

Falsch.

Die besonderen persönlichen Voraussetzungen des § 13b Abs. 5 UStG müssen erfüllt sein.

## Fehler 2: Wiederverkäufereigenschaft nicht prüfen

Die bloße Unternehmereigenschaft reicht nicht in jedem Fall aus.

## Fehler 3: Umsatzsteuer offen ausweisen

Bei Reverse Charge ist grundsätzlich nur das Nettoentgelt auszuweisen.

---

# Merksätze

- Strom ist umsatzsteuerlich ein Liefergegenstand.
- Der Lieferort kann sich nach § 3g UStG bestimmen.
- Bei inländischen Lieferern ist die Wiederverkäufereigenschaft besonders zu prüfen.
- Bei Reverse Charge stellt der Lieferer netto in Rechnung.
- Der Leistungsempfänger meldet Steuer und kann sie gegebenenfalls als Vorsteuer abziehen.
`
},
{
  id: "entgeltlicher-verzicht-niessbrauch-vermietetes-grundstueck",

  title:
    "Entgeltlicher Verzicht auf Nießbrauch an einem vermieteten Grundstück",

  short:
    "Das Entgelt für den Verzicht auf ein Nießbrauchsrecht an einem vermieteten Privatgrundstück kann eine steuerbare Entschädigung für künftig entgehende Vermietungseinnahmen nach § 24 Nr. 1 Buchst. a EStG sein.",

  category:
    "Einkommensteuer / Vermietung und Verpachtung / Nießbrauch / Entschädigungen / Rechtsprechung",

  source:
    "BFH, Urteil vom 10.10.2025 – IX R 4/24, ECLI:DE:BFH:2025:U.101025.IXR4.24.0",

  decisionDate: "2025-10-10",

  court: "Bundesfinanzhof, IX. Senat",

  caseNumber: "IX R 4/24",

  keywords:
    "nießbrauch|niessbrauch|nießbrauchsrecht|verzicht auf nießbrauch|ablösung nießbrauch|ablösezahlung|entschädigung|entgehende einnahmen|vermietung und verpachtung|privatvermögen|wirtschaftsgut|surrogationsprinzip|freiwilliger verzicht|drucksituation|zwangssituation|private veräußerungsgeschäfte|§ 24 nr. 1 buchst. a estg|§ 21 estg|§ 23 estg|§ 34 estg|§ 100 bgb|§ 1030 bgb|bfh ix r 4/24",

  references: [
    "§ 2 Abs. 1 Satz 1 Nr. 6 EStG",
    "§ 21 Abs. 1 Satz 1 Nr. 1 EStG",
    "§ 24 Nr. 1 Buchst. a EStG",
    "§ 22 Nr. 2 EStG",
    "§ 23 Abs. 1 Satz 1 Nr. 2 EStG",
    "§ 23 Abs. 2 EStG",
    "§ 34 Abs. 1 EStG",
    "§ 34 Abs. 2 Nr. 2 EStG",
    "§ 99 Abs. 3 BGB",
    "§ 100 BGB",
    "§ 1030 Abs. 1 BGB",
    "§ 1036 Abs. 1 BGB",
    "BFH, Urteil vom 10.10.2025 – IX R 4/24",
    "FG Münster, Urteil vom 12.12.2023 – 6 K 2489/22 E, EFG 2024, 392"
  ],

  officialSources: [
    "https://www.bundesfinanzhof.de/de/entscheidung/entscheidungen-online/detail/STRE202520349/",
    "https://www.gesetze-im-internet.de/estg/__24.html",
    "https://www.gesetze-im-internet.de/estg/__21.html",
    "https://www.gesetze-im-internet.de/estg/__23.html",
    "https://www.gesetze-im-internet.de/estg/__34.html",
    "https://www.gesetze-im-internet.de/bgb/__100.html",
    "https://www.gesetze-im-internet.de/bgb/__1030.html"
  ],

  body: `
# Entgeltlicher Verzicht auf ein Nießbrauchsrecht an einem vermieteten Grundstück

## 1. Entscheidung

### BFH, Urteil vom 10.10.2025 – IX R 4/24

Das Entgelt für den Verzicht auf die Ausübung eines Nießbrauchsrechts an einem dem Privatvermögen zugehörigen Grundstück ist eine steuerbare Entschädigung gemäß § 24 Nr. 1 Buchst. a EStG, wenn

1. der Nießbraucher das Grundstück im Zeitpunkt des Verzichts tatsächlich vermietet,
2. die Vermietungseinkünfte dem Nießbraucher persönlich steuerlich zuzurechnen sind und
3. die Zahlung wirtschaftlich die künftig entgehenden Einnahmen aus Vermietung und Verpachtung ersetzt.

Die Entschädigung gehört in diesem Fall zu den Einkünften aus Vermietung und Verpachtung gemäß § 24 Nr. 1 Buchst. a EStG in Verbindung mit § 21 Abs. 1 Satz 1 Nr. 1 EStG.

---

# 2. Zentraler Lernsatz

**Verzichtet ein Nießbraucher gegen Entgelt auf sein Nießbrauchsrecht an einem von ihm tatsächlich vermieteten Privatgrundstück, ist die Ablösezahlung als Entschädigung für künftig entgehende Mieteinnahmen nach § 24 Nr. 1 Buchst. a EStG in Verbindung mit § 21 Abs. 1 Satz 1 Nr. 1 EStG steuerbar.**

---

# 3. Prüfungsschema

## Schritt 1: Besteht ein Nießbrauchsrecht?

### Rechtsgrundlagen

§ 1030 Abs. 1 BGB und § 100 BGB.

Nach § 1030 Abs. 1 BGB kann eine Sache in der Weise belastet werden, dass der Berechtigte die Nutzungen der Sache ziehen darf.

Zu den Nutzungen gehören gemäß § 100 BGB insbesondere die Früchte einer Sache und die Vorteile, welche der Gebrauch der Sache gewährt.

Bei einem Grundstück gehören hierzu auch die durch Vermietung erzielten Mieteinnahmen.

### Prüfungssatz

**Der Nießbrauch berechtigt den Nießbraucher nach § 1030 Abs. 1 BGB dazu, die Nutzungen des Grundstücks im Sinne des § 100 BGB zu ziehen.**

---

## Schritt 2: Gehört das Nießbrauchsrecht zum Privatvermögen?

Die Entscheidung betrifft ein Nießbrauchsrecht, das sich im Zeitpunkt des entgeltlichen Verzichts im Privatvermögen des Nießbrauchers befand.

### Prüfungshinweis

Befindet sich das Nießbrauchsrecht im Betriebsvermögen, sind zunächst die Folgen innerhalb der jeweiligen Gewinneinkunftsart zu prüfen.

---

## Schritt 3: Hat der Nießbraucher das Grundstück tatsächlich vermietet?

Der Nießbraucher muss das Grundstück im Zeitpunkt des Verzichts tatsächlich zur Erzielung von Einkünften aus Vermietung und Verpachtung nutzen.

Nicht ausreichend ist allein die abstrakte Möglichkeit, das Grundstück aufgrund des Nießbrauchsrechts vermieten zu dürfen.

### Lernsatz

**Für die Anwendung des BFH-Urteils muss das Grundstück im Zeitpunkt des Verzichts tatsächlich durch den Nießbraucher vermietet sein.**

### Offene Rechtsfrage

Der BFH hat ausdrücklich nicht entschieden, ob § 24 Nr. 1 Buchst. a EStG auch anwendbar ist, wenn das Grundstück im Zeitpunkt des Verzichts nicht vermietet ist.

In einem solchen Fall darf der Chatbot daher keine gesicherte Steuerbarkeit nach diesem Urteil behaupten.

---

## Schritt 4: Sind die Vermietungseinkünfte dem Nießbraucher zuzurechnen?

Die Einkünfte aus Vermietung und Verpachtung müssen dem Nießbraucher persönlich steuerlich zuzurechnen sein.

Dies setzt regelmäßig voraus, dass der Nießbraucher

- im Außenverhältnis selbst als Vermieter auftritt,
- die Mietverträge im eigenen Namen abschließt,
- die Vermieterrechte und -pflichten trägt und
- die Mieteinnahmen für eigene Rechnung erzielt.

### Rechtsgrundlage

§ 21 Abs. 1 Satz 1 Nr. 1 EStG.

### Lernsatz

**Eine Entschädigung nach § 24 Nr. 1 Buchst. a EStG kann nur derjenigen Person zugerechnet werden, der auch die ersetzten Einnahmen steuerlich zuzurechnen gewesen wären.**

---

## Schritt 5: Wofür wird die Zahlung geleistet?

Es ist zwischen zwei Fallgruppen zu unterscheiden.

### Fallgruppe A: Ersatz für entgehende Einnahmen

Wird die Zahlung dafür geleistet, dass dem Nießbraucher infolge des Verzichts künftig Mieteinnahmen entgehen, liegt eine Entschädigung nach § 24 Nr. 1 Buchst. a EStG vor.

### Fallgruppe B: Ersatz für den Verlust eines Wirtschaftsguts

Wird die Zahlung dagegen ausschließlich für den Verlust oder die Aufgabe des Nießbrauchsrechts als Wirtschaftsgut geleistet, ohne dass damit steuerbare Einnahmen ersetzt werden, ist § 24 Nr. 1 Buchst. a EStG grundsätzlich nicht erfüllt.

### Abgrenzungssatz

**Entscheidend ist, ob die Zahlung die künftig entgehenden Einnahmen oder lediglich den Verlust des Wirtschaftsguts ausgleichen soll.**

---

# 4. Bedeutung des Nießbrauchsrechts als Wirtschaftsgut

Das Nießbrauchsrecht an einer Immobilie ist ein selbständiges Wirtschaftsgut.

Allein die Eigenschaft als Wirtschaftsgut schließt die Anwendung des § 24 Nr. 1 Buchst. a EStG jedoch nicht aus.

Wird das Nießbrauchsrecht tatsächlich zur Vermietung genutzt, bildet die Erzielung der Mieteinnahmen nach Auffassung des BFH den wirtschaftlichen Kern des Rechts.

Bei einem vermieteten Grundstück lassen sich daher

- die Aufgabe des Nießbrauchsrechts und
- der Ersatz der dadurch künftig entgehenden Mieteinnahmen

nicht ohne Weiteres voneinander trennen.

### Lernsatz

**Bei einem tatsächlich vermieteten Grundstück ist die Einkunftserzielung der wirtschaftliche Kern des Nießbrauchsrechts.**

---

# 5. Entschädigung nach § 24 Nr. 1 Buchst. a EStG

## Gesetzliche Voraussetzung

Nach § 24 Nr. 1 Buchst. a EStG gehören zu den Einkünften im Sinne des § 2 Abs. 1 EStG auch Entschädigungen, die als Ersatz für entgangene oder entgehende Einnahmen gewährt werden.

## Kausale Verknüpfung

Zwischen

- der Entschädigungszahlung und
- den entgangenen oder künftig entgehenden Einnahmen

muss ein ursächlicher wirtschaftlicher Zusammenhang bestehen.

### Prüfungssatz

**Die Entschädigung muss an die Stelle der ohne den Verzicht weiter zufließenden Mieteinnahmen treten.**

---

# 6. § 24 EStG begründet keine neue Einkunftsart

§ 24 EStG erweitert die sieben Einkunftsarten des § 2 Abs. 1 EStG nicht.

Die Vorschrift stellt vielmehr klar, welcher Einkunftsart eine Ersatzleistung zuzuordnen ist.

Die Entschädigung erhält steuerlich grundsätzlich die Qualifikation der Einnahmen, an deren Stelle sie tritt.

### Surrogationsprinzip

Die Ersatzleistung folgt steuerlich den ersetzten Einnahmen.

Im vorliegenden Zusammenhang gilt deshalb:

Entgangene Mieteinnahmen  
→ Einkünfte aus Vermietung und Verpachtung gemäß § 21 EStG

Entschädigung für diese Mieteinnahmen  
→ ebenfalls Einkünfte aus Vermietung und Verpachtung gemäß § 24 Nr. 1 Buchst. a in Verbindung mit § 21 Abs. 1 Satz 1 Nr. 1 EStG.

### Lernsatz

**Die Entschädigung wird grundsätzlich derselben Einkunftsart zugeordnet wie die Einnahmen, die durch sie ersetzt werden.**

---

# 7. Positive und negative Wirkung des § 24 EStG

## Positive Wirkung

§ 24 Nr. 1 Buchst. a EStG bestimmt, zu welcher Einkunftsart eine Entschädigung gehört.

## Negative Wirkung

Wären die entgangenen Einnahmen selbst nicht steuerbar, kann auch die dafür geleistete Entschädigung grundsätzlich nicht allein aufgrund des § 24 Nr. 1 Buchst. a EStG steuerbar werden.

### Lernsatz

**Eine Entschädigung darf nicht unter weitergehenden Voraussetzungen besteuert werden als die Einnahmen, an deren Stelle sie tritt.**

---

# 8. Freiwilliger Verzicht

Für die Steuerbarkeit nach § 24 Nr. 1 Buchst. a EStG ist nicht erforderlich, dass der Nießbraucher

- unter rechtlichem Druck,
- unter wirtschaftlichem Druck oder
- unter tatsächlichem Zwang

auf das Nießbrauchsrecht verzichtet.

Auch ein freiwillig vereinbarter entgeltlicher Verzicht kann steuerbar sein.

### Prüfungssatz

**Eine Druck- oder Zwangssituation ist kein Tatbestandsmerkmal des § 24 Nr. 1 Buchst. a EStG.**

---

# 9. Abgrenzung zur Tarifermäßigung nach § 34 EStG

Die Steuerbarkeit der Entschädigung und die Tarifermäßigung sind getrennt zu prüfen.

## Erste Prüfung

Ist die Zahlung nach § 24 Nr. 1 Buchst. a EStG steuerbar?

## Zweite Prüfung

Liegen zusätzlich die Voraussetzungen für eine Tarifermäßigung nach § 34 Abs. 1 und Abs. 2 Nr. 2 EStG vor?

Eine mögliche Druck- oder Zwangssituation betrifft nach der BFH-Entscheidung nicht die grundsätzliche Steuerbarkeit der Zahlung.

Sie kann vielmehr im Rahmen der gesonderten Prüfung des § 34 EStG Bedeutung erlangen.

### Lernsatz

**§ 24 EStG entscheidet über die Steuerbarkeit; § 34 EStG entscheidet gesondert über eine mögliche Tarifermäßigung.**

### Achtung

Die Bezeichnung einer Zahlung als Entschädigung führt nicht automatisch zu einer ermäßigten Besteuerung nach § 34 EStG.

Insbesondere müssen die Voraussetzungen der Zusammenballung und die weiteren Anforderungen des § 34 EStG geprüft werden.

---

# 10. Abgrenzung zum privaten Veräußerungsgeschäft

Das Finanzamt hatte die Ablösung des Nießbrauchsrechts ursprünglich als privates Veräußerungsgeschäft nach

- § 22 Nr. 2 EStG und
- § 23 Abs. 1 Satz 1 Nr. 2 EStG

behandelt.

Der BFH musste diese Frage nicht abschließend entscheiden.

## Grund

Nach § 23 Abs. 2 EStG sind Einkünfte aus privaten Veräußerungsgeschäften gegenüber anderen Einkunftsarten subsidiär.

Ist die Zahlung bereits nach § 24 Nr. 1 Buchst. a EStG in Verbindung mit § 21 Abs. 1 Satz 1 Nr. 1 EStG den Einkünften aus Vermietung und Verpachtung zuzuordnen, kommt eine Besteuerung nach § 23 EStG nicht mehr vorrangig in Betracht.

### Lernsatz

**Die Besteuerung nach § 24 Nr. 1 Buchst. a in Verbindung mit § 21 EStG geht einer Einordnung als privates Veräußerungsgeschäft vor, § 23 Abs. 2 EStG.**

---

# 11. Rechtsprechungsänderung

## Frühere Auffassung

Nach der früheren Rechtsprechung des X. Senats wurde die Gegenleistung für den Verzicht auf ein im Privatvermögen befindliches Nießbrauchsrecht grundsätzlich nicht als Entschädigung für entgehende Einnahmen behandelt.

Insbesondere:

BFH, Urteil vom 25.11.1992 – X R 34/89.

## Neue Auffassung

Der IX. Senat behandelt das Entgelt nunmehr jedenfalls dann als steuerbare Entschädigung, wenn

- der Nießbraucher selbst tatsächlich vermietet,
- ihm die Vermietungseinkünfte steuerlich zuzurechnen sind und
- die Zahlung die künftig entgehenden Mieteinnahmen ersetzt.

Der X. Senat hat mitgeteilt, dass er an seiner bisherigen entgegenstehenden Auffassung nicht mehr festhält.

### Prüfungssatz

**BFH IX R 4/24 stellt für tatsächlich vermietete Privatgrundstücke eine Rechtsprechungsänderung gegenüber BFH X R 34/89 dar.**

---

# 12. Sachverhalt der BFH-Entscheidung

Der Steuerpflichtigen war im Wege eines Vermächtnisses ein lebenslanges Nießbrauchsrecht an einem Grundstück zugewendet worden.

Sie vermietete das Grundstück zunächst an einen fremden Dritten und erzielte Einkünfte aus Vermietung und Verpachtung.

Ab dem Jahr 2012 gehörte das Nießbrauchsrecht wegen der Vermietung an eine Personengesellschaft, deren Komplementärin sie war, zu ihrem Sonderbetriebsvermögen.

Nach ihrem Ausscheiden aus der Gesellschaft im Jahr 2018 wurde das Nießbrauchsrecht wieder in das Privatvermögen überführt.

Die Mieteinnahmen gehörten anschließend erneut zu den Einkünften aus Vermietung und Verpachtung.

Im November 2019 verzichtete die Steuerpflichtige gegen Zahlung einer Entschädigung auf das Nießbrauchsrecht.

Das Finanzamt behandelte den Vorgang zunächst als privates Veräußerungsgeschäft.

Das Finanzgericht gab der Klage statt.

Der BFH hob das Urteil des Finanzgerichts auf und verwies die Sache zurück.

Nach Auffassung des BFH war die Entschädigung im Umfang des entgeltlichen Teils grundsätzlich nach § 24 Nr. 1 Buchst. a in Verbindung mit § 21 Abs. 1 Satz 1 Nr. 1 EStG steuerbar.

---

# 13. Entgeltlicher und unentgeltlicher Teil

Übersteigt die gezahlte Ablösesumme den tatsächlichen Wert des Nießbrauchsrechts, kann die Zahlung in

- einen entgeltlichen Teil und
- einen unentgeltlichen Teil

aufzuteilen sein.

Nur der als Entschädigung geleistete entgeltliche Teil ist nach den Grundsätzen des BFH als Ersatz für entgehende Einnahmen zu beurteilen.

Ein übersteigender unentgeltlicher Teil kann schenkungsteuerlich zu untersuchen sein.

### Prüfungshinweis

**Ablösesumme und objektiver Wert des Nießbrauchsrechts sind miteinander zu vergleichen.**

---

# 14. Nicht automatisch übertragbare Fälle

Das Urteil darf nicht ohne weitere Prüfung auf sämtliche Ablösungen von Nutzungsrechten übertragen werden.

Gesondert zu beurteilen sind insbesondere:

- ein nicht vermietetes Grundstück,
- ein ausschließlich selbstgenutztes Grundstück,
- der Verzicht auf ein bloßes Wohnrecht,
- ein Nießbrauchsrecht ohne steuerbare laufende Einnahmen,
- ein Nießbrauchsrecht im Betriebsvermögen,
- eine Zahlung, die ausschließlich den Vermögensverlust ausgleicht,
- ein unentgeltlicher Verzicht,
- eine Zahlung, die teilweise Schenkungscharakter besitzt.

### Lernsatz

**Nicht jede Ablösung eines Nießbrauchsrechts ist steuerbar; entscheidend sind die tatsächliche Einkunftserzielung und der Zweck der Zahlung.**

---

# 15. Prüfungssichere Formulierung

**Die Zahlung für den entgeltlichen Verzicht auf das Nießbrauchsrecht stellt eine Entschädigung im Sinne des § 24 Nr. 1 Buchst. a EStG dar. Der Steuerpflichtige hat das Grundstück im Zeitpunkt des Verzichts aufgrund seines Nießbrauchsrechts tatsächlich im eigenen Namen vermietet, sodass ihm die Einkünfte aus Vermietung und Verpachtung gemäß § 21 Abs. 1 Satz 1 Nr. 1 EStG persönlich zuzurechnen waren. Die Ablösezahlung tritt wirtschaftlich an die Stelle der künftig entgehenden Mieteinnahmen. Sie ist daher den Einkünften aus Vermietung und Verpachtung zuzuordnen. Eine rechtliche, wirtschaftliche oder tatsächliche Drucksituation ist für die Steuerbarkeit nach § 24 Nr. 1 Buchst. a EStG nicht erforderlich. Eine mögliche Tarifermäßigung ist gesondert nach § 34 EStG zu prüfen.**

---

# 16. Kompakte Lernsätze

1. Das Nießbrauchsrecht berechtigt nach § 1030 Abs. 1 BGB zur Ziehung der Nutzungen im Sinne des § 100 BGB.

2. Zu den Nutzungen eines Grundstücks können die durch Vermietung erzielten Mieteinnahmen gehören.

3. Das Nießbrauchsrecht an einer Immobilie ist ein selbständiges Wirtschaftsgut.

4. § 24 Nr. 1 Buchst. a EStG erfasst Entschädigungen für entgangene oder künftig entgehende Einnahmen.

5. Zwischen der Entschädigung und den entgehenden Einnahmen muss ein kausaler wirtschaftlicher Zusammenhang bestehen.

6. Die ersetzten Einnahmen müssen dem Empfänger der Entschädigung persönlich steuerlich zuzurechnen gewesen sein.

7. Der Nießbraucher muss für eine Zurechnung der Vermietungseinkünfte regelmäßig selbst als Vermieter auftreten und die Mietverträge im eigenen Namen abschließen.

8. Verzichtet der Nießbraucher auf ein von ihm tatsächlich zur Vermietung genutztes Nießbrauchsrecht, kann die Zahlung die künftig entgehenden Mieteinnahmen ersetzen.

9. Die Ablösezahlung gehört dann nach § 24 Nr. 1 Buchst. a in Verbindung mit § 21 Abs. 1 Satz 1 Nr. 1 EStG zu den Einkünften aus Vermietung und Verpachtung.

10. Die Entschädigung folgt nach dem Surrogationsprinzip der Einkunftsart der ersetzten Einnahmen.

11. § 24 EStG erweitert die Einkunftsarten des § 2 Abs. 1 EStG nicht.

12. Wären die ersetzten Einnahmen nicht steuerbar, kann § 24 Nr. 1 Buchst. a EStG allein keine Steuerbarkeit begründen.

13. Wird nur der Verlust eines Wirtschaftsguts vergütet und werden keine steuerbaren Einnahmen ersetzt, ist § 24 Nr. 1 Buchst. a EStG grundsätzlich nicht erfüllt.

14. Bei einem tatsächlich vermieteten Grundstück ist nach BFH IX R 4/24 die Erzielung der Mieteinnahmen der wirtschaftliche Kern des Nießbrauchsrechts.

15. Eine Druck- oder Zwangssituation ist für die Steuerbarkeit nach § 24 Nr. 1 Buchst. a EStG nicht erforderlich.

16. Auch ein freiwilliger entgeltlicher Verzicht kann nach § 24 Nr. 1 Buchst. a EStG steuerbar sein.

17. Eine mögliche Tarifermäßigung ist gesondert nach § 34 Abs. 1 und Abs. 2 Nr. 2 EStG zu prüfen.

18. Die Einordnung nach § 24 Nr. 1 Buchst. a in Verbindung mit § 21 EStG geht wegen § 23 Abs. 2 EStG einer Besteuerung als privates Veräußerungsgeschäft vor.

19. Der BFH hat nicht entschieden, wie der Verzicht zu behandeln ist, wenn der Nießbraucher das Grundstück im Zeitpunkt des Verzichts nicht tatsächlich vermietet.

20. BFH IX R 4/24 ändert für tatsächlich vermietete Grundstücke die frühere Rechtsprechung des BFH X R 34/89.

21. Der steuerbare Betrag ist auf den entgeltlichen Teil der Ablösezahlung zu begrenzen.

22. Ein die Gegenleistung übersteigender unentgeltlicher Teil kann gesondert schenkungsteuerlich zu prüfen sein.

---

# 17. Antwortlogik für den Steuerstoff-Chatbot

Bei Fragen zur Ablösung eines Nießbrauchsrechts soll der Chatbot folgende Punkte abfragen:

1. Handelt es sich um ein Grundstück oder ein anderes Wirtschaftsgut?

2. Befindet sich das Nießbrauchsrecht im Privatvermögen oder im Betriebsvermögen?

3. Hat der Nießbraucher das Grundstück im Zeitpunkt des Verzichts tatsächlich vermietet?

4. Ist der Nießbraucher selbst im Außenverhältnis als Vermieter aufgetreten?

5. Hat er die Mietverträge im eigenen Namen geschlossen?

6. Waren ihm die Vermietungseinkünfte steuerlich zuzurechnen?

7. Wird die Zahlung für künftig entgehende Mieteinnahmen oder nur für den Verlust des Nießbrauchsrechts geleistet?

8. Ist die Zahlung vollständig entgeltlich oder teilweise unentgeltlich?

9. Ist eine Einordnung nach § 24 Nr. 1 Buchst. a in Verbindung mit § 21 Abs. 1 Satz 1 Nr. 1 EStG möglich?

10. Ist wegen § 23 Abs. 2 EStG eine Prüfung des privaten Veräußerungsgeschäfts nachrangig?

11. Liegen zusätzlich die Voraussetzungen einer Tarifermäßigung nach § 34 EStG vor?

---

# 18. Kurzantwort des Chatbots

**Nach BFH IX R 4/24 ist das Entgelt für den Verzicht auf ein Nießbrauchsrecht an einem Privatgrundstück als Entschädigung nach § 24 Nr. 1 Buchst. a EStG steuerbar, wenn der Nießbraucher das Grundstück im Zeitpunkt des Verzichts tatsächlich selbst vermietet und ihm die Vermietungseinkünfte nach § 21 Abs. 1 Satz 1 Nr. 1 EStG zuzurechnen sind. Die Zahlung ersetzt dann die künftig entgehenden Mieteinnahmen. Eine Druck- oder Zwangssituation ist für die Steuerbarkeit nicht erforderlich. Ob eine Tarifermäßigung nach § 34 EStG möglich ist, muss gesondert geprüft werden.**
`
},
{
  id: "umsatzsteuer-emissionszertifikate-13b-nr-6",
  title: "Emissionszertifikate: Reverse Charge nach § 13b Abs. 2 Nr. 6 UStG",
  short:
    "Übertragung von Treibhausgas-Emissionszertifikaten als sonstige Leistung mit Steuerschuldnerschaft des Leistungsempfängers.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Emissionszertifikate",
  keywords:
    "emissionszertifikate|treibhausgas|§ 13b abs. 2 nr. 6 ustg|reverse charge|sonstige leistung|§ 3a abs. 2 ustg|leistungsort|rechnung|vorsteuerabzug|zertifikatehandel",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 2 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13b Abs. 2 Nr. 6 UStG",
    "§ 13b Abs. 5 UStG",
    "§ 14a Abs. 5 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "§ 15 Abs. 2 UStG"
  ],
  body: `
# Übertragung von Treibhausgas-Emissionszertifikaten

## 1. Art der Leistung

Die Übertragung von Treibhausgas-Emissionszertifikaten ist keine Lieferung eines körperlichen Gegenstands.

Es liegt eine sonstige Leistung nach § 3 Abs. 9 UStG vor.

---

## 2. Ort der sonstigen Leistung

Wird die Leistung an einen Unternehmer für dessen Unternehmen ausgeführt,

bestimmt sich der Leistungsort nach § 3a Abs. 2 UStG.

Der Ort liegt am Sitz des Leistungsempfängers.

Beispiel:

Leistungsempfänger mit Sitz in Köln.

Ort der Leistung:

Köln und damit Inland.

---

## 3. Steuerbarkeit und Steuerpflicht

Die sonstige Leistung wird im Inland gegen Entgelt im Rahmen eines Unternehmens ausgeführt.

Sie ist nach § 1 Abs. 1 Nr. 1 UStG steuerbar.

Mangels Steuerbefreiung ist sie mit 19 % steuerpflichtig.

---

## 4. Steuerschuldnerschaft

Bei der Übertragung von Emissionszertifikaten schuldet der Leistungsempfänger die Umsatzsteuer.

Rechtsgrundlage:

§ 13b Abs. 2 Nr. 6 UStG

in Verbindung mit

§ 13b Abs. 5 UStG.

---

## 5. Zahlenbeispiel

Wert der Zertifikate:

1.000.000 €

Umsatzsteuer:

1.000.000 € × 19 %

= 190.000 €

Der Leistungsempfänger meldet 190.000 € Umsatzsteuer an.

---

## 6. Rechnung

Der leistende Unternehmer stellt eine Rechnung über das Nettoentgelt aus.

Die Rechnung darf keine offen ausgewiesene Umsatzsteuer enthalten.

Pflichthinweis:

"Steuerschuldnerschaft des Leistungsempfängers"

---

## 7. Steuerentstehung

Die Steuer entsteht nach den besonderen Vorschriften des § 13b UStG.

Im Klausurfall ist insbesondere zu prüfen,

- wann die Leistung ausgeführt wurde,
- wann die Rechnung ausgestellt wurde
- und welcher Voranmeldungszeitraum betroffen ist.

---

## 8. Vorsteuerabzug

Der Leistungsempfänger kann die nach § 13b UStG geschuldete Steuer als Vorsteuer abziehen,

wenn

- der Leistungsbezug für sein Unternehmen erfolgt
- und kein Ausschluss nach § 15 Abs. 2 UStG besteht.

Beispiel:

Umsatzsteuer:

190.000 €

Vorsteuer:

190.000 €

---

# Prüfungsschema

1. Übertragung eines Emissionszertifikats?

2. Sonstige Leistung nach § 3 Abs. 9 UStG?

3. Empfänger Unternehmer?

4. Leistungsort nach § 3a Abs. 2 UStG?

5. Steuerbarkeit und Steuerpflicht?

6. § 13b Abs. 2 Nr. 6 UStG anwenden.

7. Umsatzsteuer berechnen.

8. Rechnung ohne Umsatzsteuer prüfen.

9. Vorsteuerabzug gesondert prüfen.

---

# Typische Klausurfallen

## Fehler 1: Zertifikat als körperlichen Gegenstand behandeln

Die Übertragung ist eine sonstige Leistung.

## Fehler 2: Leistungsort beim Leistenden annehmen

Im B2B-Fall gilt regelmäßig der Empfängerort.

## Fehler 3: Umsatzsteuer in der Rechnung ausweisen

Bei Reverse Charge darf der Leistende grundsätzlich keine Umsatzsteuer offen ausweisen.

---

# Merksätze

- Emissionszertifikate führen zu einer sonstigen Leistung.
- Im B2B-Fall liegt der Ort grundsätzlich beim Leistungsempfänger.
- Der Leistungsempfänger schuldet die Umsatzsteuer.
- Die Rechnung wird netto ausgestellt.
- Der Vorsteuerabzug ist gesondert nach § 15 UStG zu prüfen.
`
},
{
  id: "umsatzsteuer-schrottlieferung-tausch-13b-nr-7",
  title: "Schrottlieferungen und tauschähnlicher Umsatz nach § 13b Abs. 2 Nr. 7 UStG",
  short:
    "Reverse Charge bei Schrottlieferungen nach Anlage 3 UStG sowie Berechnung eines tauschähnlichen Umsatzes bei Materialgestellung.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Schrott und Lohnveredelung",
  keywords:
    "schrott|stahlschrott|§ 13b abs. 2 nr. 7 ustg|anlage 3 ustg|reverse charge|tauschähnlicher umsatz|baraufgabe|materialgestellung|werkleistung|gutschrift|bemessungsgrundlage|lohnveredelung",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3 Abs. 12 UStG",
    "§ 3a Abs. 2 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 10 Abs. 2 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13a Abs. 1 Nr. 1 UStG",
    "§ 13b Abs. 2 Nr. 7 UStG",
    "§ 13b Abs. 5 UStG",
    "§ 14 Abs. 2 UStG",
    "§ 14a Abs. 5 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "Anlage 3 zum UStG"
  ],
  body: `
# Schrottlieferung und tauschähnlicher Umsatz

## 1. Ausgangssachverhalt

Ein Metallverarbeitungsbetrieb stellt Spezialmuttern her.

Der Auftraggeber liefert den benötigten Stahl an den Verarbeiter.

Der Verarbeiter

- stellt daraus Muttern her,
- behält den bei der Bearbeitung entstandenen Stahlschrott
- und erhält zusätzlich eine Barzahlung.

Vereinbarter Wert der Werkleistung:

23.800 € brutto.

Barzahlung:

13.800 €.

Wert des überlassenen Schrotts:

10.000 €.

---

## 2. Tauschähnlicher Umsatz

Es liegt ein tauschähnlicher Umsatz mit Baraufgabe vor.

Die Gegenleistung für die Herstellung der Muttern besteht aus

- dem überlassenen Stahlschrott
- und der zusätzlichen Barzahlung.

Rechtsgrundlage:

§ 3 Abs. 12 UStG.

---

# 3. Lieferung des Stahlschrotts

## Lieferung

Der Auftraggeber überträgt dem Verarbeiter den bei der Bearbeitung verbleibenden Stahlschrott.

Es liegt eine Lieferung nach § 3 Abs. 1 UStG vor.

## Ort

Da sich der Schrott bei Übertragung bereits beim Verarbeiter in Berlin befindet,

liegt der Ort der unbewegten Lieferung in Berlin.

## Steuerbarkeit und Steuerpflicht

Die Lieferung wird im Inland gegen Entgelt im Rahmen eines Unternehmens ausgeführt.

Sie ist steuerbar und mit 19 % steuerpflichtig.

---

## 4. Schrott nach Anlage 3 UStG

Stahlschrott ist ein Gegenstand der Anlage 3 zum UStG.

Bei solchen Lieferungen schuldet der Leistungsempfänger die Umsatzsteuer.

Rechtsgrundlage:

§ 13b Abs. 2 Nr. 7 UStG.

---

## 5. Bemessungsgrundlage der Schrottlieferung

Ausgangswert der gesamten Gegenleistung:

23.800 €

abzüglich Barzahlung:

13.800 €

verbleibender Bruttowert des Schrotts:

10.000 €

Darin enthaltene Umsatzsteuer:

10.000 € × 19 / 119

= rund 1.596,64 €

Netto-Bemessungsgrundlage:

rund 8.403,36 €.

Hinweis:

In älteren Unterrichtsfällen wurde teilweise mit gerundeten oder vereinfachten Werten gerechnet. Für aktuelle Berechnungen ist die Umsatzsteuer aus einem Bruttowert mathematisch korrekt herauszurechnen.

---

## 6. Rechnung oder Gutschrift

Der Leistungsempfänger kann über die an ihn ausgeführte Schrottlieferung im Gutschriftverfahren abrechnen.

Die Gutschrift darf keine offen ausgewiesene Umsatzsteuer enthalten.

Sie muss auf die Steuerschuldnerschaft des Leistungsempfängers hinweisen.

---

## 7. Vorsteuerabzug beim Leistungsempfänger

Der Leistungsempfänger kann die nach § 13b UStG geschuldete Steuer als Vorsteuer abziehen,

wenn

- der Schrott für sein Unternehmen bezogen wird
- und keine Ausschlussgründe vorliegen.

---

# 8. Herstellung der Muttern

## Werkleistung

Der Auftraggeber stellt den Hauptstoff Stahl zur Verfügung.

Der Verarbeiter erbringt daher keine Werklieferung,

sondern eine Werkleistung und damit eine sonstige Leistung.

Rechtsgrundlage:

§ 3 Abs. 9 UStG.

## Leistungsort

Im B2B-Fall bestimmt sich der Ort nach § 3a Abs. 2 UStG.

Er liegt am Sitz des Auftraggebers.

---

## 9. Bemessungsgrundlage der Werkleistung

Zur Gegenleistung gehören

- die Barzahlung,
- der Wert des überlassenen Schrotts
- sowie gegebenenfalls weitere vom Leistungsempfänger übernommene Entgeltbestandteile.

Aus der gesamten Gegenleistung ist die Umsatzsteuer herauszurechnen.

Beispiel:

Gesamte Gegenleistung brutto:

23.800 €

Netto-Bemessungsgrundlage:

23.800 € / 1,19

= 20.000 €

Umsatzsteuer:

3.800 €.

Steuerschuldner für die Werkleistung ist grundsätzlich der leistende Unternehmer nach § 13a Abs. 1 Nr. 1 UStG.

---

# Prüfungsschema

1. Welche Leistungen werden gegenseitig ausgetauscht?

2. Liegt ein Tausch oder tauschähnlicher Umsatz vor?

3. Welche Gegenleistung besteht in Geld?

4. Welche Gegenleistung besteht in Geldeswert?

5. Ist der überlassene Gegenstand in Anlage 3 UStG genannt?

6. Greift § 13b Abs. 2 Nr. 7 UStG?

7. Bemessungsgrundlagen für beide Umsätze getrennt ermitteln.

8. Rechnung oder Gutschrift prüfen.

9. Vorsteuerabzug prüfen.

---

# Typische Klausurfallen

## Fehler 1: Nur einen Umsatz annehmen

Bei einem tauschähnlichen Umsatz liegen grundsätzlich zwei Leistungen vor.

## Fehler 2: Schrottlieferung übersehen

Das Behalten des Schrotts kann eine Gegenleistung in Geldeswert darstellen.

## Fehler 3: § 13b nur auf die Werkleistung anwenden

Reverse Charge betrifft hier die Schrottlieferung, nicht automatisch die Werkleistung.

## Fehler 4: Bruttowert nicht korrekt entnetten

Ein Bruttowert ist durch 1,19 zu teilen oder mit 19/119 aufzuteilen.

---

# Merksätze

- Material des Auftraggebers spricht für eine Werkleistung.
- Schrott kann Teil der Gegenleistung sein.
- Bei Schrott nach Anlage 3 schuldet der Leistungsempfänger die Umsatzsteuer.
- Tauschähnliche Umsätze bestehen aus zwei getrennt zu prüfenden Leistungen.
- Geld und Sachwert bilden gemeinsam die Gegenleistung.
`
},
{
  id: "umsatzsteuer-gebaeudereinigung-13b-kleinunternehmer",
  title: "Gebäudereinigung: § 13b UStG, Kleinunternehmer und Vorauszahlungen",
  short:
    "Reverse Charge bei Gebäudereinigungsleistungen, Hausmeisterdiensten, Kleinunternehmern, Gutschriften und Vorauszahlungen.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Gebäudereinigung",
  keywords:
    "gebäudereinigung|hausmeisterservice|ferienwohnung|endreinigung|§ 13b abs. 2 nr. 8 ustg|reverse charge|kleinunternehmer|§ 19 ustg|vorauszahlung|anzahlung|gutschrift|vorsteuerabzug|ust 1 tg",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 3 Nr. 1 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 13b Abs. 2 Nr. 8 UStG",
    "§ 13b Abs. 4 UStG",
    "§ 13b Abs. 5 Satz 5 UStG",
    "§ 14 Abs. 2 UStG",
    "§ 14a Abs. 5 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "§ 19 UStG",
    "Abschn. 13b.5 UStAE"
  ],
  body: `
# Gebäudereinigungsleistungen und Reverse Charge

## 1. Ausgangssachverhalt

Ein Unternehmer betreibt einen Hausmeisterservice für Ferienwohnungen.

Zu seinen Leistungen gehören unter anderem:

- Schlüsselübergabe,
- kleinere Reparaturen,
- Endreinigung,
- Betreuung bei Mieterwechseln.

Für die Endreinigung beauftragt er einen selbständigen Gebäudereiniger.

---

# 2. Hausmeisterservice gegenüber den Eigentümern

## Art der Leistung

Der Hausmeisterservice erbringt sonstige Leistungen nach § 3 Abs. 9 UStG.

Enthält das Leistungspaket auch Reinigungsarbeiten,

kann es insgesamt als Gebäudereinigungsleistung einzuordnen sein,

wenn die Reinigung den Leistungsumfang maßgeblich prägt.

## Leistungsort

Gebäudereinigungsleistungen stehen unmittelbar mit Grundstücken in Zusammenhang.

Der Ort liegt dort,

wo sich das jeweilige Gebäude befindet.

## Steuerbarkeit und Steuerpflicht

Die Leistungen sind im Inland steuerbar und grundsätzlich mit 19 % steuerpflichtig.

## Steuerschuldner

Die Wohnungseigentümer werden nicht allein durch den Bezug der Leistung Steuerschuldner nach § 13b Abs. 2 Nr. 8 UStG.

Voraussetzung wäre insbesondere,

dass sie selbst nachhaltig Gebäudereinigungsleistungen erbringen.

Steuerschuldner bleibt daher grundsätzlich der Hausmeisterservice.

---

# 3. Leistung des Gebäudereinigers an den Hausmeisterservice

## Gebäudereinigungsleistung

Die Endreinigung von Ferienwohnungen ist eine Gebäudereinigungsleistung.

Sie fällt unter § 13b Abs. 2 Nr. 8 UStG.

## Persönliche Voraussetzung

Der Leistungsempfänger schuldet die Umsatzsteuer nur,

wenn er selbst nachhaltig Gebäudereinigungsleistungen erbringt.

Der Zusammenhang mit einem bestimmten Ausgangsumsatz ist nicht erforderlich.

Der Nachweis kann durch die Bescheinigung USt 1 TG geführt werden.

## Rechtsfolge

Erbringt der Hausmeisterservice selbst nachhaltig Gebäudereinigungsleistungen,

schuldet er als Leistungsempfänger die Umsatzsteuer nach § 13b Abs. 5 Satz 5 UStG.

---

## 4. Rechnung oder Gutschrift

Der Gebäudereiniger stellt eine Nettorechnung aus.

Alternativ kann der Leistungsempfänger im Gutschriftverfahren abrechnen.

Die Rechnung oder Gutschrift muss den Hinweis enthalten:

"Steuerschuldnerschaft des Leistungsempfängers"

Ein offener Umsatzsteuerausweis ist unzulässig.

---

## 5. Vorsteuerabzug

Der Leistungsempfänger kann die nach § 13b UStG geschuldete Steuer als Vorsteuer abziehen,

wenn

- die Reinigungsleistung für sein Unternehmen bezogen wird
- und keine Vorsteuerausschlüsse bestehen.

---

# 6. Leistungsempfänger ist Kleinunternehmer

Ist der Hausmeisterservice Kleinunternehmer,

bleiben seine eigenen Ausgangsumsätze unter den Voraussetzungen des § 19 UStG steuerfrei.

Die Kleinunternehmerregelung verhindert jedoch nicht,

dass er für empfangene Leistungen nach § 13b UStG Steuerschuldner wird.

Folge:

- Umsatzsteuer nach § 13b anmelden,
- regelmäßig kein Vorsteuerabzug im Rahmen der Kleinunternehmerbesteuerung.

## Merksatz

Kleinunternehmer können Reverse-Charge-Steuer schulden.

---

# 7. Leistender Gebäudereiniger ist Kleinunternehmer

Ist der leistende Gebäudereiniger Kleinunternehmer,

muss die aktuelle gesetzliche Behandlung gesondert geprüft werden.

Die Kleinunternehmerregelung betrifft die Erhebung der Steuer beim Leistenden.

Für die Anwendung des § 13b UStG sind die jeweils geltenden Sonderregelungen und der konkrete Leistungszeitpunkt maßgeblich.

Die Wissensdatenbank sollte deshalb bei diesem Sonderfall einen Hinweis ausgeben:

"Aktuellen Gesetzesstand zu § 13b und § 19 UStG prüfen."

---

# 8. Vorauszahlungen

Zahlt der Leistungsempfänger das Entgelt vor Ausführung der Leistung,

kann die Steuer nach den besonderen Anzahlungsregeln des § 13b UStG bereits mit Vereinnahmung des Entgelts entstehen.

Gleichzeitig kann der Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 4 UStG möglich sein,

wenn die allgemeinen Voraussetzungen erfüllt sind.

---

# Prüfungsschema

1. Liegt eine Reinigung eines Gebäudes oder Gebäudeteils vor?

2. Ist die Leistung im Inland steuerbar?

3. Ist der Leistungsempfänger Unternehmer?

4. Erbringt er selbst nachhaltig Gebäudereinigungsleistungen?

5. Liegt eine gültige Bescheinigung USt 1 TG vor?

6. Greift § 13b Abs. 2 Nr. 8 UStG?

7. Rechnung oder Gutschrift ohne Umsatzsteuer?

8. Umsatzsteuer berechnen und anmelden.

9. Vorsteuerabzug prüfen.

10. Kleinunternehmerstatus beider Beteiligten gesondert prüfen.

11. Anzahlungen oder Vorauszahlungen berücksichtigen.

---

# Typische Klausurfallen

## Fehler 1: Jeder Unternehmer wird Steuerschuldner

Der Leistungsempfänger muss grundsätzlich selbst nachhaltig Gebäudereinigungsleistungen erbringen.

## Fehler 2: Unmittelbaren Zusammenhang verlangen

Es ist nicht erforderlich,

dass die bezogene Reinigung für einen eigenen Reinigungsauftrag verwendet wird.

## Fehler 3: Kleinunternehmer ignorieren

Auch Kleinunternehmer können Steuer nach § 13b schulden.

## Fehler 4: Rechnung mit Umsatzsteuer ausstellen

Bei Reverse Charge wird netto abgerechnet.

## Fehler 5: Vorauszahlungen erst bei Leistungsausführung erfassen

Bei Vorauszahlungen kann die Steuer bereits früher entstehen.

---

# Merksätze

- Gebäudereinigung ist ein eigener Reverse-Charge-Tatbestand.
- Der Leistungsempfänger muss selbst nachhaltig Gebäudereinigungsleistungen erbringen.
- Der konkrete Zusammenhang mit einem Ausgangsauftrag ist nicht erforderlich.
- Die Rechnung enthält keine Umsatzsteuer.
- Auch Kleinunternehmer können §-13b-Steuer schulden.
- Steuerschuld und Vorsteuerabzug sind getrennt zu prüfen.
`
},
{
  id: "pruefungssaetze-bilanzierung-vorsteuer-gemeinnuetzigkeit",

  title:
    "Prüfungssichere Lernsätze: Bilanzierung, Vorsteuer und Gemeinnützigkeit",

  short:
    "Gesetzlich geprüfte Lernsätze zu Buchführung, Bilanzierung, Anlage- und Umlaufvermögen, Bewertung, Anschaffungs- und Herstellungskosten, Abschreibungen, Rückstellungen, Vorsteuer sowie den vier steuerlichen Bereichen gemeinnütziger Körperschaften.",

  category:
    "Rechnungswesen / Handelsrecht / Umsatzsteuer / Gemeinnützigkeit",

  source:
    "Interne Steuerstoff-Wissensdatenbank – Rechtsstand 14.07.2026",

  keywords:
    "bilanzierungspflicht|buchführungspflicht|vollständigkeitsgebot|saldierungsverbot|verrechnungsverbot|anlagevermögen|umlaufvermögen|vorsteuer|vorsteuerüberhang|forderung finanzamt|anschaffungskosten|herstellungskosten|abschreibung|niederstwertprinzip|wertaufholung|rückstellung|verbindlichkeit|guv|umsatzerlöse|umsatzsteuer|gemeinnützigkeit|ideeller bereich|vermögensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|tatsächliche geschäftsführung|vier sphären|§ 238 hgb|§ 242 hgb|§ 246 hgb|§ 247 hgb|§ 249 hgb|§ 252 hgb|§ 253 hgb|§ 255 hgb|§ 266 hgb|§ 275 hgb|§ 277 hgb|§ 63 ao|§ 64 ao|§ 65 ao|§ 5 kstg|§ 12 ustg",

  references: [
    "§ 238 Abs. 1 HGB",
    "§ 242 Abs. 1 bis 3 HGB",
    "§ 246 Abs. 1 und 2 HGB",
    "§ 247 Abs. 1 und 2 HGB",
    "§ 249 Abs. 1 HGB",
    "§ 252 Abs. 1 HGB",
    "§ 253 Abs. 1, 3, 4 und 5 HGB",
    "§ 255 Abs. 1 und 2 HGB",
    "§ 266 Abs. 2 B. II. HGB",
    "§ 275 HGB",
    "§ 277 Abs. 1 HGB",
    "§ 9b Abs. 1 EStG",
    "§ 15 Abs. 1 UStG",
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 2 Abs. 1 UStG",
    "§ 12 Abs. 2 Nr. 8 Buchst. a UStG",
    "§ 14 AO",
    "§ 59 AO",
    "§ 63 Abs. 1, 3 und 4 AO",
    "§ 64 Abs. 1 und 3 AO",
    "§§ 65 bis 68 AO",
    "§ 5 Abs. 1 Nr. 9 KStG",
    "AEAO zu § 63 Nr. 1"
  ],

  officialSources: [
    "https://www.gesetze-im-internet.de/hgb/",
    "https://www.gesetze-im-internet.de/estg/",
    "https://www.gesetze-im-internet.de/ustg_1980/",
    "https://www.gesetze-im-internet.de/ao_1977/",
    "https://www.gesetze-im-internet.de/kstg_1977/",
    "https://ao.bundesfinanzministerium.de/ao/2025/Abgabenordnung/Zweiter-Teil/Dritter-Abschnitt/Paragraf-63/inhalt.html"
  ],

  body: `
# Prüfungssichere Lernsätze zu Bilanzierung, Vorsteuer und Gemeinnützigkeit

Die nachfolgenden Aussagen sind als kurze Lernsätze für Klausuren und zur Verwendung durch den Steuerstoff-Chatbot formuliert.

Wichtig:

Einige verbreitete Kurzfassungen sind zu pauschal oder enthalten ungenaue Fundstellen. Der Chatbot soll deshalb ausschließlich die nachfolgenden, korrigierten Fassungen verwenden.

---

# Teil A: Grundlagen der Bilanzierung

## 1. Buchführungspflicht

### Rechtsgrundlage

§ 238 Abs. 1 HGB.

### Lernsatz

Jeder Kaufmann ist verpflichtet, Bücher zu führen und darin seine Handelsgeschäfte sowie die Lage seines Vermögens nach den Grundsätzen ordnungsmäßiger Buchführung ersichtlich zu machen.

### Kurzfassung

**Kaufmann bedeutet grundsätzlich Buchführungspflicht nach § 238 Abs. 1 HGB.**

### Prüfungshinweis

Von der handelsrechtlichen Buchführungspflicht können insbesondere Einzelkaufleute unter den Voraussetzungen des § 241a HGB befreit sein.

---

## 2. Aufstellung von Bilanz und Gewinn- und Verlustrechnung

### Rechtsgrundlage

§ 242 Abs. 1 bis 3 HGB.

### Regelungen

§ 242 Abs. 1 HGB:

Der Kaufmann hat

- zu Beginn seines Handelsgewerbes eine Eröffnungsbilanz und
- für den Schluss jedes Geschäftsjahres eine Schlussbilanz

aufzustellen.

§ 242 Abs. 2 HGB:

Der Kaufmann hat für den Schluss jedes Geschäftsjahres eine Gegenüberstellung der Aufwendungen und Erträge des Geschäftsjahres aufzustellen.

Dies ist die Gewinn- und Verlustrechnung.

§ 242 Abs. 3 HGB:

Bilanz und Gewinn- und Verlustrechnung bilden gemeinsam den Jahresabschluss.

### Lernsatz

**Die Bilanz beruht auf § 242 Abs. 1 HGB, die GuV auf § 242 Abs. 2 HGB. Zusammen bilden sie nach § 242 Abs. 3 HGB den Jahresabschluss.**

---

## 3. Vollständigkeitsgebot

### Rechtsgrundlage

§ 246 Abs. 1 Satz 1 HGB.

### Lernsatz

Der Jahresabschluss muss grundsätzlich sämtliche

- Vermögensgegenstände,
- Schulden,
- Rechnungsabgrenzungsposten,
- Aufwendungen und
- Erträge

enthalten, soweit gesetzlich nichts anderes bestimmt ist.

### Prüfungssatz

**Alle bilanzierungsfähigen Vermögensgegenstände und Schulden sind vollständig in den Jahresabschluss aufzunehmen, § 246 Abs. 1 Satz 1 HGB.**

### Ergänzung

§ 246 Abs. 1 HGB regelt außerdem die wirtschaftliche Zurechnung.

Ein Vermögensgegenstand ist grundsätzlich beim Eigentümer zu bilanzieren.

Ist er jedoch wirtschaftlich einer anderen Person zuzurechnen, muss der wirtschaftliche Eigentümer ihn bilanzieren.

---

## 4. Saldierungs- beziehungsweise Verrechnungsverbot

### Rechtsgrundlage

§ 246 Abs. 2 Satz 1 HGB.

### Lernsatz

Posten der Aktivseite dürfen grundsätzlich nicht mit Posten der Passivseite verrechnet werden.

Aufwendungen dürfen grundsätzlich nicht mit Erträgen verrechnet werden.

### Prüfungssatz

**Forderungen und Verbindlichkeiten sowie Aufwendungen und Erträge sind grundsätzlich getrennt auszuweisen, § 246 Abs. 2 Satz 1 HGB.**

### Einschränkung

Das Verrechnungsverbot gilt nicht ausnahmslos.

§ 246 Abs. 2 Satz 2 HGB enthält insbesondere eine besondere Verrechnungsvorschrift für bestimmte Vermögensgegenstände, die ausschließlich der Erfüllung von Altersversorgungsverpflichtungen oder vergleichbaren langfristigen Verpflichtungen dienen.

---

# Teil B: Anlage- und Umlaufvermögen

## 5. Gliederung der Bilanz

### Rechtsgrundlage

§ 247 Abs. 1 HGB.

### Lernsatz

In der Bilanz sind insbesondere gesondert auszuweisen:

- Anlagevermögen,
- Umlaufvermögen,
- Eigenkapital,
- Schulden und
- Rechnungsabgrenzungsposten.

### Wichtige Korrektur

§ 247 Abs. 1 HGB enthält die grundsätzliche Gliederung in Anlage- und Umlaufvermögen.

§ 247 Abs. 2 HGB definiert ausschließlich das Anlagevermögen.

§ 247 Abs. 2 HGB ist keine Definition des Umlaufvermögens.

---

## 6. Anlagevermögen

### Rechtsgrundlage

§ 247 Abs. 2 HGB.

### Gesetzliche Definition

Beim Anlagevermögen sind nur die Gegenstände auszuweisen, die bestimmt sind, dauernd dem Geschäftsbetrieb zu dienen.

### Lernsatz

**Dient ein Vermögensgegenstand dauerhaft dem Geschäftsbetrieb, gehört er zum Anlagevermögen, § 247 Abs. 2 HGB.**

### Beispiele

- Betriebsgrundstücke,
- Betriebsgebäude,
- Maschinen,
- dauerhaft eingesetzte Fahrzeuge,
- Betriebs- und Geschäftsausstattung,
- langfristig gehaltene Beteiligungen.

### Entscheidend

Maßgebend ist nicht allein die Art des Gegenstands, sondern seine betriebliche Zweckbestimmung.

Ein Fahrzeug kann daher Anlagevermögen oder Umlaufvermögen sein.

Beispiel:

- dauerhaft eingesetzter Firmenwagen: Anlagevermögen,
- Fahrzeug eines Autohändlers zum Weiterverkauf: Umlaufvermögen.

---

## 7. Umlaufvermögen

Das Umlaufvermögen wird in § 247 Abs. 2 HGB nicht ausdrücklich definiert.

Es umfasst grundsätzlich Vermögensgegenstände, die nicht dazu bestimmt sind, dem Geschäftsbetrieb dauerhaft zu dienen.

### Lernsatz

**Was nicht dauerhaft dem Geschäftsbetrieb dienen soll und nicht einem anderen Bilanzposten zuzuordnen ist, gehört regelmäßig zum Umlaufvermögen.**

### Gliederung bei Kapitalgesellschaften

§ 266 Abs. 2 B HGB nennt insbesondere:

1. Vorräte,
2. Forderungen und sonstige Vermögensgegenstände,
3. Wertpapiere,
4. Kassenbestand, Bundesbankguthaben, Guthaben bei Kreditinstituten und Schecks.

### Achtung

Nicht jede Forderung gehört zwingend zum Umlaufvermögen.

Ein langfristig gewährtes Darlehen kann bei entsprechender Dauerhalteabsicht zum Finanzanlagevermögen gehören.

Gewöhnliche Forderungen aus Lieferungen und Leistungen gehören dagegen regelmäßig zum Umlaufvermögen.

---

# Teil C: Allgemeine Bewertungsgrundsätze

## 8. Bilanzidentität

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 1 HGB.

### Lernsatz

Die Wertansätze in der Eröffnungsbilanz eines Geschäftsjahres müssen mit den Wertansätzen der Schlussbilanz des vorhergehenden Geschäftsjahres übereinstimmen.

### Kurzform

**Schlussbilanz des Vorjahres gleich Eröffnungsbilanz des Folgejahres.**

---

## 9. Fortführungsgrundsatz

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 2 HGB.

### Lernsatz

Bei der Bewertung ist grundsätzlich von der Fortführung der Unternehmenstätigkeit auszugehen, sofern keine tatsächlichen oder rechtlichen Umstände entgegenstehen.

### Kurzform

**Bewertet wird grundsätzlich unter der Annahme, dass das Unternehmen fortgeführt wird.**

---

## 10. Einzelbewertungsgrundsatz

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 3 HGB.

### Lernsatz

Vermögensgegenstände und Schulden sind zum Abschlussstichtag grundsätzlich einzeln zu bewerten.

### Kurzform

**Jeder Vermögensgegenstand und jede Schuld werden grundsätzlich einzeln bewertet.**

---

## 11. Vorsichtsprinzip

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 4 HGB.

### Lernsatz

Bei der Bewertung ist vorsichtig zu verfahren.

Alle vorhersehbaren Risiken und Verluste, die bis zum Abschlussstichtag entstanden sind, sind zu berücksichtigen, selbst wenn sie erst zwischen Abschlussstichtag und Aufstellung des Jahresabschlusses bekannt werden.

---

## 12. Realisationsprinzip

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 4 Halbsatz 2 HGB.

### Lernsatz

Gewinne dürfen erst berücksichtigt werden, wenn sie am Abschlussstichtag realisiert sind.

### Kurzform

**Unrealisierte Gewinne dürfen nicht ausgewiesen werden.**

### Wichtige Korrektur

Das Realisationsprinzip steht nicht in § 252 Abs. 1 Nr. 5 HGB.

Es ist Bestandteil von § 252 Abs. 1 Nr. 4 HGB.

---

## 13. Imparitätsprinzip

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 4 HGB.

### Lernsatz

Vorhersehbare Verluste sind bereits zu berücksichtigen, bevor sie endgültig realisiert sind.

Unrealisierte Gewinne dürfen dagegen grundsätzlich nicht ausgewiesen werden.

### Kurzform

**Verluste früh, Gewinne erst bei Realisation.**

### Wichtige Korrektur

Das Imparitätsprinzip steht ebenfalls in § 252 Abs. 1 Nr. 4 HGB und nicht in Nr. 6.

---

## 14. Periodengerechte Abgrenzung

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 5 HGB.

### Lernsatz

Aufwendungen und Erträge sind unabhängig von den Zeitpunkten der entsprechenden Zahlungen dem Geschäftsjahr zuzuordnen, zu dem sie wirtschaftlich gehören.

### Kurzform

**Nicht der Zahlungszeitpunkt, sondern die wirtschaftliche Zugehörigkeit entscheidet.**

---

## 15. Bewertungsstetigkeit

### Rechtsgrundlage

§ 252 Abs. 1 Nr. 6 HGB.

### Lernsatz

Die auf den vorhergehenden Jahresabschluss angewandten Bewertungsmethoden sind grundsätzlich beizubehalten.

### Kurzform

**Einmal gewählte Bewertungsmethoden sind grundsätzlich stetig anzuwenden.**

---

# Teil D: Anschaffungs- und Herstellungskosten

## 16. Bewertungsobergrenze

### Rechtsgrundlage

§ 253 Abs. 1 Satz 1 HGB.

### Lernsatz

Vermögensgegenstände dürfen grundsätzlich höchstens mit den Anschaffungs- oder Herstellungskosten, vermindert um erforderliche Abschreibungen, angesetzt werden.

### Kurzform

**Anschaffungs- beziehungsweise Herstellungskosten bilden grundsätzlich die Bewertungsobergrenze.**

---

## 17. Anschaffungskosten

### Rechtsgrundlage

§ 255 Abs. 1 HGB.

### Definition

Anschaffungskosten sind die Aufwendungen, die geleistet werden, um einen Vermögensgegenstand

1. zu erwerben und
2. ihn in einen betriebsbereiten Zustand zu versetzen,

soweit die Aufwendungen dem Vermögensgegenstand einzeln zugeordnet werden können.

### Berechnungsschema

Anschaffungspreis  
+ Anschaffungsnebenkosten  
+ nachträgliche Anschaffungskosten  
./. Anschaffungspreisminderungen  
= Anschaffungskosten

### Beispiele für Anschaffungsnebenkosten

- Transportkosten,
- Frachtkosten,
- Montagekosten,
- Maklerkosten,
- Notarkosten,
- Grunderwerbsteuer,
- Zulassungs- und Überführungskosten.

---

## 18. Herstellungskosten

### Rechtsgrundlage

§ 255 Abs. 2 HGB.

### Lernsatz

Herstellungskosten sind die Aufwendungen, die durch

- den Verbrauch von Gütern und
- die Inanspruchnahme von Diensten

für die Herstellung, Erweiterung oder wesentliche Verbesserung eines Vermögensgegenstands entstehen.

### Kurzform

**Anschaffung bedeutet Erwerb; Herstellung bedeutet eigenes Schaffen, Erweitern oder wesentliches Verbessern.**

---

## 19. Abziehbare Vorsteuer und Anschaffungskosten

### Rechtsgrundlagen

§ 15 Abs. 1 UStG und für die steuerliche Gewinnermittlung ausdrücklich § 9b Abs. 1 EStG.

### Lernsatz

Vorsteuer, die nach § 15 UStG abgezogen werden kann, gehört nicht zu den Anschaffungs- oder Herstellungskosten.

### Beispiel

Nettokaufpreis Maschine:

10.000 Euro.

Umsatzsteuer:

1.900 Euro.

Voller Vorsteuerabzug möglich.

Anschaffungskosten:

10.000 Euro.

Die Vorsteuer von 1.900 Euro wird als Forderung gegenüber dem Finanzamt behandelt.

---

## 20. Nicht abziehbare Vorsteuer

### Rechtsgrundlagen

§ 255 Abs. 1 beziehungsweise Abs. 2 HGB sowie § 9b Abs. 1 EStG im Umkehrschluss für die Steuerbilanz.

### Lernsatz

Nicht abziehbare Umsatzsteuer gehört zu den Anschaffungs- oder Herstellungskosten, soweit sie dem Erwerb oder der Herstellung des Vermögensgegenstands unmittelbar zuzurechnen ist.

### Beispiel

Nettokaufpreis:

10.000 Euro.

Umsatzsteuer:

1.900 Euro.

Kein Vorsteuerabzug möglich.

Anschaffungskosten:

11.900 Euro.

### Einschränkung

Nicht abziehbare Umsatzsteuer ist nicht immer zwingend zu aktivieren.

Betrifft sie einen sofort abzugsfähigen Aufwand, gehört auch die nicht abziehbare Umsatzsteuer grundsätzlich zu diesem Aufwand.

---

# Teil E: Abschreibungen und Wertminderungen

## 21. Planmäßige Abschreibung

### Rechtsgrundlage

§ 253 Abs. 3 Satz 1 HGB.

### Lernsatz

Bei Vermögensgegenständen des Anlagevermögens mit zeitlich begrenzter Nutzungsdauer sind die Anschaffungs- oder Herstellungskosten planmäßig auf die Geschäftsjahre der voraussichtlichen Nutzungsdauer zu verteilen.

### Kurzform

**Abnutzbares Anlagevermögen muss planmäßig abgeschrieben werden.**

---

## 22. Außerplanmäßige Abschreibung im Anlagevermögen

### Rechtsgrundlage

§ 253 Abs. 3 Satz 5 HGB.

### Lernsatz

Bei einer voraussichtlich dauernden Wertminderung ist ein Vermögensgegenstand des Anlagevermögens auf den niedrigeren beizulegenden Wert abzuschreiben.

### Finanzanlagen

Bei Finanzanlagen darf gemäß § 253 Abs. 3 Satz 6 HGB auch bei einer voraussichtlich nicht dauernden Wertminderung eine außerplanmäßige Abschreibung vorgenommen werden.

---

## 23. Niederstwertprinzip im Umlaufvermögen

### Rechtsgrundlage

§ 253 Abs. 4 HGB.

### Lernsatz

Vermögensgegenstände des Umlaufvermögens sind auf den niedrigeren Börsen- oder Marktpreis beziehungsweise den niedrigeren beizulegenden Wert abzuschreiben.

### Kurzform

**Im Umlaufvermögen gilt das strenge Niederstwertprinzip.**

### Prüfungshinweis

Anders als beim gewöhnlichen Anlagevermögen muss die Wertminderung im Umlaufvermögen nicht dauerhaft sein.

---

## 24. Wertaufholungsgebot

### Rechtsgrundlage

§ 253 Abs. 5 Satz 1 HGB.

### Lernsatz

Fällt der Grund für eine frühere außerplanmäßige Abschreibung weg, muss grundsätzlich eine Zuschreibung vorgenommen werden.

### Bewertungsobergrenze

Die fortgeführten Anschaffungs- oder Herstellungskosten dürfen nicht überschritten werden.

### Ausnahme

Für einen entgeltlich erworbenen Geschäfts- oder Firmenwert besteht nach § 253 Abs. 5 Satz 2 HGB ein Wertaufholungsverbot.

### Kurzform

**Fällt der Abschreibungsgrund weg, muss grundsätzlich bis höchstens zu den fortgeführten AK oder HK zugeschrieben werden.**

---

# Teil F: Rückstellungen und Verbindlichkeiten

## 25. Rückstellungen für ungewisse Verbindlichkeiten

### Rechtsgrundlage

§ 249 Abs. 1 Satz 1 HGB.

### Lernsatz

Für ungewisse Verbindlichkeiten sind Rückstellungen zu bilden.

Ungewiss kann insbesondere sein:

- ob die Verpflichtung überhaupt besteht,
- in welcher Höhe sie besteht oder
- wann sie erfüllt werden muss.

### Beispiele

- Prozessrisiken,
- Gewährleistungsverpflichtungen,
- ausstehende Rechnungen mit unklarer Höhe,
- ungewisse Steuerverpflichtungen.

---

## 26. Drohverlustrückstellungen

### Rechtsgrundlage

§ 249 Abs. 1 Satz 1 HGB.

### Lernsatz

Für drohende Verluste aus schwebenden Geschäften muss handelsrechtlich eine Rückstellung gebildet werden.

### Kurzform

**Übersteigt bei einem noch nicht vollständig erfüllten Vertrag die eigene Leistungspflicht den erwarteten Anspruch, ist der drohende Verlust zurückzustellen.**

---

## 27. Abgrenzung Rückstellung und Verbindlichkeit

### Lernsatz

Ist eine Verpflichtung dem Grunde und der Höhe nach hinreichend sicher, wird grundsätzlich eine Verbindlichkeit ausgewiesen.

Ist die Verpflichtung dem Grunde, der Höhe oder dem Zeitpunkt nach ungewiss, kommt eine Rückstellung in Betracht.

### Kurzform

**Sicher und bestimmbar bedeutet regelmäßig Verbindlichkeit; ungewiss bedeutet regelmäßig Rückstellung.**

### Achtung

Der Kurzsatz ersetzt nicht die Prüfung, ob bereits eine Außenverpflichtung vorliegt.

---

# Teil G: Gewinn- und Verlustrechnung

## 28. Pflicht zur Aufstellung der GuV

### Rechtsgrundlage

§ 242 Abs. 2 HGB.

### Lernsatz

Der Kaufmann hat für den Schluss jedes Geschäftsjahres die Aufwendungen und Erträge in einer Gewinn- und Verlustrechnung gegenüberzustellen.

---

## 29. Gliederung der GuV bei Kapitalgesellschaften

### Rechtsgrundlage

§ 275 Abs. 1 HGB.

### Lernsatz

Kapitalgesellschaften stellen die Gewinn- und Verlustrechnung in Staffelform auf.

Zulässig sind:

- Gesamtkostenverfahren oder
- Umsatzkostenverfahren.

### Achtung

§ 275 HGB gehört zu den ergänzenden Vorschriften für Kapitalgesellschaften und bestimmte gleichgestellte Gesellschaften.

---

## 30. Umsatzsteuer und Umsatzerlöse

### Rechtsgrundlage

§ 277 Abs. 1 HGB.

### Lernsatz

Umsatzerlöse werden nach Abzug von

- Erlösschmälerungen,
- Umsatzsteuer und
- sonstigen unmittelbar mit dem Umsatz verbundenen Steuern

ausgewiesen.

### Kurzform

**Die vereinnahmte Umsatzsteuer ist kein Umsatzerlös, sondern grundsätzlich eine Verbindlichkeit gegenüber dem Finanzamt.**

### Wichtige Korrektur

§ 277 HGB enthält keine allgemeine Definition sämtlicher Aufwendungen und Erträge.

Die Vorschrift regelt einzelne Posten der GuV, insbesondere die Umsatzerlöse.

---

## 31. Umsatzsteuer ist nicht immer erfolgsneutral

Die Aussage „Umsatzsteuer ist niemals Aufwand“ ist zu pauschal.

Richtig ist:

- abziehbare Vorsteuer ist grundsätzlich eine Forderung und kein Aufwand,
- vereinnahmte Umsatzsteuer ist grundsätzlich eine Verbindlichkeit und kein Ertrag,
- nicht abziehbare Vorsteuer kann jedoch Aufwand oder Bestandteil der Anschaffungs- beziehungsweise Herstellungskosten sein.

### Prüfungssatz

**Nur abzugsfähige Vorsteuer und ordnungsgemäß geschuldete Umsatzsteuer sind grundsätzlich erfolgsneutral.**

---

# Teil H: Bilanzielle Behandlung der Vorsteuer

## 32. Entstehung des Vorsteuerabzugs

### Rechtsgrundlage

§ 15 Abs. 1 UStG.

### Lernsatz

Der Unternehmer kann die gesetzlich geschuldete Steuer für Leistungen eines anderen Unternehmers als Vorsteuer abziehen, wenn die gesetzlichen Voraussetzungen erfüllt sind.

Dazu gehören insbesondere:

- Unternehmereigenschaft des Leistungsempfängers,
- Leistung durch einen anderen Unternehmer,
- Leistungsbezug für das Unternehmen,
- gesetzlich geschuldete Umsatzsteuer,
- ordnungsgemäße Rechnung, soweit gesetzlich erforderlich.

---

## 33. Vorsteuer als Forderung

### Rechtsgrundlagen

§ 246 Abs. 1 Satz 1 HGB,  
§ 266 Abs. 2 B. II. 4 HGB und  
§ 15 Abs. 1 UStG.

### Lernsatz

Ein Vorsteueranspruch ist handelsrechtlich als Forderung gegenüber dem Finanzamt zu behandeln.

Bei Kapitalgesellschaften erfolgt der Ausweis regelmäßig unter:

**Sonstige Vermögensgegenstände gemäß § 266 Abs. 2 B. II. 4 HGB.**

### Wichtige Korrektur

Die Vorsteuerforderung gehört nicht zu den Forderungen aus Lieferungen und Leistungen.

Der Schuldner ist das Finanzamt und nicht ein Kunde aus einer Lieferung oder Leistung.

---

## 34. Vorsteuer und Umlaufvermögen

### Rechtsgrundlagen

§ 247 Abs. 1 HGB und § 266 Abs. 2 B. II. 4 HGB.

### Lernsatz

Vorsteuerforderungen gehören regelmäßig zum Umlaufvermögen, weil sie nicht dazu bestimmt sind, dem Geschäftsbetrieb dauerhaft zu dienen.

### Kurzform

**Vorsteuerüberhang bedeutet regelmäßig Forderung gegenüber dem Finanzamt und damit sonstiger Vermögensgegenstand des Umlaufvermögens.**

---

## 35. Vorsteuerüberhang

### Lernsatz

Übersteigen die abziehbaren Vorsteuerbeträge die geschuldete Umsatzsteuer, besteht grundsätzlich ein Vorsteuerüberhang beziehungsweise Umsatzsteuererstattungsanspruch.

Dieser ist auf der Aktivseite der Bilanz auszuweisen.

### Bilanzposten

Sonstige Vermögensgegenstände:

§ 266 Abs. 2 B. II. 4 HGB.

---

## 36. Umsatzsteuerzahllast

Übersteigt die geschuldete Umsatzsteuer die abziehbaren Vorsteuerbeträge, besteht eine Umsatzsteuerzahllast.

Diese ist auf der Passivseite als Verbindlichkeit auszuweisen.

Bei Kapitalgesellschaften kommt regelmäßig der Posten

**Sonstige Verbindlichkeiten, davon aus Steuern**

nach § 266 Abs. 3 C. 8 HGB in Betracht.

---

## 37. Zentraler Prüfungssatz zur Vorsteuer

**Abziehbare Vorsteuer ist kein Aufwand, sondern zunächst eine Forderung gegenüber dem Finanzamt. Ein Vorsteuerüberhang wird als sonstiger Vermögensgegenstand des Umlaufvermögens ausgewiesen, § 15 Abs. 1 UStG in Verbindung mit § 246 Abs. 1 und § 266 Abs. 2 B. II. 4 HGB.**

---

# Teil I: Grundlagen der Gemeinnützigkeit

## 38. Steuerbegünstigung gemeinnütziger Körperschaften

### Rechtsgrundlagen

§§ 51 bis 68 AO und § 5 Abs. 1 Nr. 9 KStG.

### Lernsatz

Körperschaften, die nach ihrer Satzung und tatsächlichen Geschäftsführung ausschließlich und unmittelbar gemeinnützigen, mildtätigen oder kirchlichen Zwecken dienen, sind grundsätzlich von der Körperschaftsteuer befreit.

### Einschränkung

Die Steuerbefreiung erstreckt sich grundsätzlich nicht auf steuerpflichtige wirtschaftliche Geschäftsbetriebe, die keine Zweckbetriebe sind.

---

## 39. Tatsächliche Geschäftsführung

### Rechtsgrundlage

§ 63 Abs. 1 AO.

### Lernsatz

Die tatsächliche Geschäftsführung muss

- auf die ausschließliche und unmittelbare Erfüllung der steuerbegünstigten Zwecke gerichtet sein und
- den gemeinnützigkeitsrechtlichen Vorgaben der Satzung entsprechen.

### Prüfungssatz

**Nicht nur die Satzung, sondern auch das tatsächliche Handeln der Körperschaft muss gemeinnützig sein, § 63 Abs. 1 AO.**

### Folge eines Verstoßes

Weicht die tatsächliche Geschäftsführung von den gemeinnützigkeitsrechtlichen Satzungsvorgaben ab, können die Voraussetzungen der Steuerbegünstigung entfallen.

---

## 40. Maßgeblichkeit der tatsächlichen Mittelverwendung

### Rechtsgrundlage

§ 63 Abs. 1 AO.

### Lernsatz

Für die Gemeinnützigkeit ist entscheidend, wie die Körperschaft ihre Mittel tatsächlich verwendet.

Eine bloße Absicht oder eine entsprechende Formulierung in der Satzung genügt nicht.

### Kurzform

**Entscheidend ist die tatsächliche Verwendung der Mittel, nicht nur die erklärte Absicht.**

---

## 41. Nachweis durch ordnungsmäßige Aufzeichnungen

### Rechtsgrundlage

§ 63 Abs. 3 AO.

### Lernsatz

Die Körperschaft muss durch ordnungsmäßige Aufzeichnungen über ihre Einnahmen und Ausgaben nachweisen, dass ihre tatsächliche Geschäftsführung den gemeinnützigkeitsrechtlichen Anforderungen entspricht.

### Nachweise nach dem AEAO

Hierzu gehören insbesondere:

- Einnahmen- und Ausgabenaufstellungen,
- Tätigkeitsberichte,
- Vermögensübersichten,
- Nachweise über die Bildung und Entwicklung von Rücklagen,
- Belege über die tatsächliche Mittelverwendung.

### Wichtige Korrektur

Die Nachweis- und Aufzeichnungspflicht ergibt sich aus § 63 Abs. 3 AO.

§ 63 Abs. 4 AO enthält keine allgemeine Verpflichtung zur getrennten Aufzeichnung der vier Tätigkeitsbereiche.

---

## 42. Bedeutung des § 63 Abs. 4 AO

### Rechtsgrundlage

§ 63 Abs. 4 AO.

### Lernsatz

Hat eine Körperschaft Mittel ohne ausreichende gesetzliche Grundlage angesammelt, kann das Finanzamt eine angemessene Frist zur Verwendung der Mittel setzen.

Verwendet die Körperschaft die Mittel innerhalb dieser Frist für steuerbegünstigte Zwecke, gilt die tatsächliche Geschäftsführung insoweit als ordnungsgemäß.

### Kurzform

**§ 63 Abs. 4 AO ist eine Heilungsregelung für unzulässig angesammelte Mittel und keine Vorschrift über die Vier-Sphären-Buchhaltung.**

---

# Teil J: Die vier steuerlichen Bereiche

## 43. Vier-Sphären-Modell

Die Tätigkeit einer gemeinnützigen Körperschaft wird in der Praxis in folgende Bereiche gegliedert:

1. ideeller Bereich,
2. Vermögensverwaltung,
3. Zweckbetrieb,
4. steuerpflichtiger wirtschaftlicher Geschäftsbetrieb.

### Gesetzliche Einordnung

Die Begriffe ergeben sich insbesondere aus:

- § 14 AO,
- § 64 AO,
- §§ 65 bis 68 AO,
- § 5 Abs. 1 Nr. 9 KStG.

### Lernsatz

**Jeder Geschäftsvorfall einer gemeinnützigen Körperschaft muss dem zutreffenden steuerlichen Tätigkeitsbereich zugeordnet werden.**

---

## 44. Getrennte Aufzeichnung der Tätigkeitsbereiche

Die AO enthält in § 63 Abs. 3 die Pflicht, die ordnungsgemäße tatsächliche Geschäftsführung durch Aufzeichnungen nachzuweisen.

Damit

- die Mittelverwendung,
- die Steuerbefreiung und
- die Ergebnisse steuerpflichtiger wirtschaftlicher Geschäftsbetriebe

nachvollziehbar sind, müssen die Einnahmen und Ausgaben den jeweiligen Tätigkeitsbereichen sachgerecht zugeordnet werden.

### Lernsatz

**Ideeller Bereich, Vermögensverwaltung, Zweckbetrieb und steuerpflichtiger wirtschaftlicher Geschäftsbetrieb sind buchhalterisch beziehungsweise rechnerisch nachvollziehbar voneinander abzugrenzen.**

### Rechtsgrundlagen

§ 63 Abs. 3 AO,  
AEAO zu § 63 Nr. 1 sowie  
§ 64 Abs. 1 AO.

---

# Teil K: Ideeller Bereich

## 45. Begriff

Zum ideellen Bereich gehören Tätigkeiten, mit denen die Körperschaft unmittelbar ihre steuerbegünstigten Satzungszwecke verfolgt, ohne dass ein steuerpflichtiger wirtschaftlicher Geschäftsbetrieb oder eine Vermögensverwaltung vorliegt.

### Typische Einnahmen

- echte Mitgliedsbeiträge,
- Spenden,
- Zuschüsse ohne Leistungsaustausch,
- Erbschaften,
- Schenkungen,
- bestimmte Umlagen.

---

## 46. Körperschaftsteuer im ideellen Bereich

### Rechtsgrundlage

§ 5 Abs. 1 Nr. 9 KStG.

### Lernsatz

Einnahmen und Tätigkeiten des ideellen Bereichs werden grundsätzlich von der Körperschaftsteuerbefreiung der gemeinnützigen Körperschaft erfasst.

---

## 47. Umsatzsteuer im ideellen Bereich

### Rechtsgrundlage

§ 1 Abs. 1 Nr. 1 UStG.

### Lernsatz

Echte Mitgliedsbeiträge und echte Spenden sind nicht umsatzsteuerbar, wenn ihnen keine konkrete Leistung der Körperschaft gegenübersteht.

### Wichtig

Nicht jede Einnahme, die buchhalterisch dem ideellen Bereich zugeordnet wird, ist allein deshalb umsatzsteuerlich nicht steuerbar.

Entscheidend ist, ob ein Leistungsaustausch vorliegt.

### Prüfungssatz

**Ohne Leistung gegen Gegenleistung liegt grundsätzlich kein steuerbarer Umsatz nach § 1 Abs. 1 Nr. 1 UStG vor.**

---

# Teil L: Vermögensverwaltung

## 48. Begriff der Vermögensverwaltung

### Rechtsgrundlage

§ 14 AO.

### Lernsatz

Vermögensverwaltung liegt regelmäßig vor, wenn vorhandenes Vermögen genutzt wird.

Typische Beispiele sind:

- verzinsliche Anlage von Kapitalvermögen,
- langfristige Vermietung von unbeweglichem Vermögen,
- Verpachtung eigenen Vermögens.

### Abgrenzung

Eine Tätigkeit wird zum wirtschaftlichen Geschäftsbetrieb, wenn sie über die bloße Nutzung und Verwaltung des eigenen Vermögens hinausgeht.

---

## 49. Körperschaftsteuer bei Vermögensverwaltung

### Rechtsgrundlage

§ 5 Abs. 1 Nr. 9 KStG in Verbindung mit § 14 AO.

### Lernsatz

Die gewöhnliche Vermögensverwaltung einer gemeinnützigen Körperschaft wird grundsätzlich von der Körperschaftsteuerbefreiung erfasst.

---

## 50. Umsatzsteuer bei Vermögensverwaltung

Die körperschaftsteuerliche Steuerbefreiung führt nicht automatisch zur Umsatzsteuerfreiheit.

Beispiele:

- Grundstücksvermietung kann nach § 4 Nr. 12 UStG steuerfrei sein,
- bestimmte Kapitalumsätze können nach § 4 Nr. 8 UStG steuerfrei sein,
- andere Leistungen können steuerpflichtig sein.

### Lernsatz

**Körperschaftsteuerliche Vermögensverwaltung und umsatzsteuerliche Steuerfreiheit sind getrennt zu prüfen.**

---

# Teil M: Zweckbetrieb

## 51. Allgemeiner Zweckbetrieb

### Rechtsgrundlage

§ 65 AO.

Ein Zweckbetrieb liegt vor, wenn alle drei Voraussetzungen erfüllt sind:

1. Der wirtschaftliche Geschäftsbetrieb dient in seiner Gesamtrichtung der Verwirklichung der steuerbegünstigten Satzungszwecke.
2. Die steuerbegünstigten Zwecke können nur durch einen solchen Geschäftsbetrieb erreicht werden.
3. Der Geschäftsbetrieb tritt zu nicht begünstigten Betrieben derselben oder ähnlicher Art nicht stärker in Wettbewerb, als es zur Erfüllung der steuerbegünstigten Zwecke unvermeidbar ist.

### Merksatz

**Satzungszweck, Erforderlichkeit und unvermeidbarer Wettbewerb bilden die drei Voraussetzungen des § 65 AO.**

---

## 52. Besondere Zweckbetriebe

Besondere Zweckbetriebe ergeben sich insbesondere aus:

- § 66 AO: Wohlfahrtspflege,
- § 67 AO: Krankenhäuser,
- § 67a AO: sportliche Veranstaltungen,
- § 68 AO: gesetzlich aufgezählte einzelne Zweckbetriebe.

### Lernsatz

**Vor der Prüfung des allgemeinen § 65 AO ist zu prüfen, ob bereits ein besonderer Zweckbetrieb nach §§ 66 bis 68 AO vorliegt.**

---

## 53. Körperschaftsteuer beim Zweckbetrieb

### Rechtsgrundlagen

§ 5 Abs. 1 Nr. 9 KStG und § 64 Abs. 1 AO.

### Lernsatz

Ein Zweckbetrieb gehört zur steuerbegünstigten Tätigkeit der Körperschaft.

Seine Besteuerungsgrundlagen unterliegen grundsätzlich nicht der Körperschaft- und Gewerbesteuerpflicht eines steuerpflichtigen wirtschaftlichen Geschäftsbetriebs.

---

## 54. Umsatzsteuer beim Zweckbetrieb

### Rechtsgrundlagen

§ 1 Abs. 1 Nr. 1 UStG und § 12 Abs. 2 Nr. 8 Buchst. a UStG.

### Lernsatz

Leistungen eines Zweckbetriebs sind nicht automatisch umsatzsteuerfrei.

Liegt ein steuerbarer und steuerpflichtiger Leistungsaustausch vor, muss der anzuwendende Steuersatz geprüft werden.

### Ermäßigter Steuersatz

Der ermäßigte Steuersatz nach § 12 Abs. 2 Nr. 8 Buchst. a UStG kann angewendet werden, wenn die dort genannten zusätzlichen Voraussetzungen erfüllt sind.

### Prüfungssatz

**Zweckbetrieb bedeutet Körperschaftsteuerbegünstigung, aber nicht automatisch Umsatzsteuerfreiheit oder automatisch sieben Prozent Umsatzsteuer.**

---

# Teil N: Wirtschaftlicher Geschäftsbetrieb

## 55. Definition

### Rechtsgrundlage

§ 14 Satz 1 AO.

Ein wirtschaftlicher Geschäftsbetrieb ist eine

- selbständige,
- nachhaltige Tätigkeit,

durch die Einnahmen oder andere wirtschaftliche Vorteile erzielt werden und die über den Rahmen einer Vermögensverwaltung hinausgeht.

### Nicht erforderlich

Eine Gewinnerzielungsabsicht ist nach § 14 AO nicht erforderlich.

Eine Beteiligung am allgemeinen wirtschaftlichen Verkehr ist ebenfalls nicht zwingend erforderlich.

### Lernsatz

**Für einen wirtschaftlichen Geschäftsbetrieb genügt eine selbständige, nachhaltige und über die Vermögensverwaltung hinausgehende Einnahmetätigkeit.**

---

## 56. Körperschaft- und Gewerbesteuerpflicht

### Rechtsgrundlage

§ 64 Abs. 1 AO.

### Lernsatz

Unterhält eine steuerbegünstigte Körperschaft einen wirtschaftlichen Geschäftsbetrieb, der kein Zweckbetrieb ist, entfällt die Steuerbegünstigung insoweit für die diesem Geschäftsbetrieb zuzurechnenden Besteuerungsgrundlagen.

### Kurzform

**Der steuerpflichtige wirtschaftliche Geschäftsbetrieb ist körperschaft- und gewerbesteuerlich grundsätzlich steuerpflichtig, ohne dass dadurch automatisch die gesamte Gemeinnützigkeit entfällt.**

---

## 57. Einnahmengrenze von 50.000 Euro

### Rechtsgrundlage

§ 64 Abs. 3 AO.

### Lernsatz

Übersteigen die Einnahmen einschließlich Umsatzsteuer aus sämtlichen wirtschaftlichen Geschäftsbetrieben, die keine Zweckbetriebe sind, insgesamt nicht 50.000 Euro im Jahr, unterliegen die diesen Geschäftsbetrieben zuzurechnenden Besteuerungsgrundlagen nicht der Körperschaft- und Gewerbesteuer.

### Wichtig

Maßgebend sind die Einnahmen einschließlich Umsatzsteuer, nicht der Gewinn.

Mehrere steuerpflichtige wirtschaftliche Geschäftsbetriebe werden für die Grenze zusammengerechnet.

### Freigrenze

Die Grenze ist eine Freigrenze und kein Freibetrag.

Wird sie überschritten, wird nicht lediglich der übersteigende Einnahmenbetrag betrachtet.

### Zentrale Einschränkung

§ 64 Abs. 3 AO betrifft nur Körperschaft- und Gewerbesteuer.

Die Vorschrift enthält keine Umsatzsteuerbefreiung.

---

## 58. Umsatzsteuer beim wirtschaftlichen Geschäftsbetrieb

### Rechtsgrundlagen

§ 1 Abs. 1 Nr. 1 und § 2 Abs. 1 UStG.

### Lernsatz

Umsätze des wirtschaftlichen Geschäftsbetriebs sind umsatzsteuerbar, wenn

1. die Körperschaft insoweit als Unternehmer handelt und
2. eine Lieferung oder sonstige Leistung gegen Entgelt im Inland ausführt.

### Weitere Prüfung

Anschließend sind insbesondere zu prüfen:

- Steuerbefreiung nach § 4 UStG,
- Steuersatz nach § 12 UStG,
- Kleinunternehmerregelung nach § 19 UStG,
- Steuerschuldnerschaft,
- Vorsteuerabzug.

### Prüfungssatz

**Die Einnahmengrenze des § 64 Abs. 3 AO hat keinen unmittelbaren Einfluss auf die Umsatzsteuer.**

---

# Teil O: Steuerliche Folgen der vier Bereiche

## 59. Ideeller Bereich

### Körperschaftsteuer

Grundsätzlich steuerbefreit nach § 5 Abs. 1 Nr. 9 KStG.

### Umsatzsteuer

Echte Spenden und echte Mitgliedsbeiträge sind mangels Leistungsaustauschs regelmäßig nicht steuerbar, § 1 Abs. 1 Nr. 1 UStG.

---

## 60. Vermögensverwaltung

### Körperschaftsteuer

Grundsätzlich von der Steuerbefreiung erfasst, § 5 Abs. 1 Nr. 9 KStG in Verbindung mit § 14 AO.

### Umsatzsteuer

Gesondert zu prüfen.

Je nach Tätigkeit steuerpflichtig oder nach § 4 UStG steuerfrei.

---

## 61. Zweckbetrieb

### Körperschaftsteuer

Grundsätzlich steuerbegünstigt, § 5 Abs. 1 Nr. 9 KStG in Verbindung mit §§ 64 bis 68 AO.

### Umsatzsteuer

Nicht automatisch steuerfrei.

Der ermäßigte Steuersatz nach § 12 Abs. 2 Nr. 8 Buchst. a UStG kann unter den dort genannten Voraussetzungen anwendbar sein.

---

## 62. Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb

### Körperschaft- und Gewerbesteuer

Grundsätzlich steuerpflichtig nach § 64 Abs. 1 AO.

Die Einnahmengrenze des § 64 Abs. 3 AO ist zu prüfen.

### Umsatzsteuer

Bei Vorliegen der Voraussetzungen des § 1 Abs. 1 Nr. 1 UStG grundsätzlich steuerbar.

Steuerbefreiungen und Steuersatz sind gesondert zu prüfen.

---

# Teil P: Kompakte Lernsatz-Sammlung

1. Jeder Kaufmann ist grundsätzlich nach § 238 Abs. 1 HGB zur Buchführung verpflichtet.

2. Die Bilanz beruht auf § 242 Abs. 1 HGB, die GuV auf § 242 Abs. 2 HGB.

3. Bilanz und GuV bilden nach § 242 Abs. 3 HGB den Jahresabschluss.

4. Der Jahresabschluss muss nach § 246 Abs. 1 HGB grundsätzlich sämtliche Vermögensgegenstände, Schulden, Aufwendungen und Erträge enthalten.

5. Aktiv- und Passivposten sowie Aufwendungen und Erträge dürfen nach § 246 Abs. 2 Satz 1 HGB grundsätzlich nicht verrechnet werden.

6. Anlagevermögen sind nach § 247 Abs. 2 HGB die Gegenstände, die dauerhaft dem Geschäftsbetrieb dienen sollen.

7. § 247 Abs. 2 HGB definiert nicht das Umlaufvermögen, sondern das Anlagevermögen.

8. Typische Forderungen aus Lieferungen und Leistungen gehören regelmäßig zum Umlaufvermögen.

9. Ein Vorsteueranspruch ist regelmäßig ein sonstiger Vermögensgegenstand nach § 266 Abs. 2 B. II. 4 HGB.

10. Das Realisationsprinzip steht in § 252 Abs. 1 Nr. 4 HGB.

11. Das Imparitätsprinzip steht ebenfalls in § 252 Abs. 1 Nr. 4 HGB.

12. § 252 Abs. 1 Nr. 5 HGB enthält die periodengerechte Abgrenzung.

13. Anschaffungs- und Herstellungskosten bilden nach § 253 Abs. 1 Satz 1 HGB grundsätzlich die Bewertungsobergrenze.

14. Anschaffungskosten werden nach § 255 Abs. 1 HGB ermittelt.

15. Herstellungskosten werden nach § 255 Abs. 2 HGB ermittelt.

16. Abziehbare Vorsteuer gehört nach § 9b Abs. 1 EStG nicht zu den Anschaffungs- oder Herstellungskosten.

17. Nicht abziehbare Vorsteuer kann Bestandteil der Anschaffungs- oder Herstellungskosten sein.

18. Abnutzbares Anlagevermögen ist nach § 253 Abs. 3 Satz 1 HGB planmäßig abzuschreiben.

19. Im Umlaufvermögen gilt nach § 253 Abs. 4 HGB das strenge Niederstwertprinzip.

20. Fällt der Grund einer außerplanmäßigen Abschreibung weg, besteht grundsätzlich das Wertaufholungsgebot nach § 253 Abs. 5 HGB.

21. Für ungewisse Verbindlichkeiten und drohende Verluste aus schwebenden Geschäften sind nach § 249 Abs. 1 HGB Rückstellungen zu bilden.

22. Ist eine Verpflichtung sicher und hinreichend bestimmbar, wird grundsätzlich eine Verbindlichkeit ausgewiesen.

23. Ist eine Verpflichtung dem Grunde, der Höhe oder dem Zeitpunkt nach ungewiss, kommt eine Rückstellung in Betracht.

24. Umsatzsteuer wird nach § 277 Abs. 1 HGB nicht als Bestandteil der Umsatzerlöse ausgewiesen.

25. Abziehbare Vorsteuer ist grundsätzlich kein Aufwand, sondern eine Forderung gegenüber dem Finanzamt.

26. Ein Vorsteuerüberhang wird regelmäßig als sonstiger Vermögensgegenstand im Umlaufvermögen ausgewiesen.

27. Die tatsächliche Geschäftsführung einer gemeinnützigen Körperschaft muss nach § 63 Abs. 1 AO der Satzung und den gemeinnützigkeitsrechtlichen Anforderungen entsprechen.

28. Die ordnungsgemäße tatsächliche Geschäftsführung ist nach § 63 Abs. 3 AO durch ordnungsmäßige Aufzeichnungen nachzuweisen.

29. § 63 Abs. 4 AO regelt keine Vier-Sphären-Buchhaltung, sondern eine Frist zur Verwendung unzulässig angesammelter Mittel.

30. Die vier steuerlichen Bereiche sind ideeller Bereich, Vermögensverwaltung, Zweckbetrieb und steuerpflichtiger wirtschaftlicher Geschäftsbetrieb.

31. Echte Spenden und echte Mitgliedsbeiträge sind mangels Leistungsaustauschs regelmäßig nicht umsatzsteuerbar, § 1 Abs. 1 Nr. 1 UStG.

32. Vermögensverwaltung ist von einem wirtschaftlichen Geschäftsbetrieb nach § 14 AO abzugrenzen.

33. Ein Zweckbetrieb muss die Voraussetzungen des § 65 AO oder eines besonderen Zweckbetriebs nach §§ 66 bis 68 AO erfüllen.

34. Ein Zweckbetrieb ist nicht automatisch umsatzsteuerfrei.

35. Der ermäßigte Steuersatz nach § 12 Abs. 2 Nr. 8 Buchst. a UStG ist bei Zweckbetrieben nur unter den gesetzlichen Voraussetzungen anwendbar.

36. Ein steuerpflichtiger wirtschaftlicher Geschäftsbetrieb führt nach § 64 Abs. 1 AO grundsätzlich zur Körperschaft- und Gewerbesteuerpflicht der ihm zuzurechnenden Besteuerungsgrundlagen.

37. Die Einnahmengrenze nach § 64 Abs. 3 AO beträgt 50.000 Euro einschließlich Umsatzsteuer.

38. Die Grenze des § 64 Abs. 3 AO betrifft Körperschaft- und Gewerbesteuer, nicht die Umsatzsteuer.

39. Die umsatzsteuerliche Behandlung ist für jeden Tätigkeitsbereich gesondert nach dem UStG zu prüfen.

40. Körperschaftsteuerliche Steuerbegünstigung bedeutet nicht automatisch Umsatzsteuerfreiheit.
`
},
{
  id: "umsatzsteuer-anlagegold-option-13b-nr-9",
  title: "Anlagegold: Option und Reverse Charge nach § 13b Abs. 2 Nr. 9 UStG",
  short:
    "Steuerbefreiung für Anlagegold, Option zur Steuerpflicht und Steuerschuldnerschaft des Leistungsempfängers.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Anlagegold",
  keywords:
    "anlagegold|gold|§ 25c ustg|§ 13b abs. 2 nr. 9 ustg|reverse charge|option steuerpflicht|goldkonto|scheideanstalt|steuerbefreiung|leistungsempfänger",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13b Abs. 2 Nr. 9 UStG",
    "§ 13b Abs. 5 UStG",
    "§ 14a Abs. 5 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "§ 25c UStG"
  ],
  body: `
# Anlagegold – Steuerbefreiung, Option und Reverse Charge

## 1. Grundsatz

Die Lieferung von Anlagegold ist grundsätzlich von der Umsatzsteuer befreit.

Rechtsgrundlage:

§ 25c Abs. 1 UStG.

Anlagegold umfasst insbesondere Goldbarren und Goldplättchen,

wenn die gesetzlichen Voraussetzungen an Feingehalt und Marktgängigkeit erfüllt sind.

---

## 2. Ausgangssachverhalt

Ein Goldhändler überlässt einer Scheideanstalt verunreinigtes Gold.

Die Scheideanstalt trennt das Gold von anderen Metallen

und schreibt das daraus hergestellte Anlagegold einem Goldkonto des Händlers gut.

Der Händler behält die Verfügungsmacht über das Gold.

Später verzichtet der Händler gegen Entgelt auf seinen Herausgabeanspruch.

---

## 3. Lieferung des Anlagegolds

Der entgeltliche Verzicht auf den Herausgabeanspruch kann eine Übertragung der Verfügungsmacht und damit eine Lieferung darstellen.

Die Lieferung ist unbewegt.

Ort der Lieferung ist dort,

wo sich das Anlagegold bei Übertragung befindet.

---

## 4. Steuerbefreiung

Die Lieferung von Anlagegold ist grundsätzlich nach § 25c UStG steuerfrei.

---

## 5. Option zur Steuerpflicht

Unter den Voraussetzungen des § 25c UStG kann der Unternehmer auf die Steuerbefreiung verzichten.

Die Option ist insbesondere bei bestimmten Unternehmern und bestimmten Lieferungen von Anlagegold möglich.

Wird wirksam optiert,

ist die Lieferung steuerpflichtig.

---

## 6. Reverse Charge

Bei einer steuerpflichtigen Lieferung von Anlagegold kann der Leistungsempfänger die Umsatzsteuer schulden.

Rechtsgrundlage:

§ 13b Abs. 2 Nr. 9 UStG

in Verbindung mit

§ 13b Abs. 5 UStG.

Der leistende Unternehmer stellt eine Nettorechnung aus.

Die Rechnung enthält den Hinweis:

"Steuerschuldnerschaft des Leistungsempfängers"

---

## 7. Vorsteuerabzug

Der Leistungsempfänger kann die nach § 13b UStG geschuldete Steuer nach § 15 Abs. 1 Satz 1 Nr. 4 UStG als Vorsteuer abziehen,

wenn

- das Gold für das Unternehmen bezogen wird
- und kein Vorsteuerausschluss besteht.

---

# Prüfungsschema

1. Handelt es sich um Anlagegold im Sinne des § 25c UStG?

2. Liegt eine Lieferung vor?

3. Wo befindet sich das Gold bei Übertragung?

4. Greift die Steuerbefreiung nach § 25c UStG?

5. Wurde wirksam zur Steuerpflicht optiert?

6. Greift § 13b Abs. 2 Nr. 9 UStG?

7. Rechnung ohne Umsatzsteuer prüfen.

8. Steuer beim Leistungsempfänger berechnen.

9. Vorsteuerabzug gesondert prüfen.

---

# Typische Klausurfallen

## Fehler 1: Jede Goldlieferung ist steuerfrei

Nur Anlagegold im Sinne des § 25c UStG fällt unter die besondere Befreiung.

## Fehler 2: Option übersehen

Unter den gesetzlichen Voraussetzungen kann zur Steuerpflicht optiert werden.

## Fehler 3: Steuer beim Lieferer erfassen

Bei steuerpflichtiger Anlagegoldlieferung kann der Leistungsempfänger Steuerschuldner sein.

## Fehler 4: Goldkonto ohne Lieferung behandeln

Auch die Übertragung oder Aufgabe eines Herausgabeanspruchs kann eine Lieferung auslösen.

---

# Merksätze

- Anlagegold ist grundsätzlich steuerfrei.
- Eine Option zur Steuerpflicht kann möglich sein.
- Bei wirksamer Option kann Reverse Charge greifen.
- Der Leistungsempfänger meldet die Umsatzsteuer.
- Der Vorsteuerabzug ist gesondert zu prüfen.
`
},
{
  id: "umsatzsteuer-fassadenerneuerung-bauleistung-jpoer-geruest",
  title: "Fassadenerneuerung: § 13b UStG, jPöR, Gerüstbau und Vertragsstrafe",
  short:
    "Komplexer Umsatzsteuerfall zur Fassadenerneuerung mit öffentlichem Auftraggeber, Fliesenleger, Gerüstbauer, Leistungsbeistellung, Anzahlungen und Vorsteuerabzug.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Fassadenerneuerung",
  keywords:
    "fassadenerneuerung|fassadenverkleidung|§ 13b ustg|bauleistung|juristische person öffentlichen rechts|bundesagentur für arbeit|werklieferung|werkleistung|fliesenleger|gerüstbauer|leistungsbeistellung|vertragsstrafe|schadensersatz|anzahlung|vorsteuerabzug|reverse charge",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 2 Abs. 3 UStG",
    "§ 3 Abs. 4 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 3 Nr. 1 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 13a Abs. 1 Nr. 1 UStG",
    "§ 13b Abs. 2 Nr. 4 UStG",
    "§ 13b Abs. 5 Satz 2 UStG",
    "§ 14c UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 1 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "§ 15 Abs. 2 UStG",
    "Abschn. 1.4 UStAE",
    "Abschn. 10.1 UStAE",
    "Abschn. 13b.2 UStAE",
    "Abschn. 13b.3 UStAE"
  ],
  body: `
# Fassadenerneuerung – komplexer Umsatzsteuerfall

## 1. Sachverhalt im Überblick

Eine KG übernimmt für die Bundesagentur für Arbeit die Verkleidung eines Dienstgebäudes mit Granitplatten.

Auftragssumme:

500.000 € netto.

Die KG

- beschafft die Granitfliesen,
- beauftragt einen selbständigen Fliesenleger mit den Verlegearbeiten,
- beauftragt einen Gerüstbauer,
- stellt dem Gerüstbauer eigene Hilfskräfte zur Verfügung.

Zu prüfen sind:

- Ausgangsleistung der KG,
- Verlegeleistung des Fliesenlegers,
- Gerüstbauleistung,
- Leistungsbeistellung,
- Vertragsstrafe,
- Anzahlungen,
- Steuerschuldnerschaft
- und Vorsteuerabzug.

---

# 2. Fassadenverkleidung durch die KG

## Art der Leistung

Die KG bringt selbst beschaffte Granitfliesen an dem Gebäude an.

Die Granitfliesen bestimmen den wirtschaftlichen Gehalt der Leistung und stellen Hauptstoffe dar.

Damit liegt eine Werklieferung nach § 3 Abs. 4 UStG vor.

## Einschaltung von Subunternehmern

Die KG schuldet gegenüber der Bundesagentur das fertige Werk.

Dass sie sich zur Ausführung eines Fliesenlegers bedient, ist unschädlich.

Der Fliesenleger ist umsatzsteuerlich Erfüllungsgehilfe der KG.

## Zeitpunkt der Leistung

Die Werklieferung ist mit der Abnahme des fertigen Werks ausgeführt.

Im Beispiel:

10.09.

## Ort der Leistung

Der Ort der unbewegten Werklieferung befindet sich am Belegenheitsort des Gebäudes.

Im Beispiel:

Wuppertal.

## Steuerbarkeit und Steuerpflicht

Die Werklieferung ist im Inland steuerbar und mangels Steuerbefreiung mit 19 % steuerpflichtig.

Bemessungsgrundlage:

500.000 €

Umsatzsteuer:

500.000 € × 19 %

= 95.000 €

---

# 3. Keine Steuerschuldnerschaft der Bundesagentur

## § 13b Abs. 2 Nr. 1 UStG

Diese Vorschrift greift nicht, weil die KG kein im Ausland ansässiger Unternehmer ist.

## § 13b Abs. 2 Nr. 4 UStG

Die Bundesagentur erhält die Leistung für ihren hoheitlichen Bereich.

Sie empfängt die Leistung nicht im Rahmen eines Betriebs gewerblicher Art, der selbst nachhaltig Bauleistungen erbringt.

Daher wird sie nicht Steuerschuldner nach § 13b Abs. 5 Satz 2 UStG.

## Rechtsfolge

Steuerschuldner bleibt die KG nach § 13a Abs. 1 Nr. 1 UStG.

Die KG muss

95.000 € Umsatzsteuer

anmelden und abführen.

---

# 4. Fehlerhafter Reverse-Charge-Hinweis

Die KG stellt eine Rechnung ohne Umsatzsteuerausweis aus und weist fälschlich auf die Steuerschuldnerschaft der Bundesagentur hin.

## Folge

Der Hinweis ist sachlich falsch.

Da jedoch keine Umsatzsteuer offen ausgewiesen wurde, entsteht keine zusätzliche Steuerschuld nach § 14c UStG.

Die KG schuldet dennoch die gesetzlich entstandene Umsatzsteuer von 95.000 €.

## Merksatz

Falscher Reverse-Charge-Hinweis

ohne offenen Steuerausweis

führt nicht automatisch zu § 14c UStG.

---

# 5. Verlegearbeiten des Fliesenlegers

## Art der Leistung

Die KG stellt sämtliche Granitfliesen und damit die Hauptstoffe zur Verfügung.

Der Fliesenleger führt ausschließlich die Verlegearbeiten aus.

Damit liegt keine Werklieferung, sondern eine Werkleistung und somit eine sonstige Leistung nach § 3 Abs. 9 UStG vor.

## Zeitpunkt

Die Leistung ist mit Beendigung der Verlegearbeiten ausgeführt.

Im Beispiel:

30.08.

## Ort

Die Leistung steht unmittelbar mit einem Grundstück in Zusammenhang.

Ort der Leistung ist Wuppertal.

## Steuerbarkeit

Die Leistung ist im Inland steuerbar und steuerpflichtig.

---

# 6. Reverse Charge für die Verlegearbeiten

## Bauleistung

Das Verlegen von Granitfliesen an einer Gebäudefassade dient der Instandhaltung oder Änderung eines Bauwerks.

Es handelt sich um eine Bauleistung nach § 13b Abs. 2 Nr. 4 UStG.

## Leistungsempfänger

Die KG erbringt selbst Bauleistungen.

Daher schuldet sie als Leistungsempfängerin die Umsatzsteuer nach § 13b Abs. 5 Satz 2 UStG.

## Bemessungsgrundlage

160.000 €

Umsatzsteuer:

160.000 € × 19 %

= 30.400 €

## Steuerentstehung ohne Rechnung

Der Fliesenleger stellt trotz Aufforderung zunächst keine Rechnung aus.

Bei Leistungen nach § 13b UStG entsteht die Steuer spätestens nach den gesetzlichen Sonderregeln.

Da die Leistung am 30.08. ausgeführt wurde und keine Rechnung vorliegt, ist die Umsatzsteuer im Voranmeldungszeitraum September zu erfassen.

## Vorsteuerabzug

Die KG kann die nach § 13b UStG geschuldete Steuer nach § 15 Abs. 1 Satz 1 Nr. 4 UStG als Vorsteuer abziehen.

Vorsteuer:

30.400 €

Für diesen Vorsteuerabzug ist eine Rechnung nicht zwingende Voraussetzung.

Voraussetzung bleibt:

- Leistung für das Unternehmen
- kein Ausschluss nach § 15 Abs. 2 UStG.

Da die Verlegeleistung unmittelbar für den steuerpflichtigen Fassadenumsatz verwendet wird, besteht der Vorsteuerabzug vollständig.

## Merksatz

Bei § 13b-Umsätzen ist der Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 4 UStG grundsätzlich auch ohne Rechnung möglich.

---

# 7. Gerüstbauleistung

## Art der Leistung

Der Gerüstbauer errichtet und entfernt das Baugerüst.

Es handelt sich um eine Werkleistung und damit um eine sonstige Leistung nach § 3 Abs. 9 UStG.

## Zeitpunkt

Die Leistung ist mit Abschluss der geschuldeten Arbeiten ausgeführt.

Im Beispiel:

Abbau des Gerüsts im August.

## Ort

Die Gerüstbauleistung steht mit dem Grundstück in Zusammenhang.

Ort:

Wuppertal.

## Steuerbarkeit und Steuerpflicht

Die Leistung ist im Inland steuerbar und mit 19 % steuerpflichtig.

---

# 8. Personalgestellung als Leistungsbeistellung

Die KG stellt dem Gerüstbauer fünf eigene Hilfskräfte zur Verfügung.

Diese werden ausschließlich auf der Baustelle eingesetzt und weiterhin von der KG bezahlt.

## Beurteilung

Die Personalgestellung erfolgt lediglich zur Unterstützung der Leistung des Gerüstbauers.

Sie nimmt nicht an einem eigenständigen Leistungsaustausch teil.

Es handelt sich um eine nicht steuerbare Leistungsbeistellung.

## Folge

Das vereinbarte Entgelt für die Gerüstbauleistung wird durch die Personalgestellung nicht gemindert.

---

# 9. Kein Reverse Charge beim Gerüstbau

Nach der im Fall zugrunde gelegten Verwaltungsauffassung stellt das bloße Auf- und Abbauen eines Gerüsts keine Bauleistung im Sinne des § 13b Abs. 2 Nr. 4 UStG dar.

Daher geht die Steuerschuld nicht auf die KG über.

Steuerschuldner bleibt der Gerüstbauer nach § 13a Abs. 1 Nr. 1 UStG.

## Bemessungsgrundlage

Ursprüngliches Entgelt:

100.000 €

Preisnachlass:

10 %

Endgültiges Nettoentgelt:

90.000 €

Umsatzsteuer:

90.000 € × 19 %

= 17.100 €

---

# 10. Vertragsstrafe

Der Gerüstbauer führt die Arbeiten nicht fristgerecht aus.

Die KG kürzt deshalb die Abschlusszahlung um eine vereinbarte Vertragsstrafe von

5.000 €.

## Umsatzsteuerliche Beurteilung

Die Vertragsstrafe wird wegen nicht ordnungsgemäßer Erfüllung gezahlt.

Sie hat Schadensersatzcharakter.

Es liegt insoweit kein Leistungsaustausch vor.

## Keine Entgeltminderung

Die Vertragsstrafe mindert nicht das Entgelt für die Gerüstbauleistung.

Bemessungsgrundlage bleibt:

90.000 €

Umsatzsteuer bleibt:

17.100 €

## Merksatz

Echter Schadensersatz mindert die umsatzsteuerliche Bemessungsgrundlage nicht.

---

# 11. Anzahlung beim Gerüstbauer

Im Mai wird eine Anzahlung gezahlt:

10.000 € netto

zuzüglich

1.900 € Umsatzsteuer.

Der Gerüstbauer stellt eine ordnungsgemäße Anzahlungsrechnung aus.

## Vorsteuerabzug aus der Anzahlung

Die KG kann die Vorsteuer bereits im Voranmeldungszeitraum Mai abziehen, wenn

- eine ordnungsgemäße Anzahlungsrechnung vorliegt und
- die Zahlung geleistet wurde.

Vorsteuer Mai:

1.900 €

## Restlicher Vorsteuerabzug

Gesamte Umsatzsteuer:

17.100 €

abzüglich Vorsteuer aus Anzahlung:

1.900 €

verbleibende Vorsteuer:

15.200 €

Diese ist im Voranmeldungszeitraum der Leistungsausführung abziehbar.

Im Beispiel:

August.

---

# 12. Zahlungsrechnung

Schlussrechnung:

90.000 € netto

+ 17.100 € Umsatzsteuer

= 107.100 € brutto

abzüglich Anzahlung:

10.000 € netto

+ 1.900 € Umsatzsteuer

= 11.900 €

verbleibende Abschlussforderung:

95.200 €

abzüglich Vertragsstrafe:

5.000 €

tatsächliche Überweisung:

90.200 €

Die Vertragsstrafe verändert die umsatzsteuerliche Bemessungsgrundlage nicht.

---

# Prüfungsschema Fassadenerneuerung

## Für jede einzelne Leistung getrennt prüfen

1. Wer leistet an wen?

2. Lieferung, Werklieferung oder sonstige Leistung?

3. Wer stellt die Hauptstoffe?

4. Wann ist die Leistung ausgeführt?

5. Wo liegt der Leistungsort?

6. Ist die Leistung steuerbar und steuerpflichtig?

7. Greift § 13b UStG?

8. Wer ist Steuerschuldner?

9. Wie hoch ist die Bemessungsgrundlage?

10. Wann entsteht die Steuer?

11. Ist der Vorsteuerabzug möglich?

12. Liegt eine Rechnung oder Anzahlungsrechnung vor?

13. Liegt Entgeltminderung oder echter Schadensersatz vor?

---

# Typische Klausurfallen

## Fehler 1: Jeder Fassadenauftrag ist automatisch Reverse Charge

Falsch.

Es muss geprüft werden, ob der Leistungsempfänger die Voraussetzungen des § 13b Abs. 5 UStG erfüllt.

Eine juristische Person des öffentlichen Rechts im hoheitlichen Bereich wird nicht allein durch den Bezug der Bauleistung zum Bauleistenden.

---

## Fehler 2: Hauptstoffe übersehen

Stellt der Auftragnehmer die Hauptstoffe, liegt regelmäßig eine Werklieferung vor.

Stellt der Auftraggeber die Hauptstoffe, liegt regelmäßig eine Werkleistung vor.

---

## Fehler 3: Fehlende Rechnung verhindert § 13b-Vorsteuerabzug

Falsch.

Für den Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 4 UStG ist eine Rechnung grundsätzlich keine materielle Voraussetzung.

---

## Fehler 4: Gerüstbau automatisch als Bauleistung behandeln

Nach der im Fall verwendeten Verwaltungsauffassung ist das bloße Auf- und Abbauen eines Gerüsts keine Bauleistung im Sinne des § 13b Abs. 2 Nr. 4 UStG.

---

## Fehler 5: Personalgestellung als Gegenleistung behandeln

Werden eigene Arbeitnehmer lediglich zur Unterstützung des Auftragnehmers bereitgestellt, kann eine nicht steuerbare Leistungsbeistellung vorliegen.

---

## Fehler 6: Vertragsstrafe vom Entgelt abziehen

Eine Vertragsstrafe wegen verspäteter oder mangelhafter Leistung kann echten Schadensersatz darstellen.

Dann mindert sie die Bemessungsgrundlage nicht.

---

## Fehler 7: Anzahlungs-Vorsteuer zu spät abziehen

Bei ordnungsgemäßer Anzahlungsrechnung und Zahlung kann die Vorsteuer bereits vor Ausführung der Leistung abgezogen werden.

---

# Merksätze

- Eigene Hauptstoffe des Auftragnehmers sprechen für eine Werklieferung.
- Hauptstoffe des Auftraggebers sprechen für eine Werkleistung.
- § 13b UStG ist für jede Leistungsbeziehung getrennt zu prüfen.
- Eine jPöR im hoheitlichen Bereich ist nicht automatisch Steuerschuldner nach § 13b UStG.
- Ein falscher Reverse-Charge-Hinweis ohne offenen Steuerausweis löst nicht automatisch § 14c UStG aus.
- Bei § 13b kann der Vorsteuerabzug grundsätzlich ohne Rechnung möglich sein.
- Echte Vertragsstrafen sind Schadensersatz und keine Entgeltminderung.
- Anzahlungs-Vorsteuer entsteht bei Rechnung und Zahlung.
- Leistungsbeistellungen sind kein selbständiger Leistungsaustausch.
`
},
{
  id: "reverse-charge-13b-abs-2-nr-1-bis-4-ustg",
  title: "Reverse Charge nach § 13b Abs. 2 Nr. 1–4 UStG",
  short:
    "Prüfungsschema und Praxisfälle zur Steuerschuldnerschaft des Leistungsempfängers bei ausländischen Unternehmern, Sicherungsgut, Grundstücken und Bauleistungen.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Fälle zu § 13b UStG",
  keywords:
    "§ 13b ustg|reverse charge|steuerschuldnerschaft leistungsempfänger|ausländischer unternehmer|werklieferung|bauleistung|sicherungsgut|grundstückslieferung|option § 9 ustg|vorsteuerabzug|kleinunternehmer|selbstnutzung|vermietung|§ 14c ustg|wintergarten|fliesenleger|sicherungsübereignung",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 1 Abs. 1a UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 4 UStG",
    "§ 3 Abs. 6 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 4 Nr. 9a UStG",
    "§ 4 Nr. 12a UStG",
    "§ 9 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13b Abs. 2 Nr. 1 UStG",
    "§ 13b Abs. 2 Nr. 2 UStG",
    "§ 13b Abs. 2 Nr. 3 UStG",
    "§ 13b Abs. 2 Nr. 4 UStG",
    "§ 13b Abs. 5 UStG",
    "§ 14a Abs. 5 UStG",
    "§ 14c Abs. 1 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "§ 15 Abs. 2 UStG",
    "§ 19 UStG"
  ],
  body: `
# Reverse Charge nach § 13b Abs. 2 Nr. 1–4 UStG

## 1. Grundprinzip

Beim Reverse-Charge-Verfahren schuldet nicht der leistende Unternehmer, sondern der Leistungsempfänger die Umsatzsteuer.

Der Leistungsempfänger muss die Steuer

- selbst berechnen,
- in seiner Umsatzsteuer-Voranmeldung anmelden
- und kann sie unter den Voraussetzungen des § 15 UStG gleichzeitig als Vorsteuer abziehen.

Wichtig:

Steuerschuld und Vorsteuerabzug sind getrennt zu prüfen.

Die Steuerschuldnerschaft nach § 13b UStG kann auch dann übergehen, wenn der Leistungsempfänger

- Kleinunternehmer ist,
- die Leistung privat nutzt
- oder einen steuerfreien Ausgangsumsatz ausführt.

Ob ein Vorsteuerabzug möglich ist, ist eine zweite Frage.

---

# Allgemeines Prüfungsschema

## Schritt 1: Leistung bestimmen

Zu prüfen ist:

- Lieferung,
- Werklieferung,
- sonstige Leistung,
- Grundstückslieferung,
- Lieferung von Sicherungsgut
- oder Bauleistung.

## Schritt 2: Ort der Leistung bestimmen

Nur wenn die Leistung im Inland steuerbar ist, kommt deutsche Umsatzsteuer in Betracht.

## Schritt 3: Steuerbarkeit und Steuerbefreiung prüfen

- § 1 Abs. 1 Nr. 1 UStG
- Steuerbefreiungen nach § 4 UStG
- ggf. Option nach § 9 UStG

## Schritt 4: Tatbestand des § 13b UStG prüfen

Insbesondere:

- § 13b Abs. 2 Nr. 1 UStG
- § 13b Abs. 2 Nr. 2 UStG
- § 13b Abs. 2 Nr. 3 UStG
- § 13b Abs. 2 Nr. 4 UStG

## Schritt 5: Bemessungsgrundlage und Umsatzsteuer

Bemessungsgrundlage:

Nettoentgelt nach § 10 Abs. 1 UStG.

Umsatzsteuer regelmäßig:

19 % nach § 12 Abs. 1 UStG.

## Schritt 6: Zeitpunkt der Steuerentstehung

Der Zeitpunkt richtet sich nach den besonderen Regelungen des § 13b UStG.

Dabei ist insbesondere zu prüfen:

- Zeitpunkt der Rechnungsausstellung
- Zeitpunkt der Leistungsausführung
- Ablauf des folgenden Kalendermonats

## Schritt 7: Vorsteuerabzug

Der Leistungsempfänger kann die nach § 13b UStG geschuldete Steuer nach § 15 Abs. 1 Satz 1 Nr. 4 UStG als Vorsteuer abziehen, wenn

- die Leistung für sein Unternehmen bezogen wurde
- und keine Ausschlussgründe nach § 15 Abs. 2 UStG vorliegen.

---

# 2. § 13b Abs. 2 Nr. 1 UStG – ausländischer Unternehmer

## Fall: Wintergarten durch niederländischen Unternehmer

Ein deutscher Unternehmer beauftragt einen in den Niederlanden ansässigen Unternehmer mit der Errichtung eines Wintergartens auf einem unternehmerisch genutzten Grundstück in Wuppertal.

Der niederländische Unternehmer

- beschafft das Glas und weitere Hauptstoffe,
- baut den Wintergarten auf
- und verbindet ihn mit der vorhandenen Unterkonstruktion.

Festpreis:

30.000 € netto.

## Art der Leistung

Es liegt eine Werklieferung vor.

Begründung:

Der leistende Unternehmer verwendet selbst beschaffte Hauptstoffe und erstellt ein fertiges Werk.

Rechtsgrundlage:

§ 3 Abs. 4 UStG.

## Ort der Lieferung

Der Wintergarten wird fest mit dem Grundstück verbunden.

Es handelt sich um eine unbewegte Werklieferung.

Ort der Lieferung:

Wuppertal.

Die Leistung wird damit im Inland ausgeführt.

## Steuerbarkeit

Die Werklieferung ist nach § 1 Abs. 1 Nr. 1 UStG steuerbar.

Eine Steuerbefreiung liegt nicht vor.

Steuersatz:

19 %.

## Steuerschuldnerschaft

Der leistende Unternehmer ist im Ausland ansässig.

Der deutsche Leistungsempfänger schuldet daher die Umsatzsteuer nach § 13b UStG.

Bemessungsgrundlage:

30.000 €

Umsatzsteuer:

30.000 € × 19 %

= 5.700 €

## Steuerentstehung

Wird die Rechnung am 20.09. ausgestellt, entsteht die Steuer im Voranmeldungszeitraum September.

Wird die Rechnung erst im November ausgestellt, kann die Steuer spätestens mit Ablauf des auf die Leistungsausführung folgenden Kalendermonats entstehen.

Bei Leistungsausführung im September:

spätestens Voranmeldungszeitraum Oktober.

## Vorsteuerabzug

Bezieht der Leistungsempfänger den Wintergarten für sein Unternehmen, kann er die nach § 13b UStG geschuldete Umsatzsteuer als Vorsteuer abziehen.

Vorsteuer:

5.700 €

Voraussetzung:

Keine Ausschlussgründe nach § 15 Abs. 2 UStG.

---

# 3. Abwandlung: steuerfreie Vermietung

Der Unternehmer lässt den Wintergarten an einem zu Wohnzwecken vermieteten Einfamilienhaus errichten.

Die Vermietung erfolgt an eine Privatperson.

## Steuerschuld

Die Steuerschuldnerschaft nach § 13b UStG bleibt bestehen.

Der Leistungsempfänger schuldet die Umsatzsteuer.

## Vorsteuerabzug

Kein Vorsteuerabzug.

Begründung:

Der Wintergarten wird für steuerfreie Vermietungsumsätze nach § 4 Nr. 12a UStG verwendet.

Damit greift der Vorsteuerausschluss nach § 15 Abs. 2 UStG.

Eine Option zur Steuerpflicht nach § 9 UStG ist nicht möglich, wenn der Mieter das Grundstück nicht für sein Unternehmen verwendet.

## Merksatz

Reverse Charge kann vorliegen, obwohl kein Vorsteuerabzug besteht.

---

# 4. Abwandlung: private Selbstnutzung

Der Unternehmer lässt den Wintergarten an seinem privat genutzten Einfamilienhaus errichten.

## Steuerschuld

Auch bei Bezug für den außerunternehmerischen Bereich kann die Steuerschuldnerschaft nach § 13b UStG auf den Leistungsempfänger übergehen.

## Vorsteuerabzug

Kein Vorsteuerabzug.

Begründung:

Die Leistung wird nicht für das Unternehmen bezogen.

Die Voraussetzungen des § 15 Abs. 1 UStG sind nicht erfüllt.

## Merksatz

Private Nutzung verhindert nicht zwingend § 13b UStG.

Sie verhindert jedoch regelmäßig den Vorsteuerabzug.

---

# 5. Abwandlung: Kleinunternehmer

Der Leistungsempfänger ist Kleinunternehmer.

## Steuerschuld

Die Steuerschuldnerschaft nach § 13b UStG kann auch bei einem Kleinunternehmer auf den Leistungsempfänger übergehen.

Die Kleinunternehmerregelung schützt nicht vor der Steuerschuld nach § 13b UStG.

## Vorsteuerabzug

Der Kleinunternehmer kann die geschuldete Umsatzsteuer grundsätzlich nicht als Vorsteuer abziehen.

## Rechtsfolge

Umsatzsteuer:

5.700 €

Zahlung an das Finanzamt:

5.700 €

Kein entsprechender Vorsteuerabzug.

## Merksatz

Kleinunternehmer + § 13b UStG:

Steuer zahlen, aber regelmäßig keine Vorsteuer abziehen.

---

# 6. Abwandlung: Rechnung mit offen ausgewiesener Umsatzsteuer

Der ausländische Unternehmer stellt eine Rechnung über

30.000 € netto

zzgl. 5.700 € Umsatzsteuer.

Der Leistungsempfänger zahlt lediglich 30.000 €.

## Steuerschuld des Leistungsempfängers

Der Leistungsempfänger schuldet weiterhin die Umsatzsteuer nach § 13b UStG.

Bemessungsgrundlage:

30.000 €

Umsatzsteuer:

5.700 €

## Unrichtiger Steuerausweis

Der leistende Unternehmer darf die Umsatzsteuer bei Anwendung des Reverse-Charge-Verfahrens nicht offen ausweisen.

Weist er dennoch Umsatzsteuer aus, kann er diese nach § 14c Abs. 1 UStG schulden.

## Kein Vorsteuerabzug aus der falschen Rechnung

Der Leistungsempfänger kann aus dem unrichtigen Steuerausweis grundsätzlich keinen zusätzlichen Vorsteuerabzug beanspruchen.

Der Vorsteuerabzug richtet sich nach der nach § 13b UStG geschuldeten Steuer.

## Rechnungshinweis

Die Rechnung muss auf die Steuerschuldnerschaft des Leistungsempfängers hinweisen.

Typischer Hinweis:

"Steuerschuldnerschaft des Leistungsempfängers"

---

# 7. § 13b Abs. 2 Nr. 2 UStG – Lieferung von Sicherungsgut

## Grundfall

Ein LKW wurde zur Sicherung einer Forderung an einen Gläubiger sicherungsübereignet.

Später wird der LKW durch den Sicherungsgeber veräußert.

Dadurch kann umsatzsteuerlich eine Lieferung des Sicherungsnehmers an den Sicherungsgeber ausgelöst werden.

## Lieferung des Sicherungsguts

Die Lieferung des Sicherungsguts fällt unter § 13b Abs. 2 Nr. 2 UStG.

Der Leistungsempfänger schuldet die Umsatzsteuer.

Beispiel:

Bemessungsgrundlage:

59.000 €

Umsatzsteuer:

59.000 € × 19 %

= 11.210 €

## Steuerentstehung

Die Umsatzsteuer entsteht nach den besonderen Regeln des § 13b UStG.

Im Beispielsfall erfolgt die Anmeldung im entsprechenden Voranmeldungszeitraum nach der Verwertung des Sicherungsguts.

## Vorsteuerabzug

Der Leistungsempfänger kann die nach § 13b UStG geschuldete Umsatzsteuer als Vorsteuer abziehen, wenn

- die Lieferung für sein Unternehmen erfolgt
- und keine Ausschlussgründe vorliegen.

Vorsteuer:

11.210 €

---

# 8. Veräußerung des LKW an einen Käufer im Drittland

Wird der LKW an einen Unternehmer in der Schweiz veräußert und in das Drittland befördert, kann die Lieferung als Ausfuhrlieferung steuerfrei sein.

Voraussetzung:

Die Nachweise für die Ausfuhrlieferung liegen vor.

Wichtig:

Die steuerfreie Weiterlieferung des LKW schließt den Vorsteuerabzug aus dem vorhergehenden Erwerb des Sicherungsguts nicht automatisch aus.

Bei steuerfreien Ausfuhrlieferungen bleibt der Vorsteuerabzug grundsätzlich erhalten.

---

# 9. Vorsteuer aus einem Zeitungsinserat

Ein Verlag veröffentlicht eine Anzeige für den Verkauf des LKW.

Rechnung:

200 € netto

+ 38 € Umsatzsteuer.

## Leistung

Der Verlag erbringt eine sonstige Leistung.

Ort der Leistung:

Inland.

Der Umsatz des Verlags ist steuerpflichtig.

## Vorsteuerabzug

Die Umsatzsteuer von 38 € ist als Vorsteuer abziehbar, wenn

- die Anzeige für das Unternehmen geschaltet wurde
- und eine ordnungsgemäße Rechnung vorliegt.

---

# 10. § 13b Abs. 2 Nr. 3 UStG – Grundstückslieferung

## Fall

Eine Unternehmerin verkauft ein unternehmerisch genutztes Grundstück für

400.000 €

an einen anderen Unternehmer.

Das Grundstück war zuvor vermietet.

Der Verkäufer verzichtet im notariellen Kaufvertrag auf die Steuerbefreiung nach § 4 Nr. 9a UStG.

## Lieferung

Die Übertragung eines Grundstücks stellt eine Lieferung dar.

Zeitpunkt:

Übergang von Nutzen und Lasten.

Ort:

Lage des Grundstücks.

## Keine Geschäftsveräußerung im Ganzen

Eine Geschäftsveräußerung im Ganzen nach § 1 Abs. 1a UStG liegt nicht vor, wenn der Erwerber die bisherige Vermietungstätigkeit nicht fortführt.

Beispiel:

Der Erwerber nutzt das Grundstück als Parkplatz für eigene Lastkraftwagen.

## Steuerbefreiung und Option

Grundstückslieferungen sind grundsätzlich nach § 4 Nr. 9a UStG steuerfrei.

Der Verkäufer kann unter den Voraussetzungen des § 9 UStG zur Steuerpflicht optieren.

Bei Grundstückslieferungen muss die Option regelmäßig im notariellen Vertrag erklärt werden.

## Steuerschuldnerschaft

Bei einer steuerpflichtigen Grundstückslieferung schuldet der Leistungsempfänger die Umsatzsteuer nach § 13b Abs. 2 Nr. 3 UStG.

Bemessungsgrundlage:

400.000 €

Umsatzsteuer:

400.000 € × 19 %

= 76.000 €

## Vorsteuerabzug

Der Erwerber kann die Umsatzsteuer von 76.000 € als Vorsteuer abziehen, wenn er das Grundstück für steuerpflichtige Unternehmensumsätze verwendet.

## Merksatz

Steuerpflichtige Grundstückslieferung zwischen Unternehmern:

Umsatzsteuer regelmäßig beim Käufer nach § 13b UStG.

---

# 11. § 13b Abs. 2 Nr. 4 UStG – Bauleistungen

## Fall

Ein Fliesenleger verlegt in den Geschäftsräumen eines Trockenbauunternehmens neue Fliesen.

Der Fliesenleger beschafft sämtliche Baumaterialien selbst.

Das Trockenbauunternehmen erbringt seinerseits nachhaltig Bauleistungen.

Entgelt:

10.000 € netto.

## Art der Leistung

Es liegt eine Werklieferung vor.

Begründung:

Der Fliesenleger verwendet selbst beschaffte Hauptstoffe und erstellt ein fertiges Werk.

## Ort der Leistung

Die Werklieferung wird an einem Grundstück in Köln ausgeführt.

Ort:

Köln.

## Steuerbarkeit

Der Umsatz ist im Inland steuerbar und mangels Steuerbefreiung steuerpflichtig.

Steuersatz:

19 %.

## Steuerschuldnerschaft

Der Leistungsempfänger erbringt selbst nachhaltig Bauleistungen.

Die empfangene Leistung dient der Herstellung, Instandsetzung oder Änderung eines Bauwerks.

Damit schuldet der Leistungsempfänger die Umsatzsteuer nach § 13b Abs. 2 Nr. 4 UStG.

Bemessungsgrundlage:

10.000 €

Umsatzsteuer:

10.000 € × 19 %

= 1.900 €

## Steuerentstehung

Die Steuer entsteht nach den besonderen Regeln des § 13b UStG.

Wird die Rechnung im September ausgestellt, ist die Steuer im entsprechenden Voranmeldungszeitraum anzumelden.

## Vorsteuerabzug

Der Leistungsempfänger kann die geschuldete Umsatzsteuer von 1.900 € als Vorsteuer abziehen, wenn die Bauleistung für sein Unternehmen verwendet wird und keine Ausschlussgründe vorliegen.

## Rechnung

Der Fliesenleger darf keine Umsatzsteuer offen ausweisen.

Die Rechnung muss den Hinweis enthalten:

"Steuerschuldnerschaft des Leistungsempfängers"

Der leistende Unternehmer meldet den Nettoumsatz in seiner Umsatzsteuer-Voranmeldung in der dafür vorgesehenen Kennziffer an.

---

# Übersicht § 13b Abs. 2 Nr. 1–4 UStG

## Nr. 1

Bestimmte steuerpflichtige Leistungen eines im Ausland ansässigen Unternehmers.

Beispiel:

Niederländischer Unternehmer errichtet Wintergarten in Deutschland.

## Nr. 2

Lieferung sicherungsübereigneter Gegenstände durch den Sicherungsgeber an den Sicherungsnehmer außerhalb des Insolvenzverfahrens.

Beispiel:

Verwertung eines sicherungsübereigneten LKW.

## Nr. 3

Steuerpflichtige Grundstückslieferung nach wirksamer Option.

Beispiel:

Unternehmer verkauft Grundstück an einen anderen Unternehmer.

## Nr. 4

Bauleistungen an einen Unternehmer, der selbst nachhaltig entsprechende Bauleistungen erbringt.

Beispiel:

Fliesenleger arbeitet für Trockenbauunternehmer.

---

# Typische Klausurfallen

## Fehler 1: Reverse Charge und Vorsteuerabzug gleichsetzen

Falsch:

Wenn § 13b UStG gilt, besteht automatisch ein Vorsteuerabzug.

Richtig:

Die Steuerschuld kann übergehen, obwohl kein Vorsteuerabzug möglich ist.

Beispiele:

- private Selbstnutzung
- steuerfreie Wohnungsvermietung
- Kleinunternehmer

---

## Fehler 2: ausländischer Unternehmer weist Umsatzsteuer aus

Bei § 13b UStG darf der leistende Unternehmer grundsätzlich keine deutsche Umsatzsteuer offen ausweisen.

Ein unrichtiger Steuerausweis kann zu einer Steuerschuld nach § 14c UStG führen.

---

## Fehler 3: Grundstückslieferung automatisch steuerpflichtig behandeln

Grundstückslieferungen sind grundsätzlich steuerfrei.

Erst eine wirksame Option nach § 9 UStG führt zur Steuerpflicht.

Bei wirksamer Option kann der Leistungsempfänger die Steuer nach § 13b UStG schulden.

---

## Fehler 4: jede handwerkliche Leistung ist automatisch eine Bauleistung

Es muss geprüft werden,

- ob die Leistung an einem Bauwerk ausgeführt wird
- und ob der Leistungsempfänger selbst nachhaltig entsprechende Bauleistungen erbringt.

---

## Fehler 5: Kleinunternehmer muss § 13b UStG nicht anwenden

Falsch.

Auch ein Kleinunternehmer kann Steuerschuldner nach § 13b UStG werden.

Er hat dann jedoch regelmäßig keinen Vorsteuerabzug.

---

# Prüfungs-Merksätze

- § 13b UStG verlagert die Steuerschuld auf den Leistungsempfänger.
- Steuerschuld und Vorsteuerabzug sind immer getrennt zu prüfen.
- Ein ausländischer Unternehmer darf bei Reverse Charge keine deutsche Umsatzsteuer ausweisen.
- Eine falsche Rechnung kann § 14c UStG auslösen.
- Bei steuerfreien Ausgangsumsätzen kann der Vorsteuerabzug ausgeschlossen sein.
- Auch Kleinunternehmer und Privatnutzer können Steuerschuldner nach § 13b UStG sein.
- Steuerpflichtige Grundstückslieferungen können unter § 13b Abs. 2 Nr. 3 UStG fallen.
- Bei Bauleistungen ist die Bauleistendeneigenschaft des Leistungsempfängers zu prüfen.

---

# Kurzes Klausurschema

1. Leistung bestimmen.
2. Ort der Leistung bestimmen.
3. Steuerbarkeit prüfen.
4. Steuerbefreiung oder Option prüfen.
5. Tatbestand des § 13b UStG bestimmen.
6. Bemessungsgrundlage ermitteln.
7. Umsatzsteuer berechnen.
8. Zeitpunkt der Steuerentstehung bestimmen.
9. Vorsteuerabzug gesondert prüfen.
10. Rechnungsvorschriften kontrollieren.
`
},
  {
    id: "npo",
    chip: "NPO",
    title: "NPO / Gemeinnützigkeit",
    subtitle: "Sphären, Zweckbetrieb, Mittelverwendung",
    summary:
      "Sphären, Zweckbetrieb, Spenden, Zuschüsse, Mittelverwendung und gemeinnützigkeitsrechtliche Risiken prüfen.",
    checklist: [
      "Ideeller Bereich?",
      "Zweckbetrieb?",
      "Vermögensverwaltung?",
      "Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb?",
      "Spendenbescheinigung möglich?",
      "Mittelverwendung betroffen?",
      "Satzungszweck erfüllt?",
    ],
    quickActions: [
      { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
      { label: "Sphäre prüfen", to: "/npo-pruefassistent" },
    ],
    module: { label: "NPO-Prüfassistent", to: "/npo-pruefassistent" },
    handoutCategory: "NPO",
  },
  {
    id: "skr42",
    chip: "SKR42",
    title: "SKR42",
    subtitle: "NPO-Kontenrahmen & Mapping",
    summary:
      "NPO-Kontenrahmen, Sphärenzuordnung, SKR03-Umwandlung und DATEV-Buchungslogik.",
    checklist: [
      "Passende Sphäre?",
      "Richtiges SKR42-Konto?",
      "SKR03 → SKR42 Mapping?",
      "USt-Logik?",
      "Belegfluss?",
      "Individueller Kontenrahmen berücksichtigt?",
    ],
    quickActions: [
      { label: "SKR-Konverter öffnen", to: "/skr-konverter" },
      { label: "Konto suchen", to: "/skr-konverter" },
      { label: "Buchungstext analysieren", to: "/skr-konverter" },
    ],
    module: { label: "SKR-Konverter", to: "/skr-konverter" },
    handoutCategory: "SKR42",
  },
{
  id: "umsatzsteuer-bautraeger-13b-vorsteuer-15a",
  title: "Bauträger: § 13b UStG, Vorsteuerabzug und Vorsteuerberichtigung",
  short:
    "Umsatzsteuerliche Behandlung eines Bauträgers: steuerfreie Grundstückslieferung, Subunternehmerleistungen, fehlendes Reverse Charge und Vorsteuerberichtigung nach § 15a UStG.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Bauträgerfall",
  keywords:
    "bauträger|§ 13b ustg|bauleistung|grundstückslieferung|§ 4 nr. 9a ustg|§ 9 ustg|subunternehmer|werklieferung|vorsteuerabzug|§ 15 abs. 2 ustg|§ 15a ustg|vorsteuerberichtigung|baustoffe|privatpersonen|reverse charge",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 4 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 4 Nr. 9 Buchst. a UStG",
    "§ 9 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 13a Abs. 1 Nr. 1 UStG",
    "§ 13b Abs. 2 Nr. 4 UStG",
    "§ 13b Abs. 5 Satz 2 UStG",
    "§ 15 Abs. 1 Nr. 1 UStG",
    "§ 15 Abs. 2 Nr. 1 UStG",
    "§ 15a Abs. 2 UStG",
    "§ 44 UStDV",
    "Abschn. 13b.2 und 13b.3 UStAE"
  ],
  body: `
# Bauträger – Umsatzsteuer, § 13b und Vorsteuerberichtigung

## 1. Ausgangssachverhalt

Eine KG betreibt

- einen Baustoffhandel und
- ein Bauträgergeschäft.

Sie errichtet auf eigenen Grundstücken Einfamilienhäuser und verkauft die bebauten Grundstücke anschließend an Privatpersonen.

Jahresumsatz aus dem Bauträgergeschäft:

8.000.000 €

Subunternehmerleistungen:

1.600.000 € netto

zuzüglich

304.000 € Umsatzsteuer.

Zusätzlich werden Baustoffe im Wert von

400.000 € netto

zuzüglich

76.000 € Vorsteuer

aus dem eigenen Baustoffhandel für das Bauträgergeschäft verwendet.

---

# 2. Ausgangsumsätze des Bauträgers

## Einheitliche Grundstückslieferung

Die Errichtung eines Gebäudes auf einem eigenen Grundstück und die anschließende Veräußerung des bebauten Grundstücks bilden eine einheitliche Lieferung.

Es handelt sich um eine Lieferung nach § 3 Abs. 1 UStG.

Ort der Lieferung:

Belegenheitsort des Grundstücks nach § 3 Abs. 7 UStG.

Im Beispiel:

Mettmann.

## Steuerbarkeit

Die Lieferung wird im Inland gegen Entgelt im Rahmen des Unternehmens ausgeführt.

Sie ist daher nach § 1 Abs. 1 Nr. 1 UStG steuerbar.

## Steuerbefreiung

Die Veräußerung des Grundstücks ist nach

§ 4 Nr. 9 Buchst. a UStG

steuerfrei.

Bemessungsgrundlage:

8.000.000 €

## Keine Option zur Steuerpflicht

Eine Option nach § 9 UStG scheidet aus, wenn die Grundstücke an Privatpersonen verkauft werden.

Die Erwerber verwenden das Grundstück nicht für ihr Unternehmen.

Ergebnis:

Die Grundstückslieferungen bleiben steuerfrei.

---

# 3. Subunternehmerleistungen

## Art der Leistung

Die Subunternehmer errichten einzelne Gewerke und verwenden dabei eigene Hauptstoffe.

Damit liegen regelmäßig Werklieferungen nach § 3 Abs. 4 UStG vor.

Beispiele:

- Dacharbeiten mit eigenem Material
- Maurerarbeiten mit eigenen Baustoffen
- Fensterbau mit eigenen Fenstern
- Heizungsanlage mit eigenem Material

## Ort der Werklieferung

Die Gewerke werden fest mit dem Grundstück verbunden.

Ort der unbewegten Werklieferung ist der Belegenheitsort des Grundstücks.

Im Beispiel:

Mettmann.

## Steuerbarkeit und Steuerpflicht

Die Subunternehmerleistungen sind im Inland steuerbar.

Die isoliert betrachteten Werklieferungen fallen nicht unter die Steuerbefreiung für die spätere Grundstückslieferung des Bauträgers.

Sie sind daher mit 19 % steuerpflichtig.

---

# 4. Keine Steuerschuldnerschaft des Bauträgers nach § 13b

## Grundsatz bei Bauleistungen

Bei Bauleistungen kann der Leistungsempfänger nach § 13b Abs. 5 Satz 2 UStG Steuerschuldner werden, wenn er selbst nachhaltig Bauleistungen erbringt.

## Besonderheit beim Bauträger

Ein Bauträger, der ausschließlich

- eigene Grundstücke bebaut und
- die bebauten Grundstücke anschließend verkauft,

erbringt gegenüber seinen Käufern grundsätzlich Grundstückslieferungen.

Er erbringt nicht allein deshalb Bauleistungen im Sinne des § 13b Abs. 2 Nr. 4 UStG.

Dies gilt auch dann, wenn

- Kaufverträge bereits während der Bauphase geschlossen werden,
- Käufer Sonderwünsche äußern oder
- Käufer Einfluss auf Ausführung und Gestaltung nehmen.

Entscheidend bleibt:

Der Bauträger liefert ein eigenes bebautes Grundstück.

## Rechtsfolge

Der Bauträger wird für die empfangenen Subunternehmerleistungen grundsätzlich nicht Steuerschuldner nach § 13b Abs. 5 Satz 2 UStG.

Steuerschuldner bleiben die Subunternehmer nach § 13a Abs. 1 Nr. 1 UStG.

## Zahlenbeispiel

Bemessungsgrundlage:

1.600.000 €

Umsatzsteuer:

1.600.000 € × 19 %

= 304.000 €

Die Subunternehmer stellen Rechnungen mit offen ausgewiesener Umsatzsteuer aus.

---

# 5. Vorsteuerabzug aus Subunternehmerleistungen

## Grundvoraussetzung

Grundsätzlich liegen Leistungen für das Unternehmen vor.

Damit könnte zunächst ein Vorsteuerabzug nach § 15 Abs. 1 Nr. 1 UStG in Betracht kommen.

## Ausschluss wegen steuerfreier Ausgangsumsätze

Die Subunternehmerleistungen stehen jedoch direkt und unmittelbar mit den steuerfreien Grundstückslieferungen an Privatpersonen in Zusammenhang.

Daher greift der Vorsteuerausschluss nach

§ 15 Abs. 2 Nr. 1 UStG.

## Ergebnis

Kein Vorsteuerabzug aus den Subunternehmerrechnungen.

Nicht abziehbare Vorsteuer:

304.000 €

## Merksatz

Steuerpflichtige Eingangsleistung

plus

steuerfreie Grundstückslieferung

führt regelmäßig zum Ausschluss des Vorsteuerabzugs.

---

# 6. Baustoffe aus dem eigenen Baustoffhandel

## Ursprünglicher Erwerb

Die KG hatte Baustoffe für ihren Baustoffhandel erworben.

Da die Umsätze des Baustoffhandels steuerpflichtig sind, war sie beim Erwerb zum vollständigen Vorsteuerabzug berechtigt.

Anschaffung:

400.000 € netto

Vorsteuer:

76.000 €

## Verwendung im Bauträgergeschäft

Die Baustoffe werden anschließend aus dem Baustoffhandel entnommen und in die zum Verkauf bestimmten Gebäude eingebaut.

Der innerbetriebliche Übergang innerhalb desselben Unternehmens ist kein Leistungsaustausch zwischen zwei Unternehmern.

Es liegt daher kein steuerbarer Innenumsatz vor.

---

# 7. Vorsteuerberichtigung nach § 15a Abs. 2 UStG

## Einmalige Verwendung

Die Baustoffe sind Wirtschaftsgüter, die nur einmalig zur Ausführung eines Umsatzes verwendet werden.

Daher ist § 15a Abs. 2 UStG zu prüfen.

## Ursprüngliche Verhältnisse

Beim Erwerb der Baustoffe war der Vorsteuerabzug vollständig zulässig, weil sie für den steuerpflichtigen Baustoffhandel bestimmt waren.

## Tatsächliche Verwendung

Später werden die Baustoffe für steuerfreie Grundstückslieferungen eingesetzt.

Diese Grundstückslieferungen schließen den Vorsteuerabzug nach § 15 Abs. 2 Nr. 1 UStG aus.

Damit ändern sich die für den ursprünglichen Vorsteuerabzug maßgeblichen Verhältnisse.

## Rechtsfolge

Die ursprünglich abgezogene Vorsteuer ist nach § 15a Abs. 2 UStG zu berichtigen.

Berichtigungsbetrag:

76.000 €

Die Berichtigung erfolgt in dem Voranmeldungszeitraum, in dem die steuerfreie Grundstückslieferung ausgeführt wird.

Die Bagatellgrenzen des § 44 UStDV sind überschritten.

---

# Prüfungsschema Bauträger

1. Ausgangsleistung bestimmen:
   - Grundstückslieferung oder Bauleistung?

2. Ort der Grundstückslieferung bestimmen.

3. Steuerbefreiung nach § 4 Nr. 9 Buchst. a UStG prüfen.

4. Option nach § 9 UStG prüfen:
   - Erwerber Unternehmer?
   - Verwendung für Unternehmen?

5. Subunternehmerleistungen getrennt beurteilen.

6. § 13b Abs. 2 Nr. 4 und Abs. 5 Satz 2 UStG prüfen.

7. Erbringt der Bauträger selbst nachhaltig Bauleistungen?

8. Vorsteuerabzug aus Subunternehmerleistungen prüfen.

9. Direkter Zusammenhang mit steuerfreien Grundstückslieferungen?

10. Bei früher abgezogenen Vorsteuern § 15a UStG prüfen.

---

# Typische Klausurfallen

## Fehler 1: Bauträger automatisch als Bauleistenden behandeln

Falsch:

Ein Bauträger ist allein aufgrund seiner Bauträgertätigkeit nicht zwingend Bauleistender im Sinne des § 13b UStG.

Richtig:

Verkauft er eigene bebaute Grundstücke, erbringt er Grundstückslieferungen.

---

## Fehler 2: Einfluss der Käufer überbewerten

Sonderwünsche und Mitspracherechte der Käufer machen die Grundstückslieferung nicht automatisch zu einer Bauleistung.

---

## Fehler 3: Vorsteuer aus Subunternehmerleistungen abziehen

Die Leistungen stehen unmittelbar mit steuerfreien Grundstückslieferungen in Zusammenhang.

Daher ist der Vorsteuerabzug ausgeschlossen.

---

## Fehler 4: Baustoffentnahme als steuerbaren Umsatz behandeln

Die Übertragung zwischen verschiedenen Tätigkeitsbereichen desselben Unternehmens ist grundsätzlich ein nicht steuerbarer Innenumsatz.

Die tatsächliche steuerliche Korrektur erfolgt über § 15a UStG.

---

## Fehler 5: § 15a UStG übersehen

Wurden Baustoffe zunächst für steuerpflichtige Umsätze angeschafft und später für steuerfreie Grundstückslieferungen verwendet, ist der ursprüngliche Vorsteuerabzug zu berichtigen.

---

# Merksätze

- Bauträger verkaufen regelmäßig bebaute Grundstücke.
- Grundstückslieferungen an Privatpersonen sind regelmäßig steuerfrei.
- Eine Option nach § 9 UStG ist bei privaten Erwerbern nicht möglich.
- Bauträger sind nicht automatisch Bauleistende nach § 13b UStG.
- Die Subunternehmer schulden ihre Umsatzsteuer grundsätzlich selbst.
- Vorsteuer aus Leistungen für steuerfreie Grundstückslieferungen ist ausgeschlossen.
- Ein innerbetrieblicher Übergang ist kein steuerbarer Umsatz.
- Die spätere steuerfreie Verwendung kann eine Vorsteuerberichtigung nach § 15a UStG auslösen.
`
},
  {
    id: "datev",
    chip: "DATEV",
    title: "DATEV",
    subtitle: "Buchungslogik, Konten, OPOS, SuSa",
    summary:
      "Buchungslogiken, Konten, Belegprüfung, OPOS, SuSa und Kanzlei-Standards.",
    checklist: [
      "Konto / Gegenkonto",
      "BU-Schlüssel",
      "Steuerschlüssel",
      "Belegdatum / Leistungsdatum",
      "OPOS-Relevanz",
      "Kostenstelle / Sphäre",
      "Abstimmung mit SuSa",
      "Individueller Kontenrahmen",
    ],
    quickActions: [
      { label: "Buchungsvorschlag erstellen", to: "/neue-anfrage" },
      { label: "SKR-Konverter öffnen", to: "/skr-konverter" },
      { label: "DATEV-Handouts anzeigen", to: "/wissensdatenbank" },
    ],
    module: { label: "Wissensdatenbank", to: "/wissensdatenbank" },
    handoutCategory: "DATEV",
    builtInHandouts: [
      {
        title: "DATEV-Buchungslogik",
        desc: "Konto, Gegenkonto, BU-Schlüssel, Steuerschlüssel – Grundlagen.",
        tags: ["Buchung", "BU-Schlüssel"],
      },
      {
        title: "SKR42-Kontenrahmen",
        desc: "NPO-Kontenrahmen: Sphären, Konten, typische Sonderfälle.",
        tags: ["SKR42", "NPO"],
      },
      {
        title: "OPOS-Prüfung",
        desc: "Offene Posten Debitoren/Kreditoren strukturiert prüfen.",
        tags: ["OPOS"],
      },
      {
        title: "BU-Schlüssel / Steuerlogik",
        desc: "Wann welcher BU-Schlüssel, häufige Fehlerquellen.",
        tags: ["USt", "DATEV"],
      },
      {
        title: "Belegprüfung",
        desc: "Pflichtangaben, Eingangsrechnungen, Bewirtungsbelege.",
        tags: ["Belege"],
      },
    ],
  },
  {
    id: "rueckfragen",
    chip: "Rückfragen",
    title: "Rückfragen",
    subtitle: "Fehlende Angaben sauber klären",
    summary:
      "Fehlende Angaben erkennen und mandantenfreundliche Rückfragen formulieren.",
    checklist: [
      "Welche Angaben fehlen?",
      "Welche Belege fehlen?",
      "Welche steuerliche Einordnung ist unklar?",
      "Welche Frage muss an den Mandanten?",
      "Welche Rückfrage ist intern für Review relevant?",
    ],
    quickActions: [
      { label: "Rückfragebrief erstellen", to: "/neue-anfrage" },
      { label: "Mandantenantwort formulieren", to: "/chat" },
      { label: "Prüfnotiz erstellen", to: "/neue-anfrage" },
    ],
    module: { label: "Neue Anfrage starten", to: "/neue-anfrage" },
    handoutCategory: "Rückfragen",
  },
  {
    id: "review",
    chip: "Review",
    title: "Review",
    subtitle: "Risiken, Dokumentation, Steuerberater-Review",
    summary:
      "Offene Punkte, Risikostufen und Steuerberater-Review dokumentieren.",
    checklist: [
      "Risikostufe Grün / Gelb / Rot",
      "Steuerberater-Review erforderlich?",
      "Haftungsrelevanter Punkt?",
      "Offene Rückfragen?",
      "Belege vollständig?",
      "Dokumentation ausreichend?",
    ],
    quickActions: [
      { label: "Prüfnotiz erstellen", to: "/neue-anfrage" },
      { label: "Review-Liste öffnen", to: "/fallverlauf" },
      { label: "Export als Prüfnotiz", to: "/fallverlauf" },
    ],
    module: { label: "Fallverlauf öffnen", to: "/fallverlauf" },
    handoutCategory: "Review",
  },
];

/**
 * Nur vollständig konfigurierte Themen für die UI-Chips.
 * Filtert defensiv gegen Fremd-Einträge (z. B. Knowledge-Base-Artikel ohne
 * chip-Feld), die versehentlich im selben Array landen. Ohne diese Validierung
 * würden leere, klickbare Chips gerendert, deren Klick in KnowledgeSheet
 * fehlschlägt, weil `getTopic` einen unpassenden Datensatz zurückgibt.
 */
function isValidTopic(t: unknown): t is KnowledgeTopic {
  if (!t || typeof t !== "object") return false;
  const r = t as Record<string, unknown>;
  const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  return (
    nonEmpty(r.id) &&
    nonEmpty(r.chip) &&
    nonEmpty(r.title) &&
    Array.isArray(r.checklist) &&
    Array.isArray(r.quickActions)
  );
}

const _seen = new Set<string>();
const _invalid: unknown[] = [];
export const VALID_KNOWLEDGE_TOPICS: KnowledgeTopic[] = KNOWLEDGE_TOPICS.filter(
  (t): t is KnowledgeTopic => {
    if (!isValidTopic(t)) {
      _invalid.push(t);
      return false;
    }
    if (_seen.has(t.id)) return false;
    _seen.add(t.id);
    return true;
  },
);

if (import.meta.env.DEV && _invalid.length > 0) {
  console.warn(
    `[knowledgeTopics] ${_invalid.length} ungültige Topic-Chips entfernt`,
    _invalid,
  );
}

export function getTopic(id: TopicId): KnowledgeTopic | undefined {
  return VALID_KNOWLEDGE_TOPICS.find((t) => t.id === id);
}

// ---------- Handouts (eigene, lokal gespeichert) ----------

export interface Handout {
  id: string;
  title: string;
  category: HandoutCategory;
  short: string;
  body: string;
  tags: string[];
  source: string;
  createdAt: number;
  updatedAt: number;
}

const HANDOUTS_KEY = "steuerstoff.handouts.v1";

export function listHandouts(): Handout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HANDOUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHandouts(list: Handout[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HANDOUTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("steuerstoff:handouts"));
  } catch {
    // ignore
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function upsertHandout(h: Omit<Handout, "id" | "createdAt" | "updatedAt"> & { id?: string }): Handout {
  const list = listHandouts();
  const now = Date.now();
  if (h.id) {
    const idx = list.findIndex((x) => x.id === h.id);
    if (idx >= 0) {
      const updated: Handout = { ...list[idx], ...h, id: h.id, updatedAt: now };
      list[idx] = updated;
      saveHandouts(list);
      return updated;
    }
  }
  const created: Handout = {
    id: uid(),
    title: h.title,
    category: h.category,
    short: h.short,
    body: h.body,
    tags: h.tags,
    source: h.source,
    createdAt: now,
    updatedAt: now,
  };
  saveHandouts([created, ...list]);
  return created;
}

export function deleteHandout(id: string) {
  saveHandouts(listHandouts().filter((h) => h.id !== id));
}

export function handoutsForCategory(cat: HandoutCategory): Handout[] {
  return listHandouts().filter((h) => h.category === cat);
}
