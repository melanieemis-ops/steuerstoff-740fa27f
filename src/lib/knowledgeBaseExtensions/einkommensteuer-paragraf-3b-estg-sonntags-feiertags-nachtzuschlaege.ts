import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf3bEstgZuschlaege: KBEntry = {
  id: "einkommensteuer-paragraf-3b-estg-sonntags-feiertags-nachtzuschlaege",
  title: "§ 3b EStG: Steuerfreie Zuschläge für Sonntags-, Feiertags- und Nachtarbeit",
  short:
    "§ 3b EStG regelt die Steuerfreiheit von Zuschlägen, die für tatsächlich geleistete Sonntags-, Feiertags- oder Nachtarbeit zusätzlich zum Grundlohn gezahlt werden.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 3b",
  paragraphNumber: 3,
  source:
    "Einkommensteuergesetz (EStG), § 3b – Steuerfreiheit von Zuschlägen für Sonntags-, Feiertags- oder Nachtarbeit.",
  keywords:
    "§ 3b estg|sonntagszuschlag|feiertagszuschlag|nachtzuschlag|sf-zuschlag|steuerfreie zuschläge|nachtarbeit|sonntagsarbeit|feiertagsarbeit|grundlohn|stundenlohn|24. dezember|25. dezember|26. dezember|31. dezember|1. mai|lohnsteuer",
  references: [
    "§ 3b Abs. 1 EStG",
    "§ 3b Abs. 2 EStG",
    "§ 3b Abs. 3 EStG",
  ],
  importance: 5,
  body: `§ 3b EStG stellt Zuschläge für tatsächlich geleistete Sonntags-, Feiertags- oder Nachtarbeit unter bestimmten Voraussetzungen steuerfrei.

Voraussetzung ist, dass der Zuschlag neben dem Grundlohn gezahlt wird. Steuerfrei ist nur der Zuschlag innerhalb der gesetzlich bestimmten Höchstgrenzen; der Grundlohn selbst bleibt steuerpflichtiger Arbeitslohn.

1. Steuerfreie Höchstsätze

Steuerfrei bleiben Zuschläge bis zu folgenden Grenzen:

- Nachtarbeit: 25 Prozent des Grundlohns,
- Sonntagsarbeit: 50 Prozent des Grundlohns,
- Arbeit am 31. Dezember ab 14 Uhr sowie an gesetzlichen Feiertagen: 125 Prozent des Grundlohns,
- Arbeit am 24. Dezember ab 14 Uhr, am 25. und 26. Dezember sowie am 1. Mai: 150 Prozent des Grundlohns.

Soweit der gezahlte Zuschlag den jeweiligen Höchstsatz übersteigt, ist der übersteigende Teil steuerpflichtig.

2. Begriff des Grundlohns

Grundlohn ist der laufende Arbeitslohn, der dem Arbeitnehmer bei der für ihn maßgebenden regelmäßigen Arbeitszeit für den jeweiligen Lohnzahlungszeitraum zusteht.

Der Grundlohn ist in einen Stundenlohn umzurechnen. Für die Berechnung des steuerfreien Zuschlags darf er höchstens mit 50 Euro je Stunde angesetzt werden.

Beispiel:
Beträgt der tatsächliche Stundenlohn 60 Euro, wird der steuerfreie Zuschlag dennoch nur auf Grundlage eines Stundenlohns von höchstens 50 Euro berechnet.

3. Begünstigte Arbeitszeiten

Nachtarbeit ist die Arbeit in der Zeit von 20 Uhr bis 6 Uhr.

Sonntags- und Feiertagsarbeit ist die Arbeit in der Zeit von 0 Uhr bis 24 Uhr des jeweiligen Tages.

Welche Tage gesetzliche Feiertage sind, richtet sich nach den Vorschriften, die am Ort der Arbeitsstätte gelten.

4. Nachtarbeit nach Mitternacht

Wird die Nachtarbeit bereits vor 0 Uhr aufgenommen, gelten für die Zeit von 0 Uhr bis 4 Uhr besondere Regeln:

- Der Zuschlagssatz für Nachtarbeit erhöht sich in diesem Zeitraum auf 40 Prozent.
- Als Sonntags- oder Feiertagsarbeit gilt auch die Arbeit von 0 Uhr bis 4 Uhr des auf den Sonntag oder Feiertag folgenden Tages.

Die Sonderregelung setzt voraus, dass die Nachtarbeit bereits vor Mitternacht aufgenommen wurde.

5. Prüfungsschema für die Praxis

1. Wurde die Sonntags-, Feiertags- oder Nachtarbeit tatsächlich geleistet?
2. Wird der Zuschlag zusätzlich zum Grundlohn gezahlt?
3. Liegt die Arbeit innerhalb der gesetzlich begünstigten Zeiträume?
4. Wurde der Grundlohn korrekt in einen Stundenlohn umgerechnet?
5. Wurde der Höchstbetrag von 50 Euro je Stunde beachtet?
6. Überschreitet der Zuschlag den zulässigen Prozentsatz?

Merksatz:
Nicht die gesamte Vergütung für die Arbeitsstunde ist steuerfrei, sondern nur der zusätzlich zum Grundlohn gezahlte Zuschlag innerhalb der Grenzen des § 3b EStG.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf3bEstgZuschlaege.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf3bEstgZuschlaege);
}
