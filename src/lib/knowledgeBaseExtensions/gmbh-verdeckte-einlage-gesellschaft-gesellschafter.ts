import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const gmbhVerdeckteEinlage: KBEntry = {
  id: "gmbh-verdeckte-einlage-gesellschaft-gesellschafter",
  title: "Verdeckte Einlage: Folgen bei GmbH und Gesellschafter",
  short:
    "Eine verdeckte Einlage liegt vor, wenn ein Gesellschafter oder eine nahestehende Person der GmbH aus gesellschaftsrechtlichen Gründen einen bilanzierungsfähigen Vermögensvorteil unentgeltlich oder verbilligt zuwendet. Sie darf das Einkommen der GmbH grundsätzlich nicht erhöhen und führt regelmäßig zu einem Zugang im steuerlichen Einlagekonto.",
  category: "GmbH",
  type: "praxis",
  taxType: "koerperschaftsteuer",
  subCase: "verdeckte-einlage",
  source:
    "Kompakte Zusammenfassung auf Grundlage von EStG, KStG, KStR, GmbHG und UmwStG; Rechtsstand 2026.",
  keywords:
    "verdeckte einlage|gmbh einlage|gesellschaftereinlage|steuerliches einlagekonto|forderungserlass|forderungsverzicht|darlehensverzicht|pensionsverzicht|rangrücktritt|rangruecktritt|teilwert|nachträgliche anschaffungskosten|nachtraegliche anschaffungskosten|§ 8 abs. 3 kstg|§ 27 kstg|§ 32a kstg|gesellschaftsebene|gesellschafterebene|nutzungsvorteil|zinsloses darlehen|disquotale einlage",
  references: [
    "§ 4 Abs. 1 und § 6 Abs. 1 Nr. 5 EStG",
    "§ 8 Abs. 1 und Abs. 3 Sätze 3 bis 6 KStG",
    "§ 27 KStG",
    "§ 32a Abs. 2 KStG",
    "§ 17 Abs. 2a EStG",
    "§ 5 Abs. 2a EStG",
    "R 8.9 KStR 2015",
  ],
  importance: 5,
  body: `Eine verdeckte Einlage liegt vor, wenn ein Gesellschafter oder eine ihm nahestehende Person der GmbH aus gesellschaftsrechtlichen Gründen einen einlagefähigen Vermögensvorteil unentgeltlich oder verbilligt zuwendet. Anders als bei einer offenen Einlage werden hierfür keine neuen Gesellschaftsrechte gewährt. [1]

Unterkategorie: GmbH

1. Voraussetzungen

Einlagefähig ist nur ein bilanzierungsfähiger Vermögensvorteil. Die Zuwendung muss bei der GmbH
- einen Aktivposten begründen oder erhöhen oder
- einen Passivposten mindern oder entfallen lassen.

Einlagefähig sind beispielsweise Grundstücke, Patente, Forderungsverzichte und andere übertragbare Wirtschaftsgüter. Nicht einlagefähig sind bloße Nutzungs- oder Leistungsvorteile, etwa
- unentgeltliche Dienstleistungen,
- verbilligte Nutzungsüberlassungen,
- der Zinsvorteil aus einem zinslosen oder niedrig verzinsten Darlehen.

Wird dagegen auf einen bereits entstandenen Anspruch verzichtet, kann eine verdeckte Einlage vorliegen.

2. Folgen bei der GmbH

Das zugewendete Wirtschaftsgut wird grundsätzlich mit dem Teilwert aktiviert. Bei abnutzbaren Wirtschaftsgütern richtet sich die weitere AfA nach dem steuerlich maßgebenden Einlagewert; Sonderregeln gelten, wenn das Wirtschaftsgut zuvor bereits zur Einkunftserzielung genutzt wurde. [1]

Ein handelsrechtlich erfasster Ertrag aus der Einlage wird bei der steuerlichen Einkommensermittlung grundsätzlich außerbilanziell neutralisiert. Verdeckte Einlagen dürfen das Einkommen der GmbH regelmäßig nicht erhöhen. [2]

Soweit die Einlage nicht dem Stammkapital zugeführt wird, ist sie grundsätzlich als Zugang im steuerlichen Einlagekonto nach § 27 KStG zu erfassen. Maßgebend ist der steuerliche Wert der Einlage.

Ausnahmen können sich aus dem materiellen Korrespondenzprinzip ergeben. Eine steuerfreie Korrektur bei der empfangenden GmbH kann insbesondere ausgeschlossen sein, wenn die korrespondierende Einkommensminderung oder verdeckte Gewinnausschüttung auf der anderen Seite steuerlich nicht berücksichtigt wurde. [2]

3. Folgen beim Gesellschafter

Die verdeckte Einlage ist beim Gesellschafter grundsätzlich keine sofort abzugsfähige Ausgabe. Sie erhöht jedoch regelmäßig die Anschaffungskosten seiner Beteiligung um den Teilwert der Einlage. Dies ist insbesondere für § 17 EStG und bei Beteiligungen im Betriebsvermögen relevant. [4]

Bei Einlagen durch lediglich nahestehende Personen entstehen beim Gesellschafter grundsätzlich keine nachträglichen Anschaffungskosten, weil es sich um Drittaufwand handelt.

4. Typische Fälle

Typische verdeckte Einlagen sind:
- unentgeltliche oder verbilligte Übertragung eines Wirtschaftsguts an die GmbH,
- überhöhter Kaufpreis, den die GmbH für ein Wirtschaftsgut des Gesellschafters erhält,
- gesellschaftsrechtlich veranlasster Forderungs- oder Darlehensverzicht,
- Verzicht auf bereits entstandene Miet-, Zins- oder Vergütungsansprüche,
- Rückzahlung einer zuvor erhaltenen verdeckten Gewinnausschüttung,
- Zuschuss zur Abdeckung eines Bilanzverlusts,
- Inanspruchnahme aus einer Bürgschaft mit anschließendem Verzicht auf die Regressforderung.

Die bloße Übernahme einer Bürgschaft ist noch keine verdeckte Einlage, weil der GmbH dadurch noch kein bilanzierungsfähiger Vermögensvorteil zufließt.

5. Forderungsverzicht

Beim gesellschaftsrechtlich veranlassten Forderungsverzicht entspricht die verdeckte Einlage nur dem Teilwert der Forderung im Zeitpunkt des Verzichts.

Beispiel:
Ein Gesellschafter verzichtet auf ein Darlehen von 50.000 EUR.
- Ist die Forderung voll werthaltig, beträgt die verdeckte Einlage 50.000 EUR. Der Ertrag aus der Ausbuchung der Verbindlichkeit wird steuerlich neutralisiert; das steuerliche Einlagekonto erhöht sich um 50.000 EUR.
- Ist die Forderung wertlos, beträgt die verdeckte Einlage 0 EUR. Der Ertrag aus dem Wegfall der Verbindlichkeit bleibt bei der GmbH grundsätzlich steuerpflichtig; auch im Einlagekonto entsteht kein Zugang.

Beim Verzicht auf bereits entstandene Vergütungs-, Miet- oder Pensionsansprüche kann beim Gesellschafter zugleich ein steuerlicher Zufluss in Höhe des werthaltigen Teils der Forderung entstehen.

6. Rangrücktritt und Pensionsverzicht

Ein Rangrücktritt ist vom Forderungsverzicht zu unterscheiden. Ein qualifizierter Rangrücktritt führt grundsätzlich nicht zur Ausbuchung der Verbindlichkeit. Bei einfachen Rangrücktritten mit Besserungsabrede ist § 5 Abs. 2a EStG zu prüfen. [5]

Der Verzicht eines Gesellschafter-Geschäftsführers auf eine werthaltige Pensionsanwartschaft führt regelmäßig zu einer verdeckten Einlage mit dem Teilwert des Anspruchs. Beim Gesellschafter kann zugleich Arbeitslohn zufließen. Ist der Anspruch wertlos, beträgt die verdeckte Einlage 0 EUR.

7. Bewertung

Verdeckte Einlagen werden grundsätzlich mit dem Teilwert bewertet. Abweichungen können sich insbesondere aus
- § 6 Abs. 1 Nr. 5 EStG,
- § 6 Abs. 6 EStG,
- § 17 EStG,
- § 23 EStG oder
- den Einbringungsregeln des § 20 UmwStG
ergeben.

Bei Einlagen von Grundstücken oder Kapitalgesellschaftsanteilen ist besonders zu prüfen, ob die Einlage beim Gesellschafter als fiktive Veräußerung gilt und stille Reserven bereits dort besteuert werden.

8. Schenkungsteuer

Eine gesellschaftsrechtlich veranlasste Einlage ist grundsätzlich keine Schenkung an die GmbH. Eine disquotale Einlage kann jedoch eine steuerpflichtige Werterhöhung der Anteile anderer Gesellschafter und damit eine Schenkung an die Mitgesellschafter auslösen.

Praxisprüfung:
1. Beruht die Zuwendung auf dem Gesellschaftsverhältnis?
2. Liegt ein bilanzierungsfähiger Vermögensvorteil vor?
3. Welchen Teilwert hat der Vorteil im Zeitpunkt der Einlage?
4. Muss ein Ertrag außerbilanziell neutralisiert werden?
5. Ist ein Zugang im steuerlichen Einlagekonto zu erfassen?
6. Entstehen nachträgliche Anschaffungskosten beim Gesellschafter?
7. Greift das materielle Korrespondenzprinzip?
8. Sind Schenkungsteuerfolgen für Mitgesellschafter möglich?

Merksatz:
Die verdeckte Einlage wird auf beiden Ebenen mit dem Teilwert geprüft: Bei der GmbH ist ein Ertrag grundsätzlich zu neutralisieren und im steuerlichen Einlagekonto zu erfassen; beim Gesellschafter entstehen regelmäßig nachträgliche Anschaffungskosten.

Quellenhinweise:
[1] § 4 Abs. 1 und § 6 Abs. 1 Nr. 5 EStG i. V. m. § 8 Abs. 1 KStG; R 8.9 KStR 2015.
[2] § 8 Abs. 3 Sätze 3 bis 6 KStG.
[3] § 27 KStG.
[4] § 17 Abs. 2a EStG.
[5] § 5 Abs. 2a EStG.

Rechtsstand: 2026.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === gmbhVerdeckteEinlage.id)) {
  KNOWLEDGE_BASE.push(gmbhVerdeckteEinlage);
}
