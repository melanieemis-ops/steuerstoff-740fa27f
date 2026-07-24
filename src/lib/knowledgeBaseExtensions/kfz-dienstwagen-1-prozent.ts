import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const kfzDienstwagenEinProzent: KBEntry = {
  id: "kfz-dienstwagen-1-prozent-regelung",
  title: "Dienstwagen: 1-%-Regelung",
  short:
    "Bewertung der privaten Dienstwagennutzung, Fahrten zur ersten Tätigkeitsstätte, Nutzungsentgelte sowie Besonderheiten für Elektro- und Hybridfahrzeuge.",
  category: "Kfz",
  type: "praxis",
  importance: 5,
  source:
    "Zusammenfassung nach § 8 Abs. 2 EStG, § 6 Abs. 1 Nr. 4 EStG, R 8.1 LStR und den BMF-Schreiben zur Dienstwagenbesteuerung; Rechtsstand Juli 2026.",
  keywords:
    "dienstwagen|firmenwagen|1 prozent regelung|1-%-regelung|geldwerter vorteil kfz|bruttolistenpreis|0,03 prozent|0,002 prozent|erste tätigkeitsstätte|fahrtenbuch|nutzungsentgelt|zuzahlung arbeitnehmer|elektro dienstwagen|0,25 prozent regelung|0,5 prozent regelung|hybrid dienstwagen|familienheimfahrt|kostendeckelung|leasingfahrzeug|gebrauchtwagen dienstwagen",
  references: [
    "§ 8 Abs. 2 Sätze 2 bis 5 EStG",
    "§ 6 Abs. 1 Nr. 4 Satz 2 EStG",
    "R 8.1 Abs. 9 und 10 LStR",
    "BMF-Schreiben vom 03.03.2022, IV C 5 – S 2334/21/10004 :001",
    "BMF-Schreiben vom 05.11.2021 zur Elektromobilität, zuletzt angepasst",
    "§ 14 Abs. 1 SGB IV und § 3 SvEV",
  ],
  body: `Überlässt der Arbeitgeber einem Arbeitnehmer ein betriebliches Kraftfahrzeug auch zur privaten Nutzung, entsteht grundsätzlich steuer- und sozialversicherungspflichtiger Arbeitslohn. Der private Nutzungswert kann entweder pauschal nach der 1-%-Regelung oder nach der Fahrtenbuchmethode ermittelt werden.

1. Grundberechnung der Privatnutzung
Der monatliche geldwerte Vorteil beträgt 1 % des inländischen Bruttolistenpreises im Zeitpunkt der Erstzulassung. Maßgebend ist die unverbindliche Preisempfehlung des Herstellers einschließlich Umsatzsteuer und werkseitiger Sonderausstattung. Der Listenpreis wird auf volle 100 EUR abgerundet.

Die tatsächlichen Anschaffungskosten, Rabatte, der Zeitwert oder der Kaufpreis eines Gebrauchtwagens sind unerheblich. Die Regelung gilt auch für Leasingfahrzeuge und reimportierte Fahrzeuge; fehlt ein inländischer Listenpreis, ist ein typischer inländischer Endverkaufspreis zu schätzen.

Zum Bruttolistenpreis gehören insbesondere werkseitig eingebaute Sonderausstattungen wie Navigationsgerät, Klimaanlage oder Anhängerkupplung. Nicht einzubeziehen sind regelmäßig Zulassungs- und Überführungskosten, Autotelefon sowie erst nach der Erstzulassung eingebaute Ausstattungen.

Beispiel:
Bruttolistenpreis 42.780 EUR, abgerundet 42.700 EUR. Privatnutzung: 1 % = 427 EUR monatlicher geldwerter Vorteil.

2. Fahrten zwischen Wohnung und erster Tätigkeitsstätte
Zusätzlich zur Privatnutzung ist regelmäßig anzusetzen:
- monatlich 0,03 % des Listenpreises je Entfernungskilometer oder
- bei tatsächlicher Einzelbewertung 0,002 % je Entfernungskilometer und tatsächlichem Fahrtag.

Die 0,002-%-Methode ist besonders bei wenigen Bürofahrten oder viel Homeoffice vorteilhaft. Der Arbeitnehmer muss die tatsächlichen Fahrtage kalendermonatlich erklären; im Lohnsteuerabzug ist die Einzelbewertung auf 180 Fahrten im Kalenderjahr begrenzt.

Der Arbeitgeber kann den auf Fahrten zwischen Wohnung und erster Tätigkeitsstätte entfallenden Vorteil im Rahmen der gesetzlichen Grenzen mit 15 % pauschal versteuern. Der pauschal versteuerte Teil ist grundsätzlich sozialversicherungsfrei und mindert die abziehbare Entfernungspauschale.

3. Fahrtenbuchmethode
Alternativ können die tatsächlichen Gesamtkosten des Fahrzeugs nach dem Verhältnis der privat und beruflich gefahrenen Kilometer aufgeteilt werden. Voraussetzung sind ein ordnungsgemäßes, zeitnah und geschlossen geführtes Fahrtenbuch sowie vollständige Kostenbelege. Ein Wechsel zwischen 1-%-Regelung und Fahrtenbuchmethode ist für dasselbe Fahrzeug während des Kalenderjahres grundsätzlich nicht beliebig möglich.

4. Nutzungsentgelte und Zuzahlungen
Ein arbeitsvertraglich vereinbartes und tatsächlich gezahltes Nutzungsentgelt des Arbeitnehmers mindert den geldwerten Vorteil bis höchstens auf 0 EUR. Dazu können auch vom Arbeitnehmer übernommene laufende Fahrzeugkosten, etwa Benzinkosten, gehören, wenn die Übernahme arbeitsvertraglich vereinbart und nachgewiesen ist. Ein negativer Arbeitslohn entsteht nicht.

Einmalige Zuzahlungen zu den Anschaffungskosten können nach den steuerlichen Vorgaben auf den Nutzungswert angerechnet werden. Die Vereinbarung, Zahlung und Verrechnung müssen dokumentiert werden.

5. Kostendeckelung
Übersteigt der pauschal ermittelte Nutzungswert die gesamten, vom Arbeitgeber getragenen Fahrzeugkosten, kann der Vorteil bei entsprechendem Nachweis auf die Gesamtkosten begrenzt werden.

6. Elektro- und Hybridelektrofahrzeuge
Für begünstigte Fahrzeuge wird nicht der volle Bruttolistenpreis angesetzt:
- Reine Elektrofahrzeuge können mit einem Viertel des Listenpreises bewertet werden. Für nach dem 30.06.2025 und bis 2030 angeschaffte oder geleaste Fahrzeuge gilt dies bei einem Bruttolistenpreis von höchstens 100.000 EUR.
- Liegt der Listenpreis über der maßgeblichen Grenze, wird bei reinen Elektrofahrzeugen regelmäßig die Hälfte des Listenpreises angesetzt.
- Begünstigte Plug-in-Hybride werden regelmäßig mit der Hälfte des Listenpreises bewertet. Bei Anschaffung oder Leasing von 2025 bis 2030 muss das Fahrzeug höchstens 50 g CO₂ je Kilometer ausstoßen oder eine elektrische Mindestreichweite von 80 km erreichen.

Die ermäßigte Bemessungsgrundlage gilt auch für den Zuschlag für Fahrten zwischen Wohnung und erster Tätigkeitsstätte. Maßgeblich sind Anschaffungs- beziehungsweise Leasingzeitpunkt und die gesetzlichen Voraussetzungen des jeweiligen Zeitraums.

7. Familienheimfahrten
Eine wöchentliche Familienheimfahrt im Rahmen einer beruflich veranlassten doppelten Haushaltsführung führt grundsätzlich zu keinem zusätzlichen lohnsteuerlichen Nutzungswert. Für jede weitere Familienheimfahrt ist regelmäßig 0,002 % des Listenpreises je Entfernungskilometer anzusetzen.

8. Sozialversicherung
Steuerpflichtige geldwerte Vorteile aus Privatfahrten und Fahrten zur ersten Tätigkeitsstätte gehören grundsätzlich auch zum beitragspflichtigen Arbeitsentgelt. Soweit der Arbeitgeber den Vorteil für Fahrten zur ersten Tätigkeitsstätte wirksam mit 15 % pauschal versteuert, besteht regelmäßig Beitragsfreiheit.

Praxischeck
- Private Nutzung arbeitsvertraglich erlaubt oder wirksam ausgeschlossen?
- Inländischen Bruttolistenpreis bei Erstzulassung ermittelt und auf 100 EUR abgerundet?
- Werkseitige Sonderausstattung einbezogen?
- Erste Tätigkeitsstätte und einfache Entfernung dokumentiert?
- 0,03-%- oder 0,002-%-Methode festgelegt?
- Tatsächliche Fahrtage bei Einzelbewertung monatlich nachgewiesen?
- Nutzungsentgelte und Zuzahlungen schriftlich vereinbart und belegt?
- Voraussetzungen für Elektro- oder Hybridbegünstigung nachgewiesen?
- Pauschalversteuerung und Sozialversicherung korrekt abgestimmt?

Typische Fehler
- Tatsächlichen Kaufpreis statt Bruttolistenpreis verwendet.
- Gebrauchtwagen wegen des niedrigeren Zeitwerts zu niedrig bewertet.
- Nachträglich eingebaute Ausstattung dem Listenpreis zugerechnet.
- 0,002-%-Methode ohne Aufzeichnungen der tatsächlichen Fahrtage angewendet.
- Nutzungsentgelt nicht nachweisbar oder doppelt angerechnet.
- Viertelansatz für ein Elektrofahrzeug trotz Überschreitens der maßgeblichen Listenpreisgrenze angewendet.
- Plug-in-Hybrid ohne Nachweis der CO₂- oder Reichweitenvoraussetzungen begünstigt.
- Steuerpflichtigen Vorteil nicht in die Sozialversicherung einbezogen.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === kfzDienstwagenEinProzent.id)) {
  KNOWLEDGE_BASE.push(kfzDienstwagenEinProzent);
}
