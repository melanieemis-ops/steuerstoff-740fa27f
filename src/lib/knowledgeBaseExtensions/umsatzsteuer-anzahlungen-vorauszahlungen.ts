import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const umsatzsteuerAnzahlungenVorauszahlungen: KBEntry = {
  id: "umsatzsteuer-anzahlungen-vorauszahlungen",
  title: "Umsatzsteuer – Anzahlungen und Vorauszahlungen",
  short:
    "Vorsteuerabzug aus geleisteten Anzahlungen, Steuerentstehung bei erhaltenen Anzahlungen und Anforderungen an Anzahlungsrechnungen.",
  category: "Umsatzsteuer",
  type: "praxis",
  taxType: "Umsatzsteuer",
  subCase: "anzahlungen-vorauszahlungen",
  source:
    "Praxisübersicht nach §§ 13, 14, 14a und 15 UStG sowie Abschnitt 14.8 UStAE; ergänzend handelsrechtliche Schnittstellen nach §§ 266 und 268 HGB.",
  keywords:
    "anzahlung|anzahlungsrechnung|vorauszahlung|vorschuss|abschlagszahlung|vorsteuer anzahlung|erhaltene anzahlung|geleistete anzahlung|§ 13 ustg|§ 14 abs. 5 ustg|§ 15 abs. 1 satz 1 nr. 1 satz 3 ustg|a 14.8 ustae",
  references: [
    "§ 13 Abs. 1 Nr. 1 Buchst. a Satz 4 UStG",
    "§ 14 Abs. 1 bis 5 UStG",
    "§ 14a UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 1 Satz 3 UStG",
    "Abschnitt 14.8 UStAE",
  ],
  importance: 5,
  body: `Anzahlungen und Vorauszahlungen werden umsatzsteuerlich bereits vor Ausführung der späteren Lieferung oder sonstigen Leistung relevant. Für den Leistenden kann Umsatzsteuer entstehen; der Leistungsempfänger kann unter bestimmten Voraussetzungen bereits Vorsteuer abziehen.

1. Geleistete Anzahlungen und Vorsteuerabzug

Ist der Zahlende zum Vorsteuerabzug berechtigt, wird die geleistete Anzahlung bilanziell grundsätzlich mit dem Nettobetrag erfasst. Die abziehbare Vorsteuer gehört nicht zu den Anschaffungs- oder Herstellungskosten.

Der Vorsteuerabzug aus einer geleisteten Anzahlung setzt kumulativ voraus:
- eine ordnungsgemäße Rechnung über die Anzahlung nach §§ 14 und 14a UStG und
- die tatsächliche Zahlung des in Rechnung gestellten Entgelts.

Rechtsgrundlage ist § 15 Abs. 1 Satz 1 Nr. 1 Satz 3 UStG. Allein der Erhalt einer Anzahlungsrechnung genügt daher noch nicht. Ebenso reicht eine Zahlung ohne ordnungsgemäße Rechnung grundsätzlich nicht aus.

Merke: Bei Anzahlungen entsteht das Recht auf Vorsteuerabzug erst, wenn sowohl die Rechnung vorliegt als auch die Zahlung geleistet wurde.

Ist der Zahlende nicht zum Vorsteuerabzug berechtigt, wird die geleistete Anzahlung grundsätzlich mit dem Bruttobetrag angesetzt.

2. Erhaltene Anzahlungen und Steuerentstehung

Vereinnahmt ein Unternehmer das Entgelt oder einen Teil des Entgelts, bevor die Lieferung oder sonstige Leistung ausgeführt wurde, entsteht die Umsatzsteuer mit Ablauf des Voranmeldungszeitraums, in dem das Entgelt vereinnahmt wurde. Maßgeblich ist § 13 Abs. 1 Nr. 1 Buchst. a Satz 4 UStG.

Entscheidend ist damit grundsätzlich der Zahlungseingang und nicht erst die spätere Leistungsausführung.

Beispiel: Ein Unternehmer erhält im März eine Anzahlung für eine im Juni auszuführende steuerpflichtige Leistung. Die Umsatzsteuer auf die Anzahlung entsteht bereits mit Ablauf des Voranmeldungszeitraums März.

3. Steuerfreie oder nicht steuerbare Leistungen

Wird die Anzahlung für eine Leistung vereinnahmt, die voraussichtlich steuerfrei nach § 4 UStG oder nicht steuerbar ist, entsteht insoweit keine Umsatzsteuer.

Das gilt beispielsweise bei einer ordnungsgemäß steuerfreien innergemeinschaftlichen Lieferung, sofern die gesetzlichen Voraussetzungen tatsächlich erfüllt werden. Ändert sich die umsatzsteuerliche Beurteilung später, ist die Behandlung der Anzahlung entsprechend zu korrigieren.

4. Anforderungen an Anzahlungsrechnungen

Für Rechnungen über Entgelte, die vor Ausführung der Leistung vereinnahmt werden, gelten die Rechnungspflichten des § 14 Abs. 1 bis 4 UStG nach § 14 Abs. 5 UStG sinngemäß.

Aus der Rechnung muss eindeutig hervorgehen, dass über eine Vorauszahlung oder Anzahlung abgerechnet wird. Nach Abschnitt 14.8 Abs. 1 Satz 1 UStAE kann dies insbesondere durch die Angabe des voraussichtlichen Zeitpunkts oder Zeitraums der späteren Leistung kenntlich gemacht werden.

Eine ordnungsgemäße Anzahlungsrechnung sollte insbesondere enthalten:
- vollständigen Namen und Anschrift von Leistendem und Leistungsempfänger,
- Steuernummer oder Umsatzsteuer-Identifikationsnummer,
- Ausstellungsdatum,
- fortlaufende Rechnungsnummer,
- eindeutige Bezeichnung der noch auszuführenden Leistung,
- Hinweis auf die Voraus- oder Anzahlung,
- voraussichtlichen Leistungszeitpunkt oder Leistungszeitraum,
- Nettoentgelt, Steuersatz und Umsatzsteuerbetrag sowie
- gegebenenfalls einen Hinweis auf eine Steuerbefreiung.

5. Schlussrechnung

Nach Ausführung der Leistung ist in der Schlussrechnung das gesamte Entgelt abzurechnen. Bereits vereinnahmte und versteuerte Anzahlungen sowie die darauf entfallende Umsatzsteuer müssen offen abgesetzt werden, damit es nicht zu einer doppelten Besteuerung kommt.

Praxistipp: Anzahlungsrechnungen, Zahlungseingänge und Schlussrechnungen sollten eindeutig miteinander verknüpft werden. Das erleichtert die Abstimmung der Umsatzsteuerkonten und verhindert doppelte Steuererfassung.

6. Bilanzielle Schnittstellen

Erhaltene Anzahlungen werden handelsrechtlich regelmäßig unter „erhaltene Anzahlungen auf Bestellungen“ oder – etwa bei Anlagenverkäufen und in Rückforderungsfällen – unter „sonstige Verbindlichkeiten“ ausgewiesen.

Die Umsatzsteuer auf erhaltene Anzahlungen ist erfolgsneutral zu behandeln und bis zu ihrer Abführung gesondert unter den sonstigen Verbindlichkeiten auszuweisen.

Bei erhaltenen Anzahlungen auf Vorräte besteht nach § 268 Abs. 5 Satz 2 HGB ein Ausweiswahlrecht zur offenen Absetzung vom Vorratsvermögen. Die Bilanzposition Vorräte darf dadurch insgesamt nicht negativ werden.

7. EÜR

Bei einer Einnahmen-Überschussrechnung stellen erhaltene Anzahlungen grundsätzlich bereits im Zeitpunkt des Zuflusses Betriebseinnahmen dar. Die umsatzsteuerliche Steuerentstehung richtet sich unabhängig davon nach den Vorschriften des UStG.

8. Prüfungsschema

Bei Anzahlungen sollten nacheinander folgende Fragen geprüft werden:
1. Liegt eine Zahlung vor Ausführung der Leistung vor?
2. Ist die spätere Leistung steuerbar und steuerpflichtig?
3. Wann wurde die Zahlung geleistet oder vereinnahmt?
4. Liegt eine ordnungsgemäße Anzahlungsrechnung vor?
5. Ist der Leistungsempfänger zum Vorsteuerabzug berechtigt?
6. Wurde die Anzahlung in der Schlussrechnung korrekt abgesetzt?
7. Ist eine spätere Änderung oder Rückzahlung zu berichtigen?

Merke: Bei geleisteten Anzahlungen benötigt der Leistungsempfänger Rechnung und Zahlung für den Vorsteuerabzug. Bei erhaltenen Anzahlungen entsteht die Umsatzsteuer grundsätzlich bereits mit der Vereinnahmung.`
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === umsatzsteuerAnzahlungenVorauszahlungen.id)) {
  KNOWLEDGE_BASE.push(umsatzsteuerAnzahlungenVorauszahlungen);
}
