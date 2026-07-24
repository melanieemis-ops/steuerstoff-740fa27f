import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-gesetzliche-erbfolge";
import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const aufbewahrungspflichtenAo: KBEntry = {
  id: "aufbewahrungspflichten-aufbewahrungsfristen-ao",
  title: "Aufbewahrungspflichten und Aufbewahrungsfristen",
  short:
    "Welche Unterlagen 10, 8, 6 oder 2 Jahre aufzubewahren sind und welche GoBD-Anforderungen für digitale Archive gelten.",
  category: "AO / Verfahrensrecht",
  source:
    "Zusammenfassung nach §§ 140–148 AO, § 257 HGB, § 14b UStG und den GoBD; Rechtsstand Juli 2026.",
  keywords:
    "aufbewahrungspflicht|aufbewahrungsfrist|§ 147 ao|§ 147a ao|§ 257 hgb|§ 14b ustg|gobd|buchungsbeleg|buchungsbelege|rechnung aufbewahren|kontoauszug aufbewahren|geschaeftsbrief|geschäftsbrief|e-mail archivieren|email archivieren|digitales archiv|ersetzendes scannen|verfahrensdokumentation|cloud aufbewahrung|systemwechsel|datenzugriff|betriebspruefung|betriebsprüfung|10 jahre|8 jahre|6 jahre|2 jahre",
  references: [
    "§ 147 AO",
    "§ 147a AO",
    "§§ 140 bis 148 AO",
    "§ 257 HGB",
    "§ 14b UStG",
    "GoBD, BMF-Schreiben vom 28.11.2019, IV A 4 – S 0316/19/10003:001",
  ],
  type: "praxis",
  importance: 5,
  body: `Aufbewahrungspflichten sichern, dass Geschäftsvorfälle auch Jahre später nachvollzogen und geprüft werden können. Wer aufbewahrungspflichtige Unterlagen zu früh vernichtet, unvollständig archiviert oder digital nicht mehr auswertbar vorhält, riskiert Hinzuschätzungen, Bußgelder, steuerstrafrechtliche Folgen und Probleme bei Außenprüfungen.

1. Wer ist aufbewahrungspflichtig?
- Handelsrechtlich insbesondere Kaufleute nach § 257 HGB.
- Steuerrechtlich alle Personen, die nach §§ 140 ff. AO oder nach Einzelsteuergesetzen Bücher und Aufzeichnungen führen müssen. Dazu gehören auch viele Einnahmenüberschussrechner und Freiberufler.
- Privatpersonen müssen Rechnungen und Zahlungsnachweise über grundstücksbezogene Werklieferungen oder sonstige Leistungen grundsätzlich zwei Jahre aufbewahren (§ 14b UStG).
- Bei hohen positiven Überschusseinkünften gilt § 147a AO. Im Jahr 2026 liegt die Grenze noch bei mehr als 500.000 EUR; ab 1.1.2027 steigt sie auf 750.000 EUR.

2. Regelmäßige Aufbewahrungsfristen
10 Jahre:
- Bücher und Aufzeichnungen
- Inventare
- Eröffnungsbilanzen
- Jahresabschlüsse und Lageberichte
- Arbeitsanweisungen und Organisationsunterlagen, die zum Verständnis der Buchführung erforderlich sind

8 Jahre:
- Buchungsbelege, insbesondere Rechnungen, Kontoauszüge, Kassenbelege und sonstige Kostenbelege

6 Jahre:
- empfangene und abgesandte Handels- oder Geschäftsbriefe
- sonstige Unterlagen, soweit sie für die Besteuerung von Bedeutung sind

2 Jahre:
- bei Privatpersonen Rechnungen und Zahlungsnachweise über steuerpflichtige Leistungen im Zusammenhang mit einem Grundstück

Die Frist endet nicht, solange die Unterlagen noch für Steuern von Bedeutung sind, deren Festsetzungsfrist nicht abgelaufen ist. Auch laufende Prüfungen, Einsprüche oder steuerstrafrechtliche Verfahren können deshalb eine längere Aufbewahrung erforderlich machen.

3. Beginn der Frist
Die Frist beginnt mit Ablauf des Kalenderjahres, in dem die letzte Eintragung vorgenommen, der Abschluss festgestellt, der Geschäftsbrief empfangen oder versandt oder der Buchungsbeleg entstanden ist.

Beispiel:
Eine Rechnung aus März 2025 wird grundsätzlich ab dem 31.12.2025 berechnet. Bei einer achtjährigen Frist ist sie regelmäßig bis zum 31.12.2033 aufzubewahren.

4. Elektronische Aufbewahrung und GoBD
- Elektronisch empfangene Unterlagen sind grundsätzlich elektronisch und im Ursprungsformat aufzubewahren.
- Originär digitale Rechnungen, Kontoauszüge, E-Mails, EDI-Daten und andere Dateien dürfen nicht lediglich ausgedruckt und anschließend gelöscht werden.
- Die Daten müssen vollständig, unveränderbar, auffindbar, lesbar und maschinell auswertbar bleiben.
- Formatumwandlungen sind nur zulässig, wenn keine Inhalte oder auswertbaren Informationen verloren gehen und der Vorgang dokumentiert wird.
- Werden gescannte Unterlagen durch OCR um Volltextinformationen ergänzt, sind auch diese Informationen während der Aufbewahrungsfrist vorzuhalten.

5. Scannen und ersetzendes Scannen
Das Scanverfahren muss in einer Verfahrensdokumentation beschrieben sein. Sie sollte insbesondere regeln:
- wer scannen darf,
- wann gescannt wird,
- welche Unterlagen erfasst werden,
- wie Lesbarkeit und Vollständigkeit kontrolliert werden,
- wie Fehler behandelt und Änderungen verhindert werden.

Papierbelege dürfen nach ordnungsgemäßem Scannen grundsätzlich vernichtet werden, soweit keine gesetzliche Pflicht zur Aufbewahrung des Originals besteht.

6. Cloud, Systemwechsel und Datenzugriff
- Eine Aufbewahrung in der Cloud ist möglich, wenn GoBD, Datenschutz, Verfügbarkeit und Datenzugriff gewährleistet sind.
- Bei Aufbewahrung außerhalb der EU bzw. des EWR können besondere steuerliche Genehmigungen erforderlich sein.
- Nach einem Systemwechsel müssen die Daten vollständig, maschinell auswertbar und prüfbar bleiben. Reine PDF-Reports oder Druckdateien reichen regelmäßig nicht aus.
- Die Finanzverwaltung kann im Rahmen von Außenprüfungen auf aufbewahrungspflichtige digitale Daten zugreifen (§ 147 Abs. 6 AO).

Praxischeckliste
- Unterlagenart und passende Frist bestimmt?
- Fristbeginn zum Jahresende korrekt berechnet?
- Festsetzungsfrist, Einsprüche und laufende Prüfungen berücksichtigt?
- Originär digitale Unterlagen im Ursprungsformat archiviert?
- Unveränderbarkeit, Lesbarkeit und maschinelle Auswertbarkeit sichergestellt?
- Verfahrensdokumentation aktuell und versioniert?
- Scanprozess und Vernichtung von Papierbelegen dokumentiert?
- Bei Cloud- oder Auslandsaufbewahrung Zugriffsrechte und Genehmigungen geprüft?
- Bei Systemwechsel vollständige Migration und Auswertbarkeit getestet?

Typische Fehler
- Buchungsbelege zu früh vernichtet.
- Frist ab Belegdatum statt ab Ende des Kalenderjahres berechnet.
- Elektronische Rechnung nur ausgedruckt und Originaldatei gelöscht.
- E-Mails mit Geschäfts- oder Buchungsbezug nicht archiviert.
- Verfahrensdokumentation fehlt oder entspricht nicht dem tatsächlichen Ablauf.
- Nach einem Systemwechsel nur PDF-Reports statt auswertbarer Originaldaten vorgehalten.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === aufbewahrungspflichtenAo.id)) {
  KNOWLEDGE_BASE.push(aufbewahrungspflichtenAo);
}
