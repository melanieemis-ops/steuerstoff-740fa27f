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
      { label: "Mittelverwendung berechnen", to: "/mittelverwendungsrechner" },
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
