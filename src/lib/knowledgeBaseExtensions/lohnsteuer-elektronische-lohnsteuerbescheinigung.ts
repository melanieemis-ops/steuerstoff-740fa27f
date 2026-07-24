import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const elektronischeLohnsteuerbescheinigung: KBEntry = {
  id: "lohnsteuer-elektronische-lohnsteuerbescheinigung",
  title: "Elektronische Lohnsteuerbescheinigung",
  short:
    "Pflichten des Arbeitgebers bei Erstellung, Übermittlung, Ausdruck und Berichtigung der elektronischen Lohnsteuerbescheinigung.",
  category: "Lohnsteuer",
  type: "praxis",
  source:
    "Zusammenfassung nach § 41b EStG, § 39e EStG und den BMF-Vorgaben zur elektronischen Lohnsteuerbescheinigung; Schwerpunkt Bescheinigungsjahr 2025.",
  keywords:
    "elektronische lohnsteuerbescheinigung|lohnsteuerbescheinigung 2025|§ 41b estg|elster lohnsteuerbescheinigung|identifikationsnummer arbeitnehmer|id nummer lohnabrechnung|etin nicht mehr zulässig|ausdruck lohnsteuerbescheinigung|berichtigung lohnsteuerbescheinigung|übermittlungsfrist 28. februar|lohnsteuerbescheinigung arbeitgeberpflicht|großbuchstaben lohnsteuerbescheinigung|reisekosten zeile 20 21|vorsorgeaufwendungen zeile 22 bis 28|versorgungsbezüge lohnsteuerbescheinigung",
  references: [
    "§ 41b EStG",
    "§ 39e Abs. 7 EStG",
    "§ 52 EStG",
    "BMF-Schreiben vom 05.09.2024, IV C 5 – S 2378/19/10002 :002",
    "BMF-Bekanntmachung vom 17.02.2025 zum geänderten Muster 2025",
  ],
  importance: 5,
  body: `Arbeitgeber müssen nach Ablauf des Kalenderjahres oder bei Beendigung des Dienstverhältnisses eine Lohnsteuerbescheinigung erstellen und die vorgeschriebenen Daten grundsätzlich elektronisch und authentifiziert an die Finanzverwaltung übermitteln.

1. Elektronische Übermittlung
- Die Übermittlung erfolgt nach amtlich vorgeschriebenem Datensatz über eine authentifizierte Verbindung, regelmäßig aus dem Lohnabrechnungsprogramm oder über ELSTER.
- Für das Kalenderjahr 2025 ist die Bescheinigung grundsätzlich spätestens bis zum letzten Tag des Monats Februar 2026 zu übermitteln. Da der 28.2.2026 ein Samstag ist, ist die konkrete Fristberechnung im Einzelfall nach den allgemeinen Fristenregeln zu prüfen.
- Eine Übermittlung ohne Authentifizierung ist nicht zulässig.
- Papierbescheinigungen kommen nur noch in eng begrenzten Ausnahmefällen in Betracht, insbesondere bei Arbeitgebern, die von der elektronischen Teilnahme befreit sind und ausschließlich geringfügig Beschäftigte im Privathaushalt beschäftigen.

2. Identifikationsnummer als Ordnungsmerkmal
- Für die elektronische Lohnsteuerbescheinigung ist die steuerliche Identifikationsnummer des Arbeitnehmers zu verwenden.
- Der Arbeitnehmer muss sie dem Arbeitgeber bei Eintritt in das Dienstverhältnis mitteilen; sie ist im Lohnkonto zu erfassen.
- Die frühere eTIN ist seit dem Bescheinigungsjahr 2023 nicht mehr als Ordnungsmerkmal zulässig.
- Auch bei im Ausland wohnenden Arbeitnehmern oder Grenzpendlern ist für die elektronische Bescheinigung grundsätzlich eine steuerliche Identifikationsnummer erforderlich.

3. Ausdruck oder elektronische Bereitstellung für den Arbeitnehmer
Der Arbeitgeber muss dem Arbeitnehmer einen Ausdruck der elektronischen Lohnsteuerbescheinigung aushändigen oder ihn elektronisch bereitstellen. Dieser Beleg informiert über die tatsächlich an die Finanzverwaltung übermittelten Daten.

Der Ausdruck muss der Einkommensteuererklärung grundsätzlich nicht beigefügt werden. Er ist dennoch wichtig, weil der Arbeitnehmer damit insbesondere folgende Angaben prüfen und in die Steuererklärung übernehmen kann:
- steuerpflichtiger Bruttoarbeitslohn,
- einbehaltene Lohnsteuer,
- Solidaritätszuschlag und Kirchensteuer,
- steuerfreie Arbeitgeberleistungen,
- Sozialversicherungsbeiträge,
- Versorgungsbezüge und weitere besondere Besteuerungsmerkmale.

4. Typische Pflichtangaben
Die Lohnsteuerbescheinigung enthält insbesondere:
- Beschäftigungsdauer und persönliche Besteuerungsmerkmale,
- Bruttoarbeitslohn und einbehaltene Steuerabzugsbeträge,
- gesetzlich vorgeschriebene Großbuchstaben,
- steuerfreie Lohnersatzleistungen,
- pauschal besteuerte oder steuerfreie Leistungen für Fahrten zwischen Wohnung und erster Tätigkeitsstätte,
- steuerfreie Verpflegungszuschüsse bei Auswärtstätigkeiten und Leistungen bei doppelter Haushaltsführung, soweit sie im Lohnkonto aufzuzeichnen und zu bescheinigen sind,
- Arbeitgeber- und Arbeitnehmeranteile zur gesetzlichen Rentenversicherung oder zu berufsständischen Versorgungseinrichtungen,
- Beiträge und Zuschüsse zur Kranken-, Pflege- und Arbeitslosenversicherung,
- Angaben zu Versorgungsbezügen.

5. Reisekosten
Steuerfreie Verpflegungszuschüsse bei Auswärtstätigkeiten und steuerfreie Leistungen bei doppelter Haushaltsführung sind grundsätzlich zu bescheinigen, wenn sie im Lohnkonto aufgezeichnet und über die Lohnabrechnung verarbeitet werden.

Keine Bescheinigungspflicht besteht regelmäßig, wenn das Betriebsstättenfinanzamt eine gesonderte Aufzeichnung außerhalb des Lohnkontos zugelassen hat und die Reisekosten getrennt von der Lohnabrechnung geführt werden.

6. Kranken- und Pflegeversicherungsbeiträge
Bei freiwillig gesetzlich versicherten Arbeitnehmern ist zwischen Firmenzahlern und Selbstzahlern zu unterscheiden:
- Führt der Arbeitgeber die Beiträge an die Krankenkasse ab, werden grundsätzlich die maßgeblichen Gesamtbeiträge sowie die steuerfreien Arbeitgeberzuschüsse getrennt bescheinigt.
- Zahlt der Arbeitnehmer die Beiträge selbst, gelten abweichende Eintragungsvorgaben.

Bei privat versicherten Arbeitnehmern sind die für den Lohnsteuerabzug maßgeblichen Daten nach den für das jeweilige Bescheinigungsjahr geltenden Vorgaben einzutragen. Ab 2026 ändern sich durch den elektronischen Datenaustausch mit den privaten Kranken- und Pflegeversicherungen einzelne Bescheinigungsfelder; deshalb muss stets das zum Kalenderjahr gehörende amtliche Muster verwendet werden.

7. Auslandstätigkeit
Sozialversicherungsbeiträge, die in unmittelbarem wirtschaftlichem Zusammenhang mit nach einem DBA steuerfreiem Arbeitslohn stehen, dürfen nicht ohne Prüfung vollständig als Sonderausgabenbeiträge bescheinigt werden. Gegebenenfalls ist eine Aufteilung zwischen steuerpflichtigen und steuerfreien Arbeitslohnteilen erforderlich. Für EU- und EWR-Sachverhalte können Ausnahmen gelten.

8. Berichtigung einer übermittelten Bescheinigung
Nach der Übermittlung ist eine Änderung des bereits durchgeführten Lohnsteuerabzugs grundsätzlich nicht mehr über die laufende Abrechnung möglich. Eine fehlerhaft übermittelte Lohnsteuerbescheinigung darf jedoch berichtigt werden.

Dabei gilt:
- Es muss sich um die Korrektur eines unrichtigen Datensatzes handeln.
- Das ursprünglich verwendete Ordnungsmerkmal muss grundsätzlich beibehalten werden.
- Der Arbeitnehmer erhält auch über die berichtigten Daten einen neuen Ausdruck oder eine elektronische Bereitstellung.
- Eine Berichtigung der Bescheinigung ist von einer Änderung der Lohnsteuer-Anmeldung zu unterscheiden.

Praxischeckliste
- Bescheinigungszeitraum und Beendigungsdatum korrekt?
- Steuerliche Identifikationsnummer vorhanden und plausibel?
- Bruttoarbeitslohn und Steuerabzugsbeträge mit dem Lohnkonto abgestimmt?
- Großbuchstaben und steuerfreie Leistungen vollständig?
- Reisekosten richtig aufgezeichnet und gegebenenfalls bescheinigt?
- Sozialversicherungsbeiträge und Arbeitgeberzuschüsse korrekt zugeordnet?
- Versorgungsbezüge und besondere DBA-Angaben geprüft?
- Elektronische Übermittlung authentifiziert und fristgerecht erfolgt?
- Verarbeitungsprotokoll archiviert?
- Ausdruck oder elektronische Bescheinigung dem Arbeitnehmer bereitgestellt?

Typische Fehler
- Verwendung einer eTIN anstelle der Identifikationsnummer.
- Abweichungen zwischen Lohnkonto und übermitteltem Datensatz.
- Fehlende oder falsche Großbuchstaben.
- Reisekosten werden trotz Bescheinigungspflicht nicht eingetragen.
- Firmenzahler und Selbstzahler bei Kranken- und Pflegeversicherung werden verwechselt.
- Nach einer Korrektur wird dem Arbeitnehmer kein aktualisierter Ausdruck bereitgestellt.
- Eine Berichtigung der Lohnsteuerbescheinigung wird fälschlich wie eine Änderung des Lohnsteuerabzugs behandelt.
- Es wird ein Muster oder Datensatz des falschen Kalenderjahres verwendet.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === elektronischeLohnsteuerbescheinigung.id)) {
  KNOWLEDGE_BASE.push(elektronischeLohnsteuerbescheinigung);
}
