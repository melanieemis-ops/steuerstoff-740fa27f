import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf7bEstgSonderabschreibungMietwohnungsneubau: KBEntry = {
  id: "einkommensteuer-paragraf-7b-estg-sonderabschreibung-mietwohnungsneubau",
  title: "§ 7b EStG: Sonderabschreibung für Mietwohnungsneubau",
  short:
    "Für neue Mietwohnungen können im Jahr der Anschaffung oder Herstellung und in den folgenden drei Jahren bis zu 5 % Sonderabschreibung jährlich neben der regulären Gebäude-AfA beansprucht werden. Voraussetzung sind insbesondere ein begünstigter Bauzeitraum, die Baukostenobergrenze und eine zehnjährige entgeltliche Wohnraumvermietung.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 7b",
  paragraphNumber: 7,
  source:
    "Zusammenfassung des vom Nutzer bereitgestellten Gesetzestextes zu § 7b EStG; Rechtsstand des bereitgestellten Materials vom 30.07.2026.",
  keywords:
    "§ 7b estg|7b estg|sonderabschreibung mietwohnungsneubau|mietwohnungsneubau|neue wohnung|effizienzhaus 40|eh40 qng|qualitätssiegel nachhaltiges gebäude|baukostenobergrenze|5200 euro je quadratmeter|4000 euro je quadratmeter|zehnjährige vermietung|10 jahre vermietung|de minimis|verordnung eu 2023 2831",
  references: [
    "§ 7b EStG",
    "§ 7 Abs. 4 EStG",
    "§ 7 Abs. 5a EStG",
    "§ 181 Abs. 9 BewG",
    "§ 233a Abs. 2a AO",
    "Verordnung (EU) 2023/2831",
  ],
  importance: 5,
  body: `§ 7b EStG fördert die Anschaffung oder Herstellung neuer Mietwohnungen durch eine zusätzliche Sonderabschreibung.

1. Höhe und Zeitraum

Im Jahr der Anschaffung oder Herstellung und in den folgenden drei Jahren können jährlich bis zu 5 % der begünstigten Bemessungsgrundlage neben der regulären Gebäude-AfA nach § 7 Abs. 4 oder 5a EStG abgezogen werden.

Bei einer Anschaffung gilt die Wohnung nur dann als neu, wenn sie bis zum Ende des Jahres der Fertigstellung angeschafft wird. Die Sonderabschreibung steht dann ausschließlich dem Anschaffenden zu.

2. Begünstigte Wohnungen

Die Wohnung muss durch Baumaßnahmen neu geschaffen werden und die Voraussetzungen des § 181 Abs. 9 BewG erfüllen. Begünstigt sind auch die zur Wohnung gehörenden Nebenräume.

Begünstigte Bauanträge oder Bauanzeigen müssen:

- nach dem 31.08.2018 und vor dem 01.01.2022 oder
- nach dem 31.12.2022 und vor dem 01.10.2029

gestellt beziehungsweise vorgenommen worden sein.

Für die aktuelle Förderperiode ab 2023 muss die Wohnung außerdem in einem Gebäude liegen, das den Standard Effizienzhaus 40 mit Nachhaltigkeits-Klasse erfüllt. Der Nachweis erfolgt durch das Qualitätssiegel Nachhaltiges Gebäude.

3. Baukostenobergrenze

Die Anschaffungs- oder Herstellungskosten dürfen je Quadratmeter Wohnfläche nicht übersteigen:

- 3.000 € bei Bauantrag oder Bauanzeige vom 01.09.2018 bis 31.12.2021,
- 5.200 € bei Bauantrag oder Bauanzeige vom 01.01.2023 bis 30.09.2029.

Wird die jeweilige Obergrenze überschritten, entfällt die Begünstigung insgesamt.

4. Bemessungsgrundlage

Die Sonderabschreibung wird höchstens aus folgenden Kosten je Quadratmeter Wohnfläche berechnet:

- 2.000 € für die frühere Förderperiode,
- 4.000 € für die aktuelle Förderperiode.

5. Zehnjährige Vermietungsbindung

Die Wohnung muss im Jahr der Anschaffung oder Herstellung und in den folgenden neun Jahren entgeltlich zu Wohnzwecken überlassen werden. Eine Nutzung zur nur vorübergehenden Beherbergung, etwa als Ferienwohnung oder vergleichbare Kurzzeitunterkunft, ist nicht begünstigt.

6. Rückgängigmachung

Bereits berücksichtigte Sonderabschreibungen sind rückgängig zu machen, wenn:

- die zehnjährige entgeltliche Wohnraumvermietung nicht eingehalten wird,
- die Wohnung oder das Gebäude innerhalb dieses Zeitraums veräußert wird und der Veräußerungsgewinn nicht der Einkommen- oder Körperschaftsteuer unterliegt oder
- die Baukostenobergrenze innerhalb der ersten drei Jahre nach Ablauf des Anschaffungs- oder Herstellungsjahres durch nachträgliche Kosten überschritten wird.

Die betroffenen Steuer- oder Feststellungsbescheide dürfen auch nach Eintritt der Bestandskraft geändert werden. Für die Festsetzungsfrist gelten besondere Anlaufregelungen; § 233a Abs. 2a AO ist insoweit nicht anzuwenden.

7. EU-Beihilferecht

Die Sonderabschreibung wird grundsätzlich nur gewährt, soweit die Voraussetzungen der Verordnung (EU) 2023/2831 eingehalten und nachgewiesen werden.

Für Wohnungen der aktuellen Förderperiode gilt diese Einschränkung nur bei Anspruchsberechtigten mit Einkünften aus Land- und Forstwirtschaft, Gewerbebetrieb oder selbständiger Arbeit.

Merksatz:

§ 7b EStG ermöglicht vier Jahre lang bis zu 5 % Sonderabschreibung pro Jahr. Entscheidend sind eine tatsächlich neue Wohnung, der richtige Bauantragszeitraum, bei aktuellen Projekten EH40 mit Nachhaltigkeits-Klasse, die Baukostenobergrenze und die zehnjährige entgeltliche Vermietung zu Wohnzwecken.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf7bEstgSonderabschreibungMietwohnungsneubau.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf7bEstgSonderabschreibungMietwohnungsneubau);
}
