import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const lohnsteuerbescheinigungErstellungKorrekturInhalt: KBEntry = {
  id: "lohnsteuer-lohnsteuerbescheinigung-erstellung-korrektur-inhalt",
  title: "Lohnsteuerbescheinigung: Erstellung, Korrektur und Inhalt",
  short:
    "Praxisüberblick zur elektronischen Erstellung, Übermittlung, Berichtigung und Stornierung der Lohnsteuerbescheinigung sowie zu den wichtigsten Bescheinigungsfeldern.",
  category: "Lohnsteuer",
  type: "praxis",
  source:
    "Zusammenfassung nach § 41b EStG, § 41c EStG, § 93c AO und R 41b LStR; unter Berücksichtigung der amtlichen Vordruckmuster 2025 und 2026. Rechtsstand Juli 2026.",
  keywords:
    "lohnsteuerbescheinigung erstellung|lohnsteuerbescheinigung korrektur|lohnsteuerbescheinigung stornierung|elektronische lohnsteuerbescheinigung|§ 41b estg|§ 41c estg|§ 93c ao|elster lohnsteuerbescheinigung|verarbeitungsprotokoll|transferticket|identifikationsnummer lohnsteuerbescheinigung|kmid|großbuchstabe u|großbuchstabe s|großbuchstabe m|großbuchstabe f|großbuchstabe fr|bruttoarbeitslohn nummer 3|steuerabzugsbeträge nummer 4 bis 7|versorgungsbezüge|abfindung lohnsteuerbescheinigung|korrekturlieferung|stornierungsmitteilung|besondere lohnsteuerbescheinigung",
  references: [
    "§ 41b EStG",
    "§ 41c EStG",
    "§ 93c AO",
    "R 41b LStR",
    "BMF-Schreiben vom 05.09.2024, BStBl 2024 I S. 1255",
    "BMF-Schreiben zum Vordruckmuster 2025 vom 20.02.2025",
    "BMF-Schreiben zum Vordruckmuster 2026 vom 29.08.2025",
  ],
  importance: 5,
  body: `Nach Beendigung eines Dienstverhältnisses oder am Ende des Kalenderjahres schließt der Arbeitgeber das Lohnkonto ab. Auf Grundlage der dort aufgezeichneten Daten ist für jeden bescheinigungspflichtigen Arbeitnehmer eine Lohnsteuerbescheinigung zu erstellen und grundsätzlich elektronisch an die Finanzverwaltung zu übermitteln.

1. Zeitpunkt und elektronische Übermittlung
- Die Übermittlung muss grundsätzlich spätestens bis zum letzten Tag im Februar des Folgejahres erfolgen.
- Endet das Dienstverhältnis bereits während des Kalenderjahres, darf die Bescheinigung früher übermittelt werden.
- Die Datenübermittlung erfolgt authentifiziert über das Entgeltabrechnungsprogramm oder über Mein ELSTER.
- Auch für beschränkt steuerpflichtige Arbeitnehmer ist grundsätzlich eine elektronische Lohnsteuerbescheinigung zu übermitteln.
- Für ausschließlich pauschal besteuerte Beschäftigungen, insbesondere pauschal versteuerte Minijobs, wird grundsätzlich keine Lohnsteuerbescheinigung erstellt.

2. Verarbeitungsprotokoll und Nachweis der Übermittlung
Nach der Datenübermittlung muss der Arbeitgeber das Verarbeitungsprotokoll abrufen und prüfen. Erst daraus ergibt sich, ob die Bescheinigungsdaten technisch angenommen und verarbeitet wurden.

Bei Fehlern sind die Daten zu berichtigen und erneut zu senden. Die Quittungs- oder Ticketnummer kann im Arbeitnehmerausdruck als Transferticket ausgewiesen werden. Ein bloßer Sendeversuch ohne erfolgreiches Verarbeitungsprotokoll genügt nicht als sichere Dokumentation.

3. Authentifizierung und Identifikationsnummer
- Die Übermittlung ist nur mit einem elektronischen Zertifikat möglich.
- Als persönliches Ordnungsmerkmal ist die steuerliche Identifikationsnummer des Arbeitnehmers zu verwenden.
- Die frühere eTIN ist nicht mehr zulässig.
- Für technische Korrektur- und Stornierungsverfahren wird zusätzlich eine eindeutige Kennzeichnung des Datensatzes, insbesondere die KmID, verwendet.

4. Information des Arbeitnehmers
Nach erfolgreicher Übermittlung muss der Arbeitgeber dem Arbeitnehmer einen Ausdruck der elektronischen Lohnsteuerbescheinigung aushändigen oder elektronisch bereitstellen.

Der Ausdruck dient der Information und der Erstellung der Einkommensteuererklärung. Er muss der Steuererklärung grundsätzlich nicht beigefügt werden, weil das Finanzamt die übermittelten Daten anhand der Identifikationsnummer elektronisch abrufen kann.

Datenschutz: Bei Fensterbriefumschlägen darf die Identifikationsnummer nicht sichtbar sein.

5. Änderung des Lohnsteuerabzugs und Berichtigung der Bescheinigung
Es ist zwischen zwei Fällen zu unterscheiden:

A. Der Lohnsteuerabzug war falsch
Eine nachträgliche Änderung des Lohnsteuerabzugs richtet sich vorrangig nach § 41c EStG. Nach Ablauf des Kalenderjahres oder nach Übermittlung der Bescheinigung sind Änderungen nur noch in den gesetzlich zugelassenen Fällen möglich.

Wurde zu wenig Lohnsteuer einbehalten und kann der Arbeitgeber nicht mehr korrigieren, muss er das Betriebsstättenfinanzamt durch eine haftungsbefreiende Anzeige informieren.

B. Der Lohnsteuerabzug war richtig, aber der Datensatz ist falsch
Bei einem Zahlendreher oder einer anderen fehlerhaften Datenübermittlung ist eine Korrekturlieferung nach § 93c AO zulässig und zeitnah vorzunehmen.

Wichtig:
- Das bisherige Ordnungsmerkmal muss bei einer Korrekturlieferung grundsätzlich unverändert bleiben.
- Die erneute Übermittlung ist mit dem vorgesehenen Korrekturmerkmal zu kennzeichnen.
- Eine Bescheinigung dokumentiert grundsätzlich den tatsächlich vorgenommenen Lohnsteuerabzug und nicht den Abzug, der nach Auffassung des Arbeitnehmers hätte erfolgen müssen.

6. Stornierung
Eine bereits übermittelte Bescheinigung muss storniert werden, wenn der ursprüngliche Datensatz nicht lediglich inhaltlich berichtigt werden kann, etwa bei:
- falschem Kalenderjahr,
- falscher Identifikationsnummer,
- falschem Namen, Vornamen oder Geburtsdatum,
- Zusammenfassung mehrerer Einzelbescheinigungen zu einer Gesamtbescheinigung.

Die Stornierung betrifft über die eindeutige Datensatzkennung genau die fehlerhafte Bescheinigung. Anschließend ist gegebenenfalls eine neue, richtige Bescheinigung zu übermitteln.

7. Ausnahme: Besondere Lohnsteuerbescheinigung in Papierform
Nur in zugelassenen Härtefällen kann statt der elektronischen Bescheinigung eine besondere Lohnsteuerbescheinigung in Papierform verwendet werden. Sie ist an das Betriebsstättenfinanzamt zu senden und dem Arbeitnehmer in Zweitausfertigung auszuhändigen.

8. Wesentliche persönliche Angaben
Zu übermitteln sind insbesondere:
- Name, Vorname, Geburtsdatum und Anschrift,
- steuerliche Identifikationsnummer,
- Beschäftigungszeitraum,
- angewendete Steuerklasse und gegebenenfalls Faktor,
- Kinderfreibeträge,
- Kirchensteuermerkmal,
- Freibetrag oder Hinzurechnungsbetrag,
- gegebenenfalls Angaben zur privaten Kranken- und Pflegeversicherung,
- Daten der lohnsteuerlichen Betriebsstätte.

Es ist stets das amtliche Muster des jeweiligen Bescheinigungsjahres zu beachten. Die Felder und technischen Vorgaben können sich von Jahr zu Jahr ändern.

9. Beschäftigungsdauer und Großbuchstabe U
Die Dauer des Dienstverhältnisses ist für das jeweilige Kalenderjahr anzugeben. Besteht das Arbeitsverhältnis fort, obwohl für mindestens fünf aufeinanderfolgende Arbeitstage im Wesentlichen kein Anspruch auf Arbeitslohn besteht, ist der Unterbrechungszeitraum im Lohnkonto mit dem Großbuchstaben U zu erfassen.

Für jeden Unterbrechungszeitraum wird ein U gezählt. Steuerfreie Arbeitgeberleistungen mit Progressionsvorbehalt führen nicht automatisch zu einem U.

10. Weitere wichtige Großbuchstaben
- S: Sonstiger Bezug im ersten Dienstverhältnis, wenn Arbeitslohn aus früheren Dienstverhältnissen des Jahres bei der Berechnung nicht berücksichtigt wurde.
- M: Mahlzeit bis 60 EUR bei Auswärtstätigkeit oder doppelter Haushaltsführung, die mit dem amtlichen Sachbezugswert zu bewerten ist.
- F: Steuerfreie Sammelbeförderung zwischen Wohnung und erster Tätigkeitsstätte oder einem Sammelpunkt.
- FR: Französischer Grenzgänger; je nach Bundesland als FR1, FR2 oder FR3.

Die Großbuchstaben lösen keine Steuer aus, liefern dem Finanzamt aber wichtige Informationen für die Einkommensteuerveranlagung.

11. Nummer 3: Steuerpflichtiger Bruttoarbeitslohn
In Nummer 3 wird der im Kalenderjahr zugeflossene steuerpflichtige Bruttoarbeitslohn ausgewiesen. Dazu gehören insbesondere:
- laufender Arbeitslohn,
- Weihnachtsgeld, Urlaubsgeld und Tantiemen,
- steuerpflichtige Sachbezüge,
- vermögenswirksame Leistungen,
- steuerpflichtige Versorgungsbezüge,
- Arbeitslohn für mehrere Jahre und Entschädigungen zusätzlich zu den dafür vorgesehenen Sonderfeldern.

Nicht in Nummer 3 gehören insbesondere:
- steuerfreier Arbeitslohn,
- nach DBA oder Auslandstätigkeitserlass steuerfreier Arbeitslohn,
- pauschal versteuerter Arbeitslohn,
- Versorgungsfreibetrag und Altersentlastungsbetrag als Kürzungspositionen.

Rückzahlungen von Arbeitslohn können den bescheinigten Betrag mindern. Ergibt sich ein negativer Betrag, ist er mit Minuszeichen auszuweisen.

12. Nummern 4 bis 7: Steuerabzugsbeträge
Auszuweisen sind die tatsächlich einbehaltenen Beträge für:
- Lohnsteuer,
- Solidaritätszuschlag,
- Kirchensteuer des Arbeitnehmers,
- gegebenenfalls Kirchensteuer des Ehe- oder Lebenspartners nach dem landesrechtlichen Halbteilungsgrundsatz.

Pauschale Lohnsteuer darf nicht in die individuelle Lohnsteuerbescheinigung aufgenommen werden.

13. Versorgungsbezüge, Abfindungen und mehrjähriger Arbeitslohn
- Versorgungsbezüge sind zusätzlich zum Bruttoarbeitslohn gesondert auszuweisen.
- Versorgungsbezüge für mehrere Kalenderjahre gehören in das dafür vorgesehene Feld.
- Arbeitslohn für mehrere Kalenderjahre und Entschädigungen, insbesondere Abfindungen, sind ebenfalls gesondert zu bescheinigen.
- Seit 2025 wird die Fünftelregelung grundsätzlich nicht mehr im Lohnsteuerabzugsverfahren angewendet. Die Prüfung und mögliche Steuerermäßigung erfolgen im Einkommensteuerveranlagungsverfahren.

14. Freiwillige und zusätzliche Angaben
In nicht amtlich belegten Zeilen können nach den Vorgaben des jeweiligen Jahres weitere Angaben aufgenommen werden, beispielsweise:
- Arbeitnehmerbeiträge zur Zusatzversorgung,
- Anzahl der Fahrten zur ersten Tätigkeitsstätte,
- steuerfreie Fahrtkostenerstattungen bei Auswärtstätigkeiten,
- weitere für den Arbeitnehmer bestimmte betriebliche Informationen.

Zusätzliche Angaben dürfen die amtlichen Pflichtfelder nicht verändern oder unübersichtlich machen.

Praxischeck
- Lohnkonto vollständig abgeschlossen?
- Richtige Bescheinigungsart und richtiges Kalenderjahr gewählt?
- Identifikationsnummer geprüft?
- Übermittlungsfrist eingehalten?
- Verarbeitungsprotokoll erfolgreich abgerufen?
- Arbeitnehmerausdruck bereitgestellt?
- Beschäftigungszeitraum und Großbuchstaben vollständig?
- Steuerpflichtiger und steuerfreier Arbeitslohn korrekt getrennt?
- Pauschal versteuerte Beträge ausgeschlossen?
- Versorgungsbezüge, Abfindungen und mehrjähriger Arbeitslohn richtig ausgewiesen?
- Korrektur oder Stornierung technisch richtig durchgeführt?

Typische Fehler
- Die Bescheinigung wird gesendet, aber das Verarbeitungsprotokoll nicht geprüft.
- Eine falsche Identifikationsnummer wird durch Korrektur statt durch Stornierung berichtigt.
- Steuerfreier oder pauschal versteuerter Arbeitslohn wird in Nummer 3 aufgenommen.
- Großbuchstaben U, S, M, F oder FR werden übersehen.
- Nachzahlungen nach Ende des Dienstverhältnisses werden dem falschen Kalenderjahr zugeordnet.
- Abfindungen oder mehrjähriger Arbeitslohn werden nicht zusätzlich in den vorgesehenen Feldern ausgewiesen.
- Der Arbeitnehmer erhält keinen Ausdruck oder keine elektronische Bereitstellung.
- Es wird ein veraltetes Vordruckmuster verwendet.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerbescheinigungErstellungKorrekturInhalt.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerbescheinigungErstellungKorrekturInhalt);
}
