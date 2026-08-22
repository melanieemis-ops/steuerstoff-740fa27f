import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const erbschaftsteuerMiterbenSteuererklaerungMitwirkung: KBEntry = {
  id: "erbschaftsteuer-miterben-steuererklaerung-mitwirkung",
  title: "Erbschaftsteuererklärung bei mehreren Erben – verweigerte Mitwirkung eines Miterben",
  short:
    "Verweigert ein Miterbe die Unterschrift unter eine gemeinsame Erbschaftsteuererklärung, kann der andere Miterbe seine eigene Erklärungspflicht durch eine Einzelsteuererklärung erfüllen.",
  category: "Erbschaftsteuer",
  type: "praxis",
  law: "ErbStG",
  paragraph: "§ 31",
  source:
    "Kompakte fachliche Zusammenfassung zu § 31 ErbStG; Gesetzeswortlaut amtliche Fassung, Rechtsstand August 2026.",
  keywords:
    "§ 31 ErbStG|§ 31 Abs. 1 ErbStG|§ 31 Abs. 4 ErbStG|Erbschaftsteuererklärung Miterben|gemeinsame Erbschaftsteuererklärung|Einzelsteuererklärung Erbschaftsteuer|Miterbe verweigert Unterschrift|Miterbe verweigert Mitwirkung|Erbengemeinschaft Steuererklärung|Unterschrift Erbschaftsteuererklärung|mehrere Erben Steuererklärung",
  references: [
    "§ 31 Abs. 1 ErbStG",
    "§ 31 Abs. 2 ErbStG",
    "§ 31 Abs. 4 ErbStG",
    "§ 2038 Abs. 1 Satz 2 BGB",
  ],
  importance: 5,
  body: `Sind mehrere Erben vorhanden, dürfen sie die Erbschaftsteuererklärung nach § 31 Abs. 4 ErbStG gemeinsam abgeben. Die gemeinsame Abgabe ist ein Recht, keine Pflicht. Wird dieser Weg gewählt, muss die gemeinsame Erklärung von allen beteiligten Erben unterschrieben werden.

Verweigert ein Miterbe seine Mitwirkung oder Unterschrift, kann deshalb keine wirksame gemeinsame Erklärung für die gesamte Erbengemeinschaft durch nur einen Miterben abgegeben werden.

Einzelsteuererklärung als Lösung

Nach § 31 Abs. 1 ErbStG kann das Finanzamt von jedem an einem Erbfall Beteiligten die Abgabe einer Steuererklärung verlangen. Kommt eine gemeinsame Erklärung nach § 31 Abs. 4 ErbStG nicht zustande, kann bzw. muss der betroffene Miterbe seine eigene Erklärungspflicht durch eine Einzelsteuererklärung für seinen Erwerb erfüllen.

Die Einzelsteuererklärung ist insbesondere sinnvoll, um die eigene Abgabepflicht fristgerecht zu erfüllen und Fristversäumnisse nicht von der Mitwirkung eines anderen Miterben abhängig zu machen.

Inhalt der Erklärung

Die Erklärung muss nach § 31 Abs. 2 ErbStG ein Verzeichnis der zum Nachlass gehörenden Gegenstände sowie die sonstigen Angaben enthalten, die für die Feststellung des Gegenstands und des Werts des Erwerbs erforderlich sind.

Zivilrechtliche Mitwirkung

Unabhängig von der steuerlichen Einzelabgabe kann im Einzelfall ein zivilrechtlicher Anspruch auf Mitwirkung des anderen Miterben in Betracht kommen, insbesondere nach § 2038 Abs. 1 Satz 2 BGB bei Maßnahmen ordnungsmäßiger Nachlassverwaltung. Für die fristgerechte Erfüllung der eigenen steuerlichen Erklärungspflicht sollte ein solches Verfahren jedoch nicht abgewartet werden.

Praxisfall

Zwei Geschwister sind Miterben. Das Finanzamt fordert eine Erbschaftsteuererklärung an. Ein Geschwisterteil weigert sich, die gemeinsame Erklärung zu unterschreiben. Der andere Miterbe sollte nicht bis zur Einigung warten, sondern für seinen eigenen Erwerb eine Einzelsteuererklärung einreichen und das Finanzamt gegebenenfalls auf die verweigerte Mitwirkung hinweisen.

Merksatz:
Gemeinsame Erklärung nur mit allen Unterschriften. Verweigert ein Miterbe die Mitwirkung, erfüllt der andere Miterbe seine eigene steuerliche Pflicht durch eine Einzelsteuererklärung nach § 31 Abs. 1 ErbStG.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === erbschaftsteuerMiterbenSteuererklaerungMitwirkung.id)) {
  KNOWLEDGE_BASE.push(erbschaftsteuerMiterbenSteuererklaerungMitwirkung);
}
