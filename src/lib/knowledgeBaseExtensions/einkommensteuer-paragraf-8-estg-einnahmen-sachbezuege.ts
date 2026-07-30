import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf8EstgEinnahmenSachbezuege: KBEntry = {
  id: "einkommensteuer-paragraf-8-estg-einnahmen-sachbezuege",
  title: "§ 8 EStG: Einnahmen, Sachbezüge und Zusatzleistungen",
  short:
    "§ 8 EStG regelt, was als Einnahme gilt und wie Geldleistungen, Sachbezüge, Dienstwagen, Mahlzeiten, Gutscheine, Personalrabatte und zusätzlich zum Arbeitslohn gewährte Leistungen zu bewerten sind.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 8",
  paragraphNumber: 8,
  source:
    "Zusammenfassung des vom Nutzer bereitgestellten Gesetzestextes zu § 8 EStG; Rechtsstand des bereitgestellten Materials vom 30.07.2026.",
  keywords:
    "§ 8 estg|8 estg|einnahmen|geldwerter vorteil|sachbezug|sachbezuege|gutschein|geldkarte|50 euro freigrenze|dienstwagen|firmenwagen|1 prozent regelung|fahrtenbuch|mahlzeit|sachbezugswert|personalrabatt|rabattfreibetrag 1080 euro|zusätzlich zum ohnehin geschuldeten arbeitslohn|zusatzleistung|wohnung arbeitgeber|ortsüblicher mietwert",
  references: [
    "§ 8 EStG",
    "§ 2 Abs. 1 Satz 1 Nr. 4 bis 7 EStG",
    "§ 6 Abs. 1 Nr. 4 EStG",
    "§ 9 Abs. 1 Satz 3 Nr. 4a und Nr. 5 EStG",
    "§ 9 Abs. 4a EStG",
    "§ 40 EStG",
    "§ 2 Abs. 1 Nr. 10 ZAG",
    "§ 17 Abs. 1 Satz 1 Nr. 4 SGB IV",
  ],
  importance: 5,
  body: `§ 8 EStG bestimmt, welche Vorteile als steuerpflichtige Einnahmen gelten und wie sie bewertet werden.

1. Einnahmen in Geld

Einnahmen sind alle Güter in Geld oder Geldeswert, die im Rahmen der Überschusseinkünfte zufließen. Dazu zählen auch zweckgebundene Geldleistungen, Kostenerstattungen, Geldsurrogate und andere auf einen Geldbetrag lautende Vorteile.

Gutscheine und Geldkarten gelten ausnahmsweise als Sachbezug, wenn sie ausschließlich zum Bezug von Waren oder Dienstleistungen berechtigen und die gesetzlichen Vorgaben des Zahlungsdiensteaufsichtsgesetzes erfüllen.

2. Bewertung von Sachbezügen

Nicht in Geld bestehende Einnahmen, etwa Wohnung, Kost, Waren oder Dienstleistungen, werden grundsätzlich mit dem üblichen Endpreis am Abgabeort abzüglich üblicher Preisnachlässe bewertet.

3. Betrieblicher Pkw

Für die private Nutzung eines betrieblichen Kraftfahrzeugs gelten die Bewertungsregeln des § 6 Abs. 1 Nr. 4 EStG. Neben der Privatnutzung sind gegebenenfalls Zuschläge für Fahrten zwischen Wohnung und erster Tätigkeitsstätte sowie für Familienheimfahrten bei doppelter Haushaltsführung anzusetzen.

Alternativ ist die Fahrtenbuchmethode möglich, wenn die gesamten Fahrzeugkosten durch Belege und die Nutzungsanteile durch ein ordnungsgemäßes Fahrtenbuch nachgewiesen werden.

4. Mahlzeiten und amtliche Sachbezugswerte

Für bestimmte Sachbezüge gelten die amtlichen Werte der Sozialversicherungsentgeltverordnung. Eine vom Arbeitgeber während einer Auswärtstätigkeit oder doppelten Haushaltsführung gestellte Mahlzeit bis 60 € wird grundsätzlich mit dem amtlichen Sachbezugswert bewertet.

Der Ansatz unterbleibt, wenn beim Arbeitnehmer für diesen Tag ein Werbungskostenabzug wegen Verpflegungsmehraufwendungen in Betracht kommt.

5. Monatliche 50-€-Freigrenze

Sachbezüge bleiben steuerfrei, wenn der nach Abzug eines Arbeitnehmerentgelts verbleibende Vorteil insgesamt 50 € im Kalendermonat nicht übersteigt. Es handelt sich um eine Freigrenze: Wird sie überschritten, ist grundsätzlich der gesamte Vorteil steuerpflichtig.

Gutscheine und Geldkarten profitieren hiervon nur, wenn sie zusätzlich zum ohnehin geschuldeten Arbeitslohn gewährt werden.

6. Arbeitgeberwohnung

Für eine zu eigenen Wohnzwecken überlassene Wohnung wird kein Sachbezug angesetzt, soweit der Arbeitnehmer mindestens zwei Drittel der ortsüblichen Miete zahlt und der ortsübliche Mietwert höchstens 25 € je Quadratmeter ohne umlagefähige Betriebskosten beträgt.

7. Personalrabatte

Erhält ein Arbeitnehmer Waren oder Dienstleistungen, die der Arbeitgeber überwiegend für fremde Kunden anbietet, wird der Endpreis grundsätzlich um 4 % gemindert. Nach Abzug des vom Arbeitnehmer gezahlten Entgelts bleibt ein jährlicher Rabattfreibetrag von 1.080 € steuerfrei, sofern keine Pauschalversteuerung nach § 40 EStG erfolgt.

8. Zusätzlich zum ohnehin geschuldeten Arbeitslohn

Eine Leistung gilt nur dann als zusätzlich erbracht, wenn sie nicht auf den Arbeitslohn angerechnet wird, der Arbeitslohn nicht zugunsten der Leistung herabgesetzt wird, sie keine bereits vereinbarte Lohnerhöhung ersetzt und der Arbeitslohn bei Wegfall der Leistung nicht steigt.

Diese Voraussetzungen können auch erfüllt sein, wenn der Arbeitnehmer auf die Zusatzleistung einen arbeitsvertraglichen, tariflichen oder gesetzlichen Anspruch hat.

Merksatz:

§ 8 EStG unterscheidet Geldleistungen und Sachbezüge. Besonders praxisrelevant sind die 50-€-Sachbezugsfreigrenze, die Dienstwagenbewertung, amtliche Sachbezugswerte, der Rabattfreibetrag von 1.080 € und die strengen Voraussetzungen für zusätzlich gewährte Arbeitgeberleistungen.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf8EstgEinnahmenSachbezuege.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf8EstgEinnahmenSachbezuege);
}
