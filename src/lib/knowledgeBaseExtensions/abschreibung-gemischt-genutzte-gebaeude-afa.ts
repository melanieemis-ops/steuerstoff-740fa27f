import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const abschreibungGemischtGenutzteGebaeudeAfa: KBEntry = {
  id: "abschreibung-gemischt-genutzte-gebaeude-afa",
  title: "Gemischt genutzte Gebäude: Aufteilung und AfA",
  short:
    "Kompakter Überblick zur Aufteilung gemischt genutzter Gebäude in selbstständige Wirtschaftsgüter, zur AfA-Bemessungsgrundlage, Kaufpreisaufteilung und Nutzungsänderung.",
  category: "Abschreibung",
  type: "praxis",
  taxType: "einkommensteuer",
  subCase: "gemischt-genutzte-gebaeude-afa",
  source:
    "Praxisübersicht zu § 7 EStG, R 4.2 und R 7.1 bis R 7.3 EStR sowie der BFH-Rechtsprechung zu gemischt genutzten Gebäuden.",
  keywords:
    "gemischt genutztes gebäude|gebäudeteil|wirtschaftsgut|nutzungszusammenhang|funktionszusammenhang|gebäude afa|kaufpreisaufteilung|grund und boden|nutzfläche|vermietung|eigennutzung|betriebsvermögen|privatvermögen|nutzungsänderung|bauabschnitt|§ 7 estg",
  references: [
    "§ 7 EStG",
    "§ 7 Abs. 4 EStG",
    "§ 7 Abs. 5a EStG",
    "R 4.2 Abs. 3 bis 6 EStR",
    "R 7.1 Abs. 5 EStR",
    "R 7.3 EStR",
    "H 7.3 EStH",
    "BFH, Urteil vom 04.02.2020 – IX R 1/18",
    "BFH, Urteil vom 12.03.2019 – IX R 2/18",
  ],
  importance: 5,
  body: `Bei gemischt genutzten Gebäuden ist für die steuerliche Behandlung nicht allein das Bauwerk, sondern vor allem der jeweilige Nutzungs- und Funktionszusammenhang entscheidend.

1. Bis zu vier selbstständige Wirtschaftsgüter

Wird ein Gebäude unterschiedlich genutzt, können höchstens vier selbstständige Gebäudeteile entstehen:
- Nutzung für eigene betriebliche Zwecke,
- Nutzung für fremde betriebliche Zwecke,
- Nutzung für fremde Wohnzwecke,
- Nutzung für eigene Wohnzwecke.

Jeder dieser Gebäudeteile ist steuerlich gesondert zu behandeln. Ein häusliches Arbeitszimmer im eigenen Wohnbereich bildet dagegen grundsätzlich kein eigenständiges Wirtschaftsgut. Eigentumswohnungen und Teileigentum sind stets selbstständige Wirtschaftsgüter.

2. Zuordnung von Aufwendungen

Direkt zurechenbare Aufwendungen werden vollständig dem betreffenden Gebäudeteil zugeordnet. Nicht eindeutig zurechenbare Kosten, etwa für Treppenhaus, Dach, Heizung oder Fassade, werden regelmäßig nach dem Verhältnis der Nutzflächen verteilt.

Bei teilweiser Vermietung sind Anschaffungs- oder Herstellungskosten, Erhaltungsaufwendungen, Schuldzinsen und sonstige Werbungskosten nur insoweit abziehbar, wie sie auf den vermieteten Teil entfallen.

3. Eigene AfA je Gebäudeteil

Jeder selbstständige Gebäudeteil besitzt eine eigene AfA-Bemessungsgrundlage. Die Anschaffungs- oder Herstellungskosten des Gesamtgebäudes werden grundsätzlich nach dem Verhältnis der Nutzfläche aufgeteilt. Führt dies zu einem unangemessenen Ergebnis, kann ein anderer sachgerechter Maßstab, etwa der umbaute Raum, erforderlich sein.

Die Restnutzungsdauer des Gebäudes ist grundsätzlich einheitlich. AfA-Methode und AfA-Satz können sich jedoch je nach Nutzung und steuerlicher Zuordnung der einzelnen Gebäudeteile unterscheiden.

4. Kaufpreisaufteilung bei bebauten Grundstücken

Ein Gesamtkaufpreis ist zunächst auf den nicht abnutzbaren Grund und Boden und das abnutzbare Gebäude aufzuteilen. Maßgeblich ist das Verhältnis der Verkehrswerte. Eine vertragliche Aufteilung ist anzuerkennen, wenn sie wirtschaftlich haltbar ist und die realen Wertverhältnisse nicht grundlegend verfehlt.

Die Restwertmethode, bei der nur der Bodenwert bestimmt und der verbleibende Kaufpreis vollständig dem Gebäude zugerechnet wird, ist unzulässig. Erwerbsnebenkosten werden grundsätzlich im selben Wertverhältnis auf Grund und Boden und Gebäude verteilt. Anschließend wird der Gebäudeanteil auf die einzelnen Nutzungsbereiche aufgeteilt.

Beispiel:
Ein Zweifamilienhaus wird zu 60 % vermietet und zu 40 % selbst genutzt. Beträgt der auf das Gebäude entfallende Anteil der Anschaffungskosten 240.000 EUR, beläuft sich die AfA-Bemessungsgrundlage des vermieteten Teils auf 144.000 EUR.

5. Nutzungsänderung

Wird ein bisher selbst genutzter Gebäudeteil später vermietet, beginnt der Werbungskostenabzug einschließlich AfA mit dem Übergang zur Einkünfteerzielung. Bei einer Nutzungsänderung im Laufe des Jahres ist die AfA zeitanteilig den jeweiligen Nutzungsarten zuzuordnen.

Ein zum Betriebsvermögen gehörender Gebäudeteil wird durch eine spätere Fremdvermietung nicht automatisch entnommen. Umgekehrt wird ein zum Privatvermögen gehörender Gebäudeteil durch die Vermietung zu fremden betrieblichen Zwecken nicht ohne ausdrückliche Zuordnung zu Betriebsvermögen.

6. Fertigstellung in Bauabschnitten

Die AfA beginnt grundsätzlich mit Anschaffung oder Fertigstellung. Ein selbstständig nutzbarer Bauabschnitt kann bereits vor Fertigstellung des Gesamtgebäudes abschreibungsfähig sein, wenn die Bauausführung tatsächlich abschnittsweise erfolgt. Bloße witterungsbedingte Unterbrechungen reichen hierfür nicht aus.

Praxis-Merksatz:
Zuerst den Nutzungs- und Funktionszusammenhang bestimmen, danach Grund und Boden vom Gebäude trennen und erst anschließend die Gebäudeanschaffungs- oder Herstellungskosten auf die einzelnen Gebäudeteile verteilen.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === abschreibungGemischtGenutzteGebaeudeAfa.id)) {
  KNOWLEDGE_BASE.push(abschreibungGemischtGenutzteGebaeudeAfa);
}
