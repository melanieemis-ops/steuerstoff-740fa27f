import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const lohnsteuerLohnUndGehaltsabrechnung: KBEntry = {
  id: "lohnsteuer-lohn-und-gehaltsabrechnung",
  title: "Lohn- und Gehaltsabrechnung",
  short:
    "Praxisüberblick von der Bruttoermittlung über Lohnsteuer und Sozialversicherung bis zu Abrechnung, Meldungen, Zahlung und Aufbewahrung.",
  category: "Lohnsteuer",
  type: "praxis",
  source:
    "Zusammenfassung nach § 108 GewO, §§ 8, 19 und 38–42g EStG, LStDV, SGB IV sowie Beitragsverfahrensverordnung; Rechtsstand Juli 2026.",
  keywords:
    "lohnabrechnung|gehaltsabrechnung|entgeltabrechnung|brutto netto abrechnung|§ 108 gewo|lohnsteuer berechnen|sozialversicherungsbeiträge|beitragsnachweis|lohnsteuer-anmeldung|elstam anmeldung|entgeltbescheinigung|lohnkonto|abrechnungszeitraum|sachbezug|einmalzahlung|nettolohn|krankenkasse meldung|sv meldung|abrechnung korrigieren|digitale lohnabrechnung|mitarbeiterpostfach",
  references: [
    "§ 108 GewO",
    "§§ 8 und 19 EStG",
    "§§ 38–42g EStG",
    "§ 41 EStG",
    "LStDV und LStR",
    "SGB IV",
    "Beitragsverfahrensverordnung",
  ],
  importance: 5,
  body: `Die Lohn- und Gehaltsabrechnung ermittelt für jeden Abrechnungszeitraum den Anspruch des Arbeitnehmers, die gesetzlichen und freiwilligen Abzüge sowie den auszuzahlenden Nettobetrag. Sie verbindet Arbeitsrecht, Lohnsteuerrecht und Sozialversicherungsrecht und löst zahlreiche Melde-, Zahlungs-, Dokumentations- und Aufbewahrungspflichten aus.

1. Grundschema der Abrechnung
Ausgangspunkt ist das steuer- und sozialversicherungsrechtlich zu beurteilende Bruttoentgelt. Typischer Ablauf:
- laufendes Grundgehalt oder Stundenlohn ermitteln,
- Zuschläge, Zulagen, Provisionen und Einmalzahlungen ergänzen,
- Sachbezüge und geldwerte Vorteile bewerten,
- steuerfreie und pauschal besteuerte Bestandteile abgrenzen,
- Lohnsteuer, Solidaritätszuschlag und gegebenenfalls Kirchensteuer berechnen,
- Arbeitnehmeranteile zur Sozialversicherung berechnen,
- weitere Abzüge, Vorschüsse oder Pfändungen berücksichtigen,
- Nettoauszahlungsbetrag feststellen.

Arbeitsrechtliches Brutto, steuerpflichtiger Arbeitslohn und sozialversicherungspflichtiges Arbeitsentgelt sind nicht immer identisch. Jeder Bestandteil muss deshalb getrennt arbeits-, steuer- und beitragsrechtlich beurteilt werden.

2. Anspruch auf eine Abrechnung
Nach § 108 GewO ist dem Arbeitnehmer bei Zahlung des Arbeitsentgelts eine Abrechnung in Textform zu erteilen. Sie muss mindestens enthalten:
- Abrechnungszeitraum,
- Zusammensetzung des Arbeitsentgelts,
- Art und Höhe von Zuschlägen, Zulagen und sonstigen Vergütungen,
- Art und Höhe der Abzüge,
- Abschlagszahlungen und Vorschüsse,
- gesondert auszuweisende Sachbezüge und Einmalzahlungen.

Eine erneute Abrechnung ist entbehrlich, wenn sich gegenüber der letzten ordnungsgemäßen Abrechnung keine Angaben geändert haben.

3. Digitale Lohnabrechnung
Die Abrechnung kann elektronisch bereitgestellt werden, etwa in einem geschützten Mitarbeiterportal. Der Arbeitgeber muss jedoch berechtigte Interessen von Arbeitnehmern berücksichtigen, die keinen privaten digitalen Zugang haben. In solchen Fällen muss eine zumutbare Einsichts- oder Ausdrucksmöglichkeit angeboten werden.

4. Wirkung und Korrektur
Die Entgeltabrechnung dokumentiert die Berechnung, begründet aber grundsätzlich nicht selbst den materiellen Vergütungsanspruch. Eine fehlerhafte Abrechnung kann daher korrigiert werden.

Bei einer späteren Nachzahlung ist regelmäßig eine eigene Abrechnung über die Nachzahlung zu erstellen. Steuer- und beitragsrechtlich ist zusätzlich zu prüfen, welchem Zeitraum die Zahlung zuzuordnen ist und ob laufender Arbeitslohn oder ein sonstiger Bezug vorliegt.

5. Lohnsteuerliche Abrechnung
Der Arbeitgeber behält die Lohnsteuer für Rechnung des Arbeitnehmers ein. Maßgeblich sind insbesondere:
- die elektronischen Lohnsteuerabzugsmerkmale (ELStAM),
- Höhe und Art des steuerpflichtigen Arbeitslohns,
- Steuerklasse und gegebenenfalls Faktor,
- Kinderfreibeträge, Freibeträge und Hinzurechnungsbeträge,
- Kirchensteuermerkmal,
- Behandlung von Sachbezügen, Reisekosten und Einmalzahlungen.

Pauschal besteuerte Arbeitslohnbestandteile sind von individuell besteuertem Arbeitslohn zu trennen. Steuerfreie Leistungen dürfen nicht versehentlich dem steuerpflichtigen Brutto zugerechnet werden.

6. Sozialversicherungsrechtliche Abrechnung
Für Kranken-, Pflege-, Renten- und Arbeitslosenversicherung sind insbesondere zu prüfen:
- Versicherungsstatus und Personengruppe,
- beitragspflichtiges Arbeitsentgelt,
- Sozialversicherungstage,
- Beitragsbemessungsgrenzen,
- Beitragssätze und kassenindividuelle Zusatzbeiträge,
- Besonderheiten bei Einmalzahlungen,
- Minijob, Midijob, Auszubildende, Rentner und privat Versicherte.

Die Unfallversicherungsbeiträge trägt der Arbeitgeber allein. Die übrigen Beiträge werden grundsätzlich von Arbeitgeber und Arbeitnehmer gemeinsam getragen, soweit keine Sonderregelung gilt.

7. Lohnsteuer-Anmeldung und Zahlung
Der Arbeitgeber übermittelt die Lohnsteuer-Anmeldung elektronisch monatlich, vierteljährlich oder jährlich. Sie enthält zusammengefasst insbesondere:
- einbehaltene Lohnsteuer,
- pauschale Lohnsteuer,
- Solidaritätszuschlag,
- Kirchensteuer.

Anmeldung und Zahlung sind grundsätzlich bis zum 10. Tag nach Ablauf des jeweiligen Anmeldungszeitraums vorzunehmen. Fällt der Termin auf einen Samstag, Sonntag oder gesetzlichen Feiertag, verschiebt er sich auf den nächsten Werktag.

8. Beitragsnachweis und Sozialversicherungsmeldungen
Für jede Einzugsstelle ist ein elektronischer Beitragsnachweis zu übermitteln. Dieser umfasst insbesondere Gesamtsozialversicherungsbeiträge und Umlagen. Der Nachweis muss rechtzeitig vor der Beitragsfälligkeit bei der Einzugsstelle vorliegen.

Typische Meldungen sind:
- Anmeldung bei Beschäftigungsbeginn,
- Abmeldung bei Beschäftigungsende,
- Jahresmeldung,
- Unterbrechungsmeldung,
- Meldung von Einmalzahlungen,
- Sofortmeldung in bestimmten Branchen,
- Meldungen bei Krankenkassenwechsel oder Statusänderungen.

9. Eintritt und Austritt
Bei Beschäftigungsbeginn sind unter anderem Steuer-ID, ELStAM, Sozialversicherungsnummer, Krankenkasse, Versicherungsstatus und Bankverbindung zu erfassen.

Bei Beschäftigungsende sind insbesondere erforderlich:
- ELStAM-Abmeldung,
- sozialversicherungsrechtliche Abmeldung,
- elektronische Lohnsteuerbescheinigung,
- letzte Entgeltabrechnung,
- gegebenenfalls Urlaubs-, Arbeits- oder weitere Bescheinigungen.

10. Lohnkonto und Entgeltunterlagen
Für jeden Arbeitnehmer ist ein Lohnkonto zu führen. Darin sind die für den Lohnsteuerabzug maßgebenden Daten und Beträge nachvollziehbar aufzuzeichnen. Daneben sind nach Sozialversicherungsrecht Entgeltunterlagen vorzuhalten.

Zu dokumentieren sind unter anderem:
- Stammdaten und Beschäftigungszeitraum,
- Arbeitslohn und Entgeltbestandteile,
- Steuermerkmale,
- Beitragsgruppen und Personengruppenschlüssel,
- Fehlzeiten und Unterbrechungen,
- Nachweise für steuer- oder beitragsfreie Leistungen,
- Berechnungsgrundlagen für Sachbezüge und Einmalzahlungen.

11. Aufbewahrung
Lohnkonten und lohnsteuerliche Unterlagen sind grundsätzlich sechs Jahre aufzubewahren. Für andere Abrechnungs-, Buchungs- oder sozialversicherungsrechtliche Unterlagen können abweichende Fristen gelten. Vor einer Löschung ist deshalb stets die konkrete Unterlagenart zu prüfen.

12. Praxisablauf vor der Abrechnung
- Personalstammdaten und Änderungen vollständig erfasst?
- Arbeitszeiten, Fehlzeiten, Urlaub und Krankheit geprüft?
- variable Vergütungen und Einmalzahlungen gemeldet?
- Sachbezüge und Firmenwagen korrekt bewertet?
- Reisekosten und steuerfreie Erstattungen abgegrenzt?
- Krankenkasse, Beitragsgruppe und Personengruppe aktuell?
- ELStAM und Freibeträge abgerufen?
- Pfändungen, Vorschüsse und sonstige Abzüge berücksichtigt?

13. Kontrolle nach der Abrechnung
- Brutto-Netto-Abrechnung plausibel?
- Vergleich zum Vormonat durchgeführt?
- ungewöhnliche Abweichungen erklärt?
- Lohnsteuer-Anmeldung abgestimmt?
- Beitragsnachweise je Krankenkasse abgestimmt?
- Zahlungsdateien und Fälligkeiten kontrolliert?
- Meldungen erfolgreich verarbeitet und Protokolle geprüft?
- Finanzbuchhaltung und Personalkonten abgestimmt?

Typische Fehler
- Arbeitsrechtliches Brutto ungeprüft als Steuer- und SV-Brutto übernommen.
- Einmalzahlung wie laufendes Entgelt behandelt.
- Sachbezug oder geldwerter Vorteil nicht erfasst.
- Steuerfreie Erstattung ohne ausreichenden Nachweis abgerechnet.
- ELStAM-Änderung oder Krankenkassenwechsel nicht berücksichtigt.
- Beitragsnachweis oder Lohnsteuer-Anmeldung verspätet übermittelt.
- Abmeldung bei Beschäftigungsende vergessen.
- Digitale Abrechnung ohne Zugangsalternative bereitgestellt.
- Fehlerkorrektur nicht in Lohnkonto, Meldungen und Finanzbuchhaltung nachvollzogen.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerLohnUndGehaltsabrechnung.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerLohnUndGehaltsabrechnung);
}
