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

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
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

export function getTopic(id: TopicId): KnowledgeTopic | undefined {
  return KNOWLEDGE_TOPICS.find((t) => t.id === id);
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
