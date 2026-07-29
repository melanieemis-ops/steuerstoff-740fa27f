import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf3cEstgAnteiligeAbzuege: KBEntry = {
  id: "einkommensteuer-paragraf-3c-estg-anteilige-abzuege",
  title: "§ 3c Abs. 1 EStG: Abzugsverbot bei steuerfreien Einnahmen",
  short:
    "§ 3c Abs. 1 EStG untersagt den Abzug von Ausgaben als Betriebsausgaben oder Werbungskosten, soweit diese in unmittelbarem wirtschaftlichem Zusammenhang mit steuerfreien Einnahmen stehen.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 3c",
  paragraphNumber: 3,
  source:
    "Zusammenfassung des vom Nutzer bereitgestellten Gesetzestextes zu § 3c Abs. 1 EStG; Rechtsstand des bereitgestellten Materials vom 30.07.2026.",
  keywords:
    "§ 3c estg|3c estg|anteilige abzuege|anteilige abzüge|abzugsverbot|steuerfreie einnahmen|unmittelbarer wirtschaftlicher zusammenhang|betriebsausgaben|werbungskosten|ausgabenabzug|korrespondierendes abzugsverbot",
  references: ["§ 3c Abs. 1 EStG", "§ 3c Abs. 2 EStG"],
  importance: 5,
  body: `§ 3c Abs. 1 EStG enthält ein Abzugsverbot für Ausgaben, die mit steuerfreien Einnahmen zusammenhängen.

Ausgaben dürfen nicht als Betriebsausgaben oder Werbungskosten abgezogen werden, soweit sie mit steuerfreien Einnahmen in einem unmittelbaren wirtschaftlichen Zusammenhang stehen. § 3c Abs. 2 EStG bleibt als besondere Regelung unberührt.

1. Zweck der Vorschrift

Die Vorschrift verhindert eine doppelte steuerliche Begünstigung. Eine Einnahme soll nicht steuerfrei bleiben, während die unmittelbar damit zusammenhängenden Aufwendungen gleichzeitig die steuerpflichtigen Einkünfte mindern.

2. Voraussetzungen des Abzugsverbots

Das Abzugsverbot greift, wenn

- steuerfreie Einnahmen vorliegen,
- Ausgaben entstanden sind und
- zwischen den Ausgaben und den steuerfreien Einnahmen ein unmittelbarer wirtschaftlicher Zusammenhang besteht.

Entscheidend ist nicht allein ein allgemeiner sachlicher Zusammenhang. Die Ausgaben müssen konkret durch die steuerfreien Einnahmen veranlasst sein oder unmittelbar ihrer Erzielung dienen.

3. Rechtsfolge

Die betreffenden Ausgaben sind nicht als Betriebsausgaben oder Werbungskosten abziehbar. Das Abzugsverbot gilt nur, soweit der unmittelbare wirtschaftliche Zusammenhang reicht.

Sind Ausgaben sowohl steuerfreien als auch steuerpflichtigen Einnahmen zuzuordnen, ist eine sachgerechte Aufteilung erforderlich. Nur der auf die steuerfreien Einnahmen entfallende Anteil ist vom Abzug ausgeschlossen.

4. Prüfungsschema

1. Liegt eine steuerfreie Einnahme vor?
2. Sind damit zusammenhängende Ausgaben entstanden?
3. Besteht ein unmittelbarer wirtschaftlicher Zusammenhang?
4. Lassen sich die Ausgaben vollständig oder nur anteilig zuordnen?
5. Ist eine speziellere Regelung, insbesondere § 3c Abs. 2 EStG, anzuwenden?

Beispiel:

Entstehen Aufwendungen ausschließlich zur Erzielung einer steuerfreien Einnahme, dürfen diese Aufwendungen nicht als Betriebsausgaben oder Werbungskosten abgezogen werden. Betreffen die Aufwendungen zugleich steuerpflichtige Einnahmen, ist nur der unmittelbar auf die steuerfreie Einnahme entfallende Anteil nicht abziehbar.

Merksatz:

Steuerfreie Einnahmen und die unmittelbar damit verbundenen Ausgaben werden steuerlich grundsätzlich gemeinsam betrachtet: Soweit die Einnahme steuerfrei ist, bleibt auch der zugehörige Aufwand ohne steuermindernde Wirkung.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf3cEstgAnteiligeAbzuege.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf3cEstgAnteiligeAbzuege);
}
