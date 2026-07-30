import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf7gEstgInvestitionsabzugsbetragSonderabschreibung: KBEntry = {
  id: "einkommensteuer-paragraf-7g-estg-investitionsabzugsbetrag-sonderabschreibung",
  title: "§ 7g EStG: Investitionsabzugsbetrag und Sonderabschreibung",
  short:
    "Kleine und mittlere Betriebe können für geplante Investitionen bis zu 50 % der voraussichtlichen Anschaffungs- oder Herstellungskosten vorab gewinnmindernd abziehen. Zusätzlich sind für begünstigte Wirtschaftsgüter Sonderabschreibungen von insgesamt bis zu 40 % möglich.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 7g",
  paragraphNumber: 7,
  source:
    "Zusammenfassung des vom Nutzer bereitgestellten Gesetzestextes zu § 7g EStG; Rechtsstand des bereitgestellten Materials vom 30.07.2026.",
  keywords:
    "§ 7g estg|7g estg|investitionsabzugsbetrag|iab|sonderabschreibung|kleine und mittlere betriebe|gewinn 200000 euro|bewegliche wirtschaftsgüter|anlagevermögen|betriebliche nutzung|investitionsfrist drei jahre|sonderabschreibung 40 prozent|anschaffungskosten herabsetzen|personengesellschaft sonderbetriebsvermögen",
  references: [
    "§ 7g EStG",
    "§ 4 EStG",
    "§ 5 EStG",
    "§ 6 Abs. 2 und 2a EStG",
    "§ 7 Abs. 1 und 2 EStG",
    "§ 150 Abs. 8 AO",
    "§ 233a Abs. 2a AO",
  ],
  importance: 5,
  body: `§ 7g EStG fördert Investitionen kleiner und mittlerer Betriebe durch einen vorgezogenen Betriebsausgabenabzug und zusätzliche Sonderabschreibungen.

1. Investitionsabzugsbetrag

Für die künftige Anschaffung oder Herstellung abnutzbarer beweglicher Wirtschaftsgüter des Anlagevermögens können bis zu 50 % der voraussichtlichen Anschaffungs- oder Herstellungskosten gewinnmindernd abgezogen werden.

Voraussetzungen sind insbesondere:

- Gewinnermittlung nach § 4 oder § 5 EStG,
- Gewinn des Abzugsjahres vor IAB und Hinzurechnungen höchstens 200.000 €,
- elektronische Übermittlung der erforderlichen Beträge,
- spätere Vermietung oder fast ausschließliche betriebliche Nutzung in einer inländischen Betriebsstätte mindestens bis zum Ende des Folgejahres.

Der Abzug darf einen Verlust erzeugen oder erhöhen. Die Summe der noch offenen Investitionsabzugsbeträge darf je Betrieb innerhalb des Abzugsjahres und der drei Vorjahre 200.000 € nicht überschreiten.

2. Anschaffung oder Herstellung

Im Investitionsjahr kann der zuvor gebildete IAB bis zur Höhe von 50 % der tatsächlichen Anschaffungs- oder Herstellungskosten gewinnerhöhend hinzugerechnet werden.

Gleichzeitig dürfen die Anschaffungs- oder Herstellungskosten um bis zu 50 %, höchstens jedoch um den Hinzurechnungsbetrag, gewinnmindernd herabgesetzt werden. Dadurch vermindert sich auch die Bemessungsgrundlage für AfA und weitere Abschreibungen.

3. Investitionsfrist und Rückgängigmachung

Wird der IAB nicht bis zum Ende des dritten auf das Abzugsjahr folgenden Wirtschaftsjahres hinzugerechnet, ist er im ursprünglichen Abzugsjahr rückgängig zu machen. Eine freiwillige vorzeitige Rückgängigmachung ist zulässig.

Auch bestandskräftige Steuer- oder Feststellungsbescheide können insoweit geändert werden. § 233a Abs. 2a AO ist nicht anzuwenden.

4. Nutzungsvoraussetzungen

Wird das Wirtschaftsgut nicht bis zum Ende des auf die Anschaffung oder Herstellung folgenden Wirtschaftsjahres vermietet oder fast ausschließlich betrieblich in einer inländischen Betriebsstätte genutzt, sind Hinzurechnung, Herabsetzung der Anschaffungs- oder Herstellungskosten und die verringerte AfA-Bemessungsgrundlage rückgängig zu machen.

5. Sonderabschreibung

Für begünstigte bewegliche Wirtschaftsgüter können im Jahr der Anschaffung oder Herstellung und in den vier folgenden Jahren neben der regulären AfA Sonderabschreibungen von insgesamt bis zu 40 % der Anschaffungs- oder Herstellungskosten beansprucht werden.

Voraussetzungen:

- Die Gewinngrenze von 200.000 € wurde im Vorjahr nicht überschritten.
- Das Wirtschaftsgut wird im Anschaffungs- oder Herstellungsjahr und im Folgejahr vermietet oder fast ausschließlich betrieblich genutzt.

6. Personengesellschaften

Bei Personengesellschaften und Gemeinschaften tritt die Gesellschaft oder Gemeinschaft an die Stelle des Steuerpflichtigen.

Ein im Gesamthandsbereich gebildeter IAB kann nur für Investitionen der Gesellschaft verwendet werden. Ein im Sonderbetriebsvermögen gebildeter IAB darf nur mit einer Investition desselben Mitunternehmers oder seines Rechtsnachfolgers im Sonderbetriebsvermögen verrechnet werden.

Merksatz:

Bis zu 50 % IAB vor der Investition, Investition grundsätzlich innerhalb von drei Jahren und zusätzlich bis zu 40 % Sonderabschreibung über fünf Jahre. Entscheidend sind die Gewinngrenze von 200.000 € und die nahezu ausschließliche betriebliche Nutzung.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf7gEstgInvestitionsabzugsbetragSonderabschreibung.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf7gEstgInvestitionsabzugsbetragSonderabschreibung);
}
