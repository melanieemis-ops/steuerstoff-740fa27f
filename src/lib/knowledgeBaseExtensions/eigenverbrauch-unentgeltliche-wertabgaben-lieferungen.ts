import "@/lib/knowledgeBaseExtensions/lohnsteuer-elektronische-lohnsteuerbescheinigung";
import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const eigenverbrauchUnentgeltlicheWertabgabenLieferungen: KBEntry = {
  id: "eigenverbrauch-unentgeltliche-wertabgaben-lieferungen",
  title: "Unentgeltliche Wertabgaben: Lieferungen",
  short:
    "Wann Entnahmen und unentgeltliche Zuwendungen von Gegenständen der Umsatzsteuer unterliegen – mit Vorsteuerprüfung, Bemessungsgrundlage und Praxisfällen.",
  category: "Eigenverbrauch",
  type: "praxis",
  source:
    "Zusammenfassung nach § 3 Abs. 1b UStG, § 10 Abs. 4 Satz 1 Nr. 1 UStG sowie Abschn. 3.3 und 10.6 UStAE; Rechtsstand Juli 2026.",
  keywords:
    "unentgeltliche wertabgabe lieferung|eigenverbrauch umsatzsteuer|entnahme gegenstand|§ 3 abs. 1b ustg|§ 10 abs. 4 ustg|sachentnahme|privatentnahme umsatzsteuer|zuwendung personal|geschenk geschäftsfreund|geschenk 50 euro|warenmuster|vorsteuerabzug wertabgabe|bemessungsgrundlage wiederbeschaffungspreis|selbstkosten|sachspende|tombola|verlosung|unternehmensvermögen zuordnung",
  references: [
    "§ 3 Abs. 1b UStG",
    "§ 10 Abs. 4 Satz 1 Nr. 1 UStG",
    "§ 15 Abs. 1a UStG",
    "§ 15a UStG",
    "Abschn. 3.3 UStAE",
    "Abschn. 10.6 UStAE",
  ],
  importance: 5,
  body: `Unentgeltliche Wertabgaben in Form von Lieferungen werden bestimmten entgeltlichen Lieferungen gleichgestellt. Dadurch soll verhindert werden, dass ein Gegenstand zunächst mit Vorsteuerabzug in das Unternehmen gelangt und anschließend unversteuert privat verbraucht oder verschenkt wird.

1. Die drei Fälle des § 3 Abs. 1b UStG
Eine steuerbare unentgeltliche Wertabgabe kann vorliegen bei:
- Entnahme eines Unternehmensgegenstands für außerunternehmerische Zwecke, § 3 Abs. 1b Satz 1 Nr. 1 UStG,
- unentgeltlicher Zuwendung eines Gegenstands an Arbeitnehmer für deren privaten Bedarf, soweit keine Aufmerksamkeit vorliegt, § 3 Abs. 1b Satz 1 Nr. 2 UStG,
- jeder anderen unentgeltlichen Zuwendung eines Gegenstands, insbesondere an Kunden oder Geschäftsfreunde, soweit kein Geschenk von geringem Wert und kein Warenmuster für Unternehmenszwecke vorliegt, § 3 Abs. 1b Satz 1 Nr. 3 UStG.

2. Zentrale Voraussetzung: vorheriger Vorsteuerabzug
Eine Wertabgabe wird nur besteuert, wenn der Gegenstand oder seine Bestandteile beim Bezug zum vollen oder teilweisen Vorsteuerabzug berechtigt haben.

Keine Wertabgabenbesteuerung erfolgt insbesondere, wenn:
- der Gegenstand von einer Privatperson erworben wurde,
- der Gegenstand aus dem Privatvermögen eingelegt wurde,
- der Bezug steuerfrei oder vom Vorsteuerabzug ausgeschlossen war,
- der Unternehmer selbst keine zum Vorsteuerabzug berechtigenden Umsätze ausführt,
- bereits beim Erwerb feststand, dass der Gegenstand ausschließlich unentgeltlich abgegeben werden soll und deshalb von Anfang an kein Vorsteuerabzug zulässig war.

Merksatz: Kein Vorsteuerabzug beim Bezug bedeutet grundsätzlich keine Umsatzsteuer auf die spätere unentgeltliche Abgabe.

3. Entnahme für private oder andere außerunternehmerische Zwecke
Wird ein dem Unternehmen zugeordneter Gegenstand dauerhaft für private Zwecke entnommen, liegt grundsätzlich eine steuerbare Wertabgabe vor. Voraussetzung ist, dass der Gegenstand zuvor dem umsatzsteuerlichen Unternehmen zugeordnet war.

Bei gemischt genutzten Gegenständen ist die dokumentierte Zuordnungsentscheidung entscheidend. Laufende Vorsteuerbeträge, etwa aus Kraftstoff oder Reparaturen eines Pkw, beweisen für sich allein noch nicht die Zuordnung des Fahrzeugs zum Unternehmen.

Keine Entnahme liegt vor, wenn ein Gegenstand ohne Entnahmewillen untergeht oder zerstört wird, etwa durch einen Unfall. Eine spätere Veräußerung oder Entnahme eines vollständig dem Unternehmen zugeordneten Gegenstands kann jedoch umsatzsteuerpflichtig sein.

4. Zuwendungen an Arbeitnehmer
Unentgeltliche Sachzuwendungen an Arbeitnehmer für deren privaten Bedarf sind grundsätzlich steuerbar, wenn beim Bezug ein Vorsteuerabzug möglich war.

Nicht besteuert werden insbesondere:
- Aufmerksamkeiten bis 60 EUR aus Anlass eines besonderen persönlichen Ereignisses,
- Zuwendungen im überwiegenden betrieblichen Interesse,
- Arbeitsmittel oder typische Berufskleidung, deren private Nutzung praktisch ausgeschlossen ist.

Beispiel:
Ein Arbeitgeber schenkt einem Arbeitnehmer zur Hochzeit einen Gegenstand, der netto 500 EUR gekostet hat. War der Vorsteuerabzug zulässig, ist grundsätzlich eine Wertabgabe aus dem maßgeblichen Einkaufspreis zu versteuern. Stand die ausschließliche Schenkungsabsicht dagegen bereits beim Erwerb fest, kann schon der Vorsteuerabzug ausgeschlossen sein; dann entfällt auch die Wertabgabenbesteuerung.

5. Geschenke, Warenmuster und Werbezuwendungen
Andere unentgeltliche Zuwendungen aus unternehmerischem Anlass können ebenfalls steuerbar sein, etwa:
- höherwertige Geschenke an Geschäftsfreunde,
- Sachspenden,
- Gegenstände für Tombolas, Verlosungen oder Preisausschreiben,
- Werbeartikel, die beim Empfänger einen bleibenden Gebrauchswert haben.

Nicht steuerbar sind insbesondere:
- Geschenke von geringem Wert bis insgesamt 50 EUR netto je Empfänger und Kalenderjahr,
- Warenmuster für Zwecke des Unternehmens unabhängig von ihrem Wert,
- reine Werbe- und Dekorationsmittel ohne bleibende private Bereicherung,
- Gegenstände, die nur vorübergehend überlassen und anschließend zurückgegeben werden müssen.

Wichtig: Überschreiten Geschenke an einen Nichtarbeitnehmer die 50-EUR-Freigrenze, ist regelmäßig bereits der Vorsteuerabzug ausgeschlossen. Fehlt deshalb der Vorsteuerabzug, entsteht später auch keine Wertabgabensteuer.

6. Bemessungsgrundlage
Für die Umsatzsteuer ist grundsätzlich anzusetzen:
- der Einkaufspreis zuzüglich Nebenkosten für den Gegenstand oder einen gleichartigen Gegenstand im Zeitpunkt der Entnahme oder Zuwendung,
- regelmäßig also der aktuelle Wiederbeschaffungspreis auf der Handelsstufe des Unternehmers,
- ersatzweise die Selbstkosten, wenn kein vergleichbarer Einkaufspreis ermittelt werden kann.

Maßgebend sind nicht automatisch die historischen Anschaffungskosten. Bei verbrauchten oder im Wert gesunkenen Gegenständen ist der Wert im Zeitpunkt der Entnahme oder Zuwendung entscheidend.

7. Scheinbar unentgeltliche Abgaben
Liegt eine Gegenleistung des Empfängers vor, handelt es sich nicht um eine unentgeltliche Wertabgabe, sondern um eine entgeltliche Lieferung. Beispiele:
- Zugaben wie „11 Stück zum Preis von 10“,
- Sachprämien für die Vermittlung neuer Kunden,
- kostenlose Mobiltelefone im Zusammenhang mit einem entgeltlichen Mobilfunkvertrag,
- Prämien für besondere Verkaufserfolge.

8. Verbilligte Abgabe
Wird ein Gegenstand verbilligt verkauft, liegt grundsätzlich eine entgeltliche Lieferung vor. Bei Leistungen an Angehörige oder Arbeitnehmer kann die Mindestbemessungsgrundlage nach § 10 Abs. 5 UStG eingreifen. Bei fremden Dritten ist grundsätzlich das tatsächlich vereinbarte Entgelt maßgebend, soweit kein Missbrauch oder verdeckter Leistungsaustausch vorliegt.

9. Grundstücke und Gebäude
Die Entnahme eines betrieblichen Grundstücks kann umsatzsteuerfrei sein. Innerhalb des zehnjährigen Vorsteuerberichtigungszeitraums kann eine steuerfreie Entnahme jedoch eine Vorsteuerberichtigung nach § 15a UStG auslösen. Bei Grundstücksübertragungen ist außerdem zu prüfen, ob eine nicht steuerbare Geschäftsveräußerung im Ganzen vorliegt.

Praxischeck
- Wurde der Gegenstand dem umsatzsteuerlichen Unternehmen wirksam zugeordnet?
- War beim Erwerb ein voller oder teilweiser Vorsteuerabzug möglich?
- Handelt es sich um Entnahme, Personalzuwendung oder sonstige Zuwendung?
- Liegt eine Aufmerksamkeit, ein Warenmuster oder ein Geschenk bis 50 EUR vor?
- Bestand die unentgeltliche Abgabeabsicht bereits beim Einkauf?
- Gibt es tatsächlich eine Gegenleistung und damit eine entgeltliche Lieferung?
- Welcher Wiederbeschaffungspreis gilt im Zeitpunkt der Abgabe?
- Ist bei Gebäuden eine Vorsteuerberichtigung nach § 15a UStG zu prüfen?

Typische Fehler
- Umsatzsteuer wird berechnet, obwohl beim Bezug kein Vorsteuerabzug möglich war.
- Historische Anschaffungskosten werden statt des aktuellen Einkaufspreises angesetzt.
- Geschenke werden nicht je Empfänger und Kalenderjahr zusammengerechnet.
- Warenmuster werden mit normalen Werbegeschenken verwechselt.
- Eine Gegenleistung des Empfängers wird übersehen.
- Die Zuordnung eines gemischt genutzten Gegenstands zum Unternehmen ist nicht dokumentiert.
- Bei Grundstücksentnahmen wird die Vorsteuerberichtigung nach § 15a UStG übersehen.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === eigenverbrauchUnentgeltlicheWertabgabenLieferungen.id)) {
  KNOWLEDGE_BASE.push(eigenverbrauchUnentgeltlicheWertabgabenLieferungen);
}
