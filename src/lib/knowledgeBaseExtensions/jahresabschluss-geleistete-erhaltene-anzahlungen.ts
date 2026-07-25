import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const jahresabschlussAnzahlungen: KBEntry = {
  id: "jahresabschluss-geleistete-erhaltene-anzahlungen",
  title: "Bilanzierung von geleisteten und erhaltenen Anzahlungen",
  short:
    "Praxisübersicht zu Ansatz, Ausweis und Bewertung geleisteter und erhaltener Anzahlungen sowie zu den Besonderheiten bei EÜR und Umsatzsteuer.",
  category: "Jahresabschluss",
  type: "praxis",
  source:
    "Praxisbeitrag nach §§ 247, 265, 266 und 268 HGB, §§ 4 Abs. 3 und 11 EStG sowie §§ 13, 14, 14a und 15 UStG; unter Berücksichtigung von BFH, Urteil vom 25.10.1994 – VIII R 65/91, und FG Hessen, Urteil vom 26.02.2019 – 4 K 2033/17.",
  keywords:
    "geleistete anzahlung|erhaltene anzahlung|anzahlungen bilanz|anzahlung aktivieren|anzahlung passivieren|anzahlung immaterieller vermögensgegenstand|anzahlung sachanlage|anzahlung finanzanlage|anzahlung vorräte|anzahlungsrechnung|vorsteuer anzahlung|umsatzsteuer anzahlung|sonstige vermögensgegenstände|sonstige verbindlichkeiten|§ 266 hgb|§ 268 abs. 5 hgb|eür anzahlung",
  references: [
    "§ 247 HGB",
    "§ 265 Abs. 5 HGB",
    "§ 266 HGB",
    "§ 268 Abs. 5 Satz 2 HGB",
    "§ 4 Abs. 3 EStG",
    "§ 11 Abs. 2 EStG",
    "§ 13 Abs. 1 Nr. 1 Buchst. a Satz 4 UStG",
    "§§ 14, 14a UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 1 Satz 3 UStG",
    "BFH vom 25.10.1994 – VIII R 65/91",
    "FG Hessen vom 26.02.2019 – 4 K 2033/17",
  ],
  importance: 5,
  body: `Anzahlungen sind Vorleistungen innerhalb eines noch nicht vollständig erfüllten Geschäfts. Für den Jahresabschluss ist entscheidend, ob das Unternehmen die Anzahlung geleistet oder erhalten hat, wofür sie bestimmt ist und ob bereits eine Lieferung oder sonstige Leistung ausgeführt wurde.

1. Geleistete Anzahlungen

Geleistete Anzahlungen sind Vorleistungen im Rahmen eines schwebenden Geschäfts. Der Zahlende erwirbt einen Anspruch auf die vereinbarte Gegenleistung oder gegebenenfalls auf Rückzahlung.

1.1 Ansatz

Der Anspruch aus der geleisteten Anzahlung ist grundsätzlich zu aktivieren. Das gilt auch dann, wenn der später zu erhaltende Gegenstand selbst nicht aktivierungsfähig ist. Der BFH hat dies für Anzahlungen auf nicht aktivierungsfähige Vermögensgegenstände bestätigt. In diesem Fall kommt regelmäßig ein Ausweis unter den sonstigen Vermögensgegenständen in Betracht.

Merke
Die Aktivierung der Anzahlung hängt nicht davon ab, ob der spätere Vermögensgegenstand aktiviert werden darf. Aktiviert wird zunächst der Anspruch auf Gegenleistung oder Rückzahlung.

Eine geleistete Anzahlung kann bereits vor dem endgültigen Vertragsabschluss vorliegen. Fehlen jedoch sowohl ein Vorvertrag als auch ein bindendes Vertragsangebot, dessen Annahme wahrscheinlich ist, wird der Betrag nicht als geleistete Anzahlung, sondern als sonstiger Vermögensgegenstand des Umlaufvermögens ausgewiesen.

1.2 Ausweis nach Verwendungszweck

Das Gliederungsschema des § 266 HGB sieht gesonderte Positionen für geleistete Anzahlungen auf immaterielle Vermögensgegenstände und auf Sachanlagen vor.

Anzahlungen auf Finanzanlagen werden grundsätzlich bei der Bilanzposition ausgewiesen, für die sie geleistet wurden. Bei wesentlichen Beträgen kann das gesetzliche Gliederungsschema nach § 265 Abs. 5 HGB freiwillig um eine eigene Position erweitert werden.

Dient die Anzahlung der Beschaffung von Roh-, Hilfs- und Betriebsstoffen oder Waren, erfolgt der Ausweis als geleistete Anzahlung innerhalb des Vorratsvermögens.

1.3 Abgrenzung zum aktiven Rechnungsabgrenzungsposten

Auch ein aktiver Rechnungsabgrenzungsposten beruht auf einer Vorleistung. Der Unterschied liegt im Zweck der Zahlung:

- Die geleistete Anzahlung bezieht sich auf eine noch ausstehende Lieferung oder Leistung.
- Der aktive Rechnungsabgrenzungsposten betrifft eine zeitraumbezogene Gegenleistung nach dem Abschlussstichtag, etwa eine im Voraus gezahlte Versicherung.

1.4 Umbuchung nach Leistungserbringung

Erst wenn die Lieferung ausgeführt oder die Leistung erbracht wurde, entstehen beim Käufer Anschaffungs- oder Herstellungskosten. Zu diesem Zeitpunkt wird die aktivierte Anzahlung auf das betreffende Wirtschaftsgut oder den Aufwand umgebucht und mit der Verbindlichkeit aus Lieferungen und Leistungen verrechnet.

1.5 Besonderheit bei Einnahmen-Überschussrechnung

Bei Gewinnermittlung nach § 4 Abs. 3 EStG sind geleistete Anzahlungen grundsätzlich im Zeitpunkt der Zahlung Betriebsausgaben.

Eine wichtige Ausnahme gilt für Anzahlungen auf Anlagevermögen. Sie gehören zu den Anschaffungskosten des späteren Anlageguts und wirken sich deshalb erst über die Abschreibung gewinnmindernd aus. Das reine Abflussprinzip des § 11 Abs. 2 EStG wird insoweit durchbrochen.

1.6 Umsatzsteuer bei geleisteten Anzahlungen

Ist der Zahlende zum Vorsteuerabzug berechtigt, wird die Anzahlung grundsätzlich mit dem Nettobetrag aktiviert. Die abziehbare Vorsteuer gehört nicht zu den Anschaffungskosten.

Der Vorsteuerabzug aus einer geleisteten Anzahlung setzt insbesondere voraus:

- eine ordnungsgemäße Anzahlungsrechnung nach §§ 14 und 14a UStG und
- die tatsächliche Zahlung der Anzahlung nach § 15 Abs. 1 Satz 1 Nr. 1 Satz 3 UStG.

Ist der Zahlende nicht zum Vorsteuerabzug berechtigt, wird die Anzahlung mit dem Bruttobetrag aktiviert.

2. Erhaltene Anzahlungen

Erhaltene Anzahlungen begründen bis zur Ausführung der vereinbarten Lieferung oder Leistung grundsätzlich eine Verpflichtung gegenüber dem Kunden. Sie sind deshalb auf der Passivseite der Bilanz auszuweisen.

2.1 Ansatz und Ausweis

Der Ausweis erfolgt grundsätzlich entweder

- unter „erhaltene Anzahlungen auf Bestellungen“ oder
- unter „sonstige Verbindlichkeiten“.

Der Zusatz „auf Bestellungen“ bedeutet nicht, dass zwingend bereits ein zivilrechtlich vollständig wirksamer Vertrag vorliegen muss. Er verdeutlicht vor allem den Zusammenhang mit späteren Umsatzerlösen.

Erhaltene Anzahlungen im Zusammenhang mit Anlagenverkäufen, etwa dem Verkauf eines Grundstücks, werden regelmäßig unter den sonstigen Verbindlichkeiten und nicht unter den erhaltenen Anzahlungen auf Bestellungen ausgewiesen.

Fehlen ein Vorvertrag und ein bindendes Vertragsangebot, mit dessen Annahme ernsthaft zu rechnen ist, erfolgt ebenfalls der Ausweis unter den sonstigen Verbindlichkeiten.

2.2 Offene Absetzung von den Vorräten

Nach § 268 Abs. 5 Satz 2 HGB dürfen erhaltene Anzahlungen auf Bestellungen offen vom Vorratsvermögen abgesetzt werden. Der Ausweis erfolgt mit negativem Vorzeichen.

Dabei sind zwei Grenzen zu beachten:

- Die Bilanzposition Vorräte darf insgesamt nicht negativ werden.
- Die offene Absetzung setzt keinen unmittelbaren Einzelbezug zwischen Anzahlung und bereits hergestelltem oder angeschafftem Vorrat voraus.

Praxistipp
Die offene Absetzung verkürzt die Bilanzsumme. Das kann sich auf die Größenklassenzuordnung nach § 267 HGB und auf Kennzahlen wie die Fremdkapitalquote auswirken.

2.3 Umbuchung bei Leistungserbringung

Sobald die Lieferung oder Leistung ausgeführt und die Forderung aus Lieferungen und Leistungen erfasst wurde, wird die erhaltene Anzahlung mit der Forderung verrechnet.

Ist wegen Leistungsstörungen oder eines drohenden Rückzahlungsanspruchs nicht mehr mit der Erfüllung des ursprünglichen Umsatzgeschäfts zu rechnen, ist die erhaltene Anzahlung in die sonstigen Verbindlichkeiten umzugliedern.

2.4 Besonderheit bei Einnahmen-Überschussrechnung

Bei Gewinnermittlung nach § 4 Abs. 3 EStG sind erhaltene Anzahlungen grundsätzlich bereits im Zeitpunkt des Zuflusses Betriebseinnahmen.

2.5 Umsatzsteuer bei erhaltenen Anzahlungen

Wird das Entgelt oder ein Teilentgelt vor Ausführung der Leistung vereinnahmt, entsteht die Umsatzsteuer grundsätzlich bereits mit Ablauf des Voranmeldungszeitraums der Vereinnahmung. Der Unternehmer muss die Steuer aus der Anzahlung anmelden und in der späteren Schlussrechnung ordnungsgemäß berücksichtigen.

Bei der Passivierung ist daher regelmäßig zwischen Nettobetrag und Umsatzsteuer zu trennen. Die vereinnahmte Umsatzsteuer wird als Steuerverbindlichkeit erfasst; die erhaltene Anzahlung selbst wird netto ausgewiesen.

3. Prüfungsschema für die Praxis

Bei jeder Anzahlung sollten folgende Fragen geprüft werden:

1. Wurde die Anzahlung geleistet oder erhalten?
2. Besteht ein hinreichend konkreter Bezug zu einem künftigen Leistungsaustausch?
3. Welcher Vermögensgegenstand oder Umsatz ist betroffen?
4. Ist der Betrag im Anlagevermögen, Vorratsvermögen, unter sonstigen Vermögensgegenständen oder unter Verbindlichkeiten auszuweisen?
5. Ist eine Abgrenzung zum Rechnungsabgrenzungsposten erforderlich?
6. Ist Vorsteuer abziehbar oder Umsatzsteuer bereits entstanden?
7. Wann erfolgt die Verrechnung mit der späteren Forderung oder Verbindlichkeit?
8. Welche Besonderheiten gelten bei einer Einnahmen-Überschussrechnung?

Merke
Geleistete Anzahlungen sind grundsätzlich Vermögenswerte, erhaltene Anzahlungen grundsätzlich Verpflichtungen. Die spätere Lieferung oder Leistung führt zur Umbuchung und Verrechnung mit dem eigentlichen Anschaffungs-, Aufwands- oder Umsatzvorgang.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === jahresabschlussAnzahlungen.id)) {
  KNOWLEDGE_BASE.push(jahresabschlussAnzahlungen);
}
