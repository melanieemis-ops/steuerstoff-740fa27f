import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const gmbhUndCoKgGrundlagen: KBEntry = {
  id: "personengesellschaften-gmbh-und-co-kg-grundlagen",
  title: "GmbH & Co. KG: Rechtsform und steuerliche Grundlagen",
  short:
    "Eine GmbH & Co. KG ist eine Kommanditgesellschaft, bei der die persönlich haftende Gesellschafterin eine GmbH ist. Steuerlich bleibt sie grundsätzlich eine Personengesellschaft; die Gewinne werden den Gesellschaftern zugerechnet.",
  category: "Personengesellschaften",
  type: "praxis",
  taxType: "einkommensteuer",
  subCase: "gmbh-und-co-kg-grundlagen",
  source:
    "Eigenständig zusammengefasste Darstellung auf Grundlage von HGB, EStG, GewStG, KStG und AO; Rechtsstand 2026.",
  keywords:
    "gmbh & co kg|gmbh und co kg|gmbh co kg|gmbh & co. kg|gmbh und co. kg|was ist eine gmbh & co kg|was sind gmbh & co kgs|gmbh & co kgs|komplementaer gmbh|komplementär gmbh|kommanditgesellschaft mit gmbh|haftungsbeschraenkte personengesellschaft|haftungsbeschränkte personengesellschaft|besteuerung gmbh & co kg|steuerliche behandlung gmbh & co kg",
  references: [
    "§§ 161 ff. HGB",
    "§§ 15 und 15a EStG",
    "§§ 2, 7 bis 11 GewStG",
    "§ 35 EStG",
    "KStG für die Komplementär-GmbH",
  ],
  importance: 5,
  body: `Eine GmbH & Co. KG ist keine GmbH, sondern eine besondere Form der Kommanditgesellschaft. Persönlich haftende Gesellschafterin ist eine GmbH; die übrigen Gesellschafter sind regelmäßig Kommanditisten.

1. Gesellschaftsrechtliche Einordnung

Die GmbH & Co. KG ist eine Personengesellschaft. Die GmbH übernimmt die Rolle der Komplementärin. Dadurch wird die persönliche Haftung natürlicher Personen typischerweise vermieden oder begrenzt.

2. Steuerliche Einordnung

Steuerlich wird die GmbH & Co. KG grundsätzlich wie eine Personengesellschaft behandelt. Sie ist nicht selbst einkommensteuer- oder körperschaftsteuerpflichtig. Der Gewinn wird gesondert und einheitlich festgestellt und den Gesellschaftern zugerechnet.

3. Besteuerung der Gesellschafter

Natürliche Personen versteuern ihren Gewinnanteil grundsätzlich mit Einkommensteuer. Ist eine Kapitalgesellschaft beteiligt, unterliegt ihr Gewinnanteil grundsätzlich der Körperschaftsteuer. Zusätzlich können Sondervergütungen und Sonderbetriebsvermögen zu berücksichtigen sein.

4. Gewerbesteuer

Die GmbH & Co. KG ist regelmäßig gewerblich geprägt und unterliegt mit ihrem Gewerbeertrag der Gewerbesteuer. Bei natürlichen Personen kann grundsätzlich die Steuerermäßigung nach § 35 EStG relevant sein.

5. Komplementär-GmbH

Die Komplementär-GmbH ist ein eigenes Steuersubjekt. Vergütungen, die sie von der KG erhält, müssen bei beiden Gesellschaften korrekt erfasst werden. Außerdem sind die Jahresabschlüsse der KG und der GmbH getrennt zu erstellen.

6. Typische Praxisthemen

- Gewinnverteilung zwischen GmbH und Kommanditisten,
- Sondervergütungen an Gesellschafter,
- Sonderbetriebsvermögen,
- Verlustverrechnung nach § 15a EStG,
- Gewerbesteuer und § 35 EStG,
- Verträge zwischen KG, GmbH und Gesellschaftern,
- getrennte Buchführung und Abschlüsse,
- Entnahmen und Einlagen.

Merksatz:
Die GmbH & Co. KG verbindet die Haftungsbegrenzung über eine GmbH mit der steuerlichen Transparenz einer Personengesellschaft.

Rechtsstand: 2026.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === gmbhUndCoKgGrundlagen.id)) {
  KNOWLEDGE_BASE.push(gmbhUndCoKgGrundlagen);
}
