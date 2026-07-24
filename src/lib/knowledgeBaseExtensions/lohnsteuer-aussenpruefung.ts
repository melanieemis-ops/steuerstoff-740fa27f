import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const lohnsteuerAussenpruefung: KBEntry = {
  id: "lohnsteuer-aussenpruefung",
  title: "Lohnsteuer-Außenprüfung",
  short:
    "Ablauf, Vorbereitung und typische Prüfungsschwerpunkte einer Lohnsteuer-Außenprüfung einschließlich Prüfungsanordnung, Mitwirkung, Nachschau und Haftungsfolgen.",
  category: "Lohnsteuer",
  type: "praxis",
  source:
    "Zusammenfassung nach § 42f EStG, R 42f LStR, §§ 193–207 AO, § 42g EStG und dem BMF-Schreiben zur Lohnsteuer-Nachschau; Rechtsstand Juli 2026.",
  keywords:
    "lohnsteuer außenprüfung|lohnsteuer-aussenpruefung|lohnsteuerprüfung|lohnsteuerpruefung|§ 42f estg|prüfungsanordnung lohnsteuer|betriebsstättenfinanzamt|lohnsteuer nachschau|§ 42g estg|lohnkonto prüfung|sachbezüge prüfung|pauschalierung lohnsteuer|arbeitgeberhaftung lohnsteuer|haftungsbescheid|schlussbesprechung lohnsteuer|prüfungsbericht|digitale lohndaten|datenzugriff lohnsteuer|vorabanforderung unterlagen",
  references: [
    "§ 42f EStG",
    "R 42f LStR",
    "§§ 193–207 AO",
    "§ 42g EStG",
    "§ 42d EStG",
    "BMF-Schreiben vom 16.10.2014 zur Lohnsteuer-Nachschau",
  ],
  importance: 5,
  body: `Die Lohnsteuer-Außenprüfung dient der Kontrolle, ob der Arbeitgeber die Lohnsteuer ordnungsgemäß ermittelt, einbehalten, angemeldet und abgeführt hat. Geprüft wird nicht nur zuungunsten, sondern ebenso zugunsten des Arbeitgebers und der Arbeitnehmer. Zuständig ist grundsätzlich das Betriebsstättenfinanzamt.

1. Gegenstand der Prüfung
Die Prüfung erstreckt sich insbesondere darauf, ob:
- alle steuerlich als Arbeitnehmer anzusehenden Personen erfasst wurden,
- Geld- und Sachbezüge vollständig als Arbeitslohn behandelt wurden,
- steuerfreie oder pauschal besteuerte Leistungen die gesetzlichen Voraussetzungen erfüllen,
- ELStAM korrekt angewendet wurden,
- Lohnsteuer, Solidaritätszuschlag und Kirchensteuer richtig berechnet wurden,
- Lohnsteuer-Anmeldungen vollständig und fristgerecht abgegeben wurden,
- Lohnkonten, Reisekosten-, Firmenwagen- und sonstige Entgeltunterlagen ordnungsgemäß geführt wurden.

Typische Prüfungsschwerpunkte sind Dienstwagen, Reisekosten, Mahlzeiten, Betriebsveranstaltungen, Gutscheine, Aufmerksamkeiten, Zuschläge, Abfindungen, Nettolohnvereinbarungen, Geschenke, Mitarbeiterrabatte, betriebliche Altersversorgung, Minijobs, Gesellschafter-Geschäftsführer und die Abgrenzung von Arbeitnehmern zu Selbstständigen.

2. Prüfungsanordnung
Eine reguläre Lohnsteuer-Außenprüfung wird schriftlich oder elektronisch angeordnet. Die Prüfungsanordnung bezeichnet regelmäßig:
- den zu prüfenden Arbeitgeber,
- die Steuerarten,
- den Prüfungszeitraum,
- den Umfang der Prüfung,
- den voraussichtlichen Prüfungsbeginn.

Der Prüfungszeitraum umfasst in der Praxis häufig die letzten drei abgeschlossenen Kalenderjahre, kann im Einzelfall aber abweichen. Der Name des Prüfers und der geplante Beginn sollen rechtzeitig bekannt gegeben werden, soweit der Prüfungszweck dadurch nicht gefährdet wird.

Die Prüfungsanordnung ist ein Verwaltungsakt. Gegen sie kann Einspruch eingelegt werden. Ein Einspruch hemmt den Prüfungsbeginn jedoch nicht automatisch; hierfür ist gegebenenfalls zusätzlich die Aussetzung der Vollziehung zu beantragen.

3. Vorabanforderung von Unterlagen
Das Finanzamt kann bereits mit oder nach Bekanntgabe der Prüfungsanordnung aufzeichnungs- und aufbewahrungspflichtige Unterlagen anfordern. Nach deren Auswertung können Prüfungsschwerpunkte mitgeteilt werden.

Die Mitteilung von Prüfungsschwerpunkten begrenzt die Prüfung nicht. Der Prüfer darf weitere Sachverhalte untersuchen, wenn sich hierfür Anhaltspunkte ergeben.

4. Verlegung des Prüfungsbeginns
Der Arbeitgeber kann eine Verlegung beantragen, wenn wichtige Gründe vorliegen, zum Beispiel:
- Erkrankung einer unverzichtbaren Auskunftsperson,
- Erkrankung des steuerlichen Beraters,
- außergewöhnliche betriebliche Belastungen,
- Umbau, Hochwasser oder andere erhebliche Betriebsstörungen,
- fehlende Verfügbarkeit zwingend benötigter Unterlagen.

Die Gründe sollten möglichst früh, konkret und nachvollziehbar dargelegt werden. Ein Anspruch auf Verlegung besteht nicht in jedem Fall; die Finanzbehörde entscheidet nach pflichtgemäßem Ermessen.

5. Vorbereitung der Prüfung
Vor Prüfungsbeginn sollten insbesondere abgestimmt werden:
- verantwortliche Ansprechpartner,
- Zugriff auf Lohnabrechnungs- und Finanzbuchhaltungsdaten,
- Bereitstellung eines Arbeitsplatzes oder digitaler Datenräume,
- Vollständigkeit der Lohnkonten und Personalstammdaten,
- Abstimmung der Lohnsteuer-Anmeldungen mit Finanzbuchhaltung und Zahlungen,
- Dokumentation steuerfreier und pauschal versteuerter Leistungen,
- Verträge, Richtlinien und Einzelvereinbarungen,
- offene Korrekturen und freiwillige Berichtigungen.

Sinnvoll ist ein Vorab-Abgleich zwischen Lohnbuchhaltung, Finanzbuchhaltung und Jahresabschluss. Häufig entstehen Prüfungsfeststellungen, weil lohnsteuerlich relevante Sachverhalte nur in der Finanzbuchhaltung erfasst wurden.

6. Mitwirkungspflichten
Der Arbeitgeber muss insbesondere:
- Auskünfte erteilen,
- Aufzeichnungen, Bücher, Geschäftspapiere und sonstige Unterlagen vorlegen,
- elektronische Daten in auswertbarer Form bereitstellen,
- den Prüfer bei der Sachverhaltsaufklärung unterstützen,
- den Zugang zu betrieblichen Räumen ermöglichen, soweit dies für die Prüfung erforderlich ist.

Die Mitwirkungspflicht bedeutet nicht, dass ungeprüft jede rechtliche Würdigung des Prüfers übernommen werden muss. Tatsachen sollten vollständig und wahrheitsgemäß mitgeteilt, Rechtsfragen dagegen sauber dokumentiert und gegebenenfalls mit dem steuerlichen Berater abgestimmt werden.

7. Datenzugriff und digitale Prüfung
Bei digital geführten Lohnkonten und Entgeltunterlagen kann die Finanzverwaltung Datenzugriff verlangen. Die Daten müssen vollständig, lesbar und maschinell auswertbar sein. Reine PDF-Ausdrucke können unzureichend sein, wenn die zugrunde liegenden strukturierten Daten aufbewahrungspflichtig sind.

Zu prüfen ist insbesondere, ob:
- Abrechnungsdaten für den gesamten Prüfungszeitraum vorhanden sind,
- Systemwechsel dokumentiert wurden,
- Bewegungs-, Stamm- und Protokolldaten vollständig exportierbar sind,
- nachträgliche Änderungen nachvollzogen werden können,
- Zugriffsrechte datenschutzgerecht eingerichtet sind.

8. Prüfung zugunsten des Arbeitgebers und Arbeitnehmers
Der Prüfer muss auch entlastende Umstände berücksichtigen. Ergeben sich beispielsweise zu hohe Steuerabzüge oder fehlerhafte Pauschalierungen zulasten des Arbeitgebers, sind auch diese Feststellungen einzubeziehen.

Eine Erstattung an einzelne Arbeitnehmer erfolgt jedoch nicht automatisch über jede Prüfungsfeststellung. Je nach Sachverhalt können Korrekturen im Lohnsteuerabzugsverfahren, geänderte Lohnsteuerbescheinigungen oder die Einkommensteuerveranlagung des Arbeitnehmers erforderlich sein.

9. Abschluss der Außenprüfung
Vor Abschluss findet regelmäßig eine Schlussbesprechung statt, sofern darauf nicht verzichtet wird und sich Feststellungen ergeben. Dort werden Sachverhalte, rechtliche Würdigungen und steuerliche Folgen erörtert.

Anschließend erstellt das Finanzamt grundsätzlich einen Prüfungsbericht. Darin werden die wesentlichen Feststellungen und deren steuerliche Auswirkungen dargestellt. Der Bericht selbst setzt noch keine Steuer fest. Die Umsetzung erfolgt regelmäßig durch:
- geänderte Lohnsteuer-Anmeldungen,
- Nachforderungsbescheide,
- Haftungsbescheide gegen den Arbeitgeber,
- geänderte Steuerfestsetzungen oder sonstige Folgebescheide.

10. Haftung und Nachforderung
Der Arbeitgeber haftet grundsätzlich für Lohnsteuer, die er einzubehalten und abzuführen hatte. Je nach Sachverhalt kann das Finanzamt die Steuer beim Arbeitgeber oder beim Arbeitnehmer anfordern.

Bei einer Vielzahl gleichartiger Fälle kann eine pauschale Nachversteuerung in Betracht kommen. Vor einer Zustimmung sollten Bemessungsgrundlage, Steuersatz, Kirchensteuer, Solidaritätszuschlag, betroffene Arbeitnehmer und sozialversicherungsrechtliche Folgen sorgfältig geprüft werden.

Neben der Steuer können entstehen:
- Säumniszuschläge,
- Zinsen, soweit gesetzlich vorgesehen,
- Verspätungszuschläge,
- Geldbußen oder steuerstrafrechtliche Folgen bei vorsätzlichen oder leichtfertigen Verstößen.

11. Lohnsteuer-Nachschau
Die Lohnsteuer-Nachschau nach § 42g EStG ist keine reguläre Außenprüfung. Sie dient der zeitnahen Aufklärung steuerlich relevanter Sachverhalte und kann ohne vorherige Prüfungsanordnung während der üblichen Geschäfts- und Arbeitszeiten stattfinden.

Die Beauftragten dürfen betriebliche Grundstücke und Räume betreten. Wohnräume dürfen gegen den Willen des Inhabers nur unter den engen gesetzlichen Voraussetzungen betreten werden. Der Arbeitgeber muss lohnsteuerlich relevante Unterlagen vorlegen und Auskünfte erteilen.

Ergeben sich während der Nachschau entsprechende Feststellungen, kann unmittelbar zu einer Lohnsteuer-Außenprüfung übergegangen werden. Auf diesen Übergang ist schriftlich hinzuweisen.

12. Abgrenzung zur Sozialversicherungsprüfung
Lohnsteuer-Außenprüfung und Betriebsprüfung der Deutschen Rentenversicherung sind eigenständige Verfahren. Ein lohnsteuerliches Ergebnis bindet die Sozialversicherung nicht automatisch und umgekehrt.

Besonders bei Scheinselbstständigkeit, Sachbezügen, Reisekosten, Beitragsfreiheit und Pauschalierungen können steuer- und sozialversicherungsrechtliche Ergebnisse voneinander abweichen. Feststellungen sollten deshalb stets für beide Rechtsgebiete geprüft werden.

Praxischeck vor Prüfungsbeginn
- Prüfungsanordnung und Zeitraum geprüft?
- Einspruchs- oder Verlegungsbedarf geklärt?
- Ansprechpartner und Berater eingebunden?
- Lohnkonten vollständig und mit Finanzbuchhaltung abgestimmt?
- Lohnsteuer-Anmeldungen, Zahlungen und Bescheinigungen abgeglichen?
- Verträge und Nachweise zu Sachbezügen, Reisekosten und Pauschalierungen vorhanden?
- Digitale Daten vollständig exportierbar?
- Offene Fehler vor Prüfungsbeginn bewertet und gegebenenfalls berichtigt?
- Mögliche Sozialversicherungsfolgen mitgedacht?

Typische Fehler
- Prüfungsschwerpunkte werden irrtümlich als verbindliche Begrenzung der Prüfung verstanden.
- Lohnbuchhaltung und Finanzbuchhaltung werden nicht miteinander abgestimmt.
- Steuerfreie Leistungen sind nicht ausreichend dokumentiert.
- Firmenwagen, Mahlzeiten oder Betriebsveranstaltungen werden unvollständig erfasst.
- Externe Kräfte werden ohne Prüfung als Selbstständige behandelt.
- Digitale Lohndaten können nach einem Systemwechsel nicht mehr vollständig bereitgestellt werden.
- Einer pauschalen Nachversteuerung wird zugestimmt, ohne deren Nebenfolgen zu prüfen.
- Lohnsteuerliche Feststellungen werden ungeprüft auf die Sozialversicherung übertragen.`
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerAussenpruefung.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerAussenpruefung);
}
