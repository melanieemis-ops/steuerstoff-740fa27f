import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf3bEstgZuschlaege: KBEntry = {
  id: "einkommensteuer-paragraf-3b-estg-sonntags-feiertags-nachtzuschlaege",
  title: "§ 3b EStG: Steuerfreie Zuschläge für Sonntags-, Feiertags- und Nachtarbeit",
  short:
    "§ 3b EStG regelt, unter welchen Voraussetzungen Zuschläge für tatsächlich geleistete Sonntags-, Feiertags- oder Nachtarbeit neben dem Grundlohn steuerfrei bleiben.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 3b",
  paragraphNumber: 3,
  source:
    "Zusammenfassung des vom Nutzer bereitgestellten Gesetzestextes zu § 3b EStG; Rechtsstand des bereitgestellten Materials vom 30.07.2026.",
  keywords:
    "§ 3b estg|sonntagszuschlag|feiertagszuschlag|nachtzuschlag|sf-zuschlag|steuerfreie zuschläge|nachtarbeit|sonntagsarbeit|feiertagsarbeit|grundlohn|stundenlohn|24. dezember|25. dezember|26. dezember|31. dezember|1. mai|lohnsteuer",
  references: [
    "§ 3b Abs. 1 EStG",
    "§ 3b Abs. 2 EStG",
    "§ 3b Abs. 3 EStG",
  ],
  importance: 5,
  body: `§ 3b EStG stellt Zuschläge für tatsächlich geleistete Sonntags-, Feiertags- oder Nachtarbeit unter bestimmten Voraussetzungen steuerfrei.

Voraussetzung ist insbesondere, dass der Zuschlag zusätzlich zum Grundlohn gezahlt wird und die gesetzlich festgelegten Prozentsätze nicht übersteigt. Eine bloße Pauschalzahlung ohne Bezug zu tatsächlich geleisteten begünstigten Arbeitsstunden genügt nicht.

1. Steuerfreie Höchstsätze

Steuerfrei bleiben Zuschläge bis zu folgenden Grenzen:

- Nachtarbeit: 25 Prozent des Grundlohns,
- Sonntagsarbeit: 50 Prozent des Grundlohns,
- Arbeit am 31. Dezember ab 14 Uhr sowie an gesetzlichen Feiertagen: 125 Prozent des Grundlohns,
- Arbeit am 24. Dezember ab 14 Uhr, am 25. und 26. Dezember sowie am 1. Mai: 150 Prozent des Grundlohns.

Soweit der tatsächlich gezahlte Zuschlag den jeweiligen Höchstsatz übersteigt, ist nur der übersteigende Teil steuerpflichtig.

2. Begriff des Grundlohns

Grundlohn ist der laufende Arbeitslohn, der dem Arbeitnehmer bei seiner regelmäßigen Arbeitszeit für den jeweiligen Lohnzahlungszeitraum zusteht.

Der Grundlohn ist für die Berechnung in einen Stundenlohn umzurechnen. Dabei darf höchstens ein Stundenlohn von 50 Euro angesetzt werden.

Beispiel:
Beträgt der tatsächliche Stundenlohn 60 Euro, wird der steuerfreie Zuschlag dennoch nur auf Grundlage von höchstens 50 Euro berechnet.

3. Begünstigte Arbeitszeiten

Nachtarbeit ist die Arbeit zwischen 20 Uhr und 6 Uhr.

Sonntags- und Feiertagsarbeit ist grundsätzlich die Arbeit zwischen 0 Uhr und 24 Uhr des jeweiligen Tages.

Welche Tage gesetzliche Feiertage sind, richtet sich nach den Vorschriften, die am Ort der Arbeitsstätte gelten.

4. Besonderheit bei Nachtarbeit nach Mitternacht

Wird die Nachtarbeit bereits vor 0 Uhr aufgenommen, gelten für die Zeit von 0 Uhr bis 4 Uhr besondere Regelungen:

- Der steuerfreie Zuschlagssatz für Nachtarbeit erhöht sich in diesem Zeitraum von 25 Prozent auf 40 Prozent.
- Die Arbeit von 0 Uhr bis 4 Uhr am Folgetag gilt weiterhin als Sonntags- oder Feiertagsarbeit, wenn sie unmittelbar an einen Sonntag oder gesetzlichen Feiertag anschließt.

Die Sonderregelung setzt voraus, dass die konkrete Nachtarbeit bereits vor Mitternacht begonnen hat.

5. Zusammentreffen mehrerer Zuschläge

Treffen Nachtarbeit und Sonntags- oder Feiertagsarbeit zeitlich zusammen, können die jeweiligen Zuschläge grundsätzlich nebeneinander begünstigt sein, sofern die Voraussetzungen jeweils erfüllt und die einzelnen Zuschläge nachvollziehbar ausgewiesen werden.

6. Prüfungsschema für die Praxis

1. Wurde die begünstigte Arbeit tatsächlich geleistet?
2. Wurde der Zuschlag zusätzlich zum Grundlohn gezahlt?
3. Liegt Nacht-, Sonntags- oder Feiertagsarbeit im gesetzlichen Zeitraum vor?
4. Wurde der Grundlohn korrekt auf einen Stundenlohn umgerechnet?
5. Wurde die Grenze von 50 Euro je Stunde beachtet?
6. Überschreitet der Zuschlag den zulässigen Prozentsatz?
7. Sind Arbeitszeit und Zuschlag durch geeignete Aufzeichnungen nachweisbar?

Merksatz:
Nicht die gesamte Vergütung für die Arbeitsstunde ist steuerfrei, sondern nur der zusätzlich zum Grundlohn gezahlte Zuschlag innerhalb der Grenzen des § 3b EStG.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf3bEstgZuschlaege.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf3bEstgZuschlaege);
}
