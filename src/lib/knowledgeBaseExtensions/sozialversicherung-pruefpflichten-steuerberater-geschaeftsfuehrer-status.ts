import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const sozialversicherungPruefpflichtenSteuerberaterGeschaeftsfuehrerStatus: KBEntry = {
  id: "sozialversicherung-pruefpflichten-steuerberater-geschaeftsfuehrer-status",
  title: "Sozialversicherungsrechtliche Prüf- und Hinweispflichten im Lohnmandat",
  short:
    "Ein Steuerberater muss im Lohnbuchhaltungsmandat den Sozialversicherungsstatus eines Geschäftsführers nicht eigenständig prüfen, bei Zweifeln aber auf das Risiko und weiteren Beratungsbedarf hinweisen.",
  category: "Sozialversicherung",
  type: "praxis",
  source:
    "Zusammenfassung nach OLG München, Urteil vom 26.11.2025 – 15 U 2479/23.",
  keywords:
    "sozialversicherungsrechtliche prüfpflichten|steuerberater lohnmandat sozialversicherung|geschäftsführer statusprüfung|sozialversicherungsstatus geschäftsführer|statusfeststellungsverfahren|hinweispflicht steuerberater|haftung lohnbuchhaltung|ungeklärter sozialversicherungsstatus|spezialisierter rechtsrat|olg münchen 15 u 2479/23",
  references: [
    "OLG München, Urteil vom 26.11.2025 – 15 U 2479/23",
    "Statusfeststellungsverfahren nach § 7a SGB IV",
  ],
  importance: 5,
  body: `Ein Steuerberater ist im Rahmen eines reinen Lohnbuchhaltungsmandats grundsätzlich weder verpflichtet noch berechtigt, den sozialversicherungsrechtlichen Status eines Geschäftsführers umfassend eigenständig zu prüfen oder hierzu abschließend zu beraten.

Hinweispflicht bei Zweifeln
Bestehen jedoch erkennbare Zweifel an der sozialversicherungsrechtlichen Einordnung und liegt keine verbindliche Vorgabe des Mandanten vor, muss der Steuerberater tätig werden. Er hat insbesondere:
- auf die ungeklärte Rechtslage und mögliche Beitragsrisiken hinzuweisen,
- die Einholung spezialisierten Rechtsrats anzuregen oder
- auf ein förmliches Statusfeststellungsverfahren hinzuweisen.

Haftungsrisiko
Unterbleibt ein solcher Hinweis trotz erkennbarer Unsicherheit, kann dies eine Pflichtverletzung im Lohnbuchhaltungsmandat darstellen. Die Grenze zwischen laufender Lohnabrechnung und unzulässiger umfassender Rechtsberatung bleibt bestehen; sie entbindet den Berater aber nicht von seiner Warn- und Hinweispflicht.

Praxistipp
Der Sozialversicherungsstatus von Geschäftsführern sollte bei Mandatsbeginn und bei Änderungen der Beteiligungs- oder Vertragsverhältnisse dokumentiert werden. Offene Punkte, Hinweise an den Mandanten und Empfehlungen zur weiteren Klärung sollten schriftlich festgehalten werden. Bei Zweifeln empfiehlt sich frühzeitig ein Statusfeststellungsverfahren nach § 7a SGB IV.

Merksatz
Keine eigenständige umfassende Statusprüfung im Lohnmandat – aber eine klare Hinweispflicht, sobald sozialversicherungsrechtliche Zweifel erkennbar sind.`,
};

if (
  !KNOWLEDGE_BASE.some(
    (entry) => entry.id === sozialversicherungPruefpflichtenSteuerberaterGeschaeftsfuehrerStatus.id,
  )
) {
  KNOWLEDGE_BASE.push(sozialversicherungPruefpflichtenSteuerberaterGeschaeftsfuehrerStatus);
}
