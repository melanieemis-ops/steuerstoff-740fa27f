// Interne Wissensbasis für steuerstoff
// Quelle: kanzleiinterne Arbeitspapiere und Fachunterlagen (nicht öffentlich).
// Die zugrundeliegenden PDFs werden bewusst NICHT mit der App ausgeliefert.
// Hier sind ausschließlich die inhaltlichen Kernaussagen als bearbeiteter
// Fließtext hinterlegt, damit die App Wissens- und Fallfragen beantworten kann.

export interface KBEntry {
  id: string;
  title: string;
  short?: string;
  /** Kategorie — bewusst offen gehalten, damit neue Rechtsgebiete ohne Migration ergänzt werden können. */
  category: string;
  body: string;
  /** Interner Quellenhinweis (nicht öffentlich verlinkt). */
  source?: string;
  /** Trigger für Wissensfrage-Erkennung. Regex, Regex-Quelltext-String oder Liste von Strings/Regexen. */
  keywords?: RegExp | string | (RegExp | string)[];
  references?: string[];
}

/** Trigger-Wert in RegExp konvertieren (Pipe-Strings/Arrays zulassen). */
export function kbKeywordsToRegExp(k: KBEntry["keywords"]): RegExp {
  if (!k) return /$^/;
  if (k instanceof RegExp) return k;
  if (Array.isArray(k)) {
    const parts = k.map((p) => (p instanceof RegExp ? p.source : String(p)));
    return new RegExp(parts.join("|"), "i");
  }
  return new RegExp(k, "i");
}

export const KNOWLEDGE_BASE: KBEntry[] = [
  {
    id: "ruecklage-allgemein",
    title: "Rücklage — Grundlagen und Abgrenzungen",
    short:
      "Allgemeine Rücklage, steuerliche Spezialrücklage, gemeinnützigkeitsrechtliche Rücklage (§ 62 AO) und Abgrenzung zur Rückstellung.",
    category: "Buchhaltung",
    source: "Internes Arbeitspapier — Begriffsabgrenzung Rücklage / Rückstellung.",
    keywords: /(^|\s)rücklage(n)?($|\s)|gewinnrücklage|kapitalrücklage|rückstellung\s+(und|vs|gegen)\s+rücklage|unterschied\s+rücklage/i,
    references: ["§ 62 AO", "§ 266 HGB", "§ 249 HGB"],
    body: `Eine Rücklage ist zurückbehaltenes Eigenkapital bzw. ein zweckgebundener oder freier Betrag, der nicht unmittelbar ausgeschüttet oder verwendet wird. Im steuerlichen Kontext muss man unterscheiden, welche Art von Rücklage gemeint ist.

1) Allgemeine Rücklage
- Eigenkapitalposition (Passivseite der Bilanz).
- Beispiele: Gewinnrücklage, Kapitalrücklage, gesetzliche Rücklage (§ 5a Abs. 3 GmbHG bei der UG).
- Dient der Stärkung des Eigenkapitals.

2) Steuerliche Spezialrücklage
- Spezialregelungen erlauben in bestimmten Fällen die Bildung steuerlicher Rücklagen oder Übertragungen, z. B. § 6b EStG (Reinvestitionsrücklage), § 7g EStG (Investitionsabzugsbetrag — keine echte Rücklage, sondern außerbilanzielle Kürzung) oder Ersatzbeschaffungsrücklage (R 6.6 EStR).
- Abhängig vom konkreten Steuertatbestand.

3) Gemeinnützigkeitsrechtliche Rücklage nach § 62 AO
- Relevant für Vereine, gGmbHs, gUGs, Stiftungen und sonstige NPOs.
- Arten: freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage, Rücklage zum Erwerb von Gesellschaftsrechten.
- Mittel, die in eine zulässige Rücklage eingestellt werden, gelten als verwendet und sind der zeitnahen Mittelverwendung entzogen.
- Dokumentation über Beschluss, Mittelverwendungsrechnung und Rücklagenspiegel.

4) Abgrenzung zur Rückstellung
- Rückstellung = Fremdkapital. Sie bildet ungewisse Verbindlichkeiten oder drohende Belastungen ab (Höhe oder Fälligkeit unsicher) — § 249 HGB.
- Rücklage = Eigenkapital bzw. Mittelbindung.
- Beispiele für Rückstellungen: Steuerrückstellung, Gewährleistungsrückstellung, Pensionsrückstellung, Prozesskostenrückstellung.

Review-Hinweis: Bei Mandantenfragen zuerst klären, ob eine allgemeine bilanzielle Rücklage, eine steuerliche Spezialrücklage oder eine § 62 AO-Rücklage gemeint ist.`,
  },
{
  id: "ust-dienstleistungen-eu-drittland-13b-grundfall-werkleistung",
  title: "§ 13b UStG – Werkleistung eines EU-Unternehmers",
  short:
    "Werkleistung eines Unternehmers aus dem EU-Ausland an einen deutschen Unternehmer (Reverse Charge).",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "13b|reverse charge|werkleistung|dienstleistung|österreich|eu|wartung|lkw|ort der leistung",
  references: [
    "§ 3a UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13b UStG",
    "§ 15 UStG"
  ],
  body: `
# Werkleistung eines EU-Unternehmers (§ 13b UStG)

## Sachverhalt

Ein Unternehmer aus Österreich wartet den betrieblich genutzten LKW eines deutschen Unternehmers.

Die Rechnung beträgt 1.000 € ohne deutsche Umsatzsteuer.

---

## Prüfung

### 1. Art der Leistung

Es handelt sich um eine

**sonstige Leistung (Werkleistung).**

---

### 2. Ort der Leistung

B2B-Regel

§ 3a Abs. 2 UStG

Der Leistungsort liegt dort,

wo der Leistungsempfänger sein Unternehmen betreibt.

→ Deutschland

---

### 3. Steuerbarkeit

Die Leistung wird im Inland ausgeführt.

→ steuerbar (§ 1 Abs.1 Nr.1 UStG)

---

### 4. Steuerbefreiung

Keine Steuerbefreiung nach § 4 UStG.

---

### 5. Reverse Charge (§ 13b)

Da der leistende Unternehmer im EU-Ausland ansässig ist,

geht die Steuerschuld auf den deutschen Unternehmer über.

Steuerschuldner:

Leistungsempfänger

gemäß § 13b UStG.

---

### 6. Bemessungsgrundlage

Nettoentgelt:

1.000 €

Umsatzsteuer:

19 %

= 190 €

---

### 7. Vorsteuer

Da die Leistung für das Unternehmen bezogen wurde,

kann die nach § 13b geschuldete Umsatzsteuer

im selben Voranmeldungszeitraum

als Vorsteuer abgezogen werden.

Vorsteuer:

190 €

---

# Abwandlung (Schweiz)

Der Unternehmer stammt aus der Schweiz.

Die Arbeiten werden dort ausgeführt.

Die Leistung wird

nach § 3a Abs. 8 UStG

im Inland nicht besteuert,

da die Arbeiten an beweglichen körperlichen Gegenständen

im Drittland tatsächlich genutzt bzw. ausgeführt werden.

Ergebnis:

→ im Inland nicht steuerbar.

---

# Merksätze

• B2B-Dienstleistungen → grundsätzlich § 3a Abs.2 UStG.

• EU-Unternehmer → Reverse Charge nach § 13b.

• Die Umsatzsteuer schuldet regelmäßig der Leistungsempfänger.

• Gleichzeitig besteht regelmäßig voller Vorsteuerabzug.

• Bei bestimmten Arbeiten im Drittland kann § 3a Abs.8 UStG den Leistungsort verlagern.

---

# Klausurfallen

Prüfungsfalle Nr.1

Werkleistung ≠ Werklieferung.

Prüfungsfalle Nr.2

Nicht jede Auslandsleistung unterliegt § 13b.

Zunächst immer den Leistungsort bestimmen.

Prüfungsfalle Nr.3

§ 3a Abs.8 UStG wird häufig vergessen.

Prüfungsfalle Nr.4

Reverse Charge bedeutet nicht Steuerfreiheit.

Die Umsatzsteuer entsteht weiterhin – sie wird nur vom Leistungsempfänger geschuldet.
`
},
{
  id: "ust-13b-grundstueckslieferung-option-steuerpflicht",
  title: "§ 13b UStG – Grundstückslieferung mit Option zur Steuerpflicht",
  short:
    "Verkauf eines Grundstücks mit Verzicht auf die Steuerbefreiung (§ 9 UStG) und Steuerschuld des Leistungsempfängers.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "13b|grundstück|grundstückslieferung|option|§9|steuerbefreiung|reverse charge|4 nr 9a",
  references: [
    "§ 3 UStG",
    "§ 4 Nr. 9a UStG",
    "§ 9 UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13b Abs.2 Nr.3 UStG",
    "§ 15 UStG"
  ],
  body: `
# Grundstückslieferung mit Option zur Steuerpflicht (§ 13b Abs.2 Nr.3 UStG)

## Sachverhalt

Eine Unternehmerin verkauft ein betrieblich genutztes Grundstück.

Im Kaufvertrag verzichtet sie nach § 9 UStG auf die Steuerbefreiung.

Der Käufer verwendet das Grundstück ausschließlich für sein Unternehmen.

Kaufpreis:

400.000 €

---

## Prüfung

### 1. Art der Leistung

Lieferung eines Grundstücks.

---

### 2. Ort der Lieferung

Unbewegter Gegenstand.

Ort der Lieferung:

Ort des Grundstücks

(§ 3 Abs.7 UStG).

→ Inland.

---

### 3. Steuerbarkeit

Lieferung gegen Entgelt.

→ steuerbar (§ 1 Abs.1 Nr.1 UStG)

---

### 4. Steuerbefreiung

Grundsätzlich

§ 4 Nr.9a UStG

(Grundstückslieferung).

Hier:

Verzicht nach § 9 UStG.

Damit:

steuerpflichtig.

---

### 5. Steuerschuld

Da § 13b Abs.2 Nr.3 UStG greift,

schuldet

der Leistungsempfänger

die Umsatzsteuer.

Reverse Charge.

---

### 6. Bemessungsgrundlage

400.000 €

Umsatzsteuer 19 %

=

76.000 €

---

### 7. Vorsteuer

Der Käufer kann

die nach § 13b geschuldete Umsatzsteuer

im selben Voranmeldungszeitraum

als Vorsteuer abziehen,

wenn das Grundstück ausschließlich

für steuerpflichtige Umsätze verwendet wird.

---

# Merksätze

• Grundstückslieferungen sind grundsätzlich steuerfrei (§ 4 Nr.9a UStG).

• Durch Option (§ 9 UStG) werden sie steuerpflichtig.

• Bei Unternehmern geht die Steuerschuld regelmäßig nach § 13b auf den Käufer über.

• Vorsteuerabzug nur bei unternehmerischer Verwendung.

---

# Klausurfallen

Prüfungsfalle Nr.1

Immer zuerst prüfen,

ob überhaupt auf die Steuerbefreiung verzichtet wurde.

Prüfungsfalle Nr.2

§ 13b greift nur,

wenn die Voraussetzungen erfüllt sind.

Prüfungsfalle Nr.3

Vorsteuerabzug setzt steuerpflichtige Ausgangsumsätze voraus.

Prüfungsfalle Nr.4

Option nach § 9 UStG und Reverse Charge sind zwei getrennte Prüfungsschritte.
`
},
{
  id: "ust-binnenmarkt-holzanbau-ige-werkleistung",
  title: "Binnenmarkt: Holzanbau, innergemeinschaftlicher Erwerb und Werklieferung",
  short:
    "Prüfung einer Werklieferung im Inland mit Anzahlung sowie innergemeinschaftlichem Erwerb von Material aus Belgien.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "binnenmarkt|innergemeinschaftlicher erwerb|i.g.e.|werklieferung|holzbau|anzahlung|§3 abs4 ustg|§3d ustg|§13 ustg|§15 ustg|transportleistung|rechnung",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 1 Abs. 1 Nr. 5 UStG",
    "§ 1a UStG",
    "§ 3 Abs. 4 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 3d UStG",
    "§ 4 UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13 UStG",
    "§ 13a UStG",
    "§ 15 UStG"
  ],
  body: `
# Binnenmarkt: Holzanbau und innergemeinschaftlicher Erwerb

## Ausgangssachverhalt

Ein deutscher Unternehmer Rens errichtet für einen deutschen Auftraggeber Thiesen einen Holzanbau.

Für den Holzanbau benötigt Rens Holzverstrebungen, die er bei Huise aus Belgien bestellt.

Huise liefert die Holzverstrebungen direkt an den Frachtführer Rabens, der sie nach Deutschland transportiert.

Alle Unternehmer verwenden die USt-IdNr. ihres Heimatlandes.

---

# 1. Ausgangsleistung Rens an Thiesen

## Art der Leistung

Rens errichtet einen Holzanbau.

Da Rens nicht nur Material liefert, sondern einen Gegenstand herstellt und einbaut, liegt eine Werklieferung vor.

Rechtsgrundlage:

§ 3 Abs. 4 UStG

Zur Werklieferung gehören insbesondere:

- Gestellung des Materials
- Aufbau
- Anlieferung
- Montage

---

## Ort der Werklieferung

Bei einer unbewegten Werklieferung bestimmt sich der Ort nach § 3 Abs. 7 UStG.

Der Ort liegt dort, wo sich der Gegenstand im Zeitpunkt der Verschaffung der Verfügungsmacht befindet.

Hier:

Hünxe / Inland

---

## Steuerbarkeit und Steuerpflicht

Die Werklieferung ist steuerbar nach § 1 Abs. 1 Nr. 1 UStG.

Eine Steuerbefreiung nach § 4 UStG greift nicht.

Damit ist der Umsatz steuerpflichtig zum Regelsteuersatz von 19 %.

---

## Bemessungsgrundlage

Gesamtpreis brutto:

11.900 €

Bemessungsgrundlage netto:

11.900 € / 1,19

=

10.000 €

Umsatzsteuer:

1.900 €

Steuerschuldner:

Rens

Rechtsgrundlage:

§ 13a Abs. 1 Nr. 1 UStG

---

# 2. Steuerentstehung bei Anzahlung

Thiesen leistet am 21.01. eine Anzahlung von 1.000 € brutto.

Bei Anzahlungen entsteht die Umsatzsteuer bereits mit Ablauf des Voranmeldungszeitraums der Vereinnahmung.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a Satz 4 UStG

## Berechnung Anzahlung

Anzahlung brutto:

1.000 €

Umsatzsteuer:

1.000 € / 1,19 × 19 %

=

159,66 €

Die Umsatzsteuer entsteht mit Ablauf des VAZ 01.

---

# 3. Reststeuer bei Leistungsausführung

Die Abnahme des Holzanbaus erfolgt am 20.03.

Damit wird die Werklieferung ausgeführt.

Restbetrag brutto:

11.900 € - 1.000 €

=

10.900 €

Umsatzsteuer aus Restbetrag:

10.900 € / 1,19 × 19 %

=

1.740,34 €

Die Umsatzsteuer entsteht mit Ablauf des VAZ 03.

---

# 4. Transportleistung Rabens

Rabens transportiert die Holzverstrebungen von Brüssel nach Schermbeck.

Die Rechnung wird jedoch nicht an Rens, sondern an Huise gestellt.

## Folge für Rens

Für Rens ist die Transportleistung umsatzsteuerlich unbeachtlich.

Insbesondere:

- keine Eingangsleistung an Rens
- keine Rechnung auf den Namen des Rens
- kein offener Steuerausweis gegenüber Rens
- kein Vorsteuerabzug

Merksatz:

Vorsteuerabzug nur, wenn die Leistung an den Unternehmer ausgeführt wurde und eine ordnungsgemäße Rechnung vorliegt.

---

# 5. Eingangsleistung Huise an Rens

Huise liefert Holzverstrebungen aus Belgien nach Deutschland.

Die Holzverstrebungen gelangen aus dem übrigen Gemeinschaftsgebiet in das Inland.

Damit liegt bei Rens ein innergemeinschaftlicher Erwerb vor.

Rechtsgrundlage:

§ 1a UStG

---

## Voraussetzungen des innergemeinschaftlichen Erwerbs

Ein innergemeinschaftlicher Erwerb liegt vor, wenn

1. ein Gegenstand aus einem EU-Mitgliedstaat in einen anderen EU-Mitgliedstaat gelangt,

2. der Erwerber Unternehmer ist,

3. der Erwerb für das Unternehmen erfolgt,

4. der Lieferer Unternehmer ist,

5. der Lieferer im Rahmen seines Unternehmens liefert,

6. die Lieferung gegen Entgelt erfolgt.

Diese Voraussetzungen sind hier erfüllt.

---

## Ort des innergemeinschaftlichen Erwerbs

Der Ort des innergemeinschaftlichen Erwerbs bestimmt sich nach § 3d Satz 1 UStG.

Der Erwerb wird dort bewirkt, wo sich der Gegenstand am Ende der Beförderung oder Versendung befindet.

Hier:

Schermbeck / Inland

§ 3d Satz 2 UStG greift nicht, weil Rens seine deutsche USt-IdNr. verwendet.

---

## Steuerbarkeit

Der innergemeinschaftliche Erwerb ist steuerbar nach § 1 Abs. 1 Nr. 5 UStG.

Eine Steuerbefreiung nach § 4b UStG greift nicht.

---

## Steuersatz

Der Regelsteuersatz beträgt 19 %.

Der ermäßigte Steuersatz greift nicht.

---

## Steuerschuldner

Steuerschuldner des innergemeinschaftlichen Erwerbs ist Rens.

Rechtsgrundlage:

§ 13a Abs. 1 Nr. 2 UStG

---

## Bemessungsgrundlage des innergemeinschaftlichen Erwerbs

Nettoentgelt:

5.000 €

Umsatzsteuer:

5.000 € × 19 %

=

950 €

---

## Steuerentstehung beim innergemeinschaftlichen Erwerb

Die Steuer entsteht mit Ausstellung der Rechnung am 05.03.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 6 UStG

VAZ:

03

---

# 6. Vorsteuerabzug aus dem innergemeinschaftlichen Erwerb

Rens verwendet die Holzverstrebungen für seine steuerpflichtige Werklieferung an Thiesen.

Daher ist Rens zum Vorsteuerabzug aus dem innergemeinschaftlichen Erwerb berechtigt.

Rechtsgrundlage:

§ 15 Abs. 1 Nr. 3 UStG

Vorsteuer:

950 €

---

# 7. Zusammenfassung der Beträge

## Ausgangsumsatz Rens an Thiesen

Netto:

10.000 €

Umsatzsteuer:

1.900 €

Davon:

- VAZ 01: 159,66 € aus Anzahlung
- VAZ 03: 1.740,34 € aus Restbetrag

---

## Innergemeinschaftlicher Erwerb Rens von Huise

Bemessungsgrundlage:

5.000 €

Umsatzsteuer:

950 €

Vorsteuer:

950 €

VAZ:

03

---

# Prüfungsschema Werklieferung

1. Liegt eine Lieferung oder sonstige Leistung vor?

2. Wird ein fremder oder eigener Stoff bearbeitet?

3. Wird ein fertiger Gegenstand hergestellt oder eingebaut?

4. Werklieferung nach § 3 Abs. 4 UStG prüfen.

5. Ort der Werklieferung bestimmen.

6. Steuerbarkeit prüfen.

7. Steuerbefreiung prüfen.

8. Bemessungsgrundlage und Umsatzsteuer berechnen.

9. Anzahlung gesondert prüfen.

---

# Prüfungsschema innergemeinschaftlicher Erwerb

1. Gegenstand gelangt aus EU-Ausland ins Inland.

2. Erwerber ist Unternehmer.

3. Erwerb erfolgt für das Unternehmen.

4. Lieferer ist Unternehmer.

5. Lieferung erfolgt gegen Entgelt.

6. Ort nach § 3d UStG bestimmen.

7. Steuerbarkeit nach § 1 Abs. 1 Nr. 5 UStG.

8. Steuerbefreiung prüfen.

9. Steuer berechnen.

10. Vorsteuerabzug prüfen.

---

# Merksätze

Werklieferung:

Material + Einbau + Herstellung eines Gegenstands.

Anzahlung:

Umsatzsteuer entsteht bereits bei Vereinnahmung.

Innergemeinschaftlicher Erwerb:

Ware kommt aus EU-Ausland nach Deutschland.

Die Erwerbsteuer und die Vorsteuer können sich bei voller Berechtigung neutralisieren.

Transportrechnung:

Nur Vorsteuerabzug, wenn die Rechnung auf den Unternehmer lautet und die Leistung an ihn erbracht wurde.

---

# Klausurfallen

Prüfungsfalle Nr. 1:

Die Anzahlung nicht gesondert besteuern.

Bei Anzahlungen entsteht die Umsatzsteuer bereits im Zeitpunkt der Vereinnahmung.

Prüfungsfalle Nr. 2:

Transportleistung automatisch dem deutschen Unternehmer zuordnen.

Entscheidend ist, wer Auftraggeber und Rechnungsempfänger ist.

Prüfungsfalle Nr. 3:

Innergemeinschaftliche Lieferung beim deutschen Erwerber prüfen.

Beim deutschen Erwerber liegt kein igL, sondern ein innergemeinschaftlicher Erwerb vor.

Prüfungsfalle Nr. 4:

Erwerbsteuer vergessen.

Beim innergemeinschaftlichen Erwerb entsteht Erwerbsteuer beim Erwerber.

Prüfungsfalle Nr. 5:

Vorsteuer aus innergemeinschaftlichem Erwerb vergessen.

Bei Verwendung für steuerpflichtige Ausgangsumsätze ist der Vorsteuerabzug möglich.
`
},
{
  id: "ust-binnenmarkt-tueren-innergemeinschaftlicher-erwerb-vorsteuer",
  title: "Binnenmarkt: Innergemeinschaftlicher Erwerb von Türen und Vorsteueraufteilung",
  short:
    "Innergemeinschaftlicher Erwerb mit teilweisem Vorsteuerabzug bei gemischt verwendeten Wirtschaftsgütern.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "binnenmarkt|innergemeinschaftlicher erwerb|türen|vorsteuer|steuerfreie vermietung|§1a ustg|§15 ustg|§4b ustg|vermietung|aufteilung vorsteuer",
  references: [
    "§ 1 Abs. 1 Nr. 5 UStG",
    "§ 1a UStG",
    "§ 3 UStG",
    "§ 3d UStG",
    "§ 4b UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13 UStG",
    "§ 13a UStG",
    "§ 15 UStG"
  ],
  body: `
# Innergemeinschaftlicher Erwerb von Türen

## Ausgangssachverhalt

Der Unternehmer Becker aus Deutschland kauft zehn Türen von einem Unternehmer aus den Niederlanden.

Die Türen werden unmittelbar von Amsterdam nach Borken geliefert.

Gesamtpreis:

10.000 €

Die Rechnung wird am 03.05. ausgestellt.

Von den zehn Türen werden

- drei Türen steuerpflichtig verkauft,
- sieben Türen in ein steuerfrei vermietetes Mehrfamilienhaus eingebaut.

---

# 1. Innergemeinschaftlicher Erwerb

Die Türen gelangen aus den Niederlanden nach Deutschland.

Damit liegt ein innergemeinschaftlicher Erwerb nach § 1a UStG vor.

Voraussetzungen:

- Gegenstand gelangt aus einem EU-Mitgliedstaat ins Inland
- Erwerber ist Unternehmer
- Erwerb erfolgt für das Unternehmen
- Lieferer ist Unternehmer
- Lieferung erfolgt gegen Entgelt

Alle Voraussetzungen sind erfüllt.

---

# 2. Ort des innergemeinschaftlichen Erwerbs

Der Ort bestimmt sich nach § 3d Satz 1 UStG.

Der Erwerb wird dort ausgeführt, wo die Beförderung endet.

Hier:

Borken (Deutschland)

§ 3d Satz 2 UStG greift nicht, da Becker seine deutsche USt-IdNr. verwendet.

---

# 3. Steuerbarkeit

Der innergemeinschaftliche Erwerb ist steuerbar nach

§ 1 Abs. 1 Nr. 5 UStG.

---

# 4. Steuerbefreiung

Eine Steuerbefreiung nach § 4b UStG greift nicht.

Die Erwerbe sind daher steuerpflichtig.

Steuersatz:

19 %

---

# 5. Bemessungsgrundlage

Nettoentgelt:

10.000 €

Umsatzsteuer:

10.000 €

× 19 %

=

1.900 €

Steuerschuldner:

Becker

gemäß § 13a Abs. 1 Nr. 2 UStG.

---

# 6. Steuerentstehung

Die Rechnung wird am 03.05. ausgestellt.

Die Erwerbsteuer entsteht nach

§ 13 Abs. 1 Nr. 6 UStG

mit Ausstellung der Rechnung.

Voranmeldungszeitraum:

Mai

---

# 7. Vorsteuerabzug

Grundsätzlich steht Becker der Vorsteuerabzug aus dem innergemeinschaftlichen Erwerb nach

§ 15 Abs. 1 Satz 1 Nr. 3 UStG

zu.

Allerdings werden die Türen unterschiedlich verwendet.

---

## Drei Türen

Die drei Türen werden für steuerpflichtige Umsätze verwendet.

Hier besteht voller Vorsteuerabzug.

Vorsteuer:

3 × 1.000 €

=

3.000 €

Umsatzsteuer:

570 €

Vorsteuerabzug:

570 €

---

## Sieben Türen

Sieben Türen werden in ein steuerfrei vermietetes Mehrfamilienhaus eingebaut.

Die Vermietung ist nach § 4 Nr. 12 Buchst. a UStG steuerfrei.

Da diese Umsätze den Vorsteuerabzug ausschließen, besteht insoweit kein Vorsteuerabzug.

Vorsteuer:

0 €

---

# 8. Ergebnis

Erwerbsteuer:

1.900 €

Vorsteuer:

570 €

Nicht abzugsfähige Vorsteuer:

1.330 €

---

# Prüfungsschema

1. Gelangt ein Gegenstand aus einem EU-Mitgliedstaat nach Deutschland?

2. Unternehmer als Erwerber?

3. Erwerb für das Unternehmen?

4. Ort des Erwerbs (§ 3d UStG)

5. Steuerbarkeit (§ 1 Abs. 1 Nr. 5 UStG)

6. Steuerbefreiung prüfen

7. Bemessungsgrundlage bestimmen

8. Erwerbsteuer berechnen

9. Vorsteuerabzug nach § 15 UStG prüfen

10. Ausschluss des Vorsteuerabzugs beachten

---

# Merksätze

Der innergemeinschaftliche Erwerb löst grundsätzlich Erwerbsteuer aus.

Vorsteuer erhält der Unternehmer jedoch nur, soweit die erworbenen Gegenstände für Umsätze verwendet werden, die zum Vorsteuerabzug berechtigen.

Steuerfreie Vermietungsumsätze (§ 4 Nr. 12 UStG) schließen den Vorsteuerabzug regelmäßig aus.

Beim gemischten Verwendungszweck ist die Vorsteuer aufzuteilen.

---

# Klausurfallen

Prüfungsfalle Nr. 1:

Erwerbsteuer und Vorsteuer werden häufig gleichgesetzt.

Das ist falsch.

Erwerbsteuer entsteht immer.

Der Vorsteuerabzug ist gesondert zu prüfen.

Prüfungsfalle Nr. 2:

Steuerfreie Vermietung berechtigt grundsätzlich nicht zum Vorsteuerabzug.

Prüfungsfalle Nr. 3:

Bei gemischter Verwendung ist die Vorsteuer aufzuteilen.

Prüfungsfalle Nr. 4:

§ 4b UStG betrifft nur bestimmte innergemeinschaftliche Erwerbe.

Im Regelfall ist der Erwerb steuerpflichtig.
`
},
{
  id: "ust-binnenmarkt-reihengeschaeft-beistelltische-ausfuhrlieferung",
  title: "Binnenmarkt: Reihengeschäft mit Beistelltischen und Ausfuhrlieferung",
  short:
    "Reihengeschäft mit Ausfuhrlieferung nach Norwegen, Zuordnung der Warenbewegung, Lieferort, § 14c UStG und Vorsteuerabzug.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "reihengeschäft|beistelltische|ausfuhrlieferung|norwegen|lieferort|§3 abs6|§3 abs7|§4 nr1a|§6 ustg|§14c|vorsteuer",
  references: [
    "§ 1 UStG",
    "§ 3 Abs. 6 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 4 Nr. 1a UStG",
    "§ 6 UStG",
    "§ 10 UStG",
    "§ 13 UStG",
    "§ 14c UStG",
    "§ 15 UStG"
  ],
  body: `
# Reihengeschäft – Beistelltische

## Ausgangssachverhalt

Der Möbelhändler G verkauft drei Beistelltische an den norwegischen Händler K.

Da G keine passenden Tische mehr auf Lager hat, bestellt er diese beim Zwischenhändler F.

F versendet die Tische unmittelbar an K nach Oslo.

Es liegt damit ein Reihengeschäft mit drei Unternehmern vor:

F → G → K

---

# 1. Vorüberlegung – Reihengeschäft

Mehrere Unternehmer schließen Kaufverträge über denselben Gegenstand.

Der Gegenstand gelangt unmittelbar vom ersten Lieferer an den letzten Abnehmer.

Somit liegt ein Reihengeschäft nach § 3 Abs. 6a UStG vor.

---

# 2. Zuordnung der Warenbewegung

Der Transport wird durch F veranlasst.

Deshalb ist die Warenbewegung der Lieferung

F → G

zuzuordnen.

Diese Lieferung ist die bewegte Lieferung.

Lieferort:

Beginn der Beförderung

=

Köln

gemäß § 3 Abs. 6 UStG.

Die Lieferung

G → K

ist die unbewegte Lieferung.

Lieferort:

Ende der Beförderung

=

Oslo

gemäß § 3 Abs. 7 Satz 2 Nr. 2 UStG.

---

# 3. Lieferung des F an G

F liefert die Tische an G.

Der Transport ist Nebenleistung und teilt das Schicksal der Hauptleistung.

Da F die Gegenstände als Lieferer unmittelbar ins Drittland versendet, handelt es sich um eine Ausfuhrlieferung.

Rechtsgrundlagen:

§ 4 Nr. 1a UStG

i.V.m.

§ 6 UStG

Ergebnis:

- steuerbar
- steuerfrei

Bemessungsgrundlage:

9.000 €

Der Umsatz ist im Voranmeldungszeitraum Februar zu erklären.

---

# 4. Fehlerhafte Rechnung des F

F weist in seiner Rechnung

1.710 €

Umsatzsteuer aus.

Da die Lieferung steuerfrei ist, handelt es sich um einen unrichtigen Steuerausweis.

Rechtsgrundlage:

§ 14c Abs. 1 UStG

Folgen:

- F schuldet die ausgewiesene Umsatzsteuer.
- Eine Rechnungsberichtigung ist möglich.

---

# 5. Lieferung des G an K

Diese Lieferung ist die unbewegte Lieferung.

Der Lieferort liegt in

Oslo.

Damit wird die Lieferung nicht im Inland ausgeführt.

Ergebnis:

- nicht steuerbar in Deutschland

Bemessungsgrundlage:

12.000 €

---

# 6. Vorsteuerabzug des G

Grundsätzlich setzt der Vorsteuerabzug voraus,

dass gesetzlich geschuldete Umsatzsteuer vorliegt.

Die Lieferung des F ist jedoch steuerfrei.

Die ausgewiesene Umsatzsteuer beruht lediglich auf § 14c UStG.

Eine nach § 14c geschuldete Steuer berechtigt nicht zum Vorsteuerabzug.

Ergebnis:

Kein Vorsteuerabzug für G.

---

# Prüfungsschema

1. Liegt ein Reihengeschäft vor?

2. Wer veranlasst den Transport?

3. Welche Lieferung ist die bewegte Lieferung?

4. Lieferort der bewegten Lieferung bestimmen.

5. Lieferort der unbewegten Lieferung bestimmen.

6. Steuerfreiheit (Ausfuhrlieferung) prüfen.

7. Fehlerhaften Steuerausweis (§ 14c UStG) prüfen.

8. Vorsteuerabzug prüfen.

---

# Merksätze

Bei einem Reihengeschäft kann die Warenbewegung nur einer Lieferung zugeordnet werden.

Die bewegte Lieferung richtet sich grundsätzlich nach § 3 Abs. 6 UStG.

Die nachfolgende Lieferung ist regelmäßig die unbewegte Lieferung (§ 3 Abs. 7 UStG).

Eine Ausfuhrlieferung ist steuerfrei.

Ein unrichtiger Steuerausweis nach § 14c UStG begründet zwar eine Steuerschuld,

berechtigt den Leistungsempfänger jedoch nicht zum Vorsteuerabzug.

---

# Klausurfallen

Prüfungsfalle Nr. 1:

Nicht jede Rechnung mit Umsatzsteuer berechtigt zum Vorsteuerabzug.

Prüfungsfalle Nr. 2:

§ 14c UStG erzeugt lediglich eine Steuerschuld des Rechnungsausstellers.

Prüfungsfalle Nr. 3:

Bei Reihengeschäften darf die Warenbewegung nur einer Lieferung zugeordnet werden.

Prüfungsfalle Nr. 4:

Die unbewegte Lieferung richtet sich nach § 3 Abs. 7 UStG und kann im Ausland ausgeführt werden.
`
},
{
  id: "ust-vorsteuerberichtigung-billigkeitsgruende",
  title: "Vorsteuerberichtigung aus Billigkeitsgründen (§ 15a UStG)",
  short:
    "Vorsteuerberichtigung aus Billigkeitsgründen bei teilunternehmerischer Nutzung eines Wirtschaftsguts und späterer Nutzungsänderung bzw. Veräußerung.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "vorsteuerberichtigung|billigkeitsgruende|§15a|§44ustdv|teilunternehmerisch|pkw|vereine|veraeusserung|vorsteuer",
  references: [
    "§ 15 Abs. 1 UStG",
    "§ 15a UStG",
    "§ 44 UStDV",
    "Abschn. 15.2c UStAE",
    "Abschn. 15a.1 UStAE"
  ],
  body: `
# Vorsteuerberichtigung aus Billigkeitsgründen

## Grundsatz

Wird ein Wirtschaftsgut nur teilweise unternehmerisch genutzt, ist grundsätzlich nur der unternehmerisch genutzte Anteil zum Vorsteuerabzug berechtigt.

Verändert sich die unternehmerische Nutzung innerhalb des Berichtigungszeitraums, kann aus Billigkeitsgründen eine Vorsteuerberichtigung nach § 15a UStG erfolgen.

Die Bagatellgrenzen des § 44 UStDV müssen überschritten sein.

---

## Ausgangsfall

PKW-Anschaffung

Kaufpreis:
30.000 €

Umsatzsteuer:
5.700 €

Unternehmerische Nutzung:

50 %

Ideeller Bereich:

50 %

Vorsteuerabzug:

5.700 € × 50 %

=
2.850 €

---

## Jahr 03 – Erhöhung der unternehmerischen Nutzung

Die unternehmerische Nutzung steigt von

50 %

auf

70 %.

Da sich die zum Vorsteuerabzug berechtigende Verwendung erhöht, liegt eine Änderung der Verhältnisse nach § 15a UStG vor.

Berichtigungszeitraum:

5 Jahre

Vorsteuer insgesamt:

5.700 €

Änderung:

20 Prozentpunkte

Berechnung:

5.700 € ÷ 5

=
1.140 €

1.140 € × 20 %

=
228 €

Ergebnis:

Vorsteuerberichtigung

228 €

zugunsten des Unternehmers.

---

## Jahr 04 – Verkauf des PKW

Der PKW wird für

10.000 € netto

veräußert.

Da der PKW zuletzt zu

70 %

unternehmerisch genutzt wurde,

ist dieser Anteil steuerpflichtig.

Umsatzsteuer:

10.000 €

× 70 %

× 19 %

=
1.330 €

---

## Weitere Vorsteuerberichtigung

Auch die Veräußerung stellt eine Änderung der Verhältnisse dar.

Es erfolgt erneut eine Vorsteuerberichtigung nach § 15a UStG.

Vorsteuer insgesamt:

5.700 €

Berichtigungszeitraum:

5 Jahre

Änderung:

20 Prozentpunkte

Jährlicher Berichtigungsbetrag:

5.700 € ÷ 5 × 20 %

=
228 €

Restlaufzeit:

2 Jahre

Gesamtberichtigung:

228 €

× 2

=
456 €

Diese Berichtigung erfolgt zugunsten des Unternehmers.

---

## Prüfungsschema

1. Wirtschaftsgut mit Berichtigungszeitraum vorhanden?

2. Ursprünglicher Vorsteuerabzug ermitteln.

3. Änderung der Nutzung innerhalb des Berichtigungszeitraums?

4. Bagatellgrenzen (§ 44 UStDV) überschritten?

5. Neue Vorsteuerquote bestimmen.

6. Differenz der Nutzungsquote berechnen.

7. Vorsteuerberichtigung je Restjahr durchführen.

---

## Berechnungsformel

Vorsteuer insgesamt

÷ Berichtigungsjahre

× Nutzungsänderung

× verbleibende Jahre

=

Vorsteuerberichtigung

---

## Merksätze

Eine Erhöhung der unternehmerischen Nutzung führt regelmäßig zu einer Vorsteuerberichtigung zugunsten des Unternehmers.

Eine Verringerung der unternehmerischen Nutzung führt regelmäßig zu einer Vorsteuerberichtigung zulasten des Unternehmers.

Auch eine Veräußerung innerhalb des Berichtigungszeitraums kann eine Vorsteuerberichtigung auslösen.

Die Berichtigung erfolgt nur, wenn die Bagatellgrenzen des § 44 UStDV überschritten werden.

---

## Klausurtipp

Immer zuerst feststellen:

- ursprünglicher Vorsteuerabzug
- Berichtigungszeitraum (5 oder 10 Jahre)
- alte Nutzungsquote
- neue Nutzungsquote
- verbleibende Berichtigungsjahre

Erst danach wird der Berichtigungsbetrag berechnet.
`
},
{
  id: "ust-unternehmer-rahmen-des-unternehmens",
  title: "Unternehmer und Rahmen des Unternehmens (§ 2 UStG)",
  short:
    "Bestimmung der Unternehmereigenschaft, des Unternehmensumfangs sowie der Abgrenzung zwischen selbständiger und nichtselbständiger Tätigkeit.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "unternehmer|§2 ustg|selbständig|nichtselbständig|vorbereitungshandlungen|hilfsgeschäft|vermietung|grundgeschäft|geschäftsführer|ohg|gmbh",
  references: [
    "§ 2 Abs. 1 UStG",
    "§ 2 Abs. 2 Nr. 1 UStG",
    "Abschn. 2.1 UStAE",
    "Abschn. 2.6 UStAE",
    "Abschn. 2.7 UStAE"
  ],
  body: `

# Unternehmer (§ 2 UStG)

Unternehmer ist, wer

- eine gewerbliche oder berufliche Tätigkeit
- selbständig
- nachhaltig
- zur Erzielung von Einnahmen

ausübt.

Dabei umfasst das Unternehmen grundsätzlich die gesamte gewerbliche oder berufliche Tätigkeit.

---

# Fall 1 – Finanzbeamter als Dozent

## Sachverhalt

Ein Finanzbeamter unterrichtet samstags an der Steuerberaterakademie.

Seine Tätigkeit beim Finanzamt erfolgt weisungsgebunden.

## Lösung

### Tätigkeit beim Finanzamt

Keine Selbständigkeit.

→ kein Unternehmer

Rechtsgrundlage:

§ 2 Abs. 2 Nr. 1 UStG

### Unterricht an der Steuerberaterakademie

Die Unterrichtstätigkeit erfolgt eigenverantwortlich.

Sie stellt eine selbständige Tätigkeit dar.

Ergebnis:

- Unternehmer
- selbständige Tätigkeit
- eigenes Unternehmen

Merksatz:

Eine Person kann gleichzeitig Arbeitnehmer und Unternehmer sein.

---

# Fall 2 – Arbeitnehmer stellt Rechnungen an seinen Arbeitgeber

## Sachverhalt

Ein Arbeitnehmer arbeitet sonntags zusätzlich für seinen Arbeitgeber und schreibt hierfür Rechnungen.

## Lösung

Entscheidend ist nicht die Rechnung,

sondern die tatsächlichen Verhältnisse.

Da die Tätigkeit weiterhin

- weisungsgebunden
- organisatorisch eingegliedert

ist,

liegt insgesamt keine Selbständigkeit vor.

Ergebnis:

- kein Unternehmer
- keine Umsatzsteuer
- Arbeitslohn

Merksatz:

Lohnsteuer und Umsatzsteuer schließen sich für dieselbe Tätigkeit aus.

---

# Fall 3 – Sportgeschäft, Sonnenstudio und Vermietung

## Sachverhalt

Benno Ohm betreibt

- Sportgeschäft
- Sonnenstudio
- Vermietung eines unbebauten Grundstücks

Zusätzlich besitzt er ein selbst bewohntes Einfamilienhaus.

## Lösung

Unternehmer ist Ohm hinsichtlich

- Sporthandel
- Sonnenstudio
- Grundstücksvermietung

Alle Tätigkeiten bilden zusammen

ein Unternehmen.

Rechtsgrundlage:

§ 2 Abs. 1 UStG

Jede Tätigkeit stellt zwar ein eigenes Grundgeschäft dar,

gehört jedoch zum selben Unternehmen.

### Nicht zum Unternehmen

Das privat genutzte Einfamilienhaus.

Es dient nicht der Erzielung von Einnahmen.

Deshalb gehört es nicht zum Unternehmen.

---

# Fall 4 – Möbelhändler mit mehreren Tätigkeiten

## Sachverhalt

Jab betreibt

- Möbelhandel
- Vermietung
- Vorträge über Vogelkunde
- Veröffentlichung von Büchern

Außerdem

- verkauft er einen früher betrieblich genutzten Porsche,
- ist Gesellschafter einer OHG,
- ist Geschäftsführer einer GmbH.

## Lösung

### Unternehmerische Tätigkeiten

Zum Unternehmen gehören

- Möbelhandel
- Vermietung
- Vogelkunde

Vorträge und Bücher bilden gemeinsam das Grundgeschäft "Vogelkunde".

---

### Verkauf des Porsche

Der Verkauf eines früher betrieblich genutzten Wirtschaftsgutes stellt

ein Hilfsgeschäft

dar.

Auch Hilfsgeschäfte gehören zum Unternehmen.

Eine Nachhaltigkeit ist hierfür nicht erforderlich.

---

### Beteiligung an der OHG

Die OHG

ist selbst Unternehmer.

Die Beteiligung allein begründet keine eigene Unternehmereigenschaft.

---

### Geschäftsführer der GmbH

Als Geschäftsführer handelt Jab

weisungsgebunden.

Deshalb liegt gegenüber der GmbH

keine selbständige Tätigkeit vor.

Ergebnis:

- kein Unternehmer gegenüber der GmbH

Rechtsgrundlage:

§ 2 Abs. 2 Nr. 1 UStG

---

# Fall 5 – Vorbereitungshandlungen

## Sachverhalt

Ein angestellter Rechtsanwalt möchte sich selbständig machen.

Er

- mietet Büroräume,
- bestellt einen Computer,

gibt die Gründungsabsicht jedoch vor Aufnahme der Tätigkeit wieder auf.

## Lösung

Bereits ernsthafte Vorbereitungshandlungen können

die Unternehmereigenschaft begründen.

Tatsächlich ausgeführte Umsätze

sind hierfür nicht erforderlich.

Voraussetzung ist,

dass die bezogenen Leistungen

objektiv

für eine spätere unternehmerische Tätigkeit bestimmt waren.

Ergebnis:

Der Unternehmerstatus entsteht bereits während der Vorbereitungsphase.

---

# Prüfungsschema Unternehmereigenschaft

1. Liegt eine Tätigkeit vor?

2. Erfolgt sie selbständig?

3. Erfolgt sie nachhaltig?

4. Dient sie der Einnahmeerzielung?

5. Gehört sie zum bestehenden Unternehmen?

6. Handelt es sich lediglich um ein Hilfsgeschäft?

---

# Merksätze

Das Unternehmen umfasst grundsätzlich die gesamte gewerbliche und berufliche Tätigkeit.

Mehrere unterschiedliche Tätigkeiten können zu einem Unternehmen gehören.

Hilfsgeschäfte gehören ebenfalls zum Unternehmen.

Weisungsgebundene Arbeitnehmer sind keine Unternehmer.

Vorbereitungshandlungen können bereits die Unternehmereigenschaft begründen.

Gesellschafter einer Personengesellschaft werden nicht allein durch ihre Beteiligung Unternehmer.

Geschäftsführer einer GmbH handeln regelmäßig nicht selbständig.

---

# Klausurtipps

Prüfungsfalle Nr. 1:

Rechnungen machen einen Arbeitnehmer nicht automatisch zum Unternehmer.

Prüfungsfalle Nr. 2:

Hilfsgeschäfte (z.B. Verkauf von Anlagevermögen) gehören stets zum Unternehmen.

Prüfungsfalle Nr. 3:

Mehrere völlig unterschiedliche Tätigkeiten können umsatzsteuerlich ein einziges Unternehmen bilden.

Prüfungsfalle Nr. 4:

Bereits Vorbereitungshandlungen können den Unternehmerstatus begründen, auch wenn niemals Umsätze ausgeführt werden.
`
},
{
  id: "ust-unentgeltliche-wertabgabe-grundfaelle",
  title: "Unentgeltliche Wertabgaben – Grundfälle (§ 3 Abs. 1b und 3 Abs. 9a UStG)",
  short:
    "Systematische Prüfung der unentgeltlichen Wertabgabe bei Entnahmen, Schenkungen, Privatverwendungen und unentgeltlichen Dienstleistungen.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "unentgeltliche wertabgabe|entnahme|privatentnahme|schenkung|eigenverbrauch|§3 abs1b|§3 abs9a|dienstleistung|werkleistung|iPad|Armband|Garten|Mietwohnung",
  references: [
    "§ 3 Abs. 1b UStG",
    "§ 3 Abs. 9a UStG",
    "§ 1 Abs. 1 UStG",
    "§ 3a UStG",
    "§ 10 Abs. 4 UStG",
    "§ 12 UStG",
    "§ 13a UStG"
  ],
  body: `
# Unentgeltliche Wertabgaben

Die unentgeltliche Wertabgabe dient dazu, einen zuvor gewährten Vorsteuerabzug auszugleichen, wenn Gegenstände oder Leistungen anschließend privat oder außerunternehmerisch verwendet werden.

Es wird unterschieden zwischen:

- unentgeltlicher Lieferung (§ 3 Abs. 1b UStG)
- unentgeltiger sonstiger Leistung (§ 3 Abs. 9a UStG)

---

# Fall 1a – Material für eigenes Mietobjekt

Ein Elektriker entnimmt Kabel und Stecker aus seinem Lager und verwendet sie für ein ertragsteuerliches Privatvermögen zugeordnetes Mietwohnhaus.

## Lösung

Das Mietwohnhaus gehört umsatzsteuerlich weiterhin zum Unternehmen (§ 2 UStG), da es der Erzielung von Einnahmen dient.

Die Materialien werden somit weiterhin unternehmerisch verwendet.

Ergebnis:

- keine Entnahme
- keine unentgeltliche Wertabgabe
- keine Umsatzsteuer

Merksatz:

Privatvermögen im Ertragsteuerrecht bedeutet nicht automatisch Privatvermögen im Umsatzsteuerrecht.

---

# Fall 1b – iPad für private Nutzung

Ein zu 100 % dem Unternehmen zugeordnetes iPad wird

80 %

unternehmerisch

20 %

privat genutzt.

Beim Kauf wurde die gesamte Vorsteuer abgezogen.

## Lösung

Die private Nutzung stellt eine unentgeltliche Wertabgabe nach

§ 3 Abs. 9a Nr. 1 UStG

dar.

Voraussetzungen:

- Gegenstand gehört zum Unternehmen
- Vorsteuerabzug wurde vorgenommen
- private Verwendung

Ergebnis:

- steuerbar
- steuerpflichtig
- Regelsteuersatz 19 %

---

# Fall 1c – Gartenplanung durch Arbeitnehmer

Arbeitnehmer planen unentgeltlich den Garten des privaten Einfamilienhauses ihres Arbeitgebers.

## Lösung

Es handelt sich um eine unentgeltliche sonstige Leistung.

Rechtsgrundlage:

§ 3 Abs. 9a Nr. 2 UStG

Ein Vorsteuerabzug ist hierfür nicht erforderlich.

Ergebnis:

- steuerbar
- steuerpflichtig
- 19 %

---

# Fall 1d – Geschenk eines Goldarmbands

Ein Juwelier schenkt seiner Tochter ein Goldarmband.

## Lösung

Die Schenkung stellt eine unentgeltliche Lieferung dar.

Rechtsgrundlage:

§ 3 Abs. 1b Nr. 1 UStG

Ort der Lieferung richtet sich nach § 3 Abs. 6 UStG.

Ergebnis:

- steuerbar
- steuerpflichtig
- 19 %

---

# Fall 2 – Unentgeltliche Dacheindeckung

Ein Dachdecker deckt unentgeltlich das Mietwohnhaus seiner Ehefrau.

Material wird von der Ehefrau gestellt.

Das Unternehmen trägt lediglich:

- Löhne
- Sozialabgaben
- Fertigungsgemeinkosten

Gesamtkosten:

6.500 €

## Lösung

Es handelt sich um eine unentgeltliche Werkleistung.

Rechtsgrundlage:

§ 3 Abs. 9a Nr. 2 UStG

Bemessungsgrundlage:

§ 10 Abs. 4 UStG

=

entstandene Kosten

=

6.500 €

Umsatzsteuer:

6.500 €

× 19 %

=

1.235 €

---

# Fall 3 – Dienstjubiläum

Ein Arbeitnehmer erhält

- einen Neuwagen
- zusätzlich 600 € Bargeld.

## Neuwagen

Der Wagen wird ausschließlich verschenkt.

Deshalb bestand bereits beim Einkauf keine Absicht, steuerpflichtige Ausgangsumsätze auszuführen.

Ergebnis:

- kein Vorsteuerabzug
- keine Wertabgabenbesteuerung

## Bargeld

Die Hingabe von Geld stellt keine Lieferung und keine sonstige Leistung dar.

Ergebnis:

- keine Umsatzsteuer

---

# Prüfungsschema

1. Lieferung oder sonstige Leistung?

2. Unentgeltlich?

3. Privat oder außerunternehmerisch?

4. Vorsteuerabzug vorhanden bzw. erforderlich?

5. § 3 Abs. 1b oder § 3 Abs. 9a UStG einschlägig?

6. Bemessungsgrundlage (§ 10 Abs. 4 UStG)

7. Steuersatz bestimmen.

---

# Merksätze

§ 3 Abs. 1b UStG

→ Gegenstände

§ 3 Abs. 9a UStG

→ Dienstleistungen und Nutzungen

Unentgeltliche Dienstleistungen benötigen regelmäßig keinen vorherigen Vorsteuerabzug.

Bei Gegenständen ist der Vorsteuerabzug häufig entscheidend.

Die Bemessungsgrundlage sind regelmäßig die Selbstkosten bzw. entstandenen Ausgaben.

---

# Klausurtipps

Prüfungsfalle Nr. 1:

Ertragsteuerliches Privatvermögen ist nicht automatisch umsatzsteuerliches Privatvermögen.

Prüfungsfalle Nr. 2:

Bargeld unterliegt niemals der Umsatzsteuer.

Prüfungsfalle Nr. 3:

Bei Dienstleistungen (§ 3 Abs. 9a UStG) ist ein Vorsteuerabzug häufig keine Voraussetzung.

Prüfungsfalle Nr. 4:

Bei Werkleistungen ist regelmäßig § 10 Abs. 4 UStG für die Bemessungsgrundlage maßgeblich.
`
},
{
  id: "ust-kommission-vermittlung-rahmen-des-unternehmens",
  title: "Kommission, Vermittlung und Hilfsgeschäfte im Rahmen des Unternehmens",
  short:
    "Umsatzsteuerliche Behandlung von Kommissionsgeschäften, Vermittlungsleistungen, Lieferungen, Gutschriften und Vorsteuerabzug.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "kommission|vermittlung|kommissionär|kommittent|§3 abs3 ustg|§3 abs6 ustg|§3 abs7 ustg|gutschrift|vorsteuerabzug|bemessungsgrundlage|provision|rahmen des unternehmens",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 3 UStG",
    "§ 3 Abs. 6 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 2 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13 UStG",
    "§ 13a UStG",
    "§ 14 UStG",
    "§ 15 UStG"
  ],
  body: `
# Kommission und Vermittlung

Bei Kommission und Vermittlung ist zuerst zu unterscheiden:

- echte Lieferung
- Kommissionsgeschäft
- Vermittlungsleistung
- Eigengeschäft
- Hilfsgeschäft

---

# Fall 6 – Handelsvertreter vermittelt Maschine

## Sachverhalt

Handelsvertreter Ferter vermittelt eine Baumaschine.

Dast erwirbt die Maschine von Fastu.

Kaufpreis Maschine:

100.000 € netto

Dast kann keine Rechnung über den Einkauf vorlegen.

Ferter erhält eine Provision von 10 % des Nettoverkaufspreises.

Abrechnung erfolgt per Gutschrift.

## Ausgangsseite – Lieferung der Maschine von Dast an Fastu

Dast liefert die Maschine an Fastu.

Die Lieferung ist steuerbar und steuerpflichtig.

Ort der Lieferung:

Duisburg

Rechtsgrundlage:

§ 3 Abs. 6 UStG

Bemessungsgrundlage:

100.000 €

Umsatzsteuer:

19.000 €

Steuerschuldner:

Dast

## Eingangsseite – Einkauf der Maschine

Da Dast keine ordnungsgemäße Rechnung nach § 14 UStG vorlegen kann,

ist kein Vorsteuerabzug möglich.

Rechtsgrundlage:

§ 15 Abs. 1 Nr. 1 UStG

Merksatz:

Ohne ordnungsgemäße Rechnung kein Vorsteuerabzug.

## Vermittlungsleistung des Ferter

Ferter erbringt gegenüber Dast eine sonstige Leistung.

Es handelt sich um eine Vermittlungsleistung.

Ort der Leistung:

Duisburg

Rechtsgrundlage:

§ 3a Abs. 2 UStG

Die Leistung ist steuerbar und steuerpflichtig.

Provision:

10.000 € brutto

Bemessungsgrundlage:

10.000 € / 1,19

=
8.403,36 €

Umsatzsteuer:

1.596,64 €

## Vorsteuerabzug aus der Gutschrift

Liegt eine ordnungsgemäße Gutschrift vor,

kann Dast die Umsatzsteuer aus der Vermittlungsleistung als Vorsteuer abziehen.

Voraussetzungen:

- Leistung für das Unternehmen
- ordnungsgemäße Gutschrift
- kein Ausschluss nach § 15 Abs. 2 UStG

Ergebnis:

Vorsteuerabzug:

1.596,64 €

---

# Fall 7 – Verkaufskommission Wein

## Sachverhalt

Kleber übernimmt von Winzer Pander 10.000 Liter Wein.

Er verkauft den Wein im eigenen Namen für Rechnung des Pander.

Provision:

15 % vom Verkaufspreis

Verkauf:

15.06. = 8.000 Liter

17.06. = 2.000 Liter

## Vorüberlegung

Es liegt eine Verkaufskommission vor.

Pander ist Kommittent.

Kleber ist Kommissionär.

Bei einem Kommissionsgeschäft werden umsatzsteuerlich Lieferungen fingiert.

Rechtsgrundlage:

§ 3 Abs. 3 UStG

Es liegen gleichzeitig Lieferungen vor:

1. Lieferung vom Kommittenten an den Kommissionär
2. Lieferung vom Kommissionär an den Abnehmer

Das bloße Verbringen des Weins in das Lager ist noch nicht entscheidend.

## Lieferung des Kleber an die Großhändler

Kleber liefert an die Großhändler.

Ort:

Koblenz

Die Lieferungen sind steuerbar und steuerpflichtig.

Bemessungsgrundlage:

20.000 € / 1,19

=
16.806,72 €

Umsatzsteuer:

3.193,28 €

Steuerschuldner:

Kleber

## Lieferung des Pander an Kleber

Pander liefert umsatzsteuerlich an Kleber.

Bemessungsgrundlage:

17.000 € / 1,19

=
14.285,71 €

Umsatzsteuer:

2.714,29 €

Steuerschuldner:

Pander

## Vorsteuerabzug Kleber

Aus der ordnungsgemäßen Rechnung des Pander kann Kleber die Vorsteuer abziehen.

Vorsteuer:

2.714,29 €

Voraussetzungen:

- Leistung für das Unternehmen
- ordnungsgemäße Rechnung
- kein Ausschluss nach § 15 Abs. 2 UStG

## Merksatz

Bei der Verkaufskommission gibt es umsatzsteuerlich zwei Lieferungen.

Kommittent an Kommissionär.

Kommissionär an Abnehmer.

---

# Fall 8 – Kommission Messgeräte

## Sachverhalt

Klein verkauft als Kommissionär für die Jung-OHG Messgeräte.

Die OHG bringt die Geräte im Februar zu Klein.

Klein verkauft im März 11 Geräte an verschiedene Kunden.

Abrechnung:

Lieferungen an Kunden:

12.000 €

./. Provision:

1.800 €

An die OHG zu überweisen:

10.200 €

## Lösung

Zwischen OHG und Klein liegt ein Kommissionsgeschäft vor.

Die OHG ist Kommittentin.

Klein ist Kommissionär.

Rechtsgrundlage:

§ 3 Abs. 3 UStG

Umsatzsteuerlich werden Lieferungen fingiert.

## Lieferung der OHG an Klein

Die OHG liefert an Klein.

Ort der Lieferung:

Solingen

Die Lieferung ist steuerbar und steuerpflichtig.

Bemessungsgrundlage:

10.200 € / 1,19

=
8.571,43 €

Umsatzsteuer:

1.628,57 €

Steuerschuldner:

OHG

## Lieferung des Klein an die Kunden

Klein liefert an die Kunden.

Diese Lieferungen sind eigenständig zu beurteilen.

## Gutschrift

Damit Klein den Vorsteuerabzug erhält,

kann die Abrechnung wie folgt aufgebaut sein:

Lieferungen an Kunden:

12.000 €

./. Provision:

1.800 €

= Überweisung an OHG:

10.200 €

Enthaltene Lieferung der OHG an Klein:

8.571,43 €

zzgl. 19 % USt:

1.628,57 €

gesamt:

10.200 €

## Merksatz

Bei Kommission ist die Abrechnung wirtschaftlich oft nur eine Provisionsabrechnung.

Umsatzsteuerlich liegt trotzdem eine Lieferung des Kommittenten an den Kommissionär vor.

---

# Fall 9 – Vermittlung eines Minibaggers

## Sachverhalt

Jabes vermittelt den Verkauf eines Minibaggers.

Rosen verkauft an Greifen.

Jabes erhält von Rosen eine Provision von brutto 500 €.

Abrechnung erfolgt per Gutschrift.

## Lösung

Jabes erbringt gegenüber Rosen eine Vermittlungsleistung.

Es handelt sich um eine sonstige Leistung.

Rechtsgrundlage:

§ 3 Abs. 9 UStG

Ort der Leistung:

Wuppertal

Rechtsgrundlage:

§ 3a Abs. 2 UStG

Die Leistung ist steuerbar und steuerpflichtig.

## Bemessungsgrundlage

Provision brutto:

500 €

Bemessungsgrundlage:

500 € / 1,19

=
420,17 €

Umsatzsteuer:

79,83 €

Steuerschuldner:

Jabes

## Gutschrift

Die Gutschrift durch Rosen führt bei Jabes zu keinen weiteren umsatzsteuerlichen Folgen,

wenn sie ordnungsgemäß erfolgt.

## Merksatz

Vermittlung ist keine Lieferung.

Vermittlung ist eine sonstige Leistung.

Die Provision ist das Entgelt.

---

# Prüfungsschema Kommission

1. Handelt jemand im eigenen Namen?

2. Handelt er für fremde Rechnung?

3. Liegt ein Kommissionsgeschäft vor?

4. § 3 Abs. 3 UStG anwenden.

5. Fiktive Lieferung Kommittent an Kommissionär prüfen.

6. Lieferung Kommissionär an Abnehmer prüfen.

7. Bemessungsgrundlage und Umsatzsteuer berechnen.

8. Gutschrift / Rechnung prüfen.

9. Vorsteuerabzug prüfen.

---

# Prüfungsschema Vermittlung

1. Vermittler bringt einen Vertrag zustande.

2. Vermittler liefert den Gegenstand nicht selbst.

3. Es liegt eine sonstige Leistung vor.

4. Ort nach § 3a UStG bestimmen.

5. Provision als Entgelt prüfen.

6. Umsatzsteuer aus Provision herausrechnen.

7. Rechnung oder Gutschrift prüfen.

8. Vorsteuerabzug beim Leistungsempfänger prüfen.

---

# Merksätze

Kommission:

eigener Name

fremde Rechnung

= zwei Lieferungen

Vermittlung:

fremder Vertrag

Provision

= sonstige Leistung

Bei Kommission ist § 3 Abs. 3 UStG zentral.

Bei Vermittlung ist § 3 Abs. 9 UStG zentral.

Eine Gutschrift kann eine Rechnung ersetzen.

Ohne ordnungsgemäße Rechnung kein Vorsteuerabzug.

---

# Klausurtipps

Prüfungsfalle Nr. 1:

Kommission und Vermittlung verwechseln.

Bei Kommission verkauft der Kommissionär im eigenen Namen.

Bei Vermittlung vermittelt er nur den Vertrag.

Prüfungsfalle Nr. 2:

Bei Kommission nur die Provision besteuern.

Das ist falsch.

Es liegen umsatzsteuerlich Lieferungen vor.

Prüfungsfalle Nr. 3:

Bruttobeträge nicht herausrechnen.

Bei Bruttopreisen:

BMG = Bruttobetrag / 1,19.

Prüfungsfalle Nr. 4:

Vorsteuerabzug ohne Rechnung annehmen.

Eine ordnungsgemäße Rechnung oder Gutschrift ist zwingend erforderlich.

`
},
{
  id: "ust-preisausschreiben-verlosung-werbegeschenke",
  title: "Preisausschreiben und Verlosung: Vorsteuer und unentgeltliche Wertabgabe",
  short:
    "Umsatzsteuerliche Behandlung von Preisen aus Werbeaktionen: Vorsteuerabzug, Geschenke geringen Werts und unentgeltliche Wertabgabe.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "preisausschreiben|verlosung|werbegeschenk|geschenk geringen werts|unentgeltliche wertabgabe|§ 3 abs. 1b ustg|§ 15 ustg|§ 15 abs. 1a ustg|vorsteuerabzug|werbemaßnahme|roller|bücher|7 prozent",
  references: [
    "§ 3 Abs. 1b UStG",
    "§ 15 Abs. 1 UStG",
    "§ 15 Abs. 1a UStG",
    "§ 4 Abs. 5 Nr. 1 EStG",
    "§ 12 Abs. 2 Nr. 1 UStG",
    "Anlage 2 zum UStG",
    "Abschn. 15.15 UStAE"
  ],
  body: `
# Preisausschreiben und Verlosung

## Grundsatz

Bei einem Preisausschreiben oder einer Verlosung im Rahmen einer Werbemaßnahme ist umsatzsteuerlich zu prüfen:

1. Ist der Einkauf der Preise zum Vorsteuerabzug berechtigt?
2. Führt die spätere Hingabe an die Gewinner zu einer unentgeltlichen Wertabgabe?

## Werbemaßnahme

Ein Preisausschreiben kann eine unternehmerisch veranlasste Werbemaßnahme sein.

Die Zuwendung der Preise fällt dann grundsätzlich nicht unter das ertragsteuerliche Abzugsverbot für Geschenke nach § 4 Abs. 5 Nr. 1 EStG.

Ein Vorsteuerausschluss nach § 15 Abs. 1a UStG liegt dann grundsätzlich nicht vor.

## 1. Preis: Hochwertiger Gewinn

Beispiel:

Elektro-City-Roller

Einkauf:

3.000 Euro zzgl. 570 Euro Umsatzsteuer

Der Roller wird von Anfang an mit der Absicht erworben, ihn im Rahmen der Werbeaktion zu verlosen.

## Vorsteuerabzug beim hochwertigen Preis

Steht bereits beim Leistungsbezug fest, dass der Gegenstand verlost werden soll, berechtigt der Einkauf grundsätzlich nicht zum Vorsteuerabzug, wenn die Voraussetzungen für eine spätere Wertabgabenbesteuerung nicht erfüllt sind.

Der Gegenstand wird nicht für zum Vorsteuerabzug berechtigende Ausgangsumsätze verwendet, sondern zur unentgeltlichen Weitergabe an den Gewinner.

## Unentgeltliche Wertabgabe beim hochwertigen Preis

Die Hingabe des Rollers erfolgt aus unternehmerischen Gründen.

Der Vorgang fällt der Art nach unter § 3 Abs. 1b Nr. 3 UStG.

Da jedoch kein Vorsteuerabzug aus dem Erwerb möglich war, unterbleibt die Besteuerung einer unentgeltlichen Wertabgabe.

Merksatz:

Keine Vorsteuer beim Einkauf

=
keine Wertabgabenbesteuerung bei der Hingabe.

## Geschenke von geringem Wert

Bei Geschenken von geringem Wert liegt keine steuerbare unentgeltliche Wertabgabe nach § 3 Abs. 1b Nr. 3 UStG vor.

## 2. bis 10. Preis: Bücher

Beispiel:

Bildbände

Einkauf je Buch:

30 Euro zzgl. 2,10 Euro Umsatzsteuer

Die Bücher stellen Geschenke von geringem Wert dar.

Die Hingabe an die Gewinner ist daher nicht steuerbar nach § 3 Abs. 1b Nr. 3 UStG.

## Vorsteuerabzug bei Büchern

Da die Bücher im Rahmen einer Werbemaßnahme eingesetzt werden und den unternehmerischen Umsätzen dienen, ist der Vorsteuerabzug grundsätzlich möglich.

Die Vorsteuer richtet sich nach der ordnungsgemäßen Rechnung.

Bücher unterliegen dem ermäßigten Steuersatz von 7 %.

Beispiel:

30 Euro x 7 %

=
2,10 Euro Vorsteuer je Buch

Die Vorsteuer ist im Voranmeldungszeitraum des Leistungsbezugs abziehbar.

## Prüfungsschema

1. Liegt eine Werbemaßnahme vor?

2. Wurde der Gegenstand für unternehmerische Zwecke erworben?

3. Ist der Gegenstand ein Geschenk von geringem Wert?

4. Ist die Eingangsleistung direkt und unmittelbar den Ausgangsumsätzen zuordenbar?

5. Besteht ein Vorsteuerausschluss nach § 15 Abs. 1a UStG?

6. Wurde beim Erwerb Vorsteuer abgezogen?

7. Liegt bei Hingabe eine unentgeltliche Wertabgabe nach § 3 Abs. 1b UStG vor?

## Rechtsfolgen

Hochwertiger Preis:

- keine Vorsteuer, wenn von Anfang an die Verlosung beabsichtigt war und keine steuerbare Wertabgabe folgt
- keine Wertabgabenbesteuerung bei Hingabe, wenn kein Vorsteuerabzug möglich war

Geschenk von geringem Wert:

- Vorsteuerabzug grundsätzlich möglich
- Hingabe nicht steuerbar nach § 3 Abs. 1b Nr. 3 UStG

## Prüfungsmerksätze

Preisausschreiben ist regelmäßig eine Werbemaßnahme.

Geschenke von geringem Wert führen nicht zur unentgeltlichen Wertabgabe.

Bei hochwertigen Preisen ist der Vorsteuerabzug kritisch.

Eine unentgeltliche Wertabgabe setzt regelmäßig voraus, dass der Gegenstand oder seine Bestandteile zum Vorsteuerabzug berechtigt haben.

## Klausurtipp

Typische Prüfungsfalle:

Viele ziehen beim hochwertigen Verlosungsgewinn automatisch die Vorsteuer ab.

Das ist falsch, wenn bereits beim Einkauf feststeht, dass der Gegenstand unentgeltlich verlost wird und kein steuerbarer Ausgangsumsatz entsteht.

Bei geringwertigen Werbegeschenken ist der Vorsteuerabzug dagegen regelmäßig möglich.

Merksatz:

Hochwertiger Verlosungsgewinn:

Vorsteuer prüfen.

Geringwertiges Werbegeschenk:

Vorsteuer meist möglich, keine Wertabgabe.
`
},
{
  id: "ust-vorsteuerberichtigung-gemischt-genutztes-gebaeude",
  title: "Vorsteuerberichtigung bei gemischt genutzten Gebäuden (§ 15a UStG)",
  short:
    "Vorsteuerberichtigung bei Änderung der unternehmerischen oder privaten Nutzung sowie bei späterer Grundstücksveräußerung.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "§ 15a ustg|vorsteuerberichtigung|gemischt genutztes gebäude|privatnutzung|unternehmerische nutzung|§ 44 ustdv|grundstücksveräußerung|steuerfreie veräußerung|steuerpflichtige veräußerung|berichtigungszeitraum",
  references: [
    "§ 15a UStG",
    "§ 15a Abs. 6a UStG",
    "§ 15a Abs. 8 UStG",
    "§ 15 Abs. 1b UStG",
    "§ 44 UStDV",
    "§ 4 Nr. 9 Buchst. a UStG",
    "§ 9 UStG",
    "§ 13b Abs. 2 Nr. 3 UStG"
  ],
  body: `
# Vorsteuerberichtigung bei gemischt genutzten Gebäuden

## Grundsatz

Wird ein Gebäude sowohl unternehmerisch als auch privat genutzt, ist für den Vorsteuerabzug entscheidend, in welchem Umfang das Gebäude dem Unternehmen zugeordnet wurde und in welchem Umfang die Nutzung zum Vorsteuerabzug berechtigt.

Ändert sich später die tatsächliche Verwendung, kann eine Vorsteuerberichtigung nach § 15a UStG erforderlich sein.

## Berichtigungszeitraum

Bei Grundstücken und Gebäuden beträgt der Berichtigungszeitraum 10 Jahre.

Der Zeitraum beginnt mit der erstmaligen Verwendung des Gebäudes.

Beispiel:

Erstmalige Verwendung:
01.01.02

Berichtigungszeitraum:
01.01.02 bis 31.12.11

## Änderung der Verhältnisse

Eine Änderung der Verhältnisse liegt vor, wenn sich der Umfang der zum Vorsteuerabzug berechtigenden Verwendung ändert.

Beispiele:

- unternehmerische Nutzung steigt
- unternehmerische Nutzung sinkt
- private Nutzung steigt
- steuerpflichtige Nutzung wird steuerfrei
- steuerfreie Veräußerung
- steuerpflichtige Veräußerung

## Erhöhung der unternehmerischen Nutzung

Erhöht sich die unternehmerische Nutzung, kann eine Berichtigung zugunsten des Unternehmers erfolgen.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Tatsächliche zum Vorsteuerabzug berechtigende Verwendung:
52 %

Änderung:
+12 Prozentpunkte

Berechnung:

57.000 Euro Vorsteuer
x 1/10
x 12 %

=
684 Euro

Ergebnis:

684 Euro sind zugunsten des Unternehmers zu korrigieren.

## Erhöhung der privaten Nutzung

Erhöht sich die private Nutzung, sinkt die unternehmerische Verwendung.

Dann ist eine Berichtigung zu Ungunsten des Unternehmers vorzunehmen.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Neue zum Vorsteuerabzug berechtigende Verwendung:
25 %

Änderung:
-15 Prozentpunkte

Berechnung:

57.000 Euro Vorsteuer
x 1/10
x 15 %

=
855 Euro

Ergebnis:

855 Euro sind zu Ungunsten des Unternehmers zu korrigieren.

## Veräußerung des Gebäudes

Wird ein Gebäude innerhalb des Berichtigungszeitraums veräußert, ist ebenfalls § 15a UStG zu prüfen.

Dabei kommt es darauf an, ob die Veräußerung steuerfrei oder steuerpflichtig erfolgt.

## Steuerfreie Grundstücksveräußerung

Eine steuerfreie Veräußerung nach § 4 Nr. 9 Buchst. a UStG führt für den verbleibenden Berichtigungszeitraum zu einer Nutzung von 0 % zum Vorsteuerabzug.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Ab Veräußerung:
0 %

Änderung:
40 Prozentpunkte

Jahresbetrag:

57.000 Euro / 10 Jahre = 5.700 Euro

Berichtigung pro Jahr:

5.700 Euro x 40 %

=
2.280 Euro

Wenn noch die Jahre 09 bis 11 betroffen sind:

3 Jahre x 2.280 Euro

=
6.840 Euro

Die Berichtigung erfolgt zu Ungunsten des Unternehmers.

## Steuerpflichtige Grundstücksveräußerung

Wird zur Steuerpflicht optiert, gilt die Veräußerung für den verbleibenden Berichtigungszeitraum als Verwendung zu 100 % für vorsteuerunschädliche Umsätze.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Ab Veräußerung:
100 %

Änderung:
60 Prozentpunkte

Jahresbetrag:

57.000 Euro / 10 Jahre = 5.700 Euro

Berichtigung pro Jahr:

5.700 Euro x 60 %

=
3.420 Euro

Wenn noch die Jahre 09 bis 11 betroffen sind:

3 Jahre x 3.420 Euro

=
10.260 Euro

Die Berichtigung erfolgt zugunsten des Unternehmers.

## Zusammenfassung der Beispiele

Fall 1:

Unternehmerische Nutzung steigt von 40 % auf 52 %.

Berichtigung:

57.000 Euro x 1/10 x 12 %

=
684 Euro zugunsten des Unternehmers.

Fall 2:

Unternehmerische Nutzung sinkt von 40 % auf 25 %.

Berichtigung:

57.000 Euro x 1/10 x 15 %

=
855 Euro zu Ungunsten des Unternehmers.

Fall 3:

Steuerfreie Veräußerung:

0 % statt 40 %

=
40 Prozentpunkte Änderung zu Ungunsten.

Fall 4:

Steuerpflichtige Veräußerung:

100 % statt 40 %

=
60 Prozentpunkte Änderung zugunsten.

## Bagatellgrenzen nach § 44 UStDV

Die Bagatellgrenzen des § 44 UStDV sind zu prüfen.

Wird die Grenze überschritten, ist die Vorsteuerberichtigung durchzuführen.

Bei Grundstücksveräußerungen werden die Berichtigungsbeträge für die verbleibenden Jahre zusammengefasst.

## Prüfungsschema

1. Wurde ursprünglich Vorsteuer abgezogen?

2. Liegt ein Berichtigungsobjekt vor?

3. Grundstück oder Gebäude?

4. Berichtigungszeitraum 10 Jahre bestimmen.

5. Ursprüngliche zum Vorsteuerabzug berechtigende Verwendung feststellen.

6. Tatsächliche spätere Verwendung feststellen.

7. Änderung in Prozentpunkten berechnen.

8. Jahresbetrag bestimmen:

Vorsteuer / 10

9. Jahresbetrag x Änderungsquote.

10. Bei Veräußerung:

Restzeitraum zusammenfassen.

## Prüfungsmerksätze

Gebäude haben einen Berichtigungszeitraum von 10 Jahren.

Maßgeblich ist der Unterschied zwischen ursprünglichem Vorsteuerabzug und späterer tatsächlicher Verwendung.

Mehr unternehmerische Nutzung:

Berichtigung zugunsten.

Mehr private oder steuerfreie Nutzung:

Berichtigung zu Ungunsten.

Steuerfreie Veräußerung:

0 % Vorsteuerverwendung.

Steuerpflichtige Veräußerung:

100 % Vorsteuerverwendung.

## Klausurtipp

Typische Prüfungsfalle:

Bei einer steuerpflichtigen Grundstücksveräußerung wird oft vergessen, dass diese für § 15a UStG als 100-%-Verwendung für zum Vorsteuerabzug berechtigende Umsätze gilt.

Merksatz:

Steuerfrei verkauft = 0 %.

Steuerpflichtig verkauft = 100 %.
`
},
{
id:"ust-reverse-charge-grundstueck",
title:"Reverse-Charge bei Grundstückslieferungen",
category:"Umsatzsteuer",

references:[
"§13b Abs.2 Nr.3 UStG",
"§13b Abs.5 UStG"
],

body:`

# Reverse Charge

Bei bestimmten Grundstückslieferungen schuldet nicht der Verkäufer,

sondern der Leistungsempfänger die Umsatzsteuer.

---

## Bemessungsgrundlage

Kaufpreis

ohne Umsatzsteuer.

Die Grunderwerbsteuer gehört nicht zum Entgelt.

---

## Klausurhinweis

Immer prüfen,

ob §13b UStG einschlägig ist.

`
},
{
id:"ust-uneinbringliche-forderung",
title:"Uneinbringliche Forderungen (§17 UStG)",
category:"Umsatzsteuer",

keywords:"17 ustg|insolvenz|uneinbringlich|berichtigung",

references:[
"§17 UStG"
],

body:`

# Uneinbringliche Forderungen

Wird eine Forderung uneinbringlich,

ist die Bemessungsgrundlage nach §17 UStG zu berichtigen.

---

## Typischer Fall

Eröffnung des Insolvenzverfahrens.

Ab diesem Zeitpunkt gelten offene Forderungen regelmäßig als uneinbringlich.

---

## Folge

Die Umsatzsteuer wird berichtigt.

Bereits erklärte Umsatzsteuer

→ Korrektur auf 0,

soweit die Forderung uneinbringlich geworden ist.

---

## Prüfung

1. Forderung entstanden?

2. Uneinbringlichkeit?

3. Berichtigung nach §17 UStG.

`
},
{
id:"ust-vollzuordnung-gebaeude",
title:"Vollständige Zuordnung eines gemischt genutzten Gebäudes",
category:"Umsatzsteuer",

references:[
"§15 Abs.1b UStG"
],

body:`

# Vollzuordnung

Ordnet der Unternehmer das gesamte Gebäude seinem Unternehmen zu,

ist der Vorsteuerabzug dennoch nur insoweit zulässig,

wie das Gebäude für unternehmerische Umsätze verwendet wird.

---

## Laufende Kosten

Sind die Aufwendungen nicht eindeutig zuordenbar,

erfolgt die Aufteilung regelmäßig nach dem Verhältnis der Nutzflächen.

---

## Merksatz

Vollständige Zuordnung

≠

vollständiger Vorsteuerabzug.

`
},
{
id:"ust-vorsteuer-grundstueckserwerb",
title:"Vorsteuerabzug beim Grundstückserwerb",
category:"Umsatzsteuer",

references:[
"§15 Abs.1 Nr.4 UStG"
],

body:`

# Vorsteuerabzug

Der Leistungsempfänger kann die nach §13b geschuldete Umsatzsteuer gleichzeitig als Vorsteuer abziehen,

wenn

- das Grundstück für steuerpflichtige Umsätze verwendet wird,

und

- kein Ausschlusstatbestand nach §15 Abs.2 UStG vorliegt.

---

## Folge

Vorsteuerabzug in voller Höhe möglich.

`
},
{
  id: "ust-grundstuecksveraeusserung-gi",
  title: "Geschäftsveräußerung im Ganzen bei Grundstücken",
  category: "Umsatzsteuer",

  references:[
    "§1 Abs.1a UStG"
  ],

  body:`

# Prüfung

Eine nicht steuerbare Geschäftsveräußerung liegt nur vor, wenn

- ein Unternehmen oder Teilbetrieb übertragen wird

und

- der Erwerber die bisherige Tätigkeit fortführt.

---

## Keine Geschäftsveräußerung

Verwendet der Erwerber das Grundstück künftig für einen anderen Zweck,

liegt keine Geschäftsveräußerung im Ganzen vor.

---

## Merksatz

Andere Nutzung

=

keine Geschäftsveräußerung.

`
},
{
  id: "ust-grundstuecksveraeusserung-option",
  title: "Veräußerung eines unbebauten Grundstücks mit Option zur Steuerpflicht",
  short: "Umsatzsteuerliche Behandlung einer Grundstückslieferung mit Verzicht auf die Steuerbefreiung.",
  category: "Umsatzsteuer",
  keywords: [
    "Grundstück",
    "§4 Nr9a",
    "§9 UStG",
    "Option",
    "Steuerbefreiung"
  ],

  references: [
    "§3 Abs.1 UStG",
    "§4 Nr.9 Buchst. a UStG",
    "§9 Abs.1 UStG",
    "§9 Abs.3 UStG"
  ],

  body: `
# Grundsatz

Die Lieferung eines unbebauten Grundstücks ist grundsätzlich nach §4 Nr.9 Buchst. a UStG steuerfrei.

---

# Option zur Steuerpflicht

Verkauft der Unternehmer an einen anderen Unternehmer für dessen Unternehmen, kann auf die Steuerbefreiung verzichtet werden (§9 UStG).

Voraussetzungen:

- Lieferung an Unternehmer
- Verwendung für dessen Unternehmen
- Verzicht im notariellen Kaufvertrag erklärt

---

# Folge

Die Grundstückslieferung wird steuerpflichtig.

Regelsteuersatz: 19 %

`
},
{
id:"ust-nebenleistung-betriebsvorrichtung",
title:"Nebenleistung oder eigenständige Betriebsvorrichtung?",
category:"Umsatzsteuer",

body:`

# Prüfung

## Endverbraucher

Betriebsvorrichtungen

teilen regelmäßig das Schicksal der Hauptleistung.

→ Nebenleistung

---

## Unternehmer (Zwischenvermietung)

Betriebsvorrichtungen können eigenständig steuerpflichtig sein.

Eine Aufteilung der Leistungen ist zu prüfen.

---

## Typische Klausurfalle

Nicht jede Lichtanlage ist automatisch Nebenleistung.

Entscheidend ist,

wer Leistungsempfänger ist.

`
},
{
id:"ust-tennishalle-zwischenvermietung",
title:"Zwischenvermietung einer Tennishalle an Unternehmer",
category:"Umsatzsteuer",

keywords:"zwischenvermietung|betriebsvorrichtung|sportanlage|4 nr 12 ustg",

references:[
"§4 Nr.12 UStG",
"Abschn. 4.12.11 UStAE"
],

body:`

# Vermietung an Betreiber

Wird die Tennishalle an einen Unternehmer vermietet,

der sie seinerseits weitervermietet,

liegt eine Zwischenvermietung vor.

---

## Aufteilung

Die Leistung ist aufzuteilen in

✓ steuerfreie Grundstücksvermietung (§4 Nr.12 UStG)

und

✓ steuerpflichtige Vermietung der Betriebsvorrichtungen.

---

## Betriebsvorrichtungen

Beispiele

- Lichtanlage

- technische Einrichtungen

- Sporteinrichtungen

---

## Klausurhinweis

Zwischenvermietung

≠

Endverbraucher.

Hier erfolgt regelmäßig eine Aufteilung.

`
},
{
  id: "ust-tennishalle-endverbraucher",
  title: "Vermietung einer Tennishalle an Endverbraucher",
  short: "Umsatzsteuerliche Behandlung der kurzfristigen Vermietung einer Sportanlage an Privatpersonen.",
  category: "Umsatzsteuer",
  keywords: "tennishalle|sportanlage|endverbraucher|grundstück|betriebsvorrichtung|19%",

  references: [
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 3 Nr. 1 UStG",
    "§ 12 Abs. 1 UStG"
  ],

  body: `

# Kurzfristige Hallenvermietung

Die Vermietung einer Tennishalle an Endverbraucher stellt eine sonstige Leistung (§3 Abs.9 UStG) dar.

---

## Leistungsort

Grundstücksbezogene Leistung

→ Ort des Grundstücks (§3a Abs.3 Nr.1 UStG)

---

## Lichtanlage

Die Überlassung der Beleuchtung ist eine unselbständige Nebenleistung.

Sie teilt das steuerliche Schicksal der Hallenvermietung.

Keine getrennte Beurteilung.

---

## Umsatzsteuer

Die gesamte Leistung unterliegt dem Regelsteuersatz von 19 %.

Eine Aufteilung in

- steuerfreie Grundstücksvermietung
- steuerpflichtige Betriebsvorrichtung

erfolgt bei Vermietung an Endverbraucher nicht.

---

## Merksatz

Endverbraucher

→ einheitliche steuerpflichtige Leistung.

`
},
{
  id: "ust-vorsteuerberichtigung-gebaeude-15a",
  title: "Vorsteuerberichtigung bei Gebäuden (§ 15a UStG)",
  short:
    "Prüfung einer Vorsteuerberichtigung bei Änderung der Verwendung eines Gebäudes oder Gebäudebestandteils.",
  category: "Umsatzsteuer",
  keywords:
    "§15a ustg|vorsteuerberichtigung|gebäude|fenster|änderung der verhältnisse",
  references: [
    "§ 15a UStG",
    "§ 15 UStG",
    "§ 44 UStDV"
  ],
  body: `

# Prüfungsschema §15a UStG

## 1. Ursprünglicher Vorsteuerabzug

- ordnungsgemäße Rechnung (§15 UStG)
- ursprünglicher Vorsteuerabzug zulässig

---

## 2. Änderung der Verhältnisse

Prüfen:

Hat sich die tatsächliche Verwendung gegenüber der ursprünglichen Verwendung geändert?

Beispiele

- steuerpflichtig → steuerfrei
- privat → unternehmerisch
- gemischte Nutzung

---

## 3. Berichtigungsobjekt

Bei Gebäuden gehören eingebaute Bestandteile (Fenster, Türen, Heizungen usw.) nach Einbau regelmäßig zum Gebäude.

Eigenständiger Berichtigungszeitraum:

10 Jahre (§15a Abs.1 UStG)

---

## 4. Berichtigung

Berichtigung jährlich

Vorsteuer × Nutzungsänderung × 1/10

anteilige Monate berücksichtigen.

---

## Merksatz

Entscheidend ist nicht die geplante,

sondern die tatsächliche Verwendung.

`
},
{
  id: "umwstg-anteilstausch-21",
  title: "Anteilstausch nach § 21 UmwStG",
  short:
    "Prüfung des Anteilstauschs und Voraussetzungen für den Buchwertansatz.",
  category: "Umwandlungssteuer",
  keywords:
    "§21 umwstg|anteilstausch|buchwert|gemeiner wert|holding|mehrheit stimmrechte",
  references: [
    "§ 21 UmwStG",
    "§ 22 UmwStG",
    "§ 1 UmwStG"
  ],
  body: `

# Anteilstausch

## Sachlicher Anwendungsbereich

Ein Anteilstausch liegt vor, wenn

- Anteile an einer Kapitalgesellschaft
- auf eine andere Kapitalgesellschaft übertragen werden
- und der Einbringende als Gegenleistung neue Anteile erhält.

---

## Persönlicher Anwendungsbereich

Der übernehmende Rechtsträger muss unter den persönlichen Anwendungsbereich des UmwStG fallen (§1 Abs.4 UmwStG).

---

## Steuerliche Wirkung

Die steuerliche Wirkung tritt mit Übergang von Nutzen und Lasten ein.

Eine steuerliche Rückwirkung (§§2,20 UmwStG) ist beim Anteilstausch ausgeschlossen.

---

## Buchwertansatz (§21 Abs.1 S.2 UmwStG)

Voraussetzungen:

✓ Mehrheit der Stimmrechte nach Einbringung

✓ keine weitere Gegenleistung außer neuen Anteilen

---

## Folgen

Erfüllt:

→ Buchwertansatz möglich

Nicht erfüllt:

→ Ansatz zum gemeinen Wert

---

## Merksatz

Anteilstausch = steuerneutral nur über den Buchwertansatz des §21 UmwStG.

`
},
{
  id: "umwstg-einbringungsgewinn-ii-sperrfrist",
  title: "Umwandlungssteuer: Sperrfrist und Einbringungsgewinn II",
  short:
    "Prüfungsschema zum Sperrfristverstoß nach § 22 UmwStG und den steuerlichen Folgen für Einbringenden und übernehmende Kapitalgesellschaft.",
  category: "Umwandlungssteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "umwstg|einbringungsgewinn ii|sperrfrist|§ 22 umwstg|§ 23 umwstg|einbringung|holding|anteilsveräußerung|anschaffungskosten",
  references: [
    "§ 21 UmwStG",
    "§ 22 UmwStG",
    "§ 23 UmwStG",
    "§ 17 EStG",
    "§ 3 Nr. 40 EStG",
    "§ 3c Abs. 2 EStG",
    "§ 8b KStG"
  ],
  body: `

# Sperrfrist nach § 22 UmwStG

## Wann liegt ein Sperrfristverstoß vor?

Ein Sperrfristverstoß liegt vor, wenn

- Anteile unter dem gemeinen Wert eingebracht wurden,
- die erhaltenen Anteile innerhalb der siebenjährigen Sperrfrist veräußert werden,
- die Veräußerung beim Einbringenden steuerpflichtig gewesen wäre.

Rechtsfolge:

Einbringungsgewinn II nach § 22 Abs. 2 UmwStG.

---

## Berechnung

Gemeiner Wert der eingebrachten Anteile

./. angesetzter Einbringungswert

= stille Reserven

./. bereits abgelaufene Siebtel

= Einbringungsgewinn II

---

## Folgen bei der übernehmenden GmbH (§ 23 UmwStG)

Der Einbringungsgewinn II

- erhöht die Anschaffungskosten der Beteiligung,
- führt handelsrechtlich zu einem Ertrag,
- dieser Ertrag ist außerbilanziell wieder zu kürzen.

Merksatz:

Keine Doppelbesteuerung.

---

## Folgen beim Einbringenden

Der Einbringungsgewinn II gilt als nachträgliche Anschaffungskosten der neuen Beteiligung.

Dadurch erhöhen sich die Anschaffungskosten der Holding-Anteile.

Bei einer späteren Veräußerung vermindert sich dadurch der steuerpflichtige Veräußerungsgewinn.

---

## Prüfungsschema

1. Einbringung nach § 21 UmwStG?
2. Buchwert oder Zwischenwert?
3. Sperrfrist von sieben Jahren?
4. Veräußerung innerhalb der Frist?
5. Steuerpflicht beim Einbringenden?
6. Einbringungsgewinn II berechnen.
7. Anschaffungskosten nach § 23 UmwStG erhöhen.

---

## Klausurklassiker

❌ Sperrfrist vergessen.

❌ Anschaffungskosten nicht erhöhen.

❌ Außerbilanzielle Kürzung bei der GmbH vergessen.

---

## Merksatz

Einbringungsgewinn II besteuert nachträglich die bei der Einbringung zunächst aufgeschobenen stillen Reserven.

`
},
{
  id: "npo-wgb-freigrenze-gewinnermittlung-pauschalierung",
  title: "Wirtschaftlicher Geschäftsbetrieb: Freigrenze, Gewinnermittlung und Pauschalierung",
  short:
    "§ 64 AO: 50.000-€-Freigrenze, Gewinnermittlung, 15-%-Pauschalierung und Freibetrag nach § 24 KStG.",
  category: "NPO / Gemeinnützigkeit",
  source: "Interne Steuerstoff-Wissensdatenbank – Gemeinnützigkeit",
  keywords:
    "wirtschaftlicher geschäftsbetrieb|wgb|§ 64 ao|50.000 euro|freigrenze|bruttoeinnahmen|gewinnermittlung|pauschalierung|15 %|sponsoring|werbung|§ 64 abs. 6 ao|§ 24 kstg|freibetrag|körperschaftsteuer",
  references: [
    "§ 64 AO",
    "§ 64 Abs. 3 AO",
    "§ 64 Abs. 6 AO",
    "§ 24 KStG",
    "§ 8 KStG",
    "§ 4 Abs. 4 EStG"
  ],
  body: `

# Wirtschaftlicher Geschäftsbetrieb – Freigrenze, Gewinnermittlung und Pauschalierung

## 1. Freigrenze nach § 64 Abs. 3 AO

Die Vereinfachungsregelung des § 64 Abs. 3 AO stellt ausschließlich auf die **Bruttoeinnahmen** sämtlicher wirtschaftlicher Geschäftsbetriebe ab.

Maßgeblich sind:

- sämtliche Einnahmen
- einschließlich Umsatzsteuer
- unabhängig vom Gewinn

Aktuelle Freigrenze:

**50.000 € Bruttoeinnahmen pro Jahr**

---

### Prüfungsschema

1. Alle Einnahmen sämtlicher wirtschaftlicher Geschäftsbetriebe addieren.
2. Einnahmen ≤ 50.000 €?
   - Ja → keine Körperschaftsteuer und Gewerbesteuer auf den wGB.
   - Nein → Gewinn nach allgemeinen Grundsätzen ermitteln.
3. Anschließend Körperschaftsteuer und ggf. Gewerbesteuer prüfen.

Merksatz:

**Nicht der Gewinn entscheidet, sondern ausschließlich die Bruttoeinnahmen.**

---

## 2. Beispiel

Einnahmen:

- Werbung Homepage: 280 €
- Infostände: 18.300 €
- Verpflegung: 165 €
- Sponsoring: 42.000 €

Gesamteinnahmen:

60.745 €

Ergebnis:

Die Freigrenze von 50.000 € wird überschritten.

Folge:

Die Vereinfachungsregelung greift nicht.

Der Gewinn des wirtschaftlichen Geschäftsbetriebs ist vollständig nach allgemeinen Grundsätzen zu ermitteln.

---

## 3. Gewinnermittlung nach tatsächlichen Kosten

Grundsatz:

Gewinn = Einnahmen − Betriebsausgaben

Beispiel:

Einnahmen:

60.745 €

Ausgaben:

- Löhne: 21.000 €
- Verwaltungskosten: 1.705 €
- Umsatzsteuerzahlungen: 1.800 €

Gewinn:

36.240 €

Abziehbar sind ausschließlich Aufwendungen, die dem wirtschaftlichen Geschäftsbetrieb zugeordnet werden können.

Gemischt veranlasste Kosten sind sachgerecht aufzuteilen.

---

## 4. Gewinnpauschalierung nach § 64 Abs. 6 AO

Für bestimmte Tätigkeiten darf anstelle der tatsächlichen Gewinnermittlung eine Pauschale angewendet werden.

Typische Fälle:

- Sponsoring
- Werbeeinnahmen
- Bandenwerbung
- Anzeigenwerbung
- bestimmte Standflächenüberlassungen

Pauschalgewinn:

15 % der begünstigten Einnahmen

Beispiel:

Werbung:

280 €

Sponsoring:

42.000 €

Pauschalgewinn:

42.280 € × 15 %

= 6.342 €

Wichtig:

Bei Anwendung der Pauschalierung dürfen die tatsächlichen Betriebsausgaben hierfür nicht zusätzlich abgezogen werden.

---

## 5. Freibetrag nach § 24 KStG

Nach der Gewinnermittlung wird der Freibetrag geprüft.

Freibetrag:

5.000 €

Der Freibetrag wird

- pro Körperschaft
- pro Veranlagungszeitraum

gewährt.

Nicht pro wirtschaftlichem Geschäftsbetrieb.

Steuerpflichtiger Gewinn:

Gewinn

− Freibetrag 5.000 €

= steuerpflichtiger Gewinn

---

## Typische Prüfungsreihenfolge

1. Liegt ein wirtschaftlicher Geschäftsbetrieb vor?
2. Bruttoeinnahmen aller wGB addieren.
3. Freigrenze 50.000 € überschritten?
4. Gewinn ermitteln.
5. Tatsächliche Gewinnermittlung oder § 64 Abs. 6 AO prüfen.
6. Freibetrag nach § 24 KStG abziehen.
7. Körperschaftsteuer berechnen.

---

## Klausurklassiker

❌ Freigrenze auf den Gewinn anwenden.

Richtig:

Die 50.000-€-Grenze bezieht sich ausschließlich auf die Bruttoeinnahmen.

---

❌ Tatsächliche Kosten zusätzlich zur 15-%-Pauschale abziehen.

Richtig:

Bei Anwendung des § 64 Abs. 6 AO sind die tatsächlichen Betriebsausgaben für diese Einnahmen bereits abgegolten.

---

## Merksätze

- 50.000 € = Bruttoeinnahmen, nicht Gewinn.
- Erst nach Überschreiten der Freigrenze wird der Gewinn ermittelt.
- § 64 Abs. 6 AO erlaubt für bestimmte Tätigkeiten einen Pauschalgewinn von 15 %.
- Nach der Gewinnermittlung ist der Freibetrag nach § 24 KStG abzuziehen.
- Der Freibetrag gilt je Körperschaft und Veranlagungszeitraum.

`
},
{
  id: "gemeinnuetzige-stiftung-kapitalertragsteuer-vermoegensverwaltung",
  title: "Kapitalertragsteuer bei gemeinnützigen Stiftungen (Vermögensverwaltung)",
  short:
    "Behandlung der Kapitalertragsteuer (KESt) bei steuerfreien gemeinnützigen Stiftungen ohne wirtschaftlichen Geschäftsbetrieb.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "kapitalertragsteuer|kest|gemeinnützige stiftung|vermögensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|§ 44a estg|§ 44b estg|§ 36a estg|körperschaftsteuerbefreiung|eür|steuerfreie vermögensverwaltung",
  references: [
    "§ 5 Abs. 1 Nr. 9 KStG",
    "§ 3 Nr. 6 GewStG",
    "§ 44a EStG",
    "§ 44b EStG",
    "§ 36a EStG"
  ],
  body: `
# Kapitalertragsteuer bei gemeinnützigen Stiftungen

## Grundsatz

Gemeinnützige Stiftungen sind für den ideellen Bereich und die steuerfreie Vermögensverwaltung grundsätzlich von der Körperschaftsteuer und Gewerbesteuer befreit.

Rechtsgrundlagen:

- § 5 Abs. 1 Nr. 9 KStG
- § 3 Nr. 6 GewStG

## Kapitalertragsteuer

Auf Kapitalerträge wird häufig zunächst Kapitalertragsteuer einbehalten.

Dies geschieht insbesondere,

wenn der Bank oder Depotbank die Gemeinnützigkeit nicht rechtzeitig nachgewiesen wurde.

Der Steuerabzug erfolgt nach § 44a EStG.

## Erstattung

Die Stiftung kann die einbehaltene Kapitalertragsteuer auf Antrag zurückerhalten.

Voraussetzungen:

- Nachweis der Gemeinnützigkeit
- Antrag beim zuständigen Finanzamt
- Voraussetzungen der §§ 36a und 44b EStG erfüllt

## Behandlung in der Vermögensverwaltung

Im steuerfreien Bereich der Vermögensverwaltung gilt:

Die einbehaltene Kapitalertragsteuer stellt keine Betriebsausgabe dar.

Ebenso stellt die spätere Erstattung keine steuerpflichtige Einnahme dar.

Die Kapitalertragsteuer beeinflusst deshalb die steuerliche Gewinnermittlung nicht.

## Behandlung in der EÜR

In der Einnahmenüberschussrechnung werden weder

- die Zahlung der Kapitalertragsteuer

noch

- die spätere Erstattung

als Betriebsausgabe oder Betriebseinnahme erfasst.

Es handelt sich lediglich um Vermögensbewegungen.

## Buchungslogik

Steuerfreie Vermögensverwaltung:

Bei Einbehalt der Kapitalertragsteuer:

Sonstige Forderungen
an
Bank

Bei Erstattung:

Bank
an
Sonstige Forderungen

Diese Buchungen betreffen ausschließlich die Vermögensrechnung.

Eine Auswirkung auf die EÜR erfolgt nicht.

## Wirtschaftlicher Geschäftsbetrieb

Anders ist die Behandlung,

wenn Kapitalerträge dem steuerpflichtigen wirtschaftlichen Geschäftsbetrieb zuzurechnen sind.

Dann sind die allgemeinen steuerlichen Vorschriften zu beachten und die Kapitalertragsteuer kann im Rahmen der steuerlichen Gewinnermittlung Bedeutung erlangen.

## Prüfungsschema

1. Liegt eine gemeinnützige Körperschaft vor?

2. Welcher Bereich ist betroffen?

- Ideeller Bereich
- Vermögensverwaltung
- Zweckbetrieb
- Wirtschaftlicher Geschäftsbetrieb

3. Wurde Kapitalertragsteuer einbehalten?

4. Liegt eine Steuerbefreiung nach § 5 Abs. 1 Nr. 9 KStG vor?

5. Kann die Kapitalertragsteuer erstattet werden?

6. Hat die Zahlung Auswirkungen auf die EÜR?

## Rechtsfolgen

Ideeller Bereich:

Keine Betriebsausgabe.

Keine Betriebseinnahme.

Steuerfreie Vermögensverwaltung:

Keine Betriebsausgabe.

Keine Betriebseinnahme.

Nur Vermögensbewegung.

Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb:

Gesonderte steuerliche Prüfung erforderlich.

## Prüfungsmerksätze

Gemeinnützige Stiftung + steuerfreie Vermögensverwaltung

=

KESt ist grundsätzlich erstattungsfähig.

Einbehaltene KESt

=

keine Betriebsausgabe.

Erstattete KESt

=

keine Betriebseinnahme.

Die EÜR bleibt unberührt.

## Klausurtipp

Typische Prüfungsfalle:

Viele buchen die einbehaltene Kapitalertragsteuer als Aufwand.

Das ist im steuerfreien Bereich der Vermögensverwaltung falsch.

Die Kapitalertragsteuer ist lediglich eine Forderung gegenüber dem Finanzamt und wird nach Erstattung wieder ausgeglichen.

Merksatz:

Steuerfreie Vermögensverwaltung

→ KESt nur Vermögensbewegung.

Keine Auswirkung auf den steuerlichen Gewinn.
`
},
{
  id: "abschlagsrechnungen-anzahlungen-unfertige-leistungen",
  title: "Abschlagsrechnungen, Anzahlungen und unfertige Leistungen",
  short:
    "Umsatzsteuerliche und bilanzielle Behandlung von Anzahlungen, Abschlagsrechnungen, Schlussrechnungen und unfertigen Leistungen.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "abschlagsrechnung|teilrechnung|anzahlung|schlussrechnung|unfertige leistungen|unfertige erzeugnisse|herstellungskosten|§ 13 ustg|§ 14 ustg|§ 14c ustg|§ 17 ustg|§ 255 hgb|bestandsveränderungen|gewinnrealisierung|anzahlungen",
  references: [
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 14 Abs. 5 UStG",
    "§ 14c UStG",
    "§ 17 UStG",
    "§ 255 Abs. 2 HGB"
  ],
  body: `
# Abschlagsrechnungen, Anzahlungen und unfertige Leistungen

## Grundsatz

Bei Anzahlungen, Abschlagszahlungen und Teilzahlungen ist zwischen

- Umsatzsteuer,
- Bilanzierung und
- Gewinnrealisierung

zu unterscheiden.

Diese Bereiche folgen unterschiedlichen steuerlichen Grundsätzen.

## Umsatzsteuer bei Anzahlungen

Die Umsatzsteuer entsteht bereits,

wenn

- eine Anzahlung,
- eine Abschlagszahlung oder
- ein Teilentgelt

vereinnahmt wird.

Voraussetzung:

Die zukünftige Leistung muss bereits ausreichend bestimmt sein.

Das bedeutet insbesondere,

- Art der Leistung,
- Umfang der Leistung
- und Leistungsgegenstand

müssen feststehen.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a UStG.

## Abschlagsrechnung

Eine Abschlagsrechnung wird vor vollständiger Leistungserbringung erstellt.

Sie muss eindeutig als

- Abschlagsrechnung,
- Anzahlungsrechnung oder
- Teilrechnung

gekennzeichnet sein.

Außerdem muss die zukünftige Leistung eindeutig beschrieben werden.

Mehrere Abschlagszahlungen dürfen in einer Rechnung zusammengefasst werden.

## Schlussrechnung

Nach vollständiger Leistung wird die Schlussrechnung erstellt.

Dabei müssen

- sämtliche bereits vereinnahmten Anzahlungen,
- Abschlagszahlungen,
- Teilzahlungen
- sowie die darauf entfallende Umsatzsteuer

vom Gesamtbetrag abgesetzt werden.

Dadurch wird verhindert,

dass die Umsatzsteuer doppelt ausgewiesen wird.

Rechtsgrundlage:

§ 14 Abs. 5 UStG.

## Fehlerhafte Schlussrechnung

Werden erhaltene Anzahlungen nicht abgezogen,

kann eine unrichtige Steuer nach § 14c UStG entstehen.

Der Unternehmer schuldet dann den zu hoch ausgewiesenen Steuerbetrag.

## Nicht ausgeführte Leistung

Wird die Leistung später nicht erbracht,

ist die bereits entstandene Umsatzsteuer zu berichtigen.

Rechtsgrundlage:

§ 17 UStG.

## Bilanzierung von Anzahlungen

Bilanzsteuerlich gilt:

Erhaltene Anzahlungen stellen zunächst eine Verbindlichkeit dar.

Sie werden passiviert.

Eine Gewinnrealisierung erfolgt dadurch noch nicht.

## Unfertige Leistungen

Unfertige Leistungen sind zum Bilanzstichtag mit ihren Herstellungskosten zu aktivieren.

Rechtsgrundlage:

§ 255 Abs. 2 HGB.

Zu den Herstellungskosten gehören sämtliche Aufwendungen,

die unmittelbar oder mittelbar für die Herstellung entstanden sind.

## Keine Saldierung

Erhaltene Anzahlungen dürfen nicht mit den unfertigen Leistungen verrechnet werden.

Richtig ist:

Aktivseite:

Unfertige Leistungen

Passivseite:

Erhaltene Anzahlungen

Eine Saldierung ist nach herrschender Meinung unzulässig.

## Bestandsveränderungen

Im Gesamtkostenverfahren werden Bestandsveränderungen der unfertigen Leistungen gesondert ausgewiesen.

Erhaltene Anzahlungen beeinflussen die Bestandsveränderungen nicht.

Sie bleiben erfolgsneutral,

bis die Leistung tatsächlich erbracht wird.

## Gewinnrealisierung

Die Gewinnrealisierung erfolgt grundsätzlich erst,

wenn

- die Leistung erbracht und
- ordnungsgemäß abgerechnet

wurde.

Eine Teilgewinnrealisierung kommt nur bei entsprechender Teilleistung und Abrechnung in Betracht.

## Prüfungsschema

1. Liegt eine Anzahlung oder Abschlagszahlung vor?

2. Ist die zukünftige Leistung bereits eindeutig bestimmt?

3. Wurde das Entgelt bereits vereinnahmt?

→ Umsatzsteuer entsteht.

4. Liegt eine Schlussrechnung vor?

→ Anzahlungen und Umsatzsteuer absetzen.

5. Bilanzstichtag prüfen:

Unfertige Leistungen aktivieren.

Erhaltene Anzahlungen passivieren.

Keine Saldierung.

6. Leistung noch nicht ausgeführt?

→ Keine Gewinnrealisierung.

## Rechtsfolgen

Umsatzsteuer:

Entsteht bereits bei Vereinnahmung der Anzahlung.

Bilanz:

Unfertige Leistungen werden aktiviert.

Anzahlungen werden passiviert.

Gewinn:

Erst mit Leistungserbringung und Abrechnung.

## Prüfungsmerksätze

Anzahlung

≠ Gewinn.

Anzahlung

= Umsatzsteuer entsteht.

Unfertige Leistungen

= Aktivposten.

Erhaltene Anzahlungen

= Passivposten.

Keine Saldierung.

Schlussrechnung:

Anzahlungen und Umsatzsteuer müssen abgesetzt werden.

## Klausurtipp

Typische Prüfungsfallen:

- Umsatzsteuer mit Gewinnrealisierung verwechseln.
- Anzahlungen von den Herstellungskosten abziehen.
- Unfertige Leistungen und Anzahlungen saldieren.
- Anzahlungen in der Schlussrechnung vergessen.

Merksatz:

Umsatzsteuer folgt dem Geldfluss.

Gewinn folgt der Leistung.

Bilanz:

Unfertige Leistungen aktiv,

Anzahlungen passiv.
`
},
{
  id: "vereinsfahrzeug-fahrtenbuch-gemeinnuetzigkeit",
  title: "Vereinsfahrzeug: Fahrtenbuch und Nachweispflichten",
  short:
    "Nachweis der gemeinnützigen Nutzung eines Vereinsfahrzeugs, Alternativen zum Fahrtenbuch und steuerliche Folgen fehlender Dokumentation.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "vereinsfahrzeug|fahrtenbuch|gemeinnützigkeit|pkw|ehrenamt|mittelverwendung|fahrzeug|nutzung|schätzung|bfh|verdeckte gewinnausschüttung|privatnutzung|fahrten",
  references: [
    "§§ 51 ff. AO",
    "§ 55 AO",
    "BFH-Rechtsprechung zur Nachweispflicht bei Fahrzeugnutzung"
  ],
  body: `
# Vereinsfahrzeug und Fahrtenbuch

## Grundsatz

Besitzt ein gemeinnütziger Verein einen PKW,

muss der Verein die ordnungsgemäße und satzungsgemäße Mittelverwendung nachweisen.

Hierzu gehört insbesondere der Nachweis,

dass das Fahrzeug überwiegend oder ausschließlich für gemeinnützige Zwecke genutzt wird.

## Fahrtenbuch

Ein Fahrtenbuch ist das klassische Nachweismittel.

Es wird von der Finanzverwaltung bevorzugt.

Ein Fahrtenbuch ist jedoch gesetzlich nicht zwingend vorgeschrieben.

## Alternative Nachweise

Der Nachweis kann auch durch andere geeignete Unterlagen geführt werden.

Beispiele:

- repräsentative Fahrtenaufzeichnungen
- Einsatzpläne
- Terminlisten
- Vereinskalender
- schriftliche Anweisungen
- Dokumentation der Nutzer
- Protokolle über Vereinsveranstaltungen

Entscheidend ist,

dass die tatsächliche Nutzung nachvollziehbar dokumentiert werden kann.

## Dokumentationspflicht

Aus den Unterlagen sollte insbesondere hervorgehen:

- Fahrer
- Fahrtzweck
- Ziel
- Datum
- gefahrene Strecke
- Zusammenhang mit dem Satzungszweck

Je vollständiger die Dokumentation,

desto geringer ist das Risiko steuerlicher Beanstandungen.

## Ehrenamtliche Nutzung

Wird das Fahrzeug ausschließlich von ehrenamtlich Tätigen genutzt,

empfiehlt sich ebenfalls eine schriftliche Dokumentation.

Auch hierbei genügt grundsätzlich eine nachvollziehbare Aufzeichnung,

wenn sie die tatsächliche Nutzung ausreichend belegt.

## Fehlende Nachweise

Kann der Verein die Nutzung nicht nachweisen,

ist die Finanzverwaltung berechtigt,

den privaten Nutzungsanteil zu schätzen.

Ohne geeignete Nachweise wird häufig mindestens ein privater Nutzungsanteil von 50 % angenommen,

soweit sich aus den Umständen nichts anderes ergibt.

## Steuerliche Folgen

Eine fehlerhafte oder fehlende Dokumentation kann insbesondere folgende Folgen haben:

- Schätzung der Privatnutzung
- verdeckte Gewinnausschüttung bei Vorteilen zugunsten von Mitgliedern
- unzulässige Mittelverwendung
- Gefährdung der Gemeinnützigkeit
- steuerliche Mehrbelastungen

## Prüfungsschema

1. Gehört der PKW zum Vereinsvermögen?

2. Erfolgt die Nutzung ausschließlich oder überwiegend für gemeinnützige Zwecke?

3. Liegt ein Fahrtenbuch vor?

4. Falls nein:

Gibt es andere geeignete Nachweise?

5. Ist die Nutzung ausreichend dokumentiert?

6. Kann eine private Nutzung ausgeschlossen oder nachvollziehbar abgegrenzt werden?

## Rechtsfolgen

Ordnungsgemäße Dokumentation:

Keine Beanstandung.

Unzureichende Dokumentation:

Schätzung der Privatnutzung möglich.

Dadurch können steuerliche Nachteile entstehen.

## Prüfungsmerksätze

Ein Fahrtenbuch ist nicht zwingend vorgeschrieben.

Andere geeignete Nachweise sind zulässig.

Entscheidend ist die Nachvollziehbarkeit der Fahrzeugnutzung.

Ohne Nachweise darf die Finanzverwaltung schätzen.

Die Dokumentation dient dem Nachweis der ordnungsgemäßen Mittelverwendung.

## Klausurtipp

Typische Prüfungsfalle:

Viele glauben,

dass ausschließlich ein Fahrtenbuch zulässig ist.

Das ist falsch.

Der BFH akzeptiert auch andere geeignete Nachweise,

wenn die Fahrzeugnutzung vollständig und nachvollziehbar dokumentiert wird.

Merksatz:

Nicht das Fahrtenbuch ist entscheidend,

sondern der lückenlose Nachweis der gemeinnützigen Nutzung.
`
},
{
  id: "tagesmuetter-gewinnermittlung-pauschalen",
  title: "Tagesmütter: Gewinnermittlung, Betriebsausgabenpauschale und Kleinunternehmerregelung",
  short:
    "Steuerliche Behandlung von Tagesmüttern: Betriebsausgabenpauschalen, Freihalteplätze und umsatzsteuerliche Kleinunternehmerregelung.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "tagesmutter|kindertagespflege|betriebsausgabenpauschale|freihalteplatz|kleinunternehmer|§ 19 ustg|§ 18 estg|gewinnermittlung|eür|umsatzsteuer|bmf 2023",
  references: [
    "§ 18 EStG",
    "§ 19 UStG",
    "BMF-Schreiben vom 06.04.2023 (BStBl. I 2023, 669)"
  ],
  body: `
# Tagesmütter – Einkommensteuer und Umsatzsteuer

## Grundsatz

Tagesmütter erzielen ihre Einkünfte regelmäßig aus selbständiger Arbeit (§ 18 EStG).

Der Gewinn wird grundsätzlich durch Einnahmenüberschussrechnung (EÜR) ermittelt.

Für typische Aufwendungen kann die Betriebsausgabenpauschale der Finanzverwaltung genutzt werden.

## Betriebsausgabenpauschale

Für tatsächlich belegte Betreuungsplätze gilt grundsätzlich:

400 Euro Betriebsausgaben je betreutem Kind und Monat

bei einer Betreuungszeit von 40 Stunden pro Woche.

Bei geringerer Betreuungszeit ist die Pauschale zeitanteilig zu kürzen.

Die Pauschale ersetzt den Einzelnachweis der gewöhnlichen Betriebsausgaben.

Der Nachweis höherer tatsächlicher Betriebsausgaben bleibt möglich.

## Freihalteplätze

Freihalteplätze sind Plätze,

die für Kinder reserviert werden,

vorübergehend jedoch nicht belegt sind.

Erhält die Tagesmutter hierfür Zahlungen,

kann aus Vereinfachungsgründen eine Betriebsausgabenpauschale angesetzt werden.

Pauschale:

50 Euro je Freihalteplatz und Monat.

Diese Pauschale kann jedoch höchstens bis zur Höhe der hierfür erhaltenen Einnahmen berücksichtigt werden.

Sind die tatsächlichen Aufwendungen höher,

können diese durch Einzelnachweis geltend gemacht werden.

## Nachweis tatsächlicher Betriebsausgaben

Die Betriebsausgabenpauschale ist nicht verpflichtend.

Stattdessen können sämtliche tatsächlichen Betriebsausgaben angesetzt werden,

wenn diese vollständig nachgewiesen werden.

Dies kann insbesondere sinnvoll sein,

wenn außergewöhnlich hohe Aufwendungen entstanden sind.

## Umsatzsteuer

Für Tagesmütter gelten grundsätzlich die allgemeinen Vorschriften des Umsatzsteuergesetzes.

Seit 2025 gilt:

Im Gründungsjahr erfolgt keine Hochrechnung des Jahresumsatzes mehr.

Maßgeblich ist ausschließlich der tatsächlich erzielte Umsatz.

Die Kleinunternehmerregelung nach § 19 UStG kann angewendet werden,

wenn die gesetzlichen Umsatzgrenzen eingehalten werden.

Nach aktuellem Gesetzesstand beträgt die maßgebliche Umsatzgrenze:

100.000 Euro.

Wird diese Grenze im laufenden Kalenderjahr überschritten,

unterliegen die Umsätze ab diesem Zeitpunkt der Regelbesteuerung.

## Prüfungsschema

1. Liegt eine selbständige Kindertagespflege vor?

2. Gewinnermittlung nach § 18 EStG?

3. Betriebsausgabenpauschale oder Einzelnachweis?

4. Tatsächlich belegte Plätze oder Freihalteplätze?

5. Kleinunternehmerregelung nach § 19 UStG prüfen.

6. Umsatzgrenze eingehalten?

## Rechtsfolgen

Belegte Plätze:

400 Euro Betriebsausgabenpauschale je Kind und Monat
(bei 40 Wochenstunden).

Freihalteplätze:

50 Euro Betriebsausgabenpauschale je Platz und Monat,

höchstens bis zur Höhe der hierfür gezahlten Einnahmen.

Alternativ:

Einzelnachweis der tatsächlichen Betriebsausgaben.

## Prüfungsmerksätze

Tagesmütter erzielen regelmäßig Einkünfte nach § 18 EStG.

Die Betriebsausgabenpauschale ist ein Wahlrecht.

Für belegte Plätze gilt grundsätzlich die höhere Pauschale.

Für Freihalteplätze gilt eine gesonderte Pauschale von 50 Euro je Monat.

Die tatsächlichen Betriebsausgaben können jederzeit durch Einzelnachweis geltend gemacht werden.

## Klausurtipp

Typische Prüfungsfallen:

- Freihalteplätze werden häufig mit belegten Plätzen verwechselt.
- Die 400-Euro-Pauschale gilt grundsätzlich nur für tatsächlich belegte Betreuungsplätze.
- Für Freihalteplätze gilt lediglich die 50-Euro-Pauschale und auch nur, soweit hierfür Einnahmen erzielt werden.
- Die Betriebsausgabenpauschale ist kein Zwang – der Einzelnachweis bleibt immer möglich.

Merksatz:

Belegter Platz = 400 Euro.

Freihalteplatz = 50 Euro.

Höhere tatsächliche Kosten = Einzelnachweis.
`
},
{
  id: "altersvorsorgedepot-ab-2027",
  title: "Altersvorsorgedepot ab 2027",
  short:
    "Geplantes steuerlich gefördertes Altersvorsorgedepot als Nachfolgemodell der Riester-Rente.",
  category: "Aktuelles Steuerrecht",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "altersvorsorgedepot|riester|sonderausgaben|zulagen|wertpapierdepot|nachgelagerte besteuerung|altersvorsorgereform",
  references: [
    "Altersvorsorgereformgesetz 2026"
  ],
  body: `
# Altersvorsorgedepot

## Hinweis

Dieser Eintrag gibt den derzeitigen Gesetzesstand wieder.

Vor Anwendung in der Praxis sind stets aktuelle Gesetzesänderungen und BMF-Schreiben zu prüfen.

## Grundidee

Ab 2027 soll ein steuerlich gefördertes Altersvorsorgedepot eingeführt werden.

Es soll langfristige Wertpapieranlagen fördern und die bisherige Riester-Förderung ersetzen.

## Förderung

Geplant sind insbesondere:

- Sonderausgabenabzug
- staatliche Zulagen
- nachgelagerte Besteuerung

## Voraussetzungen

- zertifiziertes Altersvorsorgedepot
- Eigenbeiträge
- förderberechtigter Personenkreis
- gesetzliche Anforderungen an das Produkt

## Besteuerung

Während der Ansparphase:

steuerliche Förderung.

Während der Auszahlungsphase:

nachgelagerte Besteuerung.

## Prüfungsmerksatz

Aktuelles Steuerrecht.

Vor jeder steuerlichen Beratung den neuesten Gesetzesstand prüfen.
`
},
{
  id: "familienstiftung-freibetrag-24-kstg",
  title: "Familienstiftung und Freibetrag nach § 24 KStG",
  short:
    "Voraussetzungen und Ausschluss des Freibetrags nach § 24 KStG bei Familienstiftungen sowie Abgrenzung zu § 20 Abs. 1 Nr. 1 und 2 EStG.",
  category: "Körperschaftsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "familienstiftung|§ 24 kstg|freibetrag|§ 20 estg|kapitalvermögen|gewinnausschüttung|vermögensverwaltung|stiftung|kapitalgesellschaft|verdeckte gewinnausschüttung|liquidation|steuerliches einlagekonto",
  references: [
    "§ 24 KStG",
    "§ 20 Abs. 1 Nr. 1 EStG",
    "§ 20 Abs. 1 Nr. 2 EStG",
    "§ 27 KStG"
  ],
  body: `
# Freibetrag nach § 24 KStG bei Familienstiftungen

## Grundsatz

Körperschaften können unter den Voraussetzungen des § 24 KStG einen Freibetrag erhalten.

Für Familienstiftungen gilt jedoch eine wichtige Ausnahme.

Der Freibetrag wird nicht gewährt,

wenn die Leistungen der Stiftung ihrer Art nach beim Empfänger zu Einnahmen nach § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG führen können.

Dabei ist unerheblich,

ob tatsächlich Ausschüttungen vorgenommen wurden.

Entscheidend ist allein,

dass die Stiftung solche Leistungen nach ihrer Satzung oder ihrer Rechtsnatur grundsätzlich erbringen kann.

## Ausschluss des Freibetrags

Der Freibetrag ist ausgeschlossen,

wenn die Stiftung Leistungen erbringen kann,

die beim Empfänger als Einkünfte aus Kapitalvermögen gelten würden.

Nicht erforderlich ist,

dass im betreffenden Wirtschaftsjahr tatsächlich Ausschüttungen erfolgen.

Auch eine satzungsmäßige Ausschüttungssperre oder die bloße Nichtausschüttung ändern daran grundsätzlich nichts.

## Prüfungsschema

1. Liegt eine Körperschaft vor?

2. Handelt es sich um eine Familienstiftung?

3. Können Leistungen an Begünstigte erfolgen?

4. Würden diese Leistungen beim Empfänger unter § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG fallen?

5. Wenn ja:

=> Freibetrag nach § 24 KStG ausgeschlossen.

## Einnahmen nach § 20 Abs. 1 Nr. 1 EStG

Hierzu gehören insbesondere:

- Dividenden einer GmbH
- Dividenden einer AG
- Ausschüttungen von Genossenschaften
- verdeckte Gewinnausschüttungen
- wirtschaftlich vergleichbare Ausschüttungen

## Einnahmen nach § 20 Abs. 1 Nr. 2 EStG

Hierzu gehören insbesondere:

- Auflösungsgewinne nach Liquidation einer Kapitalgesellschaft
- Leistungen im Zusammenhang mit Kapitalherabsetzungen

Soweit keine Rückzahlung von

- Nennkapital oder
- steuerlichem Einlagekonto (§ 27 KStG)

vorliegt.

## Nicht unter § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG fallen

- Rückzahlung des Stammkapitals
- Rückzahlung des Grundkapitals
- Rückzahlung aus dem steuerlichen Einlagekonto (§ 27 KStG)
- Leistungen ohne kapitalmäßige Beteiligung
- Leistungen bestimmter steuerbefreiter Körperschaften ohne Ausschüttungsmöglichkeit

## Meinungsstand

Finanzverwaltung,

Literatur

und

Rechtsprechung

vertreten übereinstimmend,

dass § 24 Satz 2 KStG generalisierend auszulegen ist.

Maßgeblich ist nicht,

ob tatsächlich ausgeschüttet wird,

sondern

ob Ausschüttungen ihrer Art nach zu Einnahmen nach § 20 EStG führen können.

## Rechtsfolge

Sind Leistungen grundsätzlich geeignet,

Einnahmen nach § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG auszulösen,

steht der Freibetrag nach § 24 KStG nicht zu.

Dies gilt auch,

wenn

- keine Ausschüttungen erfolgen,
- Ausschüttungen dauerhaft unterbleiben,
- die Stiftung ausschließlich Vermögensverwaltung betreibt.

## Prüfungsmerksätze

Nicht die tatsächliche Ausschüttung ist entscheidend.

Entscheidend ist die grundsätzliche Möglichkeit einer Ausschüttung.

§ 24 KStG knüpft an die Art der möglichen Leistungen an.

## Klausurtipp

Typische Prüfungsfalle:

Viele prüfen nur,

ob tatsächlich Ausschüttungen erfolgt sind.

Das genügt nicht.

In der Klausur ist immer zu prüfen,

ob die Stiftung ihrer Rechtsform und Satzung nach überhaupt Leistungen erbringen kann,

die beim Empfänger unter § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG fallen würden.

Merksatz:

Möglichkeit der Ausschüttung genügt.

Die tatsächliche Ausschüttung ist nicht erforderlich.
`
},
{
  id: "vga-gemeinnuetziger-verein",
  title: "Verdeckte Gewinnausschüttung (vGA) bei gemeinnützigen Vereinen",
  short:
    "Voraussetzungen, Fremdvergleich und typische Fälle verdeckter Gewinnausschüttungen bei gemeinnützigen Vereinen.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "vga|verdeckte gewinnausschüttung|gemeinnütziger verein|§ 8 abs. 3 kstg|fremdvergleich|unangemessene vergütung|aufwandsentschädigung|mitglied|vorstand|nahestehende person|gemeinnützigkeit",
  references: [
    "§ 8 Abs. 3 Satz 2 KStG",
    "§§ 51 ff. AO"
  ],
  body: `
# Verdeckte Gewinnausschüttung (vGA) bei gemeinnützigen Vereinen

## Grundsatz

Auch bei gemeinnützigen Vereinen können verdeckte Gewinnausschüttungen (vGA) vorliegen.

Dabei ist unerheblich,

dass ein Verein keine klassischen Gewinnausschüttungen wie eine Kapitalgesellschaft vornimmt.

Entscheidend ist,

ob Vereinsvermögen einem Mitglied oder einer nahestehenden Person ohne angemessene Gegenleistung zugewendet wird.

## Gesetzliche Grundlage

Rechtsgrundlage:

§ 8 Abs. 3 Satz 2 KStG

Eine verdeckte Gewinnausschüttung liegt vor,

wenn

- das Vermögen der Körperschaft gemindert wird oder
- eine Vermögensmehrung verhindert wird,

und

diese Vermögensminderung durch das Mitgliedschaftsverhältnis veranlasst ist.

## Keine Vereinbarung erforderlich

Für die Annahme einer vGA ist keine schriftliche oder mündliche Vereinbarung erforderlich.

Auch ohne Vertrag kann eine verdeckte Gewinnausschüttung vorliegen.

Maßgeblich ist allein,

ob der Vorteil aufgrund des Mitgliedschaftsverhältnisses gewährt wurde.

## Fremdvergleich

Entscheidend ist der Fremdvergleich.

Frage:

Hätte ein ordentlicher und gewissenhafter Geschäftsleiter denselben Vorteil auch einem fremden Dritten eingeräumt?

Wenn nein,

spricht dies für eine verdeckte Gewinnausschüttung.

## Typische Fälle

Eine vGA kann insbesondere vorliegen bei

- unangemessen hohen Tätigkeitsvergütungen,
- überhöhten Aufwandsentschädigungen,
- unentgeltlicher Überlassung von Vereinsvermögen,
- verbilligten Darlehen,
- Erlass von Forderungen gegenüber Mitgliedern,
- sonstigen Vermögensvorteilen zugunsten von Mitgliedern oder nahestehenden Personen.

## Gemeinnützigkeitsrecht

Neben den körperschaftsteuerlichen Folgen kann eine vGA auch gegen das Gemeinnützigkeitsrecht verstoßen.

Unzulässige Begünstigungen von Mitgliedern widersprechen dem Grundsatz der Selbstlosigkeit (§ 55 AO).

Dadurch kann die Gemeinnützigkeit gefährdet werden.

## Prüfungsschema

1. Liegt eine Vermögensminderung oder verhinderte Vermögensmehrung vor?

2. Erhält ein Mitglied oder eine nahestehende Person einen Vorteil?

3. Ist der Vorteil gesellschafts- bzw. mitgliedschaftlich veranlasst?

4. Hält der Vorteil dem Fremdvergleich stand?

5. Liegt eine angemessene Gegenleistung vor?

6. Ergebnis:

Verdeckte Gewinnausschüttung ja oder nein.

## Rechtsfolgen

Liegt eine vGA vor,

ist der Aufwand steuerlich nicht abzugsfähig.

Außerdem können

- Körperschaftsteuer,
- Gemeinnützigkeitsrecht
- und gegebenenfalls Haftungsfragen

betroffen sein.

## Prüfungsmerksätze

Eine schriftliche Vereinbarung ist nicht erforderlich.

Entscheidend ist der Fremdvergleich.

Nicht jede Zahlung an ein Mitglied ist eine vGA.

Unangemessene Vorteile können jedoch eine vGA darstellen.

Auch gemeinnützige Vereine können verdeckte Gewinnausschüttungen vornehmen.

## Klausurtipp

Typische Prüfungsfalle:

Viele gehen davon aus,

dass Vereine keine verdeckten Gewinnausschüttungen haben können,

weil sie keine Gewinne ausschütten.

Das ist falsch.

Auch bei gemeinnützigen Vereinen kann eine vGA vorliegen,

wenn Mitglieder oder nahestehende Personen unangemessene Vermögensvorteile erhalten.

Merksatz:

Nicht die Rechtsform entscheidet,

sondern die unangemessene Begünstigung eines Mitglieds.
`
},
{
  id: "zweitwohnsitz-doppelte-haushaltsfuehrung",
  title: "Zweitwohnsitz und doppelte Haushaltsführung",
  short:
    "Steuerliche Folgen eines Zweitwohnsitzes bei Einkommensteuer, Erbschaftsteuer und Zweitwohnungsteuer.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "zweitwohnsitz|doppelte haushaltsführung|betriebsausgaben|werbungskosten|betriebsstätte|erbschaftsteuer|zweitwohnungsteuer",
  references: [
    "§ 4 EStG",
    "§ 9 EStG",
    "§ 2 ErbStG"
  ],
  body: `
# Zweitwohnsitz

## Einkommensteuer

Eine doppelte Haushaltsführung setzt voraus:

- Hauptwohnsitz bleibt bestehen.
- Zweitwohnung wird beruflich genutzt.
- berufliche Veranlassung liegt vor.

Dann können Aufwendungen steuerlich abzugsfähig sein.

## Private Gründe

Wird der Zweitwohnsitz ausschließlich aus privaten Gründen (z. B. bei einer Tante) begründet,

liegt keine doppelte Haushaltsführung vor.

Die Kosten sind dann grundsätzlich nicht abzugsfähig.

## Betriebsstätte

Besteht am Zweitwohnsitz eine weitere Betriebsstätte,

können Fahrten zwischen den Betriebsstätten Betriebsausgaben sein.

## Erbschaftsteuer

Der Wohnsitz beeinflusst die Steuerpflicht.

Unbeschränkte Steuerpflicht:

Wohnsitz im Inland.

Beschränkte Steuerpflicht:

kein Wohnsitz im Inland.

## Zweitwohnungsteuer

Kommunale Aufwandsteuer.

Unabhängig vom Verwandtschaftsverhältnis.

## Prüfungsmerksatz

Beruflicher Zweitwohnsitz:

mögliche doppelte Haushaltsführung.

Privater Zweitwohnsitz:

regelmäßig kein Werbungskosten- oder Betriebsausgabenabzug.
`
},
{
  id: "erwachsenenadoption-erbschaftsteuer",
  title: "Erwachsenenadoption und Erbschaftsteuer",
  short:
    "Steuerliche Folgen der schwachen Erwachsenenadoption bei der Erbschaft- und Schenkungsteuer.",
  category: "Erbschaftsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "erwachsenenadoption|schwache adoption|§ 1772 bgb|erbStG|§ 15 erbStG|steuerklasse I|adoptivkind|freibetrag|schenkungsteuer|erbschaftsteuer",
  references: [
    "§ 1772 BGB",
    "§ 15 Abs. 1 ErbStG",
    "§ 15 Abs. 1a ErbStG",
    "BFH II R 46/08"
  ],
  body: `
# Schwache Erwachsenenadoption

## Grundsatz

Bei der schwachen Erwachsenenadoption bleibt das Verwandtschaftsverhältnis zu den leiblichen Eltern bestehen.

Steuerlich wird der Adoptierte dennoch gegenüber dem Adoptierenden wie ein leibliches Kind behandelt.

## Erbschaftsteuer

Der Adoptierte gehört gegenüber dem Adoptierenden zur Steuerklasse I.

Dies gilt auch bei einer Erwachsenenadoption.

Folgen:

- Steuerklasse I
- Freibetrag wie Kind
- günstigere Steuersätze

## Leibliche Eltern

Auch gegenüber den leiblichen Eltern bleibt die Steuerklasse I bestehen.

Die Adoption führt insoweit zu keinem Verlust der steuerlichen Begünstigungen.

## Einkommensteuer

Die Erwachsenenadoption hat grundsätzlich keine unmittelbaren Auswirkungen auf die Einkommensteuer.

## Prüfungsschema

1. Liegt eine Erwachsenenadoption vor?

2. Schwache oder starke Adoption?

3. Erb- oder Schenkungsfall?

4. Steuerklasse nach § 15 ErbStG bestimmen.

## Prüfungsmerksatz

Erwachsenenadoption:

Erbschaftsteuerlich Kind.

Ertragsteuerlich grundsätzlich ohne Bedeutung.
`
},
{
  id: "zinsloses-darlehen-gemeinnuetziger-verein",
  title: "Zinsloses Darlehen an einen gemeinnützigen Verein",
  short:
    "Zivilrechtliche und steuerliche Behandlung zinsloser Darlehen, Rückzahlung, Darlehensverzicht und Gemeinnützigkeitsrecht.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "zinsloses darlehen|gemeinnütziger verein|verein|gemeinnützigkeit|§ 488 bgb|§ 51 ao|darlehensverzicht|spende|freigebige zuwendung|fremdvergleich|verbindlichkeit|ausland|thailand|darlehensgeber|schenkungsteuer",
  references: [
    "§ 488 BGB",
    "§ 51 AO",
    "§§ 52 ff. AO"
  ],
  body: `
# Zinsloses Darlehen an einen gemeinnützigen Verein

## Grundsatz

Ein Darlehen kann auch ohne Verzinsung wirksam vereinbart werden.

Die fehlende Verzinsung berührt die Wirksamkeit des Darlehensvertrages nach § 488 BGB nicht.

Die Rückzahlungsverpflichtung bleibt bestehen.

## Zivilrecht

Nach § 488 BGB verpflichtet sich der Darlehensnehmer,

- den Darlehensbetrag zurückzuzahlen,
- unabhängig davon, ob Zinsen vereinbart wurden.

Ein zinsloses Darlehen ist zivilrechtlich zulässig.

## Steuerliche Prüfung

Bei gemeinnützigen Vereinen ist zusätzlich zu prüfen,

- ob der Fremdvergleich eingehalten wird,
- ob eine unzulässige Begünstigung vorliegt,
- ob die Mittelverwendung weiterhin gemeinnützig ist.

Die Vereinbarung sollte schriftlich erfolgen und tatsächlich durchgeführt werden.

## Rückzahlung ins Ausland

Die Rückzahlung eines Darlehens an einen Darlehensgeber im Ausland ist grundsätzlich zulässig.

Beispiel:

Rückzahlung nach Thailand.

Voraussetzung:

Die Auszahlung darf die Gemeinnützigkeit nicht gefährden.

Nach § 51 Abs. 2 AO können Mittel auch ins Ausland fließen, wenn die gemeinnützigkeitsrechtlichen Voraussetzungen erfüllt werden.

## Darlehensverzicht

Verzichtet der Darlehensgeber auf die Rückzahlung,

bleibt der Betrag nicht einfach steuerfrei.

Je nach Sachverhalt kann vorliegen:

- freigebige Zuwendung,
- Spende,
- schenkungsteuerlicher Vorgang.

Außerdem ist zu prüfen,

ob eine unzulässige Begünstigung vorliegt.

Besonders kritisch sind Darlehen von

- Vereinsmitgliedern,
- Vorständen,
- nahestehenden Personen.

## Fremdvergleich

Bei Darlehen zwischen Verein und nahestehenden Personen gilt der Fremdvergleich.

Zu prüfen ist insbesondere:

- schriftlicher Vertrag,
- klare Rückzahlungsvereinbarung,
- tatsächliche Durchführung,
- angemessene Vertragsbedingungen.

Nur fremdübliche Vereinbarungen werden steuerlich anerkannt.

## Kein Kontakt zum Darlehensgeber

Ist der Darlehensgeber nicht mehr erreichbar,

bleibt die Rückzahlungsverpflichtung grundsätzlich bestehen.

Das Darlehen ist weiterhin als Verbindlichkeit auszuweisen.

Eine Ausbuchung ist erst zulässig,

wenn ausreichend nachgewiesen werden kann,

dass die Forderung endgültig nicht mehr besteht oder uneinbringlich geworden ist.

Eine bloße Nichterreichbarkeit genügt hierfür regelmäßig nicht.

## Bilanzielle Behandlung

Bis zur endgültigen Klärung:

Passivierung der Verbindlichkeit.

Erst bei Wegfall der Verpflichtung:

Prüfung einer gewinnerhöhenden Auflösung der Verbindlichkeit.

Dabei sind zusätzlich die gemeinnützigkeitsrechtlichen Folgen zu prüfen.

## Prüfungsschema

1. Liegt ein wirksamer Darlehensvertrag nach § 488 BGB vor?

2. Ist das Darlehen verzinslich oder zinslos?

3. Wurde ein schriftlicher Vertrag abgeschlossen?

4. Entspricht die Vereinbarung dem Fremdvergleich?

5. Liegt eine Rückzahlung, ein Darlehensverzicht oder eine Ausbuchung vor?

6. Werden die Gemeinnützigkeitsvorschriften (§§ 51 ff. AO) eingehalten?

7. Sind steuerliche Folgen (Spende, Schenkungsteuer oder Gewinnrealisierung) zu prüfen?

## Rechtsfolgen

Zinsloses Darlehen:
Zivilrechtlich wirksam.

Rückzahlung:
Grundsätzlich jederzeit möglich, auch ins Ausland.

Verzicht:
Steuerlich gesondert zu würdigen.

Kein Kontakt:
Verbindlichkeit bleibt bestehen.

Ausbuchung:
Erst bei endgültigem Wegfall der Rückzahlungsverpflichtung zulässig.

## Prüfungsmerksätze

Ein zinsloses Darlehen ist zivilrechtlich wirksam.

Die Rückzahlungsverpflichtung entfällt nicht wegen fehlender Verzinsung.

Bei gemeinnützigen Vereinen ist immer der Fremdvergleich zu prüfen.

Darlehensverzicht kann steuerliche Folgen auslösen.

Eine bloße Nichterreichbarkeit des Darlehensgebers berechtigt nicht zur Ausbuchung.

## Klausurtipp

Typische Prüfungsfalle:

Viele gehen davon aus, dass ein zinsloses Darlehen automatisch eine Spende oder verdeckte Einlage darstellt.

Das ist falsch.

Zunächst bleibt ein zinsloses Darlehen ein ganz normales Darlehen mit Rückzahlungsverpflichtung.

Steuerliche Folgen entstehen erst durch besondere Umstände, z. B. einen Darlehensverzicht, eine unangemessene Gestaltung oder eine unzulässige Begünstigung.
`
},
{
  id: "reisekosten-dienstreise-steuerfreie-erstattung-verpflegungspauschalen",
  title: "Reisekosten: steuerfreie Erstattung und Verpflegungspauschalen",
  short:
    "Steuerfreie Reisekostenerstattung nach § 3 Nr. 16 EStG, Belegpflichten, Buchungslogik und Verpflegungsmehraufwand bei Auswärtstätigkeiten.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "reisekosten|dienstreise|auswärtstätigkeit|verpflegungsmehraufwand|verpflegungspauschale|reisekostenerstattung|steuerfreie erstattung|§ 3 nr. 16 estg|§ 9 estg|werbungskosten|lohnkonto|belege|arbeitgebererstattung|übernachtungskosten|fahrtkosten|reisenebenkosten|brüssel|belgien|mahlzeitenkürzung",
  references: [
    "§ 3 Nr. 16 EStG",
    "§ 9 EStG",
    "LStR / LStH Reisekosten",
    "BMF-Schreiben zu Auslandsreisekosten"
  ],
  body: `
# Reisekosten: steuerfreie Erstattung und Verpflegungspauschalen

## 1. Steuerfreie Reisekostenerstattung durch den Arbeitgeber

Erstattet der Arbeitgeber seinem Arbeitnehmer anlässlich einer beruflich veranlassten Auswärtstätigkeit die tatsächlichen Reisekosten, kann diese Erstattung nach § 3 Nr. 16 EStG steuerfrei sein.

Steuerfrei erstattungsfähig sind insbesondere:
- Fahrtkosten
- Übernachtungskosten
- Reisenebenkosten
- Verpflegungsmehraufwendungen im Rahmen der gesetzlichen Pauschalen

Die Steuerfreiheit gilt nur, soweit die Erstattung die nach § 9 EStG als Werbungskosten abziehbaren Aufwendungen nicht übersteigt.

## 2. Voraussetzungen für die Steuerfreiheit

Die Erstattung bleibt steuerfrei, wenn:

1. eine beruflich veranlasste Auswärtstätigkeit vorliegt,
2. der Arbeitnehmer die tatsächlichen Aufwendungen nachweist,
3. die Erstattung die tatsächlichen Kosten bzw. gesetzlichen Pauschalen nicht übersteigt,
4. der Arbeitgeber die Belege zum Lohnkonto nimmt.

Wichtig:
Ohne ausreichende Nachweise besteht das Risiko, dass die Erstattung als steuerpflichtiger Arbeitslohn behandelt wird.

## 3. Buchhalterische Behandlung

Die steuerfreie Erstattung ist als Reisekostenerstattung zu buchen.

Sie ist nicht als steuerpflichtiger Arbeitslohn zu behandeln, solange:
- die Kosten beruflich veranlasst sind,
- die Belege vorliegen,
- die Erstattung nicht höher ist als die tatsächlichen Kosten bzw. zulässigen Pauschalen.

Eine Lohnversteuerung entfällt in diesem Fall.

Übersteigt die Erstattung die tatsächlichen Kosten oder die zulässigen Pauschalen, ist der übersteigende Betrag steuerpflichtiger Arbeitslohn.

## 4. Werbungskostenabzug beim Arbeitnehmer

Soweit der Arbeitgeber Reisekosten steuerfrei erstattet, ist ein Werbungskostenabzug beim Arbeitnehmer ausgeschlossen.

Merksatz:
Steuerfrei erstattet = kein Werbungskostenabzug.

Nur nicht erstattete oder nicht vollständig erstattete berufliche Reisekosten können beim Arbeitnehmer noch als Werbungskosten berücksichtigt werden.

## 5. Verpflegungsmehraufwendungen bei Auswärtstätigkeit

Für Verpflegungsmehraufwendungen werden keine tatsächlichen Kosten angesetzt, sondern gesetzliche Pauschbeträge.

Bei Auslandsreisen gelten länderspezifische Pauschalen, die regelmäßig durch das BMF veröffentlicht werden.

## 6. Zweitägige Dienstreise nach Brüssel

Sachverhalt:
- Hinreise: 04.02.
- Rückreise: 05.02.
- Reiseziel: Brüssel / Belgien
- mehrtägige Auswärtstätigkeit mit Übernachtung

Für Belgien / Brüssel beträgt die angenommene Tagespauschale im Beispiel 64,00 Euro.

Für An- und Abreisetage sind jeweils 80 % der Tagespauschale anzusetzen.

Berechnung:
64,00 Euro x 80 % = 51,20 Euro

Anreisetag 04.02.:
51,20 Euro

Abreisetag 05.02.:
51,20 Euro

Insgesamt:
51,20 Euro + 51,20 Euro = 102,40 Euro

Da die Reise nur zwei Tage dauert, gibt es keinen vollen Zwischentag.

## 7. Kürzung bei gestellten Mahlzeiten

Werden Mahlzeiten vom Arbeitgeber oder auf dessen Veranlassung gestellt, sind die Verpflegungspauschalen zu kürzen.

Kürzung:
- Frühstück: 20 % der vollen Tagespauschale
- Mittagessen: 40 % der vollen Tagespauschale
- Abendessen: 40 % der vollen Tagespauschale

Bei einer Tagespauschale von 64,00 Euro:

Frühstück:
64,00 Euro x 20 % = 12,80 Euro

Mittagessen:
64,00 Euro x 40 % = 25,60 Euro

Abendessen:
64,00 Euro x 40 % = 25,60 Euro

Die Kürzung erfolgt auch an An- und Abreisetagen grundsätzlich anhand der vollen Tagespauschale.

## 8. Steuerfreie Erstattung der Verpflegungspauschalen

Erstattet der Arbeitgeber die Verpflegungspauschalen steuerfrei, ist ein Werbungskostenabzug beim Arbeitnehmer insoweit ausgeschlossen.

Beispiel:
Zulässige Pauschale für Brüssel-Reise:
102,40 Euro

Steuerfreie Erstattung durch Arbeitgeber:
102,40 Euro

Folge:
Kein zusätzlicher Werbungskostenabzug beim Arbeitnehmer.

## 9. Prüfungs-Merksätze

Reisekostenerstattung:
Nach § 3 Nr. 16 EStG steuerfrei, soweit die Erstattung die nach § 9 EStG abziehbaren Werbungskosten nicht übersteigt.

Belegpflicht:
Tatsächliche Kosten müssen nachgewiesen und die Belege zum Lohnkonto genommen werden.

Überzahlung:
Übersteigt die Erstattung die tatsächlichen Kosten oder zulässigen Pauschalen, ist der übersteigende Betrag steuerpflichtiger Arbeitslohn.

Verpflegung:
Für Verpflegung werden Pauschalen angesetzt, keine tatsächlichen Kosten.

Ausland:
Bei Auslandsreisen gelten länderspezifische Pauschbeträge.

Anreise / Abreise:
Bei mehrtägiger Auswärtstätigkeit mit Übernachtung werden An- und Abreisetag jeweils mit 80 % der Tagespauschale angesetzt.

Mahlzeiten:
Gestellte Mahlzeiten kürzen die Pauschale:
Frühstück 20 %, Mittagessen 40 %, Abendessen 40 %.

Werbungskosten:
Steuerfrei vom Arbeitgeber ersetzt = kein Werbungskostenabzug beim Arbeitnehmer.
`
},
{
  id: "betriebsveraeusserung-erbe-16-34-estg",
  title: "Betriebsveräußerung durch Erben (§ 16 Abs. 4 und § 34 Abs. 3 EStG)",
  short:
    "Steuerliche Begünstigungen bei der Veräußerung eines geerbten Betriebs oder Mitunternehmeranteils durch den Erben.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "§ 16 estg|§ 34 estg|betriebsveräußerung|mitunternehmer|erbfall|erbe|freibetrag|tarifermäßigung|außerordentliche einkünfte|praxisverkauf|mitunternehmeranteil",
  references: [
    "§ 16 Abs. 4 EStG",
    "§ 34 Abs. 3 EStG",
    "§ 16 EStG",
    "§ 34 EStG"
  ],
  body: `
# Betriebsveräußerung durch Erben

## Grundsatz

Erwirbt ein Erbe durch Erbfall einen Betrieb oder einen Mitunternehmeranteil und veräußert diesen anschließend, kann er die steuerlichen Begünstigungen nach § 16 Abs. 4 EStG und § 34 Abs. 3 EStG in Anspruch nehmen.

Eine vorherige Mitunternehmerstellung ist nicht erforderlich.

Entscheidend ist, dass der Erbe durch den Erbfall selbst Mitunternehmer wird.

## Freibetrag nach § 16 Abs. 4 EStG

Der Freibetrag kann auch einem Erben zustehen.

Voraussetzungen:

- Erwerb des Betriebs oder Mitunternehmeranteils durch Erbanfall.
- Veräußerung des gesamten Betriebs oder Mitunternehmeranteils.
- Persönliche Voraussetzungen des § 16 Abs. 4 EStG sind erfüllt (z. B. Vollendung des maßgeblichen Lebensalters oder dauernde Berufsunfähigkeit).

Eine frühere Beteiligung am Betrieb ist nicht erforderlich.

## Tarifermäßigung nach § 34 Abs. 3 EStG

Auch die Tarifermäßigung kann vom Erben beansprucht werden.

Voraussetzungen:

- Außerordentliche Einkünfte liegen vor.
- Der Betrieb oder Mitunternehmeranteil wird im Ganzen veräußert.
- Die persönlichen Voraussetzungen des § 34 Abs. 3 EStG sind erfüllt.

Der Erbe wird steuerlich so behandelt, als hätte er den Betrieb selbst veräußert.

## Mitunternehmerstellung des Erben

Mitunternehmer muss der Erbe erst zum Zeitpunkt der Veräußerung sein.

Es ist nicht erforderlich, dass er bereits vor dem Erbfall Mitunternehmer war.

Der Eintritt in die Mitunternehmerstellung erfolgt durch den Erbfall.

## Meinungsstand

Rechtsprechung, Literatur und Finanzverwaltung vertreten übereinstimmend die Auffassung, dass die Begünstigungen auch Erben zustehen.

Eine Beschränkung auf bereits vor dem Erbfall beteiligte Mitunternehmer besteht nicht.

## Prüfungsschema

1. Liegt ein Erbfall vor?

2. Hat der Erbe dadurch einen Betrieb oder Mitunternehmeranteil erworben?

3. Wird der Betrieb oder Mitunternehmeranteil im Ganzen veräußert?

4. Liegen die persönlichen Voraussetzungen des § 16 Abs. 4 EStG vor?

5. Liegen außerordentliche Einkünfte nach § 34 Abs. 3 EStG vor?

6. Freibetrag und Tarifermäßigung prüfen.

## Rechtsfolge

Sind sämtliche Voraussetzungen erfüllt,

kann der Erbe

- den Freibetrag nach § 16 Abs. 4 EStG und
- die Tarifermäßigung nach § 34 Abs. 3 EStG

beanspruchen.

## Prüfungsmerksätze

Eine vorherige Mitunternehmerstellung ist nicht erforderlich.

Der Erbe wird durch den Erbfall Mitunternehmer.

Die steuerlichen Begünstigungen gelten auch für Erben.

Maßgeblich ist die Veräußerung des gesamten Betriebs oder Mitunternehmeranteils.

## Klausurtipp

Typische Prüfungsfalle:

Viele gehen davon aus, dass der Erbe bereits vor dem Erbfall Mitunternehmer gewesen sein muss.

Das ist falsch.

Entscheidend ist allein, dass der Erbe durch den Erbfall Mitunternehmer wird und anschließend den Betrieb oder Mitunternehmeranteil im Ganzen veräußert.
`
},
{
  id: "heilberufe-umsatzsteuer-freiberuflichkeit",
  title: "Ärzte und Psychotherapeuten: Umsatzsteuer und Freiberuflichkeit",
  short:
    "Aktuelle Rechtsprechung zur Umsatzsteuerbefreiung, § 18 EStG und Abgrenzung freiberuflicher Tätigkeiten.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "arzt|ärzte|psychotherapeut|heilberufe|heilbehandlung|§ 4 nr. 14 ustg|§ 18 estg|gemeinschaftspraxis|freiberuflich|gewerblich|umsatzsteuerbefreiung|heilberuf",
  references: [
    "§ 4 Nr. 14 UStG",
    "§ 18 EStG",
    "§ 73b SGB V",
    "§ 73c SGB V"
  ],
  body: `
# Ärzte und Psychotherapeuten

## Umsatzsteuerbefreiung

Heilberufliche Leistungen sind nach § 4 Nr. 14 UStG steuerfrei,

wenn

- ein therapeutischer Zweck vorliegt,
- die Leistung der Diagnose, Behandlung oder Vorbeugung dient,
- sie durch entsprechend qualifizierte Personen erbracht wird.

Die Rechtsform spielt keine Rolle.

Die Steuerbefreiung gilt daher auch für:

- Gemeinschaftspraxen
- Berufsausübungsgemeinschaften
- GmbH & Co. KG

## Nicht steuerfrei

Keine Steuerbefreiung besteht insbesondere bei

- Verkauf von Praxisinventar
- rein organisatorischen Leistungen
- Leistungen ohne therapeutischen Zweck

## Medikamente

Die Abgabe von Medikamenten kann eine unselbständige Nebenleistung sein,

wenn sie für die Heilbehandlung notwendig ist.

## Hausarztverträge

Auch Leistungen nach

- § 73b SGB V
- § 73c SGB V

können unter die Umsatzsteuerbefreiung fallen.

## Einkommensteuer

Ärzte und Psychotherapeuten erzielen grundsätzlich Einkünfte aus selbständiger Arbeit (§ 18 EStG).

Voraussetzung:

Die Tätigkeit wird

- eigenverantwortlich,
- persönlich,
- fachlich unabhängig

ausgeübt.

## Aktuelle Prüfungsschwerpunkte

- Abgrenzung freiberuflich / gewerblich
- Mitunternehmerschaft in Gemeinschaftspraxen
- Delegation ärztlicher Tätigkeiten
- Einsatz fachlich qualifizierter Mitarbeiter

## Prüfungsmerksätze

Heilbehandlung + therapeutischer Zweck + Qualifikation
=
Steuerfrei nach § 4 Nr. 14 UStG.

Rechtsform ist unbeachtlich.

Kein therapeutischer Zweck
=
Umsatzsteuerpflicht.

Eigenverantwortliche Berufsausübung
=
Freiberufliche Einkünfte nach § 18 EStG.
`
},
{
  id: "praxisveraeusserung-freibetrag-tarifermaessigung",
  title: "Praxisveräußerung: Freibetrag (§ 16 Abs. 4 EStG) und Tarifermäßigung (§ 34 Abs. 3 EStG)",
  short:
    "Steuerliche Begünstigungen bei der Veräußerung einer freiberuflichen Praxis: Freibetrag, Tarifermäßigung und Prüfungsschema.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "§ 16 abs. 4 estg|§ 34 abs. 3 estg|praxisverkauf|praxisveräußerung|veräußerungsgewinn|freibetrag|tarifermäßigung|außerordentliche einkünfte|freiberufler|§ 18 estg|56 prozent|14 prozent|55 lebensjahr",
  references: [
    "§ 16 Abs. 4 EStG",
    "§ 18 Abs. 3 EStG",
    "§ 34 Abs. 2 Nr. 1 EStG",
    "§ 34 Abs. 3 EStG"
  ],
  body: `
# Praxisveräußerung: Freibetrag und Tarifermäßigung

## Grundsatz

Veräußert ein Freiberufler seine gesamte Praxis, können unter bestimmten Voraussetzungen zwei steuerliche Begünstigungen in Anspruch genommen werden:

- Freibetrag nach § 16 Abs. 4 EStG
- Tarifermäßigung nach § 34 Abs. 3 EStG

Beide Begünstigungen dienen dazu, die steuerliche Belastung des einmaligen Veräußerungsgewinns zu reduzieren.

## Freibetrag nach § 16 Abs. 4 EStG

Der Freibetrag beträgt grundsätzlich:

45.000 Euro.

Voraussetzungen:

- Veräußerung oder Aufgabe des gesamten Betriebs oder Mitunternehmeranteils,
- Vollendung des 55. Lebensjahres oder dauernde Berufsunfähigkeit,
- personenbezogene Inanspruchnahme (nur einmal im Leben).

Der Freibetrag gilt auch bei der Veräußerung einer freiberuflichen Praxis (§ 18 Abs. 3 EStG).

## Kürzung des Freibetrags

Der Freibetrag wird gekürzt,

wenn der Veräußerungsgewinn

136.000 Euro übersteigt.

Kürzungsformel:

45.000 Euro
minus

(Veräußerungsgewinn
minus
136.000 Euro)

Beispiel:

Veräußerungsgewinn:
150.000 Euro

Übersteigender Betrag:

150.000
-
136.000
=
14.000 Euro

Freibetrag:

45.000
-
14.000
=
31.000 Euro

Ab einem Veräußerungsgewinn von 181.000 Euro entfällt der Freibetrag vollständig.

## Tarifermäßigung nach § 34 Abs. 3 EStG

Zusätzlich kann auf Antrag die Tarifermäßigung nach § 34 Abs. 3 EStG beansprucht werden.

Voraussetzungen:

- Vollendung des 55. Lebensjahres oder dauernde Berufsunfähigkeit,
- außerordentliche Einkünfte nach § 34 Abs. 2 Nr. 1 EStG,
- Veräußerung eines gesamten Betriebs oder einer gesamten freiberuflichen Praxis,
- Antrag des Steuerpflichtigen.

Die Tarifermäßigung kann nur einmal im Leben beansprucht werden.

## Berechnung

Zunächst:

Veräußerungsgewinn

minus

Freibetrag nach § 16 Abs. 4 EStG.

Der verbleibende Gewinn wird anschließend mit einem ermäßigten Steuersatz besteuert.

Ermäßigter Steuersatz:

56 % des durchschnittlichen Steuersatzes,

mindestens jedoch

14 %.

## Zweck der Tarifermäßigung

Die Tarifermäßigung soll die Progressionswirkung vermeiden,

die entsteht,

wenn ein hoher Veräußerungsgewinn in einem einzigen Veranlagungszeitraum zufließt.

## Prüfungsschema

1. Liegt eine Betriebs- oder Praxisveräußerung vor?

2. Handelt es sich um außerordentliche Einkünfte (§ 34 Abs. 2 Nr. 1 EStG)?

3. Ist der Steuerpflichtige mindestens 55 Jahre alt oder dauernd berufsunfähig?

4. Freibetrag nach § 16 Abs. 4 EStG prüfen.

5. Freibetrag ggf. wegen Überschreitens von 136.000 Euro kürzen.

6. Tarifermäßigung nach § 34 Abs. 3 EStG beantragt?

7. Ermäßigten Steuersatz anwenden.

## Beispiel

Praxisverkauf:

Veräußerungsgewinn:
150.000 Euro

Freibetrag:

31.000 Euro

Steuerlich begünstigter Gewinn:

119.000 Euro

Dieser Gewinn wird anschließend nach § 34 Abs. 3 EStG mit dem ermäßigten Steuersatz besteuert.

## Rechtsfolgen

Freibetrag:

45.000 Euro,
ggf. gekürzt.

Tarifermäßigung:

56 % des durchschnittlichen Steuersatzes,

mindestens 14 %.

Beide Begünstigungen können grundsätzlich miteinander kombiniert werden.

## Prüfungsmerksätze

Der Freibetrag beträgt grundsätzlich 45.000 Euro.

Ab 136.000 Euro Veräußerungsgewinn erfolgt eine Kürzung.

Ab 181.000 Euro entfällt der Freibetrag vollständig.

Die Tarifermäßigung beträgt 56 % des durchschnittlichen Steuersatzes,

mindestens jedoch 14 %.

Beide Vergünstigungen können nur einmal im Leben beansprucht werden.

## Klausurtipp

Typische Prüfungsfalle:

Viele wenden die Tarifermäßigung unmittelbar auf den gesamten Veräußerungsgewinn an.

Richtig ist:

1. Veräußerungsgewinn ermitteln.

2. Freibetrag nach § 16 Abs. 4 EStG abziehen.

3. Erst den verbleibenden Gewinn nach § 34 Abs. 3 EStG tarifbegünstigt versteuern.

Merksatz:

Erst Freibetrag – dann Tarifermäßigung.
`
},
{
  id: "haeusliches-arbeitszimmer-aufzeichnungspflicht-bfh-2026",
  title: "Häusliches Arbeitszimmer: Aufzeichnungspflicht nach § 4 Abs. 7 EStG",
  short:
    "BFH VIII R 6/24: Zeitnahe Aufzeichnungspflicht für Selbständige, Unterschiede zu Arbeitnehmern und Prüfungsschema.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "häusliches arbeitszimmer|§ 4 abs. 7 estg|§ 4 abs. 5 nr. 6b estg|jahrespauschale|bfh viii r 6/24|aufzeichnungspflicht|betriebsausgaben|werbungskosten|arbeitnehmer|selbständige",
  references: [
    "§ 4 Abs. 7 EStG",
    "§ 4 Abs. 5 Nr. 6b EStG",
    "§ 9 EStG",
    "§ 129 AO",
    "BFH VIII R 6/24"
  ],
  body: `
# Häusliches Arbeitszimmer

## Grundsatz

Die besondere Aufzeichnungspflicht des § 4 Abs. 7 EStG gilt ausschließlich für Steuerpflichtige mit Gewinneinkünften.

Sie betrifft insbesondere:

- Einzelunternehmer
- Freiberufler
- Selbständige

Nicht betroffen sind Arbeitnehmer, die Aufwendungen als Werbungskosten nach § 9 EStG geltend machen.

## Arbeitnehmer

Arbeitnehmer müssen keine zeitnahen Einzelaufzeichnungen führen.

Erforderlich sind lediglich:

- geeignete Belege
- nachvollziehbare Berechnung
- Nachweis der beruflichen Nutzung

Die BFH-Rechtsprechung zur Aufzeichnungspflicht ist auf Arbeitnehmer nicht übertragbar.

## Selbständige

Nach dem BFH-Urteil VIII R 6/24 gilt:

Aufwendungen sind nur abzugsfähig, wenn sie

- einzeln,
- getrennt,
- und zeitnah

aufgezeichnet werden.

Die Dokumentation muss

- in einer gesonderten Spalte der Buchführung oder
- in einem gesonderten digitalen oder schriftlichen Dokument

erfolgen.

Nicht ausreichend sind:

- bloße Belegsammlungen
- nachträgliche Excel-Listen
- erst bei Erstellung der Steuererklärung erstellte Übersichten

## Jahrespauschale

Wird ab VZ 2023 die Jahrespauschale genutzt,

entfällt die besondere Aufzeichnungspflicht nach § 4 Abs. 7 EStG.

## Prüfungsschema

1. Liegt ein häusliches Arbeitszimmer nach § 4 Abs. 5 Nr. 6b EStG vor?

2. Erfolgt die Nutzung nahezu ausschließlich beruflich?

3. Werden sämtliche Aufwendungen einzeln, getrennt und zeitnah dokumentiert?

4. Erfolgt die Dokumentation in einer gesonderten Aufzeichnung?

5. Wird stattdessen die Jahrespauschale genutzt?

## Rechtsfolge

Verstoß gegen § 4 Abs. 7 EStG:

=> Betriebsausgabenabzug ausgeschlossen.

Ausnahme:

Eine offenbare Unrichtigkeit kann ggf. nach § 129 AO berichtigt werden.

## Prüfungsmerksätze

Selbständige:
Zeitnahe Einzelaufzeichnung zwingend.

Arbeitnehmer:
Keine besondere Aufzeichnungspflicht.

Jahrespauschale:
Aufzeichnungspflicht entfällt.

BFH VIII R 6/24:
Bloße Belegsammlung genügt nicht.
`
},
{
  id: "sachbezug-gutscheinkarten-50-euro-freigrenze",
  title: "Sachbezüge: Gutscheinkarten bis 50 €",
  short:
    "Steuerfreie Gutscheinkarten nach § 8 Abs. 2 Satz 11 EStG: Voraussetzungen, 50-Euro-Freigrenze und ZAG-Kriterien.",
  category: "Lohnsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "gutschein|gutscheinkarte|amazon|ikea|dm|netflix|sachbezug|50 euro|50€|freigrenze|§ 8 abs. 2 estg|zag|zusätzlichkeitsvoraussetzung|geburtstag|mitarbeiter|geldkarte|lohnsteuer",
  references: [
    "§ 8 Abs. 2 Satz 11 EStG",
    "§ 2 Abs. 1 Nr. 10 ZAG",
    "BMF-Schreiben Sachbezüge",
    "BFH Sachbezüge"
  ],
  body: `
# Gutscheinkarten als Sachbezug

## Grundsatz

Gutscheinkarten können steuerfrei an Arbeitnehmer ausgegeben werden, wenn sie die Voraussetzungen eines begünstigten Sachbezugs erfüllen.

Die Steuerfreiheit richtet sich nach § 8 Abs. 2 Satz 11 EStG.

Typische Anlässe:
- Geburtstag
- Jubiläum
- Anerkennung besonderer Leistungen

## Begünstigte Gutscheinkarten

Grundsätzlich können begünstigt sein:

- DM
- Ikea
- Netflix
- Amazon (nur unter bestimmten Voraussetzungen)

Voraussetzung ist, dass die Gutscheinkarte ausschließlich zum Bezug von Waren oder Dienstleistungen berechtigt.

## Voraussetzungen

Die Gutscheinkarte muss die Voraussetzungen des § 2 Abs. 1 Nr. 10 ZAG erfüllen.

Begünstigt sind insbesondere:

### Closed-Loop-Karten

Einlösbar ausschließlich bei einem Händler.

Beispiele:
- DM
- Ikea

Diese sind grundsätzlich begünstigt.

### Controlled-Loop-Karten

Einlösbar bei einem begrenzten Kreis von Akzeptanzstellen im Inland.

Auch diese können steuerlich begünstigt sein.

### Amazon

Amazon-Gutscheine sind nur begünstigt, wenn sie ausschließlich für Eigenprodukte von Amazon verwendet werden können.

Sind sie auch für Marketplace-Händler bzw. Fremdanbieter verwendbar, liegt regelmäßig keine begünstigte Sachzuwendung vor.

### Netflix

Netflix-Gutscheine sind grundsätzlich begünstigt, wenn sie ausschließlich für Streaming-Leistungen von Netflix eingesetzt werden können.

## Weitere Voraussetzungen

Die Gutscheinkarte muss:

- zusätzlich zum ohnehin geschuldeten Arbeitslohn gewährt werden,
- unmittelbar als Sachzuwendung ausgegeben werden,
- keine Gehaltsumwandlung darstellen.

Nicht zulässig sind insbesondere:

- Barauszahlung
- Auszahlung auf ein Konto
- Überweisungsfunktion
- IBAN
- Kauf von Kryptowährungen
- Devisengeschäfte
- allgemeine Zahlungsfunktion

## 50-Euro-Freigrenze

Die Freigrenze beträgt:

50 Euro pro Kalendermonat.

Alle Sachbezüge eines Monats werden zusammengerechnet.

Wichtig:

Wird die Freigrenze überschritten,

ist nicht nur der Mehrbetrag,

sondern der gesamte Sachbezug steuerpflichtig.

Es handelt sich um eine Freigrenze und nicht um einen Freibetrag.

## Werbungskosten oder Lohn?

Die Gutscheinkarte stellt keinen steuerpflichtigen Arbeitslohn dar,

wenn

- sämtliche Voraussetzungen erfüllt sind,
- die Freigrenze eingehalten wird,
- die Zusätzlichkeitsvoraussetzung erfüllt ist.

## Prüfungsschema

1. Liegt eine Gutscheinkarte oder Geldkarte vor?

2. Erfüllt sie § 2 Abs. 1 Nr. 10 ZAG?

3. Ausschließlich Waren oder Dienstleistungen?

4. Closed-Loop oder Controlled-Loop?

5. Keine Geldersatzfunktion?

6. Zusätzlich zum ohnehin geschuldeten Arbeitslohn?

7. Freigrenze von 50 Euro eingehalten?

## Amazon-Gutscheine

Besondere Vorsicht:

Begünstigt:
- ausschließlich Amazon-Eigenprodukte

Nicht begünstigt:
- Marketplace
- Fremdanbieter
- allgemeine Zahlungsfunktion

## Prüfungsmerksätze

50 Euro sind eine Freigrenze.

Bei Überschreiten ist der gesamte Sachbezug steuerpflichtig.

Keine Gehaltsumwandlung.

Keine Barauszahlung.

Keine Geldersatzfunktion.

Closed-Loop und Controlled-Loop können begünstigt sein.

Amazon-Gutscheine immer besonders prüfen.

## Klausurtipp

Bei Gutscheinen immer folgende Reihenfolge prüfen:

1. Zusätzlichkeitsvoraussetzung
2. § 2 Abs. 1 Nr. 10 ZAG
3. Geldleistung oder Sachbezug?
4. 50-Euro-Freigrenze
5. Rechtsfolge (steuerfrei oder steuerpflichtig)

Merksatz:

"50 Euro + Sachbezug + zusätzlich zum Lohn + keine Geldfunktion = steuerfrei."
`
},
{
  id: "wissenschaftliche-veranstaltungen-zweckbetrieb",
  title: "Wissenschaftliche Veranstaltungen: Zweckbetrieb oder ideelle Sphäre?",
  short:
    "Zuordnung wissenschaftlicher Veranstaltungen eines gemeinnützigen Vereins zum Zweckbetrieb, Abgrenzung zur ideellen Sphäre und Folgen fehlerhafter Zuordnungen.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "zweckbetrieb|ideelle sphäre|wissenschaft|forschung|veranstaltung|teilnehmerbeiträge|gemeinnützigkeit|§ 65 ao|§ 68 nr. 9 ao|leistungsaustausch|wirtschaftlicher geschäftsbetrieb|aeao|fördermittel",
  references: [
    "§§ 51 ff. AO",
    "§ 55 AO",
    "§ 64 AO",
    "§ 65 AO",
    "§ 68 Nr. 9 AO",
    "§ 21 BGB",
    "§§ 69, 71 AO",
    "§ 130 OWiG",
    "AEAO zu §§ 55, 64 und 65 AO"
  ],
  body: `
# Wissenschaftliche Veranstaltungen eines gemeinnützigen Vereins

## Grundsatz

Organisiert ein gemeinnütziger Verein wissenschaftliche Veranstaltungen und erhebt hierfür Teilnehmerbeiträge, sind die Einnahmen und Ausgaben grundsätzlich dem Zweckbetrieb zuzuordnen.

Voraussetzung ist,

- dass die Förderung von Wissenschaft und Forschung Satzungszweck ist,
- die Veranstaltung unmittelbar diesem Satzungszweck dient,
- und ein Leistungsaustausch zwischen Verein und Teilnehmern vorliegt.

Rechtsgrundlagen:
- § 65 AO
- § 68 Nr. 9 AO

## Zweckbetrieb

Ein Zweckbetrieb liegt vor, wenn

- die Veranstaltung überwiegend wissenschaftlicher oder belehrender Art ist,
- sie unmittelbar der Verwirklichung des gemeinnützigen Zwecks dient,
- die Teilnehmerbeiträge zur Finanzierung der Veranstaltung verwendet werden.

Typische Einnahmen:

- Teilnehmergebühren
- Kongressgebühren
- Seminargebühren
- Tagungsbeiträge

Typische Ausgaben:

- Raummiete
- Referentenhonorare
- Technik
- Catering
- Druckkosten
- Reisekosten

Alle diese Einnahmen und Aufwendungen gehören zum Zweckbetrieb.

## Ideelle Sphäre

Eine Zuordnung zur ideellen Sphäre kommt nur in Betracht,

wenn kein Leistungsaustausch vorliegt.

Beispiele:

- echte Spenden
- Mitgliedsbeiträge
- Zuschüsse ohne Gegenleistung

Sobald Teilnehmer für eine konkrete Leistung bezahlen,

liegt regelmäßig keine ideelle Tätigkeit mehr vor.

## Leistungsaustausch

Leistungsaustausch bedeutet:

Der Teilnehmer erhält eine konkrete Gegenleistung für seine Zahlung.

Beispiele:

- Teilnahme an einem Kongress
- wissenschaftliche Vorträge
- Workshops
- Fortbildungsveranstaltungen

Dann gehören Einnahmen und Ausgaben grundsätzlich zum Zweckbetrieb.

## Prüfungsschema

1. Ist der Verein gemeinnützig?

2. Gehört die Förderung von Wissenschaft und Forschung zum Satzungszweck?

3. Dient die Veranstaltung unmittelbar diesem Zweck?

4. Liegt ein Leistungsaustausch vor?

5. Werden Teilnehmerbeiträge erhoben?

6. Werden die Einnahmen überwiegend zur Kostendeckung verwendet?

7. Ergebnis:

=> Zweckbetrieb nach §§ 65, 68 AO.

## Folgen einer falschen Zuordnung

Eine fehlerhafte Zuordnung kann erhebliche Folgen haben.

### Steuerrechtliche Folgen

Wird eine Tätigkeit fälschlich der ideellen Sphäre zugeordnet,

obwohl tatsächlich

- ein Zweckbetrieb oder
- ein wirtschaftlicher Geschäftsbetrieb

vorliegt,

drohen insbesondere:

- Körperschaftsteuer
- Gewerbesteuer
- Verlust steuerlicher Vergünstigungen
- Aberkennung der Gemeinnützigkeit

Besonders kritisch ist eine unzulässige Mittelverwendung nach § 55 AO.

## Wirtschaftlicher Geschäftsbetrieb

Liegt keine unmittelbare Zweckverwirklichung mehr vor,

kann stattdessen ein steuerpflichtiger wirtschaftlicher Geschäftsbetrieb entstehen.

Dann gelten die Vorschriften des § 64 AO.

## Gemeinnützigkeit

Eine dauerhafte Finanzierung steuerpflichtiger wirtschaftlicher Tätigkeiten aus Mitteln der ideellen Sphäre kann gegen § 55 AO verstoßen.

Dadurch kann die Gemeinnützigkeit gefährdet werden.

Nach dem AEAO bestehen lediglich eng begrenzte Ausnahmen,

beispielsweise:

- Fehlkalkulation
- kurzfristige Verlustübernahme
- Rückführung der Mittel innerhalb von zwölf Monaten

## Zivilrechtliche Folgen

Ein eingetragener Verein nach § 21 BGB muss überwiegend ideelle Zwecke verfolgen.

Eine dauerhafte wirtschaftliche Tätigkeit kann den Vereinsstatus gefährden.

## Haftungsrisiken

Fehlerhafte Zuordnungen können zu einer persönlichen Haftung der Vorstandsmitglieder führen.

Mögliche Rechtsgrundlagen:

- § 69 AO
- § 71 AO
- § 130 OWiG

Bei vorsätzlichen oder leichtfertigen Pflichtverletzungen können zusätzlich steuerstrafrechtliche Folgen eintreten.

## Zuschüsse und Fördermittel

Auch öffentliche Zuschüsse sind zutreffend zuzuordnen.

Besteht ein Leistungsaustausch,

kann

- Umsatzsteuer,
- Körperschaftsteuer oder
- Gewerbesteuer

ausgelöst werden.

Außerdem können Verstöße gegen Förderbedingungen zu Rückforderungen führen.

## Meinungsstand

Finanzverwaltung, Literatur und Rechtsprechung vertreten übereinstimmend,

dass wissenschaftliche Veranstaltungen mit Teilnehmerbeiträgen grundsätzlich dem Zweckbetrieb zuzuordnen sind,

wenn

- die Satzungszwecke verwirklicht werden,
- ein unmittelbarer Zusammenhang zur Gemeinnützigkeit besteht,
- und die Veranstaltungen nicht überwiegend der Gewinnerzielung dienen.

Gemischt veranlasste Aufwendungen sind sachgerecht aufzuteilen.

## Prüfungsmerksätze

Leistungsaustausch

= grundsätzlich Zweckbetrieb.

Keine Gegenleistung

= ideelle Sphäre.

Teilnehmerbeiträge für wissenschaftliche Veranstaltungen

= regelmäßig Zweckbetrieb.

Spenden und echte Mitgliedsbeiträge

= ideelle Sphäre.

## Klausurtipp

Typische Prüfungsfalle:

Viele ordnen Teilnehmerbeiträge automatisch der ideellen Sphäre zu.

Das ist falsch.

Sobald der Teilnehmer für eine konkrete Leistung zahlt,

liegt regelmäßig ein Leistungsaustausch vor.

Damit gehören sowohl die Einnahmen als auch die dazugehörigen Aufwendungen grundsätzlich in den Zweckbetrieb.
`
},
{
  id: "jahresabschlussanalyse-gkv-ebit-kennzahlen-kst",
  title: "Jahresabschlussanalyse: GuV, EBIT, Kennzahlen und KSt-Korrekturen",
  short:
    "Prüfungswissen zu GuV nach § 275 Abs. 2 HGB, ordentlichem Betriebsergebnis, Rentabilitätskennzahlen, Lagerkennzahlen, Leverage-Effekt sowie vGA/vE in der Körperschaftsteuer.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "guv|gesamtkostenverfahren|gkv|§ 275 hgb|betriebsergebnis|ebit|ordentliches betriebsergebnis|neutrale erträge|neutrale aufwendungen|eigenkapitalquote|eigenkapitalrentabilität|gesamtkapitalrentabilität|fremdkapitalzinssatz|leverage effekt|lagerdauer|umschlagshäufigkeit|vorräte|forderung|verbindlichkeiten|dso|dpo|körperschaftsteuer|vga|verdeckte gewinnausschüttung|ve|verdeckte einlage|§ 8 kstg|§ 8b kstg|§ 27 kstg",
  references: [
    "§ 275 Abs. 2 HGB",
    "§ 8 Abs. 3 Satz 2 KStG",
    "§ 8 Abs. 3 Satz 3 KStG",
    "§ 8b KStG",
    "§ 27 KStG"
  ],
  body: `
# Jahresabschlussanalyse: GuV, EBIT, Kennzahlen und KSt-Korrekturen

## 1. GuV nach § 275 Abs. 2 HGB – Gesamtkostenverfahren

Bei der Gewinn- und Verlustrechnung nach dem Gesamtkostenverfahren werden Erträge und Aufwendungen nach dem Schema des § 275 Abs. 2 HGB geordnet.

Typisches Schema:

1. Umsatzerlöse  
2. +/- Bestandsveränderungen  
3. andere aktivierte Eigenleistungen  
4. sonstige betriebliche Erträge  
5. Materialaufwand  
6. Personalaufwand  
7. Abschreibungen  
8. sonstige betriebliche Aufwendungen einschließlich sonstiger Steuern  
9./10. Betriebsergebnis  
11. Finanzerträge  
12. Finanzaufwendungen  
13. Finanzergebnis  
14. Steuern vom Einkommen und Ertrag  
15. Jahresüberschuss / Jahresfehlbetrag  

Wichtig:
Sonstige Steuern werden regelmäßig den betrieblichen Aufwendungen zugeordnet.

Beispiel:
Sonstige betriebliche Aufwendungen: 162.840  
+ sonstige Steuern: 680  
= sonstige betriebliche Aufwendungen einschließlich sonstiger Steuern: 163.520

Betriebsergebnis:
Gesamterträge des Betriebs minus Gesamtaufwendungen des Betriebs.

Beispiel:
Umsatzerlöse 678.130  
+ Bestandsveränderungen 16.070  
+ sonstige betriebliche Erträge 51.750  
= Gesamterträge 745.950

Materialaufwand 128.580  
+ Personalaufwand 240.370  
+ Abschreibungen 109.090  
+ sonstige betriebliche Aufwendungen inkl. sonstiger Steuern 163.520  
= Gesamtaufwand 641.560

Betriebsergebnis:
745.950 - 641.560 = 104.390

Finanzergebnis:
Zinserträge 2.500  
- Zinsaufwendungen 23.500  
= -21.000

Ergebnis vor Steuern:
104.390 - 21.000 = 83.390

Nach Steuern vom Einkommen und Ertrag:
83.390 - 4.270 = 79.120 Jahresüberschuss


## 2. Ordentliches Betriebsergebnis / EBIT

Das ordentliche Betriebsergebnis zeigt den Erfolg des eigentlichen Kerngeschäfts.

Nicht zum Kerngeschäft gehören neutrale Erträge und neutrale Aufwendungen.

Betriebliche Posten:
- Umsatzerlöse
- Bestandsveränderungen
- Materialaufwand
- Personalaufwand
- Abschreibungen
- sonstige betriebliche Aufwendungen i. e. S.
- sonstige Steuern

Neutrale Erträge:
- Erträge aus Auflösung von Rückstellungen
- Mieterträge, wenn sie nicht zum Kerngeschäft gehören
- Zinserträge

Neutrale Aufwendungen:
- periodenfremde Aufwendungen
- Aufwendungen für Fremdvermietung
- Einzelwertberichtigungen, wenn in der Aufgabe neutral vorgegeben
- außerordentliche Aufwendungen
- Zinsaufwendungen

Beispiel neutrale Erträge:
Auflösung Rückstellungen 11.260  
+ Mieterträge 27.040  
= neutrale Erträge 38.300

Beispiel neutrale Aufwendungen:
periodenfremde Aufwendungen 6.250  
+ Fremdvermietung 420  
+ Einzelwertberichtigung 8.190  
+ außerordentliche Aufwendungen 23.340  
+ Zinsen 23.500  
= neutrale Aufwendungen 61.700

Ordentliches Betriebsergebnis:
Betriebliche Erträge minus betriebliche Aufwendungen.

Merksatz:
Das ordentliche Betriebsergebnis zeigt die wirtschaftliche Leistung aus dem Kerngeschäft. Neutrale, außerordentliche und periodenfremde Vorgänge sowie das Zinsergebnis werden herausgerechnet.


## 3. Kapitalstruktur- und Rentabilitätskennzahlen

Gegeben:
Durchschnittliches Eigenkapital: 1.400.000  
Durchschnittliches Gesamtkapital: 3.625.000  
Zinsaufwendungen: 157.500  
Sonstige Aufwendungen: 3.000.000  
Erträge: 3.350.000

Fremdkapital:
Gesamtkapital - Eigenkapital  
3.625.000 - 1.400.000 = 2.225.000

Jahresüberschuss:
Erträge - sonstige Aufwendungen - Zinsaufwendungen  
3.350.000 - 3.000.000 - 157.500 = 192.500

Eigenkapitalquote:
Eigenkapital / Gesamtkapital x 100  
1.400.000 / 3.625.000 x 100 = 38,62 %

Eigenkapitalrentabilität:
Jahresüberschuss / Eigenkapital x 100  
192.500 / 1.400.000 x 100 = 13,75 %

Durchschnittlicher Fremdkapitalzinssatz:
Zinsaufwendungen / Fremdkapital x 100  
157.500 / 2.225.000 x 100 = 7,08 %

Gesamtkapitalrentabilität:
(Jahresüberschuss + Fremdkapitalzinsen) / Gesamtkapital x 100  
(192.500 + 157.500) / 3.625.000 x 100 = 9,66 %


## 4. Investition und Leverage-Effekt

Investition:
Anschaffungskosten 1.125.000  
80 % Fremdkapital = 900.000  
20 % Eigenkapital = 225.000

Neue Kapitalwerte:
Eigenkapital: 1.400.000 + 225.000 = 1.625.000  
Fremdkapital: 2.225.000 + 900.000 = 3.125.000  
Gesamtkapital: 3.625.000 + 1.125.000 = 4.750.000

Zusätzlicher Ertrag vor FK-Zinsen:
1.125.000 x 15 % = 168.750

Zusätzliche Zinsen:
900.000 x 9 % = 81.000

Zusätzlicher Jahresüberschuss:
168.750 - 81.000 = 87.750

Neuer Jahresüberschuss:
192.500 + 87.750 = 280.250

Neue Zinsaufwendungen:
157.500 + 81.000 = 238.500

Neue Eigenkapitalquote:
1.625.000 / 4.750.000 x 100 = 34,21 %

Neue Eigenkapitalrentabilität:
280.250 / 1.625.000 x 100 = 17,25 %

Neuer durchschnittlicher FK-Zinssatz:
238.500 / 3.125.000 x 100 = 7,63 %

Neue Gesamtkapitalrentabilität:
(280.250 + 238.500) / 4.750.000 x 100 = 10,92 %

Leverage-Effekt:
Ein positiver Leverage-Effekt liegt vor, wenn die Gesamtkapitalrendite bzw. Investitionsrendite höher ist als der Fremdkapitalzinssatz.

Im Beispiel:
Investitionsrendite 15 %  
FK-Zinssatz 9 %

Die Eigenkapitalrentabilität steigt von 13,75 % auf 17,25 %. Gleichzeitig sinkt die Eigenkapitalquote von 38,62 % auf 34,21 %. Das bedeutet: höhere Rendite, aber auch höhere Verschuldung.


## 5. Vorratskennzahlen

Umschlagshäufigkeit der Vorräte:
Materialaufwand / durchschnittlicher Vorratsbestand

Beispiel:
Materialaufwand 600.000  
durchschnittlicher Vorratsbestand 30.000

600.000 / 30.000 = 20

Bedeutung:
Der durchschnittliche Vorratsbestand wird 20-mal im Jahr umgeschlagen.

Durchschnittliche Lagerdauer:
360 / Umschlagshäufigkeit

360 / 20 = 18 Tage

Bedeutung:
Die Waren liegen durchschnittlich 18 Tage im Lager.

Merksatz:
Hohe Umschlagshäufigkeit = kurze Lagerdauer.  
Niedrige Umschlagshäufigkeit = lange Lagerdauer.


## 6. Forderungen und Verbindlichkeiten

Umschlagshäufigkeit Forderungen:
Umsatzerlöse / durchschnittlicher Forderungsbestand

Durchschnittliches Kundenziel / DSO:
360 / Umschlagshäufigkeit Forderungen

Umschlagshäufigkeit Verbindlichkeiten:
Materialaufwand / durchschnittlicher Verbindlichkeitenbestand

Durchschnittliches Lieferantenziel / DPO:
360 / Umschlagshäufigkeit Verbindlichkeiten

Wichtig:
Wenn Forderungen und Verbindlichkeiten brutto angegeben sind und die Umsatzerlöse oder Materialaufwendungen netto sind, muss auf vergleichbare Werte geachtet werden.

Bei 19 % Umsatzsteuer:
Netto = Brutto / 1,19


## 7. Körperschaftsteuer: vGA und verdeckte Einlage

Prüfungsschema:
1. Liegt eine vGA, eine verdeckte Einlage oder kein steuerlicher Korrekturfall vor?
2. Ist der Vorgang gesellschaftlich veranlasst?
3. Ist der Vorgang fremdüblich?
4. Welche außerbilanzielle Korrektur ist vorzunehmen?

## Verdeckte Gewinnausschüttung

Rechtsgrundlage:
§ 8 Abs. 3 Satz 2 KStG

Eine vGA liegt vor, wenn eine Kapitalgesellschaft ihrem Gesellschafter einen Vorteil zuwendet, der durch das Gesellschaftsverhältnis veranlasst ist und einem fremden Dritten nicht gewährt worden wäre.

Typischer Fall:
Rückwirkende Gehaltserhöhung an beherrschenden Gesellschafter-Geschäftsführer.

Warum vGA?
- Gesellschafterstellung liegt vor
- Vereinbarung ist nicht fremdüblich
- bei beherrschenden Gesellschaftern müssen Vereinbarungen klar, eindeutig und im Voraus getroffen werden
- rückwirkende Gehaltserhöhungen sind steuerlich kritisch

Rechtsfolge:
Der Aufwand wurde handelsrechtlich gebucht, ist steuerlich aber nicht abzugsfähig.

Folge:
Außerbilanzielle Hinzurechnung.

Beispiel:
Rückwirkende Gehaltserhöhung 9.000  
=> + 9.000 außerbilanziell hinzurechnen


## Verdeckte Einlage

Rechtsgrundlage:
§ 8 Abs. 3 Satz 3 KStG

Eine verdeckte Einlage liegt vor, wenn ein Gesellschafter der Kapitalgesellschaft außerhalb einer offenen Einlage einen einlagefähigen Vermögensvorteil zuwendet und dies durch das Gesellschaftsverhältnis veranlasst ist.

Wichtig:
Ein bloßer Nutzungsvorteil ist keine verdeckte Einlage.

Beispiel 1:
Verbilligtes Darlehen des Gesellschafters an die GmbH:
Keine verdeckte Einlage, weil nur ein Nutzungsvorteil vorliegt.

Beispiel 2:
Gesellschafter verzichtet auf voll werthaltige Darlehensforderung:
Verdeckte Einlage.

Warum?
Die GmbH muss die Verbindlichkeit nicht mehr zahlen. Dadurch entfällt ein Passivposten. Ein fremder Dritter hätte auf die Forderung nicht verzichtet.

Bewertung:
Teilwert der Forderung.

Beispiel:
Forderungsverzicht 200.000  
=> verdeckte Einlage 200.000

Steuerliche Folge:
Der handelsrechtlich erfasste Ertrag aus der Ausbuchung der Verbindlichkeit ist außerbilanziell abzuziehen.

Außerdem:
Zugang zum steuerlichen Einlagekonto nach § 27 KStG.


## 8. Grundstücksübertragung als verdeckte Einlage

Überträgt ein Gesellschafter ein Grundstück unentgeltlich auf eine GmbH, liegt regelmäßig eine verdeckte Einlage vor.

Warum?
Die GmbH erhält einen einlagefähigen Vermögensvorteil in Form eines Aktivpostens. Ein fremder Dritter würde ein Grundstück nicht unentgeltlich übertragen.

Bewertung:
Teilwert.

Beispiel:
Teilwert Grundstück 250.000

Steuerliche Folge:
Bei der empfangenden Kapitalgesellschaft entsteht ein Zugang. Je nach Aufgabenstellung kann dies innerbilanziell als Ertrag erfasst werden. Steuerlich ist zu prüfen, ob und in welcher Höhe eine außerbilanzielle Korrektur vorzunehmen ist.

Typischer Prüfungssatz:
Die Grundstücksübertragung stellt eine verdeckte Einlage nach § 8 Abs. 3 Satz 3 KStG dar, da ein einlagefähiger Vermögensvorteil gesellschaftlich veranlasst zugewendet wird.


## 9. Ermittlung des zu versteuernden Einkommens einer GmbH

Ausgangspunkt:
Handelsrechtlicher Jahresüberschuss

Dann steuerliche Korrekturen:

Hinzurechnungen:
- Körperschaftsteuer als nicht abziehbare Steuer
- Solidaritätszuschlag, soweit einschlägig
- Gewerbesteuer nach § 4 Abs. 5b EStG i. V. m. § 8 Abs. 1 KStG
- Geldbußen nach § 4 Abs. 5 Nr. 8 EStG
- verdeckte Gewinnausschüttungen nach § 8 Abs. 3 Satz 2 KStG
- nicht abziehbare Betriebsausgaben nach § 8b Abs. 5 KStG

Abzüge:
- steuerfreie Beteiligungserträge nach § 8b Abs. 1 KStG
- verdeckte Einlagen nach § 8 Abs. 3 Satz 3 KStG
- bereits innerbilanziell erfasste Erträge, die steuerlich neutral bleiben müssen

KSt:
Zu versteuerndes Einkommen x 15 %

Danach:
Anrechnung von Kapitalertragsteuer und Körperschaftsteuervorauszahlungen.

Wenn die Vorauszahlungen und Steuerabzüge höher sind als die festgesetzte KSt, ergibt sich eine Erstattung.


## 10. Prüfungs-Merksätze

vGA:
Aufwand bei der GmbH wegen Vorteil an Gesellschafter.
=> außerbilanziell hinzurechnen.

Verdeckte Einlage:
Vorteil durch Gesellschafter an GmbH.
=> Ertrag steuerlich neutralisieren, regelmäßig außerbilanziell abziehen.

§ 8b KStG:
Beteiligungserträge sind grundsätzlich steuerfrei, aber 5 % gelten als nicht abziehbare Betriebsausgaben.

Leverage:
Wenn Rendite des eingesetzten Kapitals größer ist als der Fremdkapitalzins, steigt die Eigenkapitalrentabilität.

Lagerkennzahlen:
Umschlagshäufigkeit sagt: Wie oft?
Lagerdauer sagt: Wie lange?
`
},
  {
    id: "npo-sphaeren",
    title: "Die vier Sphären gemeinnütziger Körperschaften",
    short:
      "Ideeller Bereich, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb — Wirkung und Abgrenzung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Handout — Sphären, Risiken, Abschlusslogik (NPO).",
    keywords: /sphär|ideeller bereich|vermögensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|wgb\b/i,
    references: ["§§ 14, 64–68 AO", "§ 12 Abs. 2 Nr. 8a UStG"],
    body: `Gemeinnützige Körperschaften werden steuerlich in vier Sphären gegliedert:

1) Ideeller Bereich — unmittelbare Verfolgung des Satzungszwecks ohne Gegenleistung (Spenden, Mitgliedsbeiträge). KSt- und GewSt-frei, mangels Leistungsaustausch grundsätzlich keine USt.

2) Vermögensverwaltung — passive Nutzung vorhandenen Vermögens (Zinsen, Mieten, Wertpapiere). KSt-/GewSt-frei; USt im Einzelfall, z. B. bei Vermietung.

3) Zweckbetrieb (§§ 65–68 AO) — wirtschaftliche Tätigkeit, die eng und notwendig mit dem Satzungszweck verbunden ist. KSt-/GewSt-frei, USt regelmäßig 7 % (§ 12 Abs. 2 Nr. 8a UStG).

4) Wirtschaftlicher Geschäftsbetrieb — marktbezogene Tätigkeit ohne unmittelbaren Zweckbezug (Verkauf, Sponsoring, Werbung, Gaststätte). USt 19 %, KSt/GewSt grundsätzlich pflichtig (Freigrenze 45.000 € Einnahmen, § 64 Abs. 3 AO).

Merksätze:
- Kein Leistungsaustausch = kein Umsatz.
- Wettbewerb ist ein starkes Indiz für Steuerpflicht.
- Die Sphäre ergibt sich aus dem Sachverhalt, nicht aus der Kontobezeichnung.`,
  },
{
  id: "mvr-ruecklagen-und-verwendungsueberhang",
  title: "Mittelverwendungsrechnung, Rücklagen und Verwendungsüberhang",
  short:
    "Prüfung der zeitnahen Mittelverwendung, zulässiger Rücklagen, Rücklagenspiegel und Verwendungsüberhang bei gemeinnützigen Körperschaften.",
  category: "NPO / Gemeinnützigkeit",
  source: "Internes Arbeitspapier – Mittelverwendungsrechnung / Rücklagen",
  keywords:
    /(mittelverwendungsrechnung|zeitnahe mittelverwendung|verwendungsüberhang|rücklagenspiegel|freie rücklage|betriebsmittelrücklage|wiederbeschaffungsrücklage|§\s*55\s*ao|§\s*62\s*ao|§\s*63\s*ao)/i,
  references: ["§ 55 AO", "§ 62 AO", "§ 63 AO"],
  body: `Die Mittelverwendungsrechnung dient dem Nachweis, dass eine gemeinnützige Körperschaft ihre Mittel zeitnah und satzungsgemäß verwendet hat.

Grundsatz:
Gemeinnützige Körperschaften müssen ihre Mittel selbstlos, zeitnah und für die steuerbegünstigten satzungsmäßigen Zwecke verwenden. Das Gebot der zeitnahen Mittelverwendung nach § 55 Abs. 1 Nr. 5 AO soll verhindern, dass steuerbegünstigt erworbene Mittel grundlos angesammelt oder gehortet werden.

Zeitlicher Rahmen:
Eine zeitnahe Mittelverwendung liegt grundsätzlich vor, wenn die Mittel spätestens in den beiden auf das Jahr des Zuflusses folgenden Kalender- oder Wirtschaftsjahren für steuerbegünstigte Zwecke verwendet werden.

45.000-Euro-Grenze:
Für kleine Körperschaften mit Einnahmen bis 45.000 Euro kann die Pflicht zur zeitnahen Mittelverwendung entfallen. Dennoch sollte dokumentiert werden, aus welchen Jahren vorhandene Mittel stammen.

Rücklagen nach § 62 AO:
Zulässige Rücklagen gelten als Ausnahme vom Gebot der zeitnahen Mittelverwendung. Dazu gehören insbesondere zweckgebundene Rücklagen, Betriebsmittelrücklagen, Wiederbeschaffungsrücklagen und freie Rücklagen.

Rücklagenspiegel:
Ein Rücklagenspiegel sollte Art, Zweck, Höhe, Zuführung, Verwendung und Auflösung der Rücklagen nachvollziehbar dokumentieren.

Verwendungsüberhang:
Ein positiver Verwendungsüberhang kann auf eine nicht zeitnahe Mittelverwendung hinweisen. Ein negativer Verwendungsüberhang bedeutet, dass mehr Mittel für steuerbegünstigte Zwecke verwendet wurden, als nach § 55 Abs. 1 Nr. 5 AO erforderlich gewesen wäre.

Review-Hinweise:
- Mittelzuflüsse nach Jahren dokumentieren
- 45.000-Euro-Grenze prüfen
- Rücklagen nach § 62 AO einzeln dokumentieren
- Vorstandsbeschlüsse zur Rücklagenbildung prüfen
- Rücklagenspiegel mit Jahresabschluss abstimmen
- Verwendungsüberhang berechnen und erläutern
- offene Punkte im Review dokumentieren`
},
{
  id: "npo-kanzlei-review-gemeinnuetziger-verein",
  title: "Kanzlei-Review: gemeinnütziger Verein mit Spenden, Beiträgen, Sommerfest, Zuschüssen und Rücklagen",
  short:
    "Strukturierte Review-Vorlage für gemeinnützige Vereine mit Sphärenprüfung, Gemeinnützigkeitsrisiken, Spendenbescheinigungen, Rückfragen und Buchungshinweisen.",
  category: "NPO / Gemeinnützigkeit",
  source: "Interne Steuerstoff-Review-Vorlage – Gemeinnütziger Verein",
  keywords:
    /kanzlei.review|review|gemeinnütziger verein|gemeinnuetziger verein|jugendhilfe|spenden|spendenbescheinigung|zuwendungsbestätigung|zuwendungsbestaetigung|mitgliedsbeiträge|mitgliedsbeitraege|sommerfest|zinserträge|zinsertraege|zuschüsse|zuschuesse|rücklagen|ruecklagen|sphären|sphaeren|mittelverwendung|buchungshinweise|review-hinweise/i,
  references: [
    "§§ 51–68 AO",
    "§ 52 AO",
    "§ 55 AO",
    "§ 60 AO",
    "§ 60a AO",
    "§ 62 AO",
    "§ 63 AO",
    "§ 64 AO",
    "§ 10b EStG",
    "§ 50 EStDV"
  ],
  body: `Kanzlei-Review für einen gemeinnützigen Verein:

Ausgangslage:
Ein gemeinnütziger Verein, z. B. im Bereich Jugendhilfe, erzielt Spenden, Mitgliedsbeiträge, Einnahmen aus Veranstaltungen, Zinserträge und Zuschüsse. Zusätzlich werden Rücklagen gebildet und der Verein möchte Zuwendungsbestätigungen bzw. Spendenbescheinigungen ausstellen.

1. Steuerliche Sphären

Die Einnahmen und Ausgaben sind den steuerlichen Sphären zuzuordnen:

a) Ideeller Bereich:
- echte Mitgliedsbeiträge ohne konkrete Gegenleistung
- Spenden
- Zuschüsse für satzungsmäßige gemeinnützige Zwecke
- Ausgaben für unmittelbare Zweckverwirklichung, z. B. Jugendhilfeprojekte

b) Vermögensverwaltung:
- Zinserträge
- Kapitalerträge
- ggf. Miet- oder Pachterträge aus langfristiger Vermögensnutzung

c) Zweckbetrieb:
- Tätigkeiten, die unmittelbar dem gemeinnützigen Zweck dienen und die Voraussetzungen der §§ 65–68 AO erfüllen
- z. B. konkrete Jugendhilfemaßnahmen, wenn sie wirtschaftlich auftreten, aber dem begünstigten Zweck dienen

d) Wirtschaftlicher Geschäftsbetrieb:
- Sommerfest, Verkauf von Speisen und Getränken, Tombola, Basar oder ähnliche Veranstaltungen mit Marktbezug
- Einnahmen mit konkreter Gegenleistung
- Tätigkeiten außerhalb der unmittelbaren gemeinnützigen Zweckverfolgung

2. Risiken für die Gemeinnützigkeit

Typische Risiken:
- unklare Zuordnung der Einnahmen zu den steuerlichen Sphären
- Spendenbescheinigungen für Zahlungen mit Gegenleistung
- Mittelverwendung außerhalb der Satzungszwecke
- nicht zeitnahe Mittelverwendung
- unzulässige oder nicht dokumentierte Rücklagenbildung
- fehlende Trennung zwischen ideellem Bereich, Zweckbetrieb, Vermögensverwaltung und wirtschaftlichem Geschäftsbetrieb
- private Vorteile oder unangemessene Vergütungen
- fehlende Nachweise über die tatsächliche Geschäftsführung
- Satzung passt nicht mehr zur tatsächlichen Tätigkeit

Ein Verstoß führt nicht automatisch sofort zum Verlust der Gemeinnützigkeit. Er kann aber zu Nachfragen, Auflagen, Korrekturen oder im schweren Fall zum Verlust der Steuerbegünstigung führen.

3. Voraussetzungen für Spendenbescheinigungen

Zuwendungsbestätigungen dürfen nur ausgestellt werden, wenn:
- der Verein steuerbegünstigt anerkannt ist
- ein aktueller Freistellungsbescheid oder Feststellungsbescheid nach § 60a AO vorliegt
- die Satzung gemeinnützigkeitsrechtlich ordnungsgemäß ist
- die tatsächliche Geschäftsführung den Satzungszwecken entspricht
- die Zahlung freiwillig und ohne konkrete Gegenleistung erfolgt
- die Mittel für steuerbegünstigte Zwecke verwendet werden
- das amtliche Muster für Zuwendungsbestätigungen verwendet wird

Keine Spendenbescheinigung bei:
- Eintrittsgeldern
- Verkauf von Speisen oder Getränken
- Sponsoring mit Werbeleistung
- Zahlungen für konkrete Gegenleistungen
- Zahlungen an den wirtschaftlichen Geschäftsbetrieb
- Zahlungen an die Vermögensverwaltung

Bei Kleinspenden bis 300 EUR kann regelmäßig ein vereinfachter Nachweis genügen, z. B. Kontoauszug oder Buchungsbestätigung.

4. Rückfragen an den Mandanten

Für die Prüfung sollten folgende Rückfragen gestellt werden:

Allgemeine Gemeinnützigkeit:
- Liegt ein aktueller Freistellungsbescheid vor?
- Liegt ein Feststellungsbescheid nach § 60a AO vor?
- Welche Satzungszwecke sind aktuell eingetragen?
- Gab es Satzungsänderungen?
- Welche tatsächlichen Tätigkeiten wurden im Jahr durchgeführt?

Spenden und Zuwendungsbestätigungen:
- Für welche Zahlungen sollen Spendenbescheinigungen ausgestellt werden?
- Gab es für einzelne Zahlungen eine Gegenleistung?
- Wurden Spenden zweckgebunden vereinnahmt?
- Sind die Zahlungseingänge vollständig nachweisbar?
- Wurde das amtliche Muster verwendet?
- Wer ist zur Ausstellung berechtigt?

Mitgliedsbeiträge:
- Gibt es eine Beitragsordnung?
- Erhalten Mitglieder konkrete Leistungen für ihren Beitrag?
- Gibt es Sonderbeiträge, Kursgebühren oder Nutzungsentgelte?
- Sind echte und unechte Mitgliedsbeiträge getrennt erfasst?

Sommerfest / Veranstaltung:
- Welche Einnahmen wurden erzielt?
- Wurden Speisen, Getränke, Waren oder Eintritt verkauft?
- Gab es Sponsoring oder Werbung?
- Welche Ausgaben sind angefallen?
- Wurde die Veranstaltung als wirtschaftlicher Geschäftsbetrieb erfasst?

Rücklagen:
- Welche Rücklagen wurden gebildet?
- Gibt es Vorstandsbeschlüsse zur Rücklagenbildung?
- Ist der Zweck der Rücklage dokumentiert?
- Gibt es eine Berechnung der freien Rücklage?
- Gibt es einen Rücklagenspiegel?
- Wurden Mittel zeitnah verwendet?

5. Review-Hinweise für die Akte

In der Arbeitspapierakte sollten dokumentiert werden:
- aktueller Freistellungsbescheid / Feststellungsbescheid
- Satzung und ggf. Satzungsänderungen
- Zuordnung der Einnahmen und Ausgaben zu den Sphären
- Übersicht der ausgestellten Zuwendungsbestätigungen
- Prüfung, ob Zahlungen ohne Gegenleistung erfolgten
- Mittelverwendungsrechnung
- Rücklagenspiegel
- Vorstandsbeschlüsse zu Rücklagen
- Abstimmung der Bankkonten und Zahlungseingänge
- Nachweis über zweckentsprechende Mittelverwendung
- offene Punkte und Rückfragen an den Mandanten

Besonders kritisch zu dokumentieren:
- Zahlungen mit möglicher Gegenleistung
- Einnahmen aus Sommerfest oder Verkauf
- Sponsoring
- zweckgebundene Spenden
- hohe liquide Mittel am Jahresende
- Rücklagen ohne klaren Zweck

6. Mögliche Buchungshinweise

Typische Buchungslogik:

Spenden:
- Zahlungseingang auf Bank gegen Spendenkonto im ideellen Bereich
- Buchungstext mit Spendername und Zweck
- keine Umsatzsteuer, wenn keine Gegenleistung vorliegt

Echte Mitgliedsbeiträge:
- Bank an Mitgliedsbeiträge ideeller Bereich
- keine Umsatzsteuer bei fehlendem Leistungsaustausch

Unechte Mitgliedsbeiträge / Leistungsentgelte:
- Prüfung Umsatzsteuer und steuerliche Sphäre erforderlich
- ggf. wirtschaftlicher Geschäftsbetrieb oder Zweckbetrieb

Zuschüsse:
- Zuordnung nach Zweckbindung
- Zuschüsse für gemeinnützige Tätigkeit regelmäßig ideeller Bereich oder Zweckbetrieb
- Zweckbindung dokumentieren

Zinserträge:
- Bank an Zinserträge Vermögensverwaltung
- Kapitalertragsteuer und Bescheinigungen prüfen

Sommerfest:
- Einnahmen und Ausgaben gesondert erfassen
- regelmäßig wirtschaftlicher Geschäftsbetrieb prüfen
- Umsatzsteuerliche Behandlung prüfen
- Wareneinsatz, Bewirtung, Gagen, Miete und sonstige Kosten getrennt erfassen

Rücklagen:
- Rücklagenbildung nicht nur buchen, sondern auch dokumentieren
- Rücklagenzweck, Höhe und Vorstandsbeschluss festhalten
- Rücklagenspiegel mit Jahresabschluss abstimmen

Kurzfazit:
Der Fall ist nicht pauschal gemeinnützigkeitsrechtlich unproblematisch. Entscheidend sind die saubere Sphärenzuordnung, die Prüfung von Gegenleistungen, die ordnungsgemäße Mittelverwendung, die Dokumentation der Rücklagen und die Berechtigung zur Ausstellung von Zuwendungsbestätigungen.`,
},
{
  id: "npo-satzung-tatsaechliche-geschaeftsfuehrung",
  title: "Gemeinnützigkeit: Satzung und tatsächliche Geschäftsführung",
  short:
    "Prüfung, ob Satzung und tatsächliche Geschäftsführung die Voraussetzungen der Gemeinnützigkeit erfüllen.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Gemeinnützigkeit und Satzung",
  keywords:
    /gemeinnützigkeit|gemeinnuetzigkeit|satzung|mustersatzung|tatsächliche geschäftsführung|tatsaechliche geschaeftsfuehrung|steuerbegünstigung|steuerbeguenstigung|§ 60a|feststellungsbescheid|freistellungsbescheid/i,
  references: ["§§ 51–68 AO", "§ 60 AO", "§ 60a AO", "§ 63 AO"],
  body: `Die Gemeinnützigkeit setzt voraus, dass Satzung und tatsächliche Geschäftsführung auf steuerbegünstigte Zwecke ausgerichtet sind.

Satzungsmäßige Voraussetzungen:
Die Satzung muss die gemeinnützigen Zwecke genau bestimmen. Sie muss erkennen lassen, dass die Körperschaft ausschließlich und unmittelbar steuerbegünstigte Zwecke verfolgt. Die Mustersatzung nach Anlage 1 zu § 60 AO ist verbindlich. Abweichungen oder unklare Formulierungen können die Anerkennung gefährden.

Tatsächliche Geschäftsführung:
Die tatsächliche Geschäftsführung muss der Satzung entsprechen. Entscheidend ist nicht nur der Satzungstext, sondern auch die tatsächliche Mittelverwendung, Dokumentation und organisatorische Umsetzung.

Typische Prüfpunkte:
- Sind die steuerbegünstigten Zwecke in der Satzung klar benannt?
- Entspricht die Satzung der Mustersatzung?
- Liegt ein Feststellungsbescheid nach § 60a AO vor?
- Liegt ein aktueller Freistellungsbescheid oder eine vergleichbare steuerliche Anerkennung vor?
- Stimmen Einnahmen, Ausgaben und Tätigkeiten mit Satzung und Zweckverfolgung überein?
- Werden Mittel zeitnah und zweckentsprechend verwendet?
- Sind wirtschaftliche Tätigkeiten sauber von ideellem Bereich, Zweckbetrieb und Vermögensverwaltung abgegrenzt?

Review-Hinweise:
- Satzung mit aktuellem Bescheid abgleichen
- Satzungszwecke mit tatsächlichen Tätigkeiten vergleichen
- Mittelverwendung anhand Buchführung und Belegen prüfen
- Abweichungen dokumentieren
- Bei unklarer Zweckverfolgung steuerliche Anerkennung kritisch prüfen`,
},
{
  id: "npo-zuwendungsbestaetigungen-spendenbescheinigungen",
  title: "Zuwendungsbestätigungen und Spendenbescheinigungen",
  short:
    "Voraussetzungen, Pflichtangaben und Risiken bei der Ausstellung von Zuwendungsbestätigungen.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Zuwendungsbestätigungen",
  keywords:
    /zuwendungsbestätigung|zuwendungsbestaetigung|spendenbescheinigung|spende|spendenabzug|amtliches muster|vereinfachter nachweis|300 euro|haftung|mittelverwendung|§ 10b|§ 50 estdv/i,
  references: ["§ 10b EStG", "§ 50 EStDV", "§ 63 AO", "§ 60a AO"],
  body: `Zuwendungsbestätigungen dürfen nur ausgestellt werden, wenn der Verein bzw. die Körperschaft zur Ausstellung berechtigt ist und die Zuwendung steuerbegünstigten Zwecken dient.

Grundvoraussetzungen:
- Die Körperschaft muss steuerbegünstigt anerkannt sein.
- Die Satzung muss gemeinnützige Zwecke korrekt abbilden.
- Die tatsächliche Geschäftsführung muss den steuerbegünstigten Zwecken entsprechen.
- Die Zuwendung muss dem ideellen Bereich oder einem steuerbegünstigten Zweckbetrieb zugutekommen.
- Für Zuwendungen an Vermögensverwaltung oder wirtschaftlichen Geschäftsbetrieb dürfen grundsätzlich keine Spendenbescheinigungen ausgestellt werden.

Formelle Anforderungen:
Es ist das amtliche Muster zu verwenden. Die Bestätigung muss insbesondere Angaben enthalten zu:
- Name und Anschrift des Zuwendenden
- Betrag oder Art der Zuwendung
- Datum der Zuwendung
- steuerbegünstigtem Zweck
- Bestätigung der ausschließlichen und unmittelbaren Verwendung
- Unterschrift einer berechtigten Person oder maschineller Bestätigung nach den Vorgaben

Vereinfachter Nachweis:
Bei Zuwendungen bis 300 EUR kann regelmäßig ein vereinfachter Nachweis durch Bareinzahlungsbeleg oder Buchungsbestätigung genügen.

Haftung und Risiken:
Bei vorsätzlich oder grob fahrlässig falsch ausgestellten Zuwendungsbestätigungen kann eine Haftung für entgangene Steuer entstehen. Zusätzlich können bei schwerwiegenden Fehlern gemeinnützigkeitsrechtliche Risiken entstehen.

Typische Fehler:
- Ausstellung ohne gültigen steuerlichen Anerkennungsnachweis
- falscher oder unvollständiger Spendenzweck
- Bescheinigung für nicht begünstigte Tätigkeiten
- fehlende tatsächliche Mittelverwendung
- unklare Zuordnung zwischen ideellem Bereich, Zweckbetrieb, Vermögensverwaltung und wirtschaftlichem Geschäftsbetrieb
- Bescheinigung für Leistungen mit Gegenleistung

Review-Hinweise:
- Aktuellen Freistellungs- oder Feststellungsbescheid prüfen
- Spendenzweck mit Satzung abgleichen
- Zahlungseingang und Betrag nachweisen
- Mittelverwendung dokumentieren
- Keine Bescheinigung bei Gegenleistung oder nicht begünstigtem Bereich ausstellen`,
},
{
  id: "npo-sphaeren-umsatzzuordnung-review",
  title: "Zuordnung von Einnahmen und Ausgaben zu NPO-Sphären",
  short:
    "Einordnung von Einnahmen, Ausgaben und Mittelverwendung in ideellen Bereich, Vermögensverwaltung, Zweckbetrieb und wirtschaftlichen Geschäftsbetrieb.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Sphären und Mittelverwendung",
  keywords:
    /sphäre|sphaere|ideeller bereich|vermögensverwaltung|vermoegensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|wirtschaftlicher geschaeftsbetrieb|mittelverwendung|einnahmen|ausgaben|rücklagen|ruecklagen/i,
  references: ["§ 14 AO", "§§ 64–68 AO", "§ 62 AO"],
  body: `Gemeinnützige Körperschaften müssen Einnahmen und Ausgaben den steuerlichen Sphären zutreffend zuordnen.

Die vier Sphären:
1) Ideeller Bereich:
Unmittelbare Verfolgung der gemeinnützigen Satzungszwecke ohne wirtschaftliche Tätigkeit. Beispiele können Mitgliedsbeiträge ohne konkrete Gegenleistung, Spenden und Zuschüsse für gemeinnützige Zwecke sein.

2) Vermögensverwaltung:
Verwaltung eigenen Vermögens, z. B. Zinsen, Dividenden, Miet- oder Pachteinnahmen, soweit keine aktive gewerbliche Tätigkeit vorliegt.

3) Zweckbetrieb:
Wirtschaftliche Tätigkeit, die dem gemeinnützigen Zweck dient und die Voraussetzungen der §§ 65–68 AO erfüllt.

4) Wirtschaftlicher Geschäftsbetrieb:
Marktbezogene wirtschaftliche Tätigkeiten außerhalb der steuerbegünstigten Zweckverfolgung. Diese können steuerpflichtig sein.

Grundsatz:
Die Zuordnung richtet sich nach dem konkreten Sachverhalt, nicht nur nach der Bezeichnung in der Buchhaltung. Entscheidend sind Zweck, Gegenleistung, Marktbezug, tatsächliche Durchführung und Verwendung der Mittel.

Mittelverwendung:
Mittel des Vereins dürfen grundsätzlich nur für satzungsmäßige steuerbegünstigte Zwecke verwendet werden. Ausgaben müssen der passenden Sphäre zugeordnet und dokumentiert werden.

Rücklagen:
Rücklagen sind nur zulässig, wenn sie gesetzlich erlaubt, wirtschaftlich begründet oder für konkrete steuerbegünstigte Vorhaben vorgesehen sind. Die Bildung und Verwendung sollte dokumentiert werden.

Review-Hinweise:
- Einnahmen nach Herkunft und Gegenleistung prüfen
- Ausgaben nach Zweck und Veranlassung zuordnen
- Zweckbetrieb von wirtschaftlichem Geschäftsbetrieb abgrenzen
- Vermögensverwaltung von aktiver gewerblicher Tätigkeit abgrenzen
- Mittelverwendung mit Satzung und Bescheiden abstimmen
- Rücklagenzweck und Rücklagenhöhe dokumentieren
- Unklare Fälle im Review festhalten`,
},
{
  id: "verein-mitgliedsbeitraege-echt-unecht",
  title: "Echte und unechte Mitgliedsbeiträge",
  short:
    "Abgrenzung von echten Mitgliedsbeiträgen ohne Gegenleistung und unechten Beiträgen mit Leistungsbezug.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Mitgliedsbeiträge",
  keywords:
    /mitgliedsbeitrag|mitgliedsbeiträge|echter mitgliedsbeitrag|unechter mitgliedsbeitrag|grundbeitrag|beitrag|leistungsaustausch|gegenleistung|umsatzsteuer|verein/i,
  references: ["UStG", "AO", "Vereinsbesteuerung"],
  body: `Mitgliedsbeiträge sind steuerlich danach zu prüfen, ob ein echter Beitrag ohne konkrete Gegenleistung oder ein unechter Beitrag mit Leistungsbezug vorliegt.

Echter Mitgliedsbeitrag:
Ein echter Mitgliedsbeitrag dient allgemein der Mitgliedschaft und Finanzierung des Vereins. Es besteht kein unmittelbarer Zusammenhang mit einer konkreten Leistung an das einzelne Mitglied. In diesem Fall liegt regelmäßig kein Leistungsaustausch vor.

Unechter Mitgliedsbeitrag:
Ein unechter Mitgliedsbeitrag liegt vor, wenn das Mitglied für den Beitrag eine konkrete, individualisierbare Leistung erhält. Dann kann ein steuerbarer Leistungsaustausch vorliegen.

Prüfkriterien:
- Gibt es eine konkrete Gegenleistung für den Beitrag?
- Ist der Beitrag pauschal für die Mitgliedschaft geschuldet?
- Erhält das Mitglied besondere Vorteile, Nutzungsrechte oder Leistungen?
- Werden Leistungen gesondert abgerechnet?
- Gibt es unterschiedliche Beitragshöhen wegen konkreter Leistungsnutzung?

Beispiele:
- Allgemeiner Grundbeitrag ohne Sonderleistung: eher echter Mitgliedsbeitrag.
- Beitrag für konkrete Veranstaltungsteilnahme, Nutzung einer Einrichtung oder Sonderleistung: kritisch prüfen.
- Kombinierte Beiträge müssen gegebenenfalls aufgeteilt werden.

Review-Hinweise:
- Satzung und Beitragsordnung prüfen
- Beitragstatbestand mit tatsächlicher Leistung vergleichen
- Sonderleistungen gesondert erfassen
- Umsatzsteuerliche Folgen bei Leistungsaustausch prüfen
- Dokumentieren, warum ein Beitrag als echt oder unecht eingeordnet wird`,
},
{
  id: "bilanzierung-anzahlungen-herstellungskosten",
  title: "Bilanzierung: Erhaltene Anzahlungen und Herstellungskosten",
  short:
    "Erhaltene Anzahlungen werden nicht von aktivierten Herstellungskosten abgezogen, sondern grundsätzlich passiviert.",
  category: "Jahresabschluss",
  source: "beck-chat Arbeitsnotiz – Anzahlungen und Herstellungskosten",
  keywords:
    /anzahlung|anzahlungen|erhaltene anzahlung|herstellungskosten|aktivierte herstellungskosten|bilanzierung|passivierung|verbindlichkeit|bestandsveränderung|bestandsveraenderung/i,
  references: ["HGB", "Bilanzierung", "Jahresabschluss"],
  body: `Erhaltene Anzahlungen und aktivierte Herstellungskosten sind bilanziell getrennt zu beurteilen.

Aktivierte Herstellungskosten:
Herstellungskosten werden aktiviert, wenn die Voraussetzungen für die Aktivierung erfüllt sind. Maßgeblich sind die angefallenen Aufwendungen für die Herstellung des Vermögensgegenstands.

Erhaltene Anzahlungen:
Erhaltene Anzahlungen sind grundsätzlich als Verbindlichkeit bzw. Passivposten zu erfassen. Sie mindern nicht automatisch die aktivierten Herstellungskosten.

Keine Saldierung:
Die erhaltene Anzahlung wird nicht einfach von den Herstellungskosten abgezogen. Herstellungskosten und erhaltene Anzahlungen werden getrennt ausgewiesen, soweit keine besonderen Saldierungsvorschriften greifen.

Praktische Folge:
- Herstellungskosten erhöhen den Aktivposten.
- Erhaltene Anzahlungen werden passiviert.
- Die Gewinnwirkung ergibt sich erst nach den einschlägigen Bilanzierungs- und Realisationsgrundsätzen.

Review-Hinweise:
- Vertragliche Grundlage der Anzahlung prüfen
- Zeitpunkt des Zahlungseingangs dokumentieren
- Aktivierungsfähigkeit der Herstellungskosten prüfen
- Keine ungeprüfte Verrechnung mit Herstellungskosten vornehmen
- Ausweis im Jahresabschluss abstimmen`,
},
{
  id: "npo-demokratisches-staatswesen-foerderung",
  title: "Förderung des demokratischen Staatswesens nach § 52 Abs. 2 Nr. 24 AO",
  short:
    "Einordnung förderfähiger und nicht förderfähiger Aktivitäten im Bereich demokratisches Staatswesen.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Demokratisches Staatswesen",
  keywords:
    /demokratisches staatswesen|demokratie|§ 52 abs. 2 nr. 24 ao|politische bildung|rechtsstaatlichkeit|meinungsfreiheit|pluralismus|parteipolitisch|kommunalpolitisch/i,
  references: ["§ 52 Abs. 2 Nr. 24 AO"],
  body: `Die allgemeine Förderung des demokratischen Staatswesens kann nach § 52 Abs. 2 Nr. 24 AO gemeinnützig sein.

Begünstigt sind Tätigkeiten, die sich objektiv und neutral mit demokratischen Grundprinzipien befassen. Dazu können insbesondere die Vermittlung von Gewaltenteilung, Meinungsfreiheit, Rechtsstaatlichkeit, Toleranz und Pluralismus gehören.

Förderfähige Maßnahmen:
- Seminare, Tagungen, Kolloquien und Diskussionsveranstaltungen
- politische Bildungsarbeit mit neutralem und überparteilichem Charakter
- Vermittlung demokratischer Grundwerte
- Aufklärung über rechtsstaatliche und demokratische Strukturen
- Bildungsangebote ohne parteipolitische Zielrichtung

Nicht förderfähig:
Nicht begünstigt sind Tätigkeiten, die nur bestimmte Einzelinteressen staatsbürgerlicher Art verfolgen oder auf den kommunalpolitischen Bereich beschränkt sind. Ebenfalls kritisch sind parteipolitische Ziele, Wahlwerbung oder einseitige politische Einflussnahme.

Abgrenzung:
Die Tätigkeit muss allgemein auf demokratische Bildung und das demokratische Staatswesen gerichtet sein. Sie darf nicht primär der Durchsetzung einzelner politischer Forderungen, Parteiziele oder kommunaler Einzelinteressen dienen.

Review-Hinweise:
- Satzungszweck mit § 52 Abs. 2 Nr. 24 AO abgleichen
- Neutralität und Überparteilichkeit prüfen
- Inhalte der Veranstaltungen dokumentieren
- Keine Wahlwerbung oder Parteiförderung
- Kommunalpolitische Einzelinteressen abgrenzen
- Bildungscharakter hervorheben`,
},
  {
    id: "zeitnahe-mittelverwendung",
    title: "Zeitnahe Mittelverwendung (§ 55 Abs. 1 Nr. 5 AO)",
    short:
      "Verwendungspflicht innerhalb von zwei Folgejahren, 45.000-€-Ausnahme, Nachweis über Mittelverwendungsrechnung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Zeitnahe Mittelverwendung und Mittelverwendungsrechnung.",
    keywords: /zeitnahe? mittelverwendung|mittelverwendungsrechnung|§\s*55\s*ao|45\.?000\s*€/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO", "§ 62 AO", "§ 63 Abs. 4 AO"],
    body: `Gemeinnützige Körperschaften müssen ihre Mittel zeitnah für die satzungsmäßigen Zwecke verwenden. Maßgeblich ist § 55 Abs. 1 Nr. 5 AO.

Fristen:
- Verwendung spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren (seit Ehrenamtsstärkungsgesetz, gilt für Zuflüsse nach dem 31.12.2011).
- Ausnahme für kleine Körperschaften: kumulierte Einnahmen aller Sphären ≤ 45.000 € — keine Pflicht zur zeitnahen Mittelverwendung; trotzdem Nachweis erforderlich, dass Altmittel aus Jahren ≤ 45.000 € stammen.

Was sind „Mittel“:
- Spenden, Mitgliedsbeiträge, Zuschüsse, Bruttoeinnahmen des ideellen Bereichs.
- Gewinne aus Zweckbetrieb und wirtschaftlichem Geschäftsbetrieb.
- Überschüsse der Vermögensverwaltung.
- Nicht: Grundstockvermögen / Einlagen der Stifter bei Stiftungen.

Nachweis: Mittelverwendungsrechnung (MVR) als Nebenrechnung zum Jahresabschluss; freie Gestaltung, aber Saldo-/Globalbetrachtung über alle zeitnah zu verwendenden Mittel. Pflichtbestandteile: Mittelvortrag aus den zwei Vorjahren, Rücklagenspiegel, Verwendungsüberhang.

Verstoß: keine sofortige Aberkennung der Gemeinnützigkeit. Das Finanzamt kann nach § 63 Abs. 4 AO eine angemessene Verwendungsfrist (oft bis zu drei Jahren) setzen. Erst wiederholte oder schwere Verstöße gefährden die Gemeinnützigkeit.`,
  },
  {
    id: "freie-ruecklage",
    title: "Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO)",
    short:
      "Bis zu 1/3 des VV-Überschusses + 10 % der sonstigen zeitnah zu verwendenden Mittel; Nachholung in zwei Folgejahren.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Zusatzarbeitspapier — Freie Rücklage gUG → gGmbH.",
    keywords: /freie? rücklage|§\s*62\s*abs\.?\s*1\s*nr\.?\s*3|§\s*62\s*ao/i,
    references: ["§ 62 Abs. 1 Nr. 3 AO", "§ 55 AO", "§ 5a Abs. 3 GmbHG"],
    body: `Die freie Rücklage nach § 62 Abs. 1 Nr. 3 AO ist die flexibelste Rücklagenart. Ihre Bildung gilt als zulässige Mittelverwendung; die zugeführten Mittel sind dem Gebot der zeitnahen Mittelverwendung entzogen.

Jährliche Höchstzuführung:
- Bis zu einem Drittel des Überschusses aus der Vermögensverwaltung.
- Zusätzlich bis zu 10 % der sonstigen zeitnah zu verwendenden Mittel (ideeller Bereich, Zweckbetrieb, wGB).
- Nicht ausgeschöpfte Höchstbeträge können in den zwei Folgejahren nachgeholt werden.

Gesamthöhe der freien Rücklage ist unbegrenzt; sie kann dauerhaft erhalten bleiben und z. B. für Darlehen, Beteiligungen, Investitionen oder Kapitalerhöhungen aus Gesellschaftsmitteln verwendet werden.

Nicht zulässig: Verlustabdeckung in Vermögensverwaltung oder wGB aus der freien Rücklage.

Sonderfall gUG → gGmbH: Die gesetzliche Rücklage nach § 5a Abs. 3 GmbHG (25 % des Jahresüberschusses bis 25.000 €) verstößt nach Auffassung der Finanzverwaltung nicht gegen § 55 AO. Für die Kapitalerhöhung aus Gesellschaftsmitteln müssen die Mittel zuvor zulässig in eine § 62 AO-Rücklage (insbesondere die freie Rücklage) eingestellt sein. Beschluss und Zuführung lückenlos dokumentieren.`,
  },
  {
    id: "ruecklagen-katalog",
    title: "Rücklagen nach § 62 AO — Überblick",
    short:
      "Zweckgebundene, Wiederbeschaffungs-, freie und Beteiligungs­rücklage — Voraussetzungen, Nachweise, Auflösung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Interne NPO-Checkliste (Rücklagen) und Arbeitspapier Mittelverwendung.",
    keywords: /rücklage|zweckgebunden|wiederbeschaffung|betriebsmittelrücklage|§\s*62/i,
    references: ["§ 62 AO", "§ 63 Abs. 4 AO"],
    body: `§ 62 AO kennt vier Rücklagenarten:

1) Zweckgebundene Rücklage (Abs. 1 Nr. 1) — für ein konkret geplantes, definiertes Vorhaben. Voraussetzungen: konkrete Zeit- und Finanzierungs­vorstellungen, dokumentierter Beschluss. Auflösungspflicht, sobald das Projekt aufgegeben oder abgeschlossen ist; frei werdende Mittel unterliegen wieder der zeitnahen Verwendung.

2) Betriebsmittelrücklage (Unterfall Nr. 1) — Liquiditätssicherung für periodisch wiederkehrende Ausgaben (Gehälter, Miete, Energie). Höhe orientiert sich am Bedarf eines angemessenen Zeitraums (i. d. R. 3–12 Monate).

3) Wiederbeschaffungsrücklage (Abs. 1 Nr. 2) — für die Ersatzbeschaffung von Wirtschaftsgütern. Höhe regelmäßig an der jährlichen AfA orientiert; höhere Beträge nur mit nachvollziehbarem Mehrbedarf.

4) Freie Rücklage (Abs. 1 Nr. 3) — siehe eigener Eintrag.

5) Rücklage zum Erwerb von Gesellschaftsrechten (Abs. 1 Nr. 4) — zur Erhaltung der prozentualen Beteiligungs­quote bei Kapitalerhöhungen.

Formales:
- Beschluss des zuständigen Organs.
- Bildung und Verwendung in der MVR und im Rücklagenspiegel transparent abbilden.
- Bei Wegfall des Rücklagengrundes: unverzügliche Auflösung.

Audit-Risiken: dauerhaft hohe Mittelbestände ohne erkennbares Projekt, langjährig unveränderte Rücklagen, pauschal angesetzte Audit-/Rückforderungs­rücklagen ohne Vertragsgrundlage.`,
  },
  {
    id: "darlehen-npo",
    title: "Darlehensvergabe durch gemeinnützige Organisationen",
    short:
      "Aus zeitnah zu verwendenden Mitteln nur zur unmittelbaren Zweckverwirklichung; sonst aus freier Rücklage zu marktüblichen Konditionen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Darlehensvergabe durch gemeinnützige Organisationen.",
    keywords: /darlehen|kredit\s+(an|von)\s+(verein|stiftung|tochter|ggmbh|gug)/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO", "§ 58 Nr. 1 AO", "§ 62 Abs. 1 Nr. 3 AO"],
    body: `Die Vergabe von Darlehen ist kein gemeinnütziger Zweck. Zulässigkeit hängt entscheidend von der Herkunft der Mittel ab.

Aus zeitnah zu verwendenden Mitteln nur zulässig, wenn:
- das Darlehen unmittelbar einen Satzungszweck verwirklicht (Schuldnerberatung, Stipendien, Instrumente für Nachwuchskünstler) und zinslos/zinsverbilligt vergeben wird, oder
- es an eine andere steuerbegünstigte Körperschaft im Rahmen des § 58 Nr. 1 AO geht und diese die Mittel ihrerseits zeitnah satzungsgemäß verwendet.

Aus nicht zeitnah zu verwendenden Mitteln (insb. freie Rücklage, Vermögens­zuführungen):
- für Vermögensanlage, Kapitalausstattung von Tochtergesellschaften, Liquiditätshilfen.
- An nicht-gemeinnützige Empfänger zwingend marktüblich verzinst — sonst verdeckte Gewinnausschüttung oder Mittel­fehlverwendung.

Rückflüsse: Tilgungen und Zinsen müssen, sobald sie der Körperschaft zufließen, wieder zeitnah für satzungsgemäße Zwecke verwendet werden.

Dokumentation: schriftlicher Vertrag mit Laufzeit, Tilgung, Verzinsung; Beschluss des Organs; Eintrag in MVR/Rücklagenspiegel.`,
  },
  {
    id: "reverse-charge-npo",
    title: "Reverse Charge bei gemeinnützigen Körperschaften (§ 13b UStG)",
    short:
      "Auch ideeller Bereich, Kleinunternehmer und ausschließlich steuerfreie NPOs schulden die USt — Vorsteuerabzug meist ausgeschlossen.",
    category: "Umsatzsteuer",
    source: "Beitrag von Maydell, npoR 2022, 190 — interne Verarbeitung.",
    keywords: /reverse[\s-]?charge|§\s*13b|ausländische[rn]?\s+(dienstleister|unternehmer|leistung)|leistung\s+aus\s+dem\s+ausland/i,
    references: ["§ 13b UStG", "§ 3a Abs. 2 UStG", "§ 15 Abs. 2 UStG", "§ 19 UStG"],
    body: `Reverse Charge ist für gemeinnützige Körperschaften eine besondere Falle, weil:

1) Seit 2011 ist die Ortsbestimmung des § 3a Abs. 2 UStG auch dann anwendbar, wenn die Leistung ausschließlich für den nichtunternehmerischen / ideellen Bereich bezogen wird. Eine sonstige Leistung eines ausländischen Unternehmers an eine NPO mit USt-IdNr. oder eine NPO, die im Übrigen Unternehmerin ist, ist regelmäßig im Inland steuerbar.

2) Auch Kleinunternehmer (§ 19 UStG) und ausschließlich steuerfrei tätige NPOs schulden die USt nach § 13b UStG. Die Kleinunternehmer­regelung gilt nicht für ausländische Leistende.

3) Eine bereits in Rechnung gestellte ausländische USt mindert die Bemessungs­grundlage nicht — sie erhöht sie nach h. M., weil sie Teil der Gegenleistung ist.

4) Der Vorsteuerabzug ist regelmäßig ausgeschlossen, weil die Eingangsleistungen für den ideellen Bereich, steuerfreie Umsätze oder den unentgeltlichen Zweckbetrieb verwendet werden (§ 15 Abs. 2 UStG). Daher wird Reverse Charge bei NPOs faktisch zur echten Kostenbelastung.

Typische Risikofälle: Werbeleistungen großer Tech-Anbieter mit Sitz in Irland/USA, Freelancer im Ausland, Webentwicklung, SaaS, Beratungsleistungen, Hilfspersonen bei Auslands­projekten (§ 57 Abs. 1 S. 2 AO). Achtung: Eine USt-IdNr. löst auch bei nichtunternehmerisch tätigen Körperschaften die Ortsverlagerung ins Inland aus (§ 3a Abs. 2 S. 3 UStG) — daher nicht unüberlegt beantragen.

Ausnahmen vom Empfängerort: grundstücksbezogene Leistungen (§ 3a Abs. 3 Nr. 1 UStG) — Ort liegt dort, wo das Grundstück liegt; ausländische Bauleistung am inländischen Grundstück löst stets deutsche USt aus.`,
  },
  {
    id: "vermietung-vv-wgb",
    title: "Vermietung: Vermögensverwaltung vs. wirtschaftlicher Geschäftsbetrieb",
    short:
      "Langfristige Raumvermietung = VV; Kurzfristigkeit, Sonderleistungen oder Inventardominanz kippen in den wGB.",
    category: "Umsatzsteuer",
    source: "Internes Arbeitspapier — Vermietung von Immobilien und Mobilien.",
    keywords: /vermiet|verpacht|co[-\s]?working|betriebsvorrichtung|§\s*4\s*nr\.?\s*12|§\s*9\s*ustg/i,
    references: ["§ 14 AO", "§ 4 Nr. 12 UStG", "§ 9 UStG", "§ 12 Abs. 2 Nr. 8a UStG", "§ 15a UStG"],
    body: `Ertragsteuerliche Einordnung:
- Vermögensverwaltung (§ 14 S. 3 AO): langfristige Vermietung unbeweglichen Vermögens ohne wesentliche Nebenleistungen.
- Wirtschaftlicher Geschäftsbetrieb (§ 14 S. 1 AO): Kurzfristigkeit, ständiger Mieterwechsel, Sonderleistungen (Reinigung während Mietzeit, Personalgestellung, Bewirtung), oder Einzel­vermietung beweglicher Wirtschaftsgüter.
- Sachinbegriff (möblierte Räume / vollausgestattetes Büro) bleibt VV, solange keine aktiven Zusatzleistungen erbracht werden.

Co-Working:
- Service-Pakete, Empfang, IT, Community → wGB (19 % USt).
- Reine Langfristüberlassung möblierter Räume mit Nebenkosten kann VV sein.

Umsatzsteuer:
- Grundsatz: steuerfrei nach § 4 Nr. 12 Buchst. a UStG.
- Zwingend steuerpflichtig: kurzfristige Beherbergung, Fahrzeug­abstellplätze, Betriebsvorrichtungen.
- Option nach § 9 UStG nur, wenn Mieter Unternehmer ist und das Grundstück (mindestens 95 %, Bagatellgrenze) für vorsteuer­abzugs­berechtigte Umsätze nutzt. Teiloption auf abgrenzbare Gebäudeteile zulässig.
- Altfallregelung § 27 Abs. 2 UStG: bei Baubeginn vor 11.11.1993 entfällt die Einschränkung des § 9 Abs. 2 UStG — Option auch bei Vermietung an Ärzte/NPOs möglich. Entfällt bei sanierungsbedingtem „Neubau“.

Steuersatz bei NPOs:
- VV und Zweckbetrieb: ermäßigt 7 % (§ 12 Abs. 2 Nr. 8a UStG).
- wGB: regulär 19 %.

Betriebsvorrichtungen: nach neuer Rechtsprechung kann die Überlassung gemeinsam mit dem Gebäude als einheitliche Nebenleistung steuerfrei werden — mit Folge, dass die Vorsteuer aus deren Anschaffung verloren geht. Bei Inventar­dominanz: sonstige Leistung eigener Art, 19 %.

§ 15a UStG: Nutzungsänderung (z. B. Wechsel zu steuerfreiem Mieter) löst Vorsteuer­berichtigung über 10 Jahre aus.`,
  },
  {
    id: "57-abs-3-ao",
    title: "§ 57 Abs. 3 AO — Servicegesellschaften und EuGH-Vorlage",
    short:
      "Doppeltes Satzungserfordernis abgelehnt; BFH hat 2025 die Europarechts­konformität der Norm dem EuGH vorgelegt.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rechtsentwicklung Servicegesellschaften § 57 Abs. 3 AO (BFH V R 22/23).",
    keywords: /§\s*57\s*abs\.?\s*3|servicegesellschaft|planmäßiges zusammenwirken|kostenteilungsgemeinschaft|§\s*4\s*nr\.?\s*29/i,
    references: ["§ 57 Abs. 3 AO", "§ 4 Nr. 29 UStG", "BFH 22.05.2025 – V R 22/23"],
    body: `§ 57 Abs. 3 AO erlaubt seit dem JStG 2020 das „planmäßige Zusammenwirken“ mehrerer steuerbegünstigter Körperschaften. Eine Servicegesellschaft (z. B. gGmbH für Buchhaltung, IT, Personal) kann selbst gemeinnützig sein, wenn die Kooperation in ihrer Satzung verankert ist.

Doppeltes Satzungserfordernis: Die Finanzverwaltung hatte gefordert, dass die Kooperation auch in den Satzungen der Leistungs­empfänger steht. FG Hamburg (26.09.2023 – 5 K 11/23) und tendenziell auch der BFH lehnen dies ab — die Satzung der leistenden Körperschaft genügt.

EuGH-Vorlage (BFH 22.05.2025 – V R 22/23): Der BFH zweifelt, ob § 57 Abs. 3 AO mit dem EU-Beihilferecht (Art. 107, 108 AEUV) vereinbar ist. Die Norm wurde ohne Notifizierung bei der Kommission eingeführt. Vorlagefragen: (1) Beihilfe? (2) Neutralisieren die gemeinnützigkeits­rechtlichen Beschränkungen den selektiven Vorteil? (3) Notifizierungs­pflichtige Neu- oder Umgestaltung?

Praxis bis zur EuGH-Entscheidung:
- Bestehende Strukturen: Verrechnungspreise nach Fremdvergleich dokumentieren, ggf. Rückstellungen für Steuernach­zahlungen bilden, hilfsweise Kriterien einer Kostenteilungs­gemeinschaft nach § 4 Nr. 29 UStG prüfen.
- Neugründungen: Vorrangig Kostenteilungs­gemeinschaft nach § 4 Nr. 29 UStG strukturieren — sie beruht direkt auf EU-Recht (Art. 132 Abs. 1 Buchst. f MwStSystRL) und ist nicht vom Beihilferisiko betroffen (BFH 04.09.2024 – XI R 37/21).
- Hybridmodelle: Servicegesellschaft, deren Geschäftsmodell zugleich § 4 Nr. 29 UStG erfüllt.
- USt-Härtefallklauseln in Verträgen aufnehmen.`,
  },
  {
    id: "tatigkeitsbericht",
    title: "Tätigkeitsbericht und tatsächliche Geschäftsführung",
    short:
      "Pflicht­nachweis der satzungs­gemäßen Mittelverwendung; Abgleich mit Buchhaltung und Sphären­zuordnung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes NPO-Handout (Abschnitt 5).",
    keywords: /tätigkeitsbericht|tatsächliche geschäftsführung/i,
    references: ["§ 63 AO"],
    body: `Der Tätigkeitsbericht weist die tatsächliche Geschäftsführung nach (§ 63 AO). Er muss zur Buchhaltung, zur Mittelverwendung und zur Sphären­zuordnung passen.

Im Mandat prüfen:
- Liegt für das Geschäftsjahr ein Tätigkeitsbericht vor?
- Sind die wesentlichen Tätigkeiten beschrieben und einer Sphäre zuzuordnen?
- Werden Investitionen, Rücklagenbildung und größere Mittel­bewegungen erläutert?

Risiken: Fehlt der Bericht oder weicht er von der Buchhaltung ab, drohen Rückfragen des Finanzamts, im Wiederholungsfall Aberkennung der Gemeinnützigkeit.`,
  },
  // ===== NPO / Mittelverwendungsrechnung — vertiefende Wissenskarten =====
  {
    id: "mvr-zeitnahe-mittelverwendung",
    title: "Zeitnahe Mittelverwendung",
    short:
      "Mittel gemeinnütziger Körperschaften müssen grundsätzlich zeitnah für steuerbegünstigte satzungsmäßige Zwecke verwendet werden.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Mittelverwendung (Kapitel 1).",
    keywords: /zeitnahe?\s+mittelverwendung|selbstlosigkeit|zwei[-\s]?jahres[-\s]?frist/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO"],
    body: `Grundsatz der Selbstlosigkeit (§ 55 AO): Eine gemeinnützige Körperschaft darf in erster Linie keine eigenwirtschaftlichen Zwecke verfolgen. Daraus folgt die Pflicht, die ihr zufließenden Mittel zeitnah für die steuerbegünstigten satzungsmäßigen Zwecke einzusetzen.

Zwei-Jahres-Frist: Mittel müssen spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren verwendet werden (§ 55 Abs. 1 Nr. 5 S. 3 AO). Beispiel: Zufluss 2024 → Verwendung bis Ende 2026.

Zweck der Regelung: Vermeidung unzulässiger Mittelhortung. Die Mittel sollen tatsächlich dem geförderten Zweck zugutekommen und nicht dauerhaft im Vermögen der Körperschaft verbleiben.

Review-Hinweis: Die zeitnahe Mittelverwendung ist über eine Mittelverwendungsrechnung (MVR) nachzuweisen. Ein positiver Verwendungsüberhang führt nicht automatisch zum Verlust der Gemeinnützigkeit, kann aber Anlass für eine Verwendungsauflage des Finanzamts (§ 63 Abs. 4 AO) sein.`,
  },
  {
    id: "mvr-45000-grenze",
    title: "45.000-€-Grenze",
    short:
      "Kleine Körperschaften mit Einnahmen bis 45.000 € sind nach der hinterlegten Logik von der Pflicht zur zeitnahen Mittelverwendung ausgenommen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Mittelverwendung, Schwellenprüfung.",
    keywords: /45\.?000|kleine körperschaft|bagatellgrenze\s+mittelverwendung/i,
    references: ["§ 55 Abs. 1 Nr. 5 S. 4 AO"],
    body: `Liegen die jährlichen Einnahmen einer Körperschaft insgesamt bei höchstens 45.000 €, entfällt die Pflicht zur zeitnahen Mittelverwendung.

Kumulierte Betrachtung — einzubeziehen sind die Einnahmen aller vier Sphären:
- ideeller Bereich (Spenden, Beiträge, Zuschüsse, Bruttoeinnahmen),
- Zweckbetrieb,
- Vermögensverwaltung,
- steuerpflichtiger wirtschaftlicher Geschäftsbetrieb.

Praxis: Die Befreiung greift jahresbezogen. Wer einmal die Schwelle überschreitet, fällt für dieses Jahr aus der Befreiung. Eine freiwillige Mittelverwendungsrechnung ist auch unterhalb der Grenze sinnvoll, weil sie bei späterem Wachstum nahtlos fortgeführt werden kann und Mittelherkunftsnachweise erleichtert.

Review-Hinweis: Befreiung nicht mit Aufzeichnungspflichten verwechseln. Tätigkeitsbericht, ordnungsgemäße Buchführung und Sphärenabgrenzung sind weiterhin erforderlich.`,
  },
  {
    id: "mvr-mittelbegriff",
    title: "Mittelbegriff",
    short:
      "Mittel umfassen grundsätzlich sämtliche Vermögenswerte der Körperschaft.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Definition Mittel.",
    keywords: /mittelbegriff|was sind mittel|grundstockvermögen/i,
    references: ["§ 55 Abs. 1 AO", "§ 62 Abs. 3 AO"],
    body: `„Mittel" im Sinne des § 55 AO sind grundsätzlich sämtliche Vermögenswerte der Körperschaft, insbesondere:

- Spenden,
- Mitgliedsbeiträge,
- Zuschüsse,
- Gewinne aus Zweckbetrieb,
- Gewinne aus steuerpflichtigem wirtschaftlichem Geschäftsbetrieb,
- Überschüsse aus Vermögensverwaltung,
- Bruttoeinnahmen des ideellen Bereichs.

Ausnahme: Das Grundstockvermögen einer Stiftung sowie Stiftungseinlagen und ausdrücklich der Vermögensausstattung gewidmete Zuwendungen unterliegen nicht der zeitnahen Mittelverwendung (§ 62 Abs. 3 AO). Sie sind in der MVR getrennt auszuweisen.

Review-Hinweis: Bei Sachzuwendungen ist der gemeine Wert maßgeblich. Die Zweckbindung muss aus Spendenaufruf, Zuwendungsvereinbarung oder Stiftungsgeschäft eindeutig hervorgehen.`,
  },
  {
    id: "mvr-zulaessige-verwendung",
    title: "Zulässige Mittelverwendung",
    short:
      "Mittelverwendung ist zulässig, wenn sie satzungsmäßigen steuerbegünstigten Zwecken dient.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Zulässige Verwendung.",
    keywords: /zulässige? mittelverwendung|mittelweitergabe|§\s*58\s*nr\.?\s*1/i,
    references: ["§ 55 AO", "§ 58 Nr. 1 AO"],
    body: `Eine Mittelverwendung gilt als zulässig (= zweckentsprechend), wenn sie unmittelbar oder mittelbar die satzungsmäßigen steuerbegünstigten Zwecke fördert.

Typische zulässige Verwendungen:
- Ausgaben im ideellen Bereich (Projektkosten, ehrenamtliche Aufwandsentschädigungen, Öffentlichkeitsarbeit für den Zweck),
- Ausgaben im Zweckbetrieb (§§ 65–68 AO),
- nutzungsgebundenes Anlagevermögen im ideellen Bereich / Zweckbetrieb (z. B. Therapieräume, Lehrmittel),
- Mittelweitergabe an andere steuerbegünstigte Körperschaften nach § 58 Nr. 1 AO,
- Darlehensvergabe nur in engen Fällen, wenn die Darlehensvergabe selbst der unmittelbaren Zweckverwirklichung dient (z. B. Schuldnerberatung, Stipendiendarlehen).

Nicht zweckentsprechend: Ausgaben in Vermögensverwaltung und steuerpflichtigem wGB, sonstiges (nicht nutzungsgebundenes) Anlagevermögen, kommerzielle Darlehen aus zeitnah zu verwendenden Mitteln.

Review-Hinweis: Bei Mittelweitergabe Freistellungsbescheid bzw. Anlage zum KSt-Bescheid des Empfängers in Akte halten.`,
  },
  {
    id: "mvr-ruecklagen-62-uebersicht",
    title: "Rücklagen nach § 62 AO",
    short:
      "Zulässige Rücklagen entziehen Mittel der zeitnahen Mittelverwendungspflicht.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rücklagenarten § 62 AO.",
    keywords: /§\s*62\s*ao|rücklagen?\s*nach\s*§\s*62|betriebsmittelrücklage|wiederbeschaffungsrücklage/i,
    references: ["§ 62 Abs. 1 AO", "§ 62 Abs. 3 AO"],
    body: `Mittel, die in eine zulässige Rücklage nach § 62 AO eingestellt werden, gelten als verwendet und unterliegen für die Dauer der Rücklagenbildung nicht mehr der zeitnahen Mittelverwendung.

Übersicht der Rücklagenarten:
1) Zweckgebundene Rücklage (§ 62 Abs. 1 Nr. 1 AO) — für konkret geplante Projekte.
2) Betriebsmittelrücklage (Unterfall Nr. 1) — Liquiditätssicherung für periodisch wiederkehrende Ausgaben (i. d. R. 3–12 Monate).
3) Wiederbeschaffungsrücklage (§ 62 Abs. 1 Nr. 2 AO) — Ersatzbeschaffung von Wirtschaftsgütern, regelmäßig in Höhe der AfA.
4) Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO) — siehe eigener Eintrag.
5) Rücklage zum Erwerb von Gesellschaftsrechten (§ 62 Abs. 1 Nr. 4 AO) — zur Erhaltung der Beteiligungsquote.

Daneben: Vermögenszuführungen nach § 62 Abs. 3 AO (Erbschaft, ausdrückliche Vermögensausstattung, Spendenaufruf zur Vermögensaufstockung, Sachzuwendung zur Vermögensbildung).

Review-Hinweis: Jede Rücklage benötigt Beschluss, Zweck, Dokumentation und Auflösung bei Wegfall des Grundes.`,
  },
  {
    id: "mvr-freie-ruecklage",
    title: "Freie Rücklage",
    short:
      "Die freie Rücklage ist flexibel, aber die jährliche Zuführung ist begrenzt.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Freie Rücklage (Bemessungsgrundlagen).",
    keywords: /freie? rücklage|§\s*62\s*abs\.?\s*1\s*nr\.?\s*3|nachholung\s+freie\s+rücklage/i,
    references: ["§ 62 Abs. 1 Nr. 3 AO"],
    body: `Bemessung der jährlichen Höchstzuführung:
- bis zu 1/3 des Überschusses der Vermögensverwaltung,
- zuzüglich bis zu 10 % der sonstigen zeitnah zu verwendenden Mittel (ideeller Bereich, Zweckbetrieb, wGB).

Wichtige Regeln:
- Keine Doppelberücksichtigung: Mittel der Vermögensverwaltung dürfen nicht zusätzlich in die Bemessungsgrundlage der 10 %-Rücklage einbezogen werden.
- Nachholung: Nicht ausgeschöpfte Höchstbeträge können in den zwei folgenden Jahren nachgeholt werden.
- Unterdeckungen der Vermögensverwaltung sind in spätere Jahre vortragbar und mindern dort die Bemessungsgrundlage.

Gesamthöhe ist unbegrenzt. Verwendung später z. B. für Darlehen, Beteiligungen, Investitionen, Kapitalerhöhungen aus Gesellschaftsmitteln.

Review-Hinweis: Zuführung und Berechnungsgrundlage in der MVR transparent dokumentieren. Eine unterlassene Zuführung kann nur innerhalb der 2-Jahres-Nachholung aufgeholt werden.`,
  },
  {
    id: "mvr-mittelverwendungsrechnung",
    title: "Mittelverwendungsrechnung",
    short:
      "Die MVR dokumentiert die zeitnahe und satzungsgemäße Mittelverwendung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Aufbau MVR.",
    keywords: /mittelverwendungsrechnung|mvr\b|nebenrechnung\s+jahresabschluss/i,
    references: ["§ 55 AO", "§ 63 AO"],
    body: `Die Mittelverwendungsrechnung (MVR) ist Nebenrechnung zum Jahresabschluss und dient dem Nachweis, dass die Körperschaft ihre Mittel zeitnah und satzungsgemäß verwendet hat.

Format: Es gibt kein gesetzlich vorgeschriebenes Schema. In der Praxis verbreitet sind:
- bilanzorientierte Darstellung (Vermögensvergleich; Gegenüberstellung der zeitnah zu verwendenden Mittel und ihrer Verwendung),
- kapitalflussorientierte Darstellung (Mittelzu- und -abflüsse im Jahr).

Pflichtbestandteile in der Praxis:
- Saldobetrachtung / Globalbetrachtung über alle zeitnah zu verwendenden Mittel,
- Abstimmung mit dem Rücklagenspiegel,
- Ausweis offener Mittelvorträge mit Fristen,
- Verwendungsüberhang als Ergebniskennzahl.

Review-Hinweis: Die MVR ist Teil der Akte und sollte beim Finanzamt auf Anforderung kurzfristig vorgelegt werden können.`,
  },
  {
    id: "mvr-ruecklagenspiegel",
    title: "Rücklagenspiegel",
    short:
      "Der Rücklagenspiegel zeigt Bildung, Entwicklung und Auflösung gemeinnützigkeitsrechtlicher Rücklagen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rücklagenspiegel.",
    keywords: /rücklagenspiegel/i,
    references: ["§ 62 AO"],
    body: `Der Rücklagenspiegel stellt für jede Rücklage je Geschäftsjahr dar:
- Anfangsbestand,
- Zuführung,
- Entnahme / Auflösung,
- Endbestand,
- Zweck,
- Vorstands- bzw. Geschäftsführungsbeschluss (Datum),
- Nachweise (Projektplan, Finanzierungsplan, Belege).

Er ergänzt die Mittelverwendungsrechnung und macht die Rücklagenentwicklung über mehrere Jahre nachvollziehbar.

Review-Hinweis: Auflösungen sind zwingend zu dokumentieren — frei werdende Mittel unterliegen wieder der zeitnahen Mittelverwendung. Dauerhaft unveränderte Rücklagen oder pauschale Sammelpositionen ohne Zweck sind Audit-Risiko.`,
  },
  {
    id: "mvr-verwendungsueberhang",
    title: "Verwendungsüberhang",
    short:
      "Ein positiver Verwendungsüberhang kann auf nicht zeitnah verwendete Mittel hinweisen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Auswertung MVR.",
    keywords: /verwendungsüberhang|nicht\s+zeitnah\s+verwendete\s+mittel/i,
    references: ["§ 55 AO", "§ 63 Abs. 4 AO"],
    body: `Der Verwendungsüberhang ist eine rechnerische Kennzahl der MVR:
Zeitnah zu verwendende Mittel − zweckentsprechende Verwendung − zulässige Rücklagen − Vermögenszuführungen § 62 Abs. 3 AO − offener Mittelvortrag (innerhalb Frist).

Interpretation:
- Positiver Überhang: Hinweis auf nicht zeitnah verwendete Mittel → Prüfbedarf.
- Negativer Überhang: Es wurden mehr Mittel zweckentsprechend verwendet als rechnerisch erforderlich (z. B. Auflösung von Vorjahresmitteln).

Folgen: Ein positiver Überhang führt nicht automatisch zur Aberkennung der Gemeinnützigkeit. Das Finanzamt kann nach § 63 Abs. 4 AO eine angemessene Verwendungsauflage (oft bis zu drei Jahren) erteilen. Erst wiederholte oder schwere Verstöße gefährden die Gemeinnützigkeit.

Review-Hinweis: Der Überhang ist Arbeitswert und ersetzt keine fachliche Würdigung — insbesondere Mittelherkunft, Sphärenzuordnung und Rücklagengründe sind zu prüfen.`,
  },
  {
    id: "mvr-vorstandsbeschluesse",
    title: "Vorstandsbeschlüsse und Dokumentation",
    short:
      "Rücklagen sollten durch Beschlüsse und Nachweise dokumentiert werden.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Dokumentationsstandards Rücklagen.",
    keywords: /vorstandsbeschluss|rücklagenbeschluss|dokumentation\s+rücklage/i,
    references: ["§ 62 AO", "§ 63 AO"],
    body: `Jede Rücklagenbildung sollte durch das zuständige Organ (Vorstand, Geschäftsführung) formal beschlossen und dokumentiert werden.

Mindestbestandteile der Dokumentation:
- Rücklagenbeschluss mit Datum,
- Projektbeschreibung (Zweck, Inhalt),
- Finanzierungsplan (geplante Kosten, Mittelherkunft),
- Zeitplan (geplanter Verwendungs- bzw. Ersatzzeitpunkt),
- Auflösungsdokumentation bei Wegfall des Rücklagengrundes,
- Review durch Steuerberater / Wirtschaftsprüfer.

Praxisempfehlung: Beschlussvorlage als wiederverwendbares Template in der Mandatsakte führen. Im Rücklagenspiegel jede Position mit Beschlussdatum verknüpfen — fehlt das Datum, ist die Position fachlich nicht belastbar.`,
  },
  // ===== Spenden-Crowdfunding / Förderkörperschaften =====
  {
    id: "spenden-crowdfunding-gegenleistung",
    title: "Spenden-Crowdfunding: Gegenleistungen Dritter",
    short:
      "Gegenleistung durch den Projektträger zerstört die Unentgeltlichkeit der Spende — Haftung der Plattform nach § 10b Abs. 4 EStG.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Steuerliche Risiken bei Gegenleistungen im Spenden-Crowdfunding.",
    keywords: /crowdfunding|reward|förderkörperschaft|gegenleistung.*spende|plattform.*spende|zuwendungsbestätigung.*haftung/i,
    references: ["§ 10b Abs. 4 EStG", "§ 55 AO", "§ 58 Nr. 1 AO"],
    body: `Plattformen, die als gemeinnützige Förderkörperschaft Spenden für steuerbegünstigte Projektträger sammeln, müssen die Unentgeltlichkeit jeder einzelnen Zuwendung sicherstellen.

Verlust des Spendencharakters:
- Erhält der Spender (C) vom Projektträger (B) eine Gegenleistung (Produkt, Merchandise, exklusive Vorteile, „Reward"), fehlt die Unentgeltlichkeit — auch wenn die Plattform selbst nichts leistet.
- Keine Teilentgeltlichkeit: Die Gegenleistung „infiziert" den gesamten Betrag, nicht nur den Mehrwert.
- Buchung im ideellen Bereich ist dann sachlich unzutreffend; Erfassung als „sonstige Zuwendung" bzw. durchlaufender Posten.

Sphärenwirkung Plattform:
- Solange die Plattform keine Provision/Gegenleistung erbringt, entsteht bei ihr kein eigener wirtschaftlicher Geschäftsbetrieb.
- Werden Mittel für die Herstellung von Rewards verwendet, liegt Mittelfehlverwendung vor.

Haftung nach § 10b Abs. 4 EStG:
- Ausstellerhaftung: 30 % des zugewendeten Betrags (zzgl. 15 % bei GewSt-Pflicht) bei objektiv unrichtiger Zuwendungsbestätigung, sofern Vorsatz oder grobe Fahrlässigkeit (z. B. ignorierte Reward-Hinweise, fehlende vertragliche Vorkehrungen).
- Veranlasserhaftung: bei Verwendung der Gelder für einen steuerpflichtigen wGB statt für den ideellen Zweck.
- Entlastung bei nachweislicher Unkenntnis (heimliche Absprache B/C), wenn die Unkenntnis nicht auf Organisationsmängeln beruht.

Handlungsempfehlungen:
- Strikte Kontentrennung zwischen bescheinigungsfähigen Spenden und Crowdfunding-Geldern ohne Spendencharakter.
- Technische Sperre gegen automatisierte Quittungen bei Reward-Projekten; sofortige Umbuchung bei Bekanntwerden einer Gegenleistung.
- Keine Bescheinigung bei Gegenleistung — auch nicht über Teilbeträge. Bei nachträglichem Bekanntwerden: Widerruf, Korrekturdatensatz, Haftungsanzeige ans Finanzamt.
- Vertragliche Absicherung: Verpflichtungserklärung des Projektträgers (keine Gegenleistung), Freistellungsklausel, dokumentierte Belehrung.

Fazit: Mischformen zwischen Spenden-Crowdfunding und Reward-Crowdfunding beherrschen nur klare Vertragsvorgaben und interne Kontrollmechanismen (Reward-Indikator-Sperre).`,
  },
  // ===== GoBD =====
  {
    id: "gobd-grundsaetze",
    title: "GoBD — Grundsätze ordnungsgemäßer Buchführung",
    short:
      "Nachvollziehbarkeit, Vollständigkeit, Richtigkeit, Zeitgerechtheit, Ordnung und Unveränderbarkeit als Kernpflichten jeder Buchhaltung.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil I) — Gärtner / Rühmann.",
    keywords: /gobd|grundsätze ordnungsgemäßer buchführung|nachvollziehbar|unveränderbar|zeitgerecht/i,
    references: [
      "§ 145 Abs. 1 AO",
      "§ 146 Abs. 1 und 4 AO",
      "§ 238 Abs. 1 HGB",
      "§ 239 Abs. 2 und 3 HGB",
      "BMF-Schreiben GoBD",
    ],
    body: `Die GoBD konkretisieren die Grundsätze ordnungsgemäßer Buchführung für DV-gestützte Systeme. Sechs Kernanforderungen:

1) Nachvollziehbarkeit / Nachprüfbarkeit (§ 145 Abs. 1 AO, § 238 Abs. 1 HGB, GoBD Rn. 30–35 und 145–150)
   - Ein sachverständiger Dritter muss sich in angemessener Zeit einen Überblick über Geschäftsvorfälle und Lage des Unternehmens verschaffen können.
   - Geschäftsvorfälle in Entstehung und Abwicklung verfolgbar (progressiv vom Beleg zur Bilanz, retrograd zurück).

2) Vollständigkeit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 36–43)
   - Alle buchungspflichtigen Geschäftsvorfälle lückenlos erfassen — keine Unterdrückung, keine Auswahl.

3) Richtigkeit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 44)
   - Aufzeichnungen müssen den tatsächlichen Verhältnissen entsprechen (richtige Konten, Beträge, Zeiträume, USt-Sätze, Währungen).

4) Zeitgerechtheit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 45–52)
   - Unbare Geschäftsvorfälle: Erfassung innerhalb von 10 Tagen unkritisch; periodengerechte Buchung bis zum Ablauf des Folgemonats.
   - Kassenbewegungen: täglich.
   - Belegsicherung (laufende Nummerierung, Ablage) muss zeitnah erfolgen, auch wenn die Verbuchung später nachgeholt wird.

5) Ordnung (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 53–57)
   - Systematische, übersichtliche Ablage von Daten und Belegen; klare Trennung von baren und unbaren Vorgängen, sachliche und chronologische Ordnung.

6) Unveränderbarkeit (§ 146 Abs. 4 AO, § 239 Abs. 3 HGB, Rn. 58–60 und 107–112)
   - Festgeschriebene Daten dürfen nicht unbemerkt geändert oder gelöscht werden.
   - Änderungen müssen protokolliert sein, der ursprüngliche Inhalt bleibt erkennbar.
   - Excel-Tabellen ohne Änderungsprotokoll erfüllen diese Anforderung typischerweise nicht.

Verstöße können zur formellen Ordnungswidrigkeit der Buchführung führen — Folge: Schätzungsbefugnis der Finanzverwaltung (§ 162 AO), Hinzuschätzungen, Verwerfen der Buchführung.`,
  },
  {
    id: "gobd-belegfunktion-verfahrensdoku",
    title: "GoBD — Belegfunktion und Verfahrensdokumentation",
    short:
      "Keine Buchung ohne Beleg, Grund-/Journal-/Kontenfunktion sichern, Verfahrensdokumentation als Pflichtbestandteil.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil I) — Belegwesen, IKS, Verfahrensdokumentation.",
    keywords: /belegfunktion|verfahrensdokumentation|journalfunktion|kontenfunktion|grundaufzeichnung|iks|internes kontrollsystem/i,
    references: ["§ 146 AO", "§ 257 HGB", "GoBD Rn. 61 ff., 151 ff."],
    body: `Belegfunktion (Grundsatz „Keine Buchung ohne Beleg")
- Jeder Geschäftsvorfall ist durch einen Originalbeleg oder einen geeigneten Eigenbeleg nachzuweisen.
- Pflichtinhalte des Belegs: eindeutige Belegnummer, Belegdatum, Geschäftspartner, Betrag und Währung, ggf. Fremdwährungskurs, USt-Satz, hinreichende Erläuterung des Geschäftsvorfalls.
- Mitgeltende Unterlagen (Verträge, Lieferscheine, Bestellungen) sind über eindeutige Verknüpfungen (Index, Barcode, Referenznummer) auffindbar zu machen.

Grund-/Journal-/Kontenfunktion
- Grundaufzeichnungsfunktion: vollständige und unveränderbare Erfassung jedes Geschäftsvorfalls zeitnah nach Entstehung.
- Journalfunktion: chronologische Darstellung aller gebuchten Geschäftsvorfälle (Buchungsprotokoll).
- Kontenfunktion: systematische, sachliche Ordnung auf Bestands- und Ertragskonten — Verdichtung nur zulässig, wenn die Einzelposten jederzeit reproduzierbar bleiben.

Bearbeitung von Belegen
- Belegsicherung sofort (laufende Nummerierung, Eingangsstempel, geordnete Ablage).
- Konvertierung von Papier in digitale Form ist zulässig, wenn bildliche und inhaltliche Übereinstimmung gewährleistet und die ursprüngliche Form vernichtet werden darf (Verfahrensdokumentation zur ersetzenden Erfassung notwendig).
- Eigenbelege nur in Ausnahmefällen, mit klarer Begründung und Unterschrift.

Internes Kontrollsystem (IKS)
- Maßnahmen, die Vollständigkeit, Richtigkeit und Unveränderbarkeit der Aufzeichnungen sicherstellen: Funktionstrennung, Vier-Augen-Prinzip, Zugriffsschutz, Abstimm- und Kontrollroutinen, Protokollierung.
- IKS ist Teil der Buchführungspflicht — fehlt es, ist die formelle Ordnungsmäßigkeit gefährdet.

Verfahrensdokumentation (GoBD Rn. 151 ff.)
- Pflichtbestandteil jeder DV-gestützten Buchführung; muss Aufbau, Inhalt und Ablauf des Verfahrens vollständig und schlüssig erläutern.
- Mindestbestandteile: allgemeine Beschreibung, Anwender- und technische Dokumentation, Betriebsdokumentation, Beschreibung des IKS.
- Änderungen der Verfahren sind mit Versionsstand und Geltungszeitraum zu dokumentieren (historisierte Dokumentation).
- Typische Prüfungsschwerpunkte: ersetzendes Scannen, E-Mail-Eingang, Kassensysteme, Schnittstellen zwischen Vor- und Hauptsystemen, Archivierung.

Konsequenz: Fehlt oder ist die Verfahrensdokumentation unzureichend, kann dies allein die Ordnungsmäßigkeit der Buchführung in Frage stellen, sofern dadurch die Nachvollziehbarkeit und Nachprüfbarkeit der Geschäftsvorfälle beeinträchtigt ist (BMF: nicht jede Lücke ist automatisch ein Mangel).`,
  },
  {
    id: "gobd-datenanalyse-kassen",
    title: "GoBD — Datenanalyse und Kassendaten",
    short:
      "Quantitative Prüfungsmethoden (Ziffern-, Zeitreihen-, Strukturanalyse) und Anforderungen an die Auswertung digitaler Kassendaten.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil III) — Datenanalyse und Kassendaten.",
    keywords: /datenanalyse|ziffernanalyse|benford|kassendaten|tse|zeitreihenanalyse|power\s*bi|prüfungsmethode/i,
    references: ["§ 146a AO", "§ 147 Abs. 6 AO", "KassenSichV", "GoBD Rn. 81–89"],
    body: `Datenanalyse durch quantitative Prüfungsmethoden
- Phasen: Zieldefinition → Datenbeschaffung & -qualitätsprüfung → Analyse → Visualisierung → Bericht und Archivierung.
- Datenqualität ist Voraussetzung: Vollständigkeit, Formatkonsistenz, eindeutige Schlüssel, Nachvollziehbarkeit der Herkunft.
- Klassische Verfahren: Ziffernanalyse (z. B. Benford-Verteilung der führenden Ziffern), Zeitreihenanalyse (Trends, Saisonalitäten, Ausreißer), Lagemaße (Mittelwert, Median, Quantil), Konfidenzniveau zur Beurteilung von Auffälligkeiten.
- Visualisierung: Balken-/Säulen-, Linien-, Kreis-, Wasserfalldiagramme; Dashboards (z. B. Power BI) zur kontinuierlichen Überwachung.
- Nutzen in der Steuerberatung: frühzeitige Identifikation von Buchungsanomalien, Kassendifferenzen, manipulationsverdächtigen Mustern, Vorbereitung auf Betriebsprüfung.

Kassendaten (§ 146a AO, KassenSichV)
- Elektronische Aufzeichnungssysteme benötigen eine zertifizierte technische Sicherheitseinrichtung (TSE): Sicherheitsmodul, Speichermedium, einheitliche digitale Schnittstelle (DSFinV-K).
- Jede Einzelaufzeichnung muss vollständig, richtig, zeitgerecht und unveränderbar sein; nachträgliche Stornos sind als solche zu kennzeichnen.
- Belegausgabepflicht: bei jedem Geschäftsvorfall muss ein Beleg zur Verfügung stehen (auch elektronisch).
- Mitteilungspflicht nach § 146a Abs. 4 AO über eingesetzte/abgeschaffte Kassensysteme (ELSTER-Meldung).
- Prüfungsschwerpunkte: Signaturvalidierung, Belegabbrüche, Lücken in der Transaktionsnummer, Z-Bon-Vollständigkeit, Stornoquote, Trinkgeldverbuchung.
- Risiko: nicht ordnungsgemäße Kassenführung → Schätzungsbefugnis nach § 162 AO; Hinzuschätzungen oft auf Basis quantitativer Analysen (Chi-Quadrat-Test, Strukturvergleich).

Praxisempfehlung
- Vor Betriebsprüfung eigene Datenanalyse fahren (Z3-Zugriff simulieren), Auffälligkeiten dokumentieren und im Vorfeld erläutern.
- Datenanalyse-Routinen in der Kanzlei standardisieren und in die Verfahrensdokumentation aufnehmen.`,
  },
  {
    id: "ki-agenten-langdock",
    title: "KI-Agenten in Langdock — Aufbau und Einsatz im Kanzleialltag",
    short:
      "Spezialisierte Chatbots mit Anweisungen, Skills und Wissensquellen — stark bei Konvertierung, Importvorbereitung und Vorprüfung.",
    category: "DATEV",
    source: "Internes Team-Handout — KI-Agenten in Langdock.",
    keywords: /langdock|ki[- ]?agent|qm[- ]?chatbot|kontoauszug[- ]?converter|buchungsvorlauf[- ]?converter|mt940|camt\.?053/i,
    body: `Ein KI-Agent in Langdock ist ein vorkonfigurierter Chatbot mit hinterlegten Anweisungen, Skills und Wissensordnern. Vorteil gegenüber freiem Prompten: einheitliche Ergebnisse, geringere Einstiegshürde, formularbasierte Eingaben.

Arbeitslogik
- Pflichtfelder (Berater-/Mandantennummer, Vorgangsart, Zielformat) füllen.
- Anhänge entscheiden über die Qualität: PDFs, CSV, Excel, Exportdaten, idealerweise GDPdU-Daten.
- Optionale Hinweise im Freitext für Fallbesonderheiten ergänzen.
- Ergebnis lesen, fachlich prüfen, Folgeschritte ableiten.

Typische Agenten
- QM-Chatbot: interne QM- und Wissenssuche in natürlicher Sprache.
- Dokumentenübersetzer: Verträge, Belege, PDFs übersetzen.
- Kontoauszug-Converter: PDF/CSV → MT940 oder CAMT.053 (PayPal/Stripe oft mit Pseudo-IBAN; bei Stripe Datumsformat beachten).
- Buchungsvorlauf-Converter: Fremddaten → DATEV-Buchungsvorlauf; Matching mit Debitorenliste.
- Anlagevermögens-Converter: Anlagenverzeichnis aus Fremdsystemen für DATEV-Import vorbereiten.
- Fachagenten: Anhang, WP-Anfragen, Jahresabschluss, Fremdwährung, Einkommensteuer, Gesellschafterdarlehen, Tax-Compliance/NPO.
- Organigramm-Agent laut Hinweis derzeit nicht zuverlässig — nicht nutzen.

Ergebnislogik
- Risikoeinstufung, Folgeprompts, Hinweise auf fehlende Unterlagen, Arbeitspapier-Struktur für die Akte.
- Subagenten delegieren Spezialprüfungen im Hintergrund.

Qualitätsregeln
- Fachliche Endkontrolle bleibt immer beim Menschen.
- Saubere Eingaben → kritische Prüfung → Rückmeldung von Fehlern an die Agenten-Pflege.`,
  },
  {
    id: "datev-prochecklisten",
    title: "DATEV ProChecklisten — laufende Nutzung und Mandatswissen",
    short:
      "Checkliste während der Arbeit nutzen, nicht erst am Ende abhaken. Standardprozess + Mandatswissen + Vertretungssicherheit.",
    category: "DATEV",
    source: "Internes Team-Handout — DATEV ProChecklisten.",
    keywords: /procheck|prochecklist|checkliste.*datev|datev.*checkliste|vorgangsmappe.*check/i,
    body: `ProCheck ist ein laufendes Arbeitswerkzeug, kein Pflicht-Häkchen am Ende. Ideal: Checkliste während der Bearbeitung geöffnet halten und Punkte direkt abhaken.

Zugang
- Direkt über ProCheck, über Schnellinfos beim Mandanten, über Karteikarten/Leistungsbereiche oder aus Fachanwendungen (z. B. Kanzlei-Rechnungswesen).
- Darstellungen: Baumstruktur (hierarchisch) oder Prozesslandschaft/Kacheln (visuell).

Prozessaufbau
- Prozessinformation, Prozesspunkte, Rollen, Teilinformationen, Ziel/Nutzen, Verknüpfungen (DMS, Vorlagen, Leitfäden), Historie.
- Verknüpfungen direkt aus dem Prozess öffnen — System kennt oft schon Mandant, Leistung, Zeitraum.

Wissens- und QM-Plattform
- Bildet auch Strategie-, Abrechnungs-, Datenschutz- und Unterstützungsprozesse ab.
- Suche: Volltext, letzte Änderungen, Verknüpfungen, Zuständigkeiten.
- QM-Chatbot in Langdock ergänzt die klassische Suche, aber nur so aktuell wie die letzte QM-Datenbasis.

Mandatswissen ergänzen
- Prozessgrundlage und Checklistenbasis sind standardisiert und nicht beliebig veränderbar.
- Mandantenhinweise, Notizen, fallbezogene Besonderheiten, Zuständigkeiten sind ergänzbar.
- Wiederholungen: monatlich/jährlich direkt möglich; quartalsweise/halbjährlich über gezielte Monate lösen.

Notiz vs. Detailinformation
- Notiz: gilt nur für die konkrete Checkliste/diesen Zeitraum, situativ.
- Detailinformation: dauerhaft, läuft in Folge-Checklisten mit.
- Faustregel: einmalig = Notiz, dauerhaft = Detailinformation.

Qualitätsmaßstab
- Eine gute Checkliste enthält Datenherkunft, Vorsysteme, Importlogik, Bearbeitungsbesonderheiten, dauerhafte Hinweise, Verknüpfungen, Zuständigkeiten und Vertretungswissen.
- Test: Eine Vertretung kann das Mandat damit sicher und nachvollziehbar bearbeiten.`,
  },
  {
    id: "kassen-datenanalyse",
    title: "Kassenprozesse, Datenanalyse und prüfbare Kassendaten",
    short:
      "IKS, Risikoanalyse, Statistik, Benford/Chi-Quadrat, Visualisierung sowie DSFinV-K- und TSE-Datenexport.",
    category: "Buchhaltung",
    source: "Internes Team-Handout — Kassenprozesse, Datenanalyse und prüfbare Kassendaten.",
    keywords: /dsfinv|tse[- ]?archiv|kassennachschau|benford|chi[- ]?quadrat|kassendaten|kassenrisik|stornoquote|z[- ]?bon/i,
    references: ["§ 146a AO", "§ 147 Abs. 6 AO", "KassenSichV", "DSFinV-K"],
    body: `Leitgedanke: Erst Prozessqualität, dann Datenanalyse. Schlechte Daten werden durch Analyse nicht gut.

IKS und Risikoanalyse
- Gesamtrisiko ist mandatsindividuell: Kneipe, Kiosk, Restaurant und Filialbetrieb haben andere Risiken.
- Vorgehen: Risiko identifizieren → Folge beschreiben → Eintrittswahrscheinlichkeit → Auswirkung → Gesamtrisiko → Maßnahme/Kontrolle.
- Typische Risikofelder: unberechtigter Zugriff, fehlende Funktionstrennung, fehlerhafte/unvollständige Erfassung, Stornos, Kassendifferenzen, TSE-/Meldepflichten.

Kontrollen und Verantwortlichkeiten
- Rollen, Rechte, Prüfintervalle, klare Zuständigkeiten.
- Datenexport vor Außenprüfung organisieren — nicht erst dann.
- TSE-Ausfälle/Offline-Status wahrnehmen, dokumentieren, nachverfolgen.

Statistik-Grundlagen
- Mittelwert ist anfällig für Ausreißer; Median und Quantile sind oft aussagekräftiger.
- Verteilung schlägt eine einzelne Kennzahl.
- Boxplot: Lage, Quartile, Streuung, Ausreißer für Vergleiche von Monaten, Filialen, Kassen.

Ziffernanalysen
- Benford-Verteilung der führenden Ziffer ist ein starkes Indiz — aber nur bei geeigneten, sauberen Datensätzen.
- Chi-Quadrat vergleicht Erwartung mit Beobachtung; Freiheitsgrade und Signifikanzniveau einordnen.
- Merksatz: statistische Auffälligkeit + weitere Sachverhaltsfeststellungen = belastbarer Prüfungsansatz.

DSFinV-K, TSE und Datenexport
- Fachliche Exportdaten (DSFinV-K), technische Archivdaten (TSE) und organisatorische Aufbewahrung müssen zusammenpassen.
- Lücken in fortlaufenden Nummern oder Signaturfolgen sind regelmäßig erklärungsbedürftig.

Minimalstandard für die Kanzlei
- Mandat risikoorientiert einordnen, Datenverfügbarkeit und Exportfähigkeit sicherstellen, Grundprüfung auf Lücken und Plausibilität, Auffälligkeiten dokumentieren.`,
  },
  {
    id: "dms-dokumentenmanagement",
    title: "DMS — Dokumentenmanagement in der Kanzlei",
    short:
      "Revisionssicherheit, Ablageknigge, Status, Suche, Vorgangsmappen, Ein-/Auschecken.",
    category: "DATEV",
    source: "Internes Meeting-Handout — DMS Dokumentenmanagementsystem.",
    keywords: /\bdms\b|dokumentenmanagement|ablagekn|vorgangsmappe|einchecken|auschecken|zur erledigung/i,
    body: `Grundprinzipien
- Revisionssicherheit: alle Änderungen nachvollziehbar, jede Version bleibt abrufbar, frühere Fassungen werden nicht überschrieben.
- Nur fachlich und rechtlich zulässige Inhalte ablegen. Sensible/belastende Informationen gehören nicht in Aktennotizen.

Zugriff
- Mandantenbezogen: Schnellinfo zeigt alle Dokumente mit Betreff, Veranlagungsjahr, Status, Bearbeitung.
- Mandantenübergreifend: „Zur Erledigung“ ist die zentrale Arbeitsliste — mehrmals täglich prüfen und schlank halten.

Bearbeitung
- Status über kontextbezogene Links rechts effizient setzen; nicht benötigte Status ausblenden.
- Falsch zugeordnete Dokumente an den zuständigen Mitarbeiter weiterleiten.
- Notizen und Aufgaben direkt am Dokument anlegen; Aufgaben sind mandatsbezogen sichtbar.
- Öffnen per Viewer (Auge) für Sichtprüfung — geöffnete Dokumente werden ausgecheckt. Vor Arbeitsende kontrollieren, dass alles wieder eingecheckt ist.

Suche und Ablage
- Schnellsuche: Beschreibung und Attribute. Volltextsuche: zusätzlich Dokumentinhalt.
- Ablagestruktur nicht als primären Suchweg nutzen.
- Ablageknigge konsequent wählen; „Sonstiges“ nur mit aussagekräftiger Beschreibung.
- Attribute pflegen: Auftrag, Jahr, Monat, Bearbeiter, Status, Stichworte; bei mehrjährigem Bezug weitere Jahre ergänzen.

Weitere Funktionen
- Anpinnen, Kopieren (unabhängig vs. verknüpft), Löschen erfolgt zunächst in einen Zwischenstatus.
- Übergabe an andere DATEV-Anwendungen oder Export zur lokalen Speicherung.

Neue Dokumente, Dummys, Vorgangsmappen
- Nur vorgesehene Kanzlei-Vorlagen verwenden; Absenderangaben korrekt wählen.
- Dummy-Dokument anlegen, wenn Unterlagen ohne E-Mail-Trägerdokument eingehen — sonst fehlen sie in „Zur Erledigung“.
- Vorgangsmappen für Jahresabschlüsse: vordefinierte Struktur; nicht benötigte Unterordner erst nach Prüfung entfernen.`,
  },
  {
    id: "datev-rewe-tipps",
    title: "DATEV Kanzlei-Rechnungswesen — Tipps und Tricks",
    short:
      "Arbeitsplatz und Rechnungswesen-Programm an eigene Arbeitsweise anpassen, schneller buchen, Forderungen im Blick.",
    category: "DATEV",
    source: "Internes Lernvideo-Handout — DATEV Kanzlei-Rechnungswesen Tipps und Tricks.",
    keywords: /kanzlei[- ]?rechnungswesen|datev arbeitsplatz|musterbest|buchungsperiode|festschreibung|gebucht[- ]?bis/i,
    body: `Ihre Arbeitsweise ist Programm
- DATEV Arbeitsplatz: Mandanten suchen, sortieren, gruppieren und filtern. Spalten konfigurieren — z. B. Festschreibungsanzeige (grün/gelb), UStVA-Rhythmus (M/Q), Gebucht-bis-Datum, zuletzt übermittelte Zeiträume.
- Arbeitsblatt „Heute“ zeigt zuletzt bearbeitete Leistungen und ist anpassbar.
- Kanzlei-Rechnungswesen: Navigationsbereich um häufig genutzte Funktionen/Auswertungen erweitern (z. B. konsolidierte UStVA, Kreditor anlegen). Anpassung ist benutzerbezogen.

Buchen
- Buchungen ändern/berichtigen: schnelle Korrekturwege statt Stornieren-und-Neubuchen; Buchungen ausschneiden und einfügen.
- Einstellungen Buchungszeile: Tastenkürzel und Spaltenlogik nutzen.
- Buchungstexte und Konto-Notizen: Kontenbeschriftung mit „k÷“ (Ziffernblock) in den Buchungstext übernehmen.

Forderungen im Blick
- OPOS-Auswertungen und Mahnwesen aus dem Rechnungswesen heraus steuern; Altersstruktur regelmäßig prüfen.

Helfer für den Alltag
- Tastenkürzel, individuelle Listenfilter, persönliche Favoriten — viele kleine Schritte sparen täglich Zeit.

Musterbestände nutzen
- DATEV-Musterkanzlei (Muster GmbH) zum Üben neuer Funktionen, ohne Echtdaten zu gefährden.

Buchungsperiode abschließen
- Festschreibung sauber durchführen, Stand der Buchführung dokumentieren, vor Abgabe der UStVA prüfen.`,
  },
  {
    id: "automatisierungsservice-rechnungen",
    title: "Automatisierungsservice Rechnungen — Voraussetzungen und AS1",
    short:
      "Voraussetzungen, Aktivierung, Symbolik (grün/gelb/rot), echte Automatisierung über die Spalte AS1 messen.",
    category: "DATEV",
    source: "Internes Team-Handout — Automatisierungsservice Rechnungen (Kanzlei-Rechnungswesen).",
    keywords: /automatisierungsservice|as1[- ]?spalte|robotersymbol|e[- ]?rechnung.*automatik|automatisierungsgrad/i,
    body: `Zielbild
- Der Automatisierungsservice unterstützt die Verarbeitung von Eingangs- und Ausgangsrechnungen im DATEV-Rechnungswesen.
- Er lebt von Datenhistorie, wiederkehrenden Mustern und einer sauberen digitalen Prozesskette.

Voraussetzungen
- Regelmäßige Sendung ins Rechenzentrum (aktuelle Datenbasis).
- Ausreichende Dokumentenhistorie (offiziell mind. zwei Jahre, praktisch zählt Wiederkehr und Menge).
- OPOS aktiviert und tatsächlich genutzt.
- Behandlungsform „Standard“ (ggf. vor Aktivierung von „Erweitert“ umstellen).
- SKR03 oder SKR04, keine Branchenpakete, kein selbstbuchender Mandant.
- Digitale Belege werden bereits gebucht.

Stammdaten und E-Rechnungen
- System schlägt bei neuen Geschäftspartnern vorbefüllte Stammdaten vor.
- Bei E-Rechnungen können neue Geschäftspartner im Hintergrund automatisch angelegt werden (Einstellung in „Eigenschaften → Digitale Belege“).
- Sonderfälle wie Tankstellen-Filialen sind Prozessentscheidungen — nicht jeder Lieferant muss perfekt zusammengeführt werden.

Aktivierung
- In Kanzlei-Rechnungswesen über „Bestand → Automatisierungsservices“; System prüft Voraussetzungen.
- Robotersymbol in der Statuszeile zeigt nur an, dass mindestens ein Service aktiv ist.
- Pragmatisch testen und beobachten statt theoretisch zerdenken; bei fehlendem Mehrwert wieder deaktivieren.

Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung erforderlich.
- Rot: kein Vorschlag bzw. Fehler → Sachverhalt klären.

AS1-Spalte und echter Automatisierungsgrad
- Spalte AS1 ist standardmäßig nicht sichtbar; je Bestand über Rechtsklick → „Einstellungen Liste“ aktivieren.
- Zeigt, welche Buchungen wirklich vollautomatisch verarbeitet wurden (kein menschlicher Eingriff).
- Sobald ein Buchungssatz erneut geöffnet, bestätigt oder verändert wird, verschwindet die Kennzeichnung für Vollautomatik.
- AS1 ist sichtbar in Primanota/passender Ansicht, nicht im Grundblatt.

Team-Empfehlung
- Systemvorschläge nicht aus Gewohnheit bekämpfen — Prozesse so aufsetzen, dass das System möglichst oft recht hat.
- Manuelle Eingriffe reduzieren, AS1 regelmäßig auswerten, Mehrwert pro Bestand kritisch bewerten.`,
  },
  {
    id: "steuern-grundlagen",
    title: "Steuern — Grundlagen und Systematik",
    short:
      "Was Steuern sind, Abgrenzung zu Gebühren/Beiträgen, Steuerarten im deutschen Steuersystem.",
    category: "Buchhaltung",
    source: "Allgemeines Grundlagenwissen (interne Aufbereitung).",
    keywords: /(was\s+(ist|sind)\s+(eine\s+)?steuer)|steuerarten|steuersystem|steuerrecht\s+grundlagen|abgabenarten|grundbegriffe\s+steuer/i,
    references: ["§ 3 AO"],
    body: `Steuern sind Geldleistungen, die ein öffentlich-rechtliches Gemeinwesen (Bund, Länder, Gemeinden) zur Erzielung von Einnahmen allen auferlegt, bei denen der gesetzliche Tatbestand zutrifft — ohne Anspruch auf eine konkrete Gegenleistung (Legaldefinition § 3 Abs. 1 AO).

Abgrenzung zu anderen Abgaben:
- Gebühr: Entgelt für eine konkrete Amtshandlung (z. B. Passgebühr).
- Beitrag: Entgelt für die Möglichkeit der Inanspruchnahme einer Leistung (z. B. IHK-Beitrag).
- Sonderabgabe: Finanzierung gruppennütziger Zwecke.

Einteilung der Steuern:
1) Nach Bemessungsgrundlage
   - Ertragsteuern: Einkommensteuer, Körperschaftsteuer, Gewerbesteuer.
   - Verkehrsteuern: Umsatzsteuer, Grunderwerbsteuer, Versicherungsteuer.
   - Substanzsteuern: Grundsteuer, Erbschaft-/Schenkungsteuer.
   - Verbrauchsteuern: Energiesteuer, Tabaksteuer, Kaffeesteuer.

2) Nach Steuergläubiger
   - Bundessteuern (z. B. Energiesteuer, Versicherungsteuer).
   - Landessteuern (z. B. Erbschaftsteuer, Grunderwerbsteuer).
   - Gemeindesteuern (z. B. Grundsteuer, Gewerbesteuer).
   - Gemeinschaftsteuern (USt, ESt, KSt — Ertrag wird aufgeteilt).

3) Nach Überwälzbarkeit
   - Direkte Steuern: Steuerschuldner = Steuerträger (ESt, KSt).
   - Indirekte Steuern: werden überwälzt (USt, Verbrauchsteuern).

Wichtige Steuerarten in der Praxis:
- Einkommensteuer (EStG) — natürliche Personen.
- Körperschaftsteuer (KStG) — juristische Personen, 15 % + SolZ.
- Gewerbesteuer (GewStG) — Gewerbebetriebe, Hebesatz der Gemeinde.
- Umsatzsteuer (UStG) — 19 %/7 %, indirekt, EU-harmonisiert.
- Lohnsteuer — Erhebungsform der ESt, Arbeitgeber haftet.
- Erbschaft-/Schenkungsteuer (ErbStG) — siehe eigener Eintrag.
- Grunderwerbsteuer, Grundsteuer, Kfz-Steuer, Kapitalertragsteuer.

Grundprinzipien:
- Gesetzmäßigkeit der Besteuerung (Art. 20 Abs. 3 GG, § 3 Abs. 1 AO).
- Gleichmäßigkeit (Art. 3 GG).
- Leistungsfähigkeitsprinzip.
- Bestimmtheitsgrundsatz.

Verfahrensrechtlicher Rahmen: Abgabenordnung (AO) — Mantelgesetz für alle Steuerarten (Festsetzung, Erhebung, Vollstreckung, Rechtsbehelfe).`,
  },
  {
    id: "erbschaftsteuer-grundlagen",
    title: "Erbschaft- und Schenkungsteuer — Grundlagen",
    short:
      "Steuerpflicht, Steuerklassen, Freibeträge, Bewertung und Tarif nach ErbStG.",
    category: "Buchhaltung",
    source: "Interne Musterlösung Übungsklausur ErbSt/Bewertung (Rechtsstand 2024).",
    keywords: /erbschaftsteuer|erbst\b|schenkungsteuer|erbstg|nachlass|erbanfall|§\s*15\s*erbstg|§\s*16\s*erbstg|freibetrag\s+erbe/i,
    references: ["§§ 1, 3, 9, 10, 15, 16, 19 ErbStG", "§§ 11, 151, 182 ff. BewG", "§ 1922 BGB"],
    body: `Die Erbschaft- und Schenkungsteuer erfasst den unentgeltlichen Vermögensübergang von Todes wegen (§ 3 ErbStG) bzw. unter Lebenden (§ 7 ErbStG).

Steuerpflicht:
- Unbeschränkt steuerpflichtig (§ 2 Abs. 1 Nr. 1 ErbStG), wenn Erblasser/Schenker oder Erwerber zum Zeitpunkt der Steuerentstehung Inländer ist (Wohnsitz/gewöhnlicher Aufenthalt im Inland, § 8/§ 9 AO).
- Beschränkt steuerpflichtig: nur Inlandsvermögen.
- Steuer entsteht mit dem Tod des Erblassers bzw. Ausführung der Schenkung (§ 9 ErbStG). Dieser Tag ist Bewertungsstichtag (§ 11 ErbStG).

Steuerklassen (§ 15 ErbStG):
- StKl I: Ehegatten, Lebenspartner, Kinder, Stiefkinder, Enkel, bei Erbfall auch Eltern/Großeltern.
- StKl II: Geschwister, Nichten/Neffen, Stiefeltern, Schwiegerkinder, geschiedene Ehegatten.
- StKl III: alle übrigen Erwerber.

Persönliche Freibeträge (§ 16 ErbStG):
- Ehegatte/Lebenspartner: 500.000 €.
- Kinder/Stiefkinder: 400.000 €.
- Enkel: 200.000 € (400.000 €, wenn Elternteil verstorben).
- Eltern bei Erbfall: 100.000 €.
- StKl II/III: 20.000 €.
Zusätzlich: Versorgungsfreibetrag (§ 17 ErbStG), Hausrat-/Pkw-Freibetrag (§ 13 Abs. 1 Nr. 1 ErbStG: 41.000 € Hausrat / 12.000 € andere bewegliche Gegenstände in StKl I).

Steuertarif (§ 19 ErbStG): progressiv nach Erwerb und StKl, z. B. StKl I bis 600.000 € = 15 %, bis 6 Mio. € = 19 %, bis 13 Mio. € = 23 %.

Bewertung (BewG):
- Anteile an nicht notierten Kapitalgesellschaften: gemeiner Wert; vorrangig IDW-S1/vereinfachtes Ertragswertverfahren; Substanzwert als Mindestwert (§ 11 Abs. 2 BewG). Gesonderte Feststellung nach § 151 Abs. 1 Nr. 3 BewG.
- Grundbesitz: gesonderte Feststellung nach § 151 Abs. 1 Nr. 1 BewG; je nach Grundstücksart Vergleichs-, Ertrags- oder Sachwertverfahren (§§ 182 ff. BewG).
- Niedrigerer gemeiner Wert kann nach § 198 BewG durch Gutachten nachgewiesen werden.

Begünstigungen:
- §§ 13a/13b ErbStG: Begünstigung von Betriebsvermögen, qualifizierten Kapitalgesellschafts­anteilen (Mindestbeteiligung > 25 %) und land-/forstwirtschaftlichem Vermögen; Verschonungsabschlag 85 % oder 100 %, Lohnsummenregelung, Behaltensfrist.
- § 13d ErbStG: 10 %-Abschlag für zu Wohnzwecken vermietete Grundstücke.
- § 13 Abs. 1 Nr. 4b/c ErbStG: Familienheim für Ehegatten/Kinder.

Nachlassverbindlichkeiten (§ 10 Abs. 5 ErbStG):
- Erblasserschulden (z. B. Hypotheken).
- Erbfallschulden (Pflichtteile, Vermächtnisse, Beerdigungs- und Nachlassregelungskosten; Pauschbetrag 10.300 €).

Berechnungsschema:
Wert des Vermögensanfalls (Aktiva, jeweils gesondert bewertet)
./. sachliche Befreiungen (§ 13 ErbStG)
./. Nachlassverbindlichkeiten (§ 10 Abs. 5 ErbStG)
= Bereicherung (§ 10 Abs. 1 ErbStG)
./. persönlicher Freibetrag (§ 16 ErbStG)
./. Versorgungsfreibetrag (§ 17 ErbStG)
= steuerpflichtiger Erwerb (abgerundet auf volle 100 €, § 10 Abs. 1 S. 6 ErbStG)
× Steuersatz § 19 ErbStG
= festzusetzende Erbschaftsteuer

Praxisbeispiel (Auszug Musterlösung 2024): Enkel erbt nach verstorbenem Vater Vermögen mit GmbH-Anteil 22 %, gemischt genutztem Grundstück, EFH, Hausrat, Pkw, Bankguthaben. Bereicherung 3.421.081 € ./. Freibetrag 400.000 € = stpfl. Erwerb 3.021.000 € × 19 % = 573.990 € ErbSt.

Vorerwerbe (§ 14 ErbStG): Erwerbe innerhalb von 10 Jahren von derselben Person werden zusammengerechnet.`,
  },
  {
    id: "datev-esteuern-prozess",
    title: "DATEV eSteuern — digitaler Einkommensteuerprozess",
    short:
      "Vollmacht, vorausgefüllte Steuererklärung, Steuerkonto online, Bescheiddatenabgleich und DIVA 2 im Überblick.",
    category: "DATEV",
    source: "Internes Handout NPO-Team — DATEV eSteuern.",
    keywords: /esteuern|vorausgefüllte? steuererklärung|steuerkonto\s+online|bescheiddaten|diva\s*2|vollmachtsdatenbank/i,
    body: `Der DATEV eSteuern-Einkommensteuerprozess ermöglicht eine weitgehend papierlose Bearbeitung von der Vorbereitung bis zum Bescheid.

Bausteine
- Vollmacht / Vollmachtsdatenbank: Grundlage für alle digitalen Abrufe.
- Vorausgefüllte Steuererklärung (VaSt): Lohnsteuerbescheinigungen, Rentenbezüge, Vorsorgeaufwendungen elektronisch übernehmen.
- Steuerkonto online: offene Beträge, geleistete Zahlungen, Sollstellungen / Vorauszahlungen abrufen.
- Post, Fristen und Bescheide: Bescheiddatenabgleich; automatische Anzeige von Abweichungen Erklärung ↔ Bescheid.
- DIVA 2: digitale Zustellung von Bescheiden und Finanzamtsdokumenten ins DMS.

Voraussetzungen
- Hinterlegte Vollmacht, gesetztes Vollmachtszeichen.
- Abruffreigabe für VaSt und Steuerkonto online.
- Mandant beim Finanzamt registriert.
- Bei Abruffehlern zuerst Registrierung, Vollmacht und Freigaben prüfen — nicht nur Warnhinweise.

Steuerkonto online — Abrufweg
Mandant auswählen → Rechtsklick „Abfrage ausgewählter Mandant“ → offene Beträge / geleistete Zahlungen / Sollstellungen wählen.

Bescheiddatenabgleich
- Bescheiddaten früh prüfen.
- Abweichungen zur abgegebenen Erklärung werden markiert; Einspruchsfristen im Auge behalten.

DIVA 2
- Digitaler Eingang von Finanzamtsdokumenten.
- Ablage automatisiert in DMS, Verknüpfung zum Mandantenakt.

Team-Workflow
1) Vorbereitung: Vollmacht/Freigaben prüfen, VaSt + Steuerkonto online ziehen.
2) Bearbeitung: Erklärung erstellen, digitale Optionen aktiv mitdenken.
3) Nachgelagert: Bescheiddatenabgleich, DIVA 2-Eingang prüfen, Fristen sichern.`,
  },
  {
    id: "datev-lerndateien",
    title: "DATEV Lerndateien & Buchungsvorschläge",
    short:
      "Kriterien richtig wählen, Sternchen-Platzhalter, automatisiertes Buchen, AS1-Spalte und Aufräumen bestehender Bestände.",
    category: "DATEV",
    source: "Internes Handout — Lerndateien, Buchungsvorschläge & Automatisierung.",
    keywords: /lerndatei|buchungsvorschlag|automatisches buchen|sternchen.*platzhalter|alt\s*\+\s*-|strg\s*\+\s*l/i,
    body: `Grundsatz: So wenig Kriterien wie möglich, so viel wie nötig. Eine Lerndatei soll den wiederkehrenden Sachverhalt präzise treffen.

Anlegen
- Wege: Funktion oben im Programm, Shortcut Alt + -, oder STRG + L.
- Oben: Was soll gebucht werden (Konto, Personenkonto, Aufteilung).
- Unten: Wann soll die Lerndatei greifen (Kriterien je Rechnungskreis).

Geeignete Kriterien
- Wiederkehrende Begriffe im Verwendungszweck.
- Stabile Auftraggeber/Geschäftspartner kombiniert mit weiteren Kriterien.
- Transaktionstypen bei PayPal/Amazon.
- Ware/Leistung bei Eingangs- und Ausgangsrechnungen.

Riskante Kriterien
- Datum, Monat, Zeitraum (z. B. 06/23).
- Rechnungsnummern, laufende Referenzen.
- Wechselnde Beträge, zufällige Zeichenketten.
- Zu kurze Stichwörter (z. B. nur „AAG“).
- Nur der Auftraggeber, wenn unterschiedliche Sachverhalte möglich sind.

Sternchen-Platzhalter
- *Einzahlung* — beliebiger Text vor/nach „Einzahlung“.
- *Erstattung*AAG* — beide Stichwörter müssen vorkommen.
- *Beitr*ge* — deckt „Beiträge“ und „Beitraege“ ab.
- Zu viele Sternchen oder zu kurze Textteile machen die Lerndatei gefährlich breit.

Lerndateien testen: Transaktionen reimportieren und Vorschläge prüfen.

Buchungsvorschläge — Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung.
- Rot: kein Vorschlag/Fehler → Sachverhalt klären.

Automatisiertes Buchen
- Erst aktivieren, wenn Vorschläge stabil greifen und erste Zeiträume plausibel geprüft sind.
- AS1-Spalte zeigt den tatsächlichen Vollautomatisierungsgrad; standardmäßig ausgeblendet, über Listen-Einstellungen aktivieren.
- Sobald ein Buchungssatz erneut geöffnet oder verändert wird, entfällt die AS1-Kennzeichnung.

Pflege bestehender Bestände
- Übernommene Bestände kritisch prüfen: leere, redundante oder zu allgemeine Lerndateien aufräumen.
- Lerndateien, die nur einmal greifen, verschwenden Pflegeaufwand.

Neue Prüfungslogik
- Weg von der Einzelfallkontrolle jedes Belegs, hin zu risikoorientierter Stichprobe und gezielter Kontrolle der gelben/roten Fälle.`,
  },
  {
    id: "kfz-wertabgabe-1prozent",
    title: "Kfz-Wertabgabe nach 1-%-Methode",
    short:
      "Berechnung der privaten Kfz-Nutzung, USt-Aufteilung # 8921 0 / # 8924 0 und Kostendeckelung.",
    category: "DATEV",
    source: "Internes Arbeitspapier — JA Vorlage Unentgeltliche Wertabgaben Kfz.",
    keywords:
      /(1\s*%|1-%|ein\s*prozent)[-\s]*methode|kfz.?wertabgabe|private\s+kfz.?nutzung|bruttolistenpreis|kostendeckelung|8921|8924|fahrten\s+wohnung.?betrieb|firmenwagen/i,
    references: ["# 8921 0", "# 8924 0", "# 4679 0", "# 4680 0", "§ 6 Abs. 1 Nr. 4 EStG"],
    body: `Die 1-%-Methode pauschaliert den privaten Nutzungsanteil eines betrieblichen Fahrzeugs. Voraussetzung ist regelmäßig eine betriebliche Nutzung von mehr als 50 %.

1) 1-%-Wert (Privatfahrten)
- Bruttolistenpreis auf volle 100 € abgerundet × 1 % × Nutzungsmonate.
- 20-%-Abschlag für nicht vorsteuerbelastete Kosten kürzt die Bemessungsgrundlage USt.
- USt 19 % auf die verbleibende BMG vor Kostendeckelung.

2) Fahrten Wohnung / Betrieb (0,03 %)
- 0,03 % vom Bruttolistenpreis × Entfernungskilometer × Nutzungsmonate.
- Abzüglich Arbeitstage × Entfernung × 0,30 € (Entfernungspauschale).
- Differenz = nicht abzugsfähige Betriebsausgaben → außerbilanzielle Korrektur
  per # 4679 0 an # 4680 0.

3) Kostendeckelung
- Mit Vorsteuer belastete Fahrzeugkosten netto = Gesamtfahrzeugkosten netto
  abzüglich nicht mit Vorsteuer belastete Kosten.
- Maximalwert für die USt-Bemessungsgrundlage = 50 % der mit Vorsteuer belasteten
  Fahrzeugkosten netto.
- Tatsächliche BMG # 8921 0 = Minimum aus 1-%-BMG und 50-%-Deckel.

4) DATEV-Konten
- # 8921 0 Unentgeltliche Wertabgaben Kfz 19 % USt.
- # 8924 0 Unentgeltliche Wertabgaben Kfz ohne USt.
- Differenz zwischen 1-%-Wert + Fahrten W/B und BMG # 8921 0 wird auf # 8924 0
  ausgewiesen.

5) Typische Vorsteuer-Einordnung
- Ohne Vorsteuer: Kfz-Steuer, Kfz-Versicherung, Schuldzinsen (regelmäßig).
- Mit Vorsteuer: Kraftstoff, Reparaturen, Wagenpflege (ordnungsgemäße Rechnung).
- Versicherungsentschädigungen als negativer Betrag erfassen.

Hinweis: Berechnung ist Arbeitshilfe — Bruttolistenpreis, Nutzungsmonate,
Vorsteueranteile und DATEV-Buchungen fachlich prüfen.`,
  },
  {
    id: "gobd",
    title: "GoBD – digitale Buchführung und Aufbewahrung",
    short:
      "Grundsätze für elektronische Buchführung, digitale Belege, Aufbewahrung, Verfahrensdokumentation und Datenzugriff.",
    category: "DATEV",
    source: "BMF-Schreiben zu den GoBD; kanzleiinterne Arbeitshinweise.",
    keywords: /gobd|verfahrensdokumentation|belegprinzip|unveränderbarkeit|datenzugriff|z1\s|z2\s|z3\s/i,
    references: ["BMF-Schreiben GoBD", "§ 145 ff. AO", "§ 147 Abs. 6 AO", "§ 238 ff. HGB"],
    body: `Die GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff) sind ein BMF-Schreiben. Sie konkretisieren, wie elektronische Buchführung und digitale Belegverarbeitung aus Sicht der Finanzverwaltung ordnungsgemäß und prüfbar sein müssen.

1) Für wen relevant
- Alle Buchführungs- und Aufzeichnungspflichtigen (HGB, AO, EStG).
- Auch EÜR-Fälle, wenn Aufzeichnungen elektronisch geführt werden.
- Praktisch: jede Kanzlei, jeder Mandant mit DATEV Unternehmen online, jede Kasse, jedes Vorsystem.

2) Kernanforderungen
- Nachvollziehbarkeit und Nachprüfbarkeit
- Vollständigkeit
- Richtigkeit
- zeitgerechte Erfassung
- Ordnung
- Unveränderbarkeit
- Belegfunktion ("keine Buchung ohne Beleg")

3) Verfahrensdokumentation
- Pflicht: schriftliche Beschreibung aller IT-gestützten Prozesse rund um steuerrelevante Daten.
- Inhalte: allgemeine Beschreibung, Anwender-/Technik-Dokumentation, Betriebsdokumentation, internes Kontrollsystem.
- Muss jederzeit prüfbar sein und mit der gelebten Praxis übereinstimmen.

4) Unveränderbarkeit / Belegprinzip
- Einmal erfasste Buchungen und archivierte Belege dürfen nicht unbemerkt geändert werden.
- Änderungen sind protokolliert und nachvollziehbar (Journal, Versionierung).
- Belege sind im Ursprungsformat revisionssicher zu archivieren.

5) Datenzugriff (§ 147 Abs. 6 AO)
- Z1: unmittelbarer Zugriff der Finanzverwaltung auf das System (read-only).
- Z2: mittelbarer Zugriff – Auswertung durch das Unternehmen.
- Z3: Datenträgerüberlassung (z. B. GDPdU-/IDEA-Export).

6) Typische Kanzlei-Prüfpunkte
- Liegt eine aktuelle Verfahrensdokumentation vor?
- Werden digitale Belege unveränderbar archiviert (z. B. DATEV Unternehmen online, DMS)?
- Gibt es ein Kassensystem oder Vorsystem? TSE vorhanden?
- Werden Belege zeitnah erfasst (Belegdatum vs. Buchungsdatum)?
- Ist der Datenzugriff für eine Betriebsprüfung möglich (Export, Berechtigungen)?
- Aufbewahrungsfristen (i. d. R. 10 Jahre Buchungsbelege, 6 Jahre Handels-/Geschäftsbriefe) eingehalten?

Hinweis: GoBD-Verstöße können zur Verwerfung der Buchführung und zu Hinzuschätzungen führen (§ 162 AO). Frühzeitige Dokumentation und revisionssichere Archivierung sind die wichtigste Prävention.`,
  },
  {
    id: "erbschaftsteuer-merksaetze",
    title: "Erbschaftsteuer & Bewertung — Merksätze",
    short:
      "Erbanfall, Vor-/Nacherbschaft, Nachlassverbindlichkeiten, Familienheim, nicht notierte Anteile und Grundbesitzbewertung.",
    category: "Jahresabschluss",
    source: "Internes Handout — ErbSt / EStG / Bilanzierung / UmwStG.",
    keywords: /erbanfall|vorerbe|nacherbe|nachlassverbindlich|familienheim|gemischte schenkung|erbfallkostenpauschale|gemeiner wert|substanzwert|grundbesitzwert|ertragswertverfahren|bodenrichtwert|denkmalgeschützt/i,
    references: [
      "§§ 1, 3, 6, 7, 9, 10, 11, 12, 13, 20 ErbStG",
      "§§ 11, 151, 182–198 BewG",
      "§ 1922 BGB",
    ],
    body: `1) Erwerb von Todes wegen
- Erbanfall durch Gesamtrechtsnachfolge (§§ 1922 BGB, 1 Abs. 1 Nr. 1, 3 Abs. 1 Nr. 1 ErbStG).
- ErbSt entsteht mit dem Tod des Erblassers (§ 9 Abs. 1 Nr. 1 ErbStG); Bewertungsstichtag ist der Todestag (§ 11 ErbStG).
- Unbeschränkte Steuerpflicht bei Inländer­eigenschaft (§ 2 Abs. 1 ErbStG).
- Steuerschuldner ist der Erwerber (§ 20 Abs. 1 ErbStG).
- Steuerpflichtiger Erwerb = Bereicherung (Vermögensanfall ./. abzugsfähige Nachlassverbindlichkeiten, § 10 Abs. 1 ErbStG).

2) Vor-/Nacherbe & Nachlassverbindlichkeiten
- Steuerlich gilt nur der Vorerbe als Erbe (§ 6 Abs. 1 ErbStG); der Nacherbe erwirbt steuerlich vom Vorerben (§ 6 Abs. 2 S. 1 ErbStG).
- Abzugsfähig nur Schulden, die vom Erblasser herrühren und ihn wirtschaftlich belastet haben (§ 10 Abs. 5 Nr. 1 ErbStG).
- Betagte Vermächtnisse (fällig erst mit Tod des Beschwerten) wie Nacherbschaft behandelt (§ 6 Abs. 4 ErbStG); beim ersten Erbfall keine wirtschaftliche Belastung.
- Erbfallkostenpauschale 10.300 € ohne Nachweis (§ 10 Abs. 5 Nr. 3 S. 2 ErbStG).

3) Schenkung & Familienheim
- Freigebige Zuwendung = Vermögensmehrung beim Bedachten + Vermögens­minderung beim Zuwendenden (§ 7 Abs. 1 Nr. 1 ErbStG).
- Gemischte Schenkung wird bei Wertabweichung > ca. 20–25 % zur Gegenleistung vermutet.
- Familienheim­begünstigung setzt Eigentum oder Miteigentum (auch Gesamthand in GbR) voraus (§ 13 Abs. 1 Nr. 4a–c ErbStG).

4) Nicht notierte Anteile & Grundbesitz
- Nicht notierte Anteile: gemeiner Wert (§ 11 Abs. 2 BewG); Substanzwert als Mindestwert (§ 11 Abs. 2 S. 3 BewG).
- Gesonderte Feststellung nach § 151 Abs. 1 S. 1 Nr. 3 BewG.
- Betriebsgrundstücke: gesondert festgestellte Grundbesitzwerte (§ 12 Abs. 3 ErbStG).
- Gemischt genutzte Grundstücke (weder Wohn- noch Gewerbe > 80 %): Ertragswertverfahren (§ 182 Abs. 3 Nr. 2 BewG).
- Bodenwert = Fläche × angepasster Bodenrichtwert (§ 184 Abs. 2 BewG).
- Mietabweichung > 20 %: übliche Miete zwingend (§ 186 Abs. 2 BewG); Leerstand → übliche Miete ansetzen.
- Umlagefähige Betriebskosten nicht im Rohertrag (§ 186 Abs. 1 S. 2 BewG).
- Reinertrag = Rohertrag ./. pauschale Bewirtschaftungskosten (§ 187 BewG); Gebäudereinertrag = Reinertrag ./. Bodenwertverzinsung (§ 185 Abs. 2 BewG); Gebäudeertragswert = Gebäudereinertrag × Vervielfältiger (§ 185 Abs. 3 BewG).
- Ertragswert = Boden + Gebäudeertragswert (§ 184 Abs. 3 BewG); Bodenwert als Mindestwert, niedrigerer gemeiner Wert nur mit Nachweis (§ 198 BewG).
- 85 % steuerfrei: denkmalgeschützt, unrentierlich, der Allgemeinheit zugänglich (§ 13 Abs. 1 Nr. 2 ErbStG).`,
  },
  {
    id: "betriebsaufgabe-euer",
    title: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    short:
      "Aufgabeerklärung (§ 16 Abs. 3b EStG), Übergang zur Bilanzierung, Fünftelregelung und Behandlung der stillen Reserven.",
    category: "Jahresabschluss",
    source: "Internes Handout — EStG / Betriebsaufgabe.",
    keywords: /betriebsaufgabe|aufgabeerklärung|aufgabegewinn|übergangsgewinn|fünftelregel|teilwert|einlage aus privatvermögen|§\s*16\s*estg|§\s*18\s*abs\.?\s*3\s*estg|§\s*34\s*estg/i,
    references: [
      "§ 4 Abs. 1, 3 EStG",
      "§ 6 Abs. 1 Nr. 5 EStG",
      "§ 11 EStG",
      "§ 15 Abs. 1 EStG",
      "§ 16 Abs. 3, 3b EStG",
      "§ 18 Abs. 3 EStG",
      "§ 34 Abs. 1, 2 Nr. 1 EStG",
      "§§ 7, 8, 9 GewStG",
    ],
    body: `1) Gewerbebetrieb & EÜR
- Einzelhandel ist regelmäßig Gewerbebetrieb (§ 15 Abs. 1 S. 1 Nr. 1 EStG); EÜR nach § 4 Abs. 3 EStG mit Zu-/Abflussprinzip (§ 11 EStG).
- Gewerbeertrag = Gewinn (§ 7 GewStG) zzgl. Hinzurechnungen (§ 8 GewStG), abzgl. Kürzungen (§ 9 GewStG).

2) Aufgabeerklärung
- Aufgabeerklärung wirkt nur bei rechtzeitigem Eingang beim Finanzamt (§ 16 Abs. 3b EStG); Rückwirkung scheitert bei Überschreiten der 3-Monatsfrist.

3) Übergang EÜR → Bilanzierung
- Forderungen erhöhen den Übergangsgewinn (kein Zufluss in EÜR, in der Bilanz zu aktivieren).
- Verbindlichkeiten mindern den Übergangsgewinn (kein Abfluss in EÜR, in der Bilanz zu passivieren).
- Bei Betriebsaufgabe zwingend Übergang zum Betriebsvermögensvergleich (§ 18 Abs. 3 S. 2 EStG) — Ziel: vollständige Erfassung stiller Reserven.

4) Aufgabegewinn
- Außerordentliche Einkünfte (§ 34 Abs. 2 Nr. 1 EStG), Fünftelregelung (§ 34 Abs. 1 EStG).
- Aufgabe = Veräußerung/Entnahme aller wesentlichen Betriebsgrundlagen (§ 16 Abs. 3 EStG); bei Freiberuflern über § 18 Abs. 3 EStG.
- Auch zeitnah entnommene Wirtschaftsgüter einbeziehen (§ 16 Abs. 3 S. 8 EStG).

5) Einlage & Teilwert
- Zuführung aus Privatvermögen = Einlage (§ 4 Abs. 1 S. 8 EStG).
- Mehr als 3 Jahre zwischen Anschaffung und Einlage → Teilwert zwingend (§ 6 Abs. 1 Nr. 5 S. 1 EStG); Teilwert ist neue AfA-Bemessungsgrundlage.

6) Arzt / Freiberufler
- Einkünfte aus selbständiger Arbeit (§ 18 Abs. 1 Nr. 1 EStG); keine Buchführungspflicht nach HGB (§§ 1, 238 HGB), EÜR zulässig.
- Steuerfreie Heilbehandlungen (§ 4 Nr. 14 UStG) führen zu Netto-Einnahmen.

7) GmbH-Anteile im Betriebsvermögen
- Subsidiarität (§ 20 Abs. 8 EStG): Dividenden sind Betriebseinnahmen, keine Kapitaleinkünfte.
- KapESt entfaltet im BV keine Abgeltungswirkung (§ 43 Abs. 5 S. 2 EStG).
- Teileinkünfteverfahren (§ 3 Nr. 40 EStG) bei Beteiligungen im BV.`,
  },
  {
    id: "bilanzierung-immaterielle-rueckstellungen",
    title: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    short:
      "Aktivierungs(verbot/wahlrecht), Herstellungskosten, FIFO/LIFO, drohende Verluste, latente Steuern, IAB, Sammelposten, Krypto.",
    category: "Jahresabschluss",
    source: "Internes Handout — Bilanzierung / IAB / Krypto / latente Steuern.",
    keywords: /immateriell|herstellungskosten|fifo|lifo|teilwertabschreibung|drohverlust|latente steuer|iab|investitionsabzugsbetrag|§\s*7g|sammelposten|krypto|§\s*274|§\s*248|§\s*249|§\s*255/i,
    references: [
      "§§ 246, 247, 248 Abs. 2, 249, 252, 255, 266, 274 HGB",
      "§ 5 Abs. 1, 2, 4a EStG",
      "§ 6 Abs. 1 Nr. 2, 2a, 5, 6 EStG",
      "§ 7 Abs. 1, 4 EStG",
      "§ 7g EStG",
      "§ 15 UStG",
      "BMF 10.05.2022 (Kryptowerte)",
    ],
    body: `1) Immaterielle WG / Herstellungskosten
- Aktivierungswahlrecht für selbst geschaffene immaterielle WG des AV handelsrechtlich (§ 248 Abs. 2 HGB); steuerlich Aktivierungsverbot (§ 5 Abs. 2 EStG) → passive latente Steuern (§ 274 HGB).
- Forschung nicht aktivierbar, Entwicklung aktivierbar (§ 255 Abs. 2a HGB).
- Vertriebskosten nie Teil der HK (§ 255 Abs. 2 S. 4 HGB); MEK/MGK/FEK/FGK Pflicht (§ 255 Abs. 2 HGB).

2) Vorräte
- FIFO steuerlich unzulässig, LIFO zulässig (§ 6 Abs. 1 Nr. 2a EStG); UV-Teilwertabschreibung als Wahlrecht (§ 6 Abs. 1 Nr. 2 S. 2 EStG).

3) Rückstellungen & schwebende Geschäfte
- Drohverluste handelsrechtlich Rückstellung (§ 249 Abs. 1 S. 1 HGB), steuerlich unzulässig (§ 5 Abs. 4a EStG).
- Schwebende Geschäfte werden nicht bilanziert, solange Leistung und Gegenleistung gleichwertig sind (Realisationsprinzip, § 252 Abs. 1 Nr. 4 HGB).

4) Latente Steuern (§ 274 HGB)
- Temporäre Differenz zwischen Handels- und Steuerbilanz × Steuersatz.
- Passive latente Steuern: Ansatzpflicht.
- Aktive latente Steuern: Ansatzwahlrecht.

5) IAB (§ 7g EStG)
- Rein steuerlich; Auflösung/Hinzurechnung fristgerecht, sonst Rückgängigmachung.
- Hinzurechnung/Übertragung max. 50 % der tatsächlichen Anschaffungskosten (netto).
- Geplante kürzere Nutzungsdauer ändert die AfA nicht (§ 7 Abs. 1, Abs. 4 EStG).

6) Sammelposten (§ 6 Abs. 2a EStG)
- Kein Einzelabgang; AfA stur 1/5 p. a. unabhängig von Schaden/Verkauf einzelner WG.

7) Vorsteuer & Anlagevermögen
- Aktivierung des AV und Passivierung der Verbindlichkeit bereits bei Erwerb (§ 246 HGB; § 5 EStG).
- Vorsteuerabzug bei ordnungsgemäßer Rechnung im Leistungs-/Rechnungszeitraum (§ 15 UStG), unabhängig von Zahlung.

8) Kryptowährungen
- Wirtschaftsgüter; Ansatz mit Anschaffungskosten (§§ 246 HGB, 5/6 EStG).
- Krypto-Zahlung oder Krypto-zu-Krypto = Tausch; Erlös = Marktwert der erhaltenen Gegenleistung (§ 6 Abs. 6 EStG; BMF 10.05.2022).`,
  },
  {
    id: "anteilstausch-umwstg",
    title: "Anteilstausch nach § 21 UmwStG",
    short:
      "Kein Rückwirkungszeitraum; Wertansatz gemeiner Wert vs. Buchwert; Voraussetzungen für Buchwertansatz.",
    category: "Jahresabschluss",
    source: "Internes Handout — UmwStG / Anteilstausch.",
    keywords: /anteilstausch|umwstg|§\s*21\s*umwstg|einbringung\s+(von\s+)?anteilen|buchwertansatz/i,
    references: ["§ 21 UmwStG", "§§ 2, 20 Abs. 5/6 UmwStG"],
    body: `1) Zeitpunkt / Rückwirkung
- Steuerlich wirkt der Anteilstausch ab Übergang Nutzen und Lasten — keine Rückwirkung wie bei Verschmelzungen (§§ 2, 20 Abs. 5/6 UmwStG gelten nicht).

2) Wertansatz
- Grundsatz: gemeiner Wert bei der übernehmenden GmbH → beim Einbringenden Veräußerungsgewinn.
- Buchwertansatz auf Antrag möglich (§ 21 Abs. 1 S. 2 UmwStG), wenn die gesetzlichen Voraussetzungen nach Einbringung erfüllt sind (insb. mehrheitsvermittelnde Beteiligung, qualifizierter Anteilstausch).

3) Praxisfolgen
- Buchwertansatz = steuerneutral; gemeiner Wert = Veräußerungsgewinn mit Folgen für KSt/GewSt/ESt.
- 7-jährige Sperrfristen nach § 22 UmwStG bei nachfolgender Anteilsveräußerung beachten.`,
  },
  {
    id: "reverse-charge-grundschema",
    title: "Reverse Charge (§ 13b UStG) — Grundschema & Anwendungsfälle",
    short:
      "Leistender stellt netto, Empfänger schuldet die USt; Vorsteuerabzug gleichzeitig möglich.",
    category: "Umsatzsteuer",
    source: "Internes Handout — Rückstellungen / USt / Mitunternehmerschaft.",
    keywords: /§\s*13b|reverse[\s-]?charge|bauleistung\b|werklieferung\s+ausland|schrott|altgold|co2[\s-]?zertifikat|§\s*25b/i,
    references: [
      "§ 13b Abs. 1, 2 UStG",
      "§ 15 UStG",
      "§ 25b UStG",
      "UStAE 13b.1 ff.",
    ],
    body: `1) Grundschema
- Leistender Unternehmer stellt Netto-Rechnung mit Hinweis "Steuerschuldnerschaft des Leistungsempfängers".
- Leistungsempfänger schuldet die USt und kann sie bei Vorsteuerabzugsberechtigung zeitgleich abziehen (§ 15 UStG) → grundsätzlich liquiditätsneutral.

2) Anwendungsfälle (§ 13b Abs. 2 UStG)
- Nr. 1: Werklieferungen / sonstige Leistungen eines im Ausland ansässigen Unternehmers (i. V. m. § 13b Abs. 1 UStG für ig. sonstige Leistungen nach § 3a Abs. 2 UStG).
- Nr. 4: Bauleistungen, wenn der Empfänger selbst nachhaltig Bauleistungen erbringt.
- Nr. 5: Gas, Elektrizität, Wärme/Kälte unter besonderen Voraussetzungen.
- Nr. 7–11: Schrott, bestimmte Metalle, Altgold, Mobilfunkgeräte/Tablets ab Schwelle, CO₂-Zertifikate.
- Dreiecksgeschäfte: Vereinfachung nach § 25b UStG prüfen.

3) Beispiel Bauleistung
- Subunternehmer (Ausland) berechnet 50.000 € netto an deutschen Generalunternehmer (Bauleistender).
- Empfänger schuldet 9.500 € USt (§ 13b UStG) und zieht sie als Vorsteuer (§ 15 UStG) → liquiditätsneutral.`,
  },
  {
    id: "reihengeschaeft",
    title: "Reihengeschäft (§ 3 Abs. 6, 7 UStG)",
    short:
      "Mehrere Umsatzgeschäfte, eine Warenbewegung; nur eine Lieferung ist die bewegte, alle anderen ruhen.",
    category: "Umsatzsteuer",
    source: "Internes Handout — Reihengeschäft (UStAE 3.14).",
    keywords: /reihengeschäft|bewegte lieferung|ruhende lieferung|ustae 3\.14|§\s*3\s*abs\.?\s*6|§\s*3\s*abs\.?\s*7/i,
    references: [
      "§ 3 Abs. 6, 7 UStG",
      "§ 6a UStG",
      "UStAE 3.14 Abs. 3–11",
    ],
    body: `1) Voraussetzung
- Mehrere Unternehmer schließen Umsatzgeschäfte über denselben Gegenstand ab; nur eine Warenbewegung.

2) Zuordnung der bewegten Lieferung (UStAE 3.14)
- Nur eine Lieferung ist die bewegte (§ 3 Abs. 6 UStG); alle anderen sind ruhende Lieferungen (§ 3 Abs. 7 UStG).
- Maßgeblich, wer den Transport veranlasst:
  • Transport durch ersten Lieferer (A) → A→B bewegt.
  • Transport durch Zwischenhändler (B) → grundsätzlich A→B bewegt (Vermutung); B kann mit USt-IdNr. seines Abgangslandes die bewegte Lieferung auf B→C verlagern.
  • Transport durch letzten Abnehmer (C) → B→C bewegt.

3) Ortsbestimmung
- Bewegte Lieferung: Beginn der Beförderung/Versendung.
- Ruhende Lieferung: Ort der Verschaffung der Verfügungsmacht.

4) Steuerbefreiung
- Bewegte Lieferung kann als innergemeinschaftliche Lieferung (§ 6a UStG) steuerfrei sein, wenn die Voraussetzungen (USt-IdNr., belegmäßige Nachweise, ZM) erfüllt sind.
- Ruhende Lieferung regelmäßig im jeweiligen Belegenheitsstaat steuerbar.

5) Beispiel A → B → C, Transport durch B ins EU-Ausland
- A → B: bewegte Lieferung, Ort DE, ig. Lieferung (§ 6a UStG).
- B → C: ruhende Lieferung, Ort im EU-Bestimmungsland, dort steuerbar.`,
  },
  {
    id: "mitunternehmerschaft",
    title: "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG)",
    short:
      "Initiative + Risiko; gesonderte und einheitliche Feststellung; Sonder- und Ergänzungsbilanzen.",
    category: "Jahresabschluss",
    source: "Internes Handout — Mitunternehmerschaft.",
    keywords: /mitunternehmer|mitunternehmerschaft|sonderbilanz|ergänzungsbilanz|gesamthandsbilanz|§\s*15\s*abs\.?\s*1\s*nr\.?\s*2|atypisch still|kommanditist|komplementär/i,
    references: [
      "§ 15 Abs. 1 Nr. 2 EStG",
      "§ 180 AO",
      "§§ 118, 166 HGB",
    ],
    body: `1) Voraussetzungen
- Mitunternehmerinitiative (Geschäftsführung / Kontrollrechte, §§ 118, 166 HGB) und
- Mitunternehmerrisiko (Beteiligung an Gewinn, Verlust und stillen Reserven incl. Firmenwert).
- Beides muss grundsätzlich kumulativ erfüllt sein.

2) Typische Fälle
- OHG, KG, GbR, atypisch stille Gesellschaft.
- Komplementär: Initiative (+), Risiko (+).
- Kommanditist: Initiative über Kontrollrechte (§ 166 HGB), Risiko über Gewinn-/Verlustbeteiligung; kann Mitunternehmer sein.
- Typisch stiller Gesellschafter: regelmäßig kein Mitunternehmer.

3) Rechtsfolgen
- Einkünfte aus Gewerbebetrieb (§ 15 Abs. 1 Nr. 2 EStG).
- Gesonderte und einheitliche Feststellung (§ 180 AO).
- Steuerliches Gesamtergebnis = Gesamthandsbilanz + Sonderbilanzen + Ergänzungsbilanzen.

4) Sonder- vs. Ergänzungsbilanz
- Sonderbilanz: Wirtschaftsgüter im Sonderbetriebsvermögen (z. B. an die Gesellschaft überlassenes Grundstück, Gesellschafterdarlehen). Sonderbetriebseinnahmen/-ausgaben (Miete, AfA, Zinsen) erhöhen/mindern den Gewinnanteil des jeweiligen Gesellschafters.
- Ergänzungsbilanz: individuelle Korrektur der Wertansätze in der Gesamthandsbilanz für einzelne Gesellschafter (z. B. Mehr-/Minderzahlung beim Eintritt) → spezielle AfA nur bei diesem Gesellschafter.`,
  },
  {
    id: "npo-ruecklagen-pruefhinweise",
    title: "NPO — Rücklagen, Audit-Risiken und offene Punkte",
    short:
      "Konkrete Planung, projektbezogene/Investitions-/Infrastruktur-/Audit-Rücklagen, Darlegungslast, Nachforderungen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes NPO-Arbeitspapier — Rücklagen, offene Punkte, Nachweise.",
    keywords: /projektbezogene rücklage|investitionsrücklage|ersatzbeschaffungsrücklage|infrastrukturrücklage|audit[-\s]?rücklage|rückforderung|darlegungslast|rücklagenspiegel|offene punkte|nachforderung|krankenversicherung\s+verein|fahrtenbuch\s+verein/i,
    references: [
      "§ 55 Abs. 1 Nr. 5 AO",
      "§ 62 Abs. 1 Nr. 1–4 AO",
      "§ 63 Abs. 4 AO",
    ],
    body: `1) Grundsatz / Darlegungslast
- Die Körperschaft trägt die Darlegungslast für die Voraussetzungen jeder Rücklagenbildung.
- Mit Ausnahme der freien Rücklage (§ 62 Abs. 1 Nr. 3 AO) müssen Rücklagen auf konkrete, geplante und satzungsgemäße Zwecke bezogen sein.
- Erforderlich: Beschluss, konkreter Zweck, Zeitplan, Kostenrahmen, Umsetzungsstand, transparente Abbildung in Rücklagenspiegel und MVR.

2) Projektbezogene Rücklage
- Zulässig für konkrete satzungsgemäße Projekte — auch wenn Erstattung (z. B. Fördermittel) beantragt ist, sofern Durchführung glaubhaft und Mittel in angemessenem Zeitraum benötigt werden.
- Auflösung, sobald Grund entfällt oder Erstattung erfolgt.

3) Investitions-/Ersatzbeschaffungsrücklage (§ 62 Abs. 1 Nr. 2 AO)
- Höhe grundsätzlich an der regulären AfA des zu ersetzenden WG orientiert.
- Höherer Bedarf nur mit Nachweis (Angebote, Kostenvoranschläge, Preissteigerungen, technische Anforderungen).

4) Infrastruktur-/Plattformrücklage
- Laufende Plattform-/Hosting-/Personalkosten → eher Betriebsmittelrücklage (§ 62 Abs. 1 Nr. 1 AO).
- Geplante technische Erneuerung / Systemumstellung → Investitions-/Ersatzbeschaffungsrücklage.
- Keine pauschale "Sicherheitsreserve" — konkret begründen.

5) Rücklage für Audit-/Rückforderungsrisiken
- Möglich als Betriebsmittelrücklage bei tatsächlicher Unsicherheit über Rückforderungen.
- Risikobetrag aus konkretem Fördervertrag, Erfahrungswerten und risikobehafteten Positionen herleiten — pauschale Prozentsätze sind kritisch.
- Bei hinreichend konkreter Verpflichtung Abgrenzung zur bilanziellen Rückstellung (§ 249 HGB) prüfen.

6) Offene Punkte / Nachforderungen
- Bei Zeitdruck dokumentierte Zwischenfreigabe mit klar benannten offenen Punkten besser als Stillstand.
- Typische Nachforderungen: Versicherungsbeleg/Beitragshöhe, Beschluss/Vertrag, Funktion der Person im Verein, Fahrzeug-Nutzungsvereinbarung & Fahrtenbuch, Darlehensvertrag, konkrete Investitions-/Erweiterungsplanung.

7) Merksätze
- Rücklage nur stehen lassen, wenn Zweck, Planung, Beschluss und Dokumentation belastbar sind.
- Nicht auf die Bezeichnung des Belegs schauen, sondern auf den wirtschaftlichen Charakter der Zahlung.
- Übernahme personenbezogener Kosten (z. B. KV-Beiträge) ohne klare Grundlage = Risiko für Mittelverwendung, Vergütung, Lohnsteuer und SV.`,
  },
  {
    id: "reverse-charge-npo",
    title: "Reverse Charge bei gemeinnützigen Körperschaften (§ 13b UStG)",
    short:
      "Steuerfalle für NPOs bei Leistungsbezug aus dem Ausland — Zusammenspiel §§ 2, 3a, 13b UStG; auch ideeller Bereich betroffen.",
    category: "Umsatzsteuer",
    source: "von Maydell, npoR 2022, 190 — kanzleiintern aufbereitet.",
    keywords: /reverse[-\s]?charge.*(verein|gemeinn|npo|ggmbh|stiftung)|gemeinn.*reverse|§\s*13b.*(verein|gemeinn|ideell)|ust[-\s]?idnr.*verein|leistung.*ausland.*verein/i,
    references: [
      "§ 13b UStG",
      "§ 3a Abs. 1, 2 UStG",
      "§ 2 UStG",
      "§ 19 UStG",
      "§ 15 Abs. 2 S. 1 Nr. 1 UStG",
      "Abschn. 13b.1 Abs. 1 UStAE",
    ],
    body: `1) Kerngedanke
- Bei sonstigen Leistungen eines im Ausland ansässigen Unternehmers an einen inländischen Unternehmer verlagert § 3a Abs. 2 UStG den Leistungsort ins Inland; § 13b UStG verlagert die Steuerschuld auf den Leistungsempfänger (Reverse Charge).
- Gilt seit 2011 ausdrücklich auch dann, wenn die Leistung für den nichtunternehmerischen / ideellen Bereich einer gemeinnützigen Körperschaft bezogen wird, sofern die Körperschaft im Übrigen Unternehmerin ist oder eine USt-IdNr. verwendet (§ 3a Abs. 2 S. 3 UStG).

2) Unternehmereigenschaft der NPO (§ 2 UStG)
- Unternehmerisch tätig regelmäßig im steuerpflichtigen wirtschaftlichen Geschäftsbetrieb, im Zweckbetrieb und in Teilen der Vermögensverwaltung.
- Schon eine geringe unternehmerische Tätigkeit reicht für die Eigenschaft als Unternehmer und damit für § 3a Abs. 2 UStG.

3) Häufige Fehleinschätzungen
- "Wir sind gemeinnützig, also keine USt" — falsch. § 13b greift auch bei steuerfreien Umsätzen und bei Kleinunternehmern (§ 19 UStG) der inländischen NPO.
- Die Kleinunternehmerregelung gilt nicht für im Ausland ansässige Leistende (§ 13b Abs. 5 S. 8 UStG bezieht sich nur auf Inländer).
- Hat der ausländische Unternehmer fälschlich ausländische USt aufgeschlagen, bleibt die deutsche Steuerschuld bestehen; die ausländische USt erhöht nach h. M. sogar die Bemessungsgrundlage.

4) Vorsteuerproblem
- Vorsteuerabzug nach § 15 UStG nur, soweit die Eingangsleistung für steuerpflichtige Umsätze verwendet wird.
- Bei NPOs typischerweise (teilweiser) Ausschluss → die nach § 13b geschuldete USt wird zur echten Zusatzbelastung.

5) Typische Risikofälle
- Werbeleistungen großer Tech-Konzerne (z. B. Irland), Webseiten-/Agenturleistungen aus Drittstaaten, Cloud-/SaaS-Leistungen, Freelancer im Ausland.
- Bauleistungen ausländischer Unternehmer an inländischem Grundstück (§ 3a Abs. 3 Nr. 1 UStG) — immer USt im Inland.
- Projektpartner / Hilfsperson im Ausland (§ 57 Abs. 1 S. 2 AO) — Leistungsaustausch kann Reverse Charge auslösen.

6) USt-IdNr. nicht leichtfertig beantragen
- Bei nicht-unternehmerischen Körperschaften löst die bloße Verwendung der USt-IdNr. die Ortsverlagerung ins Inland und damit § 13b aus (§ 3a Abs. 2 S. 3 Hs. 1 UStG).

Merksatz: Gemeinnützigkeit schützt nicht vor § 13b UStG. Bei jedem Leistungsbezug aus dem Ausland prüfen: Wer ist Leistender? Ist die NPO Unternehmer / hat sie USt-IdNr.? Greift Reverse Charge? Vorsteuer möglich?`,
  },
  {
    id: "kooperation-57-abs-3-ao",
    title: "Servicegesellschaften & Kooperationen — § 57 Abs. 3 AO",
    short:
      "Planmäßiges Zusammenwirken gemeinnütziger Körperschaften, doppeltes Satzungserfordernis, EuGH-Vorlage des BFH (V R 22/23) und Alternativen (§ 4 Nr. 29 UStG).",
    category: "NPO / Gemeinnützigkeit",
    source: "Kanzleinotizen zu BFH-Beschluss vom 22.05.2025, V R 22/23.",
    keywords: /§\s*57\s*abs\.?\s*3|servicegesell|planmäßiges zusammenwirken|kostenteilungsgemeinschaft|§\s*4\s*nr\.?\s*29|arbeitsteilige gemeinn/i,
    references: [
      "§ 57 Abs. 1, 3 AO",
      "§§ 51–68 AO",
      "§ 4 Nr. 29 UStG",
      "Art. 132 Abs. 1 lit. f MwStSystRL",
      "Art. 107, 108 AEUV",
      "BFH 22.05.2025, V R 22/23",
      "FG Hamburg 26.09.2023, 5 K 11/23",
      "BFH 04.09.2024, XI R 37/21",
    ],
    body: `1) Grundsatz Unmittelbarkeit (§ 57 Abs. 1 AO)
- Steuerbegünstigte Zwecke sind grundsätzlich unmittelbar selbst zu verwirklichen.
- Ausnahmen: Hilfsperson (§ 57 Abs. 1 S. 2 AO) und seit JStG 2020 das planmäßige Zusammenwirken (§ 57 Abs. 3 AO).

2) § 57 Abs. 3 AO — planmäßiges Zusammenwirken
- Eine Körperschaft verfolgt steuerbegünstigte Zwecke auch dann unmittelbar, wenn sie satzungsgemäß durch planmäßiges Zusammenwirken mit mindestens einer weiteren steuerbegünstigten Körperschaft einen steuerbegünstigten Zweck verwirklicht.
- Eröffnet die Steuerbegünstigung reiner Servicegesellschaften (IT, Buchhaltung, Personal, Beschaffung, Reinigung).

3) "Doppeltes Satzungserfordernis"
- Finanzverwaltung (AEAO Nr. 8 zu § 57 Abs. 3 AO) verlangte die Verankerung sowohl in der Satzung der leistenden Servicegesellschaft als auch in den Satzungen der empfangenden Körperschaften.
- FG Hamburg (26.09.2023, 5 K 11/23) verwarf diese doppelte Satzungspflicht; nur die Satzung der leistenden Körperschaft muss die Kooperation aufnehmen.
- BFH hat die Frage im Beschluss vom 22.05.2025 (V R 22/23) nicht entschieden, tendiert aber der FG-Hamburg-Auffassung zu.

4) EuGH-Vorlage (BFH V R 22/23) — beihilferechtliches Risiko
- BFH zweifelt an der Vereinbarkeit von § 57 Abs. 3 AO mit Art. 107 AEUV; Bundesregierung hat keine Notifizierung nach Art. 108 Abs. 3 AEUV vorgenommen.
- Vorlagefragen: (1) staatliche Beihilfe? (2) neutralisieren §§ 55, 61 AO den selektiven Vorteil? (3) notifizierungspflichtige Neu-/Umgestaltungsbeihilfe?
- Bei Einstufung als unzulässige Beihilfe droht Durchführungsverbot und Rückforderung gewährter Steuervergünstigungen.

5) Handlungsempfehlungen
- Bestehende Strukturen: Risikoaudit, lückenlose Verrechnungspreis-Dokumentation (Fremdvergleich), ggf. Rückstellungen für mögliche Steuernachzahlungen, USt-Härtefallklauseln in Verträge.
- Neugründungen: vorrangig Kostenteilungsgemeinschaft nach § 4 Nr. 29 UStG (basiert auf Art. 132 Abs. 1 lit. f MwStSystRL; BFH 04.09.2024, XI R 37/21 bestätigt). Hybride Gestaltungen möglich (gGmbH, deren Satzung sowohl § 57 Abs. 3 AO als auch § 4 Nr. 29 UStG erfüllt).
- Allgemein: schriftliche Verträge, Kostenverteilungsschlüssel, Dokumentation der Selbstkosten.`,
  },
  {
    id: "darlehen-npo",
    title: "Darlehensvergabe durch gemeinnützige Organisationen",
    short:
      "Mittelherkunft entscheidend — zeitnah zu verwendende Mittel nur zur unmittelbaren Zweckverwirklichung; sonst nur aus freier Rücklage / Vermögen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Darlehensvergabe NPO.",
    keywords: /darlehen.*(verein|gemeinn|npo|ggmbh|stiftung)|darlehensvergabe|kreditvergabe.*gemeinn|zinslos.*verein/i,
    references: [
      "§ 55 Abs. 1 Nr. 1, 5 AO",
      "§ 58 Nr. 1 AO",
      "§ 62 Abs. 1 Nr. 3 AO",
    ],
    body: `1) Grundsatz
- Darlehensvergabe ist als solche kein gemeinnütziger Zweck und darf nicht Hauptzweck der Satzung sein, kann aber als Mittel zur Zweckverwirklichung satzungsgemäß vorgesehen werden.
- Maßgeblich ist die Herkunft der eingesetzten Mittel.

2) Aus zeitnah zu verwendenden Mitteln (Spenden, Beiträge, Überschüsse aus Zweck-/wirtschaftlichen Geschäftsbetrieben)
- Grundsätzlich gemeinnützigkeitsschädlich, weil Mittel nicht endgültig verbraucht, sondern nur in eine Forderung umgewandelt werden.
- Ausnahmsweise unschädlich, wenn das Darlehen unmittelbar der Verwirklichung satzungsmäßiger Zwecke dient (z. B. Schuldnerberatung mit Ablösung von Bankschulden, Studienstipendien als Darlehen, Instrumentendarlehen an Nachwuchskünstler). Voraussetzung: zinslos oder zinsverbilligt (Unterscheidung zur gewerblichen Kreditvergabe) und Rückflüsse werden wieder zeitnah verwendet.
- An andere steuerbegünstigte Körperschaften: zulässig nach § 58 Nr. 1 AO, wenn die Empfänger-Körperschaft die Mittel ihrerseits zeitnah satzungsgemäß verwendet.

3) Aus nicht zeitnah zu verwendenden Mitteln (insb. freie Rücklage § 62 Abs. 1 Nr. 3 AO, sonstige Vermögenszuführungen)
- Darlehen als Vermögensanlage/-umschichtung sind zulässig.
- An nicht-gemeinnützige Empfänger (Mitarbeiter, gewerbliche Tochter): zwingend marktübliche Konditionen, insb. angemessene Verzinsung. Zinslose/begünstigte Darlehen wären unzulässige Mittelverwendung oder vGA und gefährden die Gemeinnützigkeit.
- Rückflüsse (Tilgung + Zinsen) müssen wieder zeitnah satzungsgemäß verwendet werden.

4) Freie Rücklage als Finanzierungsquelle
- Bildung ohne konkreten Zweck zulässig (§ 62 Abs. 1 Nr. 3 AO).
- Höchstens 1/3 des Überschusses der Vermögensverwaltung + 10 % der sonstigen zeitnah zu verwendenden Mittel pro Jahr; Nachholung in zwei Folgejahren möglich.
- Gesamthöhe unbegrenzt; keine zeitliche Verwendungspflicht.
- Bildung durch Beschluss des zuständigen Gremiums, dokumentiert im Jahresabschluss / Rücklagenspiegel.

Merksatz: Darlehen zur unmittelbaren Zweckverwirklichung → zinsgünstig/zinslos aus allen Mitteln; Darlehen als Vermögensanlage → nur aus freier Rücklage / Vermögen und zu marktüblichen Konditionen.`,
  },
  {
    id: "ust-grundpruefung",
    title: "Umsatzsteuer — Grundprüfung (Steuerbarkeit, Ort, Steuerschuldner)",
    short:
      "Prüffolge: Leistungsaustausch → Leistungsort → Steuerbefreiung → Bemessungsgrundlage → Steuersatz → Steuerschuldner → Entstehungszeitpunkt.",
    category: "Umsatzsteuer",
    source: "Internes Handout — USt-Grundprüfung.",
    keywords: /ust[-\s]?grundpr|umsatzsteuer.*pr(üfung|uefung)|steuerbarkeit|leistungsort|sollversteuerung|ort der lieferung/i,
    references: [
      "§ 1 Abs. 1 Nr. 1 UStG",
      "§ 3 Abs. 6, 7 UStG",
      "§ 3a UStG",
      "§ 4 UStG",
      "§ 10 Abs. 1 UStG",
      "§ 12 UStG",
      "§ 13 Abs. 1 Nr. 1 a UStG",
      "§ 13a Abs. 1 Nr. 1 UStG",
      "§ 13b UStG",
    ],
    body: `Prüffolge:
1) Leistungsaustausch — Leistung und Gegenleistung sind innerlich verknüpft (§ 1 Abs. 1 Nr. 1 UStG).
2) Leistungsort Inland — bewegte Lieferung: Beginn der Beförderung/Versendung (§ 3 Abs. 6 S. 1 UStG); ruhende Lieferung: Ort der Verschaffung der Verfügungsmacht (§ 3 Abs. 7 S. 1 UStG); sonstige Leistungen: § 3a UStG.
3) Steuerbefreiung — § 4 UStG (z. B. ig. Lieferung, Heilbehandlungen, Bankumsätze).
4) Bemessungsgrundlage — Entgelt (§ 10 Abs. 1 UStG).
5) Steuersatz — 19 % Regelsatz (§ 12 Abs. 1 UStG); 7 % ermäßigt (§ 12 Abs. 2 UStG).
6) Steuerschuldner — grundsätzlich der leistende Unternehmer (§ 13a Abs. 1 Nr. 1 UStG); Übergang bei § 13b UStG.
7) Entstehungszeitpunkt — bei Sollversteuerung: Ablauf des Voranmeldungszeitraums der Leistungsausführung (§ 13 Abs. 1 Nr. 1 a S. 1 UStG).`,
  },
  {
    id: "forderungen-ewb-pwb",
    title: "Kundenforderungen — Bewertung, EWB, PWB, USt-Korrektur",
    short:
      "Forderungen mit Nennwert; Einzelbewertung vor Pauschalwertberichtigung; bei PWB USt herausrechnen (§ 17 Abs. 2 UStG); Wertaufhellung beachten.",
    category: "Jahresabschluss",
    source: "Internes Handout — Forderungsbewertung und Wertaufhellung.",
    keywords: /einzelwertberichtigung|pauschalwertberichtigung|\bewb\b|\bpwb\b|delkredere|wertaufhellung|forderungsbewertung|§\s*17\s*abs\.?\s*2/i,
    references: [
      "§ 6 Abs. 1 Nr. 2 EStG",
      "§ 247 Abs. 2 HGB",
      "§ 252 Abs. 1 Nr. 3, 4 HGB",
      "§ 253 Abs. 1 S. 1 HGB",
      "§ 17 Abs. 2 Nr. 1 UStG",
      "R 6.1 Abs. 2 EStR",
    ],
    body: `1) Ansatz & Bewertung
- Kundenforderungen = Umlaufvermögen (R 6.1 Abs. 2 EStR i. V. m. § 247 Abs. 2 HGB).
- Ansatz mit Anschaffungskosten / Nennwert (§ 6 Abs. 1 Nr. 2 S. 1 EStG i. V. m. § 253 Abs. 1 S. 1 HGB).
- Kombination EWB + PWB zulässig (§ 252 Abs. 1 Nr. 3 HGB — Einzelbewertungsprinzip; zuerst einzeln, dann pauschal auf den Restbestand).

2) Einzelwertberichtigung (EWB)
- Konkret erkennbares Ausfallrisiko bei einzelnem Debitor (Insolvenz, Mahnverfahren, Bestreiten).
- USt-Korrektur erst bei tatsächlicher Uneinbringlichkeit (§ 17 Abs. 2 Nr. 1 UStG) — Reduktion auf Nettowert.

3) Pauschalwertberichtigung (PWB)
- Allgemeines Ausfallrisiko auf Basis eines nachgewiesenen Erfahrungssatzes (§ 252 Abs. 1 Nr. 4 HGB).
- USt ist herauszurechnen (insoweit ist bei späterem Ausfall ein USt-Erstattungsanspruch zu erwarten, § 17 Abs. 2 Nr. 1 UStG).

4) Wertaufhellung
- Bis zur Bilanzaufstellung bekannt gewordene werterhellende Tatsachen sind zu berücksichtigen (§ 252 Abs. 1 Nr. 4 HGB).
- PWB ist auf den Betrag zu begrenzen, für den am Bilanzstichtag tatsächlich noch ein Ausfallrisiko besteht.

Prüfpunkte: Forderungsbestand abgestimmt? Konkrete Risiken einzelner Debitoren? Erfahrungssatz nachweisbar und plausibel? USt bei PWB herausgerechnet? Werterhellende Tatsachen bis zur Bilanzerstellung berücksichtigt?`,
  },
  {
    id: "rhb-vorratsbewertung",
    title: "Roh-, Hilfs- und Betriebsstoffe — Bewertung & Verbrauchsfolgen",
    short:
      "Umlaufvermögen; Anschaffungskosten; gewogener Durchschnitt zulässig; LIFO steuerlich anerkannt, FIFO nur handelsrechtlich.",
    category: "Jahresabschluss",
    source: "Internes Handout — RHB / Vorratsbewertung.",
    keywords: /roh-,?\s?hilfs-?\s?(und|&)?\s?betriebsstoffe|\brhb\b|vorratsbewertung|gewogener durchschnitt|verbrauchsfolge|§\s*256\s*hgb/i,
    references: [
      "§ 240 Abs. 1, 4 HGB",
      "§ 247 Abs. 2 HGB",
      "§ 253 Abs. 1 S. 1 HGB",
      "§ 256 HGB",
      "§ 5 Abs. 1 S. 1 EStG",
      "§ 6 Abs. 1 Nr. 2 EStG",
      "§ 6 Abs. 1 Nr. 2a EStG",
    ],
    body: `1) Ansatz
- RHB sind Umlaufvermögen (R 6.1 Abs. 2 EStR i. V. m. § 247 Abs. 2 HGB).
- Bewertung mit Anschaffungskosten (§ 6 Abs. 1 Nr. 2 S. 1 EStG i. V. m. § 253 Abs. 1 S. 1 HGB).
- Mangels spezieller steuerlicher Bewertungsregel: handelsrechtlicher Wertansatz wird grundsätzlich in die Steuerbilanz übernommen (§ 5 Abs. 1 S. 1 EStG).

2) Vereinfachungsverfahren
- Bestand zum Bilanzstichtag aus Inventur + Zugängen − Entnahmen (§ 240 Abs. 1 HGB).
- Gewogener Durchschnitt zulässig (§ 240 Abs. 4 HGB i. V. m. § 256 S. 2 HGB) — handels- und steuerrechtlich.

3) Verbrauchsfolge
- Handelsrechtlich: FIFO oder LIFO (§ 256 S. 1 HGB).
- Steuerlich: nur LIFO (§ 6 Abs. 1 Nr. 2a EStG); FIFO nicht zulässig.

Merksatz: RHB = Umlaufvermögen, Bewertung regelmäßig mit Anschaffungskosten, Durchschnittsbewertung als sachgerechte Vereinfachung.`,
  },
  {
    id: "aenderung-173a-ao",
    title: "Änderung nach § 173a AO — Schreib- und Rechenfehler",
    short:
      "Zwingende Änderung von Steuerbescheiden bei rechtserheblichen Schreib-/Rechenfehlern des Steuerpflichtigen — nur innerhalb der Festsetzungsfrist.",
    category: "Buchhaltung",
    source: "Internes Handout — AO § 173a / Festsetzungsfrist.",
    keywords: /§\s*173a|schreibfehler|rechenfehler|festsetzungsfrist|§\s*169|§\s*170/i,
    references: [
      "§ 173a AO",
      "§ 169 Abs. 1, Abs. 2 S. 1 Nr. 2 AO",
      "§ 170 Abs. 2 Nr. 1 AO",
    ],
    body: `1) Voraussetzungen § 173a AO
- Schreib- oder Rechenfehler des Steuerpflichtigen bei Erstellung der Steuererklärung.
- Dadurch unzutreffende Mitteilung rechtserheblicher Tatsachen.
- Rechtserheblich, wenn das FA bei Kenntnis mit an Sicherheit grenzender Wahrscheinlichkeit anders festgesetzt hätte.
- Rechtsfolge: zwingende Änderung (kein Ermessen).

2) Festsetzungsfrist
- Reguläre Frist ESt: 4 Jahre (§ 169 Abs. 2 S. 1 Nr. 2 AO).
- Anlaufhemmung bei Abgabe einer Erklärung: Beginn mit Ablauf des Kalenderjahres der Abgabe (§ 170 Abs. 2 Nr. 1 AO).
- Beispiel ESt 2017, abgegeben 2018: Beginn 31.12.2018, Ende regulär 31.12.2022.

Merksatz: § 173a AO korrigiert Schreib-/Rechenfehler — aber nur, wenn rechtserheblich und die Festsetzungsfrist noch läuft.`,
  },
  {
    id: "ust-karussell-gutglaube",
    title: "Umsatzsteuerkarussell & Vertrauensschutz beim Vorsteuerabzug",
    short:
      "Vorsteuerabzug bleibt für gutgläubige Unternehmer erhalten — entfällt bei Wissen/Wissen-müssen um Einbeziehung in MwSt-Betrug.",
    category: "Umsatzsteuer",
    source: "Weimann, Umsatzsteuer in der Praxis, 15. Aufl. — kanzleiintern aufbereitet.",
    keywords: /karussell|missing trader|gutglaubensschutz|gutgläubig|vertrauensschutz.*vorsteuer|mwst[-\s]?betrug|wissen müssen.*umsatz/i,
    references: [
      "§ 15 UStG",
      "EuGH 12.01.2006, C-354/03 u. a. (Optigen)",
      "EuGH 06.07.2006, C-439/04 u. C-440/04 (Kittel/Recolta)",
      "BFH 19.04.2007, V R 48/04, BStBl. II 2009, 315",
    ],
    body: `1) Grundsatz
- Jeder Umsatz einer Lieferkette ist eine eigenständige wirtschaftliche Tätigkeit (Optigen).
- Der Vorsteuerabzug eines redlichen Unternehmers bleibt erhalten, auch wenn ein vor- oder nachgelagerter Umsatz mit MwSt-Betrug behaftet ist, sofern der Unternehmer dies weder kannte noch kennen konnte.

2) Versagung bei Wissen / Wissen-müssen (Kittel)
- Der Vorsteuerabzug ist zu versagen, wenn objektive Umstände belegen, dass der Steuerpflichtige wusste oder hätte wissen müssen, dass er sich mit dem Erwerb an einem in eine MwSt-Hinterziehung einbezogenen Umsatz beteiligte.

3) Anforderungen an den "guten Glauben" (BFH V R 48/04)
- Unternehmer muss alle Maßnahmen treffen, die vernünftigerweise verlangt werden können, um sicherzustellen, dass seine Umsätze nicht in einen Betrug einbezogen sind.
- Feststellungslast für die Voraussetzungen des Vorsteuerabzugs trägt der den Abzug Begehrende — einschließlich des Nichtwissens vom Tatplan.

4) Praxis-Dokumentation
- Identitätsprüfung des Geschäftspartners (HR-Auszug, USt-IdNr.-Bestätigung qualifiziert nach § 18e UStG, Gewerbeanmeldung).
- Plausibilitätsprüfung bei ungewöhnlichen Preisen, neuen Lieferanten, Bar-/Drittlandzahlungen, häufig wechselnden Vorlieferanten.
- Belegnachweise (z. B. Gelangensbestätigung bei ig. Lieferungen, Ausfuhrnachweis).`,
  },
];

// Hilfsmittel für die Wissensbasis-Suche (analyze.ts)
export function findKnowledgeEntry(text: string): KBEntry | null {
  for (const e of KNOWLEDGE_BASE) if (e.keywords.test(text)) return e;
  return null;
}
