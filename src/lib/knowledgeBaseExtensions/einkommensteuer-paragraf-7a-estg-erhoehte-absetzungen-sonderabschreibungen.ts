import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf7aEstgErhoehteAbsetzungenSonderabschreibungen: KBEntry = {
  id: "einkommensteuer-paragraf-7a-estg-erhoehte-absetzungen-sonderabschreibungen",
  title: "§ 7a EStG: Gemeinsame Regeln für erhöhte Absetzungen und Sonderabschreibungen",
  short:
    "§ 7a EStG enthält gemeinsame Vorgaben für erhöhte Absetzungen und Sonderabschreibungen, insbesondere zu nachträglichen Kosten, Anzahlungen, Mindest-AfA, Kumulationsverbot, Beteiligtenfällen, Aufzeichnungen und der AfA nach Ablauf des Begünstigungszeitraums.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 7a",
  paragraphNumber: 7,
  source:
    "Zusammenfassung des vom Nutzer bereitgestellten Gesetzestextes zu § 7a EStG; Rechtsstand des bereitgestellten Materials vom 30.07.2026.",
  keywords:
    "§ 7a estg|7a estg|erhoehte absetzungen|erhöhte absetzungen|sonderabschreibungen|beguenstigungszeitraum|begünstigungszeitraum|nachtraegliche herstellungskosten|nachträgliche herstellungskosten|nachtraegliche anschaffungskosten|anzahlungen|teilherstellungskosten|mindest afa|kumulationsverbot|besondere verzeichnis|restwert|restnutzungsdauer",
  references: ["§ 7a EStG", "§ 7 Abs. 1 EStG", "§ 7 Abs. 4 EStG", "§ 7 Abs. 5a EStG", "§ 7 Abs. 5b EStG", "§ 141 Abs. 1 Nr. 4 und 5 AO"],
  importance: 5,
  body: `§ 7a EStG bündelt die gemeinsamen Regeln für erhöhte Absetzungen und Sonderabschreibungen.

1. Nachträgliche Kostenänderungen

Nachträgliche Herstellungs- oder Anschaffungskosten erhöhen ab dem Jahr ihrer Entstehung bis zum Ende des Begünstigungszeitraums die Bemessungsgrundlage. Nachträgliche Minderungen der Anschaffungs- oder Herstellungskosten wirken entsprechend ab dem Jahr der Minderung.

2. Anzahlungen und Teilherstellungskosten

Soweit eine Begünstigung bereits für Anzahlungen oder Teilherstellungskosten zulässig ist, treten diese an die Stelle der Anschaffungs- oder Herstellungskosten. Nach Fertigstellung oder Anschaffung ist die Begünstigung nur noch möglich, soweit sie nicht bereits vorher genutzt wurde. Anzahlungen gelten grundsätzlich erst mit tatsächlicher Zahlung als aufgewendet.

3. Laufende AfA

Bei erhöhten Absetzungen muss in jedem Jahr des Begünstigungszeitraums mindestens die reguläre AfA nach § 7 Abs. 1 oder 4 EStG berücksichtigt werden. Bei Sonderabschreibungen ist die reguläre AfA zusätzlich vorzunehmen.

4. Keine Mehrfachbegünstigung

Sind mehrere Vorschriften für erhöhte Absetzungen oder Sonderabschreibungen anwendbar, darf für dasselbe Wirtschaftsgut nur eine Begünstigungsvorschrift genutzt werden.

5. Buchführungsgrenzen

Erhöhte Absetzungen und Sonderabschreibungen bleiben bei der Prüfung der Buchführungsgrenzen nach § 141 Abs. 1 Nr. 4 und 5 AO außer Ansatz.

6. Mehrere Beteiligte

Sind die Voraussetzungen nur bei einzelnen Beteiligten erfüllt, dürfen erhöhte Absetzungen oder Sonderabschreibungen nur anteilig für diese Personen vorgenommen werden. Die begünstigten Beteiligten müssen die Wahl einheitlich ausüben.

7. Aufzeichnungspflicht im Betriebsvermögen

Bei Wirtschaftsgütern des Betriebsvermögens ist grundsätzlich ein besonderes laufendes Verzeichnis zu führen. Es muss insbesondere Anschaffungs- oder Herstellungstag, Kosten, Nutzungsdauer sowie jährliche AfA und Sonderabschreibungen enthalten. Ein gesondertes Verzeichnis ist entbehrlich, wenn alle Angaben bereits aus der Buchführung hervorgehen.

8. AfA nach dem Begünstigungszeitraum

Nach Ablauf des Begünstigungszeitraums richtet sich die weitere AfA grundsätzlich nach dem verbleibenden Restwert. Bei Gebäuden und bestimmten Wirtschaftsgütern gelten die gesetzlichen Prozentsätze unter Berücksichtigung der Restnutzungsdauer; bei anderen Wirtschaftsgütern werden Restwert und Restnutzungsdauer zugrunde gelegt.

Merksatz:

§ 7a EStG regelt nicht die einzelne Begünstigung selbst, sondern wie erhöhte Absetzungen und Sonderabschreibungen technisch durchgeführt, begrenzt, dokumentiert und nach dem Förderzeitraum fortgeführt werden.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf7aEstgErhoehteAbsetzungenSonderabschreibungen.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf7aEstgErhoehteAbsetzungenSonderabschreibungen);
}
